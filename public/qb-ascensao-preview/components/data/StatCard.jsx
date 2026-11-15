import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function StatCard({ label, value, unit, detail, icon, tone = 'neutral', trend, note, warning, onClick, compact = false, style }) {
  const color = tone === 'correct' ? 'var(--state-correct)' : tone === 'incorrect' ? 'var(--state-incorrect)' : tone === 'gold' ? 'var(--qb-gold-bright)' : 'var(--text-primary)';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={'qb-panel' + (onClick ? ' qb-panel--interactive' : '')} style={{ display: 'flex', flexDirection: 'column', gap: compact ? 4 : 8, padding: compact ? '12px 14px' : '16px 18px', textAlign: 'left', color: 'inherit', font: 'inherit', minWidth: 0, ...style }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 13px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>
        {icon && <Icon name={icon} size={16} color="var(--qb-gold)" />}{label}
        {note && <span title={note} aria-label={note} style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'inline-flex' }}><Icon name="info" size={14} /></span>}
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ font: '600 ' + (compact ? 24 : 32) + 'px/1.05 var(--font-body)', fontVariantNumeric: 'tabular-nums', color }}>{value}</span>
        {unit && <span style={{ font: '500 14px/1 var(--font-body)', color: 'var(--text-muted)' }}>{unit}</span>}
        {trend && <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 12px/1 var(--font-mono)', color: trend.delta > 0 ? 'var(--state-correct)' : trend.delta < 0 ? 'var(--state-incorrect)' : 'var(--text-muted)' }}><Icon name={trend.delta > 0 ? 'chevron-up' : trend.delta < 0 ? 'chevron-down' : 'minus'} size={14} />{trend.label}</span>}
      </span>
      {detail && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>{detail}</span>}
      {warning && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 12px/1.3 var(--font-body)', color: 'var(--state-attention)' }}><Icon name="triangle-alert" size={14} />{warning}</span>}
    </Tag>
  );
}
