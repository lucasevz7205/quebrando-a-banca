/* Vínculos editoriais verificados do mapa pessoal LP 4.1 (Coesão e Coerência).
 * Associação por ID/índice e caminho estável, sem aproximar palavras e sem
 * gravar dados na coleção privada do aluno. Fonte: leitura dos 67 enunciados
 * e 39 prompts dos cartões existentes no banco da Câmara em 09/11/2026.
 */
(function (root) {
 "use strict";
 const paths = [
  "0.1.1",
  "0.1.0",
  "0.1.2",
  "0.1.2",
  "0.2.0",
  "0.2.2",
  "0.0.2",
  "0.4",
  "0.4",
  "0.3.1",
  "0.3.1",
  "0.3.2",
  "1.0",
  "1.1",
  "3.0",
  "1.3",
  "1.1",
  "2.1",
  "6.1",
  "1.5",
  "3.3",
  "0.3.4",
  "6.1",
  "2.0",
  "6.2.0",
  "6.2.0",
  "6.2.1",
  "6.2.1",
  "6.2.2",
  "6.2.4",
  "6.2.4",
  "6.5",
  "7.4",
  "7.0",
  "7.1.0",
  "7.1",
  "7.8",
  "7.3",
  "7.3",
  "7.7",
  "7.5",
  "8.0.0",
  "8.0.1",
  "8.0.3",
  "8.1.1",
  "8.1.2",
  "8.1.4",
  "8.1.3",
  "7.0",
  "7.8",
  "7.4",
  "7",
  "7.4",
  "7.1.0",
  "7.4",
  "1.6.5",
  "1.6.2",
  "1.6.6",
  "1.6.4",
  "1.6.3",
  "1.3",
  "1.2",
  "3.0",
  "1.6.0",
  "1.6.1",
  "1.6.6",
  "1.6.0"
];
 const cardPaths = [
  "0.0",
  "0.1",
  "0.1.2",
  "0.2.0",
  "0.2.2",
  "0.4",
  "0.3.2",
  "1",
  "1.3",
  "1.1",
  "1.5",
  "2",
  "2.0",
  "2.3",
  "5.0",
  "3.2",
  "6.2",
  "6.2.0",
  "6.2.1",
  "6.2.2",
  "6.2.4",
  "6.1",
  "6.5",
  "7.1",
  "7.1.0",
  "7.3",
  "0.1.2",
  "7.0",
  "8",
  "8.0.0",
  "8.1.1",
  "8.1.4",
  "9.1",
  "9.1",
  "9.4",
  "9.5",
  "1.6.5",
  "1.3",
  "1.6.4"
];
 const audit={topicId:"lp-4-1",questions:paths.length,cards:cardPaths.length,method:"associação editorial pelo enunciado e pelo conceito"};
 function decorate(topicId, originalMap, originalCards=[], questions) {
   if(topicId!=="lp-4-1" || !originalMap?.ramos) return null;
   const map={...originalMap,ramos:JSON.parse(JSON.stringify(originalMap.ramos))};
   const byPath=new Map();
   function visit(node,path){
     byPath.set(path,node);
     (node.f||[]).forEach((child,i)=>visit(child,path+"."+i));
   }
   map.ramos.forEach((n,i)=>visit(n,String(i)));
   const linked=[],invalidPaths=[];
   paths.forEach((path,index)=>{
     const id="lp41-"+String(index+1).padStart(2,"0");
     const target=byPath.get(path);
     if(!target){invalidPaths.push({id,path});return;}
     if(!questions?.has(id))return;
     target.x={...(target.x||{}),questaoIds:[...new Set([...(target.x?.questaoIds||[]),id])]};
     linked.push(id);
   });
   const cards=originalCards.map((card,i)=>{
     const path=cardPaths[i];
     if(!path||!byPath.has(path)){invalidPaths.push({card:i,path});return card;}
     // A propriedade mapaPath torna a associação exata para QBMapLinks.resolve.
     return {...card,mapaPath:path};
   });
   return {map,cards,linked,invalidPaths,audit};
 }
 const api={decorate,audit,questionPaths:paths,cardPaths};
 root.QBEditorialCohesion=api;
 if(typeof module!=="undefined" && module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
