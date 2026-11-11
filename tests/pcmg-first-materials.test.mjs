import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {auditFGVBundle} from "../src/lib/fgv-editorial.js";
import {validateStudyContentBatch} from "../src/lib/study-provisioning.js";

const files=[
 "scripts/pcmg-pilot/principios-fundamentais-2026-11-11.json",
 "scripts/pcmg-pilot/teoria-constituicao-criminologia-2026-11-11.json"
];
const all=files.flatMap(x=>JSON.parse(fs.readFileSync(x,"utf8")).material);
const questions=new Map(all.flatMap(m=>m.questoes).map(q=>[q.id,q]));
const topics=new Map(all.map(m=>[m.edital.id,m.edital]));
const revisions=new Map(all.map(m=>[m.revisao.id,m.revisao]));
const w={};
for(const p of ["public/claude-export/question-links.js","public/claude-export/cohesion-links.js",
 "public/claude-export/map-global-links.js","public/claude-export/map-remission.js"]){
 vm.runInNewContext(fs.readFileSync(p,"utf8"),{window:w},{filename:p});
}
const index=w.QBQuestionLinks.build(questions,topics,revisions);
test("PCMG piloto: seis tópicos, 48 questões, 72 flashcards e 36 nós, IDs únicos",()=>{
 assert.equal(all.length,6);
 assert.equal(questions.size,48);
 assert.equal(new Set(all.map(x=>x.id)).size,6);
 assert.equal(all.reduce((n,m)=>n+m.revisao.cartoes.length,0),72);
 assert.equal(all.reduce((n,m)=>n+m.revisao.mapa.ramos.length,0),36);
 for(const m of all){
  assert.equal(m.questoes.length,8);
  assert.equal(m.revisao.cartoes.length,12);
  assert.equal(m.revisao.mapa.ramos.length,6);
  assert.equal(m.edital.caps.length,1);
  assert.equal(m.questoes.filter(q=>q.statusEditorial==="aguardando-revisao-humana").length,8);
  assert.deepEqual(validateStudyContentBatch("questoes",m.questoes),m.questoes);
  assert.equal(auditFGVBundle(m.edital,m.revisao,m.questoes).blockers.length,0,m.id);
 }
});
test("cada uma das 48 questões FGV remete a nó existente de seu próprio assunto",()=>{
 for(const m of all){
  const decorated=w.QBEditorialCoverage.decorate(m.id,m.revisao.mapa,m.revisao.cartoes,questions,m.edital);
  assert.equal(decorated.unmatchedQuestions.length,0,m.id);
  assert.equal(decorated.questionLinks.length,8,m.id);
  assert.equal(index.byTopic.get(m.id)?.length,8,m.id);
  for(const q of m.questoes){
   assert.deepEqual(q.alternativas.map(o=>o.letra),["A","B","C","D","E"]);
   assert.ok(q.alternativas.some(o=>o.letra===q.gabarito));
   const jump=w.QBMapRemission.resolveQuestion({questionId:q.id,questions,index,revisions,topics,
    decorate:(id,rev,t)=>w.QBEditorialCoverage.decorate(id,rev.mapa,rev.cartoes,questions,t)});
   assert.equal(jump.status,"linked",q.id);
   assert.equal(jump.topicId,q.topico,q.id);
   assert.equal(jump.nodeId,q.mapaNoId,q.id);
  }
 }
});
test("cartões e revisões têm conteúdo e ligação, sem CPF ou nomes de titulares do arquivo licenciado",()=>{
 const payload=JSON.stringify(all);
 assert.doesNotMatch(payload,/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/);
 for(const m of all){
  assert.ok(m.revisao.resumo.length>=6);
  for(const card of m.revisao.cartoes){
   assert.ok(m.revisao.mapa.ramos.some(n=>n.id===card.mapaNoId));
   assert.ok(card.a.length&&card.q&&card.src);
  }
  for(const node of m.revisao.mapa.ramos){
   assert.ok(node.x.e.length>=35&&node.x.ex&&node.x.trap&&node.x.src);
  }
 }
});
test("auditoria FGV reprova questões sem alternativas completas e mapas sem nós reais",()=>{
 const m=all[0],broken={...m.questoes[0],alternativas:[...m.questoes[0].alternativas.slice(0,4)]};
 const review=auditFGVBundle(m.edital,m.revisao,[broken]);
 assert.ok(review.blockers.some(x=>x.code==="QUESTION_OPTIONS"));
 assert.equal(review.canPublish,false);
 const bad={...m.revisao,mapa:{...m.revisao.mapa,ramos:[]}};
 assert.ok(auditFGVBundle(m.edital,bad,[]).blockers.some(x=>x.code==="MAP_EMPTY"));
});
