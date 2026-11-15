import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function MainNav({ items = [], activeId, activeQuick, onNavigate, compact = false, collapsed = false, onExpand, leading, trailing, label = 'Navegação principal', style }) {
  if (collapsed) {
    const cur = items.find(i => i.id === activeId);
    return (
      <nav aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 6px 14px', borderRadius: 999, border: '1px solid rgba(208,179,134,.5)', background: 'rgba(10,30,52,.9)', ...style }}>
        {leading}
        <span style={{ font: '600 15px/1 var(--font-heading)', color: 'var(--qb-gold-bright)' }}>{cur ? cur.label : ''}</span>
        <span style={{ flex: 1 }} />
        <button className="qb-tool" onClick={onExpand} aria-label="Expandir navegação"><Icon name="chevrons-down" size={14} />Menu</button>
      </nav>
    );
  }
  return (
    <nav aria-label={label} className={'qb-mainnav' + (compact ? ' qb-mainnav--compact' : '')} style={style}>
      {leading && <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 0 6px' }}>{leading}</div>}
      <div style={{ flex: 1, display: 'flex', minWidth: 0, overflowX: 'auto' }}>
        {items.map(it => (
          <div key={it.id} className="qb-mainnav__item" aria-current={it.id === activeId ? 'page' : undefined} role="presentation" style={{ padding: 0 }}>
            <button onClick={() => onNavigate && onNavigate(it.id)} aria-current={it.id === activeId ? 'page' : undefined} title={it.label}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 10px', border: 0, background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer', borderRadius: 999 }}>
              {it.icon && <Icon name={it.icon} size={compact ? 16 : 18} />}
              <span className="qb-mainnav__label">{it.label}</span>
              {it.count ? <span className="qb-mainnav__count" aria-label={it.count + ' pendentes'}>{it.count}</span> : null}
            </button>
            {it.quick && <button className="qb-mainnav__quick" aria-current={it.id === activeId && activeQuick === it.quick.id ? 'true' : undefined} onClick={() => onNavigate && onNavigate(it.id, it.quick.id)}>{it.quick.label}</button>}
          </div>
        ))}
      </div>
      {trailing && <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px 0 10px' }}>{trailing}</div>}
    </nav>
  );
}
