import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {canActivateStudyAccount,canEnableStudyAccount,validateStudyContentBatch} from "../src/lib/study-provisioning.js";
import {decodeStudyCatalog,auditStudyCatalog} from "../src/lib/study-import.js";

const server=fs.readFileSync("src/lib/study-admin.js","utf8");
const ui=fs.readFileSync("src/routes/_authed/contas.jsx","utf8");

test("O acesso inicial pode ser habilitado sem materiais somente por opção administrativa explícita",()=>{
 const blank={edital:false,questoes:false},ready={edital:true,questoes:true};
 assert.equal(canActivateStudyAccount(blank),false);
 assert.equal(canEnableStudyAccount(blank),false);
 assert.equal(canEnableStudyAccount(blank,true),true);
 assert.equal(canEnableStudyAccount(ready),true);
 assert.match(server,/allowEmpty:z\.boolean\(\)\.optional\(\)\.default\(false\)/);
 assert.match(server,/canEnableStudyAccount\(materials,data\.allowEmpty\)/);
 assert.match(server,/existing\.some\(row=>row\.id!==account\.id\)/);
 assert.match(ui,/Habilitar acesso \(sem questões\)/);
});
test("Importação administrativa aditiva é permitida em projeto já ativo sem sobrescrever histórico",()=>{
 assert.match(server,/const documents=validateStudyContentBatch\(data\.collection,data\.documents\)/);
 assert.doesNotMatch(server,/if\(account\.active\)\s*\{\s*throw new Error\("Para importar novos materiais/);
 assert.match(server,/if\(existing\.length\)\{skipped\+\+;continue;\}/);
 assert.match(server,/study_account_id:account\.id/);
 assert.match(ui,/accounts\.filter\(a=>!a\.pending\)/);
 assert.match(ui,/allowEmpty:needsContent/);
 assert.match(ui,/Importação concluída/);
});
test("importador reconhece lista, arquivos organizados por coleção e mapas de IDs",()=>{
 const rows=[{id:"pcmg-1",enunciado:"A regra correta...",gabarito:"C"}];
 for(const input of [rows,{questoes:rows},{records:rows},{documents:rows},{items:rows}]){
  assert.deepEqual(decodeStudyCatalog(input,"questoes"),rows);
 }
 assert.deepEqual(decodeStudyCatalog({"pcmg-1":{enunciado:"A regra correta...",gabarito:"C"}},"questoes"),rows);
 assert.deepEqual(auditStudyCatalog(rows,"questoes"),rows);
 assert.deepEqual(validateStudyContentBatch("questoes",rows),rows);
});
test("gabaritos e formatos incompatíveis são rejeitados, nunca convertidos silenciosamente",()=>{
 const q={id:"pcmg-a",enunciado:"Questão com alternativas",gabarito:"A",alternativas:["X","Y","Z","W"]};
 assert.throws(()=>auditStudyCatalog([q],"questoes"),/gabarito incompatível/);
 assert.throws(()=>validateStudyContentBatch("questoes",[q]),/C\/E/);
 assert.throws(()=>auditStudyCatalog([{...q,gabarito:"C"}, {...q,gabarito:"E"}],"questoes"),/Identificador repetido/);
 assert.throws(()=>auditStudyCatalog([{id:"x",gabarito:"C"}],"questoes"),/sem enunciado/);
 assert.throws(()=>decodeStudyCatalog({questoes:{x:{}}},"questoes"),/não reconhecido/);
});
test("vínculo usa o ID real de login e não confunde apelido com conta autenticada",()=>{
 assert.match(server,/const candidate=await entities\.User\.get\(data\.userId\)/);
 assert.match(server,/candidate\.role!=="user"/);
 assert.match(server,/account\.user_id/);
 assert.match(server,/await entities\.StudyAccount\.update\(account\.id/);
});
