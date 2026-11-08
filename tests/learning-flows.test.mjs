import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync('public/claude-export/learning.js','utf8');
function harness(card) {
 const S={q:new Map(),r:new Map(),cfg:new Map(),rodadas:[],mat:new Map(),view:'aprendizagem'};
 const saved=new Map(),callbacks=new Map();let failNext=false;
 const button={dataset:{learn:'',id:''},addEventListener:(name,cb)=>callbacks.set(name,cb)};
 const draft={dataset:{learnDraft:'response'},value:'',addEventListener:(_name,cb)=>callbacks.set('input',cb)};
 const doc={querySelectorAll:s=>s==='[data-learn]'?[button]:s==='[data-learn-draft]'?[draft]:[],
 querySelector:()=>({value:'C'}),getElementById:()=>({value:'2'})};
 S.db={collection:name=>({onSnapshot:cb=>cb({docs:name==='aprendizagem_conteudos'?[{id:card.id,data:()=>card}]:[]})}),
 doc:path=>({set:async value=>{if(failNext){failNext=false;throw Error('Synthetic failure')}saved.set(path,structuredClone(value));}})};
 const env={window:{},document:doc,crypto:webcrypto,Map,Set,Date};
 vm.runInNewContext(source,env);const L=env.window.QBLearning;
 const api={render:()=>{},hoje:()=> '2026-11-08',setView:v=>{S.view=v},startSource:()=>{}};
 L.mount(S,api);
 return {S,L,saved,fail:()=>{failNext=true},html:()=>L.render(S,'2026-11-08'),
 async click(name,id=''){button.dataset={learn:name,id};L.wire(S,api);await callbacks.get('click')()},
 type(text){draft.value=text;L.wire(S,api);callbacks.get('input')()}};
}
const card={id:'recall',type:'recall',title:'Recall',concept:'k',prompt:'Explain the rule',explanation:'SECRET RULE',reference:'Source',version:'v1'};
test('P5: correction hidden until attempted; attempt saved before feedback; double click does not duplicate',async()=>{
 const h=harness(card);await h.click('start','recall');assert.doesNotMatch(h.html(),/SECRET RULE/);
 h.type('My explanation');await h.click('answer');
 assert.match(h.html(),/SECRET RULE/);
 let rows=[...h.saved.values()].filter(x=>x.kind==='practice');assert.equal(rows.length,1);assert.equal(rows[0].skipped,false);
 await h.click('answer');assert.equal([...h.saved.values()].filter(x=>x.kind==='practice').length,1);
 assert.equal(h.S.r.size,0);assert.equal(h.S.rodadas.length,0);
});
test('P7: skip is separate from mastery and marks known content',async()=>{
 const h=harness({...card,type:'pretest',sourceItems:['q']});h.S.r.set('q',{tentativas:1});
 await h.click('start','recall');assert.match(h.html(),/conteúdo já praticado/);await h.click('skip');
 const e=[...h.saved.values()].find(x=>x.kind==='practice');assert.equal(e.skipped,true);assert.equal(e.ok,null);assert.equal(e.knownContent,true);
 assert.equal(h.L.metrics([...h.saved.values()]).immediate.length,0);
});
test('Failed write hides correction; same event retries without duplicate; completion recorded',async()=>{
 const h=harness(card);await h.click('start','recall');h.type('response');h.fail();await h.click('answer');
 assert.doesNotMatch(h.html(),/SECRET RULE/);assert.match(h.html(),/Tentar salvar/);
 await h.click('retry');assert.match(h.html(),/SECRET RULE/);
 assert.equal([...h.saved.values()].filter(x=>x.kind==='practice').length,1);
 await h.click('close');assert.equal([...h.saved.values()].filter(x=>x.kind==='completion').length,1);
});
test('P8: same weekly decision updates one logical record',async()=>{
 const h=harness(card);await h.click('weekly','2026-11-08');await h.click('weekly','2026-11-08');
 assert.equal([...h.saved.values()].filter(x=>x.kind==='weekly').length,1);
});
test('P2: two independent windows never share an event identifier',async()=>{
 const a=harness(card),b=harness(card);await a.click('start','recall');await b.click('start','recall');
 const aid=[...a.saved.values()][0].id,bid=[...b.saved.values()][0].id;assert.notEqual(aid,bid);
});
