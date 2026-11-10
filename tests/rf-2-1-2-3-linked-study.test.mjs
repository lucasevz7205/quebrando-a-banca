import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=JSON.parse(fs.readFileSync("src/data/rf-questoes-revisao-2026-11-10.json","utf8"));
const reviews=JSON.parse(fs.readFileSync("scripts/rf-reformulacao/depois-2026-11-10.json","utf8"));
const edital=JSON.parse(fs.readFileSync("scripts/claude-seed/edital.json","utf8"));
const selected=new Set(["rf-2-1","rf-2-2","rf-2-3"]);
const selectedQuestions=source.filter(q=>selected.has(q.topico));
const newTopics=edital.map(t=>selected.has(t.id)?{...t,caps:["RF-2."+t.id.at(-1)]}:t);
const questions=new Map(selectedQuestions.map(q=>[q.id,q]));
const topics=new Map(newTopics.map(t=>[t.id,t]));
const revisions=new Map(Object.entries(reviews));
const browser={};
for(const path of [
 "public/claude-export/question-links.js",
 "public/claude-export/cohesion-links.js",
 "public/claude-export/map-global-links.js",
 "public/claude-export/map-remission.js"
])vm.runInNewContext(fs.readFileSync(path,"utf8"),{window:browser},{filename:path});
const index=browser.QBQuestionLinks.build(questions,topics,revisions);
const decorate=(topicId,revision,topic)=>browser.QBEditorialCoverage.decorate(
 topicId,revision.mapa,revision.cartoes,questions,topic
);
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");

test("somente 2.1–2.3 são escolhidos, 20 questões por assunto e sem repetição",()=>{
 assert.equal(selectedQuestions.length,60);
 assert.equal(new Set(selectedQuestions.map(q=>q.id)).size,60);
 for(const id of selected){
  const qs=selectedQuestions.filter(q=>q.topico===id);
  assert.equal(qs.length,20);
  assert.deepEqual(newTopics.find(t=>t.id===id).caps,["RF-2."+id.at(-1)]);
  assert.equal(index.byTopic.get(id)?.length,20);
  assert.ok(qs.every(q=>q.statusEditorial==="aguardando-revisao-humana"));
  assert.ok(qs.every(q=>q.cap==="RF-2."+id.at(-1)));
 }
 for(let i=4;i<=8;i++){
   const t=newTopics.find(t=>t.id==="rf-2-"+i);
   assert.deepEqual(t.caps,edital.find(x=>x.id===t.id).caps,"outros assuntos intactos");
   assert.equal(index.byTopic.get(t.id)?.length||0,0);
 }
});
test("os 60 itens navegam ao nó exato do mapa do próprio assunto",()=>{
 for(const id of selected){
  const result=decorate(id,reviews[id],topics.get(id));
  assert.equal(result.questionLinks.length,20,id);
  assert.equal(result.unmatchedQuestions.length,0,id);
  for(const q of selectedQuestions.filter(x=>x.topico===id)){
   const target=result.questionLinks.find(link=>link.id===q.id);
   assert.equal(target?.via,"id-no",q.id);
   const resolved=browser.QBMapRemission.resolveQuestion({
     questionId:q.id,questions,index,revisions,topics,decorate
   });
   assert.equal(resolved.status,"linked",q.id);
   assert.equal(resolved.topicId,id,q.id);
   assert.equal(resolved.path,target.path,q.id);
   assert.equal(resolved.nodeId,q.mapaNoId,q.id);
   assert.equal(resolved.confidence,"editorial",q.id);
  }
 }
});
test("o Treinar mantém C/E, mostra aviso de gabarito provisório e grava histórico por ID",()=>{
 assert.match(shell,/statusEditorial==='aguardando-revisao-humana'/);
 assert.match(shell,/Questão autoral em revisão editorial/);
 assert.match(shell,/Os gabaritos apresentados são provisórios/);
 assert.match(shell,/const prev=S\.r\.get\(q\.id\)\|\|\{\}/);
 assert.match(shell,/S\.db\.doc\('respostas\/'\+q\.id\)/);
 assert.match(shell,/function iniciarTreinoAssunto\(/);
 assert.match(shell,/novaRodada\('MIX',mat\.name\+'\s*·\s*'\+topic\.title,S\.modo,ids\)/);
 assert.match(shell,/rf-study-drafts\.css\?v=1/);
});
test("cartões derivados não apresentam gabarito provisório como oficial",()=>{
 const q=selectedQuestions[0];
 const card=browser.QBQuestionLinks.card(q);
 assert.ok(card.fromQuestion);
 assert.equal(card.questionId,q.id);
 assert.equal(card.statusEditorial,"aguardando-revisao-humana");
 assert.match(card.a.join(" "),/Gabarito proposto, ainda sem revisão humana/);
 assert.doesNotMatch(card.a.join(" "),/Gabarito oficial/);
 assert.match(card.a.join(" "),/não é/);
});
