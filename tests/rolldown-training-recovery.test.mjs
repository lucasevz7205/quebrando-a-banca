import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const route=fs.readFileSync("src/routes/_authed/estudar.jsx","utf8");
const sw=fs.readFileSync("public/sw.js","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");

test("Vite/Rolldown preload failure offers explicit recovery rather than wiping a round",()=>{
  assert.match(route,/window\.addEventListener\("vite:preloadError", onPreloadError\)/);
  assert.match(route,/event\.preventDefault\(\);\s*setModuleLoadError\(true\)/);
  assert.match(route,/window\.removeEventListener\("vite:preloadError", onPreloadError\)/);
  assert.match(route,/Um módulo do aplicativo não carregou/);
  assert.match(route,/Recarregar versão atual/);
  assert.match(route,/Depois/);
  const handler=route.slice(route.indexOf('const onPreloadError = event =>'),route.indexOf('window.addEventListener("vite:preloadError"'));
  assert.doesNotMatch(handler,/window\.location\.reload\(|localStorage\.|indexedDB\.|caches\.delete\(|S\.round\s*=|S\.r\.clear\(/);
});

test("Base44 preview and Vite dev do not install the production PWA worker",()=>{
  assert.match(route,/import\.meta\.env\.DEV \|\| window\.location\.hostname\.startsWith\("preview-sandbox--"\)/);
  assert.match(route,/navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(route,/new URL\(worker\?\.scriptURL\)\.pathname === "\/sw\.js"/);
  assert.match(route,/reg\.unregister\(\)/);
  assert.match(route,/navigator\.serviceWorker\.register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
  assert.doesNotMatch(route,/localStorage\.clear\(|indexedDB\.deleteDatabase|caches\.keys\(/);
});

test("service worker leaves compiled Vite modules and private question data untouched",()=>{
  assert.match(sw,/url\.pathname\.startsWith\("\/claude-export\/"\)/);
  assert.match(sw,/request\.method !== "GET"/);
  assert.doesNotMatch(sw,/\/node_modules\/\.vite\/|\/assets\/\*/);
  assert.match(sw,/url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(sw,/url\.pathname\.startsWith\("\/_server"\)/);
});

test("Treinar still starts a local question round without importing a module dynamically",()=>{
  assert.match(shell,/function iniciarTreinoAssunto\(\)/);
  assert.match(shell,/novaRodada\('MIX',mat\.name\+' · '\+topic\.title,S\.modo,ids\)/);
  assert.match(shell,/function novaRodada\(cap,capNome,modo,fila\)/);
  assert.match(shell,/const st=\$\('#start'\); if\(st\) st\.addEventListener\('click'/);
  const start= shell.slice(shell.indexOf("function iniciarTreinoAssunto()"),shell.indexOf("function viewSetup()"));
  assert.doesNotMatch(start,/\bimport\s*\(|\bfetch\s*\(|window\.location\.reload|localStorage\.clear/);
});
