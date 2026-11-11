/* Geração editorial por conta. Somente os documentos da conta ativa são usados. */
(() => {
  "use strict";
  const state = { active: false, stop: false, index: 0, total: 0, success: 0, errors: [], topic: "", done: false };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  let current = null, rerender = () => {};
  const topicLabel = topic => [topic.materia, topic.num, topic.titulo].filter(Boolean).join(" · ");

  function evidence(S, topic) {
    const matches = [...S.mat.values()].filter(material => (material.topicos || []).includes(topic.id));
    for (const m of matches) {
      const fields = [m.conteudo, m.texto, m.transcricao, m.resumo, m.anotacoes, m.descricao,
        ...(Array.isArray(m.secoes) ? m.secoes : [])].map(v => typeof v === "string" ? v : "").filter(Boolean);
      if (fields.join("\n").length >= 350) return true;
    }
    const rev = S.rv.get(topic.id);
    const lines = [...(rev?.cartoes || []).map(c => (c.q || "") + (Array.isArray(c.a) ? c.a.join(" ") : c.a || "")),
      ...(rev?.itens || []).map(c => (c.k || "") + (c.d || ""))];
    if (lines.join("\n").length >= 500) return true;
    const examples = [...S.q.values()].filter(q => (q.topico === topic.id || (topic.caps || []).includes(q.cap)) &&
      String(q.enunciado || "").length >= 20 && String(q.comentario || "").length >= 45);
    return examples.length >= 5;
  }
  function topics(S) {
    return [...S.ed.values()].filter(t => !t.foraEdital)
      .sort((a, b) => (+a.ordem || 0) - (+b.ordem || 0));
  }
  function panelHTML(S) {
    if (!S.studyAccount) return "";
    const all = topics(S);
    const ready = all.filter(t => evidence(S, t));
    const missing = all.length - ready.length;
    const status = state.active
      ? "Processando " + state.index + "/" + state.total + (state.topic ? " · " + state.topic : "")
      : state.done ? ("Concluído: " + state.success + " assuntos processados.") : "Aguardando execução";
    const html = [
      '<section class="qb-bulk" aria-label="Produção editorial por assunto">',
      '<div class="qb-bulk-header"><div><strong>Produção em lote do edital</strong><p>Mapas mentais, revisão ativa com cartões e 20 questões autorais por assunto, vinculados ao edital e às fontes cadastradas.</p></div></div>',
      '<div class="qb-bulk-stats"><span>' + all.length + ' assuntos no edital</span><span>' + ready.length + ' com conteúdo de referência</span><span>' + missing + ' aguardando material</span></div>',
      '<p class="qb-bulk-note">A geração usa apenas textos, revisões e questões comentadas desta conta. Não lê PDFs que estejam apenas mencionados pelo nome. Questões novas ficam sinalizadas para revisão editorial. O processamento ocorre enquanto esta página permanece aberta e pode consumir créditos de IA.</p>',
      '<label class="qb-bulk-format">Formato das questões <select id="qb-bulk-format" ' + (state.active ? 'disabled' : '') + '>',
      '<option value="multipla_escolha" ' + (/PCMG|Polícia Civil/i.test(S.studyAccountName || "") ? 'selected' : '') + '>Múltipla escolha (A–E)</option>',
      '<option value="ce" ' + (/PCMG|Polícia Civil/i.test(S.studyAccountName || "") ? '' : 'selected') + '>Certo ou Errado (CEBRASPE)</option>',
      '</select></label>',
      '<div class="qb-bulk-actions">',
      state.active
        ? '<button type="button" id="qb-bulk-stop" class="btn ghost small" ' + (state.stop ? 'disabled' : '') + '>' + (state.stop ? 'Interrupção solicitada' : 'Parar após o assunto atual') + '</button>'
        : '<button type="button" id="qb-bulk-start" class="btn small" ' + (!ready.length ? 'disabled' : '') + '>Gerar para todos os assuntos com fonte</button>',
      '</div>',
      '<p class="qb-bulk-status" role="status">' + esc(status) + '</p>',
    ];
    if (!all.length) html.push('<p class="qb-bulk-note">Ainda não há tópicos do edital sincronizados nesta conta. Cadastre o edital e os materiais na conta correta.</p>');
    else if (!ready.length) html.push('<p class="qb-bulk-note">Nenhum assunto possui texto de referência suficiente no banco desta conta. A geração foi bloqueada para evitar mapas e gabaritos inventados.</p>');
    else if (missing) html.push('<details><summary>Assuntos aguardando material (' + missing + ')</summary><div class="qb-bulk-missing">' +
      all.filter(t => !evidence(S, t)).slice(0, 50).map(t => '<p>' + esc(topicLabel(t)) + '</p>').join('') +
      (missing > 50 ? '<p>E mais ' + (missing - 50) + '.</p>' : '') + '</div></details>');
    if (state.errors.length) html.push('<details open><summary>Ocorrências (' + state.errors.length + ')</summary><div class="qb-bulk-missing">' +
      state.errors.slice(-20).map(e => '<p>' + esc(e) + '</p>').join('') + '</div></details>');
    html.push("</section>");
    return html.join("");
  }
  async function execute() {
    if (state.active || !current || !current.db || !current.studyAccount) return;
    const all = topics(current).filter(t => evidence(current, t));
    if (!all.length) return;
    const format = document.getElementById("qb-bulk-format")?.value === "ce" ? "ce" : "multipla_escolha";
    Object.assign(state, { active: true, stop: false, index: 0, total: all.length, success: 0, errors: [], topic: "", done: false });
    rerender();
    try {
      for (const topic of all) {
        if (state.stop) break;
        state.index++;
        state.topic = topicLabel(topic);
        rerender();
        try {
          const result = await window.QBBridge.ask("generateStudyTopic", { topicId: topic.id, formato: format });
          state.success++;
          if (result?.skipped) state.errors.push(topic.titulo + ": já possuía conteúdo completo.");
        } catch (error) {
          state.errors.push(topicLabel(topic) + ": " + (error?.message || "Falha na geração"));
        }
        rerender();
      }
    } finally {
      state.active = false;
      state.done = true;
      state.topic = "";
      rerender();
      if (window.QBBridge?.refresh) {
        try { await Promise.all([window.QBBridge.refresh("revisao"), window.QBBridge.refresh("questoes")]); }
        catch { state.errors.push("Recarregue a página para visualizar os materiais gerados."); }
      }
      if (current?.db) {
        // Sync snapshots after server-side writes; existing subscriptions will redraw the content.
        try { await current.db.doc("config/batch-study-last").set({ finalizadoEm: new Date().toISOString(), assuntos: state.success, erros: state.errors.length }); }
        catch { /* The status remains visible even if the audit record could not be written. */ }
      }
    }
  }
  document.addEventListener("click", event => {
    const start = event.target.closest("#qb-bulk-start");
    const stop = event.target.closest("#qb-bulk-stop");
    if (start) { event.preventDefault(); void execute(); }
    if (stop) { event.preventDefault(); state.stop = true; rerender(); }
  });
  window.QBBulkStudy = {
    panelHTML,
    wire(S, render) { current = S; rerender = () => { if (S.view === "conteudo") render(true); }; },
  };
})();