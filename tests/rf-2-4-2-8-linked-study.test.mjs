import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const all=JSON.parse(fs.readFileSync("src/data/rf-questoes-revisao-2026-11-10.json","utf8"));
const reviews=JSON.parse(fs.readFileSync("scripts/rf-reformulacao/depois-2026-11-10.json","utf8"));
const originalEdital=JSON.parse(fs.readFileSync("scripts/claude-seed/edital.json","utf8"));
const newTopics=new Set(["rf-2-4","rf-2-5","rf-2-6","rf-2-7","rf-2-8"]);
const added=all.filter(q=>newTopics.has(q.topico));
const mapped=originalEdital.map(t=>newTopics.has(t.id)?{...t,caps:["RF-2."+t.id.at(-1)]}:t);
const questions=new Map(added.map(q=>[q.id,q]));
const topics=new Map(mapped.map(t=>[t.id,t]));
const revisions=new Map(Object.entries(reviews));
const w={};
for(const path of [
 "public/claude-export/question-links.js",
 "public/claude-export/cohesion-links.js",
 "public/claude-export/map-global-links.js",
 "public/claude-export/map-remission.js"
])vm.runInNewContext(fs.readFileSync(path,"utf8"),{window:w},{filename:path});
const index=w.QBQuestionLinks.build(questions,topics,revisions);
const decorate=(id,r,t)=>w.QBEditorialCoverage.decorate(id,r.mapa,r.cartoes,questions,t);
test("somente RF 2.4–2.8 contém as 100 questões selecionadas, em cinco grupos iguais",()=>{
 assert.equal(added.length,100);
 assert.equal(new Set(added.map(q=>q.id)).size,100);
 for(let i=4;i<=8;i++){
  const id="rf-2-"+i,items=added.filter(q=>q.topico===id);
  assert.equal(items.length,20);
  assert.deepEqual(mapped.find(t=>t.id===id).caps,["RF-2."+i]);
  assert.equal(index.byTopic.get(id)?.length,20);
  assert.ok(items.every(q=>q.statusEditorial==="aguardando-revisao-humana"));
  assert.ok(items.every(q=>q.cap==="RF-2."+i));
 }
 for(let i=1;i<=3;i++){
  const id="rf-2-"+i;
  assert.deepEqual(mapped.find(t=>t.id===id).caps,originalEdital.find(t=>t.id===id).caps);
  assert.equal(index.byTopic.get(id)?.length||0,0);
 }
});
test("as 100 questões remetem ao nó exato do mapa mental, sem heurística de similaridade",()=>{
 for(const id of newTopics){
  const result=decorate(id,reviews[id],topics.get(id));
  assert.equal(result.questionLinks.length,20,id);
  assert.equal(result.unmatchedQuestions.length,0,id);
  for(const q of added.filter(q=>q.topico===id)){
   const link=result.questionLinks.find(x=>x.id===q.id);
   assert.equal(link?.via,"id-no",q.id);
   const rem=w.QBMapRemission.resolveQuestion({
    questionId:q.id,questions,index,revisions,topics,decorate
   });
   assert.equal(rem.status,"linked",q.id);
   assert.equal(rem.topicId,id,q.id);
   assert.equal(rem.path,link.path,q.id);
   assert.equal(rem.nodeId,q.mapaNoId,q.id);
   assert.equal(rem.confidence,"editorial",q.id);
  }
 }
});
test("todos os cartões derivados mantêm aviso editorial sobre gabarito provisório",()=>{
 for(const q of added){
   const c=w.QBQuestionLinks.card(q);
   assert.equal(c.questionId,q.id);
   assert.equal(c.statusEditorial,"aguardando-revisao-humana");
   assert.match(c.a.join(" "),/Gabarito proposto, ainda sem revisão humana/);
   assert.doesNotMatch(c.a.join(" "),/Gabarito oficial/);
 }
});
test("o treino continua salvando as respostas por ID original e mostrando aviso de revisão",()=>{
 const html=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(html,/S\.db\.doc\('respostas\/'\+q\.id\)/);
 assert.match(html,/data-train-topic/);
 assert.match(html,/function iniciarTreinoAssunto/);
 assert.match(html,/statusEditorial==='aguardando-revisao-humana'/);
 assert.match(html,/Questão autoral em revisão editorial/);
});
