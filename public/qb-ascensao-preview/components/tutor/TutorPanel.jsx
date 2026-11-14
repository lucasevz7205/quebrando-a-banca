import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

function Bubble({ m, onRef }) {
  const tutor = m.role === 'tutor';
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: tutor ? 'flex-start' : 'flex-end' }}>
      {tutor && <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(208,179,134,.6)', background: 'var(--qb-navy-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="qb-img qb-mark-q-sword" style={{ width: 20, height: 22, backgroundSize: 'contain' }} /></span>}
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', borderRadius: tutor ? '4px 14px 14px 14px' : '14px 4px 14px 14px', background: tutor ? 'var(--surface)' : 'var(--qb-navy-hover)', border: tutor ? 'var(--border-hairline)' : '1px solid rgba(208,179,134,.5)', font: '400 15px/1.6 var(--font-body)', color: 'var(--text-primary)' }}>
        <div>{m.text}</div>
        {m.refs && m.refs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {m.refs.map(r => <button key={r.id} className="qb-chip" style={{ minHeight: 28, fontSize: 12 }} onClick={() => onRef && onRef(r.id)}><Icon name={r.kind === 'question' ? 'list-checks' : 'network'} size={13} />{r.label}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function TutorPanel({ messages = [], onSend, suggestions = [], contextLabel, demo = true, thinking = false, onRef, onClose, title = 'Tutor', style }) {
  const [text, setText] = React.useState('');
  const listRef = React.useRef(null);
  React.useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages.length, thinking]);
  const send = v => { const t = (v ?? text).trim(); if (!t) return; onSend && onSend(t); setText(''); };
  return (
    <section className="qb-panel" aria-label={title} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 420, ...style }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 20px', borderBottom: '1px solid var(--divider)' }}>
        <Icon name="message-circle" size={18} color="var(--qb-gold)" />
        <span style={{ font: '600 16px/1.2 var(--font-serif)', fontSize: 19, color: 'var(--text-primary)' }}>{title}</span>
        {demo && <span className="qb-badge qb-badge--neutral" title="Respostas simuladas; sem conexão com IA real nem memória persistente">Demonstração</span>}
        <span style={{ flex: 1 }} />
        {onClose && <IconButton icon="x" label="Fechar tutor" size="sm" onClick={onClose} />}
      </header>
      {contextLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--divider)', font: '400 13px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>
          <Icon name="link" size={14} />Contexto: <span style={{ color: 'var(--text-secondary)' }}>{contextLabel}</span>
        </div>
      )}
      <div ref={listRef} role="log" aria-live="polite" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}>
        {messages.map((m, i) => <Bubble key={i} m={m} onRef={onRef} />)}
        {thinking && <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 13px/1 var(--font-body)', color: 'var(--text-muted)', paddingLeft: 42 }}><Icon name="loader-circle" size={14} className="qb-spin" />Elaborando resposta…</div>}
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 12px' }}>
          {suggestions.map(s => <button key={s} className="qb-chip" onClick={() => send(s)}>{s}</button>)}
        </div>
      )}
      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--divider)' }}>
        <input className="qb-input" value={text} onChange={e => setText(e.target.value)} placeholder="Pergunte sobre o conceito ou a questão…" aria-label="Mensagem ao tutor" />
        <button type="submit" className="qb-btn qb-btn--primary" style={{ width: 44, padding: 0, flexShrink: 0 }} aria-label="Enviar" disabled={!text.trim()}><Icon name="send" size={18} /></button>
      </form>
      {demo && <p style={{ padding: '0 20px 12px', font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Respostas simuladas para demonstração. Confira sempre a fonte legal.</p>}
    </section>
  );
}
