import React from 'react';

const MARKS = { 'q-sword': ['qb-mark-q-sword', 115 / 135], sword: ['qb-mark-sword', 55 / 115], mountain: ['qb-mark-mountain', 120 / 70], 'mountain-ribbon': ['qb-mark-mountain-ribbon', 110 / 65] };

function Img({ cls, w, h, label, radius, style }) {
  return <span role="img" aria-label={label} className={`qb-img ${cls}`} style={{ display: 'inline-block', width: w, height: h, backgroundSize: 'contain', borderRadius: radius, flexShrink: 0, ...style }} />;
}

export function BrandLogo({ variant = 'horizontal', size = 40, mark = 'q-sword', showMotto = false, align = 'start', style }) {
  const label = 'Quebrando a Banca';
  if (variant === 'mark') {
    const [cls, ratio] = MARKS[mark] || MARKS['q-sword'];
    return <Img cls={cls} w={ratio >= 1 ? size * ratio : size * ratio} h={size} label={label} style={style} />;
  }
  if (variant === 'app-icon') return <Img cls="qb-logo-app-icon" w={size} h={size * 166 / 174} label={label} radius="22%" style={{ backgroundSize: 'cover', ...style }} />;
  if (variant === 'vertical') return <Img cls="qb-logo-vertical" w={size * 545 / 480} h={size} label={label} style={style} />;
  if (variant === 'wordmark') {
    const fs = size;
    return (
      <div role="img" aria-label={label} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: fs * 0.18, ...style }}>
        <span style={{ font: `600 ${fs}px/1 var(--font-display)`, color: 'var(--qb-ivory)', letterSpacing: '.02em', whiteSpace: 'nowrap' }}>QUEBRANDO A BANCA</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: fs * 0.4, width: '100%' }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(208,179,134,0),var(--qb-gold),rgba(208,179,134,0))' }} />
        </span>
        {showMotto && <span style={{ font: `italic 500 ${fs * 0.4}px/1.2 var(--font-serif)`, color: 'var(--qb-parchment)', whiteSpace: 'nowrap', marginTop: fs * 0.1 }}>Conhecimento · Estratégia · Disciplina · Conquista</span>}
      </div>
    );
  }
  // horizontal: mark left, wordmark right (header lockup)
  return (
    <div role="img" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3, ...style }}>
      <Img cls="qb-mark-q-sword" w={size * 0.85} h={size} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: size * 0.06 }}>
        <span style={{ font: `600 ${size * 0.62}px/1 var(--font-serif)`, color: 'var(--qb-ivory)', whiteSpace: 'nowrap' }}>Quebrando a Banca</span>
      </span>
    </div>
  );
}
