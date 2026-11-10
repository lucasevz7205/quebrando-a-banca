import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import postcss from "postcss";

const files={
  train:fs.readFileSync("public/claude-export/training-radial.js","utf8"),
  area:fs.readFileSync("public/claude-export/area-radial.js","utf8"),
  areaCss:fs.readFileSync("public/claude-export/area-radial.css","utf8"),
  shell:fs.readFileSync("src/components/qb/study-shell.html","utf8")
};
const read=name=>JSON.parse(fs.readFileSync("scripts/claude-seed/"+name+".json"));
function get(module){
 const w={};vm.runInNewContext(files[module],{window:w},{filename:module+".js"});
 return module==="train"?w.QBTrainingRadial:w.QBAreaRadial;
}
const train=get("train"),area=get("area");
const questions=new Map(read("questoes").map(x=>[x.id,x]));
const topics=new Map(read("edital").map(x=>[x.id,x]));
const responses=new Map(read("respostas").map(x=>[x.qid||x.id,x]));
const browser={};
vm.runInNewContext(fs.readFileSync("public/claude-export/question-links.js","utf8"),{window:browser});
const model=train.build({questions,topics,responses,index:browser.QBQuestionLinks.build(questions,topics,new Map())});
function historical(ids){
 const uniq=[...new Set(ids)],out={total:0,respondidas:0,acertos:0};
 for(const id of uniq){
   const q=questions.get(id);if(!q||q.foraNivel||/^SIM/i.test(q.cap||""))continue;
   const r=responses.get(id);out.total++;
   if(!r?.tentativas)continue;
   out.respondidas++;
   const jaErrou=(r.erros||0)>0||(r.brancos||0)>0||(r.hist||[]).some(h=>!h.ok);
   if(r.ultimaMarcada===q.gabarito&&!jaErrou)out.acertos++;
 }
 return out;
}
test("percentual do radial corresponde exatamente ao acerto consolidado de Desempenho",()=>{
 const expected=historical([...questions.keys()]);
 assert.equal(model.stats.total,expected.total);
 assert.equal(model.stats.respondidas,expected.respondidas);
 assert.equal(model.stats.acertos,expected.acertos);
 assert.equal(model.stats.acertos+model.stats.erros+model.stats.brancos,model.stats.respondidas);
 assert.equal(Math.round(train.percentages(model.stats).acertos),Math.round(100*expected.acertos/expected.respondidas));
 assert.match(files.shell,/const ledger=treinoRadialDados\(\),gm=new Map\(\)/);
 assert.match(files.shell,/const T=\{total:ledger.stats.total,resp:ledger.stats.respondidas,ok:ledger.stats.acertos\}/);
});
test("erros e brancos históricos continuam impedindo acerto consolidado após acerto recente",()=>{
 const q=new Map([
  ["a",{id:"a",cap:"A",gabarito:"C"}],["b",{id:"b",cap:"A",gabarito:"E"}],
  ["c",{id:"c",cap:"SIM-AB",gabarito:"C"}],["d",{id:"d",cap:"A",foraNivel:true,gabarito:"C"}],
  ["e",{id:"e",cap:"A",gabarito:"E"}]
 ]);
 const r=new Map([
  ["a",{tentativas:3,ultimaMarcada:"C",erros:1,hist:[{m:"E",ok:false},{m:"C",ok:true}]}],
  ["b",{tentativas:2,ultimaMarcada:"E",brancos:1,hist:[{m:"B",ok:false},{m:"E",ok:true}]}],
  ["c",{tentativas:1,ultimaMarcada:"C"}],["d",{tentativas:1,ultimaMarcada:"C"}],
  ["e",{tentativas:1,ultimaMarcada:"E",hist:[{m:"E",ok:true}]}]
 ]);
 const s=train.summary(["a","b","c","d","e"],q,r);
 assert.equal(s.total,3);
 assert.equal(s.respondidas,3);
 assert.equal(s.acertos,1);
 assert.equal(s.erros,2);
 assert.equal(Math.round(train.percentages(s).acertos),33);
});
test("cada matéria usa os mesmos capítulos e a mesma regra do Histórico",()=>{
 const byOrder=[...topics.values()].sort((a,b)=>(a.ordem||0)-(b.ordem||0));
 const owners=new Map();
 for(const t of byOrder)for(const cap of t.caps||[])if(!owners.has(cap))owners.set(cap,t.sigla);
 for(const matter of model.matters){
   const ids=[...questions.values()].filter(q=>(owners.get(q.cap)||"_outros")===matter.id).map(q=>q.id);
   const expected=historical(ids);
   assert.equal(matter.stats.total,expected.total,matter.id);
   assert.equal(matter.stats.respondidas,expected.respondidas,matter.id);
   assert.equal(matter.stats.acertos,expected.acertos,matter.id);
 }
});
test("shell liga as cinco áreas superiores ao radial sem quebrar treinar e a navegação antiga",()=>{
 for(const tab of ["painel","edital","estudo","historico","simulado"])assert.match(files.shell,new RegExp("'"+tab+"'"));
 assert.match(files.shell,/area-radial\.js\?v=1/);
 assert.match(files.shell,/area-radial\.css\?v=1/);
 assert.match(files.shell,/radial=\['painel','edital','estudo','historico','simulado'\]/);
 assert.match(files.shell,/S.areaHub=radialArea\?\{area:radialArea,level:'main',matter:null,tool:null,page:0\}:null/);
 assert.match(files.shell,/function configAreaRadial\(\)/);
 assert.match(files.shell,/function selecionarAreaRadial\(item\)/);
 assert.match(files.shell,/function voltarAreaRadial\(\)/);
 assert.match(files.shell,/function abrirAreaOriginal\(\)/);
 assert.match(files.shell,/QBAreaRadial\?\.render\(config\)/);
 assert.match(files.shell,/QBAreaRadial\?\.wire\(main,config,/);
 assert.match(files.shell,/S.areaHub.area==='simulado'&&\(S.studyAccount\|\|simLS\('obj'\)\|\|simLS\('disc'\)\)/);
 assert.match(files.shell,/function viewPainel\(\)/);
 assert.match(files.shell,/function viewEdital\(\)/);
 assert.match(files.shell,/function viewSimulado\(\)/);
 assert.match(files.shell,/function viewCartoes\(\)/);
 assert.match(files.shell,/function viewMapa\(\)/);
});
test("matéria e assunto do Edital abrem o tópico original com ID e sua classificação",()=>{
 assert.match(files.shell,/option\('m:'\+g.sigla,g.nome/);
 assert.match(files.shell,/option\('t:'\+t.id/);
 assert.match(files.shell,/S.abertos.add\(topic.sigla\);setView\('edital'\)/);
 assert.match(files.shell,/document.getElementById\('tp-'\+topic.id\)/);
 assert.match(files.shell,/id="tp-\$\{esc\(t.id\)\}"/);
 assert.match(files.shell,/topicStats=t=>window.QBTrainingRadial.summary/);
});
test("Estudo radial conecta mapas, flashcards, pegadinhas e materiais aos IDs existentes",()=>{
 assert.match(files.shell,/option\('tool:mapa'/);
 assert.match(files.shell,/option\('tool:cartoes'/);
 assert.match(files.shell,/option\('tool:pegadinhas'/);
 assert.match(files.shell,/option\('tool:conteudo'/);
 assert.match(files.shell,/S.mapaId=topic.id/);
 assert.match(files.shell,/S.cartId=topic.id/);
 assert.match(files.shell,/S.abertos.add\('pgt:'\+topic.id\)/);
 assert.match(files.shell,/data-content-topics="\$\{esc\(\(m.topicos\|\|\[\]\).join\('\|'\)\)\}"/);
 assert.match(files.shell,/el.dataset.contentTopics.split\('\|'\).includes\(topic.id\)/);
});
test("Simulado abre configuração sem começar cronômetro e respeita simulado em andamento",()=>{
 assert.match(files.shell,/target==='objective'\?'#sim-obj'/);
 assert.match(files.shell,/target==='discursive'\?'#sim-disc'/);
 assert.match(files.shell,/id="qb-sim-history"/);
 assert.match(files.shell,/id="qb-sim-composition"/);
 assert.match(files.shell,/if\(target==='history'\)\{open\(area==='simulado'\?'simulado':'historico'\)/);
 assert.match(files.shell,/if\(so&&!so.fim\) return viewSimObj\(so\)/);
 assert.match(files.shell,/if\(sd&&!sd.fim\) return viewSimDisc\(sd\)/);
});
test("radial mantém anel vivo, paginação, setores e dados de desempenho no centro",()=>{
 const config={area:"edital",level:"topics",title:"Português",parent:true,centerTitle:"Português",
  stats:{total:50,respondidas:40,acertos:30,erros:8,brancos:2},
  quickSelect:true,items:Array.from({length:14},(_,i)=>({id:"tp"+i,name:"Tópico "+i,caption:"Edital",icon:"◇"}))};
 const html=area.render(config);
 assert.equal((html.match(/data-area-item="/g)||[]).length,6);
 assert.equal((html.match(/data-ring-sector="/g)||[]).length,6);
 assert.match(html,/qb-radial-annulus/);
 assert.match(html,/qb-radial-flow/);
 assert.match(html,/data-area-bar/);
 assert.match(html,/75%/);
 assert.match(html,/data-area-select/);
 assert.match(html,/data-area-back/);
 assert.match(html,/data-area-original/);
 assert.match(html,/Página 1 de 3/);
 assert.match(area.render({...config,page:2}),/Página 3 de 3/);
 assert.equal((area.render({...config,page:2}).match(/data-area-item="/g)||[]).length,2);
 assert.equal(area.rate({respondidas:0,acertos:0}),null);
});
test("valores oriundos do edital são escapados e nenhum registro é alterado pelo menu",()=>{
 const html=area.render({area:"estudo",title:"Teste",items:[
   {id:"unsafe",name:"<script>alert(1)</script>",caption:'A "B" & C'}
 ]});
 assert.doesNotMatch(html,/<script>/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&amp;/);
 for(const code of [files.area,files.areaCss])assert.doesNotMatch(code,/asServiceRole|writeDocument|setDoc|fetch\(/);
 postcss.parse(files.areaCss,{from:"area-radial.css"});
 assert.match(files.areaCss,/@media\(max-width:500px\)/);
 assert.match(files.areaCss,/\.qb-area-core/);
});
test("teclado e clique em setor usam o mesmo fluxo AXON e são descartados no retorno",()=>{
 const events={},calls=[],index={};
 const nodes=[0,1].map(i=>({
  dataset:{areaItem:"p"+i,radialIndex:String(i)},disabled:false,
  classList:{toggle(){}},focus(){calls.push("focus:"+i)},
  hasAttribute:k=>k==="data-area-item",
  closest(q){return q.includes("qb-area-node")||q.includes("data-area-item")?this:null}
 }));
 const sectors=[0,1].map(i=>({dataset:{ringSector:String(i)},classList:{toggle(){}}}));
 const section={
  querySelector:sel=>sel==="[data-area-title]"?{textContent:"Navegação"}:null,
  querySelectorAll:sel=>sel===".qb-area-node"?nodes:sel===".qb-radial-sector"?sectors:[],
  contains:()=>true,addEventListener:(key,cb)=>events[key]=cb
 };
 const win={QBAxonRingFlow:{mount:()=>({focus(){},select(_b,go){calls.push("axon");go()},dispose(){calls.push("dispose")}})}};
 vm.runInNewContext(files.area,{window:win});
 const cleanup=win.QBAreaRadial.wire({querySelector:()=>section},
  {area:"edital",parent:true,items:[{id:"p0",name:"A"},{id:"p1",name:"B"}]},
  {onSelect:item=>calls.push("selected:"+item.id),onBack:()=>calls.push("back")});
 events.click({target:nodes[0]});
 assert.deepEqual(calls.slice(0,3),["axon","dispose","selected:p0"]);
 cleanup();
});
