import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const script=fs.readFileSync('public/claude-export/learning.js','utf8');
const env={window:{},crypto:webcrypto,Map,Set,Date};
vm.runInNewContext(script,env);const L=env.window.QBLearning;
const state=()=>({q:new Map(),r:new Map(),cfg:new Map(),rodadas:[],learningEvents:new Map(),learningContent:new Map()});
const e=(id,item,day,extra={})=>({id,item,at:'2026-11-'+String(day).padStart(2,'0')+'T12:00:00Z',version:'1',kind:'attempt',origin:'treino',marked:'C',ok:true,confidence:2,concept:'k',exposure:'unknown',...extra});
test('P1: four confidence states and distinct feedback for correct with doubt',()=>{
 const S=state();const q={id:'q',cap:'TI-2',comentario:'<img src=x onerror=x>',gabarito:'C',enunciado:'x'};
 assert.equal(L.feedback(S,q,{marcada:'B',conf:null}),'');
 assert.equal(L.feedback(S,q,{marcada:'C',conf:null,acertou:true}),'');
 assert.match(L.feedback(S,q,{marcada:'E',conf:3,acertou:false}),/Erro com certeza/);
 assert.match(L.feedback(S,q,{marcada:'E',conf:2,acertou:false}),/dúvida/);
 assert.match(L.feedback(S,q,{marcada:'C',conf:3,acertou:true}),/Certeza e acerto/);
 const intervention=L.feedback(S,q,{marcada:'C',conf:2,acertou:true,pilotFeedback:'especifico'});
 assert.match(intervention,/Evocação rápida/);
 assert.doesNotMatch(intervention,/<img|onerror/);
 assert.equal(L.feedback(S,q,{marcada:'C',conf:2,acertou:true,pilotFeedback:'padrao'}),'');
});
test('P1: feature off and metadata idempotent; content version changes',()=>{
 const S=state(),q={id:'q',cap:'c',enunciado:'one',gabarito:'C',comentario:'rule',ref:'source'},rd={id:'r',idx:0};
 const a=L.metadata(S,q,'C',2,rd),b=L.metadata(S,q,'C',2,rd);
 assert.equal(a.id,b.id);assert.equal(a.exposure,'unknown');
 assert.notEqual(L.version(q),L.version({...q,gabarito:'E'}));
 assert.equal(a.allocation,'piloto-p1-por-tentativa-v1');
 const arms=new Set(Array.from({length:64},(_,i)=>L.metadata(S,q,'C',2,{id:'r'+i,idx:i%4}).feedback));
 assert.deepEqual([...arms].sort(),['especifico','padrao']);
 S.cfg.set('aprendizagem',{flags:{p1:false}});
 assert.equal(L.feedback(S,q,{marcada:'C',conf:2,acertou:true}),'');
});
test('P4: overlap of seen, novel and delayed populations, first check only',()=>{
 const refs=[e('p1','a',1),e('p2','b',1),e('p3','c',1),e('p4','d',1)];
 const checks=[e('a1','a',8,{exposure:'seen',reference:'p1'}),e('b1','b',8,{exposure:'seen',reference:'p2',ok:false,marked:'E'}),
 e('v1','v1',8,{origin:'transferencia',exposure:'new',reviewed:true,reference:'p3'}),
 e('v2','v2',8,{origin:'transferencia',exposure:'new',reviewed:true,reference:'p4'})];
 const m=L.metrics([...refs,...checks,{id:'legacy'},checks[0],e('again','a',9,{reference:'p1',exposure:'seen'})]);
 assert.equal(m.retention.length,4);assert.equal(m.retention.filter(x=>x.ok).length,3);
 assert.equal(m.retentionSeen.length,2);assert.equal(m.retentionNew.length,2);assert.equal(m.transfer.length,2);
});
test('P4: unknown confidence, changed versions, blanks and invalid events',()=>{
 const m=L.metrics([e('p','a',1),e('new-version','a',8,{version:'2',reference:'p',exposure:'unknown'}),
 e('blank','b',2,{marked:'B',confidence:null,ok:false}),e('bad','c',3,{invalid:true})]);
 assert.equal(m.retention.length,0);assert.equal(m.confidence.unknown.length,1);assert.equal(m.excluded,1);
});
test('P2: reject ungraded practice, errors, unknown sources, unreviewed or exposed variants',()=>{
 const S=state(),q={id:'source',enunciado:'original',gabarito:'C',comentario:'explication',ref:'ref'};
 const c={id:'v',type:'variant',reviewed:true,reserved:true,contextChanged:true,concept:'k',answer:'C',prompt:'new context',explanation:'rule',reference:'source',sourceItems:['source']};
 S.learningContent.set('v',c);assert.equal(L.eligibleVariants(S).length,0);
 S.learningEvents.set('p',e('p','source',1,{kind:'practice',skipped:false,concept:'k'}));
 assert.equal(L.eligibleVariants(S).length,0,'Ungraded recall is not evidence of mastery');
 S.q.set('source',q);
 S.learningEvents.set('a',e('a','source',1,{ok:false,marked:'E',concept:'k',version:L.version(q)}));
 assert.equal(L.eligibleVariants(S).length,0,'Incorrect source attempt cannot unlock transfer');
 S.learningEvents.set('b',e('b','source',2,{ok:true,marked:'C',concept:'k',version:L.version(q)}));
 assert.equal(L.eligibleVariants(S).length,1,'Correct source attempt unlocks a vetted variant');
 S.learningEvents.set('seen',{id:'seen',kind:'exposure',item:'v'});
 assert.equal(L.eligibleVariants(S).length,0);
 S.learningEvents.delete('seen');c.reviewed=false;assert.equal(L.eligibleVariants(S).length,0);
});
test('P4: ungraded free text cannot prove transfer or delayed retention',()=>{
 const p=e('p','src',1,{kind:'practice',skipped:false,ok:null});
 const v=e('v','variant',8,{origin:'transferencia',exposure:'new',reviewed:true,reference:'p',concept:'k'});
 const result=L.metrics([p,v]);assert.equal(result.transfer.length,0);assert.equal(result.retention.length,0);
});
test('P6: deterministic, insufficient fallback, no input mutation, exam cap',()=>{
 const hs=[e('a','q',1,{confidence:3}),e('b','q',2,{confidence:3}),e('c','q',3,{confidence:3})],copy=JSON.stringify(hs);
 assert.equal(L.simulate([], '2026-11-10','2026-11-08').suggestedDue,'2026-11-10');
 const a=L.simulate(hs,'2026-11-10','2026-11-08','2026-11-13');
 assert.equal(a.days,1);assert.deepEqual(a,L.simulate(hs,'2026-11-10','2026-11-08','2026-11-13'));assert.equal(JSON.stringify(hs),copy);
});
test('P3/P5/P7: malformed editorial content rejected',()=>{
 assert.throws(()=>L.validateCard({type:'duel'}),/Preencha/);
 assert.equal(L.validateCard({type:'duel',title:'pair',concept:'k',prompt:'contrast',explanation:'difference',reference:'source'}),true);
});
test('P1 panel has four state counters, pilot caveats and no invented retention',()=>{
 const S=state();S.learningEvents.set('a',e('a','a',1,{confidence:3,ok:true}));
 S.learningEvents.set('b',e('b','b',2,{confidence:2,ok:true}));
 S.learningEvents.set('c',e('c','c',3,{confidence:2,ok:false,marked:'E'}));
 S.learningEvents.set('d',e('d','d',4,{confidence:3,ok:false,marked:'E'}));
 const html=L.render(S,'2026-11-08');
 for(const name of ['Acertou · certeza','Acertou · dúvida','Errou · dúvida','Errou · certeza','Resultado ainda inconclusivo','Confiança não é domínio'])assert.match(html,new RegExp(name));
 assert.match(html,/Feedback \+ evocação/);
});
test('No original study counters are modified by rendering metrics',()=>{
 const S=state();S.r.set('q',{tentativas:17,acertos:12,erros:5,proxRevisao:'2026-11-09'});const before=JSON.stringify([...S.r]);
 L.render(S,'2026-11-08');assert.equal(JSON.stringify([...S.r]),before);
});
test('All inline scripts parse',()=>{
 const html=fs.readFileSync('public/claude-export/index.html','utf8');
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
});
