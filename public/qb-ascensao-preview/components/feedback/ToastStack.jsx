import React from 'react';
import { Icon } from '../core/Icon.jsx';

const T = { success: ['circle-check', 'var(--state-correct)'], info: ['info', 'var(--qb-gold)'], warning: ['triangle-alert', 'var(--state-attention)'], error: ['circle-x', 'var(--state-incorrect)'] };

function Item({ t, onDismiss, duration }) {
  React.useEffect(() => { if (!duration || t.sticky) return; const h = setTimeout(() => onDismiss(t.id), duration); return () => clearTimeout(h); }, [t.id]);
  const s = T[t.tone] || T.info;
  return (
    <div role={t.tone === 'error' ? 'alert' : 'status'} className="qb-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 10px 12px 14px', width: 'min(380px, calc(100vw - 32px))', boxShadow: 'var(--shadow-raised)', animation: 'qb-rise var(--dur-slow) var(--ease-enter)' }}>
      <span style={{ color: s[1], paddingTop: 1 }}><Icon name={s[0]} size={18} /></span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: '600 14px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{t.title}</span>
        {t.message && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>{t.message}</span>}
        {t.action && <button className="qb-linkbtn" style={{ alignSelf: 'flex-start', marginTop: 4, fontSize: 13 }} onClick={() => { t.action.onClick(); onDismiss(t.id); }}>{t.action.label}</button>}
      </div>
      <button className="qb-iconbtn qb-iconbtn--sm" aria-label="Fechar notificação" onClick={() => onDismiss(t.id)}><Icon name="x" size={16} /></button>
    </div>
  );
}

export function ToastStack({ toasts = [], onDismiss, duration = 5000, position = 'bottom-left' }) {
  const pos = position === 'bottom-right' ? { right: 16 } : { left: 16 };
  return (
    <div aria-live="polite" style={{ position: 'fixed', bottom: 16, zIndex: 'var(--z-toast)', display: 'flex', flexDirection: 'column', gap: 8, ...pos }}>
      {toasts.map(t => <Item key={t.id} t={t} onDismiss={onDismiss} duration={duration} />)}
    </div>
  );
}
