/* A origem conceitual só é "confirmada" quando um identificador ou caminho
 * explícito do nó existe no mapa. Sem isso, buscas lexicais são sugestões.
 */
const tokens=text=>new Set(String(text||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/[^a-z0-9]+/).filter(w=>w.length>=5));
export function resolveMapOrigin(map,card) {
  if(!map || !Array.isArray(map.ramos) || !map.ramos.length)return {status:"unavailable",path:null};
  const nodes=[];
  const walk=(n,path)=>{
    if(!n||typeof n!=="object")return;
    nodes.push({node:n,path});
    (n.f||[]).forEach((c,i)=>walk(c,path+"."+i));
  };
  map.ramos.forEach((n,i)=>walk(n,String(i)));
  const explicitId=String(card?.mapaNoId??card?.mapNodeId??card?.mapaNodeId??"").trim();
  const explicitPath=String(card?.mapaPath??card?.mapNodePath??"").trim();
  if(explicitId){
    const matching=nodes.filter(({node})=>String(node.id||"")===explicitId);
    if(matching.length===1)return {status:"exact",path:matching[0].path,nodeId:explicitId,title:String(matching[0].node.t||"")};
  }
  if(explicitPath){
    const found=nodes.find(item=>item.path===explicitPath);
    if(found && (!explicitId || String(found.node.id||"")===explicitId))
      return {status:"exact",path:found.path,nodeId:found.node.id||null,title:String(found.node.t||"")};
  }
  const target=tokens([card?.tema,card?.q,...(card?.a||[])].join(" "));
  let best=null, runnerUp=-1;
  for(const item of nodes){
    const text=tokens([item.node.t,item.node.n,item.node.x?.e,item.node.x?.ex].join(" "));
    let count=0;
    for(const token of target)if(text.has(token))count++;
    if(!best||count>best.score){runnerUp=best?.score??-1;best={...item,score:count};}
    else if(count>runnerUp)runnerUp=count;
  }
  if(best&&best.score>=3&&best.score>runnerUp)
    return {status:"suggested",path:best.path,nodeId:best.node.id||null,title:String(best.node.t||"")};
  return {status:"topic",path:null,nodeId:null,title:String(map.centro||"")};
}
export function assertCardResponse(response) {
  const text=String(response??"").trim();
  if(text.length<1||text.length>2000)throw new Error("A resposta precisa ter entre 1 e 2000 caracteres.");
  return text;
}
export function normalizeFlashcardAi(raw){
  let x=raw;
  if(typeof x==="string"){
    let value=x.trim();
    if(value.startsWith("```"))value=value.replace(/^```(?:json)?\s*|\s*```$/g,"");
    try{x=JSON.parse(value)}catch{throw new Error("O modelo não retornou JSON válido. Use a correção manual.");}
  }
  if(!x||typeof x!=="object"||!["lembrei","parcial","nao"].includes(x.veredito))
    throw new Error("Resposta da IA sem classificação válida. Use a correção manual.");
  const list=y=>Array.isArray(y)?y.slice(0,12).map(v=>String(v||"").slice(0,350)):[];
  return {veredito:x.veredito,acertou:list(x.acertou),faltou:list(x.faltou),errado:list(x.errado),comentario:String(x.comentario||"").slice(0,800)};
}
