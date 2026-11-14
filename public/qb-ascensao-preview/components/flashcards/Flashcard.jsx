import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

const RATES = [['errei', 'Errei'], ['dificil', 'Difícil'], ['bom', 'Bom'], ['facil', 'Fácil']];

export function Flashcard({ front, back, deck, origin, onOpenOrigin, flipped: flippedProp, onFlip, onRate, intervals = { errei: '< 1 min', dificil: '10 min', bom: '1 d', facil: '4 d' }, demo = true, height = 360, style }) {
  const [inner, setInner] = React.useState(false);
  const flipped = flippedProp ?? inner;
  const flip = () => { setInner(f => !f); onFlip && onFlip(!flipped); };
  const face = { background: 'var(--surface)', border: '1px solid rgba(208,179,134,.5)', boxShadow: 'var(--shadow-raised)', padding: 'clamp(20px,3vw,32px)', gap: 16 };
  const Head = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span className="qb-overline">{label}</span>
      {deck && <span style={{ font: '400 13px/1 var(--font-body)', color: 'var(--text-muted)' }}>{deck}</span>}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div className="qb-flash" style={{ height }}>
        <div className={`qb-flash__inner ${flipped ? 'is-flipped' : ''}`}>
          <section className="qb-flash__face" style={face} aria-hidden={flipped}>
            <Head label="Frente" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <p style={{ font: '400 clamp(20px,2.4vw,26px)/1.4 var(--font-heading)', color: 'var(--text-primary)', maxWidth: '30ch' }}>{front}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="secondary" icon="repeat" onClick={flip} tabIndex={flipped ? -1 : 0}>Mostrar resposta</Button>
            </div>
          </section>
          <section className="qb-flash__face qb-flash__face--back" style={face} aria-hidden={!flipped}>
            <Head label="Verso" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowY: 'auto' }}>
              <div style={{ font: '400 17px/1.65 var(--font-body)', color: 'var(--text-secondary)', maxWidth: 'var(--measure)', margin: '0 auto' }}>{back}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              {origin ? <button className="qb-linkbtn" onClick={onOpenOrigin} tabIndex={flipped ? 0 : -1}><Icon name="network" size={15} />Origem: {origin}</button> : <span />}
              <button className="qb-linkbtn" onClick={flip} tabIndex={flipped ? 0 : -1} style={{ color: 'var(--text-muted)' }}><Icon name="repeat" size={15} />Ver frente</button>
            </div>
          </section>
        </div>
      </div>
      {flipped && onRate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div role="group" aria-label="Autoavaliação" style={{ display: 'flex', gap: 8 }}>
            {RATES.map(([k, l]) => <button key={k} className="qb-rate" onClick={() => onRate(k)}>{l}<small>{intervals[k]}</small></button>)}
          </div>
          {demo && <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)', textAlign: 'center' }}>Intervalos ilustrativos — modo demonstração, sem agendamento real.</span>}
        </div>
      )}
    </div>
  );
}
