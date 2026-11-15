// Pedagogical identifiers + navigation service for the demo. Mirrors docs/CONTRATOS-NAVEGACAO.md.
// Only links that exist in the demo data are declared; everything else resolves to { ok:false, reason } — never to another item.
(() => {
  const D = window.QB_DATA, E = window.QB_EDITAL, P = window.QB_PLAN;
  const LINKS = {
    maps: { 'dc-2a': { mapId: 'mm-dc-2a', title: 'Processo legislativo', rootNodeId: 'pl' } },
    decks: { 'dc-2a': { deckId: 'deck-dc-2a' } },
    questionTopic: Object.fromEntries(D.questions.map(q => [q.id, 'dc-2a'])),
    nodeTopic: Object.fromEntries(D.mapNodes.map(n => [n.id, 'dc-2a'])),
    flashcardTopic: 'dc-2a',
  };
  const pendingByTopic = {};
  Object.values(P.weeks).flat().forEach(t => { if (t.status === 'done' || !t.topicNum || t.date > P.today) return; const id = t.subjectId + '-' + t.topicNum; pendingByTopic[id] = (pendingByTopic[id] || 0) + 1; });
  const find = (subjectId, topicId) => { const s = E.subjects.find(x => x.id === subjectId); return { s, t: s && s.topics.find(x => x.id === topicId) }; };
  const REASONS = {
    'topic-not-found': 'O identificador de matéria ou assunto não existe no edital carregado.',
    'no-questions': 'Não há questões vinculadas a este assunto na base de demonstração.',
    'no-map': 'Não há mapa mental vinculado a este assunto na base de demonstração.',
    'node-not-found': 'O nó solicitado não existe no mapa deste assunto.',
    'no-deck': 'Não há revisão ativa (flashcards) vinculada a este assunto na base de demonstração.',
    'no-node-questions': 'Nenhuma questão está vinculada a este nó.',
    'question-not-found': 'A questão solicitada não existe na base vinculada a este assunto.',
    'unknown-action': 'Ação sem destino definido.',
  };
  function resolve(i) {
    const { s, t } = find(i.subjectId, i.topicId);
    if (!s || !t) return { ok: false, reason: 'topic-not-found' };
    if (i.action === 'architect') return { ok: true, view: 'architect' };
    if (i.action === 'train') { const n = D.questions.filter(q => LINKS.questionTopic[q.id] === t.id).length; return n ? { ok: true, view: 'questions', note: n + ' questões' } : { ok: false, reason: 'no-questions' }; }
    if (i.action === 'review') { const n = LINKS.decks[t.id] ? D.flashcards.length : 0; return n ? { ok: true, view: 'flashcards', note: n + ' cartões' } : { ok: false, reason: 'no-deck' }; }
    if (i.action === 'mindmap') {
      const m = LINKS.maps[t.id];
      if (!m) return { ok: false, reason: 'no-map' };
      if (i.nodeId && !D.mapNodes.some(n => n.id === i.nodeId && LINKS.nodeTopic[n.id] === t.id)) return { ok: false, reason: 'node-not-found' };
      return { ok: true, view: 'map', mapId: m.mapId, nodeId: i.nodeId || m.rootNodeId, note: '1 mapa' };
    }
    if (i.action === 'node-questions') { const idx = D.questions.findIndex(q => q.node === i.nodeId); return idx < 0 ? { ok: false, reason: 'no-node-questions' } : { ok: true, view: 'questions', questionIndex: idx, questionId: D.questions[idx].id }; }
    if (i.action === 'question') { const idx = D.questions.findIndex(q => q.id === i.questionId && LINKS.questionTopic[q.id] === t.id); return idx < 0 ? { ok: false, reason: 'question-not-found' } : { ok: true, view: 'questions', questionIndex: idx, questionId: i.questionId }; }
    return { ok: false, reason: 'unknown-action' };
  }
  const topicLabel = (subjectId, topicId) => { const { s, t } = find(subjectId, topicId); return s && t ? s.short + ' ' + t.num + (t.title ? ' — ' + t.title : '') : null; };
  window.QB_LINKS = LINKS;
  window.QB_NAV = { resolve, find, topicLabel, pendingByTopic, reasons: REASONS, mapCounts: Object.fromEntries(Object.keys(LINKS.maps).map(k => [k, 1])) };
})();
