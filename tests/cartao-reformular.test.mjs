import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const env={window:{},Map,Date,Object,String,Array,Number,JSON};
vm.runInNewContext(fs.readFileSync('public/claude-export/card-curator.js','utf8'),env);
const C=env.window.QBCardCurator;
const S=()=>({rv:new Map([['pl-3-1',{mapa:{centro:'RCCN'},cartoes:[{tema:'CPMI',q:'Quórum?',a:['1/3']},{tema:'X',q:'Y?',a:['Z']}]}]])});
// DOM mínimo para wire()
function fakeRoot(k,values){
  const btn=()=>({h:[],addEventListener(e,f){this.h.push(f)},click(){this.h.forEach(f=>f())}});
  const salvar=btn();
  const root={dataset:{cc:k},querySelector(sel){
      if(sel==='[data-cc-salvar]')return salvar;
      const m=/^\[(data-cc-[a-z]+)="(\d+)"\]$/.exec(sel); if(m)return {value:values[m[2]]?.[m[1]]??''};
      return null;},
    querySelectorAll:()=>[]};
  return {root,salvar,container:{querySelectorAll:s=>s==='[data-cc]'?[root]:[]}};
}
test('só cartões de revisão ativa (topico@indice) têm a opção',()=>{
  assert.match(C.box(S(),'pl-3-1@0'),/Reformular cartão/);
  assert.equal(C.box(S(),'pl-3-1@9'),'');
  assert.equal(C.box(S(),'dc1-01'),'');
});
test('salvar substitui no mesmo índice, guarda o original e põe divisões no fim',()=>{
  const s=S(); const k='pl-3-1@0';
  const st=C._st; st.set(k,{aberto:true,fase:'ok',res:{parecer:'p',problemas:[],cartoes:[{},{}]}});
  const {salvar,container}=fakeRoot(k,{
    '0':{'data-cc-q':'Quórum para criar CPMI: ___ de cada Casa?','data-cc-a':'1/3\n','data-cc-tema':'CPMI','data-cc-src':'RCCN art. 21'},
    '1':{'data-cc-q':'Prazo da CPMI?','data-cc-a':'certo','data-cc-tema':'CPMI','data-cc-src':''}});
  let salvo=null;
  C.wire(container,{S:s,rerender(){},toast(){},salvarRevisao:(id,doc)=>{salvo={id,doc}}});
  salvar.click();
  assert.equal(salvo.id,'pl-3-1');
  const cs=salvo.doc.cartoes;
  assert.equal(cs.length,3);
  assert.equal(cs[0].q,'Quórum para criar CPMI: ___ de cada Casa?');
  assert.equal(cs[0].a.join(),'1/3');
  assert.equal(cs[0].original.q,'Quórum?');
  assert.equal(cs[1].q,'Y?','os outros cartões não mudam de posição');
  assert.equal(cs[2].derivadoDe,'pl-3-1@0');
});
test('servidor: tarefa curate-card com as regras de perguntas e ancorada no material',()=>{
  const src=fs.readFileSync('src/lib/omnistudy-ai.js','utf8');
  assert.match(src,/task: z\.literal\("curate-card"\)/);
  assert.match(src,/Um conceito por cartão/);
  assert.match(src,/Não altere o conteúdo da resposta; só a formulação/);
  const shell=fs.readFileSync('src/components/qb/study-shell.html','utf8');
  assert.match(shell,/card-curator\.js\?v=2/);
  assert.match(shell,/QBCardCurator\?\.box\(S,k\)/);
});
