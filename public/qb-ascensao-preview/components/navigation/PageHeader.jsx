import React from 'react';

export function PageHeader({ overline, title, description, actions, children, style }) {
  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: '1 1 320px' }}>
        {overline && <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>{overline}</span>}
        <h1 style={{ font: 'var(--type-h1)', color: 'var(--text-primary)' }}>{title}</h1>
        {description && <p style={{ font: '400 15px/1.5 var(--font-body)', color: 'var(--text-secondary)', maxWidth: '68ch' }}>{description}</p>}
        {children}
      </div>
      {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </header>
  );
}
