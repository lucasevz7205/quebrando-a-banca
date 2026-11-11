import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const server=fs.readFileSync('src/lib/omnistudy-ai.js','utf8');
const studio=fs.readFileSync('public/claude-export/mindmap-studio.js','utf8');
// extrai mindMapProblems sem carregar dependências do servidor
const src=server.slice(server.indexOf('const GENERIC_BRANCH'),server.indexOf('/* Mantém só trechos'));
const mindMapProblems=new Function(src.replace('export function','function')+';return mindMapProblems;')();
const folha=(t,i)=>({id:'n'+i,t,n:'detalhe '+i,x:{e:'Explicação suficiente do conceito para o estudante entender.'}});
test('mapa bem formado não gera problemas',()=>{
  const ramos=[0,1,2,3].map(i=>({...folha('Requisito de validade '+i,i),f:[folha('Competência do agente',i+'a'),folha('Forma prescrita em lei',i+'b')]}));
  assert.deepEqual(mindMapProblems({ramos}),[]);
});
test('detecta ramo genérico, rótulo longo, nó sem explicação e mapa raso',()=>{
  const p=mindMapProblems({ramos:[
    {id:'a',t:'Regras Gerais',n:'',x:{e:''}},
    {id:'b',t:'Este rótulo é um parágrafo inteiro copiado do texto da aula sem nenhum corte e por isso não serve',n:'',x:{e:'Conceito estruturante de X.'}},
  ]}).join(' | ');
  assert.match(p,/genérico/); assert.match(p,/longo demais/); assert.match(p,/sem explicação/); assert.match(p,/raso|ramo\(s\)/);
});
test('estúdio usa a ponte autenticada, não a rota inexistente, e não sobrescreve o mapa na falha',()=>{
  assert.doesNotMatch(studio,/fetch\("\/api\/omnistudy-ai"/);
  assert.match(studio,/QBBridge\.ask\("omniStudyAI", \{ task: "cornell-to-mindmap"/);
  assert.match(studio,/O mapa atual foi mantido/);
  assert.match(studio,/MIN_INSUMO = 300/);
});
test('prompt restringe ao insumo, proíbe moldes e tenta de novo com os problemas',()=>{
  assert.match(server,/use só o que está no insumo/);
  assert.match(server,/Proibido nome genérico ou de molde/);
  assert.match(server,/SUA VERSÃO ANTERIOR TINHA ESTES PROBLEMAS/);
  assert.match(server,/mindMapNodeSchema\(4\)/);
});
