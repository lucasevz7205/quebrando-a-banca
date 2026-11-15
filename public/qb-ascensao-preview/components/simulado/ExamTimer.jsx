import React from 'react';
import { Icon } from '../core/Icon.jsx';

function fmt(s) { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); }

export function ExamTimer({ remaining, total, paused = false, label = 'Tempo restante', style }) {
  const pct = total ? Math.max(0, Math.min(1, remaining / total)) : 1;
  const warn = pct < 0.1;
  return (
    <div role="timer" aria-label={label + ': ' + fmt(remaining)} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160, ...style }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 12px/1 var(--font-body)', color: 'var(--text-muted)' }}><Icon name="timer" size={14} color={warn ? 'var(--state-incorrect)' : 'var(--qb-gold)'} />{label}{paused ? ' · pausado' : ''}</span>
      <span style={{ font: '500 24px/1 var(--font-mono)', color: warn ? 'var(--state-incorrect)' : 'var(--text-primary)' }}>{fmt(remaining)}</span>
      {total ? <span aria-hidden="true" style={{ height: 4, borderRadius: 999, background: 'var(--state-progress-track)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: pct * 100 + '%', background: warn ? 'var(--state-incorrect)' : 'var(--qb-gold-bright)', transition: 'width 1s linear' }} /></span> : null}
      {warn && <span style={{ font: '500 12px/1.2 var(--font-body)', color: 'var(--state-incorrect)' }}>Menos de 10% do tempo</span>}
    </div>
  );
}
