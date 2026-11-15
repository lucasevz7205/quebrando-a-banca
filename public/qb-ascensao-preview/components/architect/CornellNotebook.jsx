import React from 'react';
import { Button } from '../core/Button.jsx';

export function CornellNotebook({ topicLabel = 'o tópico', style }) {
  const [notes, setNotes] = React.useState('');
  const [cues, setCues] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [hide, setHide] = React.useState(false);
  const suggest = () => {
    const s = notes.split(/[.\n]/).map(x => x.trim()).filter(x => x.split(' ').length > 3).slice(0, 4);
    setCues(s.map(x => '• ' + x.split(' ').slice(0, 5).join(' ') + '…?').join('\n') || '• Qual a ideia central?\n• Qual a exceção?\n• Qual o dispositivo?');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--text-muted)', flex: 1 }}>Caderno de <strong style={{ color: 'var(--text-primary)' }}>{topicLabel}</strong></span>
        <Button size="sm" variant="secondary" icon="sparkles" disabled={notes.trim().length < 20} onClick={suggest}>Sugerir pistas (simulado)</Button>
        <Button size="sm" variant="ghost" icon={hide ? 'eye' : 'eye-off'} onClick={() => setHide(h => !h)}>{hide ? 'Mostrar notas' : 'Esconder notas para evocar'}</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) minmax(0,2.2fr)', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Pistas / perguntas</span><textarea className="qb-textarea" style={{ minHeight: 220 }} value={cues} onChange={e => setCues(e.target.value)} placeholder="Perguntas que suas notas respondem" /></label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Notas</span>
          {hide ? <div className="qb-textarea" style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Notas ocultas — responda às pistas de memória.</div>
            : <textarea className="qb-textarea" style={{ minHeight: 220 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações durante a leitura ou aula" />}
        </label>
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Síntese</span><textarea className="qb-textarea" style={{ minHeight: 90 }} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Resuma em 2–3 frases, com suas palavras" /></label>
    </div>
  );
}
