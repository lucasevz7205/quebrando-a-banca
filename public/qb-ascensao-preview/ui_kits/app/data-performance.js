// DEMO answer log — fictitious. Splits each topic's accumulated totals (data-edital.js) across the 14 demo days so the daily, subject and topic views agree.
// In production this is replaced by the student's real answer records (Base44); nothing here is written back.
(() => {
  const E = window.QB_EDITAL, P = window.QB_PLAN, PF = window.QB_PERF, D = window.QB_DATA;
  let seed = 11;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const dates = PF.days.map(d => d.date), TODAY = P.today;
  const W = [1, 0, 1.4, 1.9, 0.15, 2.2, 1.5, 1.7, 0, 2, 2.3, 1.8, 2.5, 3.8], sumW = W.reduce((a, b) => a + b, 0); // two days without any record
  const pick = () => { let r = rnd() * sumW; for (let i = 0; i < W.length; i++) { if (!W[i]) continue; r -= W[i]; if (r <= 0) return i; } return W.length - 1; };
  const log = [];
  const split = (s, t, c, w, b, exclude) => {
    if (c + w + b <= 0) return;
    const k = Math.max(1, Math.min(4, Math.round((c + w) / 14))), set = new Set(); let guard = 0;
    while (set.size < k && guard++ < 80) { const i = pick(); if (dates[i] !== exclude) set.add(i); }
    const ds = [...set].sort((x, y) => x - y);
    ds.forEach((di, j) => {
      const cc = Math.floor(c / ds.length) + (j === 0 ? c % ds.length : 0), ww = Math.floor(w / ds.length) + (j === ds.length - 1 ? w % ds.length : 0), bb = j === 0 ? b : 0;
      if (cc + ww + bb) log.push({ date: dates[di], subjectId: s.id, topicId: t.id, correct: cc, wrong: ww, blank: bb });
    });
  };
  E.subjects.forEach(s => s.topics.forEach(t => {
    if (t.id !== 'dc-2a') return split(s, t, t.correct, t.wrong, t.blank);
    // The only topic with demo questions: today's 5 identified answers (3 certos, 2 errados) are part of its totals.
    t.correct = Math.max(t.correct, 3); t.wrong = Math.max(t.wrong, 2); if (t.status === 'not-started') t.status = 'studying';
    log.push({ date: TODAY, subjectId: s.id, topicId: t.id, correct: 3, wrong: 2, blank: 0 });
    split(s, t, t.correct - 3, t.wrong - 2, t.blank, TODAY);
  }));
  PF.log = log;
  PF.days = dates.map(date => log.filter(r => r.date === date).reduce((a, r) => ({ date, correct: a.correct + r.correct, wrong: a.wrong + r.wrong, blank: a.blank + r.blank, n: a.n + r.correct + r.wrong + r.blank }), { date, n: 0, correct: 0, wrong: 0, blank: 0 }));
  const wrong = [1, 3];
  PF.answers = D.questions.map((q, i) => ({ questionId: q.id, date: TODAY, subjectId: 'dc', topicId: 'dc-2a', nodeId: q.node, given: wrong.includes(i) ? (q.key === 'C' ? 'E' : 'C') : q.key, result: wrong.includes(i) ? 'wrong' : 'correct', confidence: null }));
})();
