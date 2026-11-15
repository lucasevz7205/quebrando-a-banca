import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function CompositionTable({ blocks = [], showAvailability = true, style }) {
  let tp = 0, ta = 0;
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table className="qb-table" aria-label="Composição do simulado">
        <thead><tr><th>Bloco / matéria</th><th>Distribuição</th><th className="num">Itens previstos</th>{showAvailability && <th className="num">No banco</th>}{showAvailability && <th>Situação</th>}</tr></thead>
        <tbody>
          {blocks.map(b => {
            const bp = b.subjects.reduce((a, s) => a + s.planned, 0), ba = b.subjects.reduce((a, s) => a + Math.min(s.available, s.planned), 0);
            tp += bp; ta += ba;
            return (
              <React.Fragment key={b.block}>
                <tr className="is-group"><td colSpan={2}>{b.block} · {b.label}</td><td className="num">{bp}</td>{showAvailability && <td className="num">{b.subjects.reduce((a, s) => a + s.available, 0)}</td>}{showAvailability && <td />}</tr>
                {b.subjects.map(s => {
                  const short = s.available < s.planned;
                  return (
                    <tr key={s.name}>
                      <td style={{ color: 'var(--text-primary)', paddingLeft: 24 }}>{s.name}</td>
                      <td><span className={'qb-badge ' + (s.official ? 'qb-badge--gold' : 'qb-badge--neutral')}>{s.official ? 'Oficial' : 'Estimada'}</span></td>
                      <td className="num">{s.planned}</td>
                      {showAvailability && <td className="num">{s.available}</td>}
                      {showAvailability && <td>{short ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--state-attention)', font: '500 13px/1.2 var(--font-body)' }}><Icon name="triangle-alert" size={14} />Faltam {s.planned - s.available}</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--state-correct)', font: '500 13px/1.2 var(--font-body)' }}><Icon name="circle-check" size={14} />Suficiente</span>}</td>}
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
          <tr><td colSpan={2} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Total</td><td className="num" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tp}</td>{showAvailability && <td className="num" style={{ color: 'var(--text-primary)' }}>{ta} utilizáveis</td>}{showAvailability && <td />}</tr>
        </tbody>
      </table>
    </div>
  );
}
