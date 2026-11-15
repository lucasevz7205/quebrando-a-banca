import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

export function RescheduleActions({ dayLabel, quantity = 3, onQuantity, counts = {}, preview, onPreview, onConfirm, onCancel, lastApplied, onUndo, onEdit, style }) {
  const acts = [
    ['pull', 'arrow-down-to-line', 'Puxar próximas ' + quantity + ' para ' + dayLabel],
    ['spread', 'split', 'Distribuir próximas ' + quantity + ' na semana'],
    ['late', 'undo-2', 'Trazer atrasadas para hoje (' + (counts.late || 0) + ')', !counts.late],
    ['relieve', 'coffee', 'Aliviar ' + dayLabel + ' (' + (counts.day || 0) + ')', !counts.day],
    ['redistribute', 'refresh-cw', 'Redistribuir pendências da semana (' + (counts.week || 0) + ')', !counts.week],
  ];
  return (
    <section aria-label="Ajustes do cronograma" className="qb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Autonomia da rotina</span>
          <span style={{ font: '600 16px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>Adapte a semana ao seu dia real</span>
          <span style={{ font: '400 13px/1.45 var(--font-body)', color: 'var(--text-muted)' }}>Toda ação mostra uma prévia. Nada é concluído, apagado ou duplicado, e revisões automáticas (<Icon name="lock" size={12} style={{ display: 'inline' }} />) não são movidas.</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}>Quantidade
          <select className="qb-select" style={{ width: 80, minHeight: 36 }} value={quantity} onChange={e => onQuantity && onQuantity(+e.target.value)}>{[1, 2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n}</option>)}</select>
        </label>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {acts.map(([id, icon, label, disabled]) => <Button key={id} variant={preview && preview.action === id ? 'primary' : 'secondary'} size="sm" icon={icon} disabled={disabled || (!!preview && preview.action !== id)} onClick={() => onPreview && onPreview(id)}>{label}</Button>)}
        {onEdit && <Button variant="ghost" size="sm" icon="pencil" onClick={onEdit}>Editar cronograma e reagendar objetivos</Button>}
      </div>
      {preview && (
        <div role="region" aria-label="Prévia do ajuste" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 12, border: '1px solid rgba(242,199,110,.5)', background: 'rgba(242,199,110,.06)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 14px/1.3 var(--font-body)', color: 'var(--qb-gold-bright)' }}><Icon name="eye" size={16} />Prévia: {preview.description}</span>
          {preview.changes.length === 0
            ? <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Nenhuma tarefa elegível — nada será alterado.</span>
            : <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                {preview.changes.map(c => <li key={c.id} style={{ display: 'flex', gap: 8, font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.from} → {c.to}</span><span>{c.title}</span></li>)}
              </ul>}
          {preview.skipped ? <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>{preview.skipped} revisões automáticas mantidas na data original.</span> : null}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" icon="check" disabled={!preview.changes.length} onClick={onConfirm}>Aplicar {preview.changes.length} mudanças</Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
          </div>
        </div>
      )}
      {!preview && lastApplied && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>
          <Icon name="circle-check" size={16} color="var(--state-correct)" />{lastApplied}
          <Button size="sm" variant="ghost" icon="undo-2" onClick={onUndo}>Desfazer</Button>
        </div>
      )}
    </section>
  );
}
