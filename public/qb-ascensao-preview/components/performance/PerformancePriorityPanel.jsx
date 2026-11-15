import React from 'react';
import { Panel } from '../core/Panel.jsx';
import { Badge } from '../core/Badge.jsx';
import { Button } from '../core/Button.jsx';
import { EmptyState } from '../data/EmptyState.jsx';

export function PerformancePriorityPanel({ items = [], onAction, title = 'Prioridades de estudo', basis, emptyTitle = 'Nenhuma prioridade no escopo', emptyDescription = 'Os registros do período não indicam erros recorrentes, baixa precisão com amostra suficiente, pendências vencidas nem revisões agendadas.', style }) {
  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 className="qb-overline" style={{ color: 'var(--qb-gold)', margin: 0 }}>{title}</h2>
        {basis && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>{basis}</span>}
      </div>
      {!items.length ? <EmptyState tone="empty" compact title={emptyTitle} description={emptyDescription} /> : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {items.map((it, i) => (
            <li key={it.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderTop: i ? '1px solid var(--divider)' : 0 }}>
              <span aria-hidden="true" style={{ font: '600 13px/24px var(--font-mono)', color: 'var(--qb-gold)', width: 22, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 200px', minWidth: 0 }}>
                  <Badge tone={it.tone || 'neutral'} style={{ alignSelf: 'flex-start' }}>{it.kind}</Badge>
                  <span style={{ font: '600 14px/1.35 var(--font-body)', color: 'var(--text-primary)' }}>{it.title}</span>
                  <span style={{ font: '400 13px/1.45 var(--font-body)', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Motivo: </span>{it.reason}</span>
                </div>
                {it.action && <Button size="sm" variant="secondary" icon={it.action.icon} onClick={() => onAction && onAction(it)}>{it.action.label}</Button>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
