import React from 'react';
import { Icon } from './Icon.jsx';

const STATE_ICONS = { correct: 'circle-check', incorrect: 'circle-x', 'no-evidence': 'circle-dashed', attention: 'triangle-alert' };

export function Badge({ tone = 'neutral', icon, children, className = '', style }) {
  const glyph = icon === null ? null : icon || STATE_ICONS[tone];
  return (
    <span className={`qb-badge qb-badge--${tone} ${className}`} style={style}>
      {glyph && <Icon name={glyph} size={14} strokeWidth={2} />}
      {children}
    </span>
  );
}
