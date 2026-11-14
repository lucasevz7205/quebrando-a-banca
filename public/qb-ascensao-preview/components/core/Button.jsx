import React from 'react';
import { Icon } from './Icon.jsx';

export function Button({ variant = 'primary', size = 'md', icon, iconRight, loading = false, disabled = false, fullWidth = false, type = 'button', children, className = '', style, ...rest }) {
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 16 : 18;
  const cls = ['qb-btn', `qb-btn--${variant}`, size !== 'md' && `qb-btn--${size}`, fullWidth && 'qb-btn--full', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} style={style} {...rest}>
      {loading ? <Icon name="loader-circle" size={iconSize} className="qb-spin" /> : icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}
