import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const server=fs.readFileSync('src/lib/omnistudy-ai.js','utf8');
const curator=fs.readFileSync('public/claude-export/question-curator.js','utf8');
test('geradores de cartões e de questões recebem as regras de fidelidade',()=>{
  assert.match(server,/const ITEM_RULES = \[/);
  assert.ok(server.split('ITEM_RULES').length>=4,'usado em flashcards e questões do mapa');
  assert.match(server,/nunca transcreva texto de lei de memória/);
  assert.match(server,/\[sem fonte: conferir\]/);
  assert.doesNotMatch(server,/com base na doutrina e legislação atualizada do edital/);
  assert.match(server,/NÃO troque o gabarito/);
});
test('curadoria sem IA não simula parecer',()=>{
  assert.doesNotMatch(curator,/Análise local: a assertiva foi ajustada/);
  assert.match(curator,/Curadoria por IA indisponível agora/);
});
test('questão reformulada perde a origem de prova real e guarda o original',()=>{
  const win={document:{getElementById:()=>null,querySelector:()=>null,addEventListener(){},body:{}},addEventListener(){},console};
  win.window=win; win.globalThis=win;
  vm.runInNewContext(curator,win);
  const api=win.QBQuestionCurator||win.QuestionCurator;
  assert.ok(api&&typeof api.saveCuratedQuestion==='function','API exposta');
  const S={q:new Map([['x1',{id:'x1',enunciado:'A',gabarito:'C',origem:'Cebraspe 2026 · Câmara'}]])};
  api.saveCuratedQuestion('x1',{enunciado:'B',gabarito:'E'},{S});
  const q=S.q.get('x1');
  assert.equal(q.origem,'reformulado por IA · original: Cebraspe 2026 · Câmara');
  assert.equal(q.originalCuradoria.enunciado,'A');
  assert.equal(q.originalCuradoria.gabarito,'C');
  api.saveCuratedQuestion('x1',{enunciado:'C'},{S});
  assert.equal(S.q.get('x1').originalCuradoria.enunciado,'A','original não é sobrescrito');
  assert.equal(S.q.get('x1').origem,'reformulado por IA · original: Cebraspe 2026 · Câmara');
});
