import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createBranchVisibility} from "../src/components/qb/mind-map/branch-visibility.js";
import {createNodeActivation} from "../src/components/qb/mind-map/node-activation.js";

const graph={title:"Assunto",nodes:[
 {path:"0",parent:"root",title:"Ramo A"},
 {path:"0.0",parent:"0",title:"Subramo A1"},
 {path:"0.0.0",parent:"0.0",title:"Folha A11"},
 {path:"0.1",parent:"0",title:"Subramo A2"},
 {path:"1",parent:"root",title:"Ramo B"},
 {path:"1.0",parent:"1",title:"Subramo B1"},
 {path:"1.0.0",parent:"1.0",title:"Folha B11"}
]};
const sorted=s=>[...s].sort();
test("padrão mostra ramos e subramos, mas recolhe as camadas profundas",()=>{
 const tree=createBranchVisibility(graph);
 assert.deepEqual(sorted(tree.visiblePaths()),sorted(["root","0","0.0","0.1","1","1.0"]));
 assert.equal(tree.isExpanded("root"),true);
 assert.equal(tree.isExpanded("0"),true);
 assert.equal(tree.isExpanded("0.0"),false);
 assert.equal(tree.isVisible("0.0.0"),false);
 assert.equal(tree.summary().total,8);
});
test("abrir e fechar cada ramo preserva irmãos, descendentes e estrutura",()=>{
 const tree=createBranchVisibility(graph);
 assert.equal(tree.open("0.0"),true);
 assert.equal(tree.isVisible("0.0.0"),true);
 assert.equal(tree.close("0"),true);
 assert.equal(tree.isVisible("0.0"),false);
 assert.equal(tree.isVisible("0.0.0"),false);
 assert.equal(tree.isVisible("1.0"),true);
 assert.equal(tree.toggle("0"),true);
 assert.equal(tree.isVisible("0.0.0"),true,"estado das subramificações deve sobreviver ao fechamento do pai");
 assert.equal(tree.toggle("0.0.0"),false,"folhas não podem abrir ramos inexistentes");
 assert.equal(tree.close("mapa-inexistente"),false);
});
test("recolher todos mantém centro e ramos principais, expandir todos revela tudo",()=>{
 const tree=createBranchVisibility(graph);
 tree.openAll();
 assert.equal(tree.summary().visible,8);
 tree.collapseAll();
 assert.deepEqual(sorted(tree.visiblePaths()),["0","1","root"]);
 assert.equal(tree.isExpanded("root"),true);
 assert.equal(tree.isExpanded("0"),false);
 tree.openAll();
 assert.equal(tree.summary().visible,8);
});
test("selecionar um conceito oculto abre somente os seus ancestrais",()=>{
 const tree=createBranchVisibility(graph);
 tree.collapseAll();
 assert.equal(tree.reveal("0.0.0"),true);
 assert.equal(tree.isVisible("0.0.0"),true);
 assert.equal(tree.isVisible("1.0"),false);
 assert.equal(tree.isExpanded("0.0.0"),false);
 assert.equal(tree.reveal("x.y"),false);
});
test("ramificações persistem entre reconstruções do mesmo assunto",()=>{
 const a=createBranchVisibility(graph);
 a.close("0");
 a.open("1.0");
 const before=a.visiblePaths();
 const b=createBranchVisibility(graph,{expandedPaths:a.expandedPaths()});
 assert.deepEqual(sorted(b.visiblePaths()),sorted(before));
 assert.equal(b.isExpanded("0"),false);
 assert.equal(b.isExpanded("1.0"),true);
});
test("um clique seleciona, dois cliques/taps abrem; mudanças de nó não viram duplo clique",()=>{
 const actions=[];
 const activate=createNodeActivation((...args)=>actions.push(args));
 assert.equal(activate("0",{detail:1,timeStamp:100}),false);
 assert.deepEqual(actions.at(-1),["0",false,false]);
 assert.equal(activate("1",{detail:1,timeStamp:180}),false);
 assert.equal(activate("0",{detail:1,timeStamp:260}),false);
 assert.equal(activate("0",{detail:1,timeStamp:390}),true);
 assert.deepEqual(actions.at(-1),["0",true,true]);
 assert.equal(activate("0",{detail:1,timeStamp:1000}),false);
 assert.equal(activate("0",{detail:1,timeStamp:1500}),false);
 assert.equal(activate("0",{detail:2,timeStamp:1900}),true);
});
test("seleção por teclado não aciona explicação nem cria duplo clique falso",()=>{
 const values=[];
 const activate=createNodeActivation((...args)=>values.push(args));
 assert.equal(activate("0",{detail:0,timeStamp:100}),false);
 assert.equal(activate("0",{detail:1,timeStamp:140}),false);
 assert.equal(activate("0",{detail:1,timeStamp:210}),true);
});
test("os 29 mapas existentes preservam IDs, cores e ramificação profunda",()=>{
 const revisions=JSON.parse(fs.readFileSync("scripts/claude-seed/revisao.json","utf8")).filter(x=>x.mapa?.ramos);
 assert.equal(revisions.length,29);
 for(const rev of revisions){
  const nodes=[];
  function walk(node,path,parent){nodes.push({path,parent,title:node.t,id:node.id,status:node.status});(node.f||[]).forEach((n,i)=>walk(n,path+"."+i,path));}
  rev.mapa.ramos.forEach((n,i)=>walk(n,String(i),"root"));
  const model=createBranchVisibility({title:rev.mapa.centro,nodes});
  const base=new Set(nodes.map(x=>x.path));
  model.openAll();
  assert.equal(model.summary().visible,nodes.length+1,rev.id);
  model.collapseAll();
  assert.ok(model.summary().visible<nodes.length+1,rev.id);
  assert.deepEqual(new Set(nodes.map(x=>x.path)),base,"a estrutura não deve mudar");
 }
});
test("as linhas e esferas 3D são filtradas juntas sem perder colorações de desempenho",()=>{
 const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
 const scene=fs.readFileSync("src/components/qb/mind-map/scene.js","utf8");
 const observe=fs.readFileSync("src/components/qb/mind-map/observe.js","utf8");
 for(const name of ['open','close','all','minimal'])assert.match(shell,new RegExp('data-map-branch="'+name+'"'));
 assert.match(shell,/map-branches\.css/);
 assert.match(scene,/visiblePaths\.has\(parent\)&&visiblePaths\.has\(child\)/);
 assert.match(scene,/visibleSlots\[hit\.instanceId\]/);
 assert.match(scene,/spheres\.count=slot/);
 assert.match(scene,/visiblePaths\.has\(node\.path\)/);
 assert.match(scene,/const tip=new Color\(colorFor\(target\)\)/);
 assert.match(scene,/createNodeActivation\(onSelect\)/);
 assert.match(observe,/function select\(path, zoom = true, expand = false\)/);
 assert.match(observe,/function change\(\) \{ select\(chooser\.value,false,false\)/);
 assert.match(observe,/data-map-branch-status/);
 assert.match(observe,/select\(lastPath, true, true\)/);
 assert.match(observe,/rememberedBranches=scene\.expandedPaths\(\)/);
});
