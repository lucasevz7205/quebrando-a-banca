import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const names = ["sup-qualidade-dados","sup-modelagem-logica","sup-normalizacao"];
const existing = fs.readdirSync("scripts/fiscal").filter(n=>n.endsWith(".seed.json")&&!n.startsWith("sup-"));
const used=new Set();
for(const name of existing){
 const seed=JSON.parse(fs.readFileSync("scripts/fiscal/"+name,"utf8"));
 for(const q of seed.questions||[]) used.add(q.id);
}
for(const name of names){
 test(name+" · 20+ itens, proveniência e vínculos de mapa",()=>{
  const pack=JSON.parse(fs.readFileSync("scripts/fiscal/"+name+".seed.json","utf8"));
  assert.ok(pack.topic.startsWith("fiscal-sup-"));
  assert.ok(pack.questions.length>=20);
  assert.equal(pack.cards.length,pack.questions.length);
  const ids=new Set(),enunciados=new Set(),nodes=new Set(),linked=new Set();
  const visit=n=>{assert.ok(n.id);assert.ok(!nodes.has(n.id),"nó repetido: "+n.id);nodes.add(n.id);for(const f of n.f||[])visit(f)};
  for(const r of pack.map.ramos)visit(r);
  for(const q of pack.questions){
   assert.ok(!used.has(q.id),"conflito com material já existente: "+q.id);
   assert.ok(!ids.has(q.id));ids.add(q.id);
   assert.ok(!enunciados.has(q.enunciado));enunciados.add(q.enunciado);
   assert.ok(["C","E"].includes(q.gabarito));
   assert.match(q.origem,/Autoral/);assert.match(q.ref,/\.pdf, p\. \d+/);
   assert.ok(q.comentario.length>35);assert.equal(q.topico,pack.topic);
   assert.ok(nodes.has(q.mapaNoId));
   assert.equal(q.fonte.documento,pack.source);
   assert.ok(q.fonte.pagina>=1 && q.fonte.pagina<=(name==="sup-qualidade-dados"?52:name==="sup-modelagem-logica"?209:153));
  }
  for(const c of pack.cards){
   assert.ok(nodes.has(c.mapaNoId));assert.ok(c.q.length>=12);
   assert.ok(c.a[0].length>=15);assert.equal(c.questaoIds.length,1);
   for(const id of c.questaoIds){assert.ok(ids.has(id));linked.add(id)}
  }
  assert.equal(linked.size,pack.questions.length);
  for(const r of pack.map.ramos)for(const n of r.f||[])for(const id of n.x.questaoIds||[])assert.ok(ids.has(id));
  for(const q of pack.questions)used.add(q.id);
 });
}
