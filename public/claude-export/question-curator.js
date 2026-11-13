/* Quebrando a Banca · Curadoria & Reformulação de Questões (AXON)
 * Permite excluir permanentemente questões malfeitas do banco de dados
 * ou solicitar curadoria e reformulação com IA (Omni) diretamente do ambiente de estudo.
 */
(function (global) {
  "use strict";

  let activeModalState = null;

  function escHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getBackdrop() {
    let el = document.getElementById("qb-curate-backdrop");
    if (!el) {
      el = document.createElement("div");
      el.id = "qb-curate-backdrop";
      el.className = "qb-curate-backdrop";
      document.body.appendChild(el);
      el.addEventListener("click", e => {
        if (e.target === el) closeModal();
      });
      global.addEventListener("keydown", e => {
        if (e.key === "Escape" && el.classList.contains("open")) {
          closeModal();
        }
      });
    }
    return el;
  }

  function closeModal() {
    const backdrop = document.getElementById("qb-curate-backdrop");
    if (backdrop) backdrop.classList.remove("open");
    activeModalState = null;
  }

  /* Exclui a questão do banco de dados Firestore / Base44 com confirmação e ajusta filas */
  function deleteQuestion(qid, opts) {
    const S = opts?.S || global.QBApp?.S || global.S;
    if (!qid || !S || !S.q || !S.q.has(qid)) {
      if (global.toast) global.toast("Questão não encontrada no banco.");
      return false;
    }

    const q = S.q.get(qid);
    const ord = q.ordem ? `ITEM ${q.ordem}` : `Questão`;
    const cap = q.cap ? ` (Cap. ${q.cap})` : "";
    const msg = `Deseja realmente EXCLUIR permanentemente ${ord}${cap} do banco de dados?\n\nEsta ação removerá a questão de todos os treinos, cadernos e simulados.`;

    if (global.confirm && !global.confirm(msg)) {
      return false;
    }

    try {
      // 1. Deleção no backend Firestore / Base44
      if (S.db && typeof S.db.doc === "function") {
        const enqueueFn = global.enqueue || (fn => fn());
        enqueueFn(() => S.db.doc("questoes/" + qid).delete());
      }

      // 2. Remoção da memória local S.q
      S.q.delete(qid);

      // 3. Ajuste transparente da rodada ativa caso esteja ocorrendo
      if (S.round && Array.isArray(S.round.fila)) {
        const fila = S.round.fila;
        const curQid = fila[S.round.idx];
        S.round.fila = fila.filter(id => id !== qid);

        if (curQid === qid) {
          S.round.atual = null;
          S.round.pend = null;
          if (S.round.idx >= S.round.fila.length) {
            if (typeof global.finalizar === "function") global.finalizar();
          }
        } else if (S.round.idx > 0 && fila.indexOf(qid) < S.round.idx) {
          S.round.idx = Math.max(0, S.round.idx - 1);
        }
      }

      // 4. Se a questão estiver no caderno de erros, desvincular
      if (S.r && S.r.has(qid)) {
        const r = S.r.get(qid);
        if (r && r.noCaderno) {
          r.noCaderno = false;
          if (S.db && typeof S.db.doc === "function") {
            const enqueueFn = global.enqueue || (fn => fn());
            enqueueFn(() => S.db.doc("respostas/" + qid).update({ noCaderno: false, excluidoEm: new Date().toISOString() }));
          }
        }
      }

      closeModal();
      if (typeof opts?.onDeleted === "function") opts.onDeleted(qid);
      if (typeof global.toast === "function") global.toast("Questão excluída do banco de dados.");
      if (typeof global.render === "function") global.render(true);
      return true;
    } catch (err) {
      console.error("[QuestionCurator] Erro ao excluir questão:", err);
      if (typeof global.toast === "function") global.toast("Erro ao excluir questão do banco.");
      return false;
    }
  }

  /* Solicita reformulação ou correção para a IA (Omni / Base44) */
  async function curateWithAI(q, issueType, userObservation) {
    const payload = {
      task: "curate-question",
      question: {
        id: q.id,
        enunciado: q.enunciado || "",
        gabarito: q.gabarito || "E",
        comentario: q.comentario || "",
        cap: q.cap || "",
        tema: q.tema || "",
        ref: q.ref || "",
        alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
      },
      issueType: issueType || "enunciado_ambiguo",
      userObservation: userObservation || "",
    };

    if (global.QBOmniStudy && typeof global.QBOmniStudy.callOmniStudyBackend === "function") {
      return await global.QBOmniStudy.callOmniStudyBackend(payload);
    }
    if (global.QBBridge && typeof global.QBBridge.ask === "function") {
      return await global.QBBridge.ask("omniStudyAI", payload);
    }

    // Sem IA conectada não há curadoria: nada de parecer simulado (12/11/2026).
    throw new Error("Curadoria por IA indisponível agora. A questão não foi alterada.");
  }

  /* Salva a questão reformulada no banco de dados e memória */
  function saveCuratedQuestion(qid, updatedFields, opts) {
    const S = opts?.S || global.QBApp?.S || global.S;
    if (!qid || !S || !S.q || !S.q.has(qid)) return false;

    const current = S.q.get(qid);
    /* Item reformulado deixa de ser o item original da prova: a origem passa a dizer isso
       e o texto e o gabarito originais ficam guardados (12/11/2026). */
    const mudou = (updatedFields.enunciado != null && updatedFields.enunciado !== current.enunciado) ||
      (updatedFields.gabarito != null && updatedFields.gabarito !== current.gabarito);
    const origemAtual = String(current.origem || "");
    const preserva = mudou && !current.originalCuradoria
      ? { originalCuradoria: { enunciado: current.enunciado || "", gabarito: current.gabarito || "", origem: origemAtual } }
      : {};
    const origem = mudou && !/^reformulad[ao] por IA/i.test(origemAtual)
      ? { origem: "reformulado por IA" + (origemAtual ? " · original: " + origemAtual : "") }
      : {};
    const merged = Object.assign({}, current, updatedFields, preserva, origem, {
      statusEditorial: "reformulada-curadoria",
      atualizadoEm: new Date().toISOString(),
    });

    try {
      if (S.db && typeof S.db.doc === "function") {
        const enqueueFn = global.enqueue || (fn => fn());
        enqueueFn(() => S.db.doc("questoes/" + qid).set(merged, { merge: true }));
      }
      S.q.set(qid, merged);

      closeModal();
      if (typeof opts?.onUpdated === "function") opts.onUpdated(merged);
      if (typeof global.toast === "function") global.toast("Questão reformulada e salva com sucesso no banco de dados.");
      if (typeof global.render === "function") global.render(true);
      return true;
    } catch (err) {
      console.error("[QuestionCurator] Erro ao salvar questão:", err);
      if (typeof global.toast === "function") global.toast("Erro ao salvar atualização no banco.");
      return false;
    }
  }

  /* Registra chamado de revisão editorial formal no banco de dados */
  function requestEditorialReview(qid, issueType, userObservation, opts) {
    const S = opts?.S || global.QBApp?.S || global.S;
    if (!qid || !S || !S.q || !S.q.has(qid)) return false;

    const q = S.q.get(qid);
    const reviewDoc = {
      questaoId: qid,
      cap: q.cap || "",
      enunciadoOriginal: q.enunciado || "",
      gabaritoOriginal: q.gabarito || "",
      tipoProblema: issueType,
      observacaoUsuario: userObservation || "",
      criadoEm: new Date().toISOString(),
      status: "pendente",
    };

    try {
      if (S.db && typeof S.db.collection === "function") {
        const enqueueFn = global.enqueue || (fn => fn());
        enqueueFn(() => S.db.collection("solicitacoes_correcao").add(reviewDoc));
        enqueueFn(() =>
          S.db.doc("questoes/" + qid).update({
            statusEditorial: "aguardando-revisao-humana",
            motivoContestacao: issueType,
          })
        );
      }
      q.statusEditorial = "aguardando-revisao-humana";
      closeModal();
      if (typeof global.toast === "function") global.toast("Solicitação de correção registrada para curadoria editorial.");
      if (typeof global.render === "function") global.render(true);
      return true;
    } catch (err) {
      console.error("[QuestionCurator] Erro ao registrar solicitação:", err);
      if (typeof global.toast === "function") global.toast("Erro ao registrar chamado.");
      return false;
    }
  }

  /* Abre o modal interativo de Curadoria */
  function open(opts) {
    const qid = opts?.qid;
    const S = opts?.S || global.QBApp?.S || global.S;
    if (!qid || !S || !S.q || !S.q.has(qid)) {
      if (typeof global.toast === "function") global.toast("Questão não encontrada.");
      return;
    }

    const q = S.q.get(qid);
    activeModalState = {
      q,
      S,
      opts,
      aiResult: null,
      isAiLoading: false,
    };

    renderModalContent();
    const backdrop = getBackdrop();
    backdrop.classList.add("open");
  }

  function renderModalContent() {
    const backdrop = getBackdrop();
    if (!activeModalState) return;

    const { q, S, opts, aiResult, isAiLoading } = activeModalState;
    const isCE = !q.alternativas || q.alternativas.length === 0;

    backdrop.innerHTML = `
      <div class="qb-curate-modal" role="dialog" aria-modal="true" aria-labelledby="qb-curate-title">
        <div class="qb-curate-header">
          <div class="qb-curate-title" id="qb-curate-title">
            <span>⚙️ Curadoria & Reformulação de Questão</span>
            <span style="font-size:12px;font-weight:400;color:#94a3b8">· ITEM ${String(q.ordem || "").padStart(2, "0")} (Cap. ${escHtml(q.cap || "")})</span>
          </div>
          <button type="button" class="qb-curate-close" id="qb-curate-close" aria-label="Fechar modal">✕</button>
        </div>

        <div class="qb-curate-body">
          <!-- Card da Questão Atual -->
          <div class="qb-curate-card">
            <span class="qb-curate-label">Enunciado Atual no Banco de Dados</span>
            <div style="font-size:13.5px;line-height:1.55;color:#f8fafc;margin-bottom:10px">${escHtml(q.enunciado || "")}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <span style="font-size:12px;padding:2px 8px;border-radius:5px;background:rgba(99,102,241,0.18);color:#c7d2fe;font-weight:600">Gabarito: ${escHtml(q.gabarito || "")}</span>
              ${q.ref ? `<span style="font-size:12px;color:#94a3b8">Ref: ${escHtml(q.ref)}</span>` : ""}
              ${q.statusEditorial ? `<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(245,158,11,0.15);color:#fbbf24">${escHtml(q.statusEditorial)}</span>` : ""}
            </div>
            ${q.comentario ? `<div style="margin-top:8px;font-size:12px;color:#cbd5e1;background:rgba(0,0,0,0.25);padding:8px 10px;border-radius:6px">${escHtml(q.comentario)}</div>` : ""}
          </div>

          <!-- Diagnóstico / Motivo da Queixa -->
          <div class="qb-curate-card">
            <span class="qb-curate-label">Qual o vício ou problema desta questão?</span>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
              <div>
                <select id="qb-curate-issue-type" class="qb-curate-select">
                  <option value="enunciado_ambiguo" selected>Enunciado ambíguo / mal formulado</option>
                  <option value="gabarito_incorreto">Gabarito incorreto ou controverso</option>
                  <option value="legislacao_desatualizada">Legislação ou norma desatualizada</option>
                  <option value="comentario_incompleto">Comentário sem citação normativa exata</option>
                  <option value="fora_edital">Conteúdo fora do edital do concurso</option>
                  <option value="outro">Outro problema de qualidade</option>
                </select>
              </div>
              <div style="font-size:12px;color:#94a3b8;display:flex;align-items:center">
                Você pode solicitar uma reformulação imediata com IA ou excluir a questão em definitivo.
              </div>
            </div>

            <span class="qb-curate-label">Sua observação / O que precisa mudar:</span>
            <textarea id="qb-curate-user-obs" class="qb-curate-textarea" placeholder="Ex.: O gabarito diz Errado, mas a lei 9.784/99 art. 13 veda expressamente a delegação apenas nos 3 incisos..."></textarea>
          </div>

          <!-- Barra de Ações Principais -->
          <div class="qb-curate-actions-bar">
            <div class="qb-curate-btn-group">
              <button type="button" class="qb-btn-ai-rephrase" id="qb-btn-ai-trigger" ${isAiLoading ? "disabled" : ""}>
                ${isAiLoading ? "⏳ Analisando e Reformulando..." : "🤖 Reformular com IA (O Arquiteto)"}
              </button>
              <button type="button" class="qb-btn-flag-review" id="qb-btn-flag-review">🚩 Solicitar Revisão Editorial</button>
            </div>
            <button type="button" class="qb-btn-delete-q" id="qb-btn-modal-delete" style="padding:8px 12px;font-size:12.5px">
              🗑 Excluir do Banco de Dados
            </button>
          </div>

          <!-- Painel de Prévia da Reformulação (se gerada) -->
          ${
            aiResult
              ? `
            <div class="qb-curate-preview-box">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <span class="qb-curate-verdict-tag">✨ Proposta de Reformulação Padrão Cebraspe</span>
                <span style="font-size:11px;color:#94a3b8">Confira e ajuste antes de salvar</span>
              </div>

              ${aiResult.parecer ? `<p style="font-size:12px;color:#cbd5e1;margin:0;line-height:1.5"><strong>Parecer do Curador:</strong> ${escHtml(aiResult.parecer)}</p>` : ""}

              <div>
                <label class="qb-curate-label">Novo Enunciado Reformulado</label>
                <textarea id="qb-curate-new-enunciado" class="qb-curate-textarea" style="min-height:80px">${escHtml(aiResult.reformulada?.enunciado || "")}</textarea>
              </div>

              <div style="display:grid;grid-template-columns:120px 1fr;gap:12px">
                <div>
                  <label class="qb-curate-label">Gabarito</label>
                  <select id="qb-curate-new-gabarito" class="qb-curate-select">
                    <option value="C" ${(aiResult.reformulada?.gabarito || "").toUpperCase() === "C" ? "selected" : ""}>Certo (C)</option>
                    <option value="E" ${(aiResult.reformulada?.gabarito || "").toUpperCase() === "E" ? "selected" : ""}>Errado (E)</option>
                  </select>
                </div>
                <div>
                  <label class="qb-curate-label">Dispositivo / Referência Legal</label>
                  <input id="qb-curate-new-ref" class="qb-curate-input" value="${escHtml(aiResult.reformulada?.ref || "")}" placeholder="Ex: Art. 13, Lei 9.784/1999" />
                </div>
              </div>

              <div>
                <label class="qb-curate-label">Novo Comentário com Fundamentação</label>
                <textarea id="qb-curate-new-comentario" class="qb-curate-textarea" style="min-height:90px">${escHtml(aiResult.reformulada?.comentario || "")}</textarea>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
                <button type="button" class="qb-btn-save-curated" id="qb-btn-save-proposal">
                  💾 Salvar Questão Reformulada no Banco
                </button>
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    // Eventos do Modal
    const closeBtn = backdrop.querySelector("#qb-curate-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const deleteBtn = backdrop.querySelector("#qb-btn-modal-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        deleteQuestion(q.id, opts);
      });
    }

    const aiTriggerBtn = backdrop.querySelector("#qb-btn-ai-trigger");
    if (aiTriggerBtn) {
      aiTriggerBtn.addEventListener("click", async () => {
        const issueType = backdrop.querySelector("#qb-curate-issue-type")?.value || "enunciado_ambiguo";
        const userObservation = backdrop.querySelector("#qb-curate-user-obs")?.value || "";

        activeModalState.isAiLoading = true;
        renderModalContent();

        try {
          const res = await curateWithAI(q, issueType, userObservation);
          activeModalState.aiResult = res;
        } catch (err) {
          console.error("[QuestionCurator] Falha ao reformular com IA:", err);
          if (typeof global.toast === "function") global.toast("Não foi possível reformular com IA agora.");
        } finally {
          activeModalState.isAiLoading = false;
          renderModalContent();
        }
      });
    }

    const flagReviewBtn = backdrop.querySelector("#qb-btn-flag-review");
    if (flagReviewBtn) {
      flagReviewBtn.addEventListener("click", () => {
        const issueType = backdrop.querySelector("#qb-curate-issue-type")?.value || "enunciado_ambiguo";
        const userObservation = backdrop.querySelector("#qb-curate-user-obs")?.value || "";
        requestEditorialReview(q.id, issueType, userObservation, opts);
      });
    }

    const saveProposalBtn = backdrop.querySelector("#qb-btn-save-proposal");
    if (saveProposalBtn) {
      saveProposalBtn.addEventListener("click", () => {
        const newEnunciado = backdrop.querySelector("#qb-curate-new-enunciado")?.value?.trim();
        const newGabarito = backdrop.querySelector("#qb-curate-new-gabarito")?.value?.trim();
        const newRef = backdrop.querySelector("#qb-curate-new-ref")?.value?.trim();
        const newComentario = backdrop.querySelector("#qb-curate-new-comentario")?.value?.trim();

        if (!newEnunciado) {
          if (typeof global.toast === "function") global.toast("O enunciado não pode ficar vazio.");
          return;
        }

        saveCuratedQuestion(
          q.id,
          {
            enunciado: newEnunciado,
            gabarito: newGabarito,
            ref: newRef,
            comentario: newComentario,
            mecanismo: activeModalState.aiResult?.reformulada?.mecanismo || q.mecanismo || "F3",
            vacina: activeModalState.aiResult?.reformulada?.vacina || q.vacina || "",
          },
          opts
        );
      });
    }
  }

  // Exportação Global
  global.QBQuestionCurator = {
    open,
    closeModal,
    deleteQuestion,
    curateWithAI,
    saveCuratedQuestion,
    requestEditorialReview,
  };
})(typeof window !== "undefined" ? window : globalThis);
