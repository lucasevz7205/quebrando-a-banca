import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', tone = 'default', onConfirm, onCancel, children }) {
  const cancelRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    cancelRef.current && cancelRef.current.focus();
    const k = e => { if (e.key === 'Escape') { e.stopPropagation(); onCancel && onCancel(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onCancel} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,15,.65)' }} />
      <div role="alertdialog" aria-modal="true" aria-labelledby="qb-confirm-title" className="qb-panel qb-panel--ornate" style={{ position: 'relative', width: 'min(440px,100%)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + (tone === 'danger' ? 'var(--state-incorrect)' : 'var(--qb-gold)'), color: tone === 'danger' ? 'var(--state-incorrect)' : 'var(--qb-gold)' }}><Icon name={tone === 'danger' ? 'trash-2' : 'circle-help'} size={18} /></span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 id="qb-confirm-title" style={{ font: '400 22px/1.25 var(--font-heading)', color: 'var(--text-primary)' }}>{title}</h2>
            {description && <p style={{ font: '400 15px/1.55 var(--font-body)', color: 'var(--text-secondary)' }}>{description}</p>}
          </div>
        </div>
        {children}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <button ref={cancelRef} className="qb-btn qb-btn--secondary" onClick={onCancel}>{cancelLabel}</button>
          <Button variant={tone === 'danger' ? 'crimson' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
