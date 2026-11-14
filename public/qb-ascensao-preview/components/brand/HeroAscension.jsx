import React from 'react';

const SCENES = { night: 'qb-scene-night', day: 'qb-scene-day', sunset: 'qb-scene-sunset' };

export function HeroAscension({ scene = 'night', eyebrow, title, subtitle, children, height = 360, focal = 'right', overlay = 'strong', radius = 'var(--radius-card)', style }) {
  const pos = focal === 'right' ? '70% 35%' : focal === 'center' ? '50% 40%' : '30% 40%';
  const protect = overlay === 'strong'
    ? 'linear-gradient(90deg,rgba(10,30,52,.97) 0%,rgba(10,30,52,.88) 34%,rgba(10,30,52,.35) 64%,rgba(10,30,52,.05) 100%)'
    : 'var(--gradient-scene-protect)';
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, minHeight: height, border: 'var(--border-hairline)', background: 'var(--qb-midnight)', isolation: 'isolate', ...style }}>
      <div className={`qb-img ${SCENES[scene] || SCENES.night}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundPosition: pos, zIndex: -2 }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: protect, zIndex: -1 }} />
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', background: 'linear-gradient(180deg,rgba(10,30,52,0),rgba(10,30,52,.75))', zIndex: -1 }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, minHeight: height, padding: 'clamp(24px,4vw,48px)', maxWidth: 620 }}>
        {eyebrow && <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>{eyebrow}</span>}
        {title && <h1 style={{ font: '600 clamp(32px,4.4vw,52px)/1.08 var(--font-display)', color: 'var(--qb-ivory)', letterSpacing: '.02em', textShadow: '0 2px 18px rgba(8,10,15,.6)' }}>{title}</h1>}
        {subtitle && <p style={{ font: 'italic 500 clamp(18px,1.8vw,22px)/1.4 var(--font-serif)', color: 'var(--qb-parchment)', maxWidth: 480 }}>{subtitle}</p>}
        {children && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>{children}</div>}
      </div>
    </section>
  );
}
