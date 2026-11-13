import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shell = fs.readFileSync(new URL("../src/components/qb/study-shell.html", import.meta.url), "utf8");

test("render() adia a reconstrução enquanto o conceito do mapa está aberto", () => {
  const fn = shell.slice(shell.indexOf("function render(force){"));
  const guard = fn.indexOf("conceitoAberto()");
  const reset = fn.indexOf("S.pendingRender=false;");
  assert.ok(guard > 0 && guard < reset, "o guarda deve vir antes de zerar pendingRender");
  assert.match(fn, /!force && S\.view==='mapa' && conceitoAberto\(\)/);
  assert.match(fn, /\[data-map-concept\]:not\(\[hidden\]\)/);
});

test("a reconstrução adiada é retomada sozinha quando o painel fecha", () => {
  assert.match(shell, /clearInterval\(S\.mapaAdiado\);\s*S\.mapaAdiado=null;\s*if\(S\.pendingRender\)render\(\)/);
});

test("o gravador de evocação continua só local (sem render geral)", () => {
  assert.match(shell, /rerender:desenhar,/);
});
