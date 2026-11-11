/* Cornell manual + IA. Não altera notas anteriores sem ação do estudante. */
(function (global) {
  "use strict";
  let busy = false;
  let message = "";
  const asText = (v, max = 16000) => String(v == null ? "" : v).slice(0, max);
  const splitCues = value => asText(value, 8500).split(/\r?\n/)
    .map(s => s.trim()).filter(Boolean).slice(0, 20);
  const escapeHTML = value => asText(value, 16000).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function capture(note) {
    return JSON.stringify({
      title: note.title || "",
      subject: note.subject || "",
      cues: note.cues || [],
      notes: note.notes || "",
      summary: note.summary || "",
      referenceText: note.referenceText || ""
    });
  }
  function newManual(state) {
    if (!Array.isArray(state.cornellNotes)) state.cornellNotes = [];
    const id = "cornell-manual-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const note = {
      id, title: "Nova folha Cornell", subject: state.subject || "",
      date: new Date().toLocaleDateString("pt-BR"),
      cues: [], notes: "", summary: "", referenceText: "",
      origin: "manual", actionItems: []
    };
    state.cornellNotes.unshift(note);
    state.selectedCornellId = id;
    return note;
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
  function updateNote(note, field, value) {
    if (!note || !["title", "subject", "topicId", "cues", "notes", "summary", "referenceText"].includes(field)) return;
    note[field] = field === "cues" ? splitCues(value) :
      asText(value, field === "referenceText" ? 15000 : field === "notes" ? 12000 : field === "summary" ? 2500 : 300);
    // Um parecer anterior não se aplica a uma nota já modificada.
    delete note.cornellReview;
  }

  function buildMindMapFromNote(note, options = {}) {
    if (global.QBMindMapStudio && typeof global.QBMindMapStudio.cornellToMindMap === "function") {
      return global.QBMindMapStudio.cornellToMindMap(note, options);
    }
    const title = asText(note?.title || note?.subject || "Mapa Mental Cornell", 240);
    const cues = Array.isArray(note?.cues) ? note.cues : splitCues(note?.cues || "");
    const lines = asText(note?.notes, 12000).split(/\r?\n/).map(s => s.replace(/^[\s•*\-–—\d.)]+/, "").trim()).filter(Boolean);
    const branchTitles = cues.length ? cues : lines.slice(0, 4);
    const ramos = (branchTitles.length ? branchTitles : ["Conceito Base", "Regra e Aplicação", "Exceções"]).map((cue, idx) => ({
      id: "cornell-r" + (idx + 1),
      t: asText(cue, 160).replace(/\?+$/, "") || ("Ramo " + (idx + 1)),
      rotulo: "Pista " + (idx + 1),
      n: asText(lines[idx] || note?.summary || cue, 260),
      cor: (idx % 8) + 1,
      x: {
        e: asText(lines[idx] || note?.notes || cue, 1200),
        src: asText(note?.referenceText || ("Caderno Cornell · " + title), 240),
      },
      f: lines.slice(idx + 1, idx + 3).map((sub, sIdx) => ({
        id: "cornell-r" + (idx + 1) + "-" + (sIdx + 1),
        t: asText(sub, 90),
        rotulo: "Sub " + (idx + 1) + "." + (sIdx + 1),
        n: asText(sub, 200),
        cor: (idx % 8) + 1,
        x: { e: asText(sub, 600) },
      })),
    }));
    while (ramos.length < 3) {
      const k = ramos.length + 1;
      ramos.push({
        id: "cornell-r" + k,
        t: k === 2 ? "Desdobramento e Subtópicos" : "Síntese e Exceções",
        rotulo: "Ramo " + k,
        n: asText(note?.summary || note?.notes || title, 240),
        cor: k,
        x: { e: asText(note?.summary || note?.notes || title, 800) },
        f: [],
      });
    }
    return {
      centro: title,
      autor: "Baseado na folha Cornell · Personalizável no Ambiente de Estudo",
      ramos,
      ligacoes: [[ramos[0].id, ramos[ramos.length - 1].id, "Pista → Síntese"]],
      origemCornell: { noteId: note?.id || "", title },
    };
  }

  function render({ state, body, saveState, callAI }) {
    if (!Array.isArray(state.cornellNotes)) state.cornellNotes = [];
    if (!state.cornellGenerator || typeof state.cornellGenerator !== "object") {
      state.cornellGenerator = { topic: state.subject || "", raw: "" };
    }
    const current = state.cornellNotes.find(n => n.id === state.selectedCornellId) ||
      state.cornellNotes[0] || null;
    const editor = current ? [
      '<section class="omni-card omni-cornell-editor" aria-label="Editor manual Cornell">',
      '<div class="omni-cornell-head">',
      '<strong>Editar folha Cornell</strong><span class="omni-cornell-local">Salva automaticamente neste navegador</span>',
      '</div>',
      '<label class="omni-label" for="omni-cornell-title-edit">Título da folha</label>',
      '<input class="omni-input" id="omni-cornell-title-edit" maxlength="300" value="' + escapeHTML(current.title) + '">',
      '<label class="omni-label" for="omni-cornell-subject-edit">Matéria / assunto</label>',
      '<input class="omni-input" id="omni-cornell-subject-edit" maxlength="300" value="' + escapeHTML(current.subject) + '">',
      '<div class="omni-cornell-edit-grid">',
      '<div><label class="omni-label" for="omni-cornell-cues-edit">Pistas e perguntas (30%): uma por linha</label>',
      '<textarea class="omni-textarea" id="omni-cornell-cues-edit" rows="9" maxlength="8500" placeholder="Qual é a regra geral?&#10;Qual é a exceção?">' +
        escapeHTML((current.cues || []).join("\n")) + '</textarea></div>',
      '<div><label class="omni-label" for="omni-cornell-notes-edit">Anotações próprias (70%)</label>',
      '<textarea class="omni-textarea" id="omni-cornell-notes-edit" rows="9" maxlength="12000" placeholder="Digite suas explicações, exemplos, distinções e dúvidas...">' +
        escapeHTML(current.notes || "") + '</textarea></div>',
      '</div>',
      '<label class="omni-label" for="omni-cornell-summary-edit">Síntese final (rodapé)</label>',
      '<textarea class="omni-textarea" id="omni-cornell-summary-edit" rows="3" maxlength="2500" placeholder="Explique o núcleo do assunto com suas palavras...">' +
        escapeHTML(current.summary || "") + '</textarea>',
      '<label class="omni-label" for="omni-cornell-source-edit">Texto-fonte para conferência da IA (opcional)</label>',
      '<textarea class="omni-textarea" id="omni-cornell-source-edit" rows="3" maxlength="15000" placeholder="Cole o dispositivo legal ou trecho original. Sem fonte, a IA fará apenas revisão preliminar.">' +
        escapeHTML(current.referenceText || "") + '</textarea>',
      '<p class="omni-cornell-hint">A IA não verifica automaticamente páginas na internet nem a vigência de leis. Com texto-fonte, compara suas notas a esse texto. Sem fonte, a avaliação não é verificação factual.</p>',
      '<div class="omni-cornell-actions">',
      '<button type="button" id="omni-cornell-review" class="omni-btn" ' + (busy ? 'disabled' : '') + '>Conferir e corrigir com IA</button>',
      (current.cornellUndo ? '<button type="button" id="omni-cornell-undo" class="omni-btn omni-btn-ghost">Desfazer última correção aplicada</button>' : ''),
      '<button type="button" id="omni-cornell-to-map" class="omni-btn omni-btn-ghost" ' + (busy ? 'disabled' : '') + '>🗺️ Transformar em Mapa Mental (Base Direta)</button>',
      '<button type="button" id="omni-cornell-to-map-ai" class="omni-btn omni-btn-ghost" ' + (busy ? 'disabled' : '') + '>✨ Gerar Mapa Mental com IA e Abrir Construtor</button>',
      '<button type="button" id="omni-cornell-to-gan" class="omni-btn omni-btn-ghost" ' + (busy ? 'disabled' : '') + '>⚔️ Abrir Mapa + Questões GAN</button>',
      '</div>',
      '<p class="omni-cornell-hint">Somente a conferência por IA consome créditos. A escrita, a edição manual e a conversão direta em Mapa Mental são locais.</p>',
      '</section>'
    ].join("") : '<section class="omni-card">Crie uma folha manual ou gere uma a partir das suas anotações.</section>';
    const review = current?.cornellReview;
    const reviewHTML = review ? [
      '<section class="omni-card omni-cornell-review" aria-label="Parecer da IA">',
      '<strong>Revisão sugerida, aguardando aprovação</strong>',
      '<p>' + escapeHTML(review.verdict) + '</p>',
      '<p class="omni-cornell-hint">' + escapeHTML(review.notice || "Não é certificação da fonte.") + '</p>',
      '<strong>Achados (' + (review.issues || []).length + ')</strong>',
      '<ul class="omni-cornell-issues">' + ((review.issues || []).map(item =>
        '<li><b>' + escapeHTML(item.field) + ' · ' + escapeHTML(item.type) + '</b>: ' +
        escapeHTML(item.description) +
        (item.sourceExcerpt ? '<blockquote>Trecho encontrado: “' + escapeHTML(item.sourceExcerpt) + '”</blockquote>' : '') +
        '</li>').join("") || '<li>Nenhum problema apontado pela IA. Isso não comprova exatidão factual.</li>') + '</ul>',
      '<details><summary>Conferir texto proposto antes de aplicar</summary>',
      '<div class="omni-cornell-proposal"><b>Pistas</b><pre>' + escapeHTML((review.suggested?.cues || []).join("\n")) +
      '</pre><b>Notas</b><pre>' + escapeHTML(review.suggested?.notes || "") +
      '</pre><b>Síntese</b><pre>' + escapeHTML(review.suggested?.summary || "") + '</pre></div></details>',
      '<div class="omni-cornell-actions"><button type="button" class="omni-btn" id="omni-cornell-apply">Aplicar correções à minha folha</button>',
      '<button type="button" class="omni-btn omni-btn-ghost" id="omni-cornell-discard">Descartar sugestões</button></div>',
      '</section>'
    ].join("") : "";
    const preview = current ? [
      '<section class="omni-cornell-sheet" aria-label="Folha Cornell de leitura">',
      '<div class="omni-cornell-head"><div><small>' + escapeHTML(current.subject || "Sem assunto") +
      ' · ' + escapeHTML(current.date || "Sem data") + '</small><h3>' + escapeHTML(current.title || "Folha Cornell") + '</h3></div>',
      '<button type="button" class="omni-btn omni-btn-ghost" id="omni-cornell-cover">' +
      (state.coverCornellNotes ? 'Revelar notas' : 'Cobrir notas para evocação') + '</button></div>',
      '<div class="omni-cornell-grid"><div class="omni-cornell-cues"><b>Pistas (30%)</b>' +
      (current.cues || []).map(c=>'<p>' + escapeHTML(c) + '</p>').join("") +
      '</div><div class="omni-cornell-notes ' + (state.coverCornellNotes ? 'is-covered' : '') + '"><b>Notas (70%)</b><div>' +
      escapeHTML(current.notes || "Anotações ainda não preenchidas.") + '</div></div></div>',
      '<div class="omni-cornell-summary"><b>Síntese</b><div>' + escapeHTML(current.summary || "Síntese ainda não preenchida.") + '</div></div>',
      '</section>'
    ].join("") : "";

    body.innerHTML = [
      '<div class="omni-cornell-workspace"><aside class="omni-card">',
      '<strong>Caderno Cornell</strong>',
      '<p class="omni-cornell-hint">Crie uma folha digitando suas notas ou peça uma estruturação à IA a partir de texto que você forneceu.</p>',
      '<button type="button" class="omni-btn omni-cornell-create" id="omni-cornell-new">Nova folha manual</button>',
      '<label class="omni-label" for="omni-cornell-topic">Assunto da geração</label>',
      '<input class="omni-input" id="omni-cornell-topic" maxlength="300" value="' + escapeHTML(state.cornellGenerator.topic || "") + '">',
      '<label class="omni-label" for="omni-cornell-raw">Texto-base para gerar com IA</label>',
      '<textarea class="omni-textarea" id="omni-cornell-raw" rows="5" maxlength="8000" placeholder="Cole aqui suas anotações ou um trecho de fonte...">' +
      escapeHTML(state.cornellGenerator.raw || "") + '</textarea>',
      '<button type="button" id="omni-cornell-gen" class="omni-btn omni-btn-ghost" ' + (busy ? 'disabled' : '') + '>Gerar folha Cornell com IA</button>',
      '<p class="omni-cornell-hint">A geração utiliza créditos de IA. Nenhum material é enviado sem clicar.</p>',
      '<h3>Folhas salvas (' + state.cornellNotes.length + ')</h3>',
      '<div class="omni-cornell-list">' + state.cornellNotes.map(n =>
        '<button type="button" class="omni-tab-btn ' + (current?.id === n.id ? 'active' : '') +
        '" data-cornell-select="' + escapeHTML(n.id) + '"><span>' + escapeHTML(n.title || "Sem título") +
        '</span><small>' + escapeHTML(n.date || "") + '</small></button>').join("") + '</div>',
      '</aside><div class="omni-cornell-main">',
      message ? '<p class="omni-cornell-status" role="status">' + escapeHTML(message) + '</p>' : '',
      editor, reviewHTML, preview, '</div></div>'
    ].join("");

    const save = () => saveState();
    function bindField(id, key) {
      const node = body.querySelector("#" + id);
      if (!node || !current) return;
      node.addEventListener("input", () => {
        updateNote(current, key, node.value);
        save();
        const status = body.querySelector(".omni-cornell-local");
        if (status) status.textContent = "Salvo neste navegador";
        // Atualiza a prévia após sair do campo, sem roubar o foco a cada tecla.
      });
      node.addEventListener("change", () => { save(); render({state,body,saveState,callAI}); });
    }
    bindField("omni-cornell-title-edit", "title");
    bindField("omni-cornell-subject-edit", "subject");
    bindField("omni-cornell-cues-edit", "cues");
    bindField("omni-cornell-notes-edit", "notes");
    bindField("omni-cornell-summary-edit", "summary");
    bindField("omni-cornell-source-edit", "referenceText");
    const genTopic = body.querySelector("#omni-cornell-topic");
    const genRaw = body.querySelector("#omni-cornell-raw");
    genTopic?.addEventListener("input", () => {
      state.cornellGenerator.topic = asText(genTopic.value, 300); save();
    });
    genRaw?.addEventListener("input", () => {
      state.cornellGenerator.raw = asText(genRaw.value, 8000); save();
    });
    body.querySelector("#omni-cornell-new")?.addEventListener("click", () => {
      newManual(state); message = "Nova folha criada. Preencha os campos; as alterações serão salvas neste navegador.";
      save(); render({state,body,saveState,callAI});
    });
    body.querySelectorAll("[data-cornell-select]").forEach(el => el.addEventListener("click", () => {
      state.selectedCornellId = el.getAttribute("data-cornell-select");
      message = ""; save(); render({state,body,saveState,callAI});
    }));
    body.querySelector("#omni-cornell-cover")?.addEventListener("click", () => {
      state.coverCornellNotes = !state.coverCornellNotes;
      save(); render({state,body,saveState,callAI});
    });
    body.querySelector("#omni-cornell-discard")?.addEventListener("click", () => {
      if (!current) return;
      delete current.cornellReview; message = "Sugestões descartadas; conteúdo original preservado.";
      save(); render({state,body,saveState,callAI});
    });
    body.querySelector("#omni-cornell-apply")?.addEventListener("click", () => {
      if (!applySuggestion(current)) {
        message = "A nota mudou desde a revisão. Analise novamente antes de aplicar.";
      } else message = "Correções aplicadas por sua escolha. A versão anterior pode ser restaurada.";
      save(); render({state,body,saveState,callAI});
    });
    body.querySelector("#omni-cornell-undo")?.addEventListener("click", () => {
      message = undoSuggestion(current) ?
        "Última aplicação desfeita e versão anterior restaurada." :
        "Existem alterações posteriores. Desfazer automaticamente poderia apagar seu texto.";
      save(); render({state,body,saveState,callAI});
    });
    body.querySelector("#omni-cornell-gen")?.addEventListener("click", async () => {
      if (busy) return;
      const topic = asText(state.cornellGenerator.topic || state.subject, 300).trim();
      const rawNotes = asText(state.cornellGenerator.raw, 8000).trim();
      if (topic.length < 2 || rawNotes.length < 5) {
        message = "Informe o assunto e um texto-base para gerar a folha."; render({state,body,saveState,callAI}); return;
      }
      busy = true; message = "Gerando a folha com IA, sem alterar suas notas anteriores.";
      render({state,body,saveState,callAI});
      try {
        const result = await callAI({ task:"summarize-cornell", topic, rawNotes });
        const cues = Array.isArray(result?.cues) ? result.cues.map(String).filter(Boolean).slice(0, 20) : [];
        if (typeof result?.notes !== "string" || result.notes.trim().length < 5 || !cues.length)
          throw new Error("A IA devolveu uma folha incompleta; nenhum conteúdo foi substituído.");
        const note = newManual(state);
        Object.assign(note, {
          title: asText(result.topic || topic,300), subject: topic, cues,
          notes: asText(result.notes,12000), summary: asText(result.summary,2500),
          actionItems: Array.isArray(result.actionItems) ? result.actionItems.slice(0, 12) : [],
          origin: "ia", referenceText: ""
        });
        message = "Folha criada pela IA. Edite livremente; a verificação factual exige uma fonte no campo próprio.";
        save();
      } catch (error) { message = "Falha na geração: " + (error?.message || "IA indisponível."); }
      finally { busy = false; render({state,body,saveState,callAI}); }
    });
    body.querySelector("#omni-cornell-review")?.addEventListener("click", async () => {
      if (busy || !current) return;
      const notes = asText(current.notes,12000).trim();
      if (notes.length < 10) {
        message = "Digite ao menos 10 caracteres nas notas para pedir revisão."; render({state,body,saveState,callAI}); return;
      }
      const targetId = current.id;
      const baseline = capture(current);
      busy = true; message = "Conferindo com IA. A folha original não será modificada.";
      render({state,body,saveState,callAI});
      try {
        const result = await callAI({
          task:"review-cornell", topic: asText(current.subject || current.title,300).trim() || "Folha Cornell",
          cues: (current.cues || []).slice(0,20), notes,
          summary:asText(current.summary,2500), referenceText:asText(current.referenceText,15000)
        });
        const updated = state.cornellNotes.find(n=>n.id===targetId);
        if (!updated || capture(updated) !== baseline) {
          message = "A nota mudou durante a análise. O parecer antigo foi descartado por segurança.";
        } else if (!result?.suggested?.notes || !Array.isArray(result?.suggested?.cues)) {
          throw new Error("Parecer incompleto da IA. Nota original preservada.");
        } else {
          updated.cornellReview = {...result, basedOn: baseline, reviewedAt: new Date().toISOString()};
          message = "Parecer disponível. Compare a versão proposta antes de aplicar qualquer correção.";
          save();
        }
      } catch (error) { message = "Não foi possível conferir: " + (error?.message || "IA indisponível."); }
      finally { busy = false; render({state,body,saveState,callAI}); }
    });
    body.querySelector("#omni-cornell-to-map")?.addEventListener("click", () => {
      if (!current) return;
      const mapDraft = buildMindMapFromNote(current, { topicId: current.topicId });
      current.mindMapDraft = mapDraft;
      if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
        global.QBMindMapStudio.openFromCornell(current, { generatedMap: mapDraft });
      }
      message = "Mapa mental criado a partir desta folha Cornell! Personalize ramos, subtópicos e rótulos no ambiente de estudo.";
      save(); render({state,body,saveState,callAI});
    });
    body.querySelector("#omni-cornell-to-gan")?.addEventListener("click", () => {
      if (!current) return;
      const mapDraft = current.mindMapDraft || buildMindMapFromNote(current, { topicId: current.topicId });
      current.mindMapDraft = mapDraft;
      if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
        global.QBMindMapStudio.openFromCornell(current, { generatedMap: mapDraft, openGan: true });
      }
      message = "Mapa mental aberto no painel de Geração de Questões com Confronto GAN.";
      save(); render({state,body,saveState,callAI});
    });
    body.querySelector("#omni-cornell-to-map-ai")?.addEventListener("click", async () => {
      if (busy || !current) return;
      const notes = asText(current.notes, 12000).trim();
      if (notes.length < 5) {
        message = "Preencha as anotações da folha Cornell antes de gerar o mapa mental.";
        render({state,body,saveState,callAI});
        return;
      }
      busy = true;
      message = "Estruturando Mapa Mental AXON a partir da sua folha Cornell...";
      render({state,body,saveState,callAI});
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
          global.QBMindMapStudio.openFromCornell(current, { generatedMap: mapDraft });
        }
        message = "Mapa mental estruturado pela IA a partir da sua folha Cornell! Edite subtópicos e rótulos à vontade.";
        save();
      } catch (error) {
        const fallback = buildMindMapFromNote(current, { topicId: current.topicId });
        current.mindMapDraft = fallback;
        if (global.QBMindMapStudio && typeof global.QBMindMapStudio.openFromCornell === "function") {
          global.QBMindMapStudio.openFromCornell(current, { generatedMap: fallback });
        }
        message = "Mapa estruturado localmente a partir da folha Cornell (" + (error?.message || "modo local") + ").";
        save();
      } finally {
        busy = false;
        render({state,body,saveState,callAI});
      }
    });
  }

  global.QBOmniCornell = { render, capture, newManual, updateNote, applySuggestion, undoSuggestion, splitCues, buildMindMapFromNote };
})(window);
