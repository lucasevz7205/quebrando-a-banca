import React from 'react';

let uid = 0;
export function SelectField({ label, value, onChange, options = [], hint, hideLabel = false, style, selectStyle }) {
  const id = React.useMemo(() => 'qb-sel-' + (++uid), []);
  const render = o => o.options
    ? <optgroup key={o.label} label={o.label}>{o.options.map(render)}</optgroup>
    : <option key={o.value} value={o.value}>{o.label}</option>;
  return (
    <label htmlFor={id} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, ...style }}>
      <span className="qb-overline" style={hideLabel ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } : null}>{label}</span>
      <select id={id} className="qb-select" value={value} onChange={e => onChange && onChange(e.target.value)} style={selectStyle}>{options.map(render)}</select>
      {hint && <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>{hint}</span>}
    </label>
  );
}
