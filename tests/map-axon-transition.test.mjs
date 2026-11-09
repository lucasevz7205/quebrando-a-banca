import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createAxonReveal} from "../src/components/qb/mind-map/axon-reveal.js";

function fixture(reduced=false){
  let frameId=0, timerId=0, focused=0, frames=new Map(),timers=new Map(),draws=0;
  const gradient={addColorStop(){}};
  const ctx={
    setTransform(){},clearRect(){},save(){},restore(){},
    createRadialGradient(){return gradient;},
    beginPath(){},arc(){},fill(){draws++;},stroke(){},moveTo(){},lineTo(){},
  };
  const particles={hidden:true,width:0,height:0,getContext(){return ctx;}};
  const close={focus(){focused++;}};
  const scroller={scrollTop:28};
  const card={offsetLeft:20,offsetTop:16,offsetWidth:480,offsetHeight:320,
    style:{setProperty(name,value){this[name]=value;}}};
  const panel={hidden:true,dataset:{},classList:{add(){},remove(){}},querySelector(sel){
    if(sel==="[data-map-concept-card]")return card;
    if(sel==="[data-map-concept-scroll]")return scroller;
    if(sel===".qb-map3-concept-close")return close;
    return null;
  }};
  const stage={getBoundingClientRect(){return {width:520,height:380}},querySelector(sel){
    return sel==="[data-map-concept]"?panel:sel==="[data-map-axon]"?particles:null;
  }};
  const win={devicePixelRatio:2,matchMedia(){return {matches:reduced}},performance:{now:()=>0},
    requestAnimationFrame(fn){frames.set(++frameId,fn);return frameId;},
    cancelAnimationFrame(id){frames.delete(id);},
    setTimeout(fn){timers.set(++timerId,fn);return timerId;},
    clearTimeout(id){timers.delete(id)}
  };
  return {stage,win,panel,particles,card,scroller,
    get frames(){return frames.size;},get focused(){return focused;},get draws(){return draws;},
    advance(t){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(t));},
    flushTimers(){const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());}};
}
test("um clique gera partícula, expande definição no palco e libera canvas ao fim",()=>{
  const f=fixture(), fx=createAxonReveal(f.stage,f.win);
  fx.show({x:145,y:87},"conceito.a");
  assert.equal(f.panel.hidden,false);assert.equal(f.particles.hidden,false);
  assert.equal(f.card.style["--axon-x"],"125px");
  assert.equal(f.frames,1);
  f.advance(300);
  assert.equal(f.panel.dataset.open,"true");
  assert.ok(f.draws>100);
  f.advance(900);
  assert.equal(f.particles.hidden,true);
  assert.equal(f.focused,1);
  assert.equal(f.frames,0);
  fx.hide();
  f.flushTimers();
  assert.equal(f.panel.hidden,true);
  fx.dispose();
});
test("acessibilidade de movimento reduzido sem loop de quadros",()=>{
  const f=fixture(true),fx=createAxonReveal(f.stage,f.win);
  fx.show({x:100,y:75},"conceito.b");
  assert.equal(f.panel.dataset.open,"true");
  assert.equal(f.particles.hidden,true);
  assert.equal(f.frames,0);
  assert.equal(f.focused,1);
  fx.hide();
  assert.equal(f.panel.hidden,true);
});
test("mudanças rápidas não deixam animação anterior em execução",()=>{
  const f=fixture(),fx=createAxonReveal(f.stage,f.win);
  fx.show({x:80,y:60},"a");
  fx.show({x:200,y:130},"b");
  assert.equal(f.frames,1);
  assert.equal(f.card.style["--axon-x"],"180px");
  fx.hide(true);
  assert.equal(f.frames,0);
  assert.equal(f.panel.hidden,true);
});
test("integração 3D exibe detalhes dentro da cena, sem criar outra seção inferior",()=>{
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 const observer=fs.readFileSync("src/components/qb/mind-map/observe.js","utf8");
 const scene=fs.readFileSync("src/components/qb/mind-map/scene.js","utf8");
 assert.match(shell,/data-map-stage[\s\S]*data-map-concept[\s\S]*data-map-detail[\s\S]*<\/div>\s*<\/div>/);
 assert.match(shell,/\/claude-export\/map-axon\.css/);
 assert.match(observer,/createAxonReveal/);
 assert.match(observer,/reveal\.show\(origin/);
 assert.match(observer,/reveal\.hide/);
 assert.match(observer,/event\.key === "Escape"/);
 assert.match(scene,/function pointFor\(path\)/);
});
