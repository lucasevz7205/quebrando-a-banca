import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = { empty: ['circle-dashed', 'var(--state-no-evidence)'], 'small-sample': ['triangle-alert', 'var(--state-attention)'], error: ['circle-x', 'var(--state-incorrect)'], unavailable: ['mic-off', 'var(--text-muted)'], pending: ['circle-help', 'var(--qb-moonlight)'] };

export function EmptyState({ tone = 'empty', icon, title, description, action, compact = false, style }) {
  const t = TONES[tone] || TONES.empty;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} style={{ display: 'flex', flexDirection: compact ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 12 : 10, padding: compact ? '14px 16px' : '32px 24px', textAlign: compact ? 'left' : 'center', borderRadius: 14, border: '1px dashed rgba(171,162,152,.4)', background: 'rgba(16,28,45,.6)', ...style }}>
      <span style={{ color: t[1], display: 'inline-flex' }}><Icon name={icon || t[0]} size={compact ? 20 : 28} /></span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: compact ? 'flex-start' : 'center' }}>
        <span style={{ font: '600 15px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{title}</span>
        {description && <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-muted)', maxWidth: '48ch' }}>{description}</span>}
        {action && <div style={{ marginTop: 6 }}>{action}</div>}
      </div>
    </div>
  );
}
