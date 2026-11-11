import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("public/claude-export/study-batch-ui.js", "utf8");
function ui() {
  const listeners = new Map();
  const window = {};
  const document = { addEventListener: (name, callback) => listeners.set(name, callback) };
  vm.runInNewContext(source, { window, document });
  return { api: window.QBBulkStudy, listeners };
}

test("Geração por lote não oferece execução quando o edital da conta está vazio", () => {
  const { api } = ui();
  const html = api.panelHTML({
    studyAccount: true, studyAccountName: "PCMG", ed: new Map(), mat: new Map(), rv: new Map(), q: new Map(),
  });
  assert.match(html, /0 assuntos no edital/);
  assert.match(html, /id="qb-bulk-start"[^>]*disabled/);
  assert.match(html, /Ainda não há tópicos do edital sincronizados/);
});

test("Geração por lote exige material vinculado ao ID real do assunto", () => {
  const { api } = ui();
  const t = { id: "pcmg-lp-01", materia: "Português", titulo: "Compreensão", ordem: 1 };
  const S = { studyAccount: true, studyAccountName: "PCMG",
    ed: new Map([[t.id, t]]), mat: new Map([["conteudo-a", { topicos: ["outro-id"], texto: "texto sólido ".repeat(100) }]]),
    rv: new Map(), q: new Map() };
  assert.match(api.panelHTML(S), /0 com conteúdo de referência/);
  S.mat.set("conteudo-a", { topicos: [t.id], texto: "compreensão textual e relações de coesão ".repeat(20) });
  const html = api.panelHTML(S);
  assert.match(html, /1 com conteúdo de referência/);
  assert.doesNotMatch(html, /id="qb-bulk-start"[^>]*disabled/);
});

test("Apenas a conta ativa do candidato é autorizada a gerar e as questões A–E são carregadas", () => {
  const server = fs.readFileSync("src/lib/study-batch-ai.js", "utf8");
  const shell = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
  assert.match(server, /user_id: user.id, active: true/);
  assert.match(server, /studyAccountStorage\(service.entities, account.id\)/);
  assert.match(server, /SEM_FONTE/);
  assert.match(shell, /alternativasDe\(v\)\.some\(o=>o\.letra===v\.gabarito\)/);
});
