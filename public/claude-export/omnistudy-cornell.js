/* Cornell manual + IA: Folha Dividida Real do Método Cornell, Cadernos por Matéria e Artefatos Remissivos de Estudo. */
(function (global) {
  "use strict";
  let busy = false;
  let message = "";
  let editingNotebookId = null;
  let addingNotebook = false;

  const ARTIFACTS_STORAGE_KEY = "qb_cornell_material_artifacts_v1";

  const asText = (v, max = 16000) => String(v == null ? "" : v).slice(0, max);
  const splitCues = value =>
    asText(value, 8500)
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  const escapeHTML = value =>
    asText(value, 16000).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const slugify = (value, fallback = "materia") =>
    asText(value, 120)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;

  const NOTEBOOK_PALETTE = [
    "#38bdf8",
    "#a78bfa",
    "#34d399",
    "#fbbf24",
    "#f472b6",
    "#fb7185",
    "#60a5fa",
    "#2dd4bf",
  ];

  const DEFAULT_SUBJECT_NOTEBOOKS = [
    { id: "nb-pl", name: "Processo Legislativo (PL)", sigla: "PL", color: "#38bdf8", custom: false },
    { id: "nb-lp", name: "Língua Portuguesa (LP)", sigla: "LP", color: "#a78bfa", custom: false },
    { id: "nb-da", name: "Direito Administrativo (DA)", sigla: "DA", color: "#34d399", custom: false },
    { id: "nb-dc", name: "Direito Constitucional (DC)", sigla: "DC", color: "#fbbf24", custom: false },
    { id: "nb-lg", name: "Linguística e Revisão (LG)", sigla: "LG", color: "#f472b6", custom: false },
    { id: "nb-cp", name: "Ciência Política (CP)", sigla: "CP", color: "#fb7185", custom: false },
    { id: "nb-ti", name: "TI e Dados (TI)", sigla: "TI", color: "#60a5fa", custom: false },
  ];

  function resolveAppState(explicitS) {
    return explicitS || global.QBApp?.S || global.S || null;
  }

  // Cadernos-padrão do concurso ARR (Câmara). Só valem para a conta legada sem edital carregado.
  const LEGACY_ARR_NOTEBOOK_IDS = new Set(DEFAULT_SUBJECT_NOTEBOOKS.map(nb => nb.id));
  const GENERIC_NOTEBOOK = { id: "nb-geral", name: "Caderno Geral", sigla: "GER", color: "#818cf8", custom: false };

  /* Matérias do concurso do próprio usuário, as mesmas exibidas na interface dele
   * (edital da conta; na falta, questões e planejamento da conta). */
  function extractContestSubjects(S) {
    const out = new Map();
    const add = (name, sigla) => {
      const clean = asText(name, 140).trim();
      if (!clean) return;
      const key = slugify(clean);
      if (out.has(key)) return;
      const sig = asText(sigla || clean.replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 3), 12).trim().toUpperCase() || "MAT";
      out.set(key, { name: clean, sigla: sig });
    };
    if (S?.ed && typeof S.ed.values === "function") {
      const topics = [...S.ed.values()].filter(t => t && !t.foraEdital && t.materia);
      topics.sort((a, b) => (+a.materiaOrdem || 99) - (+b.materiaOrdem || 99) || (+a.ordem || 0) - (+b.ordem || 0));
      for (const t of topics) add(t.materia, t.sigla);
    }
    if (!out.size && S?.q && typeof S.q.values === "function") {
      for (const q of S.q.values()) if (q?.materia) add(q.materia);
    }
    if (!out.size && Array.isArray(S?.pl)) {
      for (const t of S.pl) if (t?.materia && t.arquivada !== true) add(t.materia);
    }
    return [...out.values()];
  }

  function ensureNotebooks(state, explicitS) {
    if (!state || typeof state !== "object") return [];
    if (!Array.isArray(state.cornellNotes)) state.cornellNotes = [];
    if (!Array.isArray(state.cornellNotebooks)) state.cornellNotebooks = [];

    const S = resolveAppState(explicitS);
    const candidate = !!S?.studyAccount;
    const subjects = extractContestSubjects(S);

    // Conta de candidato nunca herda a folha-exemplo do concurso ARR.
    if (candidate) state.cornellNotes = state.cornellNotes.filter(n => n && n.id !== "cornell-seed-1");

    if (subjects.length) {
      // 1. Um caderno para cada matéria do concurso do usuário (exceto os que ele excluiu)
      const hidden = new Set(Array.isArray(state.hiddenContestNotebooks) ? state.hiddenContestNotebooks : []);
      const contestNbs = [];
      subjects.forEach((sub, idx) => {
        const id = "nb-" + slugify(sub.sigla || sub.name);
        if (hidden.has(id) || contestNbs.some(nb => nb.id === id)) return;
        let nb =
          state.cornellNotebooks.find(item => item.id === id) ||
          state.cornellNotebooks.find(item => !item.custom && slugify(item.name) === slugify(sub.name));
        if (!nb) {
          nb = { id, name: sub.name, sigla: sub.sigla, color: NOTEBOOK_PALETTE[idx % NOTEBOOK_PALETTE.length], custom: false };
        } else if (!nb.custom && !nb.renamed) {
          nb.name = sub.name;
          nb.sigla = sub.sigla || nb.sigla;
        }
        nb.fromContest = true;
        contestNbs.push(nb);
      });
      // 2. Cadernos criados pelo próprio usuário são preservados
      const customNbs = state.cornellNotebooks.filter(
        nb => nb.custom && !contestNbs.some(item => item.id === nb.id)
      );
      if (!contestNbs.length && !customNbs.length) contestNbs.push({ ...GENERIC_NOTEBOOK });
      const contestIds = new Set(contestNbs.map(nb => nb.id));
      // 3. Cadernos-padrão de outro concurso (ex.: ARR) saem; as folhas migram para a matéria equivalente
      const removed = state.cornellNotebooks.filter(nb => !nb.custom && !contestIds.has(nb.id));
      for (const old of removed) {
        const target =
          contestNbs.find(nb => old.sigla && String(nb.sigla || "").toLowerCase() === String(old.sigla).toLowerCase()) ||
          contestNbs.find(nb => slugify(nb.name) === slugify(old.name)) ||
          contestNbs[0] ||
          customNbs[0];
        for (const note of state.cornellNotes) {
          if (note && note.notebookId === old.id) {
            note.notebookId = target.id;
            note.subject = target.name;
          }
        }
      }
      state.cornellNotebooks = [...contestNbs, ...customNbs];
      for (const note of state.cornellNotes) {
        const nb = note && contestNbs.find(item => item.id === note.notebookId);
        if (nb) note.subject = nb.name;
      }
    } else {
      if (candidate) {
        // Edital ainda carregando: nada do concurso ARR aparece para o candidato.
        state.cornellNotebooks = state.cornellNotebooks.filter(nb => nb.custom || !LEGACY_ARR_NOTEBOOK_IDS.has(nb.id));
      }
      if (!state.cornellNotebooks.length) {
        state.cornellNotebooks = candidate
          ? [{ ...GENERIC_NOTEBOOK }]
          : DEFAULT_SUBJECT_NOTEBOOKS.map(nb => ({ ...nb }));
      }
    }

    // Garante que toda folha existente esteja vinculada a um caderno de matéria
    for (const note of state.cornellNotes) {
      if (!note) continue;
      let targetNb =
        state.cornellNotebooks.find(nb => nb.id === note.notebookId) ||
        state.cornellNotebooks.find(nb => slugify(nb.name) === slugify(note.subject || "")) ||
        state.cornellNotebooks.find(
          nb =>
            note.subject &&
            (slugify(note.subject).includes(slugify(nb.name)) ||
              slugify(nb.name).includes(slugify(note.subject)))
        );
      if (!targetNb && note.subject) {
        const id = "nb-" + slugify(note.subject);
        targetNb = state.cornellNotebooks.find(nb => nb.id === id);
        if (!targetNb) {
          targetNb = {
            id,
            name: asText(note.subject, 140),
            sigla: asText(note.subject.replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 3).toUpperCase() || "MAT", 12),
            color: NOTEBOOK_PALETTE[state.cornellNotebooks.length % NOTEBOOK_PALETTE.length],
            custom: true,
          };
          state.cornellNotebooks.push(targetNb);
        }
      }
      if (!targetNb) targetNb = state.cornellNotebooks[0];
      if (targetNb) {
        note.notebookId = targetNb.id;
        if (!note.subject) note.subject = targetNb.name;
      }
    }

    if (
      !state.selectedNotebookId ||
      (state.selectedNotebookId !== "all" &&
        !state.cornellNotebooks.some(nb => nb.id === state.selectedNotebookId))
    ) {
      state.selectedNotebookId = "all";
    }

    return state.cornellNotebooks;
  }

  function addNotebook(state, { name, sigla, color } = {}) {
    ensureNotebooks(state);
    const cleanName = asText(name, 140).trim();
    if (!cleanName) return null;
    const baseId = "nb-" + slugify(cleanName) + "-" + Date.now().toString(36).slice(-3);
    const nb = {
      id: baseId,
      name: cleanName,
      sigla: asText((sigla || cleanName.slice(0, 3)).toUpperCase(), 12).trim() || "MAT",
      color: color || NOTEBOOK_PALETTE[state.cornellNotebooks.length % NOTEBOOK_PALETTE.length],
      custom: true,
    };
    state.cornellNotebooks.push(nb);
    state.selectedNotebookId = nb.id;
    return nb;
  }

  function updateNotebook(state, notebookId, patch = {}) {
    ensureNotebooks(state);
    const nb = state.cornellNotebooks.find(item => item.id === notebookId);
    if (!nb) return null;
    const oldName = nb.name;
    if (patch.name !== undefined && asText(patch.name, 140).trim()) {
      nb.name = asText(patch.name, 140).trim();
      if (nb.name !== oldName) nb.renamed = true;
    }
    if (patch.sigla !== undefined && asText(patch.sigla, 12).trim()) {
      nb.sigla = asText(patch.sigla, 12).trim().toUpperCase();
    }
    if (patch.color !== undefined && asText(patch.color, 30).trim()) {
      nb.color = asText(patch.color, 30).trim();
    }
    // Atualiza a matéria das folhas pertencentes a este caderno
    for (const note of state.cornellNotes || []) {
      if (note.notebookId === nb.id || note.subject === oldName) {
        note.notebookId = nb.id;
        note.subject = nb.name;
      }
    }
    return nb;
  }

  function deleteNotebook(state, notebookId, options = {}) {
    ensureNotebooks(state);
    if (state.cornellNotebooks.length <= 1) return false;
    const idx = state.cornellNotebooks.findIndex(nb => nb.id === notebookId);
    if (idx === -1) return false;
    const [deletedNb] = state.cornellNotebooks.splice(idx, 1);
    if (deletedNb?.fromContest) {
      // Lembra a exclusão para o caderno da matéria não reaparecer sozinho.
      const hidden = new Set(Array.isArray(state.hiddenContestNotebooks) ? state.hiddenContestNotebooks : []);
      hidden.add(deletedNb.id);
      state.hiddenContestNotebooks = [...hidden];
    }
    const fallbackNb = state.cornellNotebooks[0];
    if (options.deleteNotes) {
      state.cornellNotes = (state.cornellNotes || []).filter(n => n.notebookId !== notebookId);
    } else if (fallbackNb) {
      for (const note of state.cornellNotes || []) {
        if (note.notebookId === notebookId) {
          note.notebookId = fallbackNb.id;
          note.subject = fallbackNb.name;
        }
      }
    }
    if (state.selectedNotebookId === notebookId) {
      state.selectedNotebookId = "all";
    }
    return true;
  }

  function selectNotebook(state, notebookId) {
    ensureNotebooks(state);
    if (notebookId === "all" || state.cornellNotebooks.some(nb => nb.id === notebookId)) {
      state.selectedNotebookId = notebookId;
    } else {
      state.selectedNotebookId = "all";
    }
    const visible = getVisibleNotes(state);
    if (visible.length && !visible.some(n => n.id === state.selectedCornellId)) {
      state.selectedCornellId = visible[0].id;
    }
    return state.selectedNotebookId;
  }

  function getVisibleNotes(state) {
    ensureNotebooks(state);
    if (!state.selectedNotebookId || state.selectedNotebookId === "all") {
      return state.cornellNotes;
    }
    return state.cornellNotes.filter(n => n.notebookId === state.selectedNotebookId);
  }

  function capture(note) {
    return JSON.stringify({
      title: note.title || "",
      subject: note.subject || "",
      cues: note.cues || [],
      notes: note.notes || "",
      summary: note.summary || "",
      referenceText: note.referenceText || "",
    });
  }

  function newManual(state) {
    if (!Array.isArray(state.cornellNotes)) state.cornellNotes = [];
    ensureNotebooks(state);
    const activeNb =
      state.cornellNotebooks.find(nb => nb.id === state.selectedNotebookId) ||
      state.cornellNotebooks.find(nb => slugify(nb.name) === slugify(state.subject || "")) ||
      state.cornellNotebooks[0];
    const id = "cornell-manual-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const note = {
      id,
      title: "Nova folha Cornell",
      subject: activeNb ? activeNb.name : state.subject || "",
      notebookId: activeNb ? activeNb.id : "",
      topicId: "",
      date: new Date().toLocaleDateString("pt-BR"),
      cues: [],
      notes: "",
      summary: "",
      referenceText: "",
      origin: "manual",
      actionItems: [],
    };
    state.cornellNotes.unshift(note);
    state.selectedCornellId = id;
    return note;
  }

  function deleteNote(state, noteId, explicitS) {
    if (!Array.isArray(state?.cornellNotes)) return false;
    const idx = state.cornellNotes.findIndex(n => n.id === noteId);
    if (idx === -1) return false;
    const [removed] = state.cornellNotes.splice(idx, 1);
    const S = resolveAppState(explicitS);
    if (removed?.materialArtifactId && S?.mat) {
      S.mat.delete(removed.materialArtifactId);
    }
    if (state.selectedCornellId === noteId) {
      const visible = getVisibleNotes(state);
      state.selectedCornellId = visible[0]?.id || state.cornellNotes[0]?.id || "";
    }
    return true;
  }

  function applySuggestion(note) {
    const review = note && note.cornellReview;
    if (!review || review.basedOn !== capture(note)) return false;
    const before = capture(note);
    const proposal = review.suggested;
    note.cues = [...proposal.cues];
    note.notes = proposal.notes;
    note.summary = proposal.summary;
    delete note.cornellReview;
    note.cornellUndo = { before, after: capture(note) };
    return true;
  }

  function undoSuggestion(note) {
    if (!note?.cornellUndo || note.cornellUndo.after !== capture(note)) return false;
    const before = JSON.parse(note.cornellUndo.before);
    Object.assign(note, before);
    delete note.cornellUndo;
    return true;
  }

  function updateNote(note, field, value, state) {
    if (
      !note ||
      !["title", "subject", "notebookId", "topicId", "cues", "notes", "summary", "referenceText"].includes(field)
    )
      return;
    if (field === "cues") {
      note.cues = splitCues(value);
    } else if (field === "notebookId" && state) {
      ensureNotebooks(state);
      const nb = state.cornellNotebooks.find(item => item.id === value);
      if (nb) {
        note.notebookId = nb.id;
        note.subject = nb.name;
      }
    } else {
      note[field] = asText(
        value,
        field === "referenceText"
          ? 15000
          : field === "notes"
          ? 12000
          : field === "summary"
          ? 2500
          : 300
      );
      if (field === "subject" && state) {
        ensureNotebooks(state);
        const matched = state.cornellNotebooks.find(
          nb => slugify(nb.name) === slugify(note.subject) || nb.id === note.subject
        );
        if (matched) {
          note.notebookId = matched.id;
          note.subject = matched.name;
        }
      }
    }
    // Um parecer anterior não se aplica a uma nota já modificada.
    delete note.cornellReview;
  }

  /* ========================================================================
     CONVERSÃO REMISSIVA EM ARTEFATO DE ESTUDO & MATERIAL (aba Materiais / S.mat)
     ======================================================================== */
  function findBestSyllabusTopic(note, S) {
    if (!S?.ed || typeof S.ed.values !== "function") return null;
    if (note?.topicId && S.ed.has(note.topicId)) return S.ed.get(note.topicId);
    const subjSlug = slugify(note?.subject || "");
    const titleSlug = slugify(note?.title || "");
    const allTopics = [...S.ed.values()].filter(t => t && !t.foraEdital);
    // 1. Tópico cujo título aparece no título da folha
    const byTitle = allTopics.find(
      t => titleSlug && slugify(t.titulo || "").length > 4 && titleSlug.includes(slugify(t.titulo))
    );
    if (byTitle) return byTitle;
    // 2. Primeiro tópico da mesma matéria
    const byMateria = allTopics.find(
      t =>
        subjSlug &&
        (slugify(t.materia || "") === subjSlug ||
          subjSlug.includes(slugify(t.materia || "___")) ||
          (t.sigla && subjSlug.includes(slugify(t.sigla))))
    );
    return byMateria || null;
  }

  function toMaterialArtifact(note, explicitS) {
    if (!note) return null;
    const S = resolveAppState(explicitS);
    const matchedTopic = findBestSyllabusTopic(note, S);
    const resolvedTopicId = note.topicId || matchedTopic?.id || "";
    if (resolvedTopicId && !note.topicId) note.topicId = resolvedTopicId;

    const materiaName = matchedTopic?.materia || note.subject || "Caderno Cornell";
    const artifactId = note.materialArtifactId || "mat-cornell-" + slugify(note.id, "folha");
    const cues = Array.isArray(note.cues) ? note.cues : splitCues(note.cues || "");
    const secoes = cues.length
      ? cues.map((cue, idx) => `Pista ${idx + 1}: ${cue}`)
      : ["Pistas de evocação", "Anotações principais (70%)", "Síntese executiva (rodapé)"];

    const fullContent = [
      `# ${note.title || "Folha Cornell"}`,
      `Matéria / Caderno: ${materiaName}`,
      resolvedTopicId && matchedTopic ? `Assunto vinculado: ${matchedTopic.num || ""} ${matchedTopic.titulo || ""}`.trim() : "",
      "",
      "## Pistas e Perguntas de Evocação (Coluna 30%)",
      ...(cues.length ? cues.map((c, i) => `${i + 1}. ${c}`) : ["(Sem pistas cadastradas)"]),
      "",
      "## Anotações e Desenvolvimento (Coluna 70%)",
      note.notes || "(Sem anotações)",
      "",
      "## Síntese Executiva do Rodapé (100%)",
      note.summary || "(Sem síntese)",
      note.referenceText ? `\n## Texto-Fonte de Referência\n${note.referenceText}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const nowIso = new Date().toISOString();
    return {
      id: artifactId,
      tipo: "material",
      origemArtefato: "cornell",
      cornellNoteId: note.id,
      notebookId: note.notebookId || "",
      materia: materiaName,
      topicos: resolvedTopicId ? [resolvedTopicId] : [],
      titulo: `Caderno Cornell · ${note.title || "Folha de Estudo"}`,
      descricao:
        note.summary ||
        asText(note.notes, 260) ||
        "Artefato de estudo estruturado pelo Método Cornell (Pistas 30% + Notas 70% + Síntese).",
      conteudo: fullContent,
      texto: fullContent,
      resumo: note.summary || "",
      anotacoes: note.notes || "",
      pistas: cues,
      referenceText: note.referenceText || "",
      secoes,
      chat: "Caderno Cornell · Artefato Remissivo",
      criadoEm: note.publishedAt || nowIso.slice(0, 10),
      atualizadoEm: nowIso,
    };
  }

  function persistArtifactLocally(artifact) {
    try {
      if (!global.localStorage || !artifact?.id) return;
      const raw = global.localStorage.getItem(ARTIFACTS_STORAGE_KEY);
      const mapObj = raw ? JSON.parse(raw) : {};
      mapObj[artifact.id] = artifact;
      global.localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(mapObj));
    } catch (_e) {}
  }

  function publishNoteAsMaterial(note, explicitS) {
    if (!note) return null;
    const S = resolveAppState(explicitS);
    const artifact = toMaterialArtifact(note, S);
    if (!artifact) return null;

    note.materialArtifactId = artifact.id;
    note.publishedAt = artifact.criadoEm;
    persistArtifactLocally(artifact);

    if (S) {
      if (S.mat && typeof S.mat.set === "function") {
        S.mat.set(artifact.id, artifact);
      }
      if (S.abertos && typeof S.abertos.add === "function") {
        S.abertos.add("ct:" + artifact.materia);
      }
      if (S.db && typeof S.db.doc === "function") {
        const writeOp = () => S.db.doc("materiais/" + artifact.id).set(artifact);
        if (global.QBApp?.enqueue) global.QBApp.enqueue(writeOp);
        else writeOp();
      }
    }
    return artifact;
  }

  function syncStoredArtifactsIntoS(explicitS) {
    const S = resolveAppState(explicitS);
    if (!S?.mat || typeof S.mat.set !== "function") return 0;
    let count = 0;
    try {
      const raw = global.localStorage && global.localStorage.getItem(ARTIFACTS_STORAGE_KEY);
      if (raw) {
        const mapObj = JSON.parse(raw);
        for (const art of Object.values(mapObj || {})) {
          if (art && art.id && !S.mat.has(art.id)) {
            S.mat.set(art.id, art);
            count++;
          }
        }
      }
    } catch (_e) {}
    return count;
  }

  function openMaterialInStudyShell(note, explicitS) {
    const S = resolveAppState(explicitS);
    const artifact = publishNoteAsMaterial(note, S);
    if (S) {
      if (S.abertos && artifact?.materia) S.abertos.add("ct:" + artifact.materia);
      if (typeof global.QBApp?.setView === "function") {
        global.QBApp.setView("conteudo");
      } else {
        S.view = "conteudo";
        global.QBApp?.render?.(true);
      }
    }
    if (global.QBOmniStudy?.closeStudio) {
      global.QBOmniStudy.closeStudio();
    } else {
      global.document?.getElementById("omni-drawer-backdrop")?.classList.remove("open");
    }
    return artifact;
  }

  function openCornellSheetById(noteId, options = {}) {
    const omni = global.QBOmniStudy;
    const state = options.state || omni?.state;
    if (state) {
      ensureNotebooks(state, options.S);
      const target = (state.cornellNotes || []).find(
        n => n.id === noteId || n.materialArtifactId === noteId
      );
      if (target) {
        state.selectedCornellId = target.id;
        state.selectedNotebookId = target.notebookId || "all";
      }
      state.activeTab = "cornell";
    }
    if (typeof omni?.openStudio === "function") {
      omni.openStudio("cornell");
    }
    return state?.selectedCornellId || null;
  }

  function deduceLabelLocal(title, body, fallback = "Conceito Chave") {
    const combined = `${title || ""} ${body || ""}`.toLowerCase();
    if (/(exce[çc][ãa]o|ressalva|salvo|exceto|n[ãa]o se aplica|afasta)/i.test(combined)) return "Exceção Taxativa";
    if (/(qu[óo]rum|maioria|dois ter[çc]os|tr[êe]s quintos)/i.test(combined)) return "Quórum Qualificado";
    if (/(prazo|tempestiv|dias|meses|anos|decad[êe]ncia|prescri)/i.test(combined)) return "Prazo Legal";
    if (/(veda[çc][ãa]o|proibi|defeso|vedado|impedido|il[íi]cito)/i.test(combined)) return "Vedação Expressa";
    if (/(compet[êe]ncia privativa|privativamente|exclusiv)/i.test(combined)) return "Competência Privativa";
    if (/(compet[êe]ncia comum|concorrente)/i.test(combined)) return "Competência Concorrente";
    if (/(requisito|condi[çc][ãa]o|pressuposto|elemento)/i.test(combined)) return "Requisito Legal";
    if (/(anula[çc][ãa]o|nulidade|revoga[çc][ãa]o|convalida)/i.test(combined)) return "Desfazimento do Ato";
    if (/(recurso|agravo|apela[çc][ãa]o|embargos)/i.test(combined)) return "Garantia / Recurso";
    if (/(efeito|efic[áa]cia|retroat)/i.test(combined)) return "Efeito Jurídico";
    if (/(pegadinha|armadilha|cebraspe|falso|invers[ãa]o)/i.test(combined)) return "Alerta de Banca";
    if (/(regra geral|em regra|padr[ãa]o)/i.test(combined)) return "Regra Geral";
    return fallback;
  }

  function buildMindMapFromNote(note, options = {}) {
    if (global.QBMindMapStudio && typeof global.QBMindMapStudio.cornellToMindMap === "function") {
      return global.QBMindMapStudio.cornellToMindMap(note, options);
    }
    const title = asText(note?.title || note?.subject || "Mapa Mental Cornell", 240);
    const cues = Array.isArray(note?.cues) ? note.cues : splitCues(note?.cues || "");
    const lines = asText(note?.notes, 12000)
      .split(/\r?\n/)
      .map(s => s.replace(/^[\s•*\-–—\d.)]+/, "").trim())
      .filter(Boolean);
    const branchTitles = cues.length ? cues : lines.slice(0, 4);
    const ramos = (branchTitles.length ? branchTitles : ["Conceito Base", "Regra e Aplicação", "Exceções"]).map(
      (cue, idx) => {
        const cleanTitle = asText(cue, 160).replace(/^Pista\s*\d+\s*:\s*/i, "").replace(/\?+$/, "").trim() || "Conceito " + (idx + 1);
        const bodyText = asText(lines[idx] || note?.summary || cue, 1200);
        const rotulo = deduceLabelLocal(cleanTitle, bodyText, idx === 0 ? "Conceito Central" : "Regra Geral");
        const subList = lines.slice(idx + 1, idx + 4);
        return {
          id: "cornell-r" + (idx + 1),
          t: cleanTitle,
          rotulo,
          n: asText(bodyText, 260),
          cor: (idx % 8) + 1,
          x: {
            e: bodyText,
            trap: `Ponto de atenção ou pegadinha sobre "${cleanTitle}".`,
            src: asText(note?.referenceText || "Caderno Cornell · " + title, 240),
          },
          f: subList.map((sub, sIdx) => {
            const subTitle = asText(sub, 90).replace(/^[\s•*\-–—\d.)]+/, "").trim();
            return {
              id: "cornell-r" + (idx + 1) + "-" + (sIdx + 1),
              t: subTitle,
              rotulo: deduceLabelLocal(subTitle, subTitle, "Requisito"),
              n: asText(sub, 200),
              cor: (idx % 8) + 1,
              x: { e: asText(sub, 600) },
            };
          }),
        };
      }
    );
    while (ramos.length < 3) {
      const k = ramos.length + 1;
      const fallbackTitle = k === 2 ? "Desdobramento e Requisitos" : "Síntese e Exceções";
      ramos.push({
        id: "cornell-r" + k,
        t: fallbackTitle,
        rotulo: deduceLabelLocal(fallbackTitle, fallbackTitle, "Conceito Chave"),
        n: asText(note?.summary || note?.notes || title, 240),
        cor: k,
        x: { e: asText(note?.summary || note?.notes || title, 800) },
        f: [],
      });
    }
    return {
      centro: title,
      autor: "Baseado na folha Cornell · Estilo SimpleMind",
      ramos,
      ligacoes: [[ramos[0].id, ramos[ramos.length - 1].id, "Conceito Central → Síntese"]],
      origemCornell: { noteId: note?.id || "", title },
    };
  }

  function render({ state, body, saveState, callAI, S: explicitS }) {
    if (!Array.isArray(state.cornellNotes)) state.cornellNotes = [];
    if (!state.cornellGenerator || typeof state.cornellGenerator !== "object") {
      state.cornellGenerator = { topic: state.subject || "", raw: "" };
    }
    const S = resolveAppState(explicitS);
    ensureNotebooks(state, S);
    syncStoredArtifactsIntoS(S);

    const visibleNotes = getVisibleNotes(state);
    const current =
      visibleNotes.find(n => n.id === state.selectedCornellId) ||
      state.cornellNotes.find(n => n.id === state.selectedCornellId) ||
      visibleNotes[0] ||
      state.cornellNotes[0] ||
      null;
    if (current && state.selectedCornellId !== current.id) {
      state.selectedCornellId = current.id;
    }

    const activeNb =
      state.cornellNotebooks.find(nb => nb.id === (current?.notebookId || state.selectedNotebookId)) ||
      state.cornellNotebooks[0];

    const syllabusTopics =
      S?.ed && typeof S.ed.values === "function"
        ? [...S.ed.values()]
            .filter(t => t && !t.foraEdital)
            .sort((a, b) => (+a.ordem || 0) - (+b.ordem || 0))
        : [];

    const editingNb = editingNotebookId
      ? state.cornellNotebooks.find(nb => nb.id === editingNotebookId)
      : null;

    const notebookFormHTML =
      addingNotebook || editingNb
        ? [
            '<div class="omni-notebook-customizer" aria-label="Personalizar Caderno da Matéria">',
            '<strong style="font-size:11.5px;color:#e2e8f0">' +
              (editingNb ? "Personalizar Caderno" : "Novo Caderno por Matéria") +
              "</strong>",
            '<input type="text" class="omni-input" id="omni-nb-name-input" maxlength="120" placeholder="Nome da Matéria (ex: Direito Constitucional)" value="' +
              escapeHTML(editingNb ? editingNb.name : "") +
              '">',
            '<div class="omni-notebook-customizer-row">',
            '<input type="text" class="omni-input" id="omni-nb-sigla-input" maxlength="10" style="width:90px" placeholder="Sigla (DC)" value="' +
              escapeHTML(editingNb ? editingNb.sigla : "") +
              '">',
            '<input type="color" id="omni-nb-color-input" value="' +
              escapeHTML(editingNb?.color || "#38bdf8") +
              '" style="width:42px;height:34px;border:0;background:transparent;cursor:pointer" title="Cor do caderno">',
            '<button type="button" class="omni-btn" id="omni-nb-save-btn" style="padding:6px 10px;font-size:11.5px">' +
              (editingNb ? "Salvar" : "Criar Caderno") +
              "</button>",
            '<button type="button" class="omni-btn omni-btn-ghost" id="omni-nb-cancel-btn" style="padding:6px 10px;font-size:11.5px">Cancelar</button>',
            "</div>",
            "</div>",
          ].join("")
        : "";

    const notebooksListHTML = [
      '<div class="omni-notebook-list" role="navigation" aria-label="Cadernos por Matéria">',
      '<div class="omni-notebook-item ' +
        (state.selectedNotebookId === "all" ? "active" : "") +
        '" style="--nb-color:#818cf8" data-notebook-select="all">',
      '<span class="omni-notebook-dot"></span>',
      '<div class="omni-notebook-meta"><strong>Todos os Cadernos</strong><small>' +
        state.cornellNotes.length +
        " folha(s) no total</small></div>",
      "</div>",
      ...state.cornellNotebooks.map(nb => {
        const count = state.cornellNotes.filter(n => n.notebookId === nb.id).length;
        const isSelected = state.selectedNotebookId === nb.id;
        return [
          '<div class="omni-notebook-item ' +
            (isSelected ? "active" : "") +
            '" style="--nb-color:' +
            escapeHTML(nb.color || "#38bdf8") +
            '" data-notebook-select="' +
            escapeHTML(nb.id) +
            '">',
          '<span class="omni-notebook-dot"></span>',
          '<div class="omni-notebook-meta"><strong>' +
            escapeHTML(nb.name) +
            "</strong><small>" +
            escapeHTML(nb.sigla || "MAT") +
            " · " +
            count +
            " folha(s)</small></div>",
          '<div class="omni-notebook-actions">',
          '<button type="button" class="omni-notebook-icon-btn" data-notebook-edit="' +
            escapeHTML(nb.id) +
            '" title="Personalizar caderno">✎</button>',
          state.cornellNotebooks.length > 1
            ? '<button type="button" class="omni-notebook-icon-btn danger" data-notebook-delete="' +
              escapeHTML(nb.id) +
              '" title="Excluir caderno">×</button>'
            : "",
          "</div>",
          "</div>",
        ].join("");
      }),
      "</div>",
    ].join("");

    // Folha Dividida Real do Método Cornell (Cabeçalho 100% | Corpo 30% Pistas + Margem Vermelha + 70% Notas Pautadas | Rodapé 100% Síntese)
    const dividedSheetHTML = current
      ? [
          '<section class="omni-cornell-divided-page omni-cornell-editor omni-cornell-sheet" aria-label="Folha Dividida Método Cornell">',
          '<header class="omni-cornell-page-header">',
          '<div class="omni-cornell-page-title-row">',
          '<div><label class="omni-label" for="omni-cornell-title-edit">Título da Folha Cornell</label>',
          '<input class="omni-input" id="omni-cornell-title-edit" maxlength="300" value="' +
            escapeHTML(current.title) +
            '" placeholder="Ex: Matéria · Assunto da aula ou leitura"></div>',
          '<div><label class="omni-label" for="omni-cornell-subject-edit">Caderno / Matéria</label>',
          '<input class="omni-input" id="omni-cornell-subject-edit" list="omni-cornell-notebooks-datalist" maxlength="300" value="' +
            escapeHTML(current.subject) +
            '" placeholder="Selecione ou digite a matéria">',
          '<datalist id="omni-cornell-notebooks-datalist">' +
            state.cornellNotebooks.map(nb => '<option value="' + escapeHTML(nb.name) + '"></option>').join("") +
            "</datalist></div>",
          "</div>",
          '<div class="omni-cornell-page-meta-row">',
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">',
          '<label class="omni-label" for="omni-cornell-notebook-select" style="margin:0">Caderno:</label>',
          '<select class="omni-select" id="omni-cornell-notebook-select" style="width:auto;min-width:190px;padding:5px 9px;font-size:12px">',
          state.cornellNotebooks
            .map(
              nb =>
                '<option value="' +
                escapeHTML(nb.id) +
                '" ' +
                (current.notebookId === nb.id ? "selected" : "") +
                ">📓 " +
                escapeHTML(nb.name) +
                "</option>"
            )
            .join(""),
          "</select>",
          syllabusTopics.length
            ? '<label class="omni-label" for="omni-cornell-topic-select" style="margin:0">Assunto do Edital (Remissivo):</label>' +
              '<select class="omni-select" id="omni-cornell-topic-select" style="width:auto;max-width:260px;padding:5px 9px;font-size:12px">' +
              '<option value="">— Vincular ao assunto do edital —</option>' +
              syllabusTopics
                .map(
                  t =>
                    '<option value="' +
                    escapeHTML(t.id) +
                    '" ' +
                    (current.topicId === t.id ? "selected" : "") +
                    ">" +
                    escapeHTML([t.sigla?.toUpperCase(), t.num, t.titulo].filter(Boolean).join(" · ")) +
                    "</option>"
                )
                .join("") +
              "</select>"
            : "",
          "</div>",
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">',
          '<small style="color:#94a3b8">' +
            escapeHTML(current.subject || "Sem assunto") +
            " · " +
            escapeHTML(current.date || "Hoje") +
            "</small>",
          '<span class="omni-cornell-local">Salva automaticamente neste navegador</span>',
          '<button type="button" class="omni-btn omni-btn-ghost" id="omni-cornell-cover" style="padding:5px 10px;font-size:11.5px">' +
            (state.coverCornellNotes ? "👁 Revelar notas (70%)" : "🙈 Cobrir notas para evocação") +
            "</button>",
          "</div>",
          "</div>",
          "</header>",

          // CORPO DIVIDIDO 30% (ESQUERDA: PISTAS E PERGUNTAS) | MARGEM CORNELL | 70% (DIREITA: ANOTAÇÕES PAUTADAS)
          '<div class="omni-cornell-page-body omni-cornell-grid">',
          '<div class="omni-cornell-col-cues omni-cornell-cues">',
          '<div class="omni-cornell-zone-label"><span>Coluna de Pistas & Perguntas (30%)</span><b>Evocação</b></div>',
          '<label class="omni-label" for="omni-cornell-cues-edit" style="display:none">Pistas e perguntas (30%): uma por linha</label>',
          '<textarea class="omni-textarea" id="omni-cornell-cues-edit" rows="10" maxlength="8500" placeholder="Escreva 1 pergunta-chave, palavra-gatilho ou contraste por linha:&#10;• Qual é a regra geral?&#10;• Qual é a exceção expressa?&#10;• Par de contraste X (e não Y)?">' +
            escapeHTML((current.cues || []).join("\n")) +
            "</textarea>",
          '<div class="omni-cornell-cues-chips">' +
            (current.cues || [])
              .map((c, idx) => '<span class="omni-cornell-cue-pill"><b>P' + (idx + 1) + ".</b> " + escapeHTML(c) + "</span>")
              .join("") +
            (current.cues || []).map(c => '<p style="display:none">' + escapeHTML(c) + "</p>").join("") +
            "</div>",
          "</div>",

          '<div class="omni-cornell-col-notes omni-cornell-notes ' +
            (state.coverCornellNotes ? "is-covered" : "") +
            '">',
          '<div class="omni-cornell-zone-label"><span>Coluna de Anotações da Aula / Leitura (70%)</span><b>Desenvolvimento</b></div>',
          '<label class="omni-label" for="omni-cornell-notes-edit" style="display:none">Anotações próprias (70%)</label>',
          '<textarea class="omni-textarea" id="omni-cornell-notes-edit" rows="12" maxlength="12000" placeholder="Registre aqui os conceitos, esquemas, artigos, exemplos práticos e distinções na folha pautada...">' +
            escapeHTML(current.notes || "") +
            "</textarea>",
          '<div style="display:none">' + escapeHTML(current.notes || "Anotações ainda não preenchidas.") + "</div>",
          "</div>",
          "</div>",

          // RODAPÉ HORIZONTAL 100% (SÍNTESE EXECUTIVA DO MÉTODO CORNELL)
          '<footer class="omni-cornell-page-footer omni-cornell-summary">',
          '<div class="omni-cornell-zone-label"><span>Síntese Final do Rodapé (100% da largura da folha)</span><b>Resumo em 2 a 3 frases</b></div>',
          '<label class="omni-label" for="omni-cornell-summary-edit" style="display:none">Síntese final (rodapé)</label>',
          '<textarea class="omni-textarea" id="omni-cornell-summary-edit" rows="3" maxlength="2500" placeholder="Feche a folha explicando a essência do tópico com suas próprias palavras (como se ensinasse a alguém)...">' +
            escapeHTML(current.summary || "") +
            "</textarea>",
          '<div style="display:none">' + escapeHTML(current.summary || "Síntese ainda não preenchida.") + "</div>",
          "</footer>",

          // BARRA DE ARTEFATO REMISSIVO (MATERIAIS), MAPA MENTAL, GAN E CONFERÊNCIA DE FONTE
          '<div class="omni-cornell-artifact-bar">',
          '<div style="width:100%">',
          '<label class="omni-label" for="omni-cornell-source-edit">Texto-fonte para conferência da IA e lastro documental (opcional)</label>',
          '<textarea class="omni-textarea" id="omni-cornell-source-edit" rows="2" maxlength="15000" placeholder="Cole o dispositivo legal ou trecho original. Sem fonte, a IA fará apenas revisão preliminar.">' +
            escapeHTML(current.referenceText || "") +
            "</textarea>",
          '<p class="omni-cornell-hint" style="margin:6px 0 0">A IA não verifica automaticamente páginas na internet nem a vigência de leis. Com texto-fonte, compara suas notas a esse texto. Sem fonte, a avaliação não é verificação factual.</p>',
          "</div>",
          '<div class="omni-cornell-actions" style="width:100%">',
          '<button type="button" id="omni-cornell-publish-material" class="omni-btn" ' +
            (busy ? "disabled" : "") +
            ">📑 Transformar em Artefato de Material (Remissivo)</button>",
          '<button type="button" id="omni-cornell-open-material" class="omni-btn omni-btn-ghost" ' +
            (busy ? "disabled" : "") +
            ">↗ Abrir na aba Materiais</button>",
          '<button type="button" id="omni-cornell-to-map" class="omni-btn omni-btn-ghost" ' +
            (busy ? "disabled" : "") +
            ">🗺️ Usar como Subsídio no Mapa Mental</button>",
          '<button type="button" id="omni-cornell-to-map-ai" class="omni-btn omni-btn-ghost" ' +
            (busy ? "disabled" : "") +
            ">✨ Gerar Mapa Mental com IA</button>",
          '<button type="button" id="omni-cornell-to-gan" class="omni-btn omni-btn-ghost" ' +
            (busy ? "disabled" : "") +
            ">⚔️ Abrir Mapa + Questões GAN</button>",
          '<button type="button" id="omni-cornell-review" class="omni-btn omni-btn-ghost" ' +
            (busy ? "disabled" : "") +
            ">Conferir e corrigir com IA</button>",
          current.cornellUndo
            ? '<button type="button" id="omni-cornell-undo" class="omni-btn omni-btn-ghost">Desfazer última correção aplicada</button>'
            : "",
          "</div>",
          "</div>",
          "</section>",
        ].join("")
      : '<section class="omni-card">Crie uma folha manual ou gere uma a partir das suas anotações no caderno selecionado à esquerda.</section>';

    const review = current?.cornellReview;
    const reviewHTML = review
      ? [
          '<section class="omni-card omni-cornell-review" aria-label="Parecer da IA">',
          "<strong>Revisão sugerida, aguardando aprovação</strong>",
          "<p>" + escapeHTML(review.verdict) + "</p>",
          '<p class="omni-cornell-hint">' + escapeHTML(review.notice || "Não é certificação da fonte.") + "</p>",
          "<strong>Achados (" + (review.issues || []).length + ")</strong>",
          '<ul class="omni-cornell-issues">' +
            ((review.issues || [])
              .map(
                item =>
                  "<li><b>" +
                  escapeHTML(item.field) +
                  " · " +
                  escapeHTML(item.type) +
                  "</b>: " +
                  escapeHTML(item.description) +
                  (item.sourceExcerpt
                    ? "<blockquote>Trecho encontrado: “" + escapeHTML(item.sourceExcerpt) + "”</blockquote>"
                    : "") +
                  "</li>"
              )
              .join("") || "<li>Nenhum problema apontado pela IA. Isso não comprova exatidão factual.</li>") +
            "</ul>",
          "<details><summary>Conferir texto proposto antes de aplicar</summary>",
          '<div class="omni-cornell-proposal"><b>Pistas</b><pre>' +
            escapeHTML((review.suggested?.cues || []).join("\n")) +
            "</pre><b>Notas</b><pre>" +
            escapeHTML(review.suggested?.notes || "") +
            "</pre><b>Síntese</b><pre>" +
            escapeHTML(review.suggested?.summary || "") +
            "</pre></div></details>",
          '<div class="omni-cornell-actions"><button type="button" class="omni-btn" id="omni-cornell-apply">Aplicar correções à minha folha</button>',
          '<button type="button" class="omni-btn omni-btn-ghost" id="omni-cornell-discard">Descartar sugestões</button></div>',
          "</section>",
        ].join("")
      : "";

    body.innerHTML = [
      '<div class="omni-cornell-workspace"><aside class="omni-card">',
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px">',
      "<strong>Cadernos por Matéria</strong>",
      '<button type="button" class="omni-btn omni-btn-ghost" id="omni-notebook-add" style="padding:4px 9px;font-size:11px">＋ Caderno</button>',
      "</div>",
      '<p class="omni-cornell-hint">Selecione a matéria abaixo, adicione novos cadernos ou personalize cores e siglas.</p>',
      notebookFormHTML,
      notebooksListHTML,
      '<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:4px">',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">',
      "<h3>Folhas (" + visibleNotes.length + ")</h3>",
      activeNb && state.selectedNotebookId !== "all"
        ? '<small style="color:#7dd3fc">' + escapeHTML(activeNb.sigla || activeNb.name) + "</small>"
        : '<small style="color:#94a3b8">Todas</small>',
      "</div>",
      '<button type="button" class="omni-btn omni-cornell-create" id="omni-cornell-new" style="margin-bottom:8px">Nova folha manual</button>',
      '<div class="omni-cornell-list">' +
        visibleNotes
          .map(
            n =>
              '<div style="display:flex;align-items:center;gap:4px">' +
              '<button type="button" style="flex:1" class="omni-tab-btn ' +
              (current?.id === n.id ? "active" : "") +
              '" data-cornell-select="' +
              escapeHTML(n.id) +
              '"><span>' +
              escapeHTML(n.title || "Sem título") +
              "</span><small>" +
              escapeHTML(n.materialArtifactId ? "📑 " : "") +
              escapeHTML(n.date || "") +
              "</small></button>" +
              (state.cornellNotes.length > 1
                ? '<button type="button" class="omni-notebook-icon-btn danger" data-cornell-delete="' +
                  escapeHTML(n.id) +
                  '" title="Excluir folha Cornell">×</button>'
                : "") +
              "</div>"
          )
          .join("") +
        "</div>",
      "</div>",
      '<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:4px">',
      '<label class="omni-label" for="omni-cornell-topic">Assunto da geração</label>',
      '<input class="omni-input" id="omni-cornell-topic" maxlength="300" value="' +
        escapeHTML(state.cornellGenerator.topic || "") +
        '">',
      '<label class="omni-label" for="omni-cornell-raw" style="margin-top:6px">Texto-base para gerar com IA</label>',
      '<textarea class="omni-textarea" id="omni-cornell-raw" rows="4" maxlength="8000" placeholder="Cole aqui suas anotações ou um trecho de fonte...">' +
        escapeHTML(state.cornellGenerator.raw || "") +
        "</textarea>",
      '<button type="button" id="omni-cornell-gen" class="omni-btn omni-btn-ghost" style="margin-top:6px;width:100%" ' +
        (busy ? "disabled" : "") +
        ">Gerar folha Cornell com IA</button>",
      '<p class="omni-cornell-hint">A geração utiliza créditos de IA. Nenhum material é enviado sem clicar.</p>',
      "</div>",
      '</aside><div class="omni-cornell-main">',
      message ? '<p class="omni-cornell-status" role="status">' + escapeHTML(message) + "</p>" : "",
      dividedSheetHTML,
      reviewHTML,
      "</div></div>",
    ].join("");

    const save = () => {
      if (current && current.materialArtifactId) {
        publishNoteAsMaterial(current, S);
      }
      saveState();
    };
    const rerender = () => render({ state, body, saveState, callAI, S });

    // Eventos de Cadernos por Matéria (Dashboard Esquerdo)
    body.querySelector("#omni-notebook-add")?.addEventListener("click", () => {
      addingNotebook = true;
      editingNotebookId = null;
      rerender();
    });

    body.querySelector("#omni-nb-cancel-btn")?.addEventListener("click", () => {
      addingNotebook = false;
      editingNotebookId = null;
      rerender();
    });

    body.querySelector("#omni-nb-save-btn")?.addEventListener("click", () => {
      const nameVal = body.querySelector("#omni-nb-name-input")?.value || "";
      const siglaVal = body.querySelector("#omni-nb-sigla-input")?.value || "";
      const colorVal = body.querySelector("#omni-nb-color-input")?.value || "#38bdf8";
      if (!nameVal.trim()) {
        message = "Informe o nome da matéria para salvar o caderno.";
        rerender();
        return;
      }
      if (editingNotebookId) {
        updateNotebook(state, editingNotebookId, { name: nameVal, sigla: siglaVal, color: colorVal });
        message = `Caderno "${nameVal.trim()}" atualizado com sucesso.`;
      } else {
        const created = addNotebook(state, { name: nameVal, sigla: siglaVal, color: colorVal });
        if (created && current) {
          current.notebookId = created.id;
          current.subject = created.name;
        }
        message = `Novo caderno "${nameVal.trim()}" adicionado ao painel esquerdo.`;
      }
      addingNotebook = false;
      editingNotebookId = null;
      save();
      rerender();
    });

    body.querySelectorAll("[data-notebook-select]").forEach(el => {
      el.addEventListener("click", ev => {
        if (ev.target.closest("[data-notebook-edit], [data-notebook-delete]")) return;
        const nbId = el.getAttribute("data-notebook-select");
        selectNotebook(state, nbId);
        message = "";
        save();
        rerender();
      });
    });

    body.querySelectorAll("[data-notebook-edit]").forEach(btn => {
      btn.addEventListener("click", ev => {
        ev.stopPropagation();
        editingNotebookId = btn.getAttribute("data-notebook-edit");
        addingNotebook = false;
        rerender();
      });
    });

    body.querySelectorAll("[data-notebook-delete]").forEach(btn => {
      btn.addEventListener("click", ev => {
        ev.stopPropagation();
        const nbId = btn.getAttribute("data-notebook-delete");
        if (deleteNotebook(state, nbId)) {
          message = "Caderno removido. Suas folhas foram preservadas.";
          save();
          rerender();
        }
      });
    });

    body.querySelectorAll("[data-cornell-delete]").forEach(btn => {
      btn.addEventListener("click", ev => {
        ev.stopPropagation();
        const noteId = btn.getAttribute("data-cornell-delete");
        if (deleteNote(state, noteId, S)) {
          message = "Folha Cornell excluída do caderno.";
          saveState();
          rerender();
        }
      });
    });

    function bindField(id, key) {
      const node = body.querySelector("#" + id);
      if (!node || !current) return;
      node.addEventListener("input", () => {
        updateNote(current, key, node.value, state);
        save();
        const status = body.querySelector(".omni-cornell-local");
        if (status) status.textContent = "Salvo neste navegador";
      });
      node.addEventListener("change", () => {
        updateNote(current, key, node.value, state);
        save();
        rerender();
      });
    }
    bindField("omni-cornell-title-edit", "title");
    bindField("omni-cornell-subject-edit", "subject");
    bindField("omni-cornell-notebook-select", "notebookId");
    bindField("omni-cornell-topic-select", "topicId");
    bindField("omni-cornell-cues-edit", "cues");
    bindField("omni-cornell-notes-edit", "notes");
    bindField("omni-cornell-summary-edit", "summary");
    bindField("omni-cornell-source-edit", "referenceText");

    const genTopic = body.querySelector("#omni-cornell-topic");
    const genRaw = body.querySelector("#omni-cornell-raw");
    genTopic?.addEventListener("input", () => {
      state.cornellGenerator.topic = asText(genTopic.value, 300);
      save();
    });
    genRaw?.addEventListener("input", () => {
      state.cornellGenerator.raw = asText(genRaw.value, 8000);
      save();
    });

    body.querySelector("#omni-cornell-new")?.addEventListener("click", () => {
      newManual(state);
      message = "Nova folha dividida criada no caderno atual. Preencha Pistas (30%), Notas (70%) e Síntese (rodapé).";
      save();
      rerender();
    });

    body.querySelectorAll("[data-cornell-select]").forEach(el =>
      el.addEventListener("click", () => {
        state.selectedCornellId = el.getAttribute("data-cornell-select");
        message = "";
        save();
        rerender();
      })
    );

    body.querySelector("#omni-cornell-cover")?.addEventListener("click", () => {
      state.coverCornellNotes = !state.coverCornellNotes;
      save();
      rerender();
    });

    body.querySelector("#omni-cornell-discard")?.addEventListener("click", () => {
      if (!current) return;
      delete current.cornellReview;
      message = "Sugestões descartadas; conteúdo original preservado.";
      save();
      rerender();
    });

    body.querySelector("#omni-cornell-apply")?.addEventListener("click", () => {
      if (!applySuggestion(current)) {
        message = "A nota mudou desde a revisão. Analise novamente antes de aplicar.";
      } else {
        message = "Correções aplicadas por sua escolha. A versão anterior pode ser restaurada.";
      }
      save();
      rerender();
    });

    body.querySelector("#omni-cornell-undo")?.addEventListener("click", () => {
      message = undoSuggestion(current)
        ? "Última aplicação desfeita e versão anterior restaurada."
        : "Existem alterações posteriores. Desfazer automaticamente poderia apagar seu texto.";
      save();
      rerender();
    });

    // Publicação Remissiva na aba Materiais (S.mat)
    body.querySelector("#omni-cornell-publish-material")?.addEventListener("click", () => {
      if (!current) return;
      const artifact = publishNoteAsMaterial(current, S);
      message = `Folha "${current.title}" transformada em Artefato de Estudo remissivo (${artifact?.id}) na matéria "${artifact?.materia}"!`;
      saveState();
      rerender();
    });

    body.querySelector("#omni-cornell-open-material")?.addEventListener("click", () => {
      if (!current) return;
      const artifact = openMaterialInStudyShell(current, S);
      message = `Artefato "${artifact?.titulo || current.title}" aberto na aba Materiais.`;
      saveState();
    });

    body.querySelector("#omni-cornell-gen")?.addEventListener("click", async () => {
      if (busy) return;
      const topic = asText(state.cornellGenerator.topic || state.subject, 300).trim();
      const rawNotes = asText(state.cornellGenerator.raw, 8000).trim();
      if (topic.length < 2 || rawNotes.length < 5) {
        message = "Informe o assunto e um texto-base para gerar a folha.";
        rerender();
        return;
      }
      busy = true;
      message = "Gerando a folha com IA, sem alterar suas notas anteriores.";
      rerender();
      try {
        const result = await callAI({ task: "summarize-cornell", topic, rawNotes });
        const cues = Array.isArray(result?.cues) ? result.cues.map(String).filter(Boolean).slice(0, 20) : [];
        if (typeof result?.notes !== "string" || result.notes.trim().length < 5 || !cues.length)
          throw new Error("A IA devolveu uma folha incompleta; nenhum conteúdo foi substituído.");
        const note = newManual(state);
        Object.assign(note, {
          title: asText(result.topic || topic, 300),
          subject: activeNb ? activeNb.name : topic,
          notebookId: activeNb ? activeNb.id : note.notebookId,
          cues,
          notes: asText(result.notes, 12000),
          summary: asText(result.summary, 2500),
          actionItems: Array.isArray(result.actionItems) ? result.actionItems.slice(0, 12) : [],
          origin: "ia",
          referenceText: "",
        });
        publishNoteAsMaterial(note, S);
        message = "Folha criada pela IA e vinculada como artefato remissivo. Edite livremente.";
        saveState();
      } catch (error) {
        message = "Falha na geração: " + (error?.message || "IA indisponível.");
      } finally {
        busy = false;
        rerender();
      }
    });

    body.querySelector("#omni-cornell-review")?.addEventListener("click", async () => {
      if (busy || !current) return;
      const notes = asText(current.notes, 12000).trim();
      if (notes.length < 10) {
        message = "Digite ao menos 10 caracteres nas notas para pedir revisão.";
        rerender();
        return;
      }
      const targetId = current.id;
      const baseline = capture(current);
      busy = true;
      message = "Conferindo com IA. A folha original não será modificada.";
      rerender();
      try {
        const result = await callAI({
          task: "review-cornell",
          topic: asText(current.subject || current.title, 300).trim() || "Folha Cornell",
          cues: (current.cues || []).slice(0, 20),
          notes,
          summary: asText(current.summary, 2500),
          referenceText: asText(current.referenceText, 15000),
        });
        const updated = state.cornellNotes.find(n => n.id === targetId);
        if (!updated || capture(updated) !== baseline) {
          message = "A nota mudou durante a análise. O parecer antigo foi descartado por segurança.";
        } else if (!result?.suggested?.notes || !Array.isArray(result?.suggested?.cues)) {
          throw new Error("Parecer incompleto da IA. Nota original preservada.");
        } else {
          updated.cornellReview = { ...result, basedOn: baseline, reviewedAt: new Date().toISOString() };
          message = "Parecer disponível. Compare a versão proposta antes de aplicar qualquer correção.";
          save();
        }
      } catch (error) {
        message = "Não foi possível conferir: " + (error?.message || "IA indisponível.");
      } finally {
        busy = false;
        rerender();
      }
    });

    body.querySelector("#omni-cornell-to-map")?.addEventListener("click", () => {
      if (!current) return;
      publishNoteAsMaterial(current, S);
      const mapDraft = buildMindMapFromNote(current, { topicId: current.topicId });
      current.mindMapDraft = mapDraft;
      if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
        global.QBMindMapStudio.openFromCornell(current, { generatedMap: mapDraft, S });
      }
      message = "Mapa mental criado a partir desta folha Cornell! Personalize ramos, subtópicos e rótulos no ambiente de estudo.";
      saveState();
      rerender();
    });

    body.querySelector("#omni-cornell-to-gan")?.addEventListener("click", () => {
      if (!current) return;
      publishNoteAsMaterial(current, S);
      const mapDraft = current.mindMapDraft || buildMindMapFromNote(current, { topicId: current.topicId });
      current.mindMapDraft = mapDraft;
      if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
        global.QBMindMapStudio.openFromCornell(current, { generatedMap: mapDraft, openGan: true, S });
      }
      message = "Mapa mental aberto no painel de Geração de Questões com Confronto GAN.";
      saveState();
      rerender();
    });

    body.querySelector("#omni-cornell-to-map-ai")?.addEventListener("click", async () => {
      if (busy || !current) return;
      const notes = asText(current.notes, 12000).trim();
      if (notes.length < 5) {
        message = "Preencha as anotações da folha Cornell antes de gerar o mapa mental.";
        rerender();
        return;
      }
      publishNoteAsMaterial(current, S);
      busy = true;
      message = "Estruturando Mapa Mental AXON a partir da sua folha Cornell...";
      rerender();
      try {
        const res = await callAI({
          task: "cornell-to-mindmap",
          topicId: current.topicId || "cornell",
          title: asText(current.title || current.subject || "Mapa Mental", 300),
          subject: asText(current.subject, 300),
          cues: (current.cues || []).slice(0, 20),
          notes,
          summary: asText(current.summary, 2500),
          referenceText: asText(current.referenceText, 15000),
        });
        const mapDraft = res?.mapa || buildMindMapFromNote(current, { topicId: current.topicId });
        current.mindMapDraft = mapDraft;
        if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
          global.QBMindMapStudio.openFromCornell(current, { generatedMap: mapDraft, S });
        }
        message = "Mapa mental estruturado pela IA a partir da sua folha Cornell! Edite subtópicos e rótulos à vontade.";
        saveState();
      } catch (error) {
        const fallback = buildMindMapFromNote(current, { topicId: current.topicId });
        current.mindMapDraft = fallback;
        if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
          global.QBMindMapStudio.openFromCornell(current, { generatedMap: fallback, S });
        }
        message = "Mapa estruturado localmente a partir da folha Cornell (" + (error?.message || "modo local") + ").";
        saveState();
      } finally {
        busy = false;
        rerender();
      }
    });
  }

  global.QBOmniCornell = {
    render,
    capture,
    newManual,
    deleteNote,
    updateNote,
    applySuggestion,
    undoSuggestion,
    splitCues,
    buildMindMapFromNote,
    ensureNotebooks,
    extractContestSubjects,
    addNotebook,
    updateNotebook,
    deleteNotebook,
    selectNotebook,
    getVisibleNotes,
    toMaterialArtifact,
    publishNoteAsMaterial,
    syncStoredArtifactsIntoS,
    openMaterialInStudyShell,
    openCornellSheetById,
  };
})(typeof window !== "undefined" ? window : globalThis);
