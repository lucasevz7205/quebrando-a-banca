/* Interface de criação de rotinas e ciclos, ligada ao calendário semanal privado. */
(() => {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, x => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[x]));
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const configId = "rotina-ciclos-v1";
  const engine = () => window.QBStudyCycles;
  const getConfig = S => S.cfg?.get(configId) || null;
  const hr = m => (Math.round((Number(m) || 0) / 60 * 100) / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const selectedTopics = S => engine().availableSubjects([...S.ed.values()]);

  function render(S) {
    const cfg = getConfig(S);
    const topics = selectedTopics(S);
    const names = [...topics.keys()].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const progress = engine().weekProgress(S.pl, S.planWeekStart);
    const activeSubjects = cfg?.subjects?.filter(m => topics.has(m)) || [];
    const open = S.cycleFormOpen ?? !cfg;
    const initialDays = Array.isArray(cfg?.dayMinutes) && cfg.dayMinutes.length === 7
      ? cfg.dayMinutes : Array(7).fill(0);
    const previous = engine().weekProgress(S.pl, engine().shift(S.planWeekStart, -7));
    return `<section class="qb-cycle-panel" aria-label="Ciclos de estudo por disponibilidade">
      <div class="qb-cycle-header"><div><span class="qb-plan-eyebrow">CICLO INTELIGENTE · ROTINA SEMANAL</span>
        <h3>Ciclos de estudo por disciplina</h3>
        <p>Escolha quantas matérias do seu edital entram no ciclo e informe quantas horas tem em cada dia. O motor distribui os assuntos em rodízio, sem ultrapassar sua disponibilidade.</p>
      </div><button class="btn ghost small" type="button" data-cycle-action="toggle" aria-expanded="${open}">${open ? "Fechar configuração" : cfg ? "Editar rotina" : "Configurar rotina"}</button></div>
      ${cfg ? `<div class="qb-cycle-metrics">
        <span><b>${activeSubjects.length}</b> matérias escolhidas</span>
        <span><b>${hr(cfg.dayMinutes.reduce((a,b)=>a+b,0))}h</b> disponíveis por semana</span>
        <span><b>${cfg.cycleMinutes}min</b> por bloco</span>
        <span><b>${progress.done}/${progress.sessions}</b> ciclos concluídos nesta semana</span>
      </div>` : ""}
      ${open ? `<form id="qb-cycle-config" class="qb-cycle-form">
        <div class="qb-cycle-subhead"><h4>1. Disponibilidade diária</h4><small>Horas reais disponíveis, incluindo as pausas entre blocos. Use 0 nos dias de descanso.</small></div>
        <div class="qb-cycle-days">${days.map((d,i) => `<label>${esc(d)}<input aria-label="Horas disponíveis na ${esc(d.toLowerCase())}" name="day-${i}" type="number" min="0" max="16" step=".25" required value="${initialDays[i]/60}"><small>horas</small></label>`).join("")}</div>
        <div class="qb-cycle-subhead"><h4>2. Matérias do seu edital</h4><small>Marque apenas as que deseja estudar neste ciclo. Cada matéria selecionada participa do rodízio.</small></div>
        ${names.length ? `<fieldset class="qb-cycle-subjects"><legend>Disciplinas disponíveis (${names.length})</legend>
          ${names.map(name => `<label><input type="checkbox" name="cycle-subject" value="${esc(name)}" ${activeSubjects.includes(name) ? "checked" : ""}><span>${esc(name)}</span><small>${topics.get(name).length} tópicos</small></label>`).join("")}
        </fieldset>` : '<div class="notice">Este ambiente ainda não possui disciplinas cadastradas no edital. Importe o edital do aluno para habilitar a seleção.</div>'}
        <div class="qb-cycle-options">
          <label>Duração do bloco<select name="cycleMinutes">${[25,40,50,60,90].map(n => `<option value="${n}" ${n === (cfg?.cycleMinutes || 50) ? "selected" : ""}>${n} minutos</option>`).join("")}</select></label>
          <label>Pausa entre blocos<select name="breakMinutes">${[0,5,10,15].map(n => `<option value="${n}" ${n === (cfg?.breakMinutes ?? 10) ? "selected" : ""}>${n} minutos</option>`).join("")}</select></label>
        </div>
        <button class="btn" type="submit" ${!S.cfgLoaded || !names.length ? "disabled" : ""}>Salvar rotina de estudo</button>
      </form>` : ""}
      ${cfg ? `<div class="qb-cycle-go"><p><b>Progressão semanal:</b> a primeira semana começa em 80% das horas disponíveis; as seguintes usam 80%, 90% ou 100%, conforme a conclusão dos ciclos anteriores. Revisões automáticas permanecem independentes. ${previous.sessions ? `Na semana anterior: ${previous.percent}% concluídos.` : ""}</p>
        <button type="button" class="btn" data-cycle-action="generate" ${!activeSubjects.length || !S.plLoaded || !S.edLoaded ? "disabled" : ""}>Gerar ciclos da semana selecionada</button>
        ${progress.sessions ? `<button type="button" class="btn ghost" data-cycle-action="regenerate" ${!activeSubjects.length || !S.plLoaded || !S.edLoaded ? "disabled" : ""} title="Arquiva os blocos ainda não feitos desta semana e redistribui conforme a rotina atual, a partir de hoje">Refazer blocos pendentes com a rotina atual</button>` : ""}</div>` : ""}
      ${progress.sessions ? `<div class="qb-cycle-progress"><h4>Progressão por disciplina nesta semana</h4>
        ${Object.entries(progress.bySubject).sort(([a],[b])=>a.localeCompare(b,"pt-BR")).map(([name,stats]) => {
          const pct = stats.planned ? Math.round(stats.completed / stats.planned * 100) : 0;
          return `<div class="qb-cycle-progress-row"><span>${esc(name)}</span><div class="qb-cycle-track"><i style="width:${pct}%"></i></div><small>${stats.done}/${stats.sessions} blocos · ${pct}%</small></div>`;
        }).join("")}
      </div>` : ""}
      <p class="qb-cycle-note">O gerador nunca substitui atividades manuais nem duplica ciclos de uma semana já gerada. Assuntos e tempo registrado pertencem exclusivamente a este ambiente de estudo.</p>
    </section>`;
  }

  function wire(S, callbacks) {
    const rerender = () => callbacks.render(true);
    document.querySelector('[data-cycle-action="toggle"]')?.addEventListener("click", () => {
      S.cycleFormOpen = !(S.cycleFormOpen ?? !getConfig(S));
      rerender();
    });
    document.getElementById("qb-cycle-config")?.addEventListener("submit", event => {
      event.preventDefault();
      if (!S.db || !S.cfgLoaded) return callbacks.toast("Aguarde o carregamento da configuração.");
      const form = event.currentTarget, fd = new FormData(form);
      const mins = days.map((_, i) => Math.round(Number(fd.get("day-" + i)) * 60));
      const subjects = [...form.querySelectorAll('[name="cycle-subject"]:checked')].map(e => e.value);
      try {
        const valid = engine().normalize({ dayMinutes: mins, subjects, cycleMinutes: Number(fd.get("cycleMinutes")), breakMinutes: Number(fd.get("breakMinutes")) });
        const validSubjects = selectedTopics(S);
        if (subjects.some(subject => !validSubjects.has(subject))) throw new Error("Uma matéria selecionada não está presente no edital.");
        const payload = { ...valid, updatedAt: new Date().toISOString() };
        S.cfg.set(configId, payload);
        S.cycleFormOpen = false;
        callbacks.enqueue(() => S.db.doc("config/" + configId).set(payload));
        callbacks.toast("Rotina salva. Agora gere os ciclos para a semana desejada.");
        rerender();
      } catch (err) { callbacks.toast(err?.message || "Rotina inválida."); }
    });
    document.querySelector('[data-cycle-action="generate"]')?.addEventListener("click", () => {
      if (!S.db || !S.plLoaded || !S.edLoaded) return callbacks.toast("Aguarde a agenda e o edital carregarem.");
      const cfg = getConfig(S);
      if (!cfg) return callbacks.toast("Salve sua rotina antes de gerar ciclos.");
      try {
        const plan = engine().generate({
          config: cfg, start: S.planWeekStart, edital: [...S.ed.values()], existing: S.pl, today: callbacks.hoje()
        });
        S.pl = [...S.pl, ...plan.tasks];
        for (const task of plan.tasks) callbacks.enqueue(() => S.db.doc("planejamento/" + task.id).set(task));
        callbacks.toast(plan.tasks.length + " blocos distribuídos em " + plan.subjects + " matérias. Carga: " + Math.round(plan.intensity * 100) + "% da disponibilidade.");
        rerender();
      } catch (err) { callbacks.toast(err?.message || "Não foi possível gerar o ciclo."); }
    });
    document.querySelector('[data-cycle-action="regenerate"]')?.addEventListener("click", () => {
      if (!S.db || !S.plLoaded || !S.edLoaded) return callbacks.toast("Aguarde a agenda e o edital carregarem.");
      const cfg = getConfig(S);
      if (!cfg) return callbacks.toast("Salve sua rotina antes de refazer os ciclos.");
      if (!confirm("Refazer os blocos ainda não feitos desta semana com a rotina atual? Blocos concluídos e o tempo registrado são mantidos; os pendentes ficam arquivados.")) return;
      try {
        const today = callbacks.hoje();
        const start = S.planWeekStart, end = engine().shift(start, 7);
        const plan = engine().generate({
          config: cfg, start, edital: [...S.ed.values()], existing: S.pl, today, replacePending: true
        });
        const now = new Date().toISOString();
        const stale = S.pl.filter(t => t.cicloEstudo === true && !t.arquivada && t.data >= start && t.data < end &&
          t.status !== "concluida" && t.status !== "executando").map(t => ({ ...t, arquivada: true, atualizadoEm: now }));
        const staleIds = new Set(stale.map(t => t.id));
        S.pl = [...S.pl.filter(t => !staleIds.has(t.id)), ...stale, ...plan.tasks];
        for (const task of [...stale, ...plan.tasks]) callbacks.enqueue(() => S.db.doc("planejamento/" + task.id).set(task));
        callbacks.toast(stale.length + " blocos pendentes arquivados; " + plan.tasks.length + " novos blocos distribuídos.");
        rerender();
      } catch (err) { callbacks.toast(err?.message || "Não foi possível refazer o ciclo."); }
    });
  }
  window.QBStudyCycleUI = { render, wire };
})();
