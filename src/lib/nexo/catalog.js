// Source-preserving candidate extractor. Never approves or invents a semantic relation.
const nonempty = x => typeof x === 'string' && x.trim().length > 0;
const key = (...parts) => JSON.stringify(parts);
const requireValue = (x,m) => {if(!x) throw new Error(m);};
const origin = (sourceId,version,locator) => ({sourceId,version,locator});

export function extractMapCandidates({sourceId,version,mapId,map}) {
  requireValue([sourceId,version,mapId].every(nonempty)&&Array.isArray(map?.ramos),'Invalid source map');
  const nodes=[], structuralLinks=[], unresolved=[], counts=new Map(), seen=new Set();
  function walk(n,path,parent) {
    requireValue(n && typeof n==='object' && !seen.has(n),'Invalid or cyclic source map');
    seen.add(n);
    requireValue(nodes.length<10000 && path.split('.').length<=64,'Map bounds exceeded');
    if(nonempty(n.id)) counts.set(n.id,(counts.get(n.id)||0)+1);
    nodes.push({n,path,parent});
    if(n.f!==undefined) requireValue(Array.isArray(n.f),'Invalid children');
    (n.f||[]).forEach((child,i)=>walk(child,path+'.'+i,path));
  }
  map.ramos.forEach((n,i)=>walk(n,String(i),null));
  const byPath=new Map(), byId=new Map(), concepts=[];
  for(const {n,path} of nodes) {
    if(!nonempty(n.id)||counts.get(n.id)!==1||!nonempty(n.t)) {
      unresolved.push({locator:path,reason:'missing-or-ambiguous-stable-node'});continue;
    }
    const c={id:key(mapId,n.id),label:n.t,status:'candidate',source:origin(sourceId,version,'ramos/'+path),mapId,mapNodeId:n.id};
    if(nonempty(n.n)) c.note=n.n;
    if(nonempty(n.x?.e)) c.explanation=n.x.e;
    concepts.push(c);byPath.set(path,c);byId.set(n.id,c);
  }
  for(const {path,parent} of nodes) if(parent!==null&&byPath.has(path)&&byPath.has(parent)) {
    structuralLinks.push({from:byPath.get(parent).id,to:byPath.get(path).id,kind:'tree-placement',status:'candidate',source:origin(sourceId,version,'ramos/'+path)});
  }
  if(map.ligacoes!==undefined) requireValue(Array.isArray(map.ligacoes),'Invalid crosslinks');
  for(const [i,link] of (map.ligacoes||[]).entries()) {
    if(!Array.isArray(link)||!byId.has(link[0])||!byId.has(link[1])||link[0]===link[1]||!nonempty(link[2])) {
      unresolved.push({locator:'ligacoes/'+i,reason:'unresolved-crosslink'});continue;
    }
    structuralLinks.push({from:byId.get(link[0]).id,to:byId.get(link[1]).id,kind:'existing-crosslink',label:link[2],status:'candidate',source:origin(sourceId,version,'ligacoes/'+i)});
  }
  // Tree placement is not equivalent to a semantic is_a / prerequisite relation.
  return {concepts,structuralLinks,unresolved,approvedEdges:[]};
}

export function extractEditorialActivities({sourceId,version,rows}) {
  requireValue(nonempty(sourceId)&&nonempty(version)&&Array.isArray(rows),'Invalid editorial source');
  const candidates=[], excluded=[], seen=new Set();
  for(const [i,r] of rows.entries()) {
    if(!nonempty(r?.id)||seen.has(r.id)) throw new Error('Missing or duplicate editorial ID');
    seen.add(r.id);
    if(r.reviewed!==true||r.reserved!==false||r.active!==true||!nonempty(r.concept)||!nonempty(r.version)||
      !nonempty(r.prompt)||!nonempty(r.explanation)||!nonempty(r.reference)||
      !Array.isArray(r.sourceItems)||!r.sourceItems.length||!r.sourceItems.every(nonempty)) {
      excluded.push({id:r.id,reason:'unreviewed-or-incomplete'});continue;
    }
    candidates.push({id:r.id,concept:r.concept,type:r.type,title:r.title,prompt:r.prompt,explanation:r.explanation,
      reference:r.reference,material:r.material,sourceItems:[...r.sourceItems],originalVersion:r.version,
      status:'candidate',source:origin(sourceId,version,String(i))});
  }
  return {candidates,excluded,approvedEdges:[]};
}
export function extractQuestionCandidates({sourceId,version,rows}) {
  requireValue(nonempty(sourceId)&&nonempty(version)&&Array.isArray(rows),'Invalid question source');
  const candidates=[],excluded=[],seen=new Set();
  for(const [i,r] of rows.entries()) {
    if(!nonempty(r?.id)||seen.has(r.id)) throw new Error('Missing or duplicate question ID');
    seen.add(r.id);
    if(!nonempty(r.topico)||!nonempty(r.mapaNoId)||!nonempty(r.ref)||!nonempty(r.textoFonte)||!nonempty(r.enunciado)) {
      excluded.push({id:r.id,reason:'missing-explicit-origin-or-text'});continue;
    }
    candidates.push({id:r.id,topicId:r.topico,mapNodeId:r.mapaNoId,concept:r.conceito??null,
      reference:r.ref,excerpt:r.textoFonte,originalEditorialStatus:r.statusEditorial??null,
      status:'candidate',source:origin(sourceId,version,String(i))});
  }
  return {candidates,excluded,approvedEdges:[]};
}
