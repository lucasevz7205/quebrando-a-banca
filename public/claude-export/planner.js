/* Quebrando a Banca | Calendário semanal de execução e edição de trilha consolidada
 * Renderiza o plano do estudante com os dados privados da coleção "planejamento".
 * Permite reprogramar objetivos anteriores ou posteriores para o dia ou semana atual.
 * Não altera a agenda automática de revisão nem o histórico de respostas.
 */
(() => {
  "use strict";
  const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const KINDS = { estudo: "Estudo", questoes: "Questões", revisao: "Revisão", mapa: "Mapa ou resumo", simulado: "Simulado" };
  const esc = text => String(text ?? "").replace(/[&<>"']/g, chr => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[chr]));
  const pad = num => String(num).padStart(2, "0");
  const dateLocal = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseDay = date => { const [y, m, d] = String(date).split("-").map(Number); return new Date(y, m - 1, d, 12); };
  const shift = (date, delta) => { const d = parseDay(date); d.setDate(d.getDate() + delta); return dateLocal(d); };
  const weekStart = date => { const d = parseDay(date); d.setDate(d.getDate() - d.getDay()); return dateLocal(d); };
  const short = date => { const d = parseDay(date); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
  const longRange = (start, end) => {
    const a = parseDay(start), b = parseDay(end);
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()} a ${b.getDate()} de ${MONTHS[b.getMonth()]} de ${b.getFullYear()}`
      : `${a.getDate()} ${MONTHS[a.getMonth()]} a ${b.getDate()} ${MONTHS[b.getMonth()]} de ${b.getFullYear()}`;
  };
  const hours = minutes => {
    const m = Math.max(0, Math.round(minutes || 0));
    return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${pad(m % 60)}min` : ""}` : `${m}min`;
  };
  const clock = value => { const s = Math.max(0, Math.floor(value || 0)); return s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
  const byOrder = (a, b) => (a.data || "").localeCompare(b.data || "") || (a.horario || "99:99").localeCompare(b.horario || "99:99") || (a.criadoEm || "").localeCompare(b.criadoEm || "");
  let tick = null;

  function initialize(S) {
    if (!S.planWeekStart) S.planWeekStart = weekStart(dateLocal(new Date()));
    if (!S.planSelectedDay) S.planSelectedDay = dateLocal(new Date());
    if (!S.planMode) S.planMode = "semana";
    if (!S.planReprogramScope) S.planReprogramScope = "todos"; // "posteriores" | "anteriores" | "todos"
    if (!S.planReprogramTrail) S.planReprogramTrail = "";
    if (!S.planReprogramQuery) S.planReprogramQuery = "";
    if (!(S.planPickedIds instanceof Set)) S.planPickedIds = new Set();
    if (!Array.isArray(S.pl)) S.pl = [];
  }
  const seconds = task => Math.max(0, Number(task.segundos || 0) + (task.status === "executando" && task.iniciadoEm ? Math.max(0, Math.floor((Date.now() - Date.parse(task.iniciadoEm)) / 1000)) : 0));
  const done = task => task.status === "concluida";
  const archived = task => task.arquivada === true;
  const active = tasks => tasks.filter(x => !archived(x));
  const currentWeek = S => Array.from({ length: 7 }, (_, i) => shift(S.planWeekStart, i));
  const getWeekTasks = (S, days) => active(S.pl).filter(t => days.includes(t.data)).sort(byOrder);
  const getDay = (S, day) => active(S.pl).filter(t => t.data === day).sort(byOrder);

  function automaticReviews(S, today, proxDe, devidas, cartRevHoje) {
    const due = { questoes: new Map(), cartoes: new Map() };
    for (const r of S.r.values()) {
      if (!r || (S.q.size && !S.q.has(r.qid))) continue;
      const date = proxDe(r);
      if (date) {
        const k = date < today ? today : date;
        due.questoes.set(k, (due.questoes.get(k) || 0) + 1);
      }
    }
    for (const a of (S.cav || new Map()).values()) {
      if (!a || !a.prox) continue;
      const k = a.prox < today ? today : a.prox;
      due.cartoes.set(k, (due.cartoes.get(k) || 0) + 1);
    }
    if (devidas) {
      const d = devidas();
      due.questoes.set(today, d.fila.length);
    }
    if (typeof cartRevHoje === "function") {
      due.cartoes.set(today, Math.min(due.cartoes.get(today) || 0, Math.max(0, 50 - cartRevHoje())));
    }
    return due;
  }

  function trailResources(S, task) {
    if (!S.studyAccount || typeof task.trilha !== "string") return "";
    const revision = S.rv.get(task.topico);
    return `<div class="qb-plan-resources">
      ${task.notas ? `<p class="qb-plan-notes">${esc(task.notas)}</p>` : ""}
      <div class="acts">
        ${revision?.mapa ? `<button type="button" class="lnk" data-ir-mapa="${esc(task.topico)}">Mapa mental</button>` : ""}
        ${revision?.cartoes?.length ? `<button type="button" class="lnk" data-ir-cart="${esc(task.topico)}">Revisão ativa</button>` : ""}
        ${task.capitulo && S.q.size ? `<button type="button" class="lnk" data-treinar="${esc(task.capitulo)}">Treinar questão</button>` : ""}
        ${!task.topico && task.tipo === "revisao" ? '<button type="button" class="lnk" data-sub="caderno">Caderno de erros</button>' : ""}
      </div>
    </div>`;
  }

  function taskCard(S, task, compact = false, today = "") {
    const status = task.status || "planejada";
    const title = esc(task.titulo || "Atividade sem título");
    const trailBadge = typeof task.trilha === "string" && task.trilha ? `Trilha ${task.trilha}` : null;
    const details = [trailBadge, task.horario, task.materia, task.minutos ? hours(task.minutos) : null].filter(Boolean).map(esc);
    return `<div class="qb-plan-task qb-kind-${esc(task.tipo || "estudo")} ${done(task) ? "qb-task-done" : ""} ${status === "executando" ? "qb-task-running" : ""}">
      ${compact ? `<span class="qb-task-name">${title}</span><span class="qb-task-line">${esc(KINDS[task.tipo] || "Estudo")}${task.horario ? ` · ${esc(task.horario)}` : ""}</span>` : `
      <div class="qb-task-copy"><span class="qb-task-kind">${esc(KINDS[task.tipo] || "Estudo")}${trailBadge ? ` · ${esc(trailBadge)}` : ""}</span><strong>${title}</strong>
        <span class="qb-task-line">${details.join(" · ") || "Sem horário fixo"}</span>
        ${trailResources(S, task)}
        ${status === "executando" ? `<span class="qb-task-live">Em execução <b data-plan-timer="${esc(task.id)}">${clock(seconds(task))}</b></span>` : ""}
        ${status === "pausada" ? `<span class="qb-task-line">Pausada · ${clock(seconds(task))} registrado(s)</span>` : ""}
        ${done(task) ? `<span class="qb-task-finished">Concluída${task.concluidaEm ? ` · ${short(task.concluidaEm.slice(0, 10))}` : ""}</span>` : ""}
      </div>
      <div class="qb-task-controls">
        <button class="qb-task-check" type="button" data-plan-action="${done(task) ? "reopen" : "complete"}" data-plan-id="${esc(task.id)}" aria-label="${done(task) ? "Reabrir" : "Concluir"} ${title}" title="${done(task) ? "Reabrir" : "Marcar concluída"}">${done(task) ? "✓" : "○"}</button>
        ${!done(task) ? `<button type="button" data-plan-action="${status === "executando" ? "pause" : "start"}" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="${status === "executando" ? "Pausar" : "Iniciar"}">${status === "executando" ? "Ⅱ" : "▶"}</button>` : ""}
        <button type="button" data-plan-action="shift-prev-day" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="Antecipar 1 dia (-1d)">◀</button>
        <button type="button" data-plan-action="shift-next-day" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="Adiar 1 dia (+1d)">▶</button>
        ${today && task.data !== today ? `<button type="button" data-plan-action="move-today" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="Trazer para Hoje (${short(today)})">📍</button>` : ""}
        <button type="button" data-plan-action="edit" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="Editar dia, semana ou detalhes da atividade">✎</button>
      </div>`}
    </div>`;
  }

  function dayColumn(S, day, today, due) {
    const tasks = getDay(S, day);
    const nDone = tasks.filter(done).length;
    const automatic = (due.questoes.get(day) || 0) + (due.cartoes.get(day) || 0);
    const classes = ["qb-week-day", day === today ? "is-today" : "", day === S.planSelectedDay ? "is-selected" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}">
      <button type="button" class="qb-week-day-head" data-plan-day="${day}" aria-pressed="${day === S.planSelectedDay}" aria-label="Mostrar tarefas de ${esc(DAY_LABELS[parseDay(day).getDay()])}, ${short(day)}">
        <span>${esc(DAY_LABELS[parseDay(day).getDay()].slice(0, 3))}</span><strong>${parseDay(day).getDate()}</strong>
        <small>${nDone}/${tasks.length} tarefas</small>
      </button>
      <div class="qb-week-day-content">
        ${tasks.slice(0, 4).map(t => `<button type="button" class="qb-calendar-pill qb-kind-${esc(t.tipo || "estudo")}" data-plan-open="${esc(t.id)}" title="${esc(t.titulo)}"><span class="qb-calendar-pill-title">${done(t) ? "✓ " : ""}${esc(t.titulo)}</span><small>${t.horario ? esc(t.horario) + " · " : ""}${esc(KINDS[t.tipo] || "Estudo")}</small></button>`).join("")}
        ${tasks.length > 4 ? `<button type="button" data-plan-day="${day}" class="qb-week-more">+ ${tasks.length - 4} tarefas</button>` : ""}
        ${automatic ? `<button class="qb-week-due" data-plan-day="${day}" title="Revisões programadas automaticamente">${automatic} revisões automáticas</button>` : ""}
        ${!tasks.length && !automatic ? `<button class="qb-week-empty" data-plan-day="${day}">Planejar dia +</button>` : ""}
      </div>
    </div>`;
  }

  function form(S, today = "") {
    if (!S.planFormOpen) return "";
    const old = S.pl.find(x => x.id === S.planEditing) || null;
    const date = old?.data || S.planSelectedDay;
    const days = currentWeek(S);
    const materias = [...new Set([...S.ed.values()].map(x => x.materia).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    return `<form class="qb-plan-form" id="qb-plan-form">
      <div class="qb-plan-form-title"><h3>${old ? "Editar objetivo / atividade do cronograma" : "Nova atividade"}</h3><button type="button" data-plan-action="cancel" class="qb-task-icon" title="Fechar formulário">✕</button></div>
      <div class="qb-form-grid">
        <label class="qb-span-two">O que vai estudar?<input id="qb-p-title" name="titulo" required maxlength="180" placeholder="Ex.: Revisar atos administrativos" value="${esc(old?.titulo || "")}"></label>
        <label>Tipo de atividade<select name="tipo" id="qb-p-kind">${Object.entries(KINDS).map(([id, name]) => `<option value="${id}" ${id === (old?.tipo || "estudo") ? "selected" : ""}>${name}</option>`).join("")}</select></label>
        <label>Dia no cronograma<input type="date" name="data" id="qb-p-date" required value="${esc(date)}"></label>
        <div class="qb-span-two" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
          <small style="color:var(--muted)">Atalhos para alocar na semana:</small>
          ${today ? `<button type="button" class="btn ghost small" data-plan-set-date="${esc(today)}">Hoje (${short(today)})</button>` : ""}
          ${days.map(d => `<button type="button" class="btn ghost small" data-plan-set-date="${esc(d)}">${esc(DAY_LABELS[parseDay(d).getDay()].slice(0, 3))} ${short(d)}</button>`).join("")}
        </div>
        <label>Horário (opcional)<input type="time" name="horario" id="qb-p-time" value="${esc(old?.horario || "")}"></label>
        <label>Tempo previsto (minutos)<input type="number" name="minutos" id="qb-p-duration" min="5" max="720" step="5" value="${Number(old?.minutos || 60)}"></label>
        <label>Trilha (opcional)<input name="trilha" id="qb-p-trail" maxlength="10" placeholder="Ex.: 00, 01, 02" value="${esc(old?.trilha || "")}"></label>
        <label>Disciplina<input name="materia" id="qb-p-mat" list="qb-plan-materias" placeholder="Escolha ou digite uma disciplina" maxlength="120" value="${esc(old?.materia || "")}"><datalist id="qb-plan-materias">${materias.map(n => `<option value="${esc(n)}"></option>`).join("")}</datalist></label>
        <label class="qb-span-two">Observações / Recorte da trilha (opcional)<textarea id="qb-p-notes" name="notas" rows="2" maxlength="1400" placeholder="Assunto, meta de questões ou material">${esc(old?.notas || "")}</textarea></label>
      </div>
      <div class="qb-form-actions"><button type="submit" class="btn">${old ? "Salvar alterações no cronograma" : "Adicionar ao planejamento"}</button>${old ? `<button type="button" class="btn ghost" data-plan-action="archive" data-plan-id="${esc(old.id)}">Arquivar atividade</button>` : ""}<button type="button" class="btn ghost" data-plan-action="cancel">Cancelar</button></div>
    </form>`;
  }

  /* ---------- Autonomia da rotina: ajustes rápidos que o próprio estudante decide ----------
   * Funções puras: devolvem só as atividades alteradas (cópias), sem gravar nada.
   * Nunca mexem em atividades concluídas, arquivadas ou em execução, nem na revisão automática.
   */
  const movable = t => !done(t) && !archived(t) && t.status !== "executando";
  const PULL_COUNTS = [1, 2, 3, 5, 8];
  function remainingWeekDays(S, today) {
    const days = currentWeek(S);
    const from = today > days[0] ? today : days[0];
    return days.filter(d => d >= from);
  }
  function routinePullNext(S, today, count = 3, mode = "day") {
    initialize(S);
    const n = Math.max(1, Math.min(20, Number(count) || 3));
    const days = currentWeek(S);
    const now = new Date().toISOString();
    if (mode === "week") {
      const targets = remainingWeekDays(S, today);
      if (!targets.length) return [];
      const next = active(S.pl).filter(t => movable(t) && t.data > days[6]).sort(byOrder).slice(0, n);
      return next.map((t, i) => ({ ...t, data: targets[i % targets.length], atualizadoEm: now }));
    }
    const target = S.planSelectedDay;
    const next = active(S.pl).filter(t => movable(t) && t.data > target).sort(byOrder).slice(0, n);
    return next.map(t => ({ ...t, data: target, atualizadoEm: now }));
  }
  function routinePullOverdue(S, today) {
    initialize(S);
    const now = new Date().toISOString();
    return active(S.pl).filter(t => movable(t) && t.data < today).sort(byOrder)
      .map(t => ({ ...t, data: today, atualizadoEm: now }));
  }
  function routinePushDay(S, day = S.planSelectedDay) {
    initialize(S);
    const now = new Date().toISOString();
    return getDay(S, day).filter(movable).map(t => ({ ...t, data: shift(t.data, 1), atualizadoEm: now }));
  }
  function routineRebalanceWeek(S, today) {
    initialize(S);
    const days = currentWeek(S);
    const targets = remainingWeekDays(S, today);
    if (!targets.length) return [];
    const weekTasks = active(S.pl).filter(t => days.includes(t.data));
    const toPlace = weekTasks.filter(movable).sort(byOrder);
    const load = new Map(targets.map(d => [d, 0]));
    for (const t of weekTasks) if (!movable(t) && load.has(t.data)) load.set(t.data, load.get(t.data) + (Number(t.minutos) || 60));
    const now = new Date().toISOString();
    const changed = [];
    for (const t of toPlace) {
      const min = Math.min(...load.values());
      const best = load.get(t.data) === min ? t.data : targets.find(d => load.get(d) === min);
      load.set(best, load.get(best) + (Number(t.minutos) || 60));
      if (best !== t.data) changed.push({ ...t, data: best, atualizadoEm: now });
    }
    return changed;
  }

  function routineAutonomyPanel(S, today, days) {
    if (!active(S.pl).length) return "";
    const count = PULL_COUNTS.includes(Number(S.planPullCount)) ? Number(S.planPullCount) : 3;
    const sel = S.planSelectedDay;
    const after = active(S.pl).filter(t => movable(t) && t.data > sel).length;
    const afterWeek = active(S.pl).filter(t => movable(t) && t.data > days[6]).length;
    const overdue = active(S.pl).filter(t => movable(t) && t.data < today).length;
    const dayPending = getDay(S, sel).filter(movable).length;
    const weekPending = active(S.pl).filter(t => movable(t) && days.includes(t.data)).length;
    const btn = (act, label, enabled, title, primary = false) =>
      `<button type="button" class="btn ${primary ? "" : "ghost"} small" data-plan-action="${act}" ${enabled ? "" : "disabled"} title="${esc(title)}">${label}</button>`;
    return `<section class="qb-plan-autonomy" id="qb-plan-autonomy" aria-label="Autonomia da rotina" style="display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:1px solid var(--line);border-radius:14px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;justify-content:space-between">
        <div><span class="qb-plan-eyebrow">AUTONOMIA DA ROTINA</span>
          <h3 style="margin:2px 0">Adapte a semana ao seu dia real</h3>
          <p style="margin:0;color:var(--muted);font-size:13px">Você decide: adiante objetivos da trilha, traga os atrasados, alivie um dia cheio ou redistribua a semana. Nada é concluído ou apagado e a revisão automática não muda.</p>
        </div>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px">Quantidade
          <select data-plan-pull-count aria-label="Quantos objetivos puxar" style="padding:5px 8px;border-radius:8px">${PULL_COUNTS.map(n => `<option value="${n}" ${n === count ? "selected" : ""}>${n}</option>`).join("")}</select>
        </label>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${btn("pull-next-trail-tasks", `⇄ Puxar próximos ${count} para ${short(sel)}`, after > 0, `Traz os próximos ${count} objetivos posteriores (${after} disponíveis) para o dia selecionado`, true)}
        ${btn("pull-next-week", `⇉ Distribuir próximos ${count} nesta semana`, afterWeek > 0, `Espalha os próximos ${count} objetivos de semanas futuras (${afterWeek} disponíveis) pelos dias restantes desta semana`)}
        ${btn("pull-overdue-today", `↺ Trazer atrasados para hoje (${overdue})`, overdue > 0, "Move para hoje os objetivos anteriores que ficaram pendentes")}
        ${btn("push-day-pending", `🌤 Desafogar ${short(sel)} (+1 dia, ${dayPending})`, dayPending > 0, "Adia para o dia seguinte o que ainda não foi feito no dia selecionado")}
        ${btn("rebalance-week", `🔄 Redistribuir pendentes da semana (${weekPending})`, weekPending > 0, "Equilibra o tempo planejado entre os dias restantes da semana")}
        ${S.planUndo?.length ? btn("undo-routine", `↶ Desfazer último ajuste (${S.planUndo.length})`, true, "Devolve as atividades às datas anteriores ao último ajuste rápido") : ""}
      </div>
    </section>`;
  }

  function plannedTrails(S) {
    const firstDay = new Map();
    if (S.studyAccount) {
      for (const task of active(S.pl)) {
        if (typeof task.trilha !== "string" || !/^\d{2}$/.test(task.trilha)) continue;
        const current = firstDay.get(task.trilha);
        if (!current || task.data < current) firstDay.set(task.trilha, task.data);
      }
    }
    return [...firstDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  }

  /* Painel de edição do cronograma de trilha consolidada:
   * permite buscar objetivos posteriores ou anteriores de qualquer trilha/semana
   * e trazê-los para Hoje, para o Dia Selecionado ou para qualquer dia da semana atual.
   */
  function consolidatedScheduleEditor(S, today, days) {
    const allTasks = active(S.pl).sort(byOrder);
    if (allTasks.length <= 1) return "";

    const allTrails = [...new Set(allTasks.map(t => t.trilha).filter(v => typeof v === "string" && v.length > 0))].sort();
    const scope = S.planReprogramScope || "todos";
    const trailFilter = S.planReprogramTrail || "";
    const query = String(S.planReprogramQuery || "").trim().toLowerCase();

    const filtered = allTasks.filter(t => {
      if (scope === "posteriores" && !(t.data > S.planSelectedDay)) return false;
      if (scope === "anteriores" && !(t.data < S.planSelectedDay)) return false;
      if (scope === "fora-semana" && days.includes(t.data)) return false;
      if (trailFilter && t.trilha !== trailFilter) return false;
      if (query) {
        const hay = `${t.titulo || ""} ${t.materia || ""} ${t.notas || ""} ${t.capitulo || ""} trilha ${t.trilha || ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    const pickedCount = [...(S.planPickedIds || [])].filter(id => allTasks.some(t => t.id === id)).length;

    return `<details class="qb-plan-overdue qb-plan-reprogrammer" id="qb-plan-reprogrammer" ${S.planReprogramOpen ? "open" : ""}>
      <summary>
        <div>
          <strong>⇄ Editar Cronograma da Trilha · Antecipar ou Reagendar Objetivos (${allTasks.length} atividades)</strong>
          <span>Pegue objetivos posteriores ou anteriores de qualquer trilha e coloque no dia (${short(S.planSelectedDay)}) ou na semana atual</span>
        </div>
      </summary>
      <div class="qb-plan-overdue-list" style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between">
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
            <button type="button" class="btn ${scope === "todos" ? "" : "ghost"} small" data-plan-reprog-scope="todos">Todos (${allTasks.length})</button>
            <button type="button" class="btn ${scope === "posteriores" ? "" : "ghost"} small" data-plan-reprog-scope="posteriores">Posteriores a ${short(S.planSelectedDay)}</button>
            <button type="button" class="btn ${scope === "anteriores" ? "" : "ghost"} small" data-plan-reprog-scope="anteriores">Anteriores a ${short(S.planSelectedDay)}</button>
            <button type="button" class="btn ${scope === "fora-semana" ? "" : "ghost"} small" data-plan-reprog-scope="fora-semana">Fora da semana visível</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            ${allTrails.length ? `<select aria-label="Filtrar objetivos por trilha" data-plan-reprog-trail style="padding:6px 10px;border-radius:8px">
              <option value="">Todas as trilhas (${allTrails.length})</option>
              ${allTrails.map(tr => `<option value="${esc(tr)}" ${trailFilter === tr ? "selected" : ""}>Trilha ${esc(tr)}</option>`).join("")}
            </select>` : ""}
            <input type="search" data-plan-reprog-query placeholder="Buscar objetivo, matéria ou tarefa..." value="${esc(S.planReprogramQuery || "")}" style="padding:6px 10px;border-radius:8px;min-width:210px">
          </div>
        </div>

        ${pickedCount ? `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:10px;background:var(--pen-soft)">
          <strong>${pickedCount} objetivo(s) selecionado(s) para reprogramação em lote</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
            <button type="button" class="btn small" data-plan-action="move-batch-selected">Colocar no dia ${short(S.planSelectedDay)}</button>
            <button type="button" class="btn ghost small" data-plan-action="move-batch-today">Colocar em Hoje (${short(today)})</button>
            <button type="button" class="btn ghost small" data-plan-action="distribute-batch-week">Distribuir na semana (${short(days[0])} a ${short(days[6])})</button>
            <button type="button" class="btn ghost small" data-plan-action="clear-batch-picks">Limpar seleção</button>
          </div>
        </div>` : ""}

        <div style="display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto">
          ${filtered.slice(0, 60).map(t => {
            const isPicked = S.planPickedIds?.has(t.id);
            const posLabel = t.data > S.planSelectedDay ? "Posterior" : t.data < S.planSelectedDay ? "Anterior" : "Neste dia";
            return `<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--line);border-radius:10px">
              <label style="display:flex;align-items:flex-start;gap:10px;flex:1;min-width:240px;cursor:pointer">
                <input type="checkbox" data-plan-pick="${esc(t.id)}" ${isPicked ? "checked" : ""} style="margin-top:4px">
                <div>
                  <strong>${done(t) ? "✓ " : ""}${esc(t.titulo)}</strong>
                  <small style="display:block;color:var(--muted)">
                    ${typeof t.trilha === "string" && t.trilha ? `<b>Trilha ${esc(t.trilha)}</b> · ` : ""}
                    Data atual: <b>${short(t.data)}</b> (${posLabel}) · ${esc(KINDS[t.tipo] || "Estudo")}${t.materia ? ` · ${esc(t.materia)}` : ""}
                  </small>
                </div>
              </label>
              <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
                ${t.data !== S.planSelectedDay ? `<button type="button" class="btn small" data-plan-action="move" data-plan-id="${esc(t.id)}" title="Mover este objetivo para o dia selecionado (${short(S.planSelectedDay)})">Trazer para ${short(S.planSelectedDay)}</button>` : `<span class="mono" style="font-size:11.5px;color:var(--certo)">✓ Em ${short(S.planSelectedDay)}</span>`}
                ${t.data !== today && S.planSelectedDay !== today ? `<button type="button" class="btn ghost small" data-plan-action="move-today" data-plan-id="${esc(t.id)}">Hoje (${short(today)})</button>` : ""}
                <select aria-label="Escolher dia da semana para ${esc(t.titulo)}" data-plan-target-day="${esc(t.id)}" style="padding:5px 8px;border-radius:8px;font-size:12px">
                  <option value="">Colocar na semana...</option>
                  ${days.map(d => `<option value="${esc(d)}" ${t.data === d ? "selected" : ""}>${esc(DAY_LABELS[parseDay(d).getDay()].slice(0, 3))} ${short(d)}${d === today ? " (Hoje)" : ""}</option>`).join("")}
                </select>
                <button type="button" class="btn ghost small" data-plan-action="edit" data-plan-id="${esc(t.id)}" title="Abrir edição completa">✎</button>
              </div>
            </div>`;
          }).join("") || `<div class="qb-plan-empty"><strong>Nenhum objetivo encontrado com esse filtro.</strong><span>Altere o filtro acima para visualizar todas as tarefas da trilha.</span></div>`}
        </div>
      </div>
    </details>`;
  }

  function render(S, { hoje, proxDe, devidas, cartRevHoje }) {
    initialize(S);
    const today = hoje();
    const days = currentWeek(S);
    if (!days.includes(S.planSelectedDay)) S.planSelectedDay = days[0];
    const tasks = getWeekTasks(S, days);
    const trails = plannedTrails(S);
    if (!S.planTrailSeen && trails.length) {
      S.planTrailSeen = true;
      if (S.planSelectedDay === today && !tasks.some(t => t.data === today)) {
        const first = tasks.filter(t => t.trilha && t.data > today).sort((a, b) => a.data.localeCompare(b.data))[0];
        if (first) S.planSelectedDay = first.data;
      }
    }
    const selected = getDay(S, S.planSelectedDay);
    const selectedTrail = selected.find(task => typeof task.trilha === "string")?.trilha
      ?? tasks.find(task => typeof task.trilha === "string")?.trilha;
    const due = automaticReviews(S, today, proxDe, devidas, cartRevHoje);
    const total = tasks.length;
    const completed = tasks.filter(done).length;
    const plannedMinutes = tasks.reduce((n, t) => n + (Number(t.minutos) || 0), 0);
    const usedMinutes = Math.round(tasks.reduce((n, t) => n + seconds(t), 0) / 60);
    const percent = total ? Math.round(completed / total * 100) : 0;
    const overdue = active(S.pl).filter(t => !done(t) && t.data < today);
    const backlog = overdue.filter(t => t.data < days[0]).sort(byOrder);
    const outstanding = overdue.length;
    const selectedAuto = (due.questoes.get(S.planSelectedDay) || 0) + (due.cartoes.get(S.planSelectedDay) || 0);
    return `<div class="wrap qb-week-planner" style="gap:18px">
      <section class="qb-plan-intro qb-page-hero" aria-label="Planejamento semanal">
        <div class="qb-page-hero-copy"><span class="qb-plan-eyebrow">PLANEJAMENTO SEMANAL · QUEBRANDO A BANCA</span>
          <h2>${trails.length ? `Trilhas de estudo · ${esc(S.studyAccountName || "Seu concurso")}` : "Sua semana de estudos"}</h2>
          <p>${trails.length ? "Siga a numeração das tarefas ou personalize o seu cronograma: antecipe objetivos posteriores ou traga metas anteriores para o dia e semana atuais." : "Planeje, execute e acompanhe suas tarefas, revisões e simulados. Um dia de cada vez, com toda a semana à vista."}</p>
        </div>
        <div class="qb-page-hero-actions"><button type="button" class="btn" data-plan-action="new">+ Nova atividade</button></div>
        <div class="qb-page-hero-footer" aria-label="Navegar entre semanas">
          <div class="qb-week-title"><h3>${esc(longRange(days[0], days[6]))}</h3><span>Semana selecionada</span></div>
          <div class="qb-week-nav">${trails.length ? `<select aria-label="Ir para uma trilha" data-plan-trail>
            <option value="">Ir para uma trilha</option>
            ${trails.map(([trail, day]) => `<option value="${day}" ${selectedTrail === trail ? "selected" : ""}>Trilha ${esc(trail)}</option>`).join("")}
          </select>` : ""}<button type="button" data-plan-week="-1" aria-label="Semana anterior">‹</button><button type="button" data-plan-week="0">Semana atual</button><button type="button" data-plan-week="1" aria-label="Próxima semana">›</button></div>
        </div>
      </section>
      ${window.QBStudyCycleUI ? window.QBStudyCycleUI.render(S) : ""}
      <div class="qb-plan-summary">
        <div class="qb-plan-kpi"><b>${completed}<span>/${total}</span></b><small>tarefas concluídas</small></div>
        <div class="qb-plan-kpi"><b>${percent}%</b><small>conclusão semanal</small><div class="qb-plan-progress"><i style="width:${percent}%"></i></div></div>
        <div class="qb-plan-kpi"><b>${hours(plannedMinutes)}</b><small>tempo planejado</small></div>
        <div class="qb-plan-kpi"><b>${hours(usedMinutes)}</b><small>tempo registrado${outstanding ? ` · ${outstanding} em atraso` : ""}</small></div>
      </div>
      ${window.QBInsights ? window.QBInsights.compact(S, S.planSelectedDay) : ""}
      ${routineAutonomyPanel(S, today, days)}
      <section class="qb-week-calendar" aria-label="Calendário de estudos da semana"><div class="qb-calendar-scroll"><div class="qb-week-grid">${days.map(d => dayColumn(S, d, today, due)).join("")}</div></div></section>
      ${backlog.length ? `<details class="qb-plan-overdue"><summary><strong>${backlog.length} atividades pendentes de semanas anteriores</strong><span>Abra para reprogramar ou concluir</span></summary><div class="qb-plan-overdue-list">${backlog.map(t => `<div><div><strong>${esc(t.titulo)}</strong><small>${short(t.data)} · ${esc(KINDS[t.tipo] || "Estudo")}${t.materia ? ` · ${esc(t.materia)}` : ""}</small></div><button type="button" class="btn ghost small" data-plan-action="move" data-plan-id="${esc(t.id)}">Mover para ${short(S.planSelectedDay)}</button></div>`).join("")}</div></details>` : ""}
      ${consolidatedScheduleEditor(S, today, days)}
      <div class="qb-plan-bottom">
        <section class="qb-plan-day-detail"><div class="qb-plan-panel-head"><div><span class="qb-plan-eyebrow">EXECUÇÃO DO DIA</span><h3>${esc(DAY_LABELS[parseDay(S.planSelectedDay).getDay()])}, ${short(S.planSelectedDay)} ${S.planSelectedDay === today ? '<span class="qb-today-pill">Hoje</span>' : ""}</h3></div><button type="button" class="btn ghost small" data-plan-action="new">Adicionar</button></div>
          ${selected.length ? `<div class="qb-plan-task-list">${selected.map(t => taskCard(S, t, false, today)).join("")}</div>` : `<div class="qb-plan-empty"><strong>Nenhuma atividade manual planejada.</strong><span>Adicione um estudo, revisão, simulado ou traga um objetivo da trilha consolidada acima para este dia.</span></div>`}
          <div class="qb-auto-reviews"><div><strong>Revisões automáticas</strong><p>Geradas pelas respostas e avaliações anteriores. Não são alteradas ao reorganizar as tarefas.</p></div><div class="qb-auto-counts"><span>${due.questoes.get(S.planSelectedDay) || 0} questões</span><span>${due.cartoes.get(S.planSelectedDay) || 0} cartões</span></div>
            ${S.planSelectedDay === today && selectedAuto ? `<div class="qb-auto-actions"><button type="button" class="btn small" data-plan-auto="questoes" ${due.questoes.get(today) ? "" : "disabled"}>Revisar questões</button><button type="button" class="btn ghost small" data-plan-auto="cartoes" ${due.cartoes.get(today) ? "" : "disabled"}>Revisar flashcards</button></div>` : ""}
          </div>
        </section>
        <aside class="qb-plan-side"><section class="qb-plan-tips"><h3>Tipos de atividade</h3><div class="qb-plan-legend">${Object.entries(KINDS).map(([id, name]) => `<span><i class="qb-kind-dot qb-kind-${id}"></i>${esc(name)}</span>`).join("")}</div><p>Marque as tarefas concluídas, inicie uma sessão para contar o tempo ou antecipe/adie objetivos da trilha quando necessário.</p></section>
        </aside>
      </div>
      ${form(S, today)}
      <p class="qb-plan-footnote">O planejamento manual é independente do algoritmo de revisão espaçada. Marcar uma tarefa como concluída não altera gabaritos, respostas, cartões ou status dos tópicos do edital.</p>
    </div>`;
  }

  function wire(S, callbacks) {
    initialize(S);
    if (window.QBStudyCycleUI) window.QBStudyCycleUI.wire(S, callbacks);
    const today = callbacks.hoje();
    const days = currentWeek(S);
    const rerender = () => callbacks.render(true);
    const getTask = id => S.pl.find(t => t.id === id);
    const persist = task => {
      if (!S.db) { callbacks.toast?.("Conexão com o banco indisponível."); return; }
      S.pl = [...S.pl.filter(x => x.id !== task.id), task];
      callbacks.enqueue(() => S.db.doc("planejamento/" + task.id).set(task));
      rerender();
    };
    const persistMany = tasksToSave => {
      if (!tasksToSave.length) return;
      if (!S.db) { callbacks.toast?.("Conexão com o banco indisponível."); return; }
      const byId = new Map(tasksToSave.map(t => [t.id, t]));
      S.pl = [...S.pl.filter(x => !byId.has(x.id)), ...tasksToSave];
      for (const t of tasksToSave) {
        callbacks.enqueue(() => S.db.doc("planejamento/" + t.id).set(t));
      }
      rerender();
    };
    const openForm = (old = null) => {
      S.planEditing = old?.id || null;
      S.planFormOpen = true;
      rerender();
      setTimeout(() => {
        document.getElementById("qb-plan-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById("qb-p-title")?.focus({ preventScroll: true });
      }, 0);
    };

    const reprogDetails = document.getElementById("qb-plan-reprogrammer");
    if (reprogDetails) {
      reprogDetails.addEventListener("toggle", () => {
        S.planReprogramOpen = reprogDetails.open;
      });
    }

    document.querySelectorAll("[data-plan-reprog-scope]").forEach(b => b.addEventListener("click", () => {
      S.planReprogramScope = b.dataset.planReprogScope;
      S.planReprogramOpen = true;
      rerender();
    }));

    document.querySelector("[data-plan-reprog-trail]")?.addEventListener("change", event => {
      S.planReprogramTrail = event.target.value;
      S.planReprogramOpen = true;
      rerender();
    });

    document.querySelector("[data-plan-reprog-query]")?.addEventListener("input", event => {
      S.planReprogramQuery = event.target.value;
      S.planReprogramOpen = true;
      rerender();
    });

    document.querySelectorAll("[data-plan-pick]").forEach(cb => cb.addEventListener("change", () => {
      const id = cb.dataset.planPick;
      if (cb.checked) S.planPickedIds.add(id);
      else S.planPickedIds.delete(id);
      S.planReprogramOpen = true;
      rerender();
    }));

    document.querySelectorAll("[data-plan-target-day]").forEach(sel => sel.addEventListener("change", () => {
      const task = getTask(sel.dataset.planTargetDay);
      const targetDate = sel.value;
      if (!task || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return;
      const now = new Date().toISOString();
      S.planSelectedDay = targetDate;
      S.planWeekStart = weekStart(targetDate);
      persist({ ...task, data: targetDate, atualizadoEm: now });
      callbacks.toast?.(`Objetivo movido para ${short(targetDate)}.`);
    }));

    document.querySelector("[data-plan-pull-count]")?.addEventListener("change", event => {
      S.planPullCount = Number(event.target.value) || 3;
      rerender();
    });

    document.querySelectorAll("[data-plan-set-date]").forEach(b => b.addEventListener("click", () => {
      const input = document.getElementById("qb-p-date");
      if (input) input.value = b.dataset.planSetDate;
    }));

    document.querySelectorAll("[data-plan-week]").forEach(b => b.addEventListener("click", () => {
      const delta = Number(b.dataset.planWeek);
      S.planWeekStart = delta ? shift(S.planWeekStart, delta * 7) : weekStart(today);
      S.planSelectedDay = S.planWeekStart === weekStart(today) ? today : S.planWeekStart;
      S.planFormOpen = false;
      rerender();
    }));
    document.querySelector("[data-plan-trail]")?.addEventListener("change", event => {
      const day = event.target.value;
      if (!plannedTrails(S).some(([, date]) => date === day)) return;
      S.planWeekStart = weekStart(day);
      S.planSelectedDay = day;
      S.planFormOpen = false;
      rerender();
    });
    document.querySelectorAll("[data-plan-day]").forEach(b => b.addEventListener("click", () => { S.planSelectedDay = b.dataset.planDay; S.planFormOpen = false; rerender(); }));
    document.querySelectorAll("[data-plan-open]").forEach(b => b.addEventListener("click", () => { const task = getTask(b.dataset.planOpen); if (task) { S.planSelectedDay = task.data; openForm(task); } }));
    document.querySelectorAll("[data-plan-action]").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.planAction, task = getTask(b.dataset.planId);
      const now = new Date().toISOString();
      if (act === "new") return openForm();
      if (act === "cancel") { S.planFormOpen = false; S.planEditing = null; return rerender(); }
      if (act === "clear-batch-picks") {
        S.planPickedIds.clear();
        S.planReprogramOpen = true;
        return rerender();
      }
      const ROUTINE = {
        "pull-next-trail-tasks": () => routinePullNext(S, today, S.planPullCount || 3, "day"),
        "pull-next-week": () => routinePullNext(S, today, S.planPullCount || 3, "week"),
        "pull-overdue-today": () => routinePullOverdue(S, today),
        "push-day-pending": () => routinePushDay(S, S.planSelectedDay),
        "rebalance-week": () => routineRebalanceWeek(S, today),
      };
      if (ROUTINE[act]) {
        const changed = ROUTINE[act]();
        if (!changed.length) { callbacks.toast?.("Nada para ajustar com esse comando."); return; }
        S.planUndo = changed.map(t => getTask(t.id)).filter(Boolean).map(t => ({ ...t }));
        if (act === "pull-overdue-today") { S.planSelectedDay = today; S.planWeekStart = weekStart(today); }
        persistMany(changed);
        callbacks.toast?.(`${changed.length} atividade(s) reorganizada(s). Use “Desfazer último ajuste” se mudar de ideia.`);
        return;
      }
      if (act === "undo-routine") {
        const previous = (S.planUndo || []).map(t => ({ ...t, atualizadoEm: now }));
        S.planUndo = null;
        if (previous.length) { persistMany(previous); callbacks.toast?.("Último ajuste desfeito."); }
        return;
      }
      if (act === "move-batch-selected" || act === "move-batch-today") {
        const destDate = act === "move-batch-today" ? today : S.planSelectedDay;
        const picked = [...S.planPickedIds].map(getTask).filter(Boolean);
        if (!picked.length) return;
        S.planPickedIds.clear();
        S.planSelectedDay = destDate;
        S.planWeekStart = weekStart(destDate);
        persistMany(picked.map(t => ({ ...t, data: destDate, atualizadoEm: now })));
        callbacks.toast?.(`${picked.length} objetivo(s) movido(s) para ${short(destDate)}.`);
        return;
      }
      if (act === "distribute-batch-week") {
        const picked = [...S.planPickedIds].map(getTask).filter(Boolean);
        if (!picked.length) return;
        S.planPickedIds.clear();
        persistMany(picked.map((t, idx) => ({ ...t, data: days[idx % days.length], atualizadoEm: now })));
        callbacks.toast?.(`${picked.length} objetivo(s) distribuído(s) na semana atual.`);
        return;
      }
      if (!task) return;
      if (act === "edit") return openForm(task);
      if (act === "archive") {
        if (!confirm("Arquivar esta atividade? Ela desaparecerá do calendário, mas o registro será preservado.")) return;
        S.planFormOpen = false; S.planEditing = null;
        return persist({ ...task, arquivada: true, atualizadoEm: now });
      }
      const pausedSeconds = seconds(task);
      if (act === "start") {
        const other = S.pl.find(t => !archived(t) && t.status === "executando" && t.id !== task.id);
        if (other) { callbacks.toast?.("Pause a atividade em andamento antes de iniciar outra."); return; }
        persist({ ...task, status: "executando", iniciadoEm: now, concluidaEm: null, atualizadoEm: now });
      } else if (act === "pause") {
        persist({ ...task, status: "pausada", segundos: pausedSeconds, iniciadoEm: null, atualizadoEm: now });
      } else if (act === "complete") {
        persist({ ...task, status: "concluida", segundos: pausedSeconds, iniciadoEm: null, concluidaEm: now, atualizadoEm: now });
      } else if (act === "reopen") {
        persist({ ...task, status: "planejada", iniciadoEm: null, concluidaEm: null, atualizadoEm: now });
      } else if (act === "move") {
        persist({ ...task, data: S.planSelectedDay, status: task.status === "executando" ? "executando" : task.status || "planejada", atualizadoEm: now });
        callbacks.toast?.(`Objetivo movido para ${short(S.planSelectedDay)}.`);
      } else if (act === "move-today") {
        S.planSelectedDay = today;
        S.planWeekStart = weekStart(today);
        persist({ ...task, data: today, status: task.status === "executando" ? "executando" : task.status || "planejada", atualizadoEm: now });
        callbacks.toast?.(`Objetivo movido para Hoje (${short(today)}).`);
      } else if (act === "shift-prev-day" || act === "shift-next-day") {
        const nextDate = shift(task.data, act === "shift-prev-day" ? -1 : 1);
        S.planSelectedDay = nextDate;
        S.planWeekStart = weekStart(nextDate);
        persist({ ...task, data: nextDate, atualizadoEm: now });
      }
    }));
    document.querySelectorAll("[data-qb-go-daily]").forEach(b => b.addEventListener("click", () => {
      S.insightsDay = b.dataset.qbGoDaily;
      callbacks.setView("analiseDia");
    }));
    const f = document.getElementById("qb-plan-form");
    if (f) f.addEventListener("submit", event => {
      event.preventDefault();
      const fd = new FormData(f);
      const titulo = String(fd.get("titulo") || "").trim();
      const data = String(fd.get("data") || "");
      const minutos = Number(fd.get("minutos") || 60);
      const tipo = String(fd.get("tipo") || "estudo");
      const trilhaRaw = String(fd.get("trilha") || "").trim();
      if (titulo.length < 3 || titulo.length > 180 || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !KINDS[tipo] || !Number.isInteger(minutos) || minutos < 5 || minutos > 720) {
        callbacks.toast?.("Confira o título, o dia, o tipo e a duração da atividade."); return;
      }
      const now = new Date().toISOString();
      const old = getTask(S.planEditing);
      const next = {
        ...old, id: old?.id || `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
        titulo, tipo, data, horario: String(fd.get("horario") || ""), minutos,
        ...(trilhaRaw ? { trilha: trilhaRaw.slice(0, 10) } : old?.trilha ? { trilha: old.trilha } : {}),
        materia: String(fd.get("materia") || "").trim().slice(0, 120),
        notas: String(fd.get("notas") || "").trim().slice(0, 1400),
        status: old?.status || "planejada", segundos: old?.segundos || 0,
        criadoEm: old?.criadoEm || now, atualizadoEm: now,
      };
      S.planFormOpen = false; S.planEditing = null; S.planSelectedDay = data; S.planWeekStart = weekStart(data);
      persist(next);
    });
    document.querySelectorAll("[data-plan-auto]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.planAuto === "questoes") callbacks.startRevisao();
      else callbacks.iniciarMix();
    }));
    if (!tick) tick = setInterval(() => {
      document.querySelectorAll("[data-plan-timer]").forEach(el => {
        const task = S.pl.find(t => t.id === el.dataset.planTimer);
        if (task) el.textContent = clock(seconds(task));
      });
    }, 1000);
  }
  window.QBPlanner = {
    render, wire,
    routine: { pullNext: routinePullNext, pullOverdue: routinePullOverdue, pushDay: routinePushDay, rebalanceWeek: routineRebalanceWeek },
  };
})();
