import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const win={};vm.runInNewContext(fs.readFileSync(new URL("../public/claude-export/sim-composicao.js",import.meta.url),"utf8"),{window:win});
const {compor,repartir,REGRA_DESDE}=win.QBSimComposicao;
const bp={blocos:[{prova:"P1",mats:[["pl","Processo Legislativo",10]]}]};
const topicos=[{id:"pl-1",sigla:"pl",titulo:"A"},{id:"pl-2",sigla:"pl",titulo:"B"},{id:"pl-3",sigla:"pl",titulo:"C (não visto)"},{id:"pl-4",sigla:"pl",titulo:"D",foraEdital:true}];
const mk=(t,n,real=0)=>Array.from({length:n},(_,i)=>({id:`${t}-q${String(i).padStart(2,"0")}`,t,real:i<real}));
const base=(over={})=>({blueprint:bp,topicos,
 questoes:[...mk("pl-1",20,6),...mk("pl-2",20,0),...mk("pl-3",20,0),...mk("pl-4",20,0)],
 topicoDe:q=>q.t,visto:t=>t.id!=="pl-3",real:q=>q.real,elegivel:()=>true,usados:new Set(),semente:"2026-11-22",...over});
test("regra vale a partir de 15/11/2026",()=>assert.equal(REGRA_DESDE,"2026-11-15"));
test("repartir soma o total e desempata por id",()=>{
 const r=repartir(10,[{id:"b",w:1},{id:"a",w:1},{id:"c",w:1}]);
 assert.equal([...r.values()].reduce((a,b)=>a+b,0),10);assert.equal(r.get("a"),4);
});
test("só tópicos vistos e dentro do edital; cota segue 1 + incidência",()=>{
 const r=compor(base());
 assert.equal(r.itens.length,10);
 assert.ok(r.itens.every(i=>/^pl-[12]-/.test(i.qid)));
 const n=t=>r.itens.filter(i=>i.qid.startsWith(t)).length;
 assert.equal(n("pl-1"),9);assert.equal(n("pl-2"),1); // pesos 7 e 1: 8,75 e 1,25
 assert.equal(r.falta.length,0);
});
test("determinístico: mesma semente, mesma prova; outra semente, outra seleção",()=>{
 const a=compor(base()).itens.map(i=>i.qid),b=compor(base()).itens.map(i=>i.qid),c=compor(base({semente:"2026-11-29"})).itens.map(i=>i.qid);
 assert.deepEqual(a,b);assert.notDeepEqual(a,c);
});
test("itens já usados ficam por último",()=>{
 const usados=new Set(mk("pl-1",20).slice(0,10).map(q=>q.id));
 const r=compor(base({usados}));
 assert.ok(r.itens.filter(i=>i.qid.startsWith("pl-1")).every(i=>!usados.has(i.qid)));
});
test("falta vira plano por tópico visto, nunca item inventado nem tópico não visto",()=>{
 const r=compor(base({questoes:[...mk("pl-1",3,3),...mk("pl-2",2)]}));
 assert.equal(r.itens.length,5);
 const f=r.falta[0];assert.equal(f.pedido,10);assert.equal(f.tem,5);
 assert.equal(f.plano.reduce((a,p)=>a+p.gerar,0),5);
 assert.ok(f.plano.every(p=>["pl-1","pl-2"].includes(p.topico)));
});
test("matéria sem tópico visto: sinaliza e não gera",()=>{
 const r=compor(base({visto:()=>false}));
 assert.equal(r.itens.length,0);assert.equal(r.falta[0].semTopicoVisto,true);assert.equal(r.falta[0].plano.length,0);
});
test("itens inelegíveis (bloqueados/foraNivel) não entram",()=>{
 const r=compor(base({elegivel:q=>!q.id.startsWith("pl-1")}));
 assert.ok(r.itens.every(i=>i.qid.startsWith("pl-2")));
 assert.equal(r.itens.length,10);
});
