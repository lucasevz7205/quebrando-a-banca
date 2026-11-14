import React from 'react';

export function Panel({ variant = 'raised', padding = 24, as: Tag = 'div', interactive = false, className = '', style, children, ...rest }) {
  const cls = ['qb-panel', variant !== 'raised' && `qb-panel--${variant}`, interactive && 'qb-panel--interactive', className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} tabIndex={interactive ? 0 : undefined} style={{ padding, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
