import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildAnswerRecord,
  saveAnswerRecord,
  summarizeStudyState,
  extractFlashcardsFromRevisao,
  extractMindMapsFromRevisao,
} from "../src/lib/ascensao-study.js";

test("buildAnswerRecord preserva SRS de 7+ dias e calibração", () => {
  const q = { id: "q1", cap: "da-1", gabarito: "C", ordem: 1 };
  const now = new Date("2026-11-14T15:00:00.000Z");

  // Acerto com certeza (conf 3) -> nível >= 2 (7 dias), calib 'ok'
  const res1 = buildAnswerRecord({
    question: q,
    prev: {},
    marked: "C",
    confidence: 3,
    now,
  });
  assert.equal(res1.acertou, true);
  assert.equal(res1.record.nivel, 2);
  assert.equal(res1.record.proxRevisao, "2026-11-21");
  assert.equal(res1.record.calib, "ok");
  assert.equal(res1.record.retidoEm, undefined);

  // Acerto após 7 dias da primeira tentativa -> marca retidoEm
  const later = new Date("2026-11-22T15:00:00.000Z");
  const res2 = buildAnswerRecord({
    question: q,
    prev: res1.record,
    marked: "C",
    confidence: 3,
    now: later,
  });
  assert.equal(res2.record.nivel, 3);
  assert.ok(res2.record.retidoEm);
});

test("buildAnswerRecord coloca no caderno em caso de erro ou chute (conf 1)", () => {
  const q = { id: "q2", cap: "pl-1", gabarito: "E" };
  const now = new Date("2026-11-14T15:00:00.000Z");

  const errRes = buildAnswerRecord({
    question: q,
    prev: {},
    marked: "C",
    confidence: 3,
    now,
  });
  assert.equal(errRes.acertou, false);
  assert.equal(errRes.record.noCaderno, true);
  assert.equal(errRes.record.motivo, "erro");
  assert.equal(errRes.record.calib, "excesso");
  assert.equal(errRes.record.nivel, 0);

  const chuteRes = buildAnswerRecord({
    question: q,
    prev: {},
    marked: "E",
    confidence: 1,
    now,
  });
  assert.equal(chuteRes.acertou, true);
  assert.equal(chuteRes.record.noCaderno, true);
  assert.equal(chuteRes.record.motivo, "chute");
  assert.equal(chuteRes.record.calib, "sub");
  assert.equal(chuteRes.record.nivel, 0);
});

test("saveAnswerRecord nunca chama writeFn quando preview=true", async () => {
  let called = false;
  const result = await saveAnswerRecord({
    writeFn: async () => {
      called = true;
    },
    preview: true,
    question: { id: "q3", cap: "lp-1", gabarito: "C" },
    marked: "C",
    confidence: 2,
  });

  assert.equal(called, false);
  assert.equal(result.persisted, false);
  assert.equal(result.readOnly, true);
});

test("summarizeStudyState exclui capítulos SIM- dos percentuais e extrai cartões/mapas", () => {
  const edital = [
    { id: "da-1", status: "dominado" },
    { id: "da-2", status: "em_andamento" },
  ];
  const questoes = [
    { id: "q1", cap: "da-1", gabarito: "C" },
    { id: "q2", cap: "SIM-1", gabarito: "E" },
  ];
  const respostas = [
    { qid: "q1", tentativas: 1, acertos: 1, erros: 0, brancos: 0, ultimaMarcada: "C", conf: 3, proxRevisao: "2026-11-10" },
    { qid: "q2", tentativas: 1, acertos: 0, erros: 1, brancos: 0, ultimaMarcada: "C", conf: 3 },
  ];
  const revisao = [
    {
      id: "da-1.cartoes",
      materia: "Direito Administrativo",
      cartoes: [{ frente: "O que é ato vinculado?", verso: "Ato sem margem de escolha." }],
    },
    {
      id: "da-1.mapa",
      titulo: "Atos Administrativos",
      ramos: [{ label: "Elementos", x: "Competência, finalidade, forma, motivo e objeto" }],
    },
  ];

  const stats = summarizeStudyState({
    edital,
    questoes,
    respostas,
    revisao,
    today: "2026-11-14",
  });

  assert.equal(stats.totalQuestions, 1);
  assert.equal(stats.answeredCount, 1);
  assert.equal(stats.accuracyPercent, 100);
  assert.equal(stats.dueReviews, 1);
  assert.equal(stats.masteryPercent, 50);
  assert.equal(stats.flashcardsCount, 1);
  assert.equal(stats.mindMapsCount, 1);
  assert.equal(extractFlashcardsFromRevisao(revisao).length, 1);
  assert.equal(extractMindMapsFromRevisao(revisao).length, 1);
});

test("BrandHeader mantém apenas Quebrando a Banca sem subtítulo A Ascensão", () => {
  const filePath = path.resolve("src/components/qb/ascensao/AscensaoPrimitives.jsx");
  const content = fs.readFileSync(filePath, "utf8");
  const headerSlice = content.slice(
    content.indexOf("export function BrandHeader"),
    content.indexOf("export function HeroAscension")
  );
  assert.ok(headerSlice.includes("Quebrando a Banca"));
  assert.equal(headerSlice.includes("A Ascensão"), false);
  assert.ok(headerSlice.includes("mark-q-sword-transparent.png"));
});
