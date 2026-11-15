import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function QuestionNavigator({ items = [], current = 0, onGo, filter = 'all', onFilter, style }) {
  const answered = items.filter(i => i.answer === 'C' || i.answer === 'E').length;
  const blank = items.filter(i => i.answer === 'B').length;
  const flagged = items.filter(i => i.flagged).length;
  const pending = items.length - answered - blank;
  const visible = items.map((it, i) => ({ ...it, i })).filter(it => filter === 'all' || (filter === 'pending' && !it.answer) || (filter === 'flagged' && it.flagged));
  return (
    <nav aria-label="Navegação entre questões" style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)', textAlign: 'center' }}>
        {[['Respondidas', answered, 'var(--text-primary)'], ['Em branco', blank, 'var(--state-no-evidence)'], ['Pendentes', pending, 'var(--state-attention)'], ['Revisar', flagged, 'var(--qb-gold-bright)']].map(([l, v, c]) => (
          <span key={l} style={{ padding: '8px 4px', borderRadius: 10, background: 'var(--surface-sunken)' }}><span style={{ display: 'block', font: '600 18px/1.1 var(--font-body)', color: c }}>{v}</span>{l}</span>
        ))}
      </div>
      {onFilter && (
        <div className="qb-seg" role="group" aria-label="Filtrar questões" style={{ alignSelf: 'flex-start' }}>
          {[['all', 'Todas'], ['pending', 'Pendentes'], ['flagged', 'Marcadas']].map(([v, l]) => <button key={v} className="qb-seg__opt" aria-pressed={filter === v} onClick={() => onFilter(v)}>{l}</button>)}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 6 }}>
        {visible.map(it => (
          <button key={it.i} className={'qb-qnav' + (it.answer ? ' is-answered' : '') + (it.i === current ? ' is-current' : '') + (it.flagged ? ' is-flagged' : '')} aria-current={it.i === current ? 'step' : undefined}
            aria-label={'Questão ' + (it.i + 1) + ': ' + (it.answer === 'C' ? 'Certo' : it.answer === 'E' ? 'Errado' : it.answer === 'B' ? 'em branco' : 'pendente') + (it.flagged ? ', marcada para revisão' : '')} onClick={() => onGo && onGo(it.i)}>
            {it.i + 1}{it.answer && <span style={{ position: 'absolute', bottom: 2, left: 0, right: 0, font: '600 9px/1 var(--font-mono)', color: it.answer === 'B' ? 'var(--state-no-evidence)' : 'var(--qb-gold)' }}>{it.answer}</span>}
          </button>
        ))}
      </div>
      <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap', font: '400 11px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>
        <span>C/E = resposta · B = em branco</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--qb-gold-bright)' }} />marcada para revisão</span>
      </span>
    </nav>
  );
}
