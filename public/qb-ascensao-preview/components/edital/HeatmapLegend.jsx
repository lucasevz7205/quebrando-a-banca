import React from 'react';
import { HEAT_TIERS } from './HeatmapGrid.jsx';

export function HeatmapLegend({ title = 'Faixa de acertos', note = 'Acertos ÷ (acertos + erros). Brancos não entram no cálculo.', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px' }}>
        <span className="qb-overline">{title}</span>
        {HEAT_TIERS.map(t => (
          <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '400 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}>
            <span className={'qb-heat qb-heat--' + t.id} aria-hidden="true" style={{ minWidth: 22, width: 22, height: 16, padding: 0, cursor: 'default', borderRadius: 5 }} />{t.label}
          </span>
        ))}
      </div>
      {note && <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>{note}</span>}
    </div>
  );
}
