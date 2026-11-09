import test from "node:test";
import assert from "node:assert/strict";
import {requestSchema,validateDrafts,applyReview,reviewPrompt,creationBrief,groupRequestSchema,generateSubjectDrafts} from "../src/lib/question-authoring.js";
import {assertEditorialImport} from "../src/lib/question-editorial-gate.js";
const source="No laboratório fictício, o relatório exige duas assinaturas digitais válidas para sua liberação. Nenhuma outra condição é exigida.";
const request={materia:"Lógica",assunto:"Condições",cargo:"Analista",quantidade:1,fonte:"Regulamento fictício",localizacao:"Seção 1",textoFonte:source,mecanismos:[]};
const q={enunciado:"O relatório exige duas assinaturas digitais válidas para sua liberação.",gabarito:"C",conceito:"Condição necessária",contexto:"Laboratório fictício",relacao:"Condição de liberação",operacao:"aplicar",mecanismo:null,trechoDecisivo:"duas assinaturas",justificativa:"A premissa exige as assinaturas para que o relatório seja liberado.",correcaoMinima:"Nenhuma correção: a premissa sustenta o enunciado.",perguntaPreventiva:"Qual condição a regra exige?",evidenciaFonte:"o relatório exige duas assinaturas digitais válidas",dificuldadePlanejada:"basica"};
test("bounded input and valid grounded draft",()=>{
 assert.equal(requestSchema.parse(request).quantidade,1);
 assert.equal(requestSchema.parse({...request,quantidade:20}).quantidade,20);
 assert.throws(()=>requestSchema.parse({...request,quantidade:21}));
 assert.throws(()=>groupRequestSchema.parse({...request,quantidade:6}));
 assert.equal(validateDrafts({questoes:[q]},request).length,1);
});
test("reject ungrounded evidence, multiple choice and inconsistent mechanism",()=>{
 for(const patch of [{evidenciaFonte:"Uma fonte que não existe no texto"},{gabarito:"E"},{enunciado:q.enunciado+"\nA) Resposta candidata"}]){
  assert.throws(()=>validateDrafts({questoes:[{...q,...patch}]},request));
 }
});
test("reject duplicate or incomplete batches",()=>{
 assert.throws(()=>validateDrafts({questoes:[q,q]},{...request,quantidade:2}));
 assert.throws(()=>validateDrafts({questoes:[q]},{...request,quantidade:2}));
});
test("blind review has no proposed key; disagreement blocks and agreement is not approval",()=>{
 assert.ok(!reviewPrompt([q],request).includes('"gabarito":"C"'));
 const review=g=>({revisoes:[{indice:0,gabarito:g,problemas:[],justificativa:"A fonte sustenta o julgamento informado."}]});
 assert.equal(applyReview([q],review("E"))[0].statusEditorial,"bloqueado");
 assert.equal(applyReview([q],review("C"))[0].statusEditorial,"aguardando-revisao-humana");
 assert.throws(()=>applyReview([q],{revisoes:[]}));
});
test("new protocol blocks unreviewed import; legacy preserved",()=>{
 assert.doesNotThrow(()=>assertEditorialImport([{id:"legacy",documento:"old"}]));
 const draft={...q,protocolo:"cebraspe-2.0",tipo:"autoral",materia:request.materia,assunto:request.assunto,cargo:request.cargo,fonte:request.fonte,localizacaoFonte:request.localizacao,textoFonte:source};
 assert.throws(()=>assertEditorialImport([draft]));
 assert.doesNotThrow(()=>assertEditorialImport([{...draft,statusEditorial:"revisado",revisaoHumana:{responsavel:"Lucas",data:"2026-11-09",parecer:"Conferi a fonte e o gabarito; não há ambiguidade."}}]));
});
test("exported brief uses new method without invented frequency",()=>{
 const result=creationBrief({materia:"Lógica",assunto:"Condições",cargo:"Analista"});
 assert.equal(result.versao,2);
 assert.equal(result.total,undefined);
 assert.ok(result.orientacao.includes("CEBRASPE"));
});

test("generates and resumes a 20-question subject in five-question groups", async () => {
 const input = {...request, quantidade:20};
 let result;
 const calls = [];
 const generate = async group => {
  calls.push(group);
  if(calls.length===2) throw new Error("temporary failure");
  const offset = group.enunciadosAnteriores.length;
  return {questoes:Array.from({length:group.quantidade}, (_, i) => ({
   ...q, enunciado:q.enunciado+" Situação "+(offset+i+1),
   id:"item-"+(offset+i+1), documento:"grupo-"+offset,
  }))};
 };
 const progress = next => { result=next; };
 await assert.rejects(generateSubjectDrafts(input,generate,progress),/temporary failure/);
 assert.equal(result.questoes.length,5);
 await generateSubjectDrafts(input,generate,progress,result.questoes);
 assert.deepEqual(calls.map(g=>g.enunciadosAnteriores.length),[0,5,5,10,15]);
 assert.equal(result.questoes.length,20);
 assert.equal(new Set(result.questoes.map(item=>item.id)).size,20);
 assert.equal(new Set(result.questoes.map(item=>item.documento)).size,1);
});

test("rejects an item repeated from an earlier group", () => {
 assert.throws(
  ()=>validateDrafts({questoes:[q]},{...request,enunciadosAnteriores:[q.enunciado.toUpperCase()]}),
  /repetiu/,
 );
});
