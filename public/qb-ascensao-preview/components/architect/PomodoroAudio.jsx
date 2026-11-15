import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

export function PomodoroAudio({ focusMin = 25, breakMin = 5, style }) {
  const [phase, setPhase] = React.useState('foco');
  const [left, setLeft] = React.useState(focusMin * 60);
  const [run, setRun] = React.useState(false);
  const [done, setDone] = React.useState(0);
  const [audio, setAudio] = React.useState(false);
  const [vol, setVol] = React.useState(40);
  const [kind, setKind] = React.useState('ruido');
  React.useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft(l => {
      if (l > 1) return l - 1;
      if (phase === 'foco') { setDone(d => d + 1); setPhase('pausa'); return breakMin * 60; }
      setPhase('foco'); return focusMin * 60;
    }), 1000);
    return () => clearInterval(t);
  }, [run, phase]);
  const total = (phase === 'foco' ? focusMin : breakMin) * 60;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, ...style }}>
      <section className="qb-panel qb-panel--sunken" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }} aria-label="Pomodoro">
        <span className="qb-overline" style={{ color: phase === 'foco' ? 'var(--qb-gold)' : 'var(--state-correct)' }}>{phase === 'foco' ? 'Foco' : 'Pausa'} · ciclo {done + 1}</span>
        <span role="timer" aria-label={'Tempo restante ' + fmt(left)} style={{ font: '500 56px/1 var(--font-mono)', color: 'var(--text-primary)' }}>{fmt(left)}</span>
        <div style={{ width: '100%', height: 4, borderRadius: 999, background: 'var(--state-progress-track)' }}><div style={{ width: (1 - left / total) * 100 + '%', height: '100%', borderRadius: 999, background: phase === 'foco' ? 'var(--qb-gold-bright)' : 'var(--state-correct)' }} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={run ? 'pause' : 'play'} onClick={() => setRun(r => !r)}>{run ? 'Pausar' : 'Iniciar'}</Button>
          <Button variant="secondary" icon="rotate-ccw" onClick={() => { setRun(false); setPhase('foco'); setLeft(focusMin * 60); }}>Reiniciar</Button>
          <Button variant="ghost" icon="skip-forward" onClick={() => { setPhase(p => p === 'foco' ? 'pausa' : 'foco'); setLeft((phase === 'foco' ? breakMin : focusMin) * 60); }}>Pular</Button>
        </div>
        <span style={{ font: '400 13px/1 var(--font-body)', color: 'var(--text-muted)' }}>{done} blocos de foco concluídos · {focusMin}/{breakMin} min</span>
      </section>
      <section className="qb-panel qb-panel--sunken" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Áudio de fundo">
        <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Áudio Alfa · fundo sonoro</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button variant={audio ? 'primary' : 'secondary'} icon={audio ? 'pause' : 'headphones'} onClick={() => setAudio(a => !a)}>{audio ? 'Pausar áudio' : 'Tocar áudio'}</Button>
          <span role="status" style={{ font: '400 13px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>{audio ? 'Tocando (simulação — sem som nesta demo)' : 'Parado'}</span>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}>Tipo
          <select className="qb-select" value={kind} onChange={e => setKind(e.target.value)}><option value="ruido">Ruído marrom</option><option value="chuva">Chuva</option><option value="binaural">Tons binaurais (requer fones)</option></select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}><Icon name={vol ? 'volume-2' : 'volume-x'} size={18} />Volume
          <input type="range" min="0" max="100" value={vol} onChange={e => setVol(+e.target.value)} style={{ flex: 1, accentColor: 'var(--qb-gold)' }} aria-label="Volume" /><span style={{ fontFamily: 'var(--font-mono)', width: 32 }}>{vol}</span>
        </label>
        <p style={{ font: '400 12px/1.5 var(--font-body)', color: 'var(--text-muted)' }}>Recurso de conforto sonoro. Não há garantia de benefício cognitivo, de concentração ou médico.</p>
      </section>
    </div>
  );
}
