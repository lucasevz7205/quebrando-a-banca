import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function SearchField({ value, onChange, placeholder = 'Buscar…', label = 'Buscar', style }) {
  return (
    <label style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 0, ...style }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{label}</span>
      <span style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}><Icon name="search" size={18} /></span>
      <input type="search" className="qb-input" value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} style={{ paddingLeft: 42, paddingRight: value ? 40 : 14 }} />
      {value && <button onClick={() => onChange && onChange('')} aria-label="Limpar busca" className="qb-iconbtn qb-iconbtn--sm" style={{ position: 'absolute', right: 4 }}><Icon name="x" size={16} /></button>}
    </label>
  );
}
