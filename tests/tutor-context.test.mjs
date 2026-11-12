import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const env={window:{},Map,Set,Date,JSON,Math,String,Object,Number};
vm.runInNewContext(fs.readFileSync('public/claude-export/tutor-context.js','utf8'),env);
const C=env.window.QBTutorContext;
const S=()=>({q:new Map([
  ['dc1-01',{id:'dc1-01',cap:'DC-1',capNome:'DC · 1',tema:'Poder constituinte',enunciado:'X',gabarito:'E',origem:'inédito Claude'}],
  ['dc1-02',{id:'dc1-02',cap:'DC-1',capNome:'DC · 1',tema:'Classificação',enunciado:'Y',gabarito:'C'}],
  ['lp1-01',{id:'lp1-01',cap:'LP-5.4',capNome:'LP',tema:'Vírgula',enunciado:'Z',gabarito:'C'}],
  ['c11-01',{id:'c11-01',cap:'1.1',capNome:'RF',tema:'ASR',enunciado:'W',gabarito:'C'}],
  ['sim01-01',{id:'sim01-01',cap:'SIM-01',enunciado:'S',gabarito:'C'}],
]),r:new Map([
  ['dc1-01',{qid:'dc1-01',tentativas:1,erros:1,noCaderno:true,calib:'excesso',origem:'interferencia',proxRevisao:'2026-11-10',hist:[{c:3,ok:false,em:'2026-11-09T10:00:00Z'}]}],
  ['dc1-02',{qid:'dc1-02',tentativas:1,acertos:1,proxRevisao:'2026-11-20',hist:[{c:3,ok:true,em:'2026-11-09T10:00:00Z'}]}],
  ['lp1-01',{qid:'lp1-01',tentativas:1,erros:1,noCaderno:true,hist:[{c:2,ok:false,em:'2026-11-09T10:00:00Z'}]}],
  ['c11-01',{qid:'c11-01',tentativas:1,erros:1,hist:[{c:1,ok:false,em:'2026-11-09T10:00:00Z'}]}],
  ['sim01-01',{qid:'sim01-01',tentativas:1,erros:1,hist:[{c:3,ok:false,em:'2026-11-09T10:00:00Z'}]}],
])});
test('totais ignoram SIM e contam vencidas e caderno',()=>{
  const c=C.build(S(),{today:'2026-11-11'});
  assert.equal(c.diasAteProva,67);
  assert.match(c.fase,/cobertura/);
  assert.equal(c.totais.respondidas,4);
  assert.equal(c.totais.noCaderno,2);
  assert.equal(c.totais.revisoesVencidas,1);
});
test('erro com certeza e interferência vêm primeiro',()=>{
  const c=C.build(S(),{today:'2026-11-11'});
  assert.equal(c.itensPrioritarios[0].id,'dc1-01');
  assert.ok(c.itensPrioritarios[0].errosComCerteza>=1);
  assert.ok(!c.itensPrioritarios.some(i=>i.id==='dc1-02'));
});
test('recorte por matéria, incluindo RF com capítulos numéricos',()=>{
  assert.equal(C.build(S(),{today:'2026-11-11',recorte:'LP'}).itensPrioritarios.map(i=>i.id).join(),'lp1-01');
  assert.equal(C.build(S(),{today:'2026-11-11',recorte:'RF'}).itensPrioritarios.map(i=>i.id).join(),'c11-01');
  assert.equal(C.recorteDe('Direito Constitucional'),'DC');
  assert.equal(C.recorteDe('Tópico DC-2.2 nacionalidade'),'DC-2.2');
});
test('calibração só com 10 ou mais respostas com certeza',()=>{
  assert.match(C.build(S(),{today:'2026-11-11'}).calibracao14d.aviso,/menos de 10/);
});
test('não altera o estado',()=>{
  const s=S(); const antes=JSON.stringify([...s.r]); C.build(s,{today:'2026-11-11'});
  assert.equal(JSON.stringify([...s.r]),antes);
});
test('referência do tópico traz mapa, itens, pontos e cartões, com limite de tamanho',()=>{
  const S={ed:new Map([['pl-3-1',{titulo:'Regimento Comum'}]]),
    rv:new Map([['pl-3-1',{mapa:{centro:'RCCN',ramos:[{t:'CPMI',n:'1/3 de cada Casa',x:{e:'Criação automática com requerimento.',trap:'1/3 do Congresso',src:'RCCN art. 21'},f:[{t:'Prazo',x:{e:'Prazo certo.'}}]}]},
      itens:[{k:'Sessão conjunta',regra:'Convocada pelo Presidente do Senado.'}],cartoes:[{q:'Quórum da CPMI?',a:['1/3 de cada Casa']}]}]]),
    pt:new Map([['pl-3-1',{itens:[{k:'Veto',d:'Apreciado em sessão conjunta.',src:'CF art. 66'}]}]])};
  const r=C.referencia(S,'pl-3-1');
  for(const t of ['Regimento Comum','CPMI [1/3 de cada Casa]','Pegadinha: 1/3 do Congresso','Fonte: RCCN art. 21','  - Prazo','Sessão conjunta','PONTOS-CHAVE','Quórum da CPMI?']) assert.ok(r.includes(t),t);
  assert.ok(C.referencia(S,'pl-3-1',200).length<=200);
  assert.equal(C.referencia(S,'xx-9'),'');
});
