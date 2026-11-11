import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {parseHierarchicalMindMap,flatMindMapNodes,enrichHierarchicalMindMap} from "../src/lib/mindmap-text-structure.js";
import {normalizeMindMapTree} from "../src/lib/mindmap-gan-ai.js";

const server=fs.readFileSync("src/lib/omnistudy-ai.js","utf8");
const studioCode=fs.readFileSync("public/claude-export/mindmap-studio.js","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const sw=fs.readFileSync("public/sw.js","utf8");

const input=[
 "# Atos Administrativos",
 "## Elementos do ato",
 "- **Competência**: atribuição conferida ao agente.",
 "  - **Delegação**: admite transferência do exercício.",
 "    - Exceção: competências exclusivas não podem ser delegadas.",
 "- **Forma**: exteriorização prescrita.",
 "- Exemplo: ato de nomeação.",
 "- Pegadinha: delegação não transfere titularidade.",
 "- Fonte: Art. 11 da Lei 9.784/1999",
 "## Extinção",
 "- Anulação: desfazimento por ilegalidade.",
 "- Revogação: desfazimento por conveniência e oportunidade.",
 "- Exemplo: revogação por alteração de interesse público.",
 "## Controle",
 "- Controle judicial: legalidade.",
].join("\n");

test("preserva todos os ramos, filhos e níveis de Markdown hierarquizado de outra IA",()=>{
 const map=parseHierarchicalMindMap(input,"desconhecido","da-2");
 assert.equal(map.centro,"Atos Administrativos");
 assert.deepEqual(map.ramos.map(n=>n.t),["Elementos do ato","Extinção","Controle"]);
 assert.deepEqual(map.ramos[0].f.map(n=>n.t),["Competência","Forma"]);
 assert.equal(map.ramos[0].f[0].f[0].t,"Delegação");
 const list=flatMindMapNodes(map);
 assert.equal(list.length,10);
 assert.equal(new Set(list.map(x=>x.id)).size,10);
 assert.equal(list[0].depth,0);
 assert.equal(list[2].depth,2);
 assert.match(map.ramos[0].x.ex,/nomeação/);
 assert.match(map.ramos[0].x.trap,/titularidade/);
 assert.match(map.ramos[0].x.src,/Art\. 11/);
 assert.match(map.ramos[1].x.ex,/revogação/);
});

test("interpreta tópicos numerados, sem transformar níveis em lista plana",()=>{
 const source=[
  "# Direito Administrativo",
  "## 1. Atos",
  "1.1 Elementos",
  "1.1.1 Competência: atribuição legal.",
  "1.1.2 Forma: exteriorização legal.",
  "1.2 Atributos",
  "## 2. Poderes",
  "2.1 Polícia",
  "2.2 Hierárquico"
 ].join("\n");
 const map=parseHierarchicalMindMap(source,"Tema","adm");
 const root=map.ramos[0];
 assert.match(root.t,/Atos/);
 assert.equal(map.ramos.length,2);
 assert.equal(root.f.length,2);
 assert.equal(root.f[0].f.length,2);
 assert.equal(root.f[0].f[0].t,"Competência");
 assert.equal(root.f[0].f[1].t,"Forma");
 assert.equal(map.ramos[1].f.length,2);
});

test("mantém número real de ramos mesmo quando texto traz somente dois",()=>{
 const source="# Constitucional\n## Princípios\n- República: forma de governo.\n## Direitos\n- Vida: proteção constitucional.";
 const map=parseHierarchicalMindMap(source,"Constitucional","cf");
 assert.equal(map.ramos.length,2);
 assert.equal(flatMindMapNodes(map).length,4);
});
test("campos são preenchidos por ID sem que a IA altere títulos, ordem ou remissão",()=>{
 const original=parseHierarchicalMindMap(input,"Atos","da-2");
 const target=original.ramos[0].f[0];
 const old=JSON.stringify(original);
 const result=enrichHierarchicalMindMap(original,[
  {id:target.id,t:"ALTERAR TÍTULO",rotulo:"Competência",n:"Regra da competência",e:"Competência é atribuição legal.",ex:"Nomeação.",trap:"Não é titularidade.",src:"Fonte inventada"},
  {id:"invasor",n:"Nó extra",e:"Conteúdo inventado."}
 ],input);
 assert.equal(JSON.stringify(original),old);
 assert.equal(result.applied,1);
 assert.equal(result.total,10);
 assert.deepEqual(result.mapa.ramos.map(x=>x.t),original.ramos.map(x=>x.t));
 assert.equal(result.mapa.ramos[0].f[0].t,"Competência");
 assert.equal(result.mapa.ramos[0].f[0].n,"Regra da competência");
 assert.equal(result.mapa.ramos[0].f[0].rotulo,"Competência");
 assert.equal(result.mapa.ramos[0].f[0].x.src,undefined);
 assert.equal(flatMindMapNodes(result.mapa).length,10);
});

test("suporta até 32 ramos sem descarte silencioso pela normalização de servidor",()=>{
 const rows=["# Lista Completa"];
 for(let i=1;i<=20;i++){rows.push("## Ramo "+i);rows.push("- Condição "+i+": descrição detalhada "+i+".");}
 const parsed=parseHierarchicalMindMap(rows.join("\n"),"Lista","lista");
 assert.equal(parsed.ramos.length,20);
 const normalized=normalizeMindMapTree(parsed,"Lista","lista");
 assert.equal(normalized.ramos.length,20);
 assert.equal(flatMindMapNodes(normalized).length,40);
});

test("se o insumo exceder a capacidade, não finge que cobriu todas as lacunas",()=>{
 const rows=["# Assunto","## Raiz"];
 for(let i=0;i<165;i++)rows.push("- Item "+i+": definição "+i);
 const map=parseHierarchicalMindMap(rows.join("\n"),"A","t");
 assert.ok(map.warnings.length>0);
 assert.match(map.warnings[0],/itens não foram adicionados/);
});

test("integração servidor e interface realmente invoca IA antes de salvar o mapa e expõe prévia",()=>{
 assert.match(server,/parseHierarchicalMindMap\(structuredSource, data\.title, data\.topicId\)/);
 assert.match(server,/enrichHierarchicalMindMap\(skeleton, edits, structuredSource\)/);
 assert.match(server,/IDs imutáveis/);
 assert.match(server,/estruturaPreservada: true/);
 assert.match(server,/structuredInput: z\.boolean\(\)\.optional\(\)\.default\(false\)/);
 assert.match(studioCode,/structuredInput: true/);
 assert.match(studioCode,/generatedMap: response\?\.mapa, commitMap: !asMindMap/);
 assert.match(studioCode,/studioState\.drafts\.set\(selectedTopic, clone\(imported\.mapa\)\)/);
 assert.match(studioCode,/SALVAR MAPA MENTAL/);
 assert.match(studioCode,/Nenhum mapa foi substituído/);
 assert.match(shell,/mindmap-studio\.js\?v=16/);
 assert.match(sw,/mindmap-studio\.js\?v=16/);
});

test("salvamento é adiado e preserva revisão antiga até aprovação explícita",()=>{
 const window={localStorage:{getItem(){return null},setItem(){}},Date,Math};
 window.window=window;
 vm.runInNewContext(studioCode,window);
 const studio=window.QBMindMapStudio;
 const old={centro:"Mapa anterior",ramos:[{id:"x-1",t:"Regra anterior",rotulo:"Conceito",n:"N",x:{e:"Texto antigo e íntegro."}}]};
 const S={mapaId:"da",ed:new Map([["da",{id:"da",titulo:"Direito Administrativo"}]]),rv:new Map([["da",{id:"da",titulo:"Direito Administrativo",mapa:old,cartoes:[{q:"Questão preservada",a:["Resposta"]}]}]]),mat:new Map(),db:{doc(){return{set(){}}}}};
 const source=studio.ingestGeminiNotebook({title:"Texto Externo",subject:"Administrativo",topicId:"da",content:input,asMaterial:false,asCornell:false,asMindMap:true},S,{generatedMap:parseHierarchicalMindMap(input,"Texto","da"),commitMap:false});
 assert.ok(source.mapa);
 assert.equal(source.mapa.ramos.length,3);
 assert.equal(S.rv.get("da").mapa.centro,"Mapa anterior");
 assert.equal(S.rv.get("da").cartoes.length,1);
});
