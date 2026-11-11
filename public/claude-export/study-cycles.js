/* Motor de ciclos pessoais do Quebrando a Banca.
 * Todas as entradas vêm do edital da conta atual e da agenda privada.
 * Não atualiza questões, respostas, revisões ou dados de outras contas.
 */
(function (root) {
  "use strict";
  const pad = n => String(n).padStart(2, "0");
  const fromDay = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d, 12); };
  const day = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const shift = (date, n) => { const d = fromDay(date); d.setDate(d.getDate() + n); return day(d); };
  const weekStart = date => { const d = fromDay(date); d.setDate(d.getDate() - d.getDay()); return day(d); };
  const taskMinutes = task => Math.max(0, Number(task?.minutos) || 0);
  const isCycle = task => task?.cicloEstudo === true && task.arquivada !== true;
  const finished = task => task?.status === "concluida";
  const unique = items => [...new Set(items)];

  function normalize(config) {
    const dayMinutes = Array.isArray(config?.dayMinutes) ? config.dayMinutes : [];
    if (dayMinutes.length !== 7 || dayMinutes.some(n => !Number.isInteger(n) || n < 0 || n > 960 || n % 15 !== 0)) {
      throw new Error("Informe horas válidas de domingo a sábado (incrementos de 15 minutos; máximo 16h por dia).");
    }
    const subjects = Array.isArray(config?.subjects) ? unique(config.subjects.map(String).map(s => s.trim()).filter(Boolean)) : [];
    if (subjects.length < 1 || subjects.length > 30 || subjects.some(s => s.length > 120)) {
      throw new Error("Selecione entre 1 e 30 disciplinas do seu edital.");
    }
    if (!dayMinutes.some(Boolean)) throw new Error("Informe algum horário disponível na semana.");
    const cycleMinutes = Number(config?.cycleMinutes);
    const breakMinutes = Number(config?.breakMinutes);
    if (![25, 40, 50, 60, 90].includes(cycleMinutes) || ![0, 5, 10, 15].includes(breakMinutes)) {
      throw new Error("Escolha uma duração de ciclo e uma pausa permitidas.");
    }
    return { id: "rotina-ciclos-v1", type: "rotina-ciclos", dayMinutes, subjects, cycleMinutes, breakMinutes };
  }

  function weekProgress(tasks, start) {
    const end = shift(start, 7);
    const relevant = tasks.filter(t => t.data >= start && t.data < end && !t.arquivada);
    const cycles = relevant.filter(isCycle);
    const total = cycles.reduce((n, t) => n + taskMinutes(t), 0);
    const completed = cycles.filter(finished);
    const doneMinutes = completed.reduce((n, t) => n + taskMinutes(t), 0);
    const bySubject = {};
    for (const t of cycles) {
      const name = t.materia || "Sem disciplina";
      const p = bySubject[name] || (bySubject[name] = { planned: 0, completed: 0, sessions: 0, done: 0 });
      p.planned += taskMinutes(t); p.sessions++;
      if (finished(t)) { p.completed += taskMinutes(t); p.done++; }
    }
    return { total, doneMinutes, percent: total ? Math.round(100 * doneMinutes / total) : 0, sessions: cycles.length,
      done: completed.length, bySubject, allTasks: relevant.length };
  }

  function availableSubjects(edital) {
    const out = new Map();
    for (const t of edital || []) {
      if (!t || !t.materia || !t.id) continue;
      const materia = String(t.materia).trim();
      if (!out.has(materia)) out.set(materia, []);
      out.get(materia).push(t);
    }
    for (const arr of out.values()) arr.sort((a, b) =>
      (Number(a.ordem) || 0) - (Number(b.ordem) || 0) ||
      String(a.num || a.id).localeCompare(String(b.num || b.id), "pt-BR", { numeric: true }));
    return out;
  }

  function generate({ config, start, edital = [], existing = [], today }) {
    const c = normalize(config);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || weekStart(start) !== start || !Number.isFinite(fromDay(start).getTime()) || day(fromDay(start)) !== start)
      throw new Error("A semana precisa começar no domingo.");
    if (today && start < weekStart(today)) throw new Error("Não é possível gerar ciclos retroativos.");
    const topics = availableSubjects(edital);
    const missing = c.subjects.filter(s => !topics.has(s));
    if (missing.length) throw new Error("Disciplina ausente do edital desta conta: " + missing.join(", "));
    if (existing.some(t => isCycle(t) && t.data >= start && t.data < shift(start, 7)))
      throw new Error("Esta semana já possui ciclos gerados. Edite ou conclua os blocos existentes.");

    const oldCycles = existing.filter(t => isCycle(t) && t.data < start).sort((a, b) =>
      a.data.localeCompare(b.data) || Number(a.cicloOrdem || 0) - Number(b.cicloOrdem || 0));
    const weeks = unique(oldCycles.map(t => t.cicloSemana).filter(Boolean)).sort();
    const prevWeek = weeks[weeks.length - 1];
    const prev = prevWeek ? weekProgress(existing, prevWeek) : null;
    // Aumenta gradualmente a ocupação da agenda, sem exceder as horas declaradas.
    // Baixa execução retém uma carga conservadora; a revisão é humana, não punitiva.
    const intensity = !prev ? 0.8 : prev.percent < 60 ? 0.8 : prev.percent < 85 ? 0.9 : 1;
    const nextTopic = new Map();
    for (const subject of c.subjects) {
      const used = oldCycles.filter(t => t.materia === subject).length;
      nextTopic.set(subject, used);
    }
    let cursor = oldCycles.length % c.subjects.length;
    let order = oldCycles.length;
    const createdAt = new Date().toISOString();
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = shift(start, i);
      const busy = existing.filter(t => !t.arquivada && t.data === date).reduce((n, t) => n + taskMinutes(t), 0);
      let remaining = Math.max(0, Math.round(c.dayMinutes[i] * intensity) - busy);
      let count = 0;
      while (remaining >= 15 && count < 32) {
        const allocated = Math.min(c.cycleMinutes, remaining);
        if (allocated < 15) break;
        const subject = c.subjects[cursor % c.subjects.length];
        const arr = topics.get(subject);
        const index = nextTopic.get(subject);
        const topic = arr[index % arr.length];
        nextTopic.set(subject, index + 1);
        cursor++; order++; count++;
        result.push({
          id: "ciclo-" + start + "-" + String(order).padStart(4, "0"),
          data: date, titulo: "Ciclo: " + String(topic.titulo || subject).slice(0, 140),
          materia: subject, tipo: "estudo", minutos: allocated, horario: "",
          topico: String(topic.id), capitulo: topic.caps?.[0] || "",
          ...(typeof topic.trilha === "string" ? { trilha: topic.trilha } : {}),
          notas: "Ciclo rotativo do edital · bloco " + count + " · semana " + start,
          status: "planejada", segundos: 0, cicloEstudo: true,
          cicloSemana: start, cicloOrdem: order, criadoEm: createdAt, atualizadoEm: createdAt
        });
        remaining -= allocated;
        if (remaining <= c.breakMinutes + 14) break;
        remaining -= c.breakMinutes;
      }
    }
    if (!result.length) throw new Error("A disponibilidade informada não comporta blocos de estudo nesta semana.");
    const goalMinutes = c.dayMinutes.reduce((n, m) => n + m, 0);
    return { tasks: result, intensity, goalMinutes, plannedMinutes: result.reduce((n, t) => n + t.minutos, 0),
      subjects: c.subjects.length, previousPercent: prev?.percent ?? null };
  }

  root.QBStudyCycles = Object.freeze({ normalize, generate, weekProgress, availableSubjects, weekStart, shift });
})(typeof window !== "undefined" ? window : globalThis);
