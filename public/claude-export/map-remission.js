/* Navigation from a question / flashcard to the exact conceptual MAP NODE.
 * Keeps explicit editorial links above conservative auto-links; never invents
 * a node when a chapter is the only verifiable association.
 * All lookups are scoped to the current user's loaded Maps/Questions.
 */
(function(root){
"use strict";
const text=value=>String(value??"").trim();
const unique=list=>[...new Set(list.filter(Boolean))];
const hasMap=(revisions,id)=>!!revisions?.get(id)?.mapa?.ramos?.length;
const depth=path=>text(path).split(".").length;
function findPath(map,path){
 if(!map?.ramos || !/^(?:\d+)(?:\.\d+)*$/.test(text(path)))return null;
 const parts=path.split(".").map(Number),node=parts.slice(1).reduce((parent,i)=>parent?.f?.[i],map.ramos[parts[0]]);
 return node?{path,title:text(node.t),nodeId:text(node.id)}:null;
}
function labelFor(via){
 if(["id-no","caminho-no","id-editorial-existente"].includes(via))return "editorial";
 if(via==="flashcard-exato")return "editorial";
 if(via==="flashcard-sugerido")return "sugerido";
 return "associacao";
}
function resolveQuestion({questionId,preferredTopicId=null,questions,index,revisions,topics,decorate}){
 const id=text(questionId);
 const question=questions?.get(id);
 if(!id||!question)return {status:"unavailable",topicId:null,path:null,questionId:id};
 const info=index?.byQuestion?.get(id);
 const candidates=unique([
   preferredTopicId,question.topico,
   ...(info?.matchedIds||[]),info?.topicId,
   ...[...(revisions?.entries?.()||[])].filter(([topic,rev])=>Array.isArray(rev?.questaoIds)&&rev.questaoIds.includes(id)).map(([topic])=>topic)
 ]).filter(topicId=>hasMap(revisions,topicId));
 const ranked=[];
 function evaluate(topicId,rank){
   const rev=revisions.get(topicId),topic=topics?.get(topicId);
   const decorated=decorate(topicId,rev,topic);
   const link=decorated?.questionLinks?.find(l=>l.id===id&&findPath(decorated.map,l.path));
   if(!link)return;
   const node=findPath(decorated.map,link.path);
   if(!node)return;
   const quality=labelFor(link.via);
   const explicit=quality==="editorial";
   const own=question.topico===topicId;
   const score=(explicit?1000:500)+(own?180:0)+(topicId===preferredTopicId?110:0)
     +(info?.topicId===topicId?30:0)+depth(node.path)*2-rank;
   ranked.push({status:"linked",topicId,path:node.path,title:node.title,nodeId:node.nodeId,
     questionId:id,via:link.via,confidence:quality,score});
 }
 candidates.forEach(evaluate);
 if(ranked.length){
   ranked.sort((a,b)=>b.score-a.score||a.topicId.localeCompare(b.topicId));
   const {score,...result}=ranked[0];
   return result;
 }
 // If the ordinary chapter index has no precise link, inspect the other
 // maps of THIS user for an explicit shared question ID. The decorator only
 // accepts eligible IDs; a coincidental text match in another chapter is not
 // promoted into a verified association.
 if(!ranked.length){
   [...(revisions?.keys?.()||[])].filter(topicId=>hasMap(revisions,topicId)&&!candidates.includes(topicId)).forEach(evaluate);
   if(ranked.length){
     ranked.sort((a,b)=>b.score-a.score||a.topicId.localeCompare(b.topicId));
     const {score,...result}=ranked[0];return result;
   }
 }
 const fallback=candidates.find(topicId=>hasMap(revisions,topicId));
 return fallback
   ?{status:"topic",topicId:fallback,path:null,title:topics?.get(fallback)?.titulo||revisions.get(fallback)?.mapa?.centro||fallback,
     questionId:id,confidence:"capitulo",via:"capitulo"}
   :{status:"unavailable",topicId:null,path:null,questionId:id};
}
function resolveCard({key,card,questions,index,revisions,topics,decorate,resolveCard,questionIdFor}){
 const qid=text(questionIdFor?.(key)||card?.questionId);
 if(qid&&questions?.has(qid))return resolveQuestion({
   questionId:qid,questions,index,revisions,topics,decorate
 });
 const match=/^(.*?)@(\d+)$/.exec(text(key));
 const topicId=match?.[1],i=Number(match?.[2]);
 if(!topicId||!hasMap(revisions,topicId))return {status:"unavailable",topicId:null,path:null};
 const rev=revisions.get(topicId),topic=topics?.get(topicId);
 const editorial=decorate(topicId,rev,topic);
 const decoratedCard=editorial?.cards?.[i]||card;
 const resolution=resolveCard?.(editorial?.map||rev.mapa,decoratedCard);
 const node=findPath(editorial?.map||rev.mapa,resolution?.path);
 if(node)return {
   status:"linked",topicId,path:node.path,title:node.title,nodeId:node.nodeId,
   confidence:resolution?.status==="exact"?"editorial":"sugerido",
   via:resolution?.status==="exact"?"flashcard-exato":"flashcard-sugerido",cardKey:key
 };
 return {status:"topic",topicId,path:null,title:topic?.titulo||rev.mapa.centro||topicId,confidence:"capitulo",via:"capitulo",cardKey:key};
}
root.QBMapRemission={resolveQuestion,resolveCard,findPath};
if(typeof module!=="undefined"&&module.exports)module.exports=root.QBMapRemission;
})(typeof window!=="undefined"?window:globalThis);