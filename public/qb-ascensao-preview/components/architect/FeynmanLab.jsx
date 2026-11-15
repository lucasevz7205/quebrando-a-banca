import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

const JARGON = ['outrossim', 'destarte', 'ínsito', 'consectário', 'mister', 'exegese', 'hermenêutica', 'precípuo'];

export function FeynmanLab({ topicLabel = 'o tópico', style }) {
  const [text, setText] = React.useState('');
  const [fb, setFb] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const evaluate = () => {
    setBusy(true);
    setTimeout(() => {
      const words = text.trim().split(/\s+/).filter(Boolean);
      const jar = JARGON.filter(j => text.toLowerCase().includes(j));
      const longSent = text.split(/[.!?]/).filter(s => s.trim().split(/\s+/).length > 30).length;
      setFb({ words: words.length, jargon: jar, longSent, example: /por exemplo|exemplo|como quando/i.test(text) });
      setBusy(false);
    }, 700);
  };
  const Item = ({ ok, children }) => <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start', font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}><Icon name={ok ? 'circle-check' : 'triangle-alert'} size={16} color={ok ? 'var(--state-correct)' : 'var(--state-attention)'} style={{ marginTop: 2 }} />{children}</li>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, ...style }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>1 · Explique com suas palavras</span>
        <p style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-muted)' }}>Explique <strong style={{ color: 'var(--text-primary)' }}>{topicLabel}</strong> como se fosse para alguém sem formação jurídica. Use um exemplo.</p>
        <textarea className="qb-textarea" style={{ minHeight: 200 }} value={text} onChange={e => setText(e.target.value)} placeholder="Comece pela ideia central…" aria-label="Sua explicação" />
        <div style={{ display: 'flex', gap: 8 }}><Button icon="sparkles" loading={busy} disabled={text.trim().length < 20} onClick={evaluate}>Avaliar explicação</Button><Button variant="ghost" onClick={() => { setText(''); setFb(null); }}>Recomeçar</Button></div>
      </section>
      <section className="qb-panel qb-panel--sunken" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} aria-live="polite">
        <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>2 · Feedback (simulado)</span>
        {!fb ? <p style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-muted)' }}>Escreva pelo menos 20 caracteres e avalie. O feedback desta demonstração usa regras simples de texto — não é correção por IA.</p> : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Item ok={fb.words >= 40}>{fb.words} palavras {fb.words < 40 ? '— desenvolva um pouco mais a ideia central.' : '— extensão adequada.'}</Item>
            <Item ok={!fb.jargon.length}>{fb.jargon.length ? 'Jargão detectado: ' + fb.jargon.join(', ') + '. Troque por palavras comuns.' : 'Sem jargão excessivo.'}</Item>
            <Item ok={!fb.longSent}>{fb.longSent ? fb.longSent + ' frase(s) muito longa(s). Divida em frases curtas.' : 'Frases curtas e claras.'}</Item>
            <Item ok={fb.example}>{fb.example ? 'Há um exemplo concreto.' : 'Inclua um exemplo concreto ("por exemplo…").'}</Item>
            <li style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--text-muted)', marginTop: 6 }}>Próximo passo: volte ao material só nos pontos marcados e reescreva.</li>
          </ul>
        )}
      </section>
    </div>
  );
}
