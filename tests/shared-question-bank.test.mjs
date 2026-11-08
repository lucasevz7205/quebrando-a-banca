import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const sandbox={window:{},Map,Set};
vm.runInNewContext(fs.readFileSync("public/claude-export/question-links.js","utf8"),sandbox);
const link=sandbox.window.QBQuestionLinks;
test("A bateria reutiliza os IDs originais sem duplicar a contagem global",()=>{
 const qs=new Map([
  ["q06",{id:"q06",cap:"CAP06",ordem:6,gabarito:"C",comentario:"Regra"}],
  ["q12",{id:"q12",cap:"CAP12",ordem:12,gabarito:"E",comentario:"Exceção"}],
  ["q18",{id:"q18",cap:"CAP18",ordem:18,gabarito:"C",comentario:"Bateria"}]
 ]);
 const ed=new Map([["t06",{id:"t06",caps:["CAP06"]}],["t12",{id:"t12",caps:["CAP12"]}],["t18",{id:"t18",caps:["CAP18"]}]]);
 const rev=new Map([["t06",{cartoes:[{q:"A",a:["B"]}],mapa:{centro:"A"}}],["t12",{cartoes:[{q:"C",a:["D"]}],mapa:{centro:"C"}}],["t18",{cartoes:[{q:"E",a:["F"]}],mapa:{centro:"E"},questaoIds:["q06","q12","q06","missing"]}]]);
 const idx=link.build(qs,ed,rev);
 assert.equal(idx.total,3);
 assert.equal(idx.byQuestion.size,3);
 assert.equal(idx.byTopic.get("t06").length,1);
 assert.equal(idx.byTopic.get("t12").length,1);
 assert.deepEqual([...idx.byTopic.get("t18").map(x=>x.id)],["q06","q12","q18"]);
 assert.equal(idx.referencedBy.get("q06").length,1);
 assert.ok(idx.byQuestion.get("q06").matchedIds.includes("t18"));
 assert.ok(idx.byTopic.get("t18").every(x=>qs.has(x.id)));
});
test("Links compartilhados não abrem questões de outra conta",()=>{
 const docs=new Map([["q06",{id:"q06",cap:"CAP06",gabarito:"C",comentario:"A"}]]);
 const ed=new Map([["t06",{id:"t06",caps:["CAP06"]}],["t18",{id:"t18",caps:["CAP18"]}]]);
 const rev=new Map([["t18",{questaoIds:["q06","qOUTRO"]}]]);
 const idx=link.build(docs,ed,rev);
 assert.deepEqual([...idx.byTopic.get("t18").map(x=>x.id)],["q06"]);
 assert.equal(idx.byQuestion.has("qOUTRO"),false);
});
test("A bateria aponta para os dois mapas reais da teoria",()=>{
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(shell,/mapaRelacionadoIds/);
 assert.match(shell,/bancoCompartilhado/);
 assert.match(shell,/data-ir-mapa/);
});

test("Baterias e revisões T17/T32/T44/T65/T71 reutilizam IDs sem duplicar documentos",()=>{
  const cases=[
    {topic:"t17",sources:["FISCAL-TI-05","FISCAL-TI-11"],local:"FISCAL-TI-17",sourceTopics:["t05","t11"]},
    {topic:"t32",sources:["FISCAL-TI-21","FISCAL-TI-26"],local:"FISCAL-TI-32",sourceTopics:["t21","t26"]},
    {topic:"t44",sources:["FISCAL-TI-35","FISCAL-TI-38"],local:"FISCAL-TI-44",sourceTopics:["t35","t38"]},
    {topic:"t65",sources:["FISCAL-TI-50","FISCAL-TI-59"],local:"FISCAL-TI-65",sourceTopics:["t50","t59"]},
    {topic:"t71",sources:["FISCAL-TI-05","FISCAL-TI-11"],local:"FISCAL-TI-71",sourceTopics:["t05","t11"]}
  ];
  for(const obj of cases){
    const questions=new Map(),ed=new Map(),rev=new Map(),refs=[];
    for(let i=0;i<obj.sources.length;i++){
      const id="Q"+i;
      const tid=obj.sourceTopics[i];
      questions.set(id,{id,cap:obj.sources[i],enunciado:"Item "+id,gabarito:"C"});
      ed.set(tid,{id:tid,caps:[obj.sources[i]]});
      refs.push(id);
    }
    const own="LOCAL"+obj.topic;
    questions.set(own,{id:own,cap:obj.local,enunciado:"Item próprio",gabarito:"E"});
    ed.set(obj.topic,{id:obj.topic,caps:[obj.local]});
    rev.set(obj.topic,{questaoIds:refs,cartoes:[{q:"A",a:["B"]}],mapaRelacionadoIds:obj.sourceTopics});
    const result=link.build(questions,ed,rev);
    assert.equal(result.total,3);
    assert.deepEqual([...result.byTopic.get(obj.topic).map(q=>q.id)].sort(),[own,"Q0","Q1"].sort());
    assert.equal(result.byQuestion.size,3);
    assert.ok(result.byTopic.get(obj.topic).every(q=>questions.has(q.id)));
    assert.equal(rev.get(obj.topic).mapaRelacionadoIds.length,2);
  }
});

