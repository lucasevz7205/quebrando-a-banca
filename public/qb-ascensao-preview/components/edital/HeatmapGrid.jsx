import React from 'react';

export const HEAT_TIERS = [
  { id: 1, label: 'abaixo de 60%', short: '< 60%' },
  { id: 2, label: '60% a menos de 75%', short: '60–74%' },
  { id: 3, label: '75% a menos de 85%', short: '75–84%' },
  { id: 4, label: '85% a menos de 90%', short: '85–89%' },
  { id: 5, label: '90% ou mais', short: '≥ 90%' },
  { id: 'none', label: 'sem respostas', short: 'sem resp.' },
];

export function heatTier(correct = 0, wrong = 0) {
  const n = correct + wrong;
  if (!n) return { tier: 'none', pct: null, n: 0 };
  const pct = (correct / n) * 100;
  const tier = pct < 60 ? 1 : pct < 75 ? 2 : pct < 85 ? 3 : pct < 90 ? 4 : 5;
  return { tier, pct, n };
}

export function HeatmapCell({ topic, subjectName, selected, onClick }) {
  const h = heatTier(topic.correct, topic.wrong);
  const t = HEAT_TIERS.find(x => x.id === h.tier);
  const aria = subjectName + ', tópico ' + topic.num + (topic.title ? ' — ' + topic.title : '') + ': ' + (h.pct == null ? 'sem respostas' : Math.round(h.pct) + '% (' + topic.correct + ' de ' + h.n + '), ' + t.label);
  return (
    <button className={'qb-heat qb-heat--' + h.tier} aria-pressed={!!selected} aria-label={aria} title={aria} onClick={onClick}>{topic.num}</button>
  );
}

export function HeatmapGrid({ subjects = [], selectedTopicId, onSelect, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {subjects.map(s => (
        <div key={s.id} role="group" aria-label={s.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,200px) minmax(0,1fr)', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6 }}>
            <span style={{ font: '600 14px/1.25 var(--font-body)', color: 'var(--text-primary)' }}>{s.name}</span>
            <span style={{ font: '400 12px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{s.block} · {s.topics.length} tópicos</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {s.topics.map(t => <HeatmapCell key={t.id} topic={t} subjectName={s.name} selected={t.id === selectedTopicId} onClick={() => onSelect && onSelect(s.id, t.id)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
