// Offline/server-only editorial gate. All authority inputs MUST come from trusted
// server-controlled storage in a later integration. No endpoints, writes, or
// authority assignment here. Matching excerpts do not prove semantic entailment.
import { createHash } from 'node:crypto';
import { validateGraph } from './core.js';
import { checkPrerequisiteCycles } from './skill-adapters.js';

const kinds = new Set(['is_a','part_of','contrasts_with','exception_to','depends_on','causes','precedes','exemplifies','equivalent_to']);
const valid = (s,max=400) => typeof s==='string' && s.trim().length>0 && s.length<=max;
const bounded = (a,max) => Array.isArray(a) && a.length<=max;
const assert = (v,m) => {if(!v) throw new Error(m);};
const sha = s => createHash('sha256').update(s,'utf8').digest('hex');
export const sourceDigest = text => 'sha256:'+sha(text);
const fingerprint = value => 'sha256:'+sha(JSON.stringify(value));
const index = (rows,field) => {
  const map=new Map();
  for(const r of rows){assert(valid(r?.[field])&&!map.has(r[field]),'Invalid or duplicate '+field);map.set(r[field],r);}
  return map;
};
const allowedKeys=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));

function sourceIndex(sources,scope){
  assert(bounded(sources,5000),'Invalid source registry');
  const result=index(sources,'id');
  for(const s of sources){
    assert(s.scope===scope&&s.verified===true&&valid(s.revision)&&typeof s.text==='string'&&
      s.text.length>0&&s.text.length<=2000000&&s.digest===sourceDigest(s.text),'Unverified, stale or foreign source');
  }
  return result;
}
function evidencePacket(refs,sources){
  assert(bounded(refs,20)&&refs.length>0,'Missing evidence');
  const seen=new Set(), result=[];
  for(const ref of refs){
    assert(allowedKeys(ref,['sourceId','revision','digest','locator','start','end','excerpt']),'Invalid evidence fields');
    const s=sources.get(ref.sourceId);
    assert(s&&ref.revision===s.revision&&ref.digest===s.digest&&valid(ref.locator,500),'Missing or stale source revision');
    assert(Number.isSafeInteger(ref.start)&&Number.isSafeInteger(ref.end)&&ref.start>=0&&ref.end>ref.start&&
      ref.end<=s.text.length&&valid(ref.excerpt,8000)&&s.text.slice(ref.start,ref.end)===ref.excerpt,'Excerpt mismatch');
    const k=JSON.stringify([s.id,ref.start,ref.end]);
    assert(!seen.has(k),'Duplicate evidence');
    seen.add(k);
    result.push({sourceId:s.id,revision:s.revision,digest:s.digest,locator:ref.locator,start:ref.start,end:ref.end,excerpt:ref.excerpt});
  }
  return result;
}
function nodePacket(n,sources,scope,version){
  assert(allowedKeys(n,['id','label','proposition','status','evidence'])&&n.status==='candidate'&&valid(n.id)&&
    valid(n.label,500)&&valid(n.proposition,4000),'Invalid node candidate');
  return {scope,version,kind:'concept',id:n.id,label:n.label,proposition:n.proposition,evidence:evidencePacket(n.evidence,sources)};
}
function edgePacket(e,sources,nodes,scope,version){
  assert(allowedKeys(e,['id','from','to','type','proposition','status','evidence','weight'])&&e.status==='candidate'&&
    valid(e.id)&&nodes.has(e.from)&&nodes.has(e.to)&&e.from!==e.to&&kinds.has(e.type)&&
    valid(e.proposition,4000)&&Number.isFinite(e.weight)&&e.weight>=0&&e.weight<=1,'Invalid relation candidate');
  return {scope,version,kind:'relation',id:e.id,from:e.from,to:e.to,type:e.type,proposition:e.proposition,weight:e.weight,
    endpointDigests:[fingerprint(nodes.get(e.from)),fingerprint(nodes.get(e.to))],evidence:evidencePacket(e.evidence,sources)};
}

// A packet is a review request, NOT an approval. Exact content, graph scope,
// evidence snapshots, endpoint claims and engineering weight are bound together.
export function prepareEditorialReview({scope,version,sources,concepts,relations}){
  assert(valid(scope)&&valid(version)&&bounded(concepts,10000)&&bounded(relations,50000),'Invalid review batch');
  const registry=sourceIndex(sources,scope);
  index(concepts,'id');index(relations,'id');
  const nodes=new Map(concepts.map(n=>[n.id,nodePacket(n,registry,scope,version)]));
  const packets=[...nodes.values(),...relations.map(e=>edgePacket(e,registry,nodes,scope,version))];
  return packets.map(packet=>({packet,digest:fingerprint(packet)}));
}

function reviewIndex(reviews,reviewers,scope){
  assert(bounded(reviews,60000)&&bounded(reviewers,1000),'Invalid trusted review registry');
  const people=index(reviewers,'id'), byKey=new Map();
  for(const r of reviews){
    assert(r.scope===scope&&valid(r.digest)&&valid(r.reviewerId)&&
      ['approved','rejected','revoked'].includes(r.decision)&&valid(r.rationale,4000),'Invalid review decision');
    const person=people.get(r.reviewerId);
    assert(person?.active===true&&person.scope===scope&&person.role==='curator','Unauthorized reviewer');
    // The trusted store must supply only the current decision for a digest.
    assert(!byKey.has(r.digest),'Conflicting current review decisions');
    byKey.set(r.digest,r);
  }
  return byKey;
}
const refOf=e=>JSON.stringify([e.sourceId,e.revision,e.digest,e.locator,e.start,e.end]);
export function compileEditorialGraph(batch,{reviews,reviewers}){
  const packets=prepareEditorialReview(batch);
  const decisions=reviewIndex(reviews,reviewers,batch.scope);
  const approved=new Map(), pending=[], nodes=[], edges=[];
  for(const item of packets){
    const {packet:p,digest}=item;
    const review=decisions.get(digest);
    if(review?.decision!=='approved'){pending.push({kind:p.kind,id:p.id,digest,reason:review?.decision??'unreviewed'});continue;}
    if(p.kind==='concept'){
      approved.set(p.id,p);
      nodes.push({id:p.id,label:p.label,sourceRefs:p.evidence.map(refOf)});
    } else {
      if(!approved.has(p.from)||!approved.has(p.to)){
        pending.push({kind:p.kind,id:p.id,digest,reason:'endpoint-not-approved'});continue;
      }
      edges.push({id:p.id,from:p.from,to:p.to,type:p.type,proposition:p.proposition,weight:p.weight,
        status:'approved',sourceRefs:p.evidence.map(refOf)});
    }
  }
  // Prevent duplicate directions for prerequisite relations and duplicate
  // unordered contrast/equivalence pairs. No transitive edges are generated.
  const pairs=new Set();
  for(const e of edges){
    const ends=['contrasts_with','equivalent_to'].includes(e.type)?[e.from,e.to].sort():[e.from,e.to];
    const k=JSON.stringify([e.type,...ends]);assert(!pairs.has(k),'Duplicate approved relation');pairs.add(k);
  }
  const graph={version:batch.version,nodes,edges};
  validateGraph(graph);
  assert(checkPrerequisiteCycles(graph).acyclic,'Approved prerequisite cycle');
  // Bind the release identity to the actual approved content, not just a human label.
  const releaseDigest=fingerprint({scope:batch.scope,version:batch.version,approved:packets.filter(x=>
    (x.packet.kind==='concept'?nodes:edges).some(y=>y.id===x.packet.id)).map(x=>x.digest).sort()});
  return {status:'offline-reviewed-release',scope:batch.scope,graph:{...graph,version:releaseDigest},labelVersion:batch.version,
    releaseDigest,pending,reviewedCount:nodes.length+edges.length};
}
