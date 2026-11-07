export const fields = ["gabarito","mecanismo","justificativa","vacina","materia","topico"];
export const knownPending = ["analise/CD26-NS-CG/34","analise/CD26-NS-CG/40"];
export const valid = q => !q.anulado && !q.duplicataProva;
export function project(originals, decisions) {
 const map = new Map(originals.map(q=>[q.id,{...q,original:q,pending:knownPending.includes(q.id)?["mecanismo","justificativa","vacina"]:[],conflicts:[]}]));
 const seen=new Set();
 for(const d of [...decisions].sort((a,b)=>(a.created_date||"").localeCompare(b.created_date||"")||(a.id||"").localeCompare(b.id||""))){
  if(d.outcome!=="aprovada"||seen.has(d.proposal_id))continue;
  seen.add(d.proposal_id); const q=map.get(d.question_id);if(!q||!fields.includes(d.field))continue;
  if(String(q[d.field]??"")!==d.before){q.conflicts.push(d);continue;}
  q[d.field]=d.after;q.pending=q.pending.filter(f=>f!==d.field);
 }
 return [...map.values()];
}
export function ranking(questions, mode="historico", materia="") {
 const qs=questions.filter(q=>valid(q)&&(!materia||q.materia===materia)); const counts={};let pending=0,missing=0;
 for(const q of qs){if(mode!=="historico"&&q.pending?.includes("mecanismo")){pending++;continue;}if(!q.mecanismo){missing++;continue;}counts[q.mecanismo]=(counts[q.mecanismo]||0)+1;}
 return {total:qs.length,pending,missing,rows:Object.entries(counts).map(([m,n])=>({m,n,pct:qs.length?100*n/qs.length:0})).sort((a,b)=>b.n-a.n||a.m.localeCompare(b.m))};
}
export function validateProposal(p, question) {
 if(!question)throw new Error("Item não encontrado.");
 if(!fields.includes(p.field))throw new Error("Campo não permitido.");
 if(String(question[p.field]??"")!==p.before)throw new Error("O valor atual mudou. Atualize a consulta e revise a proposta.");
 for(const f of ["after","source","evidence","responsible"])if(!p[f]?.trim())throw new Error("Preencha valor, fonte, evidência e responsável.");
 if(p.field==="gabarito"&&!["C","E"].includes(p.after))throw new Error("Gabarito deve ser C ou E.");
 if(p.field==="mecanismo"&&!/^(F([1-9]|10)|V[1-4])$/.test(p.after))throw new Error("Mecanismo deve ser F1–F10 ou V1–V4.");
}
export function planImport(incoming, existing) {
 if(!Array.isArray(incoming)||incoming.length>2000)throw new Error("Use um array JSON de até 2.000 itens.");
 const seen=new Set(), map=new Map(existing.map(q=>[q.id,q]));let skipped=0; const fresh=[], conflicts=[];
 for(const q of incoming){if(!q||typeof q.id!=="string"||!q.id.trim()||typeof q.documento!=="string")throw new Error("Todo item exige id e documento.");
 if(seen.has(q.id))throw new Error("ID repetido no arquivo: "+q.id);seen.add(q.id);
 if(q.anulado!==undefined&&typeof q.anulado!=="boolean")throw new Error("anulado deve ser booleano.");
 if(q.duplicataProva!==undefined&&typeof q.duplicataProva!=="boolean")throw new Error("duplicataProva deve ser booleano.");
 const prior=map.get(q.id);if(!prior)fresh.push(q);else if(canonical(prior)===canonical(q))skipped++;else conflicts.push(q.id);
 }
 return {fresh,skipped,conflicts};
}
export function canonical(x){if(Array.isArray(x))return "["+x.map(canonical).join(",")+"]";if(x&&typeof x==="object")return "{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+canonical(x[k])).join(",")+"}";return JSON.stringify(x);}
