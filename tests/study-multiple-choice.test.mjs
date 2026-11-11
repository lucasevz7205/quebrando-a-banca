import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {decodeStudyCatalog,auditStudyCatalog,normalizeStudyQuestion} from "../src/lib/study-import.js";
import {validateStudyContentBatch} from "../src/lib/study-provisioning.js";

const template={
 enunciado:"No que se refere à investigação criminal, assinale a alternativa correta.",
 materia:"Direito Penal",assunto:"Inquérito policial",prova:"PCMG",
 alternativas:{A:"Regra incorreta",B:"A resposta correta",C:"Outra hipótese",D:"Mais uma resposta",E:"Outra interpretação"},
 gabarito:"B"
};
test("questionário PCMG aceita A–E e mantém B como alternativa correta, não branco",()=>{
 const [q]=auditStudyCatalog([template],"questoes");
 assert.equal(q.formato,"multipla_escolha");
 assert.equal(q.alternativas.length,5);
 assert.equal(q.alternativas[1].letra,"B");
 assert.equal(q.gabarito,"B");
 assert.ok(q.id.startsWith("questao-importada-"));
 assert.equal(q.materia,"Direito Penal");
 assert.equal(q.tema,"Inquérito policial");
 assert.ok(q.cap);
 const [server]=validateStudyContentBatch("questoes",[template]);
 assert.deepEqual(server,q);
 assert.deepEqual(validateStudyContentBatch("questoes",[q])[0],q);
});
test("gabaritos incompatíveis, alternativas incompletas e itens sem enunciado são recusados",()=>{
 assert.throws(()=>normalizeStudyQuestion({...template,gabarito:"Z"}),/gabarito A–E/);
 assert.throws(()=>normalizeStudyQuestion({...template,alternativas:["x","y"]}),/alternativas incompletas/);
 assert.throws(()=>auditStudyCatalog([{...template,enunciado:"",pergunta:"",texto:""}],"questoes"),/sem enunciado/);
});
test("identificadores derivados não mudam com reimportação do mesmo conteúdo",()=>{
 const a=normalizeStudyQuestion(template),b=normalizeStudyQuestion({...template});
 assert.equal(a.id,b.id);
 assert.equal(a.cap,b.cap);
 const c=normalizeStudyQuestion({...template,enunciado:template.enunciado+" Acrescente."});
 assert.notEqual(a.id,c.id);
});
test("C/E permanece independente de alternativas e do B reservado para branco",()=>{
 const source={id:"ce1",enunciado:"O enunciado da questão está correto.",gabarito:"C",cap:"D1",tema:"Direito"};
 const normalized=validateStudyContentBatch("questoes",[source])[0];
 assert.equal(normalized.gabarito,"C");
 assert.equal(normalized.alternativas,undefined);
 assert.equal(normalized.id,"ce1");
});
test("front-end tem respostas completas, sentinel diferente de B e histórico baseado no gabarito",()=>{
 const html=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(html,/function brancoDe\(q\)\{return alternativasDe\(q\)\.length\?'-':'B'\}/);
 assert.match(html,/function rotuloResposta\(q,valor\)/);
 assert.match(html,/class="qb-mc-choice/);
 assert.match(html,/data-ans="\$\{esc\(opt.letra\)\}"/);
 assert.match(html,/const q=S\.q\.get\(rd\.fila\[rd\.idx\]\),blank=brancoDe\(q\)/);
 assert.match(html,/const acertou=L===q\.gabarito,blank=brancoDe\(q\),isBlank=L===blank/);
 assert.match(html,/if\(isBlank\) rd\.brancos\+\+/);
 assert.match(html,/if\(isBlank\) r\.brancos=/);
 assert.match(html,/L===blank/);
 assert.match(html,/multiple&&k==='0'\?'-':k\.toUpperCase\(\)/);
 assert.match(html,/qb-mc-answers/);
 assert.match(html,/pcmg-multiple-choice\.css/);
});
test("resumo do Treinar considera a alternativa B respondida, e apenas '-' como branco",()=>{
 const w={};vm.runInNewContext(fs.readFileSync("public/claude-export/training-radial.js","utf8"),{window:w});
 const q=new Map([["mc1",normalizeStudyQuestion({...template,id:"mc1"})],["ce1",{id:"ce1",gabarito:"E"}]]);
 const r=new Map([["mc1",{tentativas:1,ultimaMarcada:"B",hist:[{m:"B",ok:true}]}],
  ["ce1",{tentativas:1,ultimaMarcada:"B",brancos:1,hist:[{m:"B",ok:false}]}]]);
 const stats=w.QBTrainingRadial.summary(["mc1","ce1"],q,r);
 assert.equal(stats.respondidas,2);
 assert.equal(stats.acertos,1);
 assert.equal(stats.brancos,1);
 assert.equal(stats.erros,0);
});
test("flashcard derivado da questão MC preserva as opções e interpreta o gabarito B",()=>{
 const w={};vm.runInNewContext(fs.readFileSync("public/claude-export/question-links.js","utf8"),{window:w});
 const q=normalizeStudyQuestion({...template,id:"mc1"});
 const card=w.QBQuestionLinks.card(q);
 assert.match(card.q,/Escolha a alternativa correta/);
 assert.match(card.q,/B\) A resposta correta/);
 assert.match(card.a.join(" "),/Alternativa B/);
 assert.equal(card.graded,true);
});
