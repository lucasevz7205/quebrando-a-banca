import React from 'react';
import { Icon } from './Icon.jsx';

export function IconButton({ icon, label, variant = 'ghost', size = 'md', round = false, count, pressed, className = '', type = 'button', ...rest }) {
  const cls = ['qb-iconbtn', variant !== 'ghost' && `qb-iconbtn--${variant}`, size === 'sm' && 'qb-iconbtn--sm', round && 'qb-iconbtn--round', className].filter(Boolean).join(' ');
  const a11y = count ? `${label} (${count} novas)` : label;
  return (
    <button type={type} className={cls} aria-label={a11y} title={label} aria-pressed={pressed === undefined ? undefined : pressed} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 18 : 22} />
      {count ? <span className="qb-iconbtn__count" aria-hidden="true">{count > 9 ? '9+' : count}</span> : null}
    </button>
  );
}
