import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = name => {
 const x=JSON.parse(fs.readFileSync("scripts/claude-seed/"+name+".json","utf8"));
 return Array.isArray(x)?x:Object.values(x);
};
function load(){
 const ctx={window:{},module:{exports:{}}};
 for(const file of ["map-origin.js","map-mastery.js","cohesion-links.js"])
  vm.runInNewContext(fs.readFileSync("public/claude-export/"+file,"utf8"),ctx,{filename:file});
 return ctx.window;
}
function fixture(){
 const w=load();
 const src=read("revisao").find(x=>x.id==="lp-4-1");
 const ed=read("edital").find(x=>x.id==="lp-4-1");
 const questions=new Map(read("questoes").map(x=>[x.id,x]));
 const responses=new Map(read("respostas").map(x=>[x.id,x]));
 const assessments=new Map(read("cartoes_aval").map(x=>[x.k||x.id,x]));
 assert.ok(src?.mapa && src.cartoes.length===39);
 const editorial=w.QBEditorialCohesion.decorate(src.id,src.mapa,src.cartoes,questions);
 const summary=w.QBMapMastery.build({topicId:src.id,topic:ed,map:editorial.map,cards:editorial.cards,
   questions,responses,assessments,resolveCard:w.QBMapLinks.resolve});
 return {w,src,ed,questions,responses,assessments,editorial,summary};
}
test("67 questões e 39 cartões de Coesão ligados de modo exato por caminho",()=>{
 const f=fixture();
 assert.equal(f.editorial.audit.questions,67);
 assert.equal(f.editorial.audit.cards,39);
 assert.equal(f.editorial.linked.length,67);
 assert.equal(f.editorial.invalidPaths.length,0);
 assert.equal(f.summary.linked.size,67);
 assert.equal(f.summary.root.review.total,39);
 assert.equal(f.summary.root.stat.total,67);
 assert.equal(f.summary.unlinked.length,0);
 // Todos os caminhos atribuídos correspondem a nós reais.
 for(const path of f.w.QBEditorialCohesion.questionPaths) assert.ok(f.summary.byPath.has(path),path);
 for(const path of f.w.QBEditorialCohesion.cardPaths) assert.ok(f.summary.byPath.has(path),path);
});
test("arquivo histórico é calculado sem confundir snapshot com banco atual",()=>{
 const f=fixture();
 const s=f.summary.root.stat, cards=f.summary.root.review;
 assert.equal(s.respondidas,50);
 assert.equal(s.acertos,48);
 assert.equal(s.percentual,48/50);
 assert.equal(s.total-s.respondidas,17);
 assert.equal(cards.avaliados,22);
 assert.equal(cards.lembrados,15);
 assert.ok(cards.percentual<.70);
 // 100% na bateria não prova domínio de todos os cartões.
 assert.equal(s.status,"deficiente"); // Snapshot: ainda havia duas respostas erradas e itens no caderno.
 const corrected=new Map(f.responses);
 for(const [id,q] of f.questions) {
   const old=corrected.get(id);
   if(old && old.tentativas>0 && old.ultimaMarcada!==q.gabarito)
     corrected.set(id,{...old,ultimaMarcada:q.gabarito});
 }
 const after=f.w.QBMapMastery.build({topicId:f.src.id,topic:f.ed,map:f.editorial.map,
   cards:f.editorial.cards,questions:f.questions,responses:corrected,
   assessments:f.assessments,resolveCard:f.w.QBMapLinks.resolve});
 assert.equal(after.root.stat.acertos,50);
 assert.equal(after.root.stat.erros,0);
 assert.equal(after.root.stat.status,"em-desenvolvimento");
 assert.ok(f.summary.nodes.some(n=>n.stat.status==="sem-evidencia"));
 assert.ok(f.summary.nodes.some(n=>n.stat.respondidas>0));
});
test("a ligação é derivada só no navegador; arquivos originais e demais assuntos permanecem intocados",()=>{
 const f=fixture();
 assert.equal(f.src.mapa.ramos[0].x?.questaoIds,undefined);
 assert.equal(f.src.cartoes[0].mapaPath,undefined);
 assert.equal(f.editorial.cards[0].mapaPath,"0.0");
 assert.equal(f.w.QBEditorialCohesion.decorate("lp-4-2",f.src.mapa,f.src.cartoes,f.questions),null);
});
test("linhas 3D usam cores por nó de destino, separadas de notas e histórico",()=>{
 const scene=fs.readFileSync("src/components/qb/mind-map/scene.js","utf8");
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(scene,/function lineGeometry\(pairs, crossLink = false\)/);
 assert.match(scene,/const tip=new Color\(colorFor\(target\)\)/);
 assert.match(scene,/Float32BufferAttribute\(colors,3\)/);
 assert.match(scene,/vertexColors:true/);
 assert.match(scene,/Flashcards: /);
 assert.match(shell,/QBEditorialCohesion\?\.decorate/);
 assert.match(shell,/map:m,cards:mapCards/);
 assert.match(shell,/map-evidence\.css/);
 assert.match(shell,/Cor da conexão = evidência no subramo/);
});
