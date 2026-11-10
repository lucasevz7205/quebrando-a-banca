import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import postcss from "postcss";

const hub=fs.readFileSync("public/claude-export/radial-dashboard.js","utf8");
const flow=fs.readFileSync("public/claude-export/radial-axon-flow.js","utf8");
const style=fs.readFileSync("public/claude-export/radial-annulus.css","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
function model(win={}){
 const host={matchMedia:()=>({matches:true}),...win};
 vm.runInNewContext(hub,{window:host},{filename:"radial-dashboard.js"});
 return host.QBRadialDashboard;
}
test("anel real incorpora o poster do MP4 e reproduz as cores visíveis do vídeo",()=>{
 const sheet=postcss.parse(style,{from:"radial-annulus.css"});
 assert.ok(sheet.nodes.length>40);
 assert.match(style,/url\("\/claude-export\/ambient-poster\.jpg"\)/);
 assert.match(style,/conic-gradient\(from -40deg/);
 for(const color of ["#ff6949","#a58aff","#37d9fa","#21bafa"])assert.ok(style.includes(color));
 assert.match(style,/mask-image:radial-gradient\(circle closest-side/);
 assert.match(style,/qb-radial-annulus-texture/);
 assert.match(style,/qb-radial-annulus-filaments/);
 const poster=fs.readFileSync("public/claude-export/ambient-poster.jpg");
 assert.ok(poster.byteLength>10000);
});
test("itens ocupam segmentos concêntricos, e não cartões separados",()=>{
 const html=model().render();
 assert.equal((html.match(/data-ring-sector="/g)||[]).length,6);
 assert.equal((html.match(/class="qb-radial-node"/g)||[]).length,6);
 assert.match(html,/class="qb-radial-annulus"/);
 assert.match(html,/class="qb-radial-annulus-light"/);
 assert.match(html,/class="qb-radial-annulus-texture"/);
 assert.match(html,/class="qb-radial-flow"/);
 assert.match(html,/A368 368/);
 assert.doesNotMatch(html,/M500 500 Q/,"ring sectors replace radial spokes");
 assert.match(style,/\.qb-radial-node\s*\{[\s\S]*border:0/);
 assert.match(style,/\.qb-radial-node\s*\{[\s\S]*border-radius:50%/);
 assert.match(style,/\.qb-radial-hub\s*\{[\s\S]*background:transparent/);
 const coords=[...html.matchAll(/--node-x:([\d.]+)%;--node-y:([\d.]+)%;--index:(\d+);/g)];
 assert.equal(coords.length,6);
 for(const [,x,y] of coords){
   const radius=Math.hypot(Number(x)-50,Number(y)-50);
   assert.ok(radius>36&&radius<38,"label is embedded within the luminous ring");
 }
});
test("a camada de anel serve também aos submenus reais e respeita permissões",()=>{
 const app=model();
 for(const module of app.modules){
   const html=app.render(module);
   const items=app.submodules(module);
   assert.equal((html.match(/data-ring-sector="/g)||[]).length,items.length,module);
   assert.equal((html.match(/data-radial-target="/g)||[]).length,items.length,module);
 }
 const restricted=app.render(null,app.modules.filter(x=>x!=="simulado"));
 assert.equal((restricted.match(/data-ring-sector="/g)||[]).length,5);
 assert.doesNotMatch(restricted,/data-radial-module="simulado"/);
});
test("AXON existente empresta seed, curvatura e convergência ao fluxo do anel",()=>{
 for(const token of ["seeded(seed)","Math.imul(current,1664525)","const ease=t=>t*t*(3-2*t)",
   "const turbulence=(1-progress)","const curl=particle.phase+9*t*particle.spin",
   "particle.ox+(particle.tx-particle.ox)*progress","tx.globalCompositeOperation=\"lighter\""])
   assert.ok(flow.includes(token),token);
 assert.match(flow,/length:410/);
 assert.match(flow,/requestAnimationFrame\(tick\)/);
 assert.match(flow,/qbAmbient!=="still"/);
 assert.match(flow,/IntersectionObserver/);
 assert.match(flow,/ResizeObserver/);
 assert.match(flow,/\.dispose\?\.\(\)/m,"app cleans previous animation");
});
test("passagem do mouse e teclado destacam o setor correto e a seleção usa o fluxo AXON",()=>{
 const focused=[],calls=[],styles=[];
 const nodes=Array.from({length:6},(_,i)=>({
   dataset:{radialIndex:String(i),radialModule:i===0?"painel":"estudo"},
   classList:{toggle(type,on){styles.push([i,type,on]);}},
   focus(){calls.push("focus:"+i);}
 }));
 const sectors=Array.from({length:6},(_,i)=>({
   dataset:{ringSector:String(i)},
   classList:{toggle(type,on){styles.push(["sector"+i,type,on]);}}
 }));
 const events={};
 const root={
   dataset:{radialScreen:"menu"},
   querySelector:()=>null,
   querySelectorAll:selector=>selector===".qb-radial-node"?nodes:selector===".qb-radial-sector"?sectors:[],
   contains:()=>true,
   addEventListener:(type,handler)=>{events[type]=handler;}
 };
 const host={
   matchMedia:()=>({matches:false}),
   QBAxonRingFlow:{mount:()=>({
      focus:i=>focused.push(i),
      select:(_button,go)=>{calls.push("axon:select");go();},
      dispose:()=>calls.push("dispose")
   })}
 };
 const app=model(host);
 const cleanup=app.wire({querySelector:()=>root},{onModule:key=>calls.push("module:"+key)});
 events.pointerover({target:{closest:()=>nodes[2]}});
 assert.equal(focused.at(-1),2);
 assert.ok(styles.some(([id,kind,on])=>id==="sector2"&&kind==="is-focused"&&on));
 events.click({target:{closest:()=>nodes[0]}});
 assert.deepEqual(calls.slice(0,2),["axon:select","module:painel"]);
 assert.equal(focused.at(-1),0);
 cleanup();
 assert.equal(calls.at(-1),"dispose");
});
test("menu agora mantém fluxo e vídeo sem reiniciar a animação em atualizações de dados",()=>{
 assert.match(shell,/radial-axon-flow\.js\?v=1/);
 assert.match(shell,/radial-annulus\.css\?v=1/);
 assert.match(shell,/radial-dashboard\.js\?v=2/);
 assert.match(shell,/const screen=S\.radialSection\|\|'menu'/);
 assert.match(shell,/main\.querySelector\('\.qb-radial-hub'\)\?\.dataset\.radialScreen===screen/);
 assert.match(shell,/radialCleanup\?\.\(\)/);
 assert.match(hub,/window\.QBAxonRingFlow\?\.mount\(root\)/);
 assert.match(hub,/ring\.select\(button,go\)/);
 assert.match(hub,/ArrowRight/);
 assert.match(hub,/ArrowLeft/);
 assert.match(shell,/qb-ambient-background/);
});
test("modos estático e movimento reduzido suspendem os efeitos permanentes",()=>{
 assert.match(style,/:root\[data-qb-ambient="still"\] \.qb-radial-annulus-filaments/);
 assert.match(style,/animation-play-state:paused!important/);
 assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(flow,/reduced\.matches/);
 assert.match(flow,/if\(disposed\|\|reduced\.matches\|\|!tx\)/);
 assert.doesNotMatch(flow,/fetch\(|writeDocument|ClaudeDocument/);
});
