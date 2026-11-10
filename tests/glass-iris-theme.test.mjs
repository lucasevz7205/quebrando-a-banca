import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import postcss from "postcss";

const css=fs.readFileSync("public/claude-export/glass-iris.css","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const chat=fs.readFileSync("public/claude-export/assistant.js","utf8");
const route=fs.readFileSync("src/routes/_authed/estudar.jsx","utf8");

test("Glass Iris tem CSS válido e tokens escuros sem eliminar o significado de erros e acertos",()=>{
 const tree=postcss.parse(css,{from:"glass-iris.css"});
 assert.ok(tree.nodes.length>20);
 for(const fragment of ["--paper:#0e0e10","--surface:#19191f","--qb-primary:#346eff","--certo:#65d4ab","--errado:#ff9b9d","--duvida:#e8c783"]){
   assert.ok(css.includes(fragment),fragment);
 }
 assert.match(css, /:root\[data-theme="dark"\] body/);
 assert.match(css, /color-scheme:dark/);
 assert.match(css, /rgba\(64,110,255,\.7\)/);
 assert.match(css, /rgba\(124,72,240,\.32\)/);
});
test("módulo não utiliza vídeo remoto nem exige novos scripts e bibliotecas",()=>{
 assert.doesNotMatch(css, /url\(['"]?https?:/i);
 assert.doesNotMatch(chat, /<video/);
 assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
 assert.match(css, /animation:none!important/);
 assert.match(shell, /glass-iris\.css\?v=1/);
 assert.match(shell, /Inter\+Tight:wght@400;500;600/);
 assert.match(route, /background: "#0E0E10"/);
});
test("opção escura vira padrão sem substituir preferências explícitas, inclusive modo claro",()=>{
 assert.match(shell, /let t='dark';try\{t=localStorage\.getItem\('qb-tema'\)\|\|'dark'/);
 assert.match(shell, /const ORD=\['auto','dark','light'\]/);
 assert.match(shell, /document\.documentElement\.setAttribute\('data-theme',t\)/);
 assert.match(shell, /localStorage\.setItem\('qb-tema',t\)/);
 assert.ok(!css.includes(":root[data-theme=\"light\"] body"),"Light theme must remain available");
});
test("quatro cartões do chat preservam as perguntas originais e o limite de créditos",()=>{
 for(const question of ["Como está meu desempenho?","Quais são as matérias mais fracas?","Quais tarefas ainda faltam?","Como estão minhas revisões?"])
   assert.ok(chat.includes('data-qb-prompt="'+question+'"'));
 assert.match(chat,/qb-chat-heading/);
 assert.match(chat,/qb-chat-orb/);
 assert.match(chat,/Análise local · sem créditos/);
 assert.match(chat,/qb-chat-chip-label/);
 assert.match(chat,/window\.confirm\('Esta consulta à IA do Base44 poderá consumir créditos/);
 assert.match(chat,/const q=String\(question\|\|''\)\.trim\(\)\.slice\(0,500\)/);
 assert.match(css,/\.qb-chat-chips\s*\{\s*display:grid/);
 assert.match(css,/@media \(max-width:460px\)/);
 assert.doesNotMatch(chat,/AI Agents Running|17 agents|17 agentes/i);
});
test("reutiliza estrutura existente: navegação, mapas 3D e cálculos permanecem",()=>{
 for(const id of ["tab-painel","tab-edital","tab-treinar","tab-estudo","tab-simulado","tab-historico"])
   assert.ok(shell.includes('id="'+id+'"'),id);
 assert.match(shell,/map-navigation\.css/);
 assert.match(shell,/map-dpad\.css/);
 assert.match(shell,/map-evidence\.css/);
 assert.match(shell,/mapaComVinculos\(/);
 assert.match(css,/\.qb-study-art::before/);
 assert.match(css,/\.qb-chat-orb > span/);
 assert.match(css,/\.qb-chat-form:focus-within/);
});
