import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import postcss from "postcss";

const read=name=>JSON.parse(fs.readFileSync("scripts/claude-seed/"+name+".json","utf8"));
const win={};
for(const name of ["question-links.js","map-origin.js","cohesion-links.js","map-global-links.js","map-remission.js"]){
  vm.runInNewContext(fs.readFileSync("public/claude-export/"+name,"utf8"),{window:win},{filename:name});
}
const topicList=read("edital"),questionList=read("questoes"),revisionList=read("revisao");
const topics=new Map(topicList.map(t=>[t.id,t]));
const questions=new Map(questionList.map(q=>[q.id,q]));
const revisions=new Map(revisionList.map(r=>[r.id,r]));
const index=win.QBQuestionLinks.build(questions,topics,revisions);
function decorate(topicId,revision,topic=topics.get(topicId)){
  const special=win.QBEditorialCohesion.decorate(topicId,revision?.mapa,revision?.cartoes||[],questions);
  return win.QBEditorialCoverage.decorate(topicId,special?.map||revision.mapa,special?.cards||revision.cartoes||[],questions,topic);
}
const context={questions,index,revisions,topics,decorate};

test("resolver retorna caminho exato e título do nó para Coesão, sem desviar ao capítulo",()=>{
  const source=decorate("lp-4-1",revisions.get("lp-4-1"));
  assert.equal(source.questionLinks.length,67);
  for(const link of source.questionLinks.slice(0,25)){
    const resolved=win.QBMapRemission.resolveQuestion({...context,questionId:link.id});
    assert.equal(resolved.status,"linked",link.id);
    assert.equal(resolved.topicId,"lp-4-1",link.id);
    assert.equal(resolved.path,link.path,link.id);
    const node=win.QBMapRemission.findPath(source.map,resolved.path);
    assert.equal(node.title,resolved.title);
    assert.equal(resolved.confidence,"editorial",link.id);
  }
});
test("a remissão escolhe vínculo explícito mesmo quando outro capítulo é preferido",()=>{
 const mapA={ramos:[{t:"Direito",id:"a",f:[{t:"Responsabilidade",id:"a.1"}]}]};
 const mapB={ramos:[{t:"Outro",id:"b",f:[{t:"Responsabilidade",id:"b.1"}]}]};
 const q=new Map([["x",{id:"x",topico:"B",tema:"Responsabilidade",cap:"C"}]]);
 const rev=new Map([["A",{mapa:mapA}],["B",{mapa:mapB}]]);
 const ed=new Map([["A",{id:"A",caps:["C"]}],["B",{id:"B",caps:["C"]}]]);
 const idx={byQuestion:new Map([["x",{topicId:"B",matchedIds:["B","A"]}]])};
 const decorate=(id,revision)=>({map:revision.mapa,questionLinks:[{id:"x",path:"0.0",via:id==="A"?"id-no":"rotulo-exato"}]});
 const result=win.QBMapRemission.resolveQuestion({
   questionId:"x",preferredTopicId:"B",questions:q,revisions:rev,topics:ed,index:idx,decorate
 });
 assert.equal(result.topicId,"A");
 assert.equal(result.title,"Responsabilidade");
 assert.equal(result.confidence,"editorial");
 assert.equal(result.path,"0.0");
});
test("não inventa nó quando há apenas correspondência por capítulo",()=>{
 const rev=new Map([["A",{mapa:{centro:"Assunto A",ramos:[{t:"Sem indicação",f:[]}]}}]]);
 const q=new Map([["x",{id:"x",topico:"A",tema:"Tema não associado"}]]);
 const ed=new Map([["A",{id:"A",titulo:"Assunto A"}]]);
 const idx={byQuestion:new Map([["x",{topicId:"A",matchedIds:["A"]}]])};
 const result=win.QBMapRemission.resolveQuestion({questionId:"x",questions:q,revisions:rev,topics:ed,index:idx,
   decorate:(id,d)=>({map:d.mapa,questionLinks:[]})});
 assert.equal(result.status,"topic");
 assert.equal(result.topicId,"A");
 assert.equal(result.path,null);
 assert.equal(result.confidence,"capitulo");
 const missing=win.QBMapRemission.resolveQuestion({questionId:"desconhecida",questions:q,revisions:rev,topics:ed,index:idx,
   decorate:()=>({map:rev.get("A").mapa,questionLinks:[]})});
 assert.equal(missing.status,"unavailable");
});
test("o resolvedor não aceita caminho inexistente nem ID de nó duplicado",()=>{
 const map={ramos:[{t:"A",f:[{t:"B",id:"x"}]}]};
 assert.equal(win.QBMapRemission.findPath(map,"0.0").title,"B");
 for(const path of ["1","0.2","0.0.0","root","0.x","0.0;alert(1)",""]){
   assert.equal(win.QBMapRemission.findPath(map,path),null,path);
 }
});
test("flashcard autoral usa mapa decorado e cartão gerado de questão conserva ID da questão",()=>{
 const rev=revisions.get("lp-4-1"),editor=decorate("lp-4-1",rev);
 const card=editor.cards.find(c=>c.mapaPath);
 assert.ok(card,"Coesão precisa de um cartão mapeado");
 const i=editor.cards.indexOf(card);
 const result=win.QBMapRemission.resolveCard({
   ...context,key:"lp-4-1@"+i,card:rev.cartoes[i],resolveCard:win.QBMapLinks.resolve,
   questionIdFor:win.QBQuestionLinks.questionId
 });
 assert.equal(result.status,"linked");
 assert.equal(result.path,card.mapaPath);
 assert.equal(result.topicId,"lp-4-1");
 const qid=editor.questionLinks[0].id;
 const questionCard=win.QBQuestionLinks.card(questions.get(qid));
 const fromQuestion=win.QBMapRemission.resolveCard({
   ...context,key:win.QBQuestionLinks.key(qid),card:questionCard,
   questionIdFor:win.QBQuestionLinks.questionId,resolveCard:win.QBMapLinks.resolve
 });
 assert.equal(fromQuestion.status,"linked");
 assert.equal(fromQuestion.questionId,qid);
 assert.equal(fromQuestion.path,editor.questionLinks[0].path);
});
test("casos reais das 29 malhas conservam destino válido e não cruzam contas",()=>{
 const maps=revisionList.filter(x=>x.mapa?.ramos?.length);
 assert.equal(maps.length,29);
 const sampled=[];
 for(const rev of maps){
   const links=decorate(rev.id,rev);
   if(!links.questionLinks.length)continue;
   for(const link of links.questionLinks.slice(0,2))sampled.push({qid:link.id,preferredTopicId:rev.id});
 }
 assert.ok(sampled.length>=35);
 for(const item of sampled){
   const result=win.QBMapRemission.resolveQuestion({...context,questionId:item.qid,preferredTopicId:item.preferredTopicId});
   assert.equal(result.status,"linked",item.qid);
   const map=decorate(result.topicId,revisions.get(result.topicId));
   const node=win.QBMapRemission.findPath(map.map,result.path);
   assert.ok(node,result.topicId+":"+result.path);
   assert.ok(map.questionLinks.some(x=>x.id===item.qid&&x.path===result.path));
 }
 const isolated=new Map();
 const r=win.QBMapRemission.resolveQuestion({...context,revisions:isolated,questionId:sampled[0].qid});
 assert.equal(r.status,"unavailable","no maps of another account can be consulted");
});
test("botão da questão navega pelo ID, passa nonce e abre AXON no conceito exato",()=>{
 const html=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 const observer=fs.readFileSync("src/components/qb/mind-map/observe.js","utf8");
 const scene=fs.readFileSync("src/components/qb/mind-map/scene.js","utf8");
 const css=fs.readFileSync("public/claude-export/map-remission.css","utf8");
 postcss.parse(css,{from:"map-remission.css"});
 assert.match(html,/map-remission\.js\?v=1/);
 assert.match(html,/map-remission\.css\?v=1/);
 assert.match(html,/function irQuestaoMapa\(qid\)/);
 assert.match(html,/data-qmap-question="\$\{esc\(q.id\)\}"/);
 assert.match(html,/irQuestaoMapa\(b.dataset.qmapQuestion\)/);
 assert.match(html,/mapaFocus=\{\.\.\.link,nonce:\+\+S.mapaFocusCounter\}/);
 assert.match(html,/data-map-focus-path="\$\{esc\(focus\?\.path\|\|''\)\}"/);
 assert.match(html,/data-map-focus-nonce="\$\{esc\(focus\?\.nonce\|\|''\)\}"/);
 assert.match(observer,/const deepLink=!!incomingNonce && incomingNonce!==consumedFocusNonce/);
 assert.match(observer,/lastPath=nodes\.has\(requested\)\?requested:"root"/);
 assert.match(observer,/show3d\(lastPath!=="root"\)/);
 assert.match(observer,/select\(lastPath \|\| "root", lastPath !== "" && lastPath !== "root", openRemission && lastPath!=="root"\)/);
 assert.match(scene,/if\(branches\.reveal\(path\)\)syncVisibility\(\)/);
 assert.match(css,/qb-map-remission-target/);
 assert.match(observer,/scrollIntoView\(\{block:"center",behavior:"smooth"\}\)/);
});
test("depois do salto, permite voltar à questão sem descartar a sessão de treino",()=>{
 const html=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(html,/data-voltar-questao="1"/);
 assert.match(html,/const previous=back\.view\|\|'treinar',qid=back\.qid/);
 assert.match(html,/S\.mapaBack=null;S\.mapaFocus=null;setView\(previous\)/);
 assert.match(html,/if\(v!=='mapa'\) S\.mapaFocus=null/);
 assert.match(html,/qb-map-remission-banner/);
 assert.match(html,/Nenhum nó foi atribuído artificialmente/);
 assert.match(html,/function entradasCaderno\(lista,indice\)/);
 assert.match(html,/\$\{atalhosQuestao\(q,indice\)\}/);
});
