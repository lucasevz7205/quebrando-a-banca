import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const fileNames=[
  "t06-regime-principios",
  "t07-ortografia-acentuacao",
  "t08-tributo-conceito-natureza",
  "t12-principios-implicitos"
];

for(const file of fileNames){
  const seed=JSON.parse(fs.readFileSync("scripts/fiscal/"+file+".seed.json","utf8"));
  test(file+" has distinct C/E questions, documented provenance, and stable card-map-question links",()=>{
    const qs=seed.questions,cards=seed.cards,map=seed.map;
    assert.ok(qs.length>=20,"Minimum 20 new questions per topic");
    const idSet=new Set(qs.map(q=>q.id)),sentences=new Set(qs.map(q=>q.enunciado.trim().toLowerCase()));
    assert.equal(idSet.size,qs.length,"Distinct question IDs");
    assert.equal(sentences.size,qs.length,"Distinct enunciados");
    for(const q of qs){
      assert.ok(["C","E"].includes(q.gabarito));
      assert.ok(q.ref.includes(".pdf") && q.ref.includes("p. "),q.id+" requires PDF and page reference");
      assert.match(q.origem,/Autoral/);
      assert.ok(q.comentario.trim().length>=35,q.id+" needs substantial comment");
      assert.equal(q.topico,seed.topic);
    }
    const nodes=[];
    const walk=n=>{nodes.push(n);for(const ch of n.f||[])walk(ch)};
    for(const b of map.ramos)walk(b);
    const nodeSet=new Set(nodes.map(n=>n.id));
    assert.equal(nodeSet.size,nodes.length,"Map node IDs must be unique");
    assert.equal(cards.length,qs.length);
    const referenceSet=new Set();
    for(const c of cards){
      assert.ok(nodeSet.has(c.mapaNoId),"Card must point to exact map node");
      assert.ok(c.q.trim().length>=12 && c.a?.length>=1,"Flashcard must have prompt and answer");
      for(const id of c.questaoIds||[]){assert.ok(idSet.has(id));referenceSet.add(id);}
    }
    assert.equal(referenceSet.size,qs.length,"Every question must appear on at least one flashcard");
    for(const n of nodes) for(const id of n.x?.questaoIds||[]) assert.ok(idSet.has(id));
    for(const link of map.ligacoes||[]) {
      assert.ok(nodeSet.has(link[0])&&nodeSet.has(link[1]),"Cross-map links must point to nodes");
    }
  });
}
