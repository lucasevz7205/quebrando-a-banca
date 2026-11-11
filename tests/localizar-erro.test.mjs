import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("public/claude-export/vacinacao.js", "utf8");
const shell = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
function api() {
  const window = {};
  new Function("window", source)(window);
  return window.QBVacinacao;
}
function fn(name) {
  const i = shell.indexOf("function " + name + "(");
  assert.ok(i >= 0, "função " + name + " não encontrada");
  return shell.slice(i, shell.indexOf("\nfunction ", i + 10));
}

test("só a assertiva fica clicável e dois toques fecham o trecho, sem arrastar", () => {
  const V = api();
  const p = V.assertivaDe("Situação hipotética: João é servidor. Assertiva: A competência é sempre exclusiva da União.");
  assert.equal(p.rotulo, "Situação hipotética");
  assert.equal(p.assertiva, "A competência é sempre exclusiva da União.");
  const ws = V.palavras(p.assertiva);
  let s = V.tocar(null, 4);
  s = V.tocar(s, 3);
  assert.deepEqual([s.ini, s.fim], [3, 4]);
  const e = V.erroSel(Object.assign(s, { mec: "F1" }), ws);
  assert.equal(e.trecho, "sempre exclusiva");
  assert.equal(e.mec, "F1");
  assert.equal(e.naoSei, false);
  assert.equal(e.localizou, null);
  assert.equal(V.erroSel({ mec: "V2" }, ws).mec, null, "V1–V4 não são opção ao marcar E");
});

test("gravação de erroSel na rodada e loc/mec no hist", () => {
  const reg = fn("registrar");
  assert.match(reg, /erroSel\?\{erroSel:Object\.assign\(\{\},erroSel\)\}:\{\}/);
  assert.match(reg, /erroSel\?\{loc:erroSel\.localizou,mec:erroSel\.mec\}:\{\}/);
  assert.match(reg, /!choice&&L==='E'&&VAC\?VAC\.erroSel/);
});

test("acerto em E com 'Não sei' ou 'Não' vira chute; 'Sim' segue a regra atual", () => {
  const V = api();
  const naoSei = V.erroSel({ naoSei: true }, []);
  assert.equal(V.contaComoChute({ gabarito: "E", marcada: "E", erroSel: naoSei }), true);
  assert.equal(V.contaComoChute({ gabarito: "E", marcada: "E", erroSel: { localizou: false } }), true);
  assert.equal(V.contaComoChute({ gabarito: "E", marcada: "E", erroSel: { localizou: true } }), false);
  assert.equal(V.contaComoChute({ gabarito: "E", marcada: "E", erroSel: { localizou: null } }), false);
  const agendar = (d, n) => d + "+" + n;
  const fora = V.reclassificarChute({ noCaderno: false, acertosSeguidos: 3, nivel: 3 }, "T", "2026-11-11", agendar);
  assert.deepEqual(fora, { noCaderno: true, entrouEm: "T", motivo: "chute", acertosSeguidos: 0, nivel: 0, proxRevisao: "2026-11-11+0", calib: "sub" });
  const dentro = V.reclassificarChute({ noCaderno: true, entrouEm: "A", motivo: "erro" }, "T", "d", agendar);
  assert.equal(dentro.entrouEm, "A");
  assert.equal(dentro.motivo, "erro");
  const reg = fn("registrar");
  assert.match(reg, /if\(acertou&&\(conf===1\|\|chuteLoc\)\)\{/);
  assert.match(reg, /\(isBlank\|\|!acertou\|\|conf===1\|\|chuteLoc\)&&!rd\.rep\.fila\.includes/);
  const auto = fn("autoavaliarLoc");
  assert.match(auto, /reclassificarChute\(a\.prevSnap/);
  assert.match(auto, /update\(patch\)/);
  assert.match(auto, /erroLocalizado=false/);
});

test("marcar C não mostra localização nem grava erroSel", () => {
  const V = api();
  assert.equal(V.contaComoChute({ gabarito: "E", marcada: "C", erroSel: { naoSei: true } }), false);
  assert.match(shell, /pend&&!pend\.cert&&!alternativas\.length&&pend\.marcada==='E'&&window\.QBVacinacao\?locStatementHTML/);
  assert.match(shell, /!alternativas\.length&&pend\.marcada==='E'&&window\.QBVacinacao\?locPanelHTML/);
  /* item C marcado E continua sendo erro: nada de chute */
  assert.match(fn("registrar"), /if\(erroSel&&q\.gabarito!=='E'\) erroSel\.localizou=null/);
});

test("métrica de localização conta mecanismos e confusões", () => {
  const V = api();
  const rodadas = [{ itens: [
    { qid: "a", marcada: "E", gabarito: "E", erroSel: { mec: "F3", localizou: true } },
    { qid: "b", marcada: "E", gabarito: "E", erroSel: { mec: "F1", localizou: false } },
    { qid: "c", marcada: "E", gabarito: "C", erroSel: { mec: "F2", localizou: null } },
  ] }];
  const o = V.localizacao(rodadas, q => ({ a: "F3", b: "F6", c: "V1" })[q]);
  assert.equal(o.eAcertados, 2);
  assert.equal(o.localizados, 1);
  assert.equal(o.mecN, 2);
  assert.equal(o.mecOk, 1);
  assert.deepEqual(o.confusoes, [{ par: "F6→F1", n: 1 }]);
});
