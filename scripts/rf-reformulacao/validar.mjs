import assert from 'node:assert/strict';
import console from 'node:console';
import fs from 'node:fs';
const before=JSON.parse(fs.readFileSync('scripts/rf-reformulacao/antes-2026-11-10.json'));
const after=JSON.parse(fs.readFileSync('scripts/rf-reformulacao/depois-2026-11-10.json'));
const qs=JSON.parse(fs.readFileSync('src/data/rf-questoes-revisao-2026-11-10.json'));
let nodeCount=0,cardCount=0;
assert.equal(Object.keys(after).length,8);assert.equal(qs.length,160);
assert.equal(new Set(qs.map(q=>q.id)).size,160);
assert.equal(new Set(qs.map(q=>q.enunciado)).size,160);
for(const [id,d] of Object.entries(after)){
 const nodes=new Map();const walk=n=>{assert(!nodes.has(n.id));nodes.set(n.id,n);for(const f of ['e','ex','trap','src'])assert(n.x[f]?.trim(),id+' '+n.id+' '+f);assert(n.n);(n.f||[]).forEach(walk)};
 d.mapa.ramos.forEach(walk);nodeCount+=nodes.size;cardCount+=d.cartoes.length;
 const old=before.hydrated[id];
 for(let i=0;i<old.cartoes.length;i++){assert.equal(d.cartoes[i].q,old.cartoes[i].q);assert.deepEqual(d.cartoes[i].a,old.cartoes[i].a);}
 const oldNodes=[];const collect=n=>{oldNodes.push(n.id);(n.f||[]).forEach(collect)};old.mapa.ramos.forEach(collect);for(const nid of oldNodes)assert(nodes.has(nid));
 for(const c of d.cartoes)assert(nodes.has(c.mapaNoId),'Broken card '+c.q);
 for(const [a,b,label] of d.mapa.ligacoes){assert(nodes.has(a)&&nodes.has(b));assert(label);}
 const group=qs.filter(q=>q.topico===id);assert.equal(group.length,20);assert.equal(group.filter(q=>q.gabarito==='C').length,10);
 for(const q of group){assert(nodes.has(q.mapaNoId));assert.equal(q.statusEditorial,'aguardando-revisao-humana');assert(!q.revisaoHumana);assert(q.enunciado.includes('Assertiva:'));if(q.gabarito==='E'){assert(q.correcaoMinima);assert(q.comentario.includes('Versão correta:'));}}
}
console.log(JSON.stringify({topics:8,nodes:nodeCount,cards:cardCount,drafts:160,originalCardsPreserved:true,linksValid:true}));
