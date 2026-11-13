/* Editorias do mapa, versão global.
 * Liga apenas evidências explícitas e correspondências textuais inequívocas:
 * não confunde pertencer ao mesmo capítulo com pertencer ao mesmo subramo.
 * Sem leitura de outros usuários, sem alterações no banco.
 */
(function(root) {
"use strict";
const normalize = value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\b(?:artigos?|arts?|incisos?|paragrafos?|leis?|decretos?)\s*(?:n[ºo°]\s*)?\d+[\wº°\/.-]*/gi," ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const tokens = value => normalize(value).split(" ").filter(w=>w.length>=3 && !["para","pela","pelo","como","mais","menos","entre","sobre","segundo","quando","onde","qual","quais","sao","ser","uma","das","dos","com","sem","por","que","seus","suas","este","esta","esse","essa","todos","todas","uma","uns","nas","nos","depois","antes","exemplo","afirmacao","assertiva","texto","apoio","responsavel","conceito","definicao","regras","principais"].includes(w));
const phrase=(text,p)=>{
 const s=" "+normalize(text)+" ",x=" "+normalize(p)+" ";
 return x.trim().length>3&&s.includes(x);
};
const pathCompare=(a,b)=>a.split(".").length-b.split(".").length;
function selectNode(nodes,label,sourceText="",allowContext=false,topicTitle=""){
 const raw=normalize(label);if(raw.length<4)return null;
 const isEntireTopic=raw===normalize(topicTitle)||raw===normalize(topicTitle).replace(/^.*?\b\d+\s+/,"");
 const plain=raw.replace(/\b(?:art|inciso|artigo|lei|decreto)\s*\d+.*$/,"").trim();
 const exact=nodes.filter(n=>n.norm===raw||n.plain===raw||(n.norm===plain&&plain.length>=6));
 if(exact.length===1)return {path:exact[0].path,via:"rotulo-exato"};
 if(exact.length>1)return null;
 // A expressão deve coincidir integralmente em fronteiras de palavras.
 const nameHits=nodes.filter(n=>!isEntireTopic&&phrase(n.norm,raw) && n.norm!==raw && raw.length>=7 && (tokens(raw).length>=2||phrase(sourceText,n.norm)||n.norm.length<=raw.length+12));
 if(nameHits.length===1)return {path:nameHits[0].path,via:"titulo-contem-tema"};
 if(nameHits.length>1) {
   const contextual=nameHits.filter(n=>phrase(sourceText,n.norm)&&n.norm.length>=12);
   if(contextual.length===1)return {path:contextual[0].path,via:"titulo-e-enunciado"};
 }
 // Tema mais específico que o nó, aceito somente quando o nó forma uma expressão
 // com dois ou mais termos e não há outro candidato que cubra o tema.
 const partHits=nodes.filter(n=>!isEntireTopic&&n.norm.length>=10&&tokens(n.norm).length>=2&&phrase(raw,n.norm)&&phrase(sourceText,n.norm));
 if(partHits.length===1)return {path:partHits[0].path,via:"tema-contem-titulo"};
 if(allowContext) {
   // Uma menção inequívoca ao nome de um conceito no enunciado é evidência
   // útil quando o campo tema é demasiado genérico.
   const textHits=nodes.filter(n=>(tokens(n.norm).length>=2&&n.norm.length>=11||n.norm.length>=9)
      &&phrase(sourceText,n.norm));
   if(textHits.length===1)return {path:textHits[0].path,via:"citacao-exata-do-conceito"};
   if(textHits.length>1){
     // Escolher o termo mais específico somente se ele for descendente
     // dos demais candidatos, sem criar associação entre ramos paralelos.
     textHits.sort((a,b)=>pathCompare(b.path,a.path));
     const top=textHits[0];
     if(textHits.every(n=>n.path===top.path||top.path.startsWith(n.path+".")))
       return {path:top.path,via:"citacao-exata-especifica"};
   }
 }
 return null;
}
function decorate(topicId,originalMap,originalCards=[],questions,topic){
 if(!originalMap?.ramos?.length)return null;
 const map={...originalMap,ramos:JSON.parse(JSON.stringify(originalMap.ramos))};
 const nodes=[],byPath=new Map(),ids=new Map();
 function walk(n,path){
   const entry={path,node:n,norm:normalize(n.t),plain:normalize(n.t).replace(/\b(?:art|inciso|artigo|lei|decreto)\s*\d+.*$/,"").trim()};
   nodes.push(entry);byPath.set(path,entry);
   if(n.id){if(!ids.has(n.id))ids.set(n.id,[]);ids.get(n.id).push(entry);}
   (n.f||[]).forEach((ch,i)=>walk(ch,path+"."+i));
 }
 map.ramos.forEach((n,i)=>walk(n,String(i)));
 const sourceQs=questions&&typeof questions.values==="function"?[...questions.values()]:[];
 const relevant=sourceQs.filter(q=>q?.id && (q.topico===topicId || q.topico===topic?.id || (topic?.caps||[]).includes(q.cap)));
 const qLinks=[],qUnmatched=[],cardLinks=[],cardUnmatched=[];
 const prelinked=new Set(nodes.flatMap(x=>x.node.x?.questaoIds||[]));
 for(const q of relevant){
   if(prelinked.has(q.id)){qLinks.push({id:q.id,path:nodes.find(n=>n.node.x?.questaoIds?.includes(q.id))?.path,via:"id-editorial-existente"});continue;}
   const nodeId=q.mapaNoId||q.mapNodeId;
   const exactId=nodeId&&ids.get(nodeId)?.length===1?ids.get(nodeId)[0]:null;
   const exactPath=q.mapaPath&&byPath.get(q.mapaPath);
   const resolved=exactId?{path:exactId.path,via:"id-no"}:exactPath?{path:exactPath.path,via:"caminho-no"}:
    selectNode(nodes,q.tema,q.enunciado,true,topic?.titulo);
   if(!resolved){qUnmatched.push(q.id);continue;}
   const target=byPath.get(resolved.path)?.node;
   if(!target){qUnmatched.push(q.id);continue;}
   target.x={...(target.x||{}),questaoIds:[...new Set([...(target.x?.questaoIds||[]),q.id])]};
   qLinks.push({id:q.id,path:resolved.path,via:resolved.via});
 }
 const cards=originalCards.map((c,index)=>{
   const exactId=c?.mapaNoId&&ids.get(c.mapaNoId)?.length===1?ids.get(c.mapaNoId)[0]:null;
   const exactPath=c?.mapaPath&&byPath.get(c.mapaPath);
   const resolved=exactId?{path:exactId.path,via:"id-no"}:exactPath?{path:exactPath.path,via:"caminho-no"}:
       selectNode(nodes,c.tema,c.q,true,topic?.titulo);
   if(!resolved){cardUnmatched.push(index);return c;}
   cardLinks.push({index,path:resolved.path,via:resolved.via});
   return {...c,mapaPath:resolved.path};
 });
 return {map,cards,linked:qLinks.length,questionLinks:qLinks,unmatchedQuestions:qUnmatched,
    cardLinks,unmatchedCards:cardUnmatched,nodeCount:nodes.length};
}
const api={decorate,normalize};
root.QBEditorialCoverage=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
