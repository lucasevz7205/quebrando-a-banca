import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  EDITORIAL_VERSION,auditEditorialBundle,auditEditorialCollection,enumerateNodes,buildEditorialPrompts
} from "../src/lib/editorial-engine.js";
import {assertEditorialImport} from "../src/lib/question-editorial-gate.js";

const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const revisions=read("scripts/rf-reformulacao/depois-2026-11-10.json");
const questions=read("src/data/rf-questoes-revisao-2026-11-10.json");
const route=fs.readFileSync("src/routes/_authed/questoes.jsx","utf8");
const studio=fs.readFileSync("src/components/qb/EditorialQualityStudio.jsx","utf8");

test("os oito produtos existentes preservam todas as questões e nós específicos",()=>{
 const report=auditEditorialCollection(revisions,questions);
 assert.equal(report.version,EDITORIAL_VERSION);
 assert.deepEqual({
  topics:report.totals.topics,nodes:report.totals.nodes,cards:report.totals.cards,
  questions:report.totals.questions,linkedQuestions:report.totals.linkedQuestions,
  blockers:report.totals.blockers,reviewed:report.totals.reviewed
 },{topics:8,nodes:139,cards:139,questions:160,linkedQuestions:160,blockers:0,reviewed:0});
 for(const topic of report.topics){
  assert.equal(topic.counts.questions,20,topic.topicId);
  assert.equal(topic.counts.correct,10);
  assert.equal(topic.counts.wrong,10);
  assert.equal(topic.counts.linkedCards,topic.counts.cards);
  assert.equal(topic.counts.enrichedNodes,topic.counts.nodes);
  assert.equal(topic.canPublish,false,"pendência humana impede publicação automática");
  assert.ok(topic.warnings.some(w=>w.code==="HUMAN_REVIEW"));
  assert.ok(topic.warnings.some(w=>w.code==="SOURCE_VERIFICATION"));
 }
});
test("IDs de nós são únicos e os vínculos do corpus estão referenciados",()=>{
 for(const [topicId,revision] of Object.entries(revisions)){
  const {nodes,duplicated,ids}=enumerateNodes(revision.mapa);
  assert.equal(duplicated.size,0);
  assert.ok(nodes.length>=12);
  for(const question of questions.filter(x=>x.topico===topicId))
   assert.ok(ids.has(question.mapaNoId),question.id);
 }
});
test("nó sem enriquecimento e ID duplicado bloqueiam pacote",()=>{
 const d=JSON.parse(JSON.stringify(revisions["rf-2-1"]));
 d.mapa.ramos[0].x.ex="";
 d.mapa.ramos[1].id=d.mapa.ramos[0].id;
 const r=auditEditorialBundle(d,questions.filter(q=>q.topico===d.id));
 assert.ok(r.blockers.some(b=>b.code==="NODE_ENRICHMENT"));
 assert.ok(r.blockers.some(b=>b.code==="DUPLICATE_NODE"));
 assert.equal(r.canPublish,false);
});
test("flashcard sem fonte e vínculo errado são bloqueados",()=>{
 const d=JSON.parse(JSON.stringify(revisions["rf-2-2"]));
 d.cartoes[0].src="";
 d.cartoes[0].mapaNoId="no-fabricado";
 const report=auditEditorialBundle(d,[]);
 assert.ok(report.blockers.some(b=>b.code==="CARD_SOURCE"));
 assert.ok(report.blockers.some(b=>b.code==="CARD_NODE"));
});
test("questões C/E usam falsificação coerente, evidência e remissão exata",()=>{
 const d=revisions["rf-2-3"],q=questions.find(q=>q.topico===d.id&&q.gabarito==="E");
 const broken={...q,trechoDecisivo:"algo que não existe",mapaNoId:"desconhecido",
  evidenciaFonte:"fonte não encontrada",mecanismo:"V1",topico:"rf-9-9"};
 const r=auditEditorialBundle(d,[broken]);
 for(const c of ["QUESTION_FALSIFICATION","QUESTION_NODE","QUESTION_DECISIVE",
  "QUESTION_EVIDENCE","QUESTION_TOPIC"])assert.ok(r.blockers.some(x=>x.code===c),c);
});
test("itens idênticos e formato com alternativas são bloqueados",()=>{
 const d=revisions["rf-2-4"],q=questions.find(x=>x.topico===d.id);
 const dup={...q,id:q.id+"-outro"};
 const r=auditEditorialBundle(d,[q,dup]);
 assert.ok(r.blockers.some(x=>x.code==="QUESTION_DUPLICATE"));
 const bad={...q,id:q.id+"-terceiro",enunciado:q.enunciado+"\nA) opção incorreta"};
 const rr=auditEditorialBundle(d,[bad]);
 assert.ok(rr.blockers.some(x=>x.code==="QUESTION_FORMAT"));
});
test("prompts compartilham fonte, IDs e fluxo de revisão cega em cinco fases",()=>{
 const source="A digitalização da fala demanda uma hipótese textual. "+
   "A conferência humana confronta o texto gerado com o áudio original e corrige eventuais divergências. "+
   "Diferentes produtos editoriais preservam ou simplificam marcas da oralidade conforme a finalidade declarada.";
 const prompts=buildEditorialPrompts({
  topicId:"rf-2-1",title:"ASR e revisão",materia:"Reconhecimento de fala",
  cargo:"Analista Legislativo",source:"Manual técnico primário",
  location:"capítulo 2, páginas 3–5",textSource:source,
  existingNodeIds:["rf-2-1-r1-1"],existingQuestions:["Um item anterior sobre ASR"]
 });
 assert.equal(prompts.version,EDITORIAL_VERSION);
 for(const k of ["revision","mapa","flashcards","questions","audit"]){
  assert.ok(prompts[k].includes("rf-2-1"),k);
  assert.ok(prompts[k].includes("Manual técnico primário"),k);
  assert.ok(prompts[k].includes("Não inventar fonte"),k);
 }
 assert.match(prompts.mapa,/x:\{e,ex,trap,src\}/);
 assert.match(prompts.flashcards,/mapaNoId/);
 assert.match(prompts.questions,/20 inéditas/);
 assert.match(prompts.questions,/no máximo CINCO/);
 assert.match(prompts.questions,/F1–F10/);
 assert.match(prompts.questions,/CEBRASPE/);
 assert.match(prompts.questions,/revisão CEGA/);
 assert.match(prompts.questions,/cebraspe-3\.0/);
 assert.match(prompts.audit,/gabarito/);
 assert.throws(()=>buildEditorialPrompts({topicId:"rf-2-1",title:"ASR",source:"X",location:"p3",
  textSource:"Resumo curto."}),/150 caracteres/);
});
test("protocolo 3.0 impede importação sem fonte conferida e parecer cego",()=>{
 const old=questions.find(q=>q.gabarito==="E");
 const base={...old,protocolo:"cebraspe-3.0",tipo:"autoral",statusEditorial:"revisado",
  fonte:"Manual técnico original, capítulo 2, consulta auditada",
  provenienciaFonte:"Manual técnico primário",
  revisaoIA:{gabarito:old.gabarito,problemas:[],justificativa:"Examinei a fonte e não identifiquei dupla interpretação."},
  revisaoHumana:{responsavel:"Revisor de conteúdo",data:"2026-11-10",
   parecer:"Verifiquei enunciado, fonte, contexto, gabarito e ligação ao nó.",
   fonteConferida:true,gabaritoConferido:true,univocidadeConferida:true,remissaoConferida:true}
 };
 assert.doesNotThrow(()=>assertEditorialImport([base]));
 for(const attr of ["fonteConferida","gabaritoConferido","univocidadeConferida","remissaoConferida"]){
  const modified={...base,revisaoHumana:{...base.revisaoHumana,[attr]:false}};
  assert.throws(()=>assertEditorialImport([modified]),/conferência humana/);
 }
 assert.throws(()=>assertEditorialImport([{...base,mapaNoId:undefined}]),/nó do mapa/);
 assert.throws(()=>assertEditorialImport([{...base,revisaoIA:{...base.revisaoIA,gabarito:"C"}}]),/revisão cega/);
 assert.throws(()=>assertEditorialImport([{...base,provenienciaFonte:"Reelaboração de material já cadastrado"}]),/fonte primária/);
});
test("compatibilidade das 160 questões 2.0 e importações legadas permanece inalterada",()=>{
 assert.doesNotThrow(()=>assertEditorialImport([{id:"legacy",documento:"historico"}]));
 const q={...questions[0],statusEditorial:"revisado",
  revisaoHumana:{responsavel:"Equipe de revisão",data:"2026-11-10",
   parecer:"Item fundamentado após conferência com o texto-fonte."}};
 assert.equal(q.protocolo,"cebraspe-2.0");
 assert.doesNotThrow(()=>assertEditorialImport([q]));
});

test("geração do laboratório vincula tópico e nó exato quando solicitado",async()=>{
 const mod=await import("../src/lib/question-authoring.js");
 const q=questions.find(x=>x.topico==="rf-2-1"&&x.gabarito==="C");
 const input={
  materia:q.materia,assunto:q.assunto,cargo:q.cargo,quantidade:1,
  fonte:q.fonte,localizacao:q.localizacaoFonte,textoFonte:q.textoFonte,
  topicoId:q.topico,mapaNoId:q.mapaNoId,mecanismos:[]
 };
 assert.equal(mod.requestSchema.parse(input).mapaNoId,q.mapaNoId);
 assert.equal(mod.groupRequestSchema.parse(input).topicoId,q.topico);
 assert.equal(mod.validateDrafts({questoes:[q]},input).length,1);
 assert.throws(()=>mod.validateDrafts({questoes:[{...q,mapaNoId:"nó-falso"}]},input),/Nó conceitual/);
 assert.throws(()=>mod.requestSchema.parse({...input,topicoId:""}));
 assert.throws(()=>mod.groupRequestSchema.parse({...input,mapaNoId:""}));
 assert.match(mod.generationPrompt(input),/registre mapaNoId idêntico/);
 const server=fs.readFileSync("src/lib/question-authoring-server.js","utf8");
 const form=fs.readFileSync("src/components/qb/QuestionAuthoring.jsx","utf8");
 assert.match(server,/cebraspe-3\.0/);
 assert.match(server,/mapaNoId:data.mapaNoId/);
 assert.match(form,/ID exato do nó no mapa/);
 assert.match(form,/fonteConferida/);
});
test("manual de agente inclui obrigatoriedade do novo motor sem mutar os 160 rascunhos",()=>{
 const rules=fs.readFileSync("AGENTS.md","utf8");
 assert.match(rules,/Integrated editorial engine/);
 assert.match(rules,/auditEditorialBundle/);
 assert.match(rules,/cebraspe-3\.0/);
 assert.match(rules,/cebraspe-2\.0/);
 assert.equal(questions.filter(q=>q.statusEditorial==="aguardando-revisao-humana").length,160);
});

test("Laboratório exibe auditoria e orientações sem realizar chamadas de crédito",()=>{
 assert.match(route,/import EditorialQualityStudio/);
 assert.match(route,/<EditorialQualityStudio\/>/);
 assert.match(studio,/auditEditorialCollection\(revisions,drafts\)/);
 assert.match(studio,/buildEditorialPrompts\(/);
 assert.match(studio,/sem créditos/);
 assert.match(studio,/Exportar auditoria/);
 assert.doesNotMatch(studio,/InvokeLLM|importQuestions|asServiceRole|api\.post\(/);
});
