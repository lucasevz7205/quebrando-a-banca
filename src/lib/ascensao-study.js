/**
 * Adaptador de dados e motor SRS para a interface Ascensão.
 * Preserva integralmente o schema `respostas/<qid>` e as regras de retenção (7+ dias)
 * e calibração usadas pelo `study-shell.html`.
 */

export const SRS_INTERVALS = [1, 3, 7, 15, 30];
export const RETENTION_DAYS = 7;

export function todayKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeyFromISO(iso) {
  if (!iso || typeof iso !== "string") return todayKey();
  return iso.slice(0, 10);
}

export function addDays(dayStr, days) {
  const [y, m, d] = String(dayStr).split("-").map(Number);
  const dt = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() + (days || 0));
  return dt.toISOString().slice(0, 10);
}

export function diffDays(startDay, endDay) {
  const [y1, m1, d1] = String(startDay).split("-").map(Number);
  const [y2, m2, d2] = String(endDay).split("-").map(Number);
  const a = Date.UTC(y1 || 2026, (m1 || 1) - 1, d1 || 1);
  const b = Date.UTC(y2 || 2026, (m2 || 1) - 1, d2 || 1);
  return Math.round((b - a) / 86400000);
}

export function computeLevel(prev) {
  if (!prev || !prev.tentativas) return 0;
  const lvl = Number(prev.nivel);
  if (Number.isFinite(lvl) && lvl >= 0) {
    return Math.min(lvl, SRS_INTERVALS.length - 1);
  }
  return 0;
}

export function scheduleNextReview(dayStr, level) {
  const idx = Math.max(0, Math.min(Number(level) || 0, SRS_INTERVALS.length - 1));
  return addDays(dayStr, SRS_INTERVALS[idx]);
}

/**
 * Constrói o novo registro de `respostas/<qid>` a partir da resposta do estudante,
 * mantendo compatibilidade total com `study-shell.html`.
 */
export function buildAnswerRecord({
  question,
  prev = {},
  marked,
  confidence = null,
  correction = "",
  now = new Date(),
}) {
  if (!question || !question.id) {
    throw new Error("Questão inválida para registro de resposta.");
  }
  const L = marked === "C" || marked === "E" ? marked : "B";
  const isBlank = L === "B";
  const acertou = !isBlank && L === question.gabarito;
  const conf = isBlank ? null : confidence || null;
  const nowIso = now.toISOString();
  const d = todayKey(now);

  const r = {
    ...prev,
    qid: question.id,
    cap: question.cap || prev.cap || "",
    ordem: question.ordem || prev.ordem || 0,
    ultimaMarcada: L,
    atualizadoEm: nowIso,
    tentativas: (prev.tentativas || 0) + 1,
    conf,
  };

  const prevHist = Array.isArray(prev.hist) ? prev.hist.slice(-7) : [];
  prevHist.push({ m: L, ok: acertou, em: nowIso, c: conf });
  r.hist = prevHist;

  r.primeiraEm =
    prev.primeiraEm ||
    (Array.isArray(prev.hist) && prev.hist[0] && prev.hist[0].em) ||
    nowIso;

  if (
    acertou &&
    conf !== 1 &&
    !prev.retidoEm &&
    diffDays(dateKeyFromISO(r.primeiraEm), d) >= RETENTION_DAYS
  ) {
    r.retidoEm = nowIso;
  }

  const nPrev = prev.tentativas ? computeLevel(prev) : 0;

  if (acertou && conf === 1) {
    r.acertos = (prev.acertos || 0) + 1;
    if (!prev.noCaderno) {
      r.noCaderno = true;
      r.entrouEm = nowIso;
      r.motivo = "chute";
      r.acertosSeguidos = 0;
    }
    r.nivel = 0;
  } else if (acertou) {
    r.acertos = (prev.acertos || 0) + 1;
    r.acertosSeguidos = (prev.acertosSeguidos || 0) + 1;
    if (prev.noCaderno && r.acertosSeguidos >= 2) {
      r.noCaderno = false;
      r.saiuEm = nowIso;
      r.motivoSaida = "dois acertos seguidos";
    }
    r.nivel =
      conf === 3
        ? Math.min(Math.max(nPrev + 1, 2), SRS_INTERVALS.length - 1)
        : Math.max(nPrev, 1);
    if (r.noCaderno) {
      r.nivel = Math.min(r.nivel, 1);
    }
  } else {
    if (isBlank) r.brancos = (prev.brancos || 0) + 1;
    else r.erros = (prev.erros || 0) + 1;
    r.acertosSeguidos = 0;
    if (!prev.noCaderno) {
      r.entrouEm = nowIso;
    }
    r.noCaderno = true;
    r.motivo =
      isBlank && !(prev.noCaderno && prev.motivo === "erro") ? "branco" : "erro";
    r.nivel = 0;
  }

  r.proxRevisao = scheduleNextReview(d, r.nivel);
  r.calib =
    isBlank || !conf
      ? null
      : !acertou && conf === 3
        ? "excesso"
        : acertou && conf === 1
          ? "sub"
          : "ok";

  if (typeof r.nota !== "string") r.nota = "";
  const cleanCorr = String(correction || "").trim();
  if (cleanCorr) {
    r.correcoes = (Array.isArray(prev.correcoes) ? prev.correcoes : [])
      .concat([{ em: nowIso, texto: cleanCorr }])
      .slice(-5);
  }

  return { record: r, acertou, isBlank };
}

/**
 * Grava com proteção explícita contra escrita em modo `preview`.
 */
export async function saveAnswerRecord({
  writeFn,
  preview = false,
  question,
  prev = {},
  marked,
  confidence = null,
  correction = "",
  now = new Date(),
}) {
  const result = buildAnswerRecord({
    question,
    prev,
    marked,
    confidence,
    correction,
    now,
  });

  if (preview) {
    return { ...result, persisted: false, readOnly: true };
  }

  if (typeof writeFn !== "function") {
    throw new Error("Canal de gravação indisponível.");
  }

  const hasPrev = Boolean(prev && prev.qid);
  await writeFn({
    path: `respostas/${question.id}`,
    operation: hasPrev ? "update" : "set",
    value: result.record,
  });

  return { ...result, persisted: true, readOnly: false };
}

/**
 * Calcula estatísticas reais a partir das coleções carregadas do Controle de Estudo.
 */
export function summarizeStudyState({
  edital = [],
  questoes = [],
  respostas = [],
  revisao = [],
  diario = [],
  today = todayKey(),
}) {
  const respMap = new Map(respostas.map((r) => [r.qid || r.id, r]));
  const nonSimQuestions = questoes.filter((q) => !String(q.cap || "").startsWith("SIM-"));

  let answeredCount = 0;
  let correctCount = 0;
  let dueReviews = 0;
  let notebookCount = 0;
  let retainedCount = 0;
  let certTotal = 0;
  let certCorrect = 0;

  for (const q of nonSimQuestions) {
    const r = respMap.get(q.id);
    if (!r || !r.tentativas) continue;
    answeredCount += 1;
    if ((r.erros || 0) === 0 && (r.brancos || 0) === 0 && (r.acertos || 0) > 0) {
      correctCount += 1;
    } else if (r.ultimaMarcada && r.ultimaMarcada === q.gabarito) {
      correctCount += 1;
    }
    if (r.proxRevisao && r.proxRevisao <= today) {
      dueReviews += 1;
    }
    if (r.noCaderno) {
      notebookCount += 1;
    }
    if (r.retidoEm) {
      retainedCount += 1;
    }
    if (r.conf === 3) {
      certTotal += 1;
      if (r.ultimaMarcada === q.gabarito) certCorrect += 1;
    }
  }

  const totalEdital = edital.length;
  const doneEdital = edital.filter(
    (t) => t.status === "dominado" || t.status === "concluido" || t.status === "revisado"
  ).length;
  const masteryPercent = totalEdital
    ? Math.round((doneEdital / totalEdital) * 100)
    : nonSimQuestions.length
      ? Math.round((retainedCount / nonSimQuestions.length) * 100)
      : 0;

  const accuracyPercent = answeredCount
    ? Math.round((correctCount / answeredCount) * 100)
    : 0;

  const calibrationPercent = certTotal
    ? Math.round((certCorrect / certTotal) * 100)
    : null;

  const flashcards = extractFlashcardsFromRevisao(revisao);
  const mindMaps = extractMindMapsFromRevisao(revisao);

  const sortedDiario = [...diario].sort((a, b) =>
    String(b.data || b.id || "").localeCompare(String(a.data || a.id || ""))
  );

  return {
    totalQuestions: nonSimQuestions.length,
    answeredCount,
    accuracyPercent,
    dueReviews,
    notebookCount,
    retainedCount,
    calibrationPercent,
    certTotal,
    totalEdital,
    doneEdital,
    masteryPercent,
    flashcardsCount: flashcards.length,
    mindMapsCount: mindMaps.length,
    latestDiary: sortedDiario[0] || null,
  };
}

export function extractFlashcardsFromRevisao(revisao = []) {
  const cards = [];
  for (const doc of revisao) {
    const id = String(doc.id || "");
    const list = Array.isArray(doc.cartoes)
      ? doc.cartoes
      : Array.isArray(doc.cards)
        ? doc.cards
        : id.endsWith(".cartoes") && Array.isArray(doc.itens)
          ? doc.itens
          : null;
    if (!list) continue;
    for (let i = 0; i < list.length; i += 1) {
      const c = list[i];
      if (!c) continue;
      cards.push({
        id: c.id || `${id}::${i}`,
        topicId: doc.topico || id.replace(/\.cartoes$/, ""),
        front: c.frente || c.front || c.pergunta || "",
        back: c.verso || c.back || c.resposta || "",
        reference: c.ref || c.fonte || doc.materia || "",
      });
    }
  }
  return cards.filter((c) => c.front && c.back);
}

export function extractMindMapsFromRevisao(revisao = []) {
  const maps = [];
  for (const doc of revisao) {
    const id = String(doc.id || "");
    const root = doc.mapa || doc.root || (doc.ramos || doc.nos || doc.children ? doc : null);
    if (!root) continue;
    if (id.endsWith(".cartoes")) continue;
    const title = doc.titulo || root.titulo || root.label || root.t || id.replace(/\.mapa$/, "");
    const branches = Array.isArray(root.ramos)
      ? root.ramos
      : Array.isArray(root.children)
        ? root.children
        : Array.isArray(root.nos)
          ? root.nos
          : [];
    if (!branches.length && !root.x && !root.explicacao) continue;
    maps.push({
      id,
      title,
      materia: doc.materia || "",
      explanation: root.x || root.explicacao || "",
      branches,
    });
  }
  return maps;
}
