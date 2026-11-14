import React from 'react';

export function ProgressBar({ value = 0, label, valueText, tone = 'progress', size = 'md', showValue = true, style }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const fill = tone === 'correct' ? 'var(--state-correct)' : tone === 'gold' ? 'var(--qb-gold)' : 'var(--state-progress)';
  const h = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  const text = valueText || `${Math.round(pct)}%`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, ...style }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, font: '500 13px/1.3 var(--font-body)' }}>
          {label && <span style={{ color: 'var(--text-secondary)' }}>{label}</span>}
          {showValue && <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{text}</span>}
        </div>
      )}
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-valuetext={text} aria-label={label}
        style={{ height: h, borderRadius: 999, background: 'var(--state-progress-track)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: fill, transition: 'width var(--dur-slow) var(--ease-standard)' }} />
      </div>
    </div>
  );
}
