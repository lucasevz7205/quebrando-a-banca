import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {placeMap} from "../src/components/qb/mind-map/layout.js";
import {wheelZoomFactor,directionalPanOffset,nearestProjectedHit,resolveLabelPositions} from "../src/components/qb/mind-map/mouse-navigation.js";

test("a roda aproxima/afasta suavemente sem saltos de trackpad ou valores extremos",()=>{
 const out=wheelZoomFactor(120),into=wheelZoomFactor(-120);
 assert.ok(out>1.10&&out<1.24);
 assert.ok(Math.abs(out*into-1)<1e-9);
 assert.ok(wheelZoomFactor(3)>1&&wheelZoomFactor(3)<1.01);
 assert.ok(wheelZoomFactor(3,1)>wheelZoomFactor(3));
 assert.ok(wheelZoomFactor(2000)<1.22,"picos de rolagem devem ser limitados");
 assert.ok(wheelZoomFactor(-2000)>.8);
});
test("as quatro setas deslocam a câmera no plano da tela sem alterar o zoom",()=>{
 const up=directionalPanOffset("pan-up",20,42,1.5);
 const down=directionalPanOffset("pan-down",20,42,1.5);
 const left=directionalPanOffset("pan-left",20,42,1.5);
 const right=directionalPanOffset("pan-right",20,42,1.5);
 assert.ok(up.up>0 && up.right===0);
 assert.equal(down.up,-up.up);
 assert.ok(left.right<0 && left.up===0);
 assert.equal(right.right,-left.right);
 assert.equal(Math.hypot(right.right,right.up),Math.hypot(left.right,left.up));
 assert.ok(directionalPanOffset("pan-right",70,42,1.5).right>right.right);
 assert.ok(directionalPanOffset("pan-right",5,42,1.5).right<right.right);
 assert.equal(directionalPanOffset("rotate",20),null);
});
test("controles de setas ficam dentro do palco 3D e usam deslocamento da visão",()=>{
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 const scene=fs.readFileSync("src/components/qb/mind-map/scene.js","utf8");
 const css=fs.readFileSync("public/claude-export/map-dpad.css","utf8");
 const start=shell.indexOf('class="qb-map3-stage" data-map-stage');
 const close=shell.indexOf('data-map-concept data-open=',start);
 const pad=shell.indexOf('class="qb-map3-dpad"',start);
 assert.ok(start>=0&&pad>start&&pad<close);
 for(const action of ["pan-up","pan-down","pan-left","pan-right"]){
   assert.ok(shell.includes('data-map-camera="'+action+'"'));
 }
 assert.match(shell,/map-dpad\.css\?v=1/);
 assert.match(scene,/directionalPanOffset\(action,camera\.position\.distanceTo\(controls\.target\),camera\.fov,camera\.aspect\)/);
 assert.match(scene,/camera\.position\.add\(shift\)/);
 assert.match(scene,/controls\.target\.add\(shift\)/);
 assert.match(css,/z-index: 6/);
 assert.match(css,/touch-action: manipulation/);
});
test("nós próximos ao clique são alcançáveis mesmo fora do raio da pequena esfera",()=>{
 const nodes=[{path:"0",x:100,y:100,visible:true,radius:7},
              {path:"1",x:128,y:115,visible:true,radius:7},
              {path:"2",x:180,y:100,visible:false,radius:7}];
 assert.equal(nearestProjectedHit(nodes,{x:110,y:105},24),"0");
 assert.equal(nearestProjectedHit(nodes,{x:133,y:116},24),"1");
 assert.equal(nearestProjectedHit(nodes,{x:180,y:100},15),null);
 assert.equal(nearestProjectedHit(nodes,{x:10,y:10},24),null);
});
test("desambiguação dos rótulos prioriza seleção e impede sobreposição",()=>{
 const entries=[
  {path:"r",x:260,y:120,width:150,height:30,index:0,priority:0},
  {path:"x",x:262,y:122,width:150,height:30,index:1,priority:5},
  {path:"y",x:75,y:200,width:110,height:30,index:2,priority:4},
  {path:"z",x:80,y:200,width:105,height:30,index:3,priority:3},
 ];
 const positions=resolveLabelPositions(entries,{width:520,height:400});
 assert.equal(positions.has("r"),true);
 assert.equal(positions.has("x"),false);
 assert.equal(positions.has("z"),true);
 assert.equal(positions.has("y"),false);
 assert.equal(positions.size,2);
});
test("layout redistribui todos os 29 mapas da Câmara com anéis maiores e separação de profundidade",()=>{
 const rev=JSON.parse(fs.readFileSync("scripts/claude-seed/revisao.json","utf8")).filter(r=>r.mapa?.ramos);
 assert.equal(rev.length,29);
 for(const m of rev){
  const nodes=[];
  function walk(n,path,parent){nodes.push({path,parent,title:n.t,status:n.status,id:n.id});
   (n.f||[]).forEach((c,i)=>walk(c,path+"."+i,path));}
  m.mapa.ramos.forEach((n,i)=>walk(n,String(i),"root"));
  const layout=placeMap({title:m.mapa.centro,nodes});
  const pos=new Map(layout.map(x=>[x.path,x]));
  assert.equal(layout.length,nodes.length+1,m.id);
  assert.equal(new Set(layout.map(n=>n.path)).size,layout.length,m.id);
  for(const n of nodes){
   const from=pos.get(n.parent),to=pos.get(n.path);
   const d=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z);
   assert.ok(d>3.45,m.id+"/"+n.path+" has too little room: "+d);
   assert.equal(to.title,n.title);
  }
  for(const n of layout.filter(n=>n.depth===1)){
   assert.ok(Math.hypot(n.x,n.y)>4.6,m.id+" first ring too tight");
  }
 }
});
test("câmera usa apenas nós visíveis, zoom centralizado no cursor e mouse direito para mover",()=>{
 const scene=fs.readFileSync("src/components/qb/mind-map/scene.js","utf8");
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 assert.match(scene,/function fitDistance\(\)/);
 assert.match(scene,/visibleSlots\.map\(i=>world\[i\]\.length\(\)\)/);
 assert.match(scene,/wheelZoomFactor\(event\.deltaY,event\.deltaMode,height\)/);
 assert.match(scene,/stage\.addEventListener\("wheel",onWheel,\{capture:true,passive:false\}\)/);
 assert.match(scene,/wheelRay\.ray\.intersectPlane\(wheelPlane,wheelBefore\)/);
 assert.match(scene,/camera\.position\.add\(translation\)/);
 assert.match(scene,/MOUSE\.ROTATE,MIDDLE:MOUSE\.DOLLY,RIGHT:MOUSE\.PAN/);
 assert.match(scene,/screenSpacePanning = true/);
 assert.match(scene,/nearestProjectedHit/);
 assert.match(scene,/resolveLabelPositions/);
 assert.match(scene,/onPointerMove/);
 assert.match(scene,/onContextMenu/);
 assert.match(scene,/370\);/);
 assert.match(scene,/if\(stamp-lastHover<38\)return/);
 assert.match(shell,/data-map-quick-branches/);
 const observer=fs.readFileSync("src/components/qb/mind-map/observe.js","utf8");
 assert.match(observer,/button\.dataset\.mapJump=node\.path/);
 assert.match(observer,/select\(button\.dataset\.mapJump,true,false\)/);
 assert.match(shell,/map-navigation\.css/);
 assert.match(shell,/Roda do mouse: zoom no cursor/);
 assert.match(scene,/const tip=new Color\(colorFor\(target\)\)/,"cores do diagnóstico intactas");
});
