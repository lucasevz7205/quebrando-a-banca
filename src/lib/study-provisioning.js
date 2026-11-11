import { normalizeStudyQuestion } from "./study-import.js";

/* Provisionamento de concursos: funções puras testáveis e validação do material.
 * Nunca importa histórico de respostas de uma pessoa para outra.
 */
export const STUDY_CONTENT_COLLECTIONS = Object.freeze([
  "edital", "questoes", "revisao", "materiais",
  "pontos", "pegadinhas", "analise", "textos",
]);

export function assertStudyAdministrator(user) {
  if (user?.role !== "admin") {
    throw Object.assign(new Error("Apenas o administrador pode gerenciar os concursos."), {
      status: 403, code: "FORBIDDEN"
    });
  }
}

export function validateStudyAccountDraft(input, ownerId) {
  const userId = String(input?.userId || "").trim();
  const examName = String(input?.examName || "").trim();
  const examDate = input?.examDate ? String(input.examDate).trim() : "";
  if (!userId || userId.length > 160 || !/^[a-zA-Z0-9_:@.-]+$/.test(userId)) {
    throw new Error("Informe um identificador válido de usuário registrado no Base44.");
  }
  if (ownerId && userId === ownerId) {
    throw new Error("O administrador mantém seu ambiente original. Vincule outro login.");
  }
  if (examName.length < 3 || examName.length > 160) {
    throw new Error("Informe o nome do concurso (3 a 160 caracteres).");
  }
  if (examDate) {
    const date = new Date(examDate + "T12:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate) || !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== examDate) {
      throw new Error("Data da prova inválida. Use AAAA-MM-DD.");
    }
  }
  return { user_id: userId, exam_name: examName, ...(examDate ? { exam_date: examDate } : {}), active: false };
}

export function validateStudyContentBatch(collection, documents) {
  if (!STUDY_CONTENT_COLLECTIONS.includes(collection)) {
    throw new Error("Coleção não permitida para importação. Respostas e histórico são privados.");
  }
  if (!Array.isArray(documents) || documents.length < 1 || documents.length > 25) {
    throw new Error("Envie entre 1 e 25 registros de cada vez.");
  }
  const ids = new Set();
  return documents.map(row => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new Error("Registro de material inválido.");
    }
    const normalized=collection==="questoes"?normalizeStudyQuestion(row):row;
    const id = String(normalized.id || "").trim();
    if (!id || id.length > 180 || /[/\\]/.test(id) || ids.has(id)) {
      throw new Error("Identificador ausente, repetido ou inválido no lote.");
    }
    ids.add(id);
    const next = {...normalized,id};
    if (collection === "questoes" && (!String(next.enunciado || "").trim() ||
      (!next.alternativas && !["C", "E"].includes(next.gabarito)))) {
      throw new Error("Questão " + id + ": informe enunciado e gabarito C/E, ou quatro/cinco alternativas com gabarito A–E.");
    }
    if (collection === "edital" && (!String(next.titulo || "").trim() ||
      !Array.isArray(next.caps))) {
      throw new Error("Tópico " + id + ": informe título e capítulos associados.");
    }
    if (JSON.stringify(next).length > 400000) {
      throw new Error("Registro " + id + " grande demais para importação.");
    }
    return next;
  });
}

export function canActivateStudyAccount({edital,questoes}) {
  return Boolean(edital && questoes);
}

// O admin pode habilitar o login antes da carga do material, sem inventar
// questões ou mascarar a ausência do banco. O padrão continua exigindo
// edital e questões; a exceção depende de escolha explícita allowEmpty.
export function canEnableStudyAccount(materials, allowEmpty = false) {
  return Boolean(allowEmpty) || canActivateStudyAccount(materials);
}
