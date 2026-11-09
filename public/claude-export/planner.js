/* Quebrando a Banca | Calendário semanal de execução
 * Renderiza o plano do estudante com os dados privados da coleção "planejamento".
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
  const byOrder = (a, b) => (a.horario || "99:99").localeCompare(b.horario || "99:99") || (a.criadoEm || "").localeCompare(b.criadoEm || "");
  let tick = null;

  function initialize(S) {
    if (!S.planWeekStart) S.planWeekStart = weekStart(dateLocal(new Date()));
    if (!S.planSelectedDay) S.planSelectedDay = dateLocal(new Date());
    if (!S.planMode) S.planMode = "semana";
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
    // Para hoje, o sistema limita a fila com suas próprias regras de prioridade.
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

  function taskCard(S, task, compact = false) {
    const status = task.status || "planejada";
    const title = esc(task.titulo || "Atividade sem título");
    const details = [task.horario, task.materia, task.minutos ? hours(task.minutos) : null].filter(Boolean).map(esc);
    return `<div class="qb-plan-task qb-kind-${esc(task.tipo || "estudo")} ${done(task) ? "qb-task-done" : ""} ${status === "executando" ? "qb-task-running" : ""}">
      ${compact ? `<span class="qb-task-name">${title}</span><span class="qb-task-line">${esc(KINDS[task.tipo] || "Estudo")}${task.horario ? ` · ${esc(task.horario)}` : ""}</span>` : `
      <div class="qb-task-copy"><span class="qb-task-kind">${esc(KINDS[task.tipo] || "Estudo")}</span><strong>${title}</strong>
        <span class="qb-task-line">${details.join(" · ") || "Sem horário fixo"}</span>
        ${trailResources(S, task)}
        ${status === "executando" ? `<span class="qb-task-live">Em execução <b data-plan-timer="${esc(task.id)}">${clock(seconds(task))}</b></span>` : ""}
        ${status === "pausada" ? `<span class="qb-task-line">Pausada · ${clock(seconds(task))} registrado(s)</span>` : ""}
        ${done(task) ? `<span class="qb-task-finished">Concluída${task.concluidaEm ? ` · ${short(task.concluidaEm.slice(0, 10))}` : ""}</span>` : ""}
      </div>
      <div class="qb-task-controls">
        <button class="qb-task-check" type="button" data-plan-action="${done(task) ? "reopen" : "complete"}" data-plan-id="${esc(task.id)}" aria-label="${done(task) ? "Reabrir" : "Concluir"} ${title}" title="${done(task) ? "Reabrir" : "Marcar concluída"}">${done(task) ? "✓" : "○"}</button>
        ${!done(task) ? `<button type="button" data-plan-action="${status === "executando" ? "pause" : "start"}" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="${status === "executando" ? "Pausar" : "Iniciar"}">${status === "executando" ? "Ⅱ" : "▶"}</button>` : ""}
        <button type="button" data-plan-action="edit" data-plan-id="${esc(task.id)}" class="qb-task-icon" title="Editar atividade">✎</button>
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

  function form(S) {
    if (!S.planFormOpen) return "";
    const old = S.pl.find(x => x.id === S.planEditing) || null;
    const date = old?.data || S.planSelectedDay;
    const materias = [...new Set([...S.ed.values()].map(x => x.materia).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    return `<form class="qb-plan-form" id="qb-plan-form">
      <div class="qb-plan-form-title"><h3>${old ? "Editar atividade" : "Nova atividade"}</h3><button type="button" data-plan-action="cancel" class="qb-task-icon" title="Fechar formulário">✕</button></div>
      <div class="qb-form-grid">
        <label class="qb-span-two">O que vai estudar?<input id="qb-p-title" name="titulo" required maxlength="180" placeholder="Ex.: Revisar atos administrativos" value="${esc(old?.titulo || "")}"></label>
        <label>Tipo de atividade<select name="tipo" id="qb-p-kind">${Object.entries(KINDS).map(([id, name]) => `<option value="${id}" ${id === (old?.tipo || "estudo") ? "selected" : ""}>${name}</option>`).join("")}</select></label>
        <label>Dia<input type="date" name="data" id="qb-p-date" required value="${esc(date)}"></label>
        <label>Horário (opcional)<input type="time" name="horario" id="qb-p-time" value="${esc(old?.horario || "")}"></label>
        <label>Tempo previsto (minutos)<input type="number" name="minutos" id="qb-p-duration" min="5" max="720" step="5" value="${Number(old?.minutos || 60)}"></label>
        <label class="qb-span-two">Disciplina<input name="materia" id="qb-p-mat" list="qb-plan-materias" placeholder="Escolha ou digite uma disciplina" maxlength="120" value="${esc(old?.materia || "")}"><datalist id="qb-plan-materias">${materias.map(n => `<option value="${esc(n)}"></option>`).join("")}</datalist></label>
        <label class="qb-span-two">Observações (opcional)<textarea id="qb-p-notes" name="notas" rows="2" maxlength="1400" placeholder="Assunto, meta de questões ou material">${esc(old?.notas || "")}</textarea></label>
      </div>
      <div class="qb-form-actions"><button type="submit" class="btn">${old ? "Salvar alterações" : "Adicionar ao planejamento"}</button>${old ? `<button type="button" class="btn ghost" data-plan-action="archive" data-plan-id="${esc(old.id)}">Arquivar atividade</button>` : ""}<button type="button" class="btn ghost" data-plan-action="cancel">Cancelar</button></div>
    </form>`;
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
          <p>${trails.length ? "Siga a numeração das tarefas. Abra os mapas, revise com flashcards e faça a revisão de erros ao final de cada trilha." : "Planeje, execute e acompanhe suas tarefas, revisões e simulados. Um dia de cada vez, com toda a semana à vista."}</p>
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
      <div class="qb-plan-summary">
        <div class="qb-plan-kpi"><b>${completed}<span>/${total}</span></b><small>tarefas concluídas</small></div>
        <div class="qb-plan-kpi"><b>${percent}%</b><small>conclusão semanal</small><div class="qb-plan-progress"><i style="width:${percent}%"></i></div></div>
        <div class="qb-plan-kpi"><b>${hours(plannedMinutes)}</b><small>tempo planejado</small></div>
        <div class="qb-plan-kpi"><b>${hours(usedMinutes)}</b><small>tempo registrado${outstanding ? ` · ${outstanding} em atraso` : ""}</small></div>
      </div>
      ${window.QBInsights ? window.QBInsights.compact(S, S.planSelectedDay) : ""}
      <section class="qb-week-calendar" aria-label="Calendário de estudos da semana"><div class="qb-calendar-scroll"><div class="qb-week-grid">${days.map(d => dayColumn(S, d, today, due)).join("")}</div></div></section>
      ${backlog.length ? `<details class="qb-plan-overdue"><summary><strong>${backlog.length} atividades pendentes de semanas anteriores</strong><span>Abra para reprogramar ou concluir</span></summary><div class="qb-plan-overdue-list">${backlog.map(t => `<div><div><strong>${esc(t.titulo)}</strong><small>${short(t.data)} · ${esc(KINDS[t.tipo] || "Estudo")}${t.materia ? ` · ${esc(t.materia)}` : ""}</small></div><button type="button" class="btn ghost small" data-plan-action="move" data-plan-id="${esc(t.id)}">Mover para ${short(S.planSelectedDay)}</button></div>`).join("")}</div></details>` : ""}
      <div class="qb-plan-bottom">
        <section class="qb-plan-day-detail"><div class="qb-plan-panel-head"><div><span class="qb-plan-eyebrow">EXECUÇÃO DO DIA</span><h3>${esc(DAY_LABELS[parseDay(S.planSelectedDay).getDay()])}, ${short(S.planSelectedDay)} ${S.planSelectedDay === today ? '<span class="qb-today-pill">Hoje</span>' : ""}</h3></div><button type="button" class="btn ghost small" data-plan-action="new">Adicionar</button></div>
          ${selected.length ? `<div class="qb-plan-task-list">${selected.map(t => taskCard(S, t)).join("")}</div>` : `<div class="qb-plan-empty"><strong>Nenhuma atividade manual planejada.</strong><span>Adicione um estudo, revisão, simulado ou meta de questões para este dia.</span></div>`}
          <div class="qb-auto-reviews"><div><strong>Revisões automáticas</strong><p>Geradas pelas respostas e avaliações anteriores. Não são alteradas ao reorganizar as tarefas.</p></div><div class="qb-auto-counts"><span>${due.questoes.get(S.planSelectedDay) || 0} questões</span><span>${due.cartoes.get(S.planSelectedDay) || 0} cartões</span></div>
            ${S.planSelectedDay === today && selectedAuto ? `<div class="qb-auto-actions"><button type="button" class="btn small" data-plan-auto="questoes" ${due.questoes.get(today) ? "" : "disabled"}>Revisar questões</button><button type="button" class="btn ghost small" data-plan-auto="cartoes" ${due.cartoes.get(today) ? "" : "disabled"}>Revisar flashcards</button></div>` : ""}
          </div>
        </section>
        <aside class="qb-plan-side"><section class="qb-plan-tips"><h3>Tipos de atividade</h3><div class="qb-plan-legend">${Object.entries(KINDS).map(([id, name]) => `<span><i class="qb-kind-dot qb-kind-${id}"></i>${esc(name)}</span>`).join("")}</div><p>Marque as tarefas concluídas, inicie uma sessão para contar o tempo ou edite o dia de execução quando necessário.</p></section>
        </aside>
      </div>
      ${form(S)}
      <p class="qb-plan-footnote">O planejamento manual é independente do algoritmo de revisão espaçada. Marcar uma tarefa como concluída não altera gabaritos, respostas, cartões ou status dos tópicos do edital.</p>
    </div>`;
  }

  function wire(S, callbacks) {
    initialize(S);
    const today = callbacks.hoje();
    const rerender = () => callbacks.render(true);
    const getTask = id => S.pl.find(t => t.id === id);
    const persist = task => {
      if (!S.db) { callbacks.toast("Conexão com o banco indisponível."); return; }
      S.pl = [...S.pl.filter(x => x.id !== task.id), task];
      callbacks.enqueue(() => S.db.doc("planejamento/" + task.id).set(task));
      rerender();
    };
    const openForm = (old = null) => { S.planEditing = old?.id || null; S.planFormOpen = true; rerender(); setTimeout(() => { document.getElementById("qb-plan-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); document.getElementById("qb-p-title")?.focus({ preventScroll: true }); }, 0); };
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
      if (act === "new") return openForm();
      if (act === "cancel") { S.planFormOpen = false; S.planEditing = null; return rerender(); }
      if (!task) return;
      if (act === "edit") return openForm(task);
      if (act === "archive") {
        if (!confirm("Arquivar esta atividade? Ela desaparecerá do calendário, mas o registro será preservado.")) return;
        S.planFormOpen = false; S.planEditing = null;
        return persist({ ...task, arquivada: true, atualizadoEm: new Date().toISOString() });
      }
      const now = new Date().toISOString();
      const pausedSeconds = seconds(task);
      if (act === "start") {
        const other = S.pl.find(t => !archived(t) && t.status === "executando" && t.id !== task.id);
        if (other) { callbacks.toast("Pause a atividade em andamento antes de iniciar outra."); return; }
        persist({ ...task, status: "executando", iniciadoEm: now, concluidaEm: null, atualizadoEm: now });
      } else if (act === "pause") {
        persist({ ...task, status: "pausada", segundos: pausedSeconds, iniciadoEm: null, atualizadoEm: now });
      } else if (act === "complete") {
        persist({ ...task, status: "concluida", segundos: pausedSeconds, iniciadoEm: null, concluidaEm: now, atualizadoEm: now });
      } else if (act === "reopen") {
        persist({ ...task, status: "planejada", iniciadoEm: null, concluidaEm: null, atualizadoEm: now });
      } else if (act === "move") {
        persist({ ...task, data: S.planSelectedDay, status: task.status === "executando" ? "executando" : "planejada", atualizadoEm: now });
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
      if (titulo.length < 3 || titulo.length > 180 || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !KINDS[tipo] || !Number.isInteger(minutos) || minutos < 5 || minutos > 720) {
        callbacks.toast("Confira o título, o dia, o tipo e a duração da atividade."); return;
      }
      const now = new Date().toISOString();
      const old = getTask(S.planEditing);
      const next = {
        ...old, id: old?.id || `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
        titulo, tipo, data, horario: String(fd.get("horario") || ""), minutos,
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
  window.QBPlanner = { render, wire };
})();
