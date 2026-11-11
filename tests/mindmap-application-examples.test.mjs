import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  parseHierarchicalMindMap, flatMindMapNodes, enrichHierarchicalMindMap,
  applicationExampleCandidates,applicationExampleCoverage,
  normalizeApplicationExample,labelGeneratedApplicationExamples,
  APPLICATION_EXAMPLE_LABEL
} from "../src/lib/mindmap-text-structure.js";
import { normalizeMindMapTree } from "../src/lib/mindmap-gan-ai.js";

const source=[
 "# Atos administrativos",
 "## Competência",
 "- Delegação: permite transferir o exercício da atribuição, mas não a titularidade.",
 "- Forma: exteriorização prescrita para o ato administrativo.",
 "## Extinção",
 "- Anulação: desfazimento do ato por ilegalidade, preservados os limites do sistema.",
 "- Revogação: retirada por razões de mérito administrativo, respeitados os limites jurídicos.",
 "- Exemplo: o ato é revogado após mudança de interesse público."
].join("\n");

test("folhas com regras suficientemente descritas são candidatas a exemplo mesmo sem exemplo na fonte",()=>{
 const skeleton=parseHierarchicalMindMap(source,"Atos","da",{force:true});
 const candidates=applicationExampleCandidates(skeleton);
 assert.ok(candidates.some(x=>x.t==="Delegação"));
 assert.ok(candidates.some(x=>x.t==="Forma"));
 assert.ok(candidates.some(x=>x.t==="Anulação"));
 assert.equal(skeleton.ramos[1].x.ex,"o ato é revogado após mudança de interesse público.");
});
test("IA preenche exemplo concreto de aplicação, sem perder hierarquia, título ou nota original",()=>{
 const skeleton=parseHierarchicalMindMap(source,"Atos","da",{force:true});
 const prior=JSON.stringify(skeleton);
 const dest=flatMindMapNodes(skeleton).find(n=>n.t==="Delegação");
 const aiExample="Uma autoridade atribui a outra unidade o exercício de uma tarefa que pode delegar, sem perder a titularidade da competência.";
 const enriched=enrichHierarchicalMindMap(skeleton,[{id:dest.id,ex:aiExample}],source);
 const normalized=normalizeMindMapTree(enriched.mapa,"Atos","da");
 assert.equal(JSON.stringify(skeleton),prior);
 assert.deepEqual(flatMindMapNodes(normalized).map(x=>x.id),flatMindMapNodes(skeleton).map(x=>x.id));
 assert.equal(flatMindMapNodes(normalized).find(n=>n.id===dest.id).ex,APPLICATION_EXAMPLE_LABEL+aiExample);
 assert.match(normalized.ramos[1].x.ex,/revogado após mudança/);
 assert.equal(applicationExampleCoverage(normalized).illustrative,1);
 assert.equal(applicationExampleCoverage(normalized).sourceBased,1);
});
test("não substitui exemplos fornecidos na origem por novos exemplos hipotéticos",()=>{
 const skeleton=parseHierarchicalMindMap(source,"Atos","da",{force:true});
 const ramo=skeleton.ramos[1],original=ramo.x.ex;
 const changed=enrichHierarchicalMindMap(skeleton,[{id:ramo.id,ex:"A IA quer trocar esta ilustração por um caso novo."}],source);
 assert.equal(changed.mapa.ramos[1].x.ex,original);
});
test("não inventa dados exatos, dispositivos ou prazos no exemplo hipotético",()=>{
 const withoutLaw="Um fiscal concede um prazo de 90 dias para o recurso, aplicando a regra que estudou.";
 assert.equal(normalizeApplicationExample(withoutLaw,source),"");
 const fakeArticle="A autoridade invoca o art. 99 da Lei 10.100/2026 para alterar a competência.";
 assert.equal(normalizeApplicationExample(fakeArticle,source),"");
 const sourced="A regra concede prazo de 30 dias, e a autoridade aplica esse prazo.";
 assert.equal(normalizeApplicationExample(sourced,source+"\nPrazo de 30 dias."),APPLICATION_EXAMPLE_LABEL+sourced);
});
test("um texto pouco desenvolvido não obriga a IA a inventar uma situação aplicada",()=>{
 const sparse=parseHierarchicalMindMap("# Assunto\n## Regra\n- Conceito: tema.\n- Exceção: casos.","Assunto","t",{force:true});
 const candidates=applicationExampleCandidates(sparse);
 assert.equal(candidates.length,0);
 assert.equal(normalizeApplicationExample("Sem exemplo",""),"");
});
test("exemplos criados são explicitamente identificados no fluxo não estruturado",()=>{
 const map={
  centro:"Direito",ramos:[{id:"n1",t:"Revogação",x:{e:"Retirada de ato por mérito e oportunidade.",ex:"A administração deixa de manter um ato que não atende mais ao interesse público."}},
  {id:"n2",t:"Anulação",x:{e:"Desfazimento por ilegalidade.",ex:"Exemplo idêntico presente no texto."}}]
 };
 const labeled=labelGeneratedApplicationExamples(map,"Exemplo idêntico presente no texto.");
 assert.equal(labeled.ramos[0].x.ex,APPLICATION_EXAMPLE_LABEL+map.ramos[0].x.ex);
 assert.equal(labeled.ramos[1].x.ex,map.ramos[1].x.ex);
 assert.equal(map.ramos[0].x.ex.startsWith(APPLICATION_EXAMPLE_LABEL),false);
});
test("servidor tem reparo específico para casos em que a IA preenche conceitos mas omite aplicação",()=>{
 const code=fs.readFileSync("src/lib/omnistudy-ai.js","utf8");
 assert.match(code,/APPLICATION_EXAMPLES_SCHEMA/);
 assert.match(code,/applicationExampleCandidates\(skeleton\)/);
 assert.match(code,/applicationExampleCandidates\(enrichedMap\)/);
 assert.match(code,/maxRepair = 48/);
 assert.match(code,/CASO PRÁTICO HIPOTÉTICO/);
 assert.match(code,/Exemplo hipotético \(IA\):/);
 assert.match(code,/labelGeneratedApplicationExamples\(/);
 assert.match(code,/exampleStats\.illustrative/);
 assert.match(code,/exampleStats\.examples/);
 assert.match(code,/estruturaPreservada: true/);
});
