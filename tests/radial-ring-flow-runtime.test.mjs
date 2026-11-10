import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync("public/claude-export/radial-axon-flow.js","utf8");
function harness({staticMode=false,reduced=false}={}){
 const callbacks=new Map(),canceled=new Set();
 const trackers={idleDraw:0,transitionDraw:0,focus:[],resize:0};
 let seq=0,mutationCb=null;
 const ctx=kind=>({
   setTransform(){trackers.resize++;},
   clearRect(){},
   save(){},restore(){},beginPath(){},arc(){trackers[kind==="idle"?"idleDraw":"transitionDraw"]++;},
   stroke(){},fill(){},moveTo(){},lineTo(){},
   createRadialGradient:()=>({addColorStop(){}}),
   set globalCompositeOperation(x){},
   set strokeStyle(x){},
   set lineWidth(x){},
   set fillStyle(x){}
 });
 const idle={width:0,height:0,getContext:()=>ctx("idle")};
 const transient={width:0,height:0,hidden:true,getContext:()=>ctx("transition")};
 const doc={hidden:false,documentElement:{dataset:{qbAmbient:staticMode?"still":"motion"}},addEventListener(){},removeEventListener(){}};
 const view={
   devicePixelRatio:1.5,matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),
   performance:{now:()=>0},
   requestAnimationFrame(fn){const id=++seq;callbacks.set(id,fn);return id;},
   cancelAnimationFrame(id){canceled.add(id);callbacks.delete(id);},
   addEventListener(){},removeEventListener(){},
   MutationObserver:class {constructor(fn){mutationCb=fn}observe(){}disconnect(){}},
   ResizeObserver:class {observe(){}disconnect(){}},
   IntersectionObserver:class {observe(){}disconnect(){}}
 };
 doc.defaultView=view;
 const stage={
   ownerDocument:doc,
   querySelector(sel){return sel==="[data-radial-flow]"?idle:sel==="[data-radial-particles]"?transient:null;},
   getBoundingClientRect(){return {width:600,height:600,left:0,top:0};}
 };
 const root={isConnected:true,dataset:{},querySelector:sel=>sel==="[data-radial-stage]"?stage:null,
   querySelectorAll:sel=>sel===".qb-radial-node"?Array.from({length:6}):[]};
 vm.runInNewContext(source,{window:view},{filename:"radial-axon-flow.js"});
 const engine=view.QBAxonRingFlow.mount(root);
 const drain=now=>{
   const ids=[...callbacks.keys()];
   for(const id of ids){const fn=callbacks.get(id);callbacks.delete(id);fn(now);}
 };
 return {root,doc,view,engine,trackers,callbacks,transient,drain,
   setMode:mode=>{doc.documentElement.dataset.qbAmbient=mode;mutationCb?.();},
   button:{dataset:{radialModule:"estudo"},getBoundingClientRect:()=>({left:390,top:90,width:90,height:72})}};
}
test("anel em movimento atualiza filamentos sob demanda, sem contextos WebGL",()=>{
 const app=harness();
 assert.equal(app.callbacks.size,1,"one frame is scheduled");
 app.drain(44);
 assert.ok(app.trackers.idleDraw>100);
 assert.equal(app.callbacks.size,1,"animation schedules only one successor");
 app.engine.dispose();
 assert.equal(app.callbacks.size,0,"cleanup cancels animation");
});
test("anel estático não inicia loop, mas volta a animar sob escolha do usuário",()=>{
 const app=harness({staticMode:true});
 assert.equal(app.callbacks.size,0);
 app.setMode("motion");
 assert.equal(app.callbacks.size,1);
 app.drain(45);
 assert.ok(app.trackers.idleDraw>0);
 app.setMode("still");
 assert.equal(app.callbacks.size,0);
 app.engine.dispose();
});
test("modo de acessibilidade elimina movimento permanente e seleção transitória",()=>{
 const app=harness({reduced:true});
 assert.equal(app.callbacks.size,0);
 let navigations=0;
 app.engine.select(app.button,()=>navigations++);
 assert.equal(navigations,1);
 assert.equal(app.trackers.transitionDraw,0);
 app.engine.dispose();
});
test("seleção AXON concentra partículas no núcleo e navega ao concluir",()=>{
 const app=harness({staticMode:true});
 let navigations=0;
 app.engine.select(app.button,()=>navigations++);
 assert.equal(navigations,0);
 assert.equal(app.transient.hidden,false);
 app.drain(900);
 assert.ok(app.trackers.transitionDraw>200);
 assert.equal(app.transient.hidden,true);
 assert.equal(navigations,1);
 app.engine.dispose();
});
