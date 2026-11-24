// Original QBAsc adapters: external authoring artifacts are untrusted candidates.
// Nothing here installs or invokes an external skill or writes to user storage.
const text = (v, max=2000) => typeof v==='string' && v.trim().length>0 && v.length<=max;
const check = (v,m) => {if(!v) throw new Error(m);};
const unique = (rows,field) => {
  const map=new Map();
  for(const r of rows) {check(text(r?.[field],400)&&!map.has(r[field]),'Invalid or duplicate '+field);map.set(r[field],r);}
  return map;
};
const bounded = (a,max) => Array.isArray(a)&&a.length<=max;

// upstream surmise pair A prerequisite, B target means B depends_on A.
// An approved NEXO edge is never produced here, regardless of upstream confidence.
export function importKstCandidates({artifact, artifactVersion, concepts, bindings}) {
  check(text(artifactVersion,200)&&bounded(artifact?.items,5000)&&bounded(artifact?.surmise_relations,10000)&&
    bounded(concepts,10000)&&bounded(bindings,5000),'Invalid KST input');
  const items=unique(artifact.items,'id'),known=unique(concepts,'id'),mapped=unique(bindings,'externalId');
  const accepted=[],rejected=[],seen=new Set();
  function resolve(id) {
    const item=items.get(id), binding=mapped.get(id), concept=known.get(binding?.conceptId);
    if(!item||!concept||!text(concept.source?.sourceId,400)||!text(concept.source?.version,200)||
      !text(concept.source?.locator,400)||item.label!==concept.label||
      binding.sourceVersion!==concept.source.version) return null;
    return concept;
  }
  for(const [i,r] of artifact.surmise_relations.entries()) {
    const from=resolve(r?.target),to=resolve(r?.prerequisite);
    if(!from||!to||from.id===to.id||!text(r?.rationale)||r.source==='transitive-closure') {
      rejected.push({index:i,reason:'unmapped-unsubstantiated-or-derived'});continue;
    }
    const pair=JSON.stringify([from.id,to.id]);
    if(seen.has(pair)){rejected.push({index:i,reason:'duplicate-pair'});continue;}
    seen.add(pair);
    accepted.push({id:JSON.stringify([artifactVersion,i]),from:from.id,to:to.id,type:'depends_on',
      proposition:r.rationale,status:'candidate',provenance:{artifactVersion,locator:'surmise_relations/'+i,
        upstreamConfidence:Number.isFinite(r.confidence)?r.confidence:null,source:r.source??null},
      sourceCandidates:[from.source,to.source]});
  }
  return {candidates:accepted,rejected,approvedEdges:[]};
}

// Strict prerequisite-cycle check; general semantic contrasts may legitimately cycle.
// Call only with a curator-approved graph in a trusted server context.
export function checkPrerequisiteCycles(graph) {
  check(bounded(graph?.nodes,10000)&&bounded(graph?.edges,50000),'Invalid graph bounds');
  const nodes=unique(graph.nodes,'id'),remaining=new Map(),children=new Map();
  for(const id of nodes.keys()){remaining.set(id,0);children.set(id,[]);}
  for(const e of graph.edges) if(e.status==='approved'&&e.type==='depends_on') {
    check(nodes.has(e.from)&&nodes.has(e.to)&&e.from!==e.to,'Invalid prerequisite');
    remaining.set(e.from,remaining.get(e.from)+1);children.get(e.to).push(e.from);
  }
  const queue=[...remaining].filter(([,n])=>n===0).map(([id])=>id);
  for(let i=0;i<queue.length;i++) for(const c of children.get(queue[i])) {
    remaining.set(c,remaining.get(c)-1);if(remaining.get(c)===0)queue.push(c);
  }
  return {acyclic:queue.length===nodes.size,blocked:[...remaining].filter(([,n])=>n>0).map(([id])=>id).sort()};
}

const visualKinds=new Set(['anatomy','timeline','chart','comparison','association']);
const visualKeys=new Set(['id','kind','graphVersion','conceptIds','claimRefs','modelId','modelVersion','analogy','analogyLimits','altText']);
const exactKeys=(value,allowed)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>allowed.has(k));

// Validates a reference-only visual request. The renderer registry and reviewed
// claim list must be supplied by trusted server code, never by an AI/client.
// No markup, shaders, URL, JS, arbitrary CSS, or executable code accepted.
export function prepareVisualRequest(request,{graph,claims,registry}) {
  check(exactKeys(request,visualKeys)&&text(request.id,200)&&visualKinds.has(request.kind)&&
    request.graphVersion===graph?.version&&text(request.modelId,200)&&text(request.modelVersion,200)&&
    text(request.altText,1000)&&bounded(request.conceptIds,20)&&request.conceptIds.length&&
    bounded(request.claimRefs,40)&&request.claimRefs.length,'Invalid visual request');
  check(bounded(graph.nodes,10000)&&bounded(claims,10000)&&bounded(registry,1000),'Invalid trusted registry');
  check(typeof request.analogy==='boolean','Missing representation mode');
  if(request.analogy)check(text(request.analogyLimits,1000),'Analogy requires limits');
  else check(request.analogyLimits===undefined,'Unexpected analogy limits');
  const nodes=unique(graph.nodes,'id'),byClaim=unique(claims,'id'),models=unique(registry,'id');
  const model=models.get(request.modelId);
  check(model?.version===request.modelVersion&&model.kind===request.kind&&model.reviewed===true&&
    model.graphVersion===graph.version&&model.analogy===request.analogy&&model.altText===request.altText&&
    model.analogyLimits===request.analogyLimits&&Array.isArray(model.claimRefs)&&Array.isArray(model.conceptIds)&&
    JSON.stringify(model.claimRefs)===JSON.stringify(request.claimRefs)&&JSON.stringify(model.conceptIds)===JSON.stringify(request.conceptIds),
    'Unreviewed or mismatched visual model');
  const ids=new Set(request.conceptIds);
  check(ids.size===request.conceptIds.length&&[...ids].every(id=>nodes.has(id)),'Unknown or duplicate visual concept');
  check(new Set(request.claimRefs).size===request.claimRefs.length,'Duplicate claim');
  const selected=request.claimRefs.map(id=>{
    const c=byClaim.get(id);
    check(c?.status==='approved'&&c.graphVersion===graph.version&&ids.has(c.conceptId)&&
      text(c.text)&&text(c.sourceRef,500),'Unverified visual claim');
    return {id:c.id,conceptId:c.conceptId,text:c.text,sourceRef:c.sourceRef};
  });
  check([...ids].every(id=>selected.some(c=>c.conceptId===id)),'Concept without reviewed claim');
  return {id:request.id,kind:model.kind,modelId:model.id,modelVersion:model.version,graphVersion:graph.version,
    conceptIds:[...ids],claims:selected,analogy:request.analogy,analogyLimits:request.analogyLimits??null,
    altText:request.altText,renderPolicy:{reducedMotion:true,keyboard:true,staticFallback:true},status:'ready-for-reviewed-renderer'};
}
