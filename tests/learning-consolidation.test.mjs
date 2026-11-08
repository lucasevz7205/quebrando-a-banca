import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('public/claude-export/index.html','utf8');
const source=fs.readFileSync('public/claude-export/learning.js','utf8');
const state=()=>({q:new Map(),r:new Map(),cfg:new Map(),rodadas:[],learningEvents:new Map(),learningContent:new Map(),mat:new Map()});
const env={window:{},Map,Set,Date};
vm.runInNewContext(source,env);
const L=env.window.QBLearning;

test('Aprendizagem lives under Estudo; historical Desempenho keeps no duplicate tab',()=>{
 const navigation=html.match(/const PAI=([^;]+);\s*const SUBS=([^;]+);/);
 assert.ok(navigation,'Navigation declarations found');
 const pai=vm.runInNewContext('('+navigation[1]+')'),subs=vm.runInNewContext('('+navigation[2]+')');
 assert.equal(pai.aprendizagem,'estudo');
 assert.ok(subs.estudo.some(([key])=>key==='aprendizagem'));
 assert.equal(subs.historico.some(([key])=>key==='aprendizagem'),false);
});

test('Learning page keeps evidence and revision simulator, not a second practice or card editor',()=>{
 const markup=L.render(state(),'2026-11-08');
 assert.match(markup,/data-id="indicadores"/);
 assert.match(markup,/data-id="agenda"/);
 assert.doesNotMatch(markup,/data-id="pratica"|data-id="editor"|Duelo: DNS|Preparar atividades/);
});

test('Pegadinhas already has cross-subject concept pairs and does not need three TI-only duels',()=>{
 const json=JSON.parse(fs.readFileSync('scripts/claude-seed/pegadinhas.json','utf8'));
 const rows=Array.isArray(json)?json:Object.values(json).flat().filter(x=>x&&typeof x==='object');
 const pairs=rows.filter(x=>Array.isArray(x.par)&&x.par.length>=2);
 const areas=new Set(pairs.map(x=>String(x.topico||'').split('-')[0]));
 assert.ok(pairs.length>100);
 for(const area of ['da','dc','lp','pl','rf','ti'])assert.ok(areas.has(area));
 assert.match(html,/qb-trap-contrast/);
 assert.match(html,/qual característica muda o julgamento do item/);
});

test('Materials link only contextual pretests; unfinished transfer variants remain hidden',()=>{
 const S=state();
 S.learningContent.set('r',{id:'r',type:'recall',material:'m',title:'Repeat card'});
 S.learningContent.set('p',{id:'p',type:'pretest',material:'m',title:'Probe'});
 S.learningContent.set('v',{id:'v',type:'variant',material:'m',reviewed:false,reserved:true,contextChanged:true,concept:'k',answer:'C',prompt:'Question',explanation:'Explanation',reference:'Reference'});
 const body=L.contentHTML(S,{id:'m'});
 assert.match(body,/Sondagem antes da leitura/);
 assert.doesNotMatch(body,/Evocar sem consultar|Repeat card/);
 assert.equal(L.pegadinhasHTML(S),'');
 assert.match(html,/QBLearning\.activityHTML\(\)/);
});
