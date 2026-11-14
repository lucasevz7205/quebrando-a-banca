import React from 'react';
import { Icon } from '../core/Icon.jsx';

function Ring({ value = 0, size, stroke = 6 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(208,179,134,.18)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--qb-gold-bright)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset var(--dur-scene) var(--ease-enter)' }} />
    </svg>
  );
}

export function RadialNavigation({ items = [], activeId, onSelect, center = {}, size = 520, layout = 'auto', artifact = true, style }) {
  const ref = React.useRef(null);
  const [avail, setAvail] = React.useState(size);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setAvail(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const mode = layout === 'auto' ? (avail < size ? 'list' : 'radial') : layout;
  const cs = size * 0.38;
  const pct = center.value != null ? Math.round(center.value * 100) : null;

  const Center = (
    <div style={{ position: 'relative', width: cs, height: cs, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'radial-gradient(circle at 50% 35%,#173653 0%,#0A1E34 75%)', boxShadow: 'inset 0 0 0 1px rgba(208,179,134,.4), 0 20px 50px -20px rgba(8,10,15,.9)' }}>
      {artifact && <div className="qb-img qb-artifact-disc" aria-hidden="true" style={{ position: 'absolute', inset: 10, borderRadius: '50%', opacity: .16, mixBlendMode: 'luminosity' }} />}
      {center.value != null && <Ring value={center.value} size={cs} />}
      <span style={{ position: 'relative', font: '600 12px/1.2 var(--font-body)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{center.overline || 'Edital'}</span>
      {pct != null && <span style={{ position: 'relative', font: '600 44px/1 var(--font-display)', color: 'var(--qb-ivory)', marginTop: 6 }}>{pct}<span style={{ fontSize: 22, color: 'var(--qb-gold)' }}>%</span></span>}
      {center.label && <span style={{ position: 'relative', font: 'italic 500 16px/1.25 var(--font-serif)', color: 'var(--text-secondary)', marginTop: 6, maxWidth: cs * 0.7 }}>{center.label}</span>}
    </div>
  );

  if (mode === 'list') {
    return (
      <nav ref={ref} aria-label="Atalhos de estudo" style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%', ...style }}>
        {Center}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {items.map(it => (
            <li key={it.id}>
              <button className="qb-radial__row" aria-current={it.id === activeId ? 'true' : undefined} onClick={() => onSelect && onSelect(it.id)}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(208,179,134,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--qb-gold)' }}><Icon name={it.icon} size={20} /></span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '500 15px/1.2 var(--font-body)' }}>{it.label}</span>
                  {it.meta && <span style={{ font: '400 13px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{it.meta}</span>}
                </span>
                <Icon name="chevron-right" size={18} color="var(--text-muted)" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const R = size / 2 - 64;
  return (
    <nav ref={ref} aria-label="Atalhos de estudo" style={{ width: '100%', display: 'flex', justifyContent: 'center', ...style }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 64 - 2, borderRadius: '50%', border: '1px solid rgba(165,138,103,.35)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 64 + 30, borderRadius: '50%', border: '1px dashed rgba(165,138,103,.25)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 18, borderRadius: '50%', border: '1px solid rgba(165,138,103,.12)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>{Center}</div>
        {items.map((it, i) => {
          const a = (-90 + (360 / items.length) * i) * Math.PI / 180;
          return (
            <button key={it.id} className="qb-radial__node" aria-current={it.id === activeId ? 'true' : undefined} onClick={() => onSelect && onSelect(it.id)}
              style={{ left: size / 2 + R * Math.cos(a), top: size / 2 + R * Math.sin(a) }}>
              <span className="qb-radial__orb"><Icon name={it.icon} size={28} strokeWidth={1.5} /></span>
              <span className="qb-radial__label">{it.label}</span>
              {it.meta && <span className="qb-radial__meta">{it.meta}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
