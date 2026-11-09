import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync("public/claude-export/map-mastery.js","utf8");
function load(){
 const ctx={module:{exports:{}},globalThis:{}};
 vm.runInNewContext(source,ctx,{filename:"map-mastery.js"});
 return ctx.module.exports;
}
const map={centro:"Árvore",ramos:[
 {id:"principal",t:"Ramo A",f:[{id:"a1",t:"Subramo A1",x:{questaoIds:["q1","q2"]}}, {id:"a2",t:"Subramo A2"}]},
 {id:"isolado",t:"Ramo sem questões"}
]};
function question(id,opts={}){return {id,cap:"CAP",topico:"T01",gabarito:"C",enunciado:"Item "+id,...opts};}
const questions=new Map(["q1","q2","q3","q4","q5","q6","q7","q8","q9"].map(id=>[id,question(id)]));
const responses=new Map([
 ["q1",{tentativas:2,ultimaMarcada:"C",retidoEm:"2026-11-01",hist:[{ok:true,c:3}]}],
 ["q2",{tentativas:1,ultimaMarcada:"E",noCaderno:true,erros:1}],
 ["q3",{tentativas:1,ultimaMarcada:"C"}],
 ["q4",{tentativas:1,ultimaMarcada:"C"}],
 ["q5",{tentativas:1,ultimaMarcada:"C"}],
 ["q6",{tentativas:1,ultimaMarcada:"C"}]
]);
test("subramo, ramo e edital agregam IDs distintos sem duplicar",()=>{
 const api=load();
 const q=new Map(questions); q.set("q3",{...q.get("q3"),mapaNoId:"a1"});
 const cards=[{mapaNoId:"a1",questaoIds:["q3","q4","q4"]},{mapaNoId:"a2",questaoIds:["q5"]}];
 const result=api.build({topicId:"T01",map,cards,questions:q,responses,topic:{titulo:"Capítulo",caps:["CAP"]}});
 assert.equal(result.byPath.get("0.0").stat.total,4);
 assert.equal(result.byPath.get("0").stat.total,5);
 assert.equal(result.byPath.get("0.1").stat.total,1);
 assert.equal(result.byPath.get("1").stat.respondidas,0);
 assert.equal(result.edital.total,9);
 assert.equal(result.unlinked.length,4);
 assert.equal(result.byPath.get("0").stat.respondidas,5);
 assert.ok(api.detail(result,"0").includes("data-qcard"));
 assert.ok(api.overview(result).includes("4 questões do edital"));
});
test("nenhum vínculo pelo assunto ou nome parecido: não inventa desempenho em nó",()=>{
 const api=load();
 const result=api.build({topicId:"T01",map,questions,responses,topic:{caps:["CAP"]}});
 assert.equal(result.byPath.get("0").stat.total,2);
 assert.equal(result.byPath.get("1").stat.status,"sem-evidencia");
 assert.equal(result.edital.respondidas,6);
});
test("amostra, retenção, item não respondido e históricos distintos",()=>{
 const api=load();
 const q=new Map();const r=new Map();
 for(let i=1;i<=6;i++){q.set("x"+i,question("x"+i));r.set("x"+i,{tentativas:1,ultimaMarcada:"C",retidoEm:"2026-10-08"});}
 assert.equal(api.stats([...q.keys()],q,r).status,"forte");
 r.set("x2",{tentativas:2,ultimaMarcada:"E",erros:2,noCaderno:true});
 assert.equal(api.stats([...q.keys()],q,r).status,"bom-sem-retencao");
 r.set("x3",{tentativas:1,ultimaMarcada:"B"});
 assert.equal(api.stats([...q.keys()],q,r).respondidas,5);
 r.set("x4",{tentativas:1,ultimaMarcada:"E",noCaderno:true,erros:1});
 assert.equal(api.stats([...q.keys()],q,r).status,"deficiente");
});
test("simulados, itens fora do nível e sem resposta não adulteram taxa",()=>{
 const api=load();
 const q=new Map([["sim",question("sim",{cap:"SIM-2026"})],["other",question("other",{foraNivel:true})],["blank",question("blank")]]);
 const r=new Map([["sim",{tentativas:1,ultimaMarcada:"E"}],["other",{tentativas:1,ultimaMarcada:"E"}],["blank",{tentativas:1,ultimaMarcada:"B"}]]);
 const st=api.stats([...q.keys()],q,r);
 assert.equal(st.total,1);assert.equal(st.respondidas,0);assert.equal(st.brancos,1);
 assert.equal(st.percentual,null);
});
test("HTML de enunciados e nós deve ser escapado",()=>{
 const api=load();
 const escaped=api.escapeHtml("<img src=x onerror=alert(1)>");
 assert.ok(!escaped.includes("<img"));
});
