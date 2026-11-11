import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {placeMap, statusDepth} from '../src/components/qb/mind-map/layout.js';
import {resolveLabelPositions, initials} from '../src/components/qb/mind-map/mouse-navigation.js';

test('2,5D: profundidade só codifica o diagnóstico, igual para o mesmo status',()=>{
  const graph={title:'T',nodes:[
    {path:'0',parent:'root',title:'A',status:'deficiente'},
    {path:'0.0',parent:'0',title:'A1',status:'forte'},
    {path:'0.1',parent:'0',title:'A2',status:'forte'},
    {path:'1',parent:'root',title:'B',status:'sem-evidencia'},
  ]};
  const pos=new Map(placeMap(graph).map(p=>[p.path,p]));
  assert.equal(pos.get('0').z,statusDepth('deficiente'));
  assert.equal(pos.get('0.0').z,pos.get('0.1').z);
  assert.equal(pos.get('1').z,0);
  assert.ok(pos.get('0').z>pos.get('0.0').z,'o que precisa de reforço fica à frente');
});
test('os 29 mapas da Câmara continuam com conceitos ligados afastados no plano',()=>{
  const rv=JSON.parse(fs.readFileSync('scripts/claude-seed/revisao.json','utf8')).filter(x=>x.mapa?.ramos);
  for(const r of rv){
    const nodes=[];const visit=(n,path,parent)=>{nodes.push({path,parent,title:n.t,status:'sem-evidencia'});(n.f||[]).forEach((c,i)=>visit(c,path+'.'+i,path));};
    r.mapa.ramos.forEach((n,i)=>visit(n,String(i),'root'));
    const pos=new Map(placeMap({title:'x',nodes}).map(p=>[p.path,p]));
    for(const n of nodes){const a=pos.get(n.path),b=pos.get(n.parent);if(!b)continue;
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>2.5,`${r.id} ${n.path} perto demais do pai`);}
  }
});
test('rótulo que colide vira iniciais em vez de sumir',()=>{
  const res=resolveLabelPositions([
    {path:'a',index:0,priority:0,x:100,y:100,width:160,height:30,shortWidth:40},
    {path:'b',index:1,priority:1,x:215,y:100,width:160,height:30,shortWidth:40},
  ],{width:400,height:300,padding:8});
  assert.ok(res.get('a')&&!res.get('a').short);
  assert.equal(res.get('b')?.short,true);
  assert.equal(initials('Processo legislativo ordinário'),'PLO');
});
test('evocação: texto, correção do Omni com trecho marcado e registro só em evocacoes',()=>{
  const env={window:{},CSS:{escape:s=>s},Map,Date,Object,String,Array};
  vm.runInNewContext(fs.readFileSync('public/claude-export/map-evocar.js','utf8'),env);
  const E=env.window.QBMapEvocar;
  const ctx={topic:'pl-3-1',path:'0.1',title:'CPMI',detailHTML:'<p>exp</p>',tour:{i:1,n:3},iaDisponivel:true};
  const html=E.render(ctx);
  assert.match(html,/data-evo-resp/);
  assert.doesNotMatch(html,/<p>exp<\/p>/,'a explicação não aparece antes da tentativa');
  assert.match(E.marcarErros('um terço do Congresso',[{trecho:'do Congresso'}]),/<mark class="qb-evo-erro">do Congresso<\/mark>/);
  const st=E._state.get('pl-3-1:0.1'); st.fase='revelado'; st.resp='x';
  st.ia={veredito:'parcial',acertou:[],faltou:['de cada Casa'],erros:[{trecho:'x',problema:'p',correcao:'c'}],pergunta:'q?'};
  const aberto=E.render(ctx);
  assert.match(aberto,/<p>exp<\/p>/);
  assert.match(aberto,/data-evo-aval="s"/);
  assert.match(aberto,/data-evo-proximo/);
});
test('servidor: tarefa evocar-corrigir valida trecho literal',()=>{
  const src=fs.readFileSync('src/lib/omnistudy-ai.js','utf8');
  assert.match(src,/task: z\.literal\("evocar-corrigir"\)/);
  assert.match(src,/trecho && texto\.includes\(trecho\) \? trecho : ""/);
  assert.match(fs.readFileSync('src/lib/study-documents.js','utf8'),/"evocacoes"/);
});
test('percurso de evocação e controles 2,5D ligados no mapa',()=>{
  const obs=fs.readFileSync('src/components/qb/mind-map/observe.js','utf8');
  const shell=fs.readFileSync('src/components/qb/study-shell.html','utf8');
  assert.match(obs,/qb-map-tour-next/);
  assert.match(shell,/data-map-tour/);
  assert.match(shell,/data-map-camera="front"/);
  assert.match(shell,/evocar:true/);
  assert.match(shell,/map-evocar\.js\?v=1/);
});
