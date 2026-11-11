import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const manifest=JSON.parse(fs.readFileSync("public/manifest.webmanifest","utf8"));
const sw=fs.readFileSync("public/sw.js","utf8");
const study=fs.readFileSync("src/routes/_authed/estudar.jsx","utf8");
const offline=fs.readFileSync("public/claude-export/offline-sync.js","utf8");
const agents=fs.readFileSync("AGENTS.md","utf8");

test("o ícone instalado usa sempre a rota estável do mesmo domínio",()=>{
 assert.equal(manifest.start_url,"/estudar");
 assert.equal(manifest.scope,"/");
 assert.equal(manifest.display,"standalone");
 assert.ok(!manifest.start_url.includes("?"));
 assert.match(agents,/https:\/\/quebrando-a-banca-a2c91a3c\.base44\.app/);
});
test("cache PWA revalida os recursos e não intercepta documentos pessoais/API",()=>{
 assert.match(sw,/const CACHE_NAME = "qb-static-axon-v4"/);
 assert.match(sw,/fetch\(request, \{ cache: "no-cache" \}\)/);
 assert.match(sw,/url\.pathname\.startsWith\("\/api\/"\)/);
 assert.match(sw,/url\.pathname\.startsWith\("\/_server"\)/);
 assert.match(sw,/request\.method !== "GET"/);
 assert.doesNotMatch(sw,/caches\.match\(\s*["']\/estudar/);
});
test("app verifica atualização em foco e primeiro plano, mantendo aluno no controle",()=>{
 assert.match(study,/serviceWorker\.register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
 assert.match(offline,/serviceWorker\.register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
 assert.match(study,/document\.addEventListener\("visibilitychange", checkForUpdate\)/);
 assert.match(study,/window\.addEventListener\("focus", checkForUpdate\)/);
 assert.match(study,/serviceWorker\.addEventListener\("controllerchange", onControllerChange\)/);
 assert.match(study,/const existingController = Boolean\(navigator\.serviceWorker\.controller\)/);
 assert.match(study,/Nova versão publicada\. Conclua sua questão antes de atualizar\./);
 assert.match(study,/Atualizar app/);
 assert.match(study,/window\.location\.reload\(\)/);
 assert.match(study,/Atualizar depois/);
});
test("a entrega requer publicação explícita e conferência da versão de produção",()=>{
 assert.match(agents,/Executar deploy\/publicação explícita do checkpoint/);
 assert.match(agents,/Confirmar sucesso e versão pelo status do app/);
 assert.match(agents,/Escrever arquivos e gerar checkpoint sozinho NÃO publica|escrever arquivos e gerar checkpoint sozinho NÃO publica/i);
});
