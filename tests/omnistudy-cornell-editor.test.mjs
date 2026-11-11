import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { normalizeCornellReview } from "../src/lib/cornell-review.js";

const client=fs.readFileSync("public/claude-export/omnistudy-cornell.js","utf8");
const main=fs.readFileSync("public/claude-export/omnistudy-ai.js","utf8");
const server=fs.readFileSync("src/lib/omnistudy-ai.js","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const sw=fs.readFileSync("public/sw.js","utf8");

function api() {
 const window={};
 vm.runInNewContext(client,{window,Date,Math});
 return window.QBOmniCornell;
}
const proposal={
 verdict:"Correção editorial preliminar.",
 issues:[{field:"notes",type:"factual",description:"Corrigir alcance da norma.",
          sourceExcerpt:"O poder emana do povo"}],
 suggested:{cues:["Quem detém o poder?","Como se exerce?"],notes:"O poder emana do povo.",summary:"Titularidade popular."}
};
test("Cornell mantém folhas antigas e permite criar uma folha manual sem chamar IA",()=>{
 const model=api();
 const old={id:"cornell-seed-1",title:"Folha existente",subject:"Direito",cues:["Q?"],notes:"texto original",summary:"síntese"};
 const state={subject:"Direito",cornellNotes:[old],selectedCornellId:old.id};
 const created=model.newManual(state);
 assert.equal(state.cornellNotes.length,2);
 assert.equal(state.cornellNotes[1].notes,"texto original");
 assert.equal(state.selectedCornellId,created.id);
 assert.equal(created.origin,"manual");
 model.updateNote(created,"title","Minha folha");
 model.updateNote(created,"cues","Qual é a regra?\nQual a exceção?");
 model.updateNote(created,"notes","Anotações escritas por mim sobre um instituto.");
 model.updateNote(created,"summary","Minha síntese pessoal.");
 model.updateNote(created,"referenceText","Texto original da fonte.");
 assert.equal(created.title,"Minha folha");
 assert.equal(created.cues.length,2);
 assert.match(created.notes,/escritas por mim/);
 assert.equal(created.referenceText,"Texto original da fonte.");
 assert.equal(state.cornellNotes[1].notes,"texto original");
});
test("interface mostra criação manual, geração IA, digitação, fonte e aprovação de correção",()=>{
 const model=api();
 const state={subject:"Penal",cornellNotes:[{id:"c1",title:"Minha nota",subject:"Penal",cues:["Regra?"],notes:"Escrevi minha própria anotação.",summary:"Síntese"}],
  selectedCornellId:"c1",coverCornellNotes:false};
 const body={html:"",set innerHTML(s){this.html=s},get innerHTML(){return this.html},
  querySelector(){return null},querySelectorAll(){return []}};
 const saved=[];
 model.render({state,body,saveState:()=>saved.push(true),callAI:async()=>{throw Error("Não deveria chamar IA")}});
 for(const term of [
 "Nova folha manual","Gerar folha Cornell com IA","omni-cornell-title-edit",
 "omni-cornell-cues-edit","omni-cornell-notes-edit","omni-cornell-summary-edit",
 "omni-cornell-source-edit","Conferir e corrigir com IA",
 "Salva automaticamente neste navegador","Sem fonte, a avaliação não é verificação factual."
 ])assert.ok(body.html.includes(term),term);
 assert.ok(body.html.includes("Escrevi minha própria anotação."));
 assert.equal(saved.length,0);
});
test("edição invalida parecer anterior, proposta só é aplicada com aprovação explícita e pode ser desfeita",()=>{
 const model=api();
 const note={id:"u1",title:"Minha nota",subject:"Direito",cues:["Antiga?"],notes:"Antigo texto.",summary:"Resumo antigo.",referenceText:""};
 const original=model.capture(note);
 note.cornellReview={...proposal,basedOn:original};
 assert.equal(note.notes,"Antigo texto.");
 assert.equal(model.applySuggestion(note),true);
 assert.equal(note.notes,"O poder emana do povo.");
 assert.equal(note.cues.length,2);
 assert.equal(model.undoSuggestion(note),true);
 assert.equal(note.notes,"Antigo texto.");
 assert.equal(note.summary,"Resumo antigo.");
 note.cornellReview={...proposal,basedOn:model.capture(note)};
 model.updateNote(note,"notes","Texto novo escrito manualmente.");
 assert.equal(note.cornellReview,undefined);
 assert.equal(model.applySuggestion(note),false);
 assert.equal(note.notes,"Texto novo escrito manualmente.");
});
test("parecer sem fonte jamais afirma ter certificado fatos",()=>{
 const r=normalizeCornellReview(proposal,"");
 assert.equal(r.referenceMode,"revisao_preliminar");
 assert.equal(r.matchedExcerpts,0);
 assert.equal(r.issues[0].sourceExcerpt,"");
 assert.match(r.notice,/NÃO é verificação factual/);
 assert.equal(r.suggested.notes,"O poder emana do povo.");
});
test("parecer com fonte exige trecho literal verificável e não certifica vigência",()=>{
 const ref="Constituição, artigo primeiro. O poder emana do povo, que o exerce nos termos constitucionais. ".repeat(2);
 const correct=normalizeCornellReview(proposal,ref);
 assert.equal(correct.referenceMode,"comparacao_com_fonte");
 assert.equal(correct.matchedExcerpts,1);
 assert.equal(correct.issues[0].sourceExcerpt,"O poder emana do povo");
 assert.match(correct.notice,/Não certifica a autenticidade da fonte/);
 const wrong=normalizeCornellReview({...proposal,issues:[{...proposal.issues[0],sourceExcerpt:"Essa frase não está na fonte."}]},ref);
 assert.equal(wrong.matchedExcerpts,0);
 assert.equal(wrong.issues[0].sourceExcerpt,"");
});
test("resposta inválida da IA é rejeitada e não há falsificação de verificação",()=>{
 assert.throws(()=>normalizeCornellReview("lixo"),/não retornou um parecer/);
 assert.throws(()=>normalizeCornellReview({verdict:"Tudo certo",issues:[],suggested:{}}),/incompleta/);
 assert.throws(()=>normalizeCornellReview({...proposal,suggested:{cues:[],notes:"",summary:""}}),/sem notas ou perguntas/);
 assert.match(main,/payload\.task === "review-cornell" \|\| payload\.task === "summarize-cornell"/);
 assert.match(main,/throw new Error\("IA Cornell exige conexão/);
});
test("integração está conectada ao servidor autenticado e usa versão nova publicada",()=>{
 assert.match(server,/task: z\.literal\("review-cornell"\)/);
 assert.match(server,/normalizeCornellReview\(raw,referenceText\)/);
 assert.match(server,/middleware\(\[requireUser\]\)/);
 assert.match(server,/TEXTO-FONTE INFORMADO/);
 assert.match(shell,/omnistudy-cornell\.js\?v=1/);
 assert.match(shell,/omnistudy-cornell\.css\?v=1/);
 assert.match(shell,/omnistudy-ai\.js\?v=2/);
 assert.match(sw,/qb-static-axon-v3/);
 assert.match(sw,/omnistudy-cornell\.js\?v=1/);
 assert.match(sw,/omnistudy-ai\.js\?v=2/);
});
