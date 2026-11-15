// Calculated metrics for Desempenho — pure functions over the answer log. Mirrors docs/DESEMPENHO-V4.md (PerformanceService).
// Scope = { from, to, subjectId | 'all', topicId | 'all' } with ISO dates. Presentation never computes metrics on its own.
(() => {
  const E = window.QB_EDITAL, P = window.QB_PLAN, PF = window.QB_PERF, NAV = window.QB_NAV;
  const RULES = { chartMinSample: 10, tableMinSample: 20, lowAccuracy: 60, recurringErrors: 5, recurringDays: 2 };
  const WD = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'], MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const addDays = P.addDays;
  const fmt = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
  const fmtFull = iso => fmt(iso) + '/' + iso.slice(0, 4);
  const fmtLong = iso => WD[new Date(iso + 'T12:00:00Z').getUTCDay()] + ', ' + fmtFull(iso);
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const bounds = { min: PF.days[0].date, max: P.today };
  const sum = rows => { const a = { correct: 0, wrong: 0, blank: 0 }; rows.forEach(r => { a.correct += r.correct; a.wrong += r.wrong; a.blank += r.blank || 0; }); a.valid = a.correct + a.wrong; a.n = a.valid + a.blank; a.accuracy = a.valid ? (a.correct / a.valid) * 100 : null; a.net = a.correct - a.wrong; return a; };
  const inScope = (sc, r) => (sc.subjectId === 'all' || r.subjectId === sc.subjectId) && (sc.topicId === 'all' || r.topicId === sc.topicId);
  const rows = sc => PF.log.filter(r => r.date >= sc.from && r.date <= sc.to && inScope(sc, r));
  const length = sc => Math.round((Date.parse(sc.to) - Date.parse(sc.from)) / 864e5) + 1;
  // Equal-length period immediately before; null when it would start before the first record (no base → no comparison).
  const previousScope = sc => { const from = addDays(sc.from, -length(sc)); return from < bounds.min ? null : { ...sc, from, to: addDays(sc.from, -1) }; };
  const bucketKey = (iso, g) => g === 'day' ? iso : g === 'month' ? iso.slice(0, 7) : addDays(iso, -new Date(iso + 'T12:00:00Z').getUTCDay());
  function series(sc, g) {
    const out = [], map = {};
    for (let d = sc.from; d <= sc.to; d = addDays(d, 1)) { const k = bucketKey(d, g); if (!map[k]) { map[k] = { key: k, from: d, to: d, rows: [] }; out.push(map[k]); } map[k].to = d; }
    rows(sc).forEach(r => map[bucketKey(r.date, g)].rows.push(r));
    return out.map(b => ({ key: b.key, label: g === 'day' ? fmt(b.from) : g === 'month' ? MON[+b.key.slice(5) - 1] + '/' + b.key.slice(2, 4) : fmt(b.from) + '–' + fmt(b.to), longLabel: g === 'day' ? fmtLong(b.from) : fmtFull(b.from) + ' a ' + fmtFull(b.to), ...sum(b.rows) }));
  }
  const actionsFor = (subjectId, topicId) => ['train', 'mindmap', 'review', 'architect'].filter(a => NAV.resolve({ action: a, subjectId, topicId }).ok);
  const groupOf = num => { const m = /^(\d+)/.exec(num); return m ? m[1] : num; };
  function tree(sc) {
    const by = {}; rows(sc).forEach(r => (by[r.topicId] = by[r.topicId] || []).push(r));
    return E.subjects.filter(s => sc.subjectId === 'all' || s.id === sc.subjectId).map(s => {
      const topics = s.topics.filter(t => sc.topicId === 'all' || t.id === sc.topicId).map(t => ({ id: t.id, level: 'topic', code: t.num, name: t.title || 'Título não disponível nos arquivos', untitled: !t.title, subjectId: s.id, topicId: t.id, actions: actionsFor(s.id, t.id), ...sum(by[t.id] || []) }));
      const groups = [], gm = {};
      topics.forEach(t => { const g = groupOf(t.code); if (!gm[g]) { gm[g] = { key: g, items: [] }; groups.push(gm[g]); } gm[g].items.push(t); });
      const children = groups.map(g => g.items.length === 1 ? g.items[0] : { id: s.id + ':' + g.key, level: 'group', code: g.key, name: E.groupTitles[s.id + ':' + g.key] || 'Título não disponível nos arquivos', untitled: !E.groupTitles[s.id + ':' + g.key], subjectId: s.id, children: g.items, ...sum(g.items) });
      return { id: s.id, level: 'subject', name: s.name, code: s.short, icon: s.icon, subjectId: s.id, children, ...sum(topics) };
    });
  }
  const allTasks = Object.values(P.weeks).flat();
  const taskInScope = (sc, t) => (sc.subjectId === 'all' || t.subjectId === sc.subjectId) && (sc.topicId === 'all' || t.subjectId + '-' + t.topicNum === sc.topicId);
  const tasks = sc => allTasks.filter(t => t.date >= sc.from && t.date <= sc.to && taskInScope(sc, t));
  // Demo has flashcard evaluations only for today's DC 2a deck.
  const flashcards = sc => sc.from <= P.today && sc.to >= P.today && (sc.subjectId === 'all' || sc.subjectId === 'dc') && (sc.topicId === 'all' || sc.topicId === window.QB_LINKS.flashcardTopic) ? PF.today.flashcards : null;
  const answers = sc => PF.answers.filter(a => a.date >= sc.from && a.date <= sc.to && inScope(sc, a));
  function priorities(sc) {
    const out = [], by = {};
    rows(sc).forEach(r => { const a = by[r.topicId] = by[r.topicId] || { subjectId: r.subjectId, topicId: r.topicId, rows: [], errDays: 0 }; a.rows.push(r); if (r.wrong) a.errDays++; });
    const T = Object.values(by).map(a => ({ ...a, ...sum(a.rows), label: NAV.topicLabel(a.subjectId, a.topicId) }));
    const act = t => NAV.resolve({ action: 'train', subjectId: t.subjectId, topicId: t.topicId }).ok
      ? { label: 'Treinar erros', icon: 'target', intent: { action: 'train', subjectId: t.subjectId, topicId: t.topicId } }
      : { label: 'Abrir assunto', icon: 'chevrons-down', open: { subjectId: t.subjectId, topicId: t.topicId } };
    const rec = T.filter(t => t.errDays >= RULES.recurringDays && t.wrong >= RULES.recurringErrors).sort((a, b) => b.wrong - a.wrong).slice(0, 2);
    rec.forEach(t => out.push({ id: 'rec-' + t.topicId, kind: 'Erros recorrentes', tone: 'incorrect', title: t.label, reason: plural(t.wrong, 'erro', 'erros') + ' em ' + plural(t.errDays, 'dia', 'dias') + ' do período · ' + t.correct + ' de ' + plural(t.valid, 'resposta válida correta', 'respostas válidas corretas'), action: act(t) }));
    T.filter(t => t.valid >= RULES.tableMinSample && t.accuracy < RULES.lowAccuracy && !rec.includes(t)).sort((a, b) => a.accuracy - b.accuracy).slice(0, 2)
      .forEach(t => out.push({ id: 'low-' + t.topicId, kind: 'Baixa precisão', tone: 'incorrect', title: t.label, reason: Math.round(t.accuracy) + '% de acerto em ' + plural(t.valid, 'resposta válida', 'respostas válidas') + ' (amostra mínima: ' + RULES.tableMinSample + ')', action: act(t) }));
    const late = allTasks.filter(t => t.status === 'late' && t.date <= sc.to && taskInScope(sc, t));
    if (late.length) out.push({ id: 'late', kind: 'Pendências vencidas', tone: 'attention', title: plural(late.length, 'tarefa vencida', 'tarefas vencidas'), reason: (late.length === 1 ? 'Planejada' : 'Planejadas') + ' até ' + fmt(sc.to) + ' e não ' + (late.length === 1 ? 'concluída' : 'concluídas') + ' · ' + plural(new Set(late.map(t => t.subjectId)).size, 'matéria', 'matérias'), action: { label: 'Reorganizar planejamento', icon: 'calendar-clock', go: ['plan', 'semana'] } });
    const rev = allTasks.filter(t => t.type === 'revisao' && t.status === 'pending' && t.date === sc.to && taskInScope(sc, t));
    if (rev.length) { const auto = rev.filter(t => t.auto).length; out.push({ id: 'rev', kind: 'Revisões necessárias', tone: 'gold', title: plural(rev.length, 'revisão agendada', 'revisões agendadas') + ' para ' + fmt(sc.to), reason: 'Ainda não ' + (rev.length === 1 ? 'concluída' : 'concluídas') + ' no planejamento' + (auto ? ' · ' + plural(auto, 'gerada automaticamente', 'geradas automaticamente') : ''), action: { label: 'Abrir planejamento do dia', icon: 'calendar', go: ['plan', 'hoje'] } }); }
    return out;
  }
  window.QB_PERF_CALC = { RULES, bounds, addDays, fmt, fmtFull, fmtLong, plural, sum, rows, length, previousScope, series, tree, tasks, flashcards, answers, priorities };
})();
