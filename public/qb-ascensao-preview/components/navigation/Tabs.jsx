import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Tabs({ items = [], value, onChange, variant = 'pill', label, style }) {
  const refs = React.useRef([]);
  const onKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    refs.current[n] && refs.current[n].focus();
    onChange && onChange(items[n].id);
  };
  return (
    <div role="tablist" aria-label={label} className={'qb-tabs' + (variant === 'underline' ? ' qb-tabs--underline' : '')} style={style}>
      {items.map((t, i) => (
        <button key={t.id} ref={el => (refs.current[i] = el)} role="tab" className="qb-tab" aria-selected={t.id === value} tabIndex={t.id === value ? 0 : -1}
          onClick={() => onChange && onChange(t.id)} onKeyDown={e => onKey(e, i)}>
          {t.icon && <Icon name={t.icon} size={16} />}{t.label}
          {t.count != null && <span style={{ font: '500 12px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
