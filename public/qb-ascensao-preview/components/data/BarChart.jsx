import React from 'react';
import { EmptyState } from './EmptyState.jsx';

export function BarChart({ data = [], height = 160, max, format = v => v, color = 'var(--viz-1)', label, style }) {
  if (!data.length) return <EmptyState tone="empty" title="Sem dados" compact />;
  const m = max || Math.max(1, ...data.map(d => d.value || 0));
  return (
    <div role="img" aria-label={label || 'Gráfico de barras'} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, ...style }}>
      {data.map((d, i) => {
        const empty = d.value == null;
        const h = empty ? 0 : Math.max(2, (d.value / m) * (height - 44));
        return (
          <div key={i} title={d.title || (d.label + ': ' + (empty ? 'sem dados' : format(d.value)))} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
            <span style={{ font: '500 11px/1 var(--font-mono)', color: empty ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{empty ? '—' : format(d.value)}</span>
            <div style={{ width: '100%', maxWidth: 36, height: empty ? 2 : h, borderRadius: '6px 6px 2px 2px', background: empty ? 'var(--viz-grid)' : (d.color || color), opacity: d.muted ? 0.45 : 1 }} />
            <span style={{ font: '400 11px/1.1 var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
