import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

const add = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const inputStyle = { width: 158, colorScheme: 'dark', fontFamily: 'var(--font-mono)', fontSize: 13 };

export function PerformancePeriodSelector({ mode = 'day', value = {}, min, max, today, presets = [], onChange, style }) {
  const id = React.useId();
  const ok = v => v && (!min || v >= min) && (!max || v <= max);
  const emit = v => onChange && onChange(v);
  if (mode === 'day') {
    const set = v => ok(v) && emit({ date: v });
    return (
      <div role="group" aria-label="Dia analisado" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', ...style }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor={id} className="qb-overline">Data</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button type="button" className="qb-iconbtn" aria-label="Dia anterior" disabled={!!min && value.date <= min} onClick={() => set(add(value.date, -1))}><Icon name="chevron-left" size={18} /></button>
            <input id={id} type="date" className="qb-input" style={inputStyle} min={min} max={max} value={value.date} onChange={e => set(e.target.value)} />
            <button type="button" className="qb-iconbtn" aria-label="Dia seguinte" disabled={!!max && value.date >= max} onClick={() => set(add(value.date, 1))}><Icon name="chevron-right" size={18} /></button>
          </div>
        </div>
        {today && <Button variant="secondary" disabled={value.date === today} onClick={() => set(today)}>Hoje</Button>}
      </div>
    );
  }
  const setFrom = v => ok(v) && emit({ from: v, to: v > value.to ? v : value.to });
  const setTo = v => ok(v) && emit({ from: v < value.from ? v : value.from, to: v });
  return (
    <div role="group" aria-label="Intervalo analisado" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label htmlFor={id + 'f'} className="qb-overline">De</label><input id={id + 'f'} type="date" className="qb-input" style={inputStyle} min={min} max={max} value={value.from} onChange={e => setFrom(e.target.value)} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label htmlFor={id + 't'} className="qb-overline">Até</label><input id={id + 't'} type="date" className="qb-input" style={inputStyle} min={min} max={max} value={value.to} onChange={e => setTo(e.target.value)} /></div>
      {presets.length > 0 && (
        <div className="qb-seg" role="group" aria-label="Intervalos rápidos">
          {presets.map(p => <button key={p.id} type="button" className="qb-seg__opt" aria-pressed={p.from === value.from && p.to === value.to} onClick={() => emit({ from: p.from, to: p.to })}>{p.label}</button>)}
        </div>
      )}
    </div>
  );
}
