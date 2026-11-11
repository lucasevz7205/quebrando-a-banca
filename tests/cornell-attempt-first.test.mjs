import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const client=fs.readFileSync('public/claude-export/omnistudy-cornell.js','utf8');
const server=fs.readFileSync('src/lib/omnistudy-ai.js','utf8');
test('geração Cornell por IA exige tentativa de memória antes (cliente)',()=>{
  assert.match(client,/const MIN_ATTEMPT = 120/);
  assert.match(client,/id="omni-cornell-attempt"/);
  assert.match(client,/attempt\.length < MIN_ATTEMPT/);
  assert.match(client,/task: "summarize-cornell", topic, rawNotes, attempt/);
});
test('servidor recusa geração sem tentativa e devolve lacunas e erros',()=>{
  assert.match(server,/attempt: z\.string\(\)\.min\(120\)/);
  assert.match(server,/required: \["topic", "cues", "notes", "summary", "actionItems", "gaps", "errors"\]/);
  assert.match(server,/Tentativa do estudante \(de memória\)/);
});
