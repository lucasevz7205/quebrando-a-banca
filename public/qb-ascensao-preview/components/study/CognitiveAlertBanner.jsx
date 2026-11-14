import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

const TONES = {
  fatigue: { icon: 'coffee', color: 'var(--qb-gold-bright)', bg: 'rgba(242,199,110,.07)', border: 'rgba(242,199,110,.45)', label: 'Pausa sugerida' },
  attention: { icon: 'eye', color: 'var(--qb-moonlight)', bg: 'rgba(200,217,234,.06)', border: 'rgba(200,217,234,.35)', label: 'Atenção' },
  trap: { icon: 'shield-alert', color: 'var(--state-incorrect)', bg: 'rgba(238,138,124,.07)', border: 'rgba(238,138,124,.45)', label: 'Pegadinha frequente' },
  info: { icon: 'info', color: 'var(--qb-gold)', bg: 'rgba(208,179,134,.06)', border: 'rgba(208,179,134,.4)', label: 'Dica' },
};

export function CognitiveAlertBanner({ tone = 'fatigue', title, children, actions, onDismiss, style }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div role={tone === 'trap' ? 'alert' : 'status'} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 12px 14px 16px', borderRadius: 14, background: t.bg, border: `1px solid ${t.border}`, ...style }}>
      <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, border: `1px solid ${t.border}`, background: 'rgba(10,30,52,.5)' }}><Icon name={t.icon} size={18} /></span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 2 }}>
        <span style={{ font: '600 12px/1.2 var(--font-body)', letterSpacing: '.14em', textTransform: 'uppercase', color: t.color }}>{t.label}</span>
        {title && <span style={{ font: '600 15px/1.35 var(--font-body)', color: 'var(--text-primary)' }}>{title}</span>}
        {children && <div style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>{children}</div>}
        {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{actions}</div>}
      </div>
      {onDismiss && <IconButton icon="x" label="Dispensar aviso" size="sm" onClick={onDismiss} />}
    </div>
  );
}
