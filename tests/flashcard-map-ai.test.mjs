import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {assertCardResponse,normalizeFlashcardAi,resolveMapOrigin} from "../src/lib/flashcard-support.js";
const client={window:{}};
vm.runInNewContext(fs.readFileSync("public/claude-export/map-origin.js","utf8"),client);
const resolveBrowser=client.window.QBMapLinks.resolve;
const map={
  centro:"Direito Administrativo",
  ramos:[
    {id:"competencia",t:"Competência administrativa",n:"É irrenunciável.",f:[
      {id:"delegacao",t:"Delegação administrativa",n:"Transferência do exercício, não da titularidade.",x:{e:"A delegação pode ser revogada."}},
      {id:"avocacao",t:"Avocação administrativa",n:"Excepcional e temporária.",x:{e:"Exige justificativa."}}
    ]}
  ]
};
test("Explicit node ID links exactly and browser matches server",()=>{
  const c={q:"Quando ocorre delegação?",mapaNoId:"delegacao",a:["Exercício sem transferência da titularidade"]};
  const expected={status:"exact",path:"0.0",nodeId:"delegacao",title:"Delegação administrativa"};
  assert.deepEqual(resolveMapOrigin(map,c),expected);
  assert.deepEqual(JSON.parse(JSON.stringify(resolveBrowser(map,c))),expected);
});
test("Explicit path links exactly, even if node lacks its own ID",()=>{
  const c={mapaPath:"0.1",q:"Que significa avocação?",a:["Excepcional"]};
  assert.equal(resolveBrowser(map,c).status,"exact");
  assert.equal(resolveBrowser(map,c).path,"0.1");
});
test("Missing or invalid origin never pretends to be exact",()=>{
  const without={q:"Análise não relacionada a nenhum ramo",a:["Outra regra"]};
  assert.equal(resolveBrowser(map,without).status,"topic");
  assert.equal(resolveBrowser(map,{...without,mapaNoId:"unknown"}).status,"topic");
  assert.equal(resolveBrowser(null,without).status,"unavailable");
});
test("Ambiguous node IDs do not create false exact origin",()=>{
  const m={ramos:[{id:"duplicated",t:"Primeiro"},{id:"duplicated",t:"Segundo"}]};
  assert.notEqual(resolveBrowser(m,{mapaNoId:"duplicated",q:"nada"}).status,"exact");
});
test("Corrections are suggestions in controlled JSON and do not auto-schedule",()=>{
  const sample='{"veredito":"parcial","acertou":["Competência"],"faltou":["Revogação"],"errado":[],"comentario":"Complemente o fundamento."}';
  assert.deepEqual(normalizeFlashcardAi(sample),{
    veredito:"parcial",acertou:["Competência"],faltou:["Revogação"],errado:[],comentario:"Complemente o fundamento."
  });
  assert.throws(()=>normalizeFlashcardAi('{"veredito":"aprovado"}'),/classificação/);
  assert.throws(()=>assertCardResponse(" "),/2000/);
  assert.equal(assertCardResponse("C"),"C");
});
test("Bridge requires own authenticated server lookup and usage cap, never browser-supplied answers",()=>{
  const server=fs.readFileSync("src/lib/flashcard-ai.js","utf8");
  const markup=fs.readFileSync("src/components/qb/study-shell.html","utf8");
  assert.match(server,/middleware\(\[requireUser\]\)/);
  assert.match(server,/scope:\{study_account_id:id\}/);
  assert.match(server,/const card=await trustedCard\(storage,data.key\)/);
  assert.match(server,/const MAX_PER_DAY=8,COOLDOWN_MS=20000/);
  assert.match(server,/FlashcardAIUsage/);
  assert.match(markup,/QBBridge\.ask\('correctFlashcard',\{key:k,response:resp\}\)/);
  assert.doesNotMatch(markup,/IA\.json\(/);
  assert.match(markup,/data-voltar-flash/);
  assert.match(markup,/data-map-node/);
});
test('A questão ligada a um nó tem comentário oculto até abertura e volta ao flashcard',()=>{
 const shell=fs.readFileSync('src/components/qb/study-shell.html','utf8');
 assert.match(shell,/ligadasAoNo=\(n\.x\?\.questaoIds\|\|\[\]\)/);
 assert.match(shell,/<details class="qb-qsource-item"><summary>\$\{esc\(q\.enunciado\)\}<\/summary>/);
 assert.match(shell,/Gabarito: \$\{q\.gabarito==='C'\?'Certo':'Errado'\}/);
 assert.match(shell,/data-qcard/);
 assert.match(shell,/data-voltar-flash/);
});
