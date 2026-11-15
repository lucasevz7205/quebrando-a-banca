import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { heatTier, HEAT_TIERS } from './HeatmapGrid.jsx';

export const STUDY_STATUS = {
  'not-started': { label: 'Não iniciado', icon: 'circle-dashed', color: 'var(--status-not-started)' },
  studying: { label: 'Em estudo', icon: 'book-open', color: 'var(--status-studying)' },
  reviewing: { label: 'Revisando', icon: 'repeat', color: 'var(--status-reviewing)' },
  mastered: { label: 'Dominado', icon: 'circle-check', color: 'var(--status-mastered)' },
};

export function StatusTag({ status }) {
  const s = STUDY_STATUS[status] || STUDY_STATUS['not-started'];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 12px/1 var(--font-body)', color: s.color, whiteSpace: 'nowrap' }}><Icon name={s.icon} size={14} />{s.label}</span>;
}

function Accuracy({ correct, wrong, blank }) {
  const h = heatTier(correct, wrong);
  if (h.pct == null) return <span style={{ font: '400 12px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>Sem respostas</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
      <span className={'qb-heat qb-heat--' + h.tier} style={{ cursor: 'default', minWidth: 46, height: 24 }} title={HEAT_TIERS.find(t => t.id === h.tier).label}>{Math.round(h.pct)}%</span>
      <span style={{ font: '400 12px/1.2 var(--font-mono)', color: 'var(--text-muted)' }}>{correct}✓ {wrong}✗{blank ? ' ' + blank + '○' : ''} · {h.n + (blank || 0)} resp.</span>
    </span>
  );
}

const ACTIONS = [['study', 'book-open', 'Estudar'], ['questions', 'target', 'Questões'], ['map', 'network', 'Mapa mental'], ['flashcards', 'layers', 'Flashcards'], ['architect', 'sparkles', 'O Arquiteto']];

export function TopicRow({ topic, highlight, onAction, evokeFirst }) {
  return (
    <div className={'qb-topic' + (highlight ? ' is-highlight' : '')} data-topic-id={topic.id}>
      <span style={{ font: '500 13px/1 var(--font-mono)', color: 'var(--qb-gold)', minWidth: 36 }}>{topic.num}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <span style={{ font: '400 15px/1.35 var(--font-body)', color: topic.known === false ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: topic.known === false ? 'italic' : 'normal' }}>{topic.title || 'Título não disponível nos arquivos'}</span>
        <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 14px' }}><StatusTag status={topic.status} /><Accuracy correct={topic.correct} wrong={topic.wrong} blank={topic.blank} /></span>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {ACTIONS.map(([id, icon, label]) => (
          <button key={id} className="qb-iconbtn qb-iconbtn--sm" aria-label={(id === 'study' && evokeFirst ? 'Evocar e estudar' : label) + ': ' + topic.num} title={id === 'study' && evokeFirst ? 'Evocar antes de ler' : label} onClick={() => onAction && onAction(id, topic)}>
            <Icon name={id === 'study' && evokeFirst ? 'brain' : icon} size={17} />
          </button>
        ))}
      </div>
    </div>
  );
}

function groupTopics(topics) {
  const groups = [];
  topics.forEach(t => {
    const key = String(t.num).match(/^\d+/) ? String(t.num).match(/^\d+/)[0] : t.num;
    let g = groups.find(x => x.key === key);
    if (!g) { g = { key, items: [] }; groups.push(g); }
    g.items.push(t);
  });
  return groups;
}

export function subjectStats(s) {
  let c = 0, w = 0, b = 0, studied = 0;
  s.topics.forEach(t => { c += t.correct; w += t.wrong; b += t.blank || 0; if (t.status !== 'not-started') studied++; });
  return { correct: c, wrong: w, blank: b, answered: c + w + b, valid: c + w, accuracy: c + w ? (c / (c + w)) * 100 : null, studied, total: s.topics.length, coverage: (studied / s.topics.length) * 100 };
}

export function EditalTree({ subjects = [], expanded = [], onToggle, highlightId, onAction, evokeFirst = false, groupTitles = {}, style }) {
  return (
    <div role="tree" aria-label="Edital verticalizado" style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {subjects.map(s => {
        const open = expanded.includes(s.id);
        const st = subjectStats(s);
        const h = heatTier(st.correct, st.wrong);
        return (
          <div key={s.id} role="treeitem" aria-expanded={open} className="qb-panel" style={{ padding: 4 }}>
            <button className="qb-subject" onClick={() => onToggle && onToggle(s.id)}>
              <Icon name={open ? 'chevron-down' : 'chevron-right'} size={18} color="var(--qb-gold)" />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ font: '600 16px/1.25 var(--font-body)' }}>{s.name}</span>
                <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>{s.block}{s.blockLabel ? ' · ' + s.blockLabel : ''} · {st.total} tópicos</span>
              </span>
              <span style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end', font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)', textAlign: 'right' }}>
                <span><span style={{ display: 'block', font: '600 15px/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{h.pct == null ? '—' : Math.round(h.pct) + '%'}</span>acertos</span>
                <span><span style={{ display: 'block', font: '600 15px/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{st.studied}/{st.total}</span>cobertura</span>
                <span><span style={{ display: 'block', font: '600 15px/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{st.answered}</span>respostas</span>
              </span>
            </button>
            {open && (
              <div role="group" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 8px 10px 36px' }}>
                {groupTopics(s.topics).map(g => (
                  <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(g.items.length > 1 || groupTitles[s.id + ':' + g.key]) && <span className="qb-overline" style={{ padding: '10px 12px 2px' }}>Assunto {g.key}{groupTitles[s.id + ':' + g.key] ? ' · ' + groupTitles[s.id + ':' + g.key] : ''}</span>}
                    {g.items.map(t => <TopicRow key={t.id} topic={t} highlight={t.id === highlightId} onAction={onAction} evokeFirst={evokeFirst} />)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
