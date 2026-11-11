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
 const [client]=auditStudyCatalog(rows,"questoes");
 const [server]=validateStudyContentBatch("questoes",rows);
 assert.equal(client.id,"pcmg-1");
 assert.equal(client.gabarito,"C");
 assert.equal(client.cap,server.cap);
 assert.equal(client.materia,server.materia);
});
test("importa múltipla escolha A–E de forma explícita, sem confundir alternativa B com branco",()=>{
 const q={id:"pcmg-a",enunciado:"Questão com quatro alternativas",gabarito:"B",
  alternativas:["A afirmação inicial","Resposta correta","Outra interpretação","Alternativa incorreta"]};
 const [normalized]=auditStudyCatalog([q],"questoes");
 assert.equal(normalized.gabarito,"B");
 assert.equal(normalized.formato,"multipla_escolha");
 assert.equal(normalized.alternativas.length,4);
 assert.equal(normalized.alternativas[1].letra,"B");
 assert.equal(validateStudyContentBatch("questoes",[q])[0].alternativas[1].texto,"Resposta correta");
 assert.throws(()=>auditStudyCatalog([{...q,gabarito:"Z"}],"questoes"),/gabarito A–E/);
 assert.throws(()=>auditStudyCatalog([{...q,alternativas:["apenas uma"]}],"questoes"),/alternativas incompletas/);
 assert.throws(()=>auditStudyCatalog([{...q,gabarito:"C"}, {...q,gabarito:"B"}],"questoes"),/Identificador repetido/);
 assert.throws(()=>auditStudyCatalog([{id:"x",gabarito:"C"}],"questoes"),/sem enunciado/);
 assert.throws(()=>decodeStudyCatalog({questoes:{x:{}}},"questoes"),/esperado uma lista/);
});
test("vínculo usa o ID real de login e não confunde apelido com conta autenticada",()=>{
 assert.match(server,/const candidate=await entities\.User\.get\(data\.userId\)/);
 assert.match(server,/candidate\.role!=="user"/);
 assert.match(server,/account\.user_id/);
 assert.match(server,/await entities\.StudyAccount\.update\(account\.id/);
});
