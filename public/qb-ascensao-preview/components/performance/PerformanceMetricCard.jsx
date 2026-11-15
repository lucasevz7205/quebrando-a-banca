import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = { correct: 'var(--state-correct)', incorrect: 'var(--state-incorrect)', gold: 'var(--qb-gold-bright)', neutral: 'var(--text-primary)' };

export function PerformanceMetricCard({ label, icon, value, unit, tone = 'neutral', formula, detail, breakdown, comparison, state = 'ok', stateText, warning, method, action, compact = false, style }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const d = comparison ? comparison.delta : 0;
  return (
    <section className="qb-panel" aria-labelledby={id + 'l'} style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8, padding: compact ? '12px 14px' : '16px 18px', minWidth: 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 28 }}>
        {icon && <Icon name={icon} size={16} color="var(--qb-gold)" />}
        <h3 id={id + 'l'} style={{ font: '500 13px/1.3 var(--font-body)', color: 'var(--text-secondary)', margin: 0, flex: 1, minWidth: 0 }}>{label}</h3>
        {method && <button type="button" className="qb-iconbtn" style={{ width: 28, height: 28, marginRight: -6 }} aria-expanded={open} aria-controls={id + 'm'} aria-label={'Como é calculado: ' + label} title="Como é calculado" onClick={() => setOpen(o => !o)}><Icon name="info" size={15} /></button>}
      </div>
      {state === 'ok' ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ font: '600 ' + (compact ? 24 : 30) + 'px/1.05 var(--font-mono)', letterSpacing: '-.02em', color: TONES[tone] || TONES.neutral }}>{value}</span>
          {unit && <span style={{ font: '500 13px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{unit}</span>}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: compact ? 26 : 32, font: '500 14px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>
          <Icon name={state === 'pending' ? 'circle-help' : 'circle-dashed'} size={16} color="var(--state-no-evidence)" />{stateText || (state === 'pending' ? 'Métrica ainda não definida' : 'Sem atividades registradas')}
        </div>
      )}
      {state === 'ok' && comparison && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 12px/1.2 var(--font-mono)', color: d > 0 ? 'var(--state-correct)' : d < 0 ? 'var(--state-incorrect)' : 'var(--text-muted)' }}>
          <Icon name={d > 0 ? 'chevron-up' : d < 0 ? 'chevron-down' : 'minus'} size={14} />{comparison.label}
        </span>
      )}
      {state === 'ok' && breakdown && breakdown.length > 0 && (
        <dl style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', margin: 0 }}>
          {breakdown.map(b => <div key={b.label} style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}><dd style={{ margin: 0, font: '600 13px/1.2 var(--font-mono)', color: TONES[b.tone] || 'var(--text-primary)' }}>{b.value}</dd><dt style={{ font: '400 12px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{b.label}</dt></div>)}
        </dl>
      )}
      {state === 'ok' && detail && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>{detail}</span>}
      {formula && <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>{formula}</span>}
      {warning && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 12px/1.3 var(--font-body)', color: 'var(--state-attention)' }}><Icon name="triangle-alert" size={14} />{warning}</span>}
      {method && open && <p id={id + 'm'} role="note" style={{ margin: 0, padding: '8px 10px', borderRadius: 10, background: 'var(--surface-sunken)', border: '1px solid var(--divider)', font: '400 12px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>{method}</p>}
      {action && <button type="button" className="qb-linkbtn" style={{ alignSelf: 'flex-start', fontSize: 13, marginTop: 'auto' }} onClick={action.onClick}>{action.label}</button>}
    </section>
  );
}
