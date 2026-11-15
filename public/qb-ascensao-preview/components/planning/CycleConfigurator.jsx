import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CycleConfigurator({ hours = [0, 0, 0, 0, 0, 0, 0], onHoursChange, cycle = [], onCycleChange, available = [], style }) {
  const weekH = hours.reduce((a, b) => a + b, 0);
  const cycleMin = cycle.reduce((a, c) => a + c.minutes, 0);
  const days = weekH ? (cycleMin / 60) / (weekH / 7) : null;
  const move = (i, d) => { const c = cycle.slice(); const j = i + d; if (j < 0 || j >= c.length) return; [c[i], c[j]] = [c[j], c[i]]; onCycleChange && onCycleChange(c); };
  const setMin = (i, m) => { const c = cycle.slice(); c[i] = { ...c[i], minutes: Math.max(15, m) }; onCycleChange && onCycleChange(c); };
  const remove = i => onCycleChange && onCycleChange(cycle.filter((_, k) => k !== i));
  const addable = available.filter(a => !cycle.some(c => c.subjectId === a.id));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, ...style }}>
      <section className="qb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Horas disponíveis por dia">
        <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Horas disponíveis por dia</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 6 }}>
          {WD.map((d, i) => (
            <label key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, font: '500 12px/1 var(--font-body)', color: 'var(--text-muted)' }}>{d}
              <input type="number" min="0" max="16" step="0.5" className="qb-input" value={hours[i]} onChange={e => { const h = hours.slice(); h[i] = Math.max(0, +e.target.value); onHoursChange && onHoursChange(h); }} style={{ textAlign: 'center', padding: '8px 4px', fontFamily: 'var(--font-mono)' }} aria-label={'Horas em ' + d} />
            </label>
          ))}
        </div>
        <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>Total semanal: <strong style={{ color: 'var(--text-primary)' }}>{weekH} h</strong></span>
      </section>
      <section className="qb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }} aria-label="Sequência de matérias do ciclo">
        <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Sequência do ciclo</span>
        <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Ordem em que as matérias se repetem, independente do dia da semana.</span>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cycle.map((c, i) => (
            <li key={c.subjectId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 10, background: 'var(--surface-sunken)', border: 'var(--border-hairline)' }}>
              <span style={{ width: 24, font: '600 13px/1 var(--font-mono)', color: 'var(--qb-gold)', textAlign: 'center' }}>{i + 1}</span>
              <span style={{ flex: 1, minWidth: 0, font: '500 14px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{c.name}</span>
              <input type="number" min="15" step="15" className="qb-input" value={c.minutes} onChange={e => setMin(i, +e.target.value)} aria-label={'Minutos de ' + c.name} style={{ width: 76, minHeight: 36, padding: '6px 8px', fontFamily: 'var(--font-mono)', textAlign: 'right' }} />
              <span style={{ font: '400 12px/1 var(--font-body)', color: 'var(--text-muted)' }}>min</span>
              <IconButton size="sm" icon="chevron-up" label={'Subir ' + c.name} onClick={() => move(i, -1)} disabled={i === 0} />
              <IconButton size="sm" icon="chevron-down" label={'Descer ' + c.name} onClick={() => move(i, 1)} disabled={i === cycle.length - 1} />
              <IconButton size="sm" icon="x" label={'Remover ' + c.name} onClick={() => remove(i)} />
            </li>
          ))}
        </ol>
        {addable.length > 0 && (
          <select className="qb-select" value="" onChange={e => { const a = available.find(x => x.id === e.target.value); if (a) onCycleChange && onCycleChange([...cycle, { subjectId: a.id, name: a.name, minutes: 60 }]); }} aria-label="Adicionar matéria ao ciclo">
            <option value="">+ Adicionar matéria ao ciclo</option>{addable.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>Uma volta: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(cycleMin / 6) / 10} h</strong>{days ? ' · cerca de ' + Math.round(days * 10) / 10 + ' dias com a carga atual' : ''}</span>
      </section>
    </div>
  );
}
