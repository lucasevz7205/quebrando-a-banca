import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("public/claude-export/vacinacao.js", "utf8");
const shell = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
function api() { const window = {}; vm.runInNewContext(source, { window }); return window.QBVacinacao; }
function fn(name) {
  const i = shell.indexOf("function " + name + "(");
  assert.ok(i >= 0, "função " + name + " não encontrada");
  return shell.slice(i, shell.indexOf("\nfunction ", i + 10));
}

test("certeza só é exigida em item C/E com trava e confiança 3 (fora da repescagem)", () => {
  const V = api();
  assert.equal(V.precisaCerteza({ conf: 3, travas: true, ce: true, rep: false }), true);
  assert.equal(V.precisaCerteza({ conf: 2, travas: true, ce: true }), false);
  assert.equal(V.precisaCerteza({ conf: 1, travas: true, ce: true }), false);
  assert.equal(V.precisaCerteza({ conf: 3, travas: false, ce: true }), false);
  assert.equal(V.precisaCerteza({ conf: 3, travas: true, ce: false }), false);
  assert.equal(V.precisaCerteza({ conf: 3, travas: true, ce: true, rep: true }), false);
});

test("fluxo bloqueado: menos de 8 caracteres não confirma; texto é limitado a 200", () => {
  const V = api();
  assert.equal(V.certezaPronta("art. 51"), false);
  assert.equal(V.certezaPronta("   curto   "), false);
  assert.equal(V.certezaPronta("art. 51 IV"), true);
  assert.equal(V.limparCerteza("x".repeat(300)).length, 200);
  const conf = fn("confirmarCerteza");
  assert.match(conf, /certezaPronta\(rd\.pend\.certTxt\)/);
  assert.match(conf, /registrar\(rd\.pend\.marcada,3,\{certJust:/);
  assert.match(fn("confirmar"), /rd\.pend\.cert=true/);
});

test("rebaixar registra com confiança 2 e Esc volta para a escolha", () => {
  assert.match(fn("rebaixarCerteza"), /registrar\(rd\.pend\.marcada,2\)/);
  assert.match(fn("voltarConfianca"), /rd\.pend\.cert=false/);
  assert.match(shell, /rd\.pend\.cert && !rd\.atual && k==='2'\)\{ e\.preventDefault\(\); rebaixarCerteza\(\)/);
});

test("gravação: certJust na rodada e j no hist, sem remover campos antigos", () => {
  const reg = fn("registrar");
  assert.match(reg, /certJust\?\{certJust\}:\{\}/);
  assert.match(reg, /hist\.push\(Object\.assign\(\{m:L,ok:acertou,em:now,c:conf\|\|null\},certJust\?\{j:certJust\}:\{\}\)\)/);
  assert.match(reg, /qid:q\.id,ordem:q\.ordem\|\|0,marcada:L,gabarito:q\.gabarito,conf:conf\|\|null/);
});

test("repescagem não pede justificativa", () => {
  const rep = fn("registrarRep");
  assert.doesNotMatch(rep, /certJust|pend\.cert|confirmarCerteza/);
});
