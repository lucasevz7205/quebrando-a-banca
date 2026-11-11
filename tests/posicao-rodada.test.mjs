import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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

test("pos, tSess e tItem são calculados a partir da rodada", () => {
  const V = api();
  const agora = 1700000050000;
  const rd = {
    idx: 4,
    inicio: new Date(agora - 120000).toISOString(),
    learningShown: { idx: 4, at: agora - 25000 },
  };
  const p = V.posicao(rd, agora);
  assert.equal(p.pos, 5);
  assert.equal(p.tSess, 120);
  assert.equal(p.tItem, 25);
});

test("embaralhar por padrão está ligado (shuffle:true) e pode ser desativado", () => {
  assert.match(shell, /shuffle:\s*true/);
  assert.match(shell, /id="shuffle"/);
  assert.match(shell, /S\.shuffle=sh\.checked/);
});

test("startRound e iniciarTreinoAssunto gravam ordemAleatoria na rodada e rodadaDoc", () => {
  const st = fn("startRound");
  assert.match(st, /const aleat=!!S\.shuffle;/);
  assert.match(st, /S\.round\.ordemAleatoria=aleat/);

  const ass = fn("iniciarTreinoAssunto");
  assert.match(ass, /const aleat=!!S\.shuffle;/);
  assert.match(ass, /S\.round\.ordemAleatoria=aleat/);

  const doc = fn("rodadaDoc");
  assert.match(doc, /typeof rd\.ordemAleatoria==='boolean'\?\{ordemAleatoria:rd\.ordemAleatoria\}:\{\}/);
});

test("registrar anexa pos, tSess e tItem a rd.itens sem quebrar rodadas antigas e sem mudar agenda", () => {
  const reg = fn("registrar");
  assert.match(reg, /const posInfo=VAC\?VAC\.posicao\(rd\):\{pos:rd\.idx\+1,tSess:0,tItem:0\}/);
  assert.match(reg, /rd\.itens\.push\(Object\.assign\(\{qid:q\.id,ordem:q\.ordem\|\|0,marcada:L,gabarito:q\.gabarito,conf:conf\|\|null\},posInfo/);
  /* agenda preserva regras de nivel e agendar */
  assert.match(reg, /r\.proxRevisao=agendar\(d,r\.nivel\)/);
});

test("tabela de acerto por posição agrupa por faixas e separa aleatória de fixa", () => {
  const V = api();
  const rodadas = [
    {
      ordemAleatoria: true,
      itens: [
        { pos: 1, marcada: "C", gabarito: "C" },
        { pos: 5, marcada: "C", gabarito: "E" },
        { pos: 15, marcada: "E", gabarito: "E" },
      ],
    },
    {
      ordemAleatoria: false,
      itens: [
        { pos: 2, marcada: "E", gabarito: "E" },
        { pos: 25, marcada: "C", gabarito: "C" },
      ],
    },
  ];
  const linhas = V.porPosicao(rodadas);
  assert.equal(linhas.length, 5);
  assert.equal(linhas[0].rot, "1–10");
  assert.equal(linhas[0].aleat.n, 2);
  assert.equal(linhas[0].aleat.ok, 1);
  assert.equal(linhas[0].fixa.n, 1);
  assert.equal(linhas[0].fixa.ok, 1);

  assert.equal(linhas[1].rot, "11–20");
  assert.equal(linhas[1].aleat.n, 1);
  assert.equal(linhas[1].aleat.ok, 1);
  assert.equal(linhas[1].fixa.n, 0);

  assert.equal(linhas[2].rot, "21–30");
  assert.equal(linhas[2].fixa.n, 1);
  assert.equal(linhas[2].fixa.ok, 1);
});
