import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import postcss from "postcss";

const script=fs.readFileSync("public/claude-export/radial-dashboard.js","utf8");
const css=fs.readFileSync("public/claude-export/radial-dashboard.css","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const ambient=fs.readFileSync("public/claude-export/ambient-background.css","utf8");
function radial(prefersReduced=true){
 const win={matchMedia:()=>({matches:prefersReduced})};
 vm.runInNewContext(script,{window:win},{filename:"radial-dashboard.js"});
 return win.QBRadialDashboard;
}
const allKeys=["painel","edital","treinar","estudo","simulado","historico"];
test("principal contém exatamente as seis áreas do app, no lugar do painel antigo",()=>{
 const hub=radial();
 const html=hub.render();
 assert.deepEqual([...hub.modules],allKeys);
 assert.equal((html.match(/data-radial-module="/g)||[]).length,6);
 assert.match(html,/Menu principal/);
 assert.match(html,/QUEBRANDO/);
 assert.match(html,/A BANCA/);
 for(const k of allKeys)assert.match(html,new RegExp('data-radial-module="'+k+'"'));
 assert.ok(!html.includes('qb-welcome'));
 assert.ok(!html.includes('data-radial-target='));
});
test("contas sem Simulado recebem cinco áreas e a opção indisponível não pode aparecer",()=>{
 const html=radial().render(null,allKeys.filter(k=>k!=="simulado"));
 assert.equal((html.match(/data-radial-module="/g)||[]).length,5);
 assert.doesNotMatch(html,/data-radial-module="simulado"/);
 assert.match(html,/5 módulos disponíveis/);
});
test("cada área abre subdashboard radial e todas as folhas são páginas existentes",()=>{
 const app=radial();
 const views=new Set(["painel","edital","treinar","estudo","simulado","analiseDia","historico",
   "metodo","aprendizagem","cartoes","mapa","pegadinhas","conteudo","caderno"]);
 for(const key of allKeys){
   const page=app.render(key);
   assert.match(page,/data-radial-screen="/);
   assert.match(page,/data-radial-back/);
   assert.match(page,/← Voltar ao menu principal/);
   assert.ok(!page.includes('data-radial-module='));
   assert.equal((page.match(/data-radial-target="/g)||[]).length,app.submodules(key).length);
   for(const destination of app.submodules(key))assert.ok(views.has(destination),key+" -> "+destination);
 }
 const study=app.render("estudo");
 for(const label of ["Mapa mental 3D","Flashcards","Materiais","Aprendizagem","Pegadinhas"])
   assert.ok(study.includes(label));
 const home=app.render("painel");
 for(const label of ["Planejamento","Revisões","Prática de hoje","Meu progresso"])
   assert.ok(home.includes(label));
});
test("radial mantém formato circular, ligações por SVG, glow e visual AXON",()=>{
 postcss.parse(css,{from:"radial-dashboard.css"});
 assert.match(css,/\.qb-radial-stage\s*\{[\s\S]*aspect-ratio:1/);
 assert.match(css,/\.qb-radial-node\s*\{[\s\S]*left:var\(--node-x\)/);
 assert.match(css,/\.qb-radial-core\s*\{[\s\S]*border-radius:50%/);
 assert.match(css,/@keyframes qb-radial-node-in/);
 assert.match(css,/@keyframes qb-radial-draw/);
 assert.match(css,/\.qb-radial-particles/);
 assert.match(script,/requestAnimationFrame\(tick\)/);
 assert.match(script,/canvas\.width=Math\.round/);
 assert.match(script,/length:175|Array\.from\(\{length:175\}/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(max-width:500px\)/);
 assert.match(ambient,/#qb-ambient-background/);
});
test("navegação radial integra-se ao app sem substituir a barra superior",()=>{
 assert.match(shell,/id="tab-portal" class="qb-radial-nav-item" data-view="portal"/);
 for(const name of ["painel","edital","treinar","estudo","simulado","historico"]){
   assert.match(shell,new RegExp('id="tab-'+name+'"'));
 }
 assert.match(shell,/id="qb-radial-return-action"/);
 assert.match(shell,/radial-dashboard\.css\?v=1/);
 assert.match(shell,/radial-dashboard\.js\?v=1/);
 assert.match(shell,/view:'portal', radialSection:null/);
 assert.match(shell,/let v='portal',entrySection=null/);
 assert.match(shell,/function openPortal\(section=null,push=true,focus=true\)/);
 assert.match(shell,/render\(S\.radialSection,available\)/);
 assert.match(shell,/onModule:key=>openPortal\(key\)/);
 assert.match(shell,/onBack:\(\)=>openPortal\(null\)/);
 assert.match(shell,/onOpen:target=>\{setView\(target\)/);
 assert.match(shell,/if\(S\.view==='portal'\)\{/);
 assert.match(shell,/if\(v==='portal'\)openPortal\(entrySection,false,false\)/);
 assert.match(shell,/syncNavigation\(PAI\[v\]\|\|v\)/);
});
test("botões funcionais: em modo de movimento reduzido navega e retorna sem esperar animação",()=>{
 const app=radial(true);
 function scene(section){
   const events={};
   const controls={
     module:{dataset:{radialModule:"estudo"},hasAttribute:k=>k==="data-radial-module"},
     target:{dataset:{radialTarget:"mapa"},hasAttribute:k=>k==="data-radial-target"},
     back:{dataset:{},hasAttribute:k=>k==="data-radial-back"}
   };
   const root={dataset:{radialScreen:section},
     querySelector:selector=>selector==="[data-radial-back]"?controls.back:null,
     contains:el=>Object.values(controls).includes(el),
     addEventListener:(event,fn)=>{events[event]=fn}};
   app.wire({querySelector:q=>q===".qb-radial-hub"?root:null},{
     onModule:key=>calls.push("module:"+key),
     onOpen:target=>calls.push("open:"+target),
     onBack:()=>calls.push("back")
   });
   return {events,controls};
 }
 const calls=[];
 let s=scene("menu");
 s.events.click({target:{closest:()=>s.controls.module}});
 assert.equal(calls.at(-1),"module:estudo");
 s=scene("estudo");
 s.events.click({target:{closest:()=>s.controls.target}});
 assert.equal(calls.at(-1),"open:mapa");
 // A real navigation remounts the screen, resetting its click/transition guard.
 s=scene("estudo");
 s.events.click({target:{closest:()=>s.controls.back}});
 assert.equal(calls.at(-1),"back");
 s=scene("estudo");
 let stopped=false;
 s.events.keydown({key:"Escape",preventDefault(){stopped=true;}});
 assert.equal(calls.at(-1),"back");
 assert.equal(stopped,true);
 assert.equal(calls.length,4);
});
test("hub não altera armazenamento pedagógico e preserva vídeo de fundo existente",()=>{
 assert.doesNotMatch(script,/writeDocument|ClaudeDocument|assistantLLM|asServiceRole|fetch\(/);
 assert.match(shell,/qb-ambient-background/);
 assert.match(shell,/qb-background-toggle/);
 assert.match(shell,/qb-radial-return/);
 assert.match(css,/body:has\(\.qb-radial-hub\)/);
});
