import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import postcss from "postcss";
const source=fs.readFileSync("public/claude-export/training-radial.js","utf8");
const css=fs.readFileSync("public/claude-export/training-radial.css","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const read=name=>JSON.parse(fs.readFileSync("scripts/claude-seed/"+name+".json","utf8"));
function moduleFor(extra={}){
 const browser={...extra};
 vm.runInNewContext(source,{window:browser},{filename:"training-radial.js"});
 return browser.QBTrainingRadial;
}
const engine=moduleFor();
const qs=read("questoes"),ts=read("edital"),rs=read("respostas");
const questions=new Map(qs.map(q=>[q.id,q]));
const topics=new Map(ts.map(t=>[t.id,t]));
const responses=new Map(rs.map(r=>[r.qid||r.id,r]));
const browser={};
vm.runInNewContext(fs.readFileSync("public/claude-export/question-links.js","utf8"),{window:browser});
const index=browser.QBQuestionLinks.build(questions,topics,new Map());
const real=engine.build({questions,topics,responses,index});
const cats=t=>t.reduce((s,x)=>s.concat(x.questionIds),[]);
test("barra usa acertos consolidados do Histórico, distinguindo brancos e pendentes",()=>{
 const q=new Map([
   ["C",{id:"C",gabarito:"C"}],["E",{id:"E",gabarito:"C"}],
   ["B",{id:"B",gabarito:"E"}],["P",{id:"P",gabarito:"C"}],
   ["H",{id:"H",gabarito:"E"}]
 ]);
 const r=new Map([
   ["C",{tentativas:3,ultimaMarcada:"C",hist:[{m:"C",ok:true},{m:"C",ok:true}]}],
   ["E",{tentativas:1,ultimaMarcada:"E"}],
   ["B",{tentativas:1,ultimaMarcada:"B"}],
   ["H",{tentativas:1,hist:[{m:"E"}]}]
 ]);
 const s=engine.summary(["C","E","B","P","H","C"],q,r);
 assert.deepEqual(JSON.parse(JSON.stringify(s)),{
   total:5,respondidas:4,acertos:2,erros:1,brancos:1,pendentes:1
 });
 const p=engine.percentages(s);
 assert.equal(p.acertos,50);
 assert.equal(p.erros,25);
 assert.equal(p.brancos,25);
 assert.equal(engine.percentages(engine.summary(["P"],q,r)).acertos,0);
});
test("agregação usa o edital e preserva matérias, tópicos e IDs originais",()=>{
 assert.ok(real.matters.length>=9,"deve listar as matérias efetivas do edital");
 assert.equal(real.totalQuestions,questions.size);
 const eligible=qs.filter(q=>!/^SIM/i.test(q.cap||"")&&!q.foraNivel).length;
 assert.equal(real.stats.total,eligible,"questões compartilhadas não se repetem; SIM e foraNivel ficam excluídos");
 assert.equal(real.stats.respondidas+real.stats.pendentes,eligible);
 assert.equal(real.stats.acertos+real.stats.erros+real.stats.brancos,real.stats.respondidas);
 assert.ok(real.stats.respondidas>0,"o banco de respostas deve influenciar o índice");
 const listed=new Set(real.matters.flatMap(m=>cats(m.topics)));
 assert.equal(listed.size,questions.size,"cada questão deve poder ser encontrada em alguma matéria");
 const da=real.matters.find(m=>m.id==="DA");
 assert.ok(da?.topics.length>10);
 assert.ok(da.topics.some(t=>t.questionIds.length>0));
 assert.ok(da.available>0);
 for(const m of real.matters){
   assert.equal(m.stats.total,new Set(m.statIds.filter(id=>!questions.get(id)?.foraNivel&&!/^SIM/i.test(questions.get(id)?.cap||""))).size);
   for(const t of m.topics){
     assert.ok(t.id);
     assert.ok(t.title);
     assert.equal(t.stats.total,new Set(t.statIds.filter(id=>!questions.get(id)?.foraNivel&&!/^SIM/i.test(questions.get(id)?.cap||""))).size);
   }
 }
});
test("questão sem capítulo conhecido fica visível como Outros capítulos sem vínculo inventado",()=>{
 const q=new Map([
   ["q1",{id:"q1",cap:"A",gabarito:"C"}],
   ["q2",{id:"q2",cap:"Z",capNome:"Capítulo externo",gabarito:"E"}]
 ]);
 const t=new Map([["topic1",{id:"topic1",sigla:"LP",materia:"Português",caps:["A"],titulo:"Concordância",num:"1",ordem:1}]]);
 const x={byTopic:new Map([["topic1",[q.get("q1")]]])};
 const model=engine.build({questions:q,topics:t,responses:new Map(),index:x});
 assert.equal(model.stats.total,2);
 const unknown=model.matters.find(m=>m.id==="_outros");
 assert.ok(unknown);
 assert.equal(unknown.questionIds.length,1);
 assert.equal(unknown.topics[0].id,"cap:Z");
 assert.equal(unknown.topics[0].title,"Capítulo externo");
});
test("primeira órbita exibe no máximo seis matérias, com páginas e índice central",()=>{
 const first=engine.render(real,{});
 const nodeCount=(first.match(/class="qb-radial-node qb-train-node"/g)||[]).length;
 assert.equal(engine.pageSize,6);
 assert.equal(nodeCount,6);
 assert.equal((first.match(/data-ring-sector=/g)||[]).length,nodeCount);
 assert.match(first,/data-train-screen="subjects"/);
 assert.match(first,/data-train-matter="/);
 assert.match(first,/data-train-page="1"/);
 assert.match(first,/Próxima →/);
 assert.match(first,/qb-train-core-bar/);
 assert.match(first,/qb-train-bar-correct/);
 assert.match(first,/qb-train-bar-wrong/);
 assert.match(first,/qb-train-bar-blank/);
 assert.match(first,/SEU DESEMPENHO/);
 assert.match(first,/data-train-default="/);
 assert.match(first,/data-train-classic/);
 assert.match(first,/data-train-review/);
 assert.match(first,/data-train-errors/);
 assert.doesNotMatch(first,/data-train-topic="/);
 const next=engine.render(real,{page:1});
 assert.match(next,/data-train-page="0"/);
 assert.equal((next.match(/class="qb-radial-node qb-train-node"/g)||[]).length,real.matters.length-6);
});
test("segunda órbita usa assuntos com questões, sem páginas lotadas de nós vazios",()=>{
 const mat=real.matters.find(m=>m.id==="DA");
 const eligible=mat.topics.filter(t=>t.questionIds.length);
 assert.ok(eligible.length>6);
 const first=engine.render(real,{matter:"DA",page:0});
 const second=engine.render(real,{matter:"DA",page:1});
 assert.match(first,/data-train-screen="topics"/);
 assert.match(first,/data-train-topic="/);
 assert.match(first,/data-train-back/);
 assert.match(first,/data-train-topic-select/);
 assert.match(first,/Ir direto ao assunto/);
 assert.match(first,/assuntos do edital ainda não têm questões/);
 assert.equal((first.match(/data-train-topic="/g)||[]).length,6);
 assert.equal((second.match(/data-train-topic="/g)||[]).length,6);
 assert.notEqual(first.match(/data-train-topic="([^"]+)"/)?.[1],
   second.match(/data-train-topic="([^"]+)"/)?.[1]);
 const allSeen=new Set();
 for(let p=0;p<Math.ceil(eligible.length/6);p++){
   const html=engine.render(real,{matter:"DA",page:p});
   for(const [,id] of html.matchAll(/data-train-topic="([^"]+)"/g))allSeen.add(id);
 }
 assert.equal(allSeen.size,eligible.length);
 for(const id of allSeen) assert.ok(eligible.some(t=>t.id===id));
});
test("nós com dados do edital são escapados como HTML, não interpretados",()=>{
 const malicious='Assunto <script>window.pwned=1</script> & "teste"';
 const q=new Map([["x",{id:"x",cap:"A",gabarito:"C"}]]);
 const topics=new Map([["x",{id:"x",sigla:"ZZ",materia:malicious,titulo:malicious,ordem:1,caps:["A"]}]]);
 const model=engine.build({questions:q,topics,responses:new Map(),index:{byTopic:new Map([["x",[q.get("x")]]])}});
 for(const html of [engine.render(model),engine.render(model,{matter:"ZZ"})]){
   assert.doesNotMatch(html,/<script>/);
   assert.match(html,/&lt;script&gt;/);
   assert.match(html,/&amp;/);
 }
});
test("hover e foco mostram métricas específicas no centro sem mudar o histórico",()=>{
 const focus=[],calls=[],events=new Map(),nodes=[],segments=[];
 const metrics=Array.from({length:3},()=>({style:{width:""}}));
 const els=new Map();
 function el(){return {textContent:"",attrs:{},setAttribute(k,v){this.attrs[k]=v}}}
 for(const sel of ["[data-train-core-title]","[data-train-percent]","[data-train-bar]",
     "[data-train-ok]","[data-train-error]","[data-train-blank]","[data-train-coverage]"])els.set(sel,el());
 const target={dataset:{radialIndex:"0",trainMatter:"LP",trainName:"Português",
   trainStats:JSON.stringify({total:20,respondidas:10,acertos:6,erros:3,brancos:1,pendentes:10})},
   disabled:false,classList:{toggle(){}},hasAttribute(k){return k==="data-train-matter"},
   closest(sel){return sel.includes("qb-train-node")||sel.includes("data-train-matter")?this:null},
   contains(){return false},focus(){calls.push("focus")}};
 nodes.push(target);
 segments.push({dataset:{ringSector:"0"},classList:{toggle(){}}});
 const section={
   dataset:{trainDefault:JSON.stringify({total:40,respondidas:20,acertos:10,erros:10,brancos:0,pendentes:20}),
     trainDefaultTitle:"Todas as matérias",trainScreen:"subjects"},
   querySelector(sel){return els.get(sel)||null},
   querySelectorAll(sel){return sel===".qb-train-node"?nodes:sel===".qb-radial-sector"?segments:sel===".qb-train-bar-segment"?metrics:[]},
   addEventListener(k,fn){events.set(k,fn)},
   contains(){return true}
 };
 const browser={QBAxonRingFlow:{mount(){return {
   focus:i=>focus.push(i),select:(node,cb)=>{calls.push("AXON");cb()},dispose:()=>calls.push("dispose")
 }}}};
 const app=moduleFor(browser);
 const dispose=app.wire({querySelector:sel=>sel===".qb-train-hub"?section:null},{onMatter:id=>calls.push("matter:"+id)});
 events.get("pointerover")({target});
 assert.equal(els.get("[data-train-core-title]").textContent,"Português");
 assert.equal(els.get("[data-train-percent]").textContent,"60%");
 assert.deepEqual(metrics.map(x=>x.style.width),["60.00%","30.00%","10.00%"]);
 assert.equal(els.get("[data-train-ok]").textContent,"6 acertos");
 assert.equal(focus.at(-1),0);
 events.get("click")({target});
 assert.deepEqual(calls.slice(0,2),["AXON","dispose"]);
 assert.equal(calls.at(-1),"matter:LP");
 dispose();
});
test("navegação da aplicação conduz matéria → assunto → treino real e preserva o modo clássico",()=>{
 assert.match(shell,/training-radial\.css\?v=1/);
 assert.match(shell,/training-radial\.js\?v=2/);
 assert.match(shell,/trRadial:null/);
 assert.match(shell,/function treinoRadialDados\(/);
 assert.match(shell,/onMatter:id=>\{S\.trRadial=\{matter:id,page:0,setup:false,classic:false\}/);
 assert.match(shell,/onTopic:id=>\{/);
 assert.match(shell,/S\.trRadial=\{\.\.\.S\.trRadial,topic:id,setup:true,classic:false\}/);
 assert.match(shell,/function viewTreinoAssunto\(/);
 assert.match(shell,/function iniciarTreinoAssunto\(/);
 assert.match(shell,/novaRodada\('MIX',mat\.name\+'\s*·\s*'\+topic\.title,S\.modo,ids\)/);
 assert.match(shell,/S\.view==='treinar'&&S\.trRadial\?\.setup/);
 assert.match(shell,/data-train-return="topics"/);
 assert.match(shell,/data-train-return="matters"/);
 assert.match(shell,/function viewSetup\(/);
 assert.match(shell,/startRound\(S\.cap,S\.modo\)/);
 assert.match(shell,/S\.round\?\(S\.round\.fim\?viewFim\(\):viewItem\(\)\)/);
 assert.match(shell,/data-view="treinar"/);
 assert.match(shell,/onReview:\(\)=>\{/);
 assert.match(shell,/onErrors:\(\)=>setView\('caderno'\)/);
 assert.match(source,/data-train-page/);
});
test("cores semânticas e tamanhos responsivos seguem o AXON, sem chamadas externas",()=>{
 postcss.parse(css,{from:"training-radial.css"});
 assert.match(css,/\.qb-train-core-bar/);
 assert.match(css,/\.qb-train-bar-correct/);
 assert.match(css,/\.qb-train-bar-wrong/);
 assert.match(css,/\.qb-train-bar-blank/);
 assert.match(css,/@media\(max-width:500px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/\.qb-train-hub \.qb-radial-node/);
 assert.doesNotMatch(source,/fetch\(|asServiceRole|writeDocument|localStorage|startRound\(/);
});
