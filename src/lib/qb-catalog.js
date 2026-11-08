import { knownPending, valid } from "./qb-domain.js";

const proofs = {
  "analise/CD26-NS-CG": ["Nível superior · prova comum", "CD26-NS-CG"],
  "analise/CD26-PLF-CG": ["Policial Legislativo Federal", "CD26-PLF-CG"],
  "analise/CD26-PLF-CE": ["Policial Legislativo Federal", "CD26-PLF-CE"],
  "analise/CD26-TEC-CE": ["Técnico Legislativo", "CD26-TEC-CE"],
};

export function studyCatalog(questions, edital, ambiente) {
  const byId = new Map(edital.map(t => [t.id, t]));
  const byCap = new Map();
  for (const topic of edital) {
    for (const cap of topic.caps || []) {
      if (!byCap.has(cap)) byCap.set(cap, topic);
    }
  }
  return questions.filter(q => q.enunciado && ["C", "E"].includes(q.gabarito)).flatMap(q => {
    const origin = q.origem || "";
    const autoral = /^(autoral|in[eé]dit[oa])/i.test(origin);
    const reference = typeof q.ref === "string" ? q.ref : "";
    const real = !autoral && /(?:cebraspe|cespe)/i.test(origin + " " + reference) &&
      /^(prova real|cebraspe|cespe)/i.test(origin);
    if (!autoral && !real) return [];
    const topic = byId.get(q.topico) || byCap.get(q.cap);
    const [subject, ...label] = (q.capNome || "").split(" · ");
    const match = real && reference.match(/^Cebraspe (\d{4}) · ([^·]+) · ([^·]+?) \(QC Q\d+\)$/i);
    const originalYear = real && (origin + " " + reference).match(/(?:Cebraspe|Cespe)\s+(\d{4})/i);
    return [{
      id: q.id, tipo: autoral ? "autoral" : "cebraspe", ambiente,
      materia: topic?.materia || subject || "Matéria a classificar",
      assunto: topic?.titulo || label.join(" · ") || q.tema || "Assunto a classificar",
      assuntoId: q.assuntoId || topic?.id || null, subassunto: q.tema || null,
      cargo: match?.[3] || null, orgao: match?.[2] || null,
      ano: originalYear ? Number(originalYear[1]) : null,
      enunciado: q.enunciado, gabarito: q.gabarito, comentario: q.comentario || "",
      fonte: q.fonte || reference || origin, origem: origin,
      mecanismo: /^F(?:10|[1-9])$/.test(q.mecanismo) ? q.mecanismo : null,
    }];
  });
}

export function editorialAuthorals(questions) {
  return questions.filter(q => q.tipo === "autoral" && valid(q) && q.enunciado && q.materia && q.assunto &&
    ["C", "E"].includes(q.gabarito)).map(q => ({
    id: q.id, tipo: "autoral", ambiente: q.ambiente || "Laboratório",
    materia: q.materia, assunto: q.assunto, assuntoId: q.assuntoId || null,
    cargo: q.cargo || null, enunciado: q.enunciado, gabarito: q.gabarito,
    comentario: q.justificativa || q.comentario || "", fonte: q.fonte || q.documento,
    mecanismo: q.mecanismo || null, referencias: q.referencias || [],
  }));
}

export function proofCatalog(questions, edital) {
  const topics = new Map(edital.map(t => [t.id, t]));
  const subjects = new Map(edital.map(t => [t.sigla, t.materia]));
  return questions.filter(q => proofs[q.documento] || q.tipo === "prova-oficial" && String(q.banca).toUpperCase() === "CEBRASPE").map(q => {
    const proof = proofs[q.documento];
    return {
      id: q.id, tipo: "prova", materia: topics.get(q.topico)?.materia || subjects.get(q.materia) || q.materia || "Matéria a classificar",
      assunto: topics.get(q.topico)?.titulo || q.assunto || q.topico || "Assunto a classificar",
      cargo: proof?.[0] || q.cargo || null, prova: proof?.[1] || q.provaId || null,
      orgao: proof ? "Câmara dos Deputados" : q.orgao || null,
      ano: proof ? 2026 : q.ano || null, item: q.item,
      fonte: q.fonte || q.documento, enunciado: q.enunciado || null,
      evidencia: q.evidencia, gabarito: q.gabarito, comentario: q.justificativa,
      vacina: q.vacina,
      valido: valid(q) && !(knownPending.includes(q.id) && q.pending?.length) && !q.pending?.includes("gabarito") && ["C", "E"].includes(q.gabarito),
      mecanismo: !q.pending?.includes("mecanismo") && /^F(?:10|[1-9])$/.test(q.mecanismo) ? q.mecanismo : null,
    };
  });
}

export function incidence(proofs, materia, assunto, cargo, ano) {
  if (!materia || !assunto || !cargo) return null;
  const unique = new Map();
  for (const q of proofs) {
    if (!q.prova || q.item == null || q.materia !== materia || q.cargo !== cargo || ano && String(q.ano) !== ano) continue;
    const key = JSON.stringify([q.orgao, q.ano, q.prova, String(q.item)]);
    const old = unique.get(key);
    if (!old) unique.set(key, q);
    else if (old.assunto !== q.assunto || old.gabarito !== q.gabarito || old.valido !== q.valido || old.mecanismo !== q.mecanismo) {
      unique.set(key, { ...old, valido: false });
    }
  }
  const base = [...unique.values()].filter(q => q.valido);
  const matching = base.filter(q => q.assunto === assunto);
  const falsos = matching.filter(q => q.gabarito === "E");
  const counts = new Map();
  for (const q of falsos) {
    if (q.mecanismo) counts.set(q.mecanismo, (counts.get(q.mecanismo) || 0) + 1);
  }
  const rows = [...counts].map(([mecanismo, n]) => ({
    mecanismo, n, proporcao: n / falsos.length,
    referencias: falsos.filter(q => q.mecanismo === mecanismo).map(q => q.id),
  })).sort((a, b) => b.n - a.n || a.mecanismo.localeCompare(b.mecanismo, "pt-BR", { numeric: true }));
  return { total: base.length, ocorrencias: matching.length, falsos: falsos.length,
    semMecanismo: falsos.length - rows.reduce((sum, r) => sum + r.n, 0), rows };
}
