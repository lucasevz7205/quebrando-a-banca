import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import postcss from "postcss";

const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");
const route=fs.readFileSync("src/routes/_authed/estudar.jsx","utf8");
const mapCss=fs.readFileSync("public/claude-export/map-3d.css","utf8");
const radialCss=fs.readFileSync("public/claude-export/radial-dashboard.css","utf8");
const bgCss=fs.readFileSync("public/claude-export/ambient-background.css","utf8");
const sw=fs.readFileSync("public/sw.js","utf8");

test("tela Estudar preserva scroll nativo do iframe em dispositivos com touch",()=>{
  assert.match(route,/srcDoc=\{frameMarkup\}/);
  assert.match(route,/scrolling="yes"/);
  assert.match(route,/overflowY: "auto", WebkitOverflowScrolling: "touch", touchAction: "auto"/);
  assert.match(route,/height: preview \? "calc\(100dvh - 3\.5rem\)" : "100dvh"/);
  assert.doesNotMatch(route,/onTouchMove=\{/);
  assert.doesNotMatch(route,/touchAction: "none"/);
});

test("documento embutido permite rolagem vertical e preserva a inércia do navegador",()=>{
  assert.match(shell,/html \{ overflow-y:auto; overscroll-behavior-y:auto; -webkit-overflow-scrolling:touch; \}/);
  assert.match(shell,/overflow-y:visible; touch-action:auto;/);
  assert.doesNotMatch(shell,/addEventListener\(['"]touchmove['"],/);
  assert.match(shell,/max-width:760px/);
});

test("rolagem vertical por um dedo funciona sobre mapa 3D em telas de toque",()=>{
  const css=postcss.parse(mapCss);
  let desktop,coarse;
  css.walkRules(".qb-map3-stage canvas",rule=>{
    const parent=rule.parent;
    const action=rule.nodes?.find(node=>node.prop==="touch-action")?.value;
    if(parent?.type==="atrule" && /pointer:\s*coarse/.test(parent.params))coarse=action;
    else desktop=action;
  });
  assert.equal(desktop,"none","desktop keeps free 3D rotation/panning");
  assert.equal(coarse,"pan-y","touch screens scroll with one finger, while map retains horizontal/other gestures");
  assert.match(radialCss,/\.qb-radial-stage\s*\{[\s\S]*?touch-action:pan-y;/);
  assert.match(shell,/map-3d\.css\?v=3/);
});

test("fundo decorativo não intercepta gesto de rolagem ou captura cliques",()=>{
  assert.match(bgCss,/#qb-ambient-background\s*\{[\s\S]*?pointer-events:none;/);
  assert.match(bgCss,/body > \.wrap\s*\{[\s\S]*?z-index:1;/);
});

test("nova versão PWA permite revalidar arquivos alterados sem tocar respostas",()=>{
  assert.match(sw,/const CACHE_NAME = "qb-static-axon-v10"/);
  assert.match(sw,/url\.pathname\.startsWith\("\/claude-export\/"\)/);
  assert.match(sw,/fetch\(request, \{ cache: "no-cache" \}\)/);
  assert.doesNotMatch(route,/localStorage\.clear\(\)|indexedDB\.deleteDatabase\(/);
});
