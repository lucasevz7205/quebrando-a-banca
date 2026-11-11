import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {ARCHITECT_GEMINI_MODEL,buildGeminiRequest,extractGeminiResponse,requestGemini} from "../src/lib/architect-gemini.js";

const omni=fs.readFileSync("public/claude-export/omnistudy-ai.js","utf8");
const assistant=fs.readFileSync("public/claude-export/assistant.js","utf8");
const server=fs.readFileSync("src/lib/omnistudy-ai.js","utf8");
const estudiar=fs.readFileSync("src/routes/_authed/estudar.jsx","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const sw=fs.readFileSync("public/sw.js","utf8");
test("gemini requisita via API REST no servidor, com credencial somente em header e modo JSON quando necessário",async()=>{
 assert.equal(ARCHITECT_GEMINI_MODEL,"gemini-3.5-flash");
 assert.deepEqual(buildGeminiRequest({prompt:"Explique a Constituição.",response_json_schema:{type:"object"}}).generationConfig,
  {maxOutputTokens:8192,responseMimeType:"application/json"});
 let captures=[],calls=0;
 const fetcher=async(url,options)=>{
   calls++;captures.push({url,options});
   return {ok:true,async json(){return {candidates:[{content:{parts:[{text:'{"resultado":"correto"}'}]}}]}}};
 };
 const raw=await requestGemini({
   key:"test-only-key",prompt:"Verifique as notas Cornell",response_json_schema:{type:"object"},fetcher
 });
 assert.equal(JSON.parse(raw).resultado,"correto");
 assert.equal(calls,1);
 assert.match(captures[0].url,/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.5-flash:generateContent/);
 assert.equal(captures[0].options.headers["x-goog-api-key"],"test-only-key");
 assert.equal(captures[0].options.method,"POST");
 assert.ok(!captures[0].options.body.includes("test-only-key"));
 assert.equal(JSON.parse(captures[0].options.body).contents[0].parts[0].text,"Verifique as notas Cornell");
});
test("sem credencial Gemini não faz chamadas, não revela segredos e não cai silenciosamente no Base44",async()=>{
 let calls=0;
 const fetcher=async()=>{calls++;return {ok:true,json:async()=>({})}};
 await assert.rejects(requestGemini({key:"",prompt:"Teste",fetcher}),/Configure.*GEMINI_API_KEY/);
 assert.equal(calls,0);
 await assert.rejects(requestGemini({key:"secret",prompt:"Teste",fetcher:async()=>({
   ok:false,status:429,async json(){return {error:{message:"key secret: should not print",status:"RESOURCE_EXHAUSTED"}}}
 })}),e=>/Cota Gemini excedida/.test(e.message)&&!e.message.includes("secret"));
 assert.throws(()=>extractGeminiResponse({candidates:[]}),/não retornou texto/);
 assert.match(omni,/payload\.provider==="gemini"/);
 assert.match(omni,/Gemini ainda não conectado/);
 assert.match(server,/isGemini\?requestGemini|isGemini\s*\n\s*\? requestGemini/);
});
test("servidor só informa disponibilidade sem expor a chave, e cada tarefa aceita seleção de provedor",()=>{
 assert.match(server,/getArchitectAIStatus/);
 assert.match(server,/geminiConfigured:\s*Boolean\(secrets\.get\("GEMINI_API_KEY"\)\)/);
 assert.match(server,/middleware\(\[requireUser\]\)/);
 assert.equal((server.match(/provider:\s*z\.enum\(\["base44","gemini"\]\)/g)||[]).length,6);
 assert.match(server,/requestGemini\(\{key:secrets\.get\("GEMINI_API_KEY"\),\.\.\.options\}\)/);
 assert.match(estudiar,/architectProviderStatus/);
 assert.match(estudiar,/getArchitectAIStatus/);
 assert.match(omni,/global\.QBBridge\?\.ask\?\.\("architectProviderStatus"\)/);
 assert.match(omni,/architect-provider-bar/);
 assert.match(omni,/Google Gemini/);
});
test("atalho flutuante dá acesso ao Arquiteto, Cornell, Feynman, Flashcards, Pomodoro e análises locais",()=>{
 const menuItems=["tutor","cornell","feynman","flashcards","pomodoro","local"];
 for(const tab of menuItems)assert.ok(assistant.includes('data-architect-tool="'+tab+'"'),tab);
 assert.match(assistant,/qb-architect-menu/);
 assert.match(assistant,/O Arquiteto/);
 assert.match(shell,/if\(!account\.preview&&window\.QBAssistant\)window\.QBAssistant\.mount\(S\)/);
 assert.match(shell,/assistant\.js\?v=3/);
 assert.match(shell,/architect-launch\.css\?v=1/);
 assert.match(shell,/omnistudy-ai\.js\?v=3/);
 assert.match(sw,/qb-static-axon-v4/);
 assert.match(sw,/architect-launch\.css\?v=1/);
});
test("ação concreta do atalho abre a aba escolhida e preserva o assistente antigo",()=>{
 const menu={hidden:true},panel={hidden:true},launch={hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v}},input={focus(){this.focused=true}};
 const objs={"qb-architect-menu":menu,"qb-chat-panel":panel,"qb-chat-launch":launch,"qb-chat-input":input};
 let tab;
 const window={QBOmniStudy:{openStudio(next){tab=next}}};
 const document={getElementById(id){return objs[id]||null;}};
 vm.runInNewContext(assistant,{window,document,Date,Math});
 window.QBAssistant.toggleArchitectMenu();
 assert.equal(menu.hidden,false);
 assert.equal(launch.attrs["aria-expanded"],"true");
 window.QBAssistant.openArchitectTool("cornell");
 assert.equal(tab,"cornell");
 assert.equal(menu.hidden,true);
 window.QBAssistant.openArchitectTool("feynman");
 assert.equal(tab,"feynman");
 window.QBAssistant.openArchitectTool("local");
 assert.equal(panel.hidden,false);
 assert.equal(launch.hidden,true);
 assert.equal(input.focused,true);
});
test("UI mudou de nome mas preservou a chave local das folhas e conversas antigas",()=>{
 assert.match(omni,/name:"O Arquiteto"/);
 assert.match(omni,/const STORAGE_KEY = "qb_omnistudy_state_v2"/);
 assert.match(omni,/const state = loadState\(\)/);
 assert.match(omni,/intro\.text=defaultState\.messages\[0\]\.text/);
 assert.match(omni,/O Arquiteto · Estúdio de Aprendizagem Ativa/);
 assert.match(omni,/["']base44["']/);
});
