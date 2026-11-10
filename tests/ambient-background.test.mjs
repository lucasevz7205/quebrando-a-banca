import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import postcss from "postcss";

const css=fs.readFileSync("public/claude-export/ambient-background.css","utf8");
const js=fs.readFileSync("public/claude-export/ambient-background.js","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const observer=fs.readFileSync("src/components/qb/motion/study-motion.js","utf8");

function fakePage({saved=null,reduced=false,saveData=false}={}){
  const listeners={};
  const mediaListeners={};
  const attrs={};
  const stored={};
  if(saved)stored["qb-ambient-background-mode"]=saved;
  const poster=document=>undefined;
  const video={
    listeners:{},muted:false,defaultMuted:false,playsInline:false,
    preload:"",readyState:0,duration:4,currentTime:0,src:"",
    dataset:{qbVideoSrc:"https://d8j0ntlcm91z4.cloudfront.net/example.mp4"},
    playCalls:0,pauseCalls:0,loadCalls:0,
    addEventListener(type,cb){this.listeners[type]=cb;},
    load(){this.loadCalls++;},
    play(){this.playCalls++;return Promise.resolve();},
    pause(){this.pauseCalls++;}
  };
  const layer={
    dataset:{},querySelector(sel){return sel==="[data-qb-background-video]"?video:null;},
    removeAttribute(attr){if(attr==="data-ready")delete this.dataset.ready;}
  };
  const toggle={
    disabled:false,textContent:"",title:"",
    attributes:{},handlers:{},
    setAttribute(k,v){this.attributes[k]=v;},
    addEventListener(k,cb){this.handlers[k]=cb;}
  };
  const doc={
    readyState:"complete",hidden:false,documentElement:{dataset:{}},
    getElementById(k){return k==="qb-ambient-background"?layer:k==="qb-background-toggle"?toggle:null;},
    addEventListener(k,cb){listeners[k]=cb;}
  };
  const matchMedia=()=>({matches:reduced,addEventListener(k,cb){mediaListeners[k]=cb;}});
  vm.runInNewContext(js,{
    document:doc,
    window:{matchMedia,addEventListener(k,cb){listeners["window:"+k]=cb;}},
    navigator:{connection:{saveData}},
    localStorage:{getItem(k){return stored[k]||null;},setItem(k,v){stored[k]=v;}}
  },{filename:"ambient-background.js"});
  return {video,layer,toggle,doc,stored,listeners,mediaListeners};
}

test("O fundo usa exatamente o vídeo público do usuário e fica antes de TODA a UI",()=>{
  const url="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_170109_f96e01a5-b0db-4274-b24d-8d97e99ec928.mp4";
  const background=shell.indexOf('id="qb-ambient-background"');
  const wrap=shell.indexOf('<div class="wrap">');
  const header=shell.indexOf('class="head-row qb-header-row"');
  assert.ok(background>0&&wrap>background&&header>wrap);
  assert.ok(shell.includes(url));
  assert.match(shell,/data-qb-background-video data-qb-video-src="https:\/\/d8j0ntlcm91z4.cloudfront.net\/[^"]+" muted playsinline loop preload="none"/);
  assert.match(shell,/poster="\/claude-export\/ambient-poster\.jpg"/);
  assert.match(shell,/id="qb-background-toggle"/);
  assert.match(shell,/ambient-background\.css\?v=1/);
  assert.match(shell,/ambient-background\.js\?v=1/);
  const img=fs.readFileSync("public/claude-export/ambient-poster.jpg");
  assert.equal(img[0],0xff);
  assert.equal(img[1],0xd8);
  assert.ok(img.length>5_000 && img.length<300_000,"real frame must be a small JPG");
});

test("fundo global cobre viewport, respeita z-index e não intercepta cliques",()=>{
  const tree=postcss.parse(css,{from:"ambient-background.css"});
  assert.ok(tree.nodes.length);
  assert.match(css,/#qb-ambient-background\s*\{[\s\S]*position:fixed/);
  assert.match(css,/width:100vw/);
  assert.match(css,/height:100dvh/);
  assert.match(css,/z-index:0/);
  assert.match(css,/pointer-events:none/);
  assert.match(css,/body > \.wrap\s*\{[\s\S]*z-index:1/);
  assert.match(css,/object-fit:cover/);
  assert.match(css,/url\("\/claude-export\/ambient-poster\.jpg"\)/);
  assert.match(css,/qb-ambient-veil/);
  assert.match(css,/\.qb-study-art\s*\{display:none!important;/);
  assert.match(observer,/doc\.getElementById\("qb-ambient-background"\)/);
});

test("modo em movimento é inicial e alterna para um quadro pausado",()=>{
  const page=fakePage();
  assert.equal(page.toggle.textContent,"Fundo: animado");
  assert.equal(page.toggle.attributes["aria-pressed"],"true");
  assert.equal(page.doc.documentElement.dataset.qbAmbient,"motion");
  assert.equal(page.video.playCalls,1);
  assert.equal(page.video.loadCalls,1);
  page.toggle.handlers.click();
  assert.equal(page.toggle.textContent,"Fundo: estático");
  assert.equal(page.toggle.attributes["aria-pressed"],"false");
  assert.equal(page.doc.documentElement.dataset.qbAmbient,"still");
  assert.ok(page.video.pauseCalls>0);
  assert.equal(page.stored["qb-ambient-background-mode"],"still");
  page.video.listeners.loadeddata();
  assert.equal(page.layer.dataset.ready,"true");
  page.toggle.handlers.click();
  assert.equal(page.video.playCalls,2);
  assert.equal(page.stored["qb-ambient-background-mode"],"motion");
});

test("preferência estática impede download de vídeo e reaproveita a imagem",()=>{
  const page=fakePage({saved:"still"});
  assert.equal(page.video.playCalls,0);
  assert.equal(page.video.loadCalls,0);
  assert.equal(page.video.src,"");
  assert.equal(page.video.preload,"none");
  assert.equal(page.toggle.attributes["aria-pressed"],"false");
  assert.match(css, /url\("\/claude-export\/ambient-poster\.jpg"\)/);
  assert.ok(!page.toggle.disabled);
});

test("acessibilidade e economia de dados respeitadas",()=>{
  const reduced=fakePage({saved:"motion",reduced:true});
  assert.equal(reduced.video.playCalls,0);
  assert.equal(reduced.toggle.disabled,true);
  assert.equal(reduced.toggle.textContent,"Fundo: estático");
  const saver=fakePage({saveData:true});
  assert.equal(saver.video.playCalls,0);
  assert.equal(saver.toggle.textContent,"Fundo: estático");
  saver.toggle.handlers.click();
  assert.equal(saver.video.playCalls,1,"user can explicitly opt into animation");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});

test("vídeo pausa ao ocultar a aba e falha mantém foto de fundo",()=>{
  const page=fakePage();
  page.doc.hidden=true;
  page.listeners.visibilitychange();
  assert.ok(page.video.pauseCalls>0);
  page.doc.hidden=false;
  page.listeners.visibilitychange();
  assert.equal(page.video.playCalls,2);
  page.video.listeners.loadeddata();
  assert.equal(page.layer.dataset.ready,"true");
  page.video.listeners.error();
  assert.equal(page.toggle.disabled,true);
  assert.equal(page.toggle.textContent,"Fundo: indisponível");
  assert.equal(page.layer.dataset.ready,undefined);
});

test("dados de questões e mecanismo de IA não foram alterados pela camada visual",()=>{
  assert.doesNotMatch(js,/ClaudeDocument|studyAccount|writeDocument|questionIds|assistantLLM/);
  assert.match(js,/localStorage\.setItem\(KEY,mode\)/);
  assert.match(js,/video\.muted=true/);
  assert.match(js,/video\.pause\(\)/);
  assert.match(js,/video\.play\(\)/);
  assert.match(js,/video\.src=source/);
  assert.match(js,/video\.load\(\)/);
});
