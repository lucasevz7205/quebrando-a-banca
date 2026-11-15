import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

export function ArchitectLauncher({ open = false, onOpenChange, contextLabel, onExpand, onQuick, style }) {
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, ...style }}>
      {open && (
        <div role="dialog" aria-label="O Arquiteto — acesso rápido" className="qb-panel qb-panel--ornate" style={{ width: 'min(340px, calc(100vw - 32px))', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, animation: 'qb-rise var(--dur-slow) var(--ease-enter)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="qb-badge qb-badge--gold" style={{ letterSpacing: '.12em', fontWeight: 600 }}>O ARQUITETO</span>
            <span style={{ flex: 1 }} />
            <button className="qb-iconbtn qb-iconbtn--sm" aria-label="Fechar acesso rápido" onClick={() => onOpenChange && onOpenChange(false)}><Icon name="x" size={16} /></button>
          </div>
          <span style={{ display: 'flex', gap: 6, alignItems: 'flex-start', font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}><Icon name="link" size={14} style={{ marginTop: 2 }} />Contexto: <span style={{ color: 'var(--text-secondary)' }}>{contextLabel || 'nenhum selecionado'}</span></span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[['socratico', 'message-circle', 'Perguntar'], ['retencao', 'target', 'Testar retenção'], ['feynman', 'lightbulb', 'Explicar (Feynman)'], ['pomodoro', 'timer', 'Pomodoro']].map(([id, ic, l]) => (
              <button key={id} className="qb-chip" style={{ justifyContent: 'flex-start', borderRadius: 10, minHeight: 40 }} onClick={() => onQuick && onQuick(id)}><Icon name={ic} size={15} />{l}</button>
            ))}
          </div>
          <Button icon="maximize" fullWidth onClick={onExpand}>Abrir estúdio completo</Button>
        </div>
      )}
      <button className="qb-btn qb-btn--primary" style={{ borderRadius: 999, boxShadow: 'var(--shadow-raised)', paddingLeft: 16 }} aria-expanded={open} onClick={() => onOpenChange && onOpenChange(!open)}>
        <Icon name="sparkles" size={18} />O Arquiteto
      </button>
    </div>
  );
}
