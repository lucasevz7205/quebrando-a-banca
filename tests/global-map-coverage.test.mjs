import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read=name=>JSON.parse(fs.readFileSync("scripts/claude-seed/"+name+".json","utf8"));
function modules(){
 const win={};const ctx={window:win, module:{exports:{}}};
 for(const file of ["map-origin.js","map-mastery.js","cohesion-links.js","map-global-links.js"])
  vm.runInNewContext(fs.readFileSync("public/claude-export/"+file,"utf8"),ctx,{filename:file});
 return win;
}
const sys=modules();
const topics=read("edital"),questions=read("questoes"),revisions=read("revisao");
const byTopic=new Map(topics.map(x=>[x.id,x])),qmap=new Map(questions.map(x=>[x.id,x]));
function decorate(id,doc,qs=qmap,topic=byTopic.get(id)){
 const special=sys.QBEditorialCohesion.decorate(id,doc.mapa,doc.cartoes||[],qs);
 return sys.QBEditorialCoverage.decorate(id,special?.map||doc.mapa,special?.cards||doc.cartoes||[],qs,topic);
}
const maps=revisions.filter(x=>x.mapa?.ramos?.length);
test("todos os 29 mapas da Câmara recebem o resolvedor e preservam número de nós",()=>{
 assert.equal(maps.length,29);
 for(const m of maps){
  const original=JSON.stringify(m),result=decorate(m.id,m);
  assert.ok(result&&result.map&&result.cards);
  assert.equal(result.cards.length,m.cartoes.length);
  assert.equal(JSON.stringify(m),original,"documento original foi alterado: "+m.id);
  assert.ok(result.nodeCount>0,"mapa vazio: "+m.id);
  assert.equal(result.questionLinks.length+result.unmatchedQuestions.length,
   questions.filter(q=>q.topico===m.id||(byTopic.get(m.id)?.caps||[]).includes(q.cap)).length);
  assert.equal(result.cardLinks.length+result.unmatchedCards.length,m.cartoes.length);
  assert.equal(new Set(result.questionLinks.map(x=>x.id)).size,result.questionLinks.length);
  assert.equal(new Set(result.cardLinks.map(x=>x.index)).size,result.cardLinks.length);
 }
});
test("Coesão preserva as 67 questões e os 39 cartões revisados editorialmente",()=>{
 const m=maps.find(x=>x.id==="lp-4-1"),d=decorate(m.id,m);
 assert.equal(d.questionLinks.length,67);
 assert.equal(d.cardLinks.length,39);
 assert.equal(d.unmatchedQuestions.length,0);
 assert.equal(d.unmatchedCards.length,0);
 const stat=sys.QBMapMastery.build({topicId:m.id,map:d.map,cards:d.cards,topic:byTopic.get(m.id),questions:qmap,
   responses:new Map(read("respostas").map(x=>[x.id,x])),
   assessments:new Map(read("cartoes_aval").map(x=>[x.k||x.id,x])),resolveCard:sys.QBMapLinks?.resolve});
 assert.equal(stat.linked.size,67);
 assert.equal(stat.root.review.total,39);
});
test("global só associa candidatos com capítulo e não força questões genéricas aos nós",()=>{
 const m=maps.find(x=>x.id==="da-10-5");
 const detail=decorate(m.id,m);
 assert.ok(detail.unmatchedQuestions.length>=5,"deveria preservar casos ambíguos");
 assert.ok(detail.linked<20);
 assert.equal(sys.QBEditorialCoverage.decorate(m.id,m.mapa,m.cartoes,new Map(),byTopic.get(m.id)).linked,0);
 const fake=new Map([["out-of-topic",{id:"out-of-topic",cap:"ZZZZ",tema:"Fiscalização contratual",gabarito:"C"}]]);
 const noCross=sys.QBEditorialCoverage.decorate(m.id,m.mapa,m.cartoes,fake,byTopic.get(m.id));
 assert.equal(noCross.linked,0);
});
test("nó central usa somente o indicador agregado do edital e separa subramos",()=>{
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 const layout=fs.readFileSync("src/components/qb/mind-map/layout.js","utf8");
 assert.match(shell,/rootStatus:geral\?\.status/);
 assert.match(shell,/Geral do edital/);
 assert.match(shell,/Desempenho geral no edital/);
 assert.match(shell,/Esse indicador não certifica domínio de cada subramo/);
 assert.match(layout,/status: graph\.rootStatus/);
 assert.match(shell,/Os demais permanecem sem atribuição de subramo/);
});
test("o leitor de mapa, treino e HTML carregam o mesmo resolvedor global",()=>{
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(shell,/map-global-links\.js/);
 assert.match(shell,/function mapaComVinculos/);
 assert.match(shell,/mapaComVinculos\(S\.mapaId,revMapa,t\)/);
 assert.match(shell,/mapaComVinculos\(S\.mapaId,rv,t\)/);
});
test("as 16 sementes completas da Área Fiscal conservam seus vínculos diretos sem sair da conta",()=>{
 const directory=fs.readdirSync("scripts/fiscal").filter(x=>x.endsWith(".seed.json"));
 assert.ok(directory.length>=16);
 for(const file of directory){
  const seed=JSON.parse(fs.readFileSync("scripts/fiscal/"+file,"utf8"));
  const qs=seed.questions||[],cards=seed.cards||[],map=seed.map;
  const topicId=seed.topic||qs[0]?.topico;
  const qmap=new Map(qs.map(q=>[q.id,q]));
  const detail=sys.QBEditorialCoverage.decorate(topicId,map,cards,qmap,{id:topicId,caps:[qs[0].cap]});
  assert.equal(detail.unmatchedQuestions.length,0,file+" perde ligações de questão");
  assert.equal(detail.unmatchedCards.length,0,file+" perde ligações de flashcard");
  const diag=sys.QBMapMastery.build({topicId,map:detail.map,cards:detail.cards,questions:qmap,responses:new Map(),topic:{id:topicId,caps:[qs[0].cap]},resolveCard:sys.QBMapLinks?.resolve});
  assert.equal(diag.linked.size,qs.length,file+" apresenta contagem incorreta");
  assert.ok(diag.nodes.every(n=>n.stat.status==="sem-evidencia"),file+" inventa desempenho sem respostas");
 }
});
