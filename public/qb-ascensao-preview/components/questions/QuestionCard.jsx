import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { Badge } from '../core/Badge.jsx';

const CONF = [['baixa', 'Baixa'], ['media', 'Média'], ['alta', 'Alta']];

export function QuestionCard({ code, board = 'CEBRASPE', year, exam, tags = [], statement, context, answer = null, onAnswer, confidence = null, onConfidence, showConfidence = true, answerKey = null, conceptLink, bookmarked = false, onBookmark, style }) {
  const revealed = answerKey != null;
  const choice = (k, label) => {
    let cls = 'qb-choice';
    let status = null;
    if (revealed) {
      if (k === answerKey) { cls += ' is-correct'; status = answer === k ? 'Sua resposta · correta' : 'Gabarito'; }
      else if (k === answer) { cls += ' is-incorrect'; status = 'Sua resposta · incorreta'; }
    }
    return (
      <button key={k} className={cls} aria-pressed={!revealed && answer === k} disabled={revealed} onClick={() => onAnswer && onAnswer(k)}>
        <span className="qb-choice__key" style={revealed && k === answerKey ? { color: 'var(--state-correct)' } : revealed && k === answer ? { color: 'var(--state-incorrect)' } : null}>{k}</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span>{label}</span>
          {status && <span style={{ font: '500 12px/1.2 var(--font-body)', color: k === answerKey ? 'var(--state-correct)' : 'var(--state-incorrect)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={k === answerKey ? 'circle-check' : 'circle-x'} size={13} strokeWidth={2} />{status}</span>}
        </span>
      </button>
    );
  };
  return (
    <article className="qb-panel" style={{ padding: 'clamp(20px,3vw,32px)', display: 'flex', flexDirection: 'column', gap: 20, ...style }} aria-label={`Questão ${code || ''}`}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {code && <span style={{ font: '500 13px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{code}</span>}
        <Badge tone="gold" icon={null}>{[board, year].filter(Boolean).join(' · ')}</Badge>
        {tags.map(t => <Badge key={t} tone="neutral" icon={null}>{t}</Badge>)}
        <span style={{ flex: 1 }} />
        {onBookmark && <IconButton icon="bookmark" label={bookmarked ? 'Remover da revisão' : 'Marcar para revisão'} pressed={bookmarked} size="sm" onClick={onBookmark} />}
      </header>
      {exam && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)', marginTop: -10 }}>{exam}</span>}
      {context && <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-sunken)', font: '400 15px/1.6 var(--font-body)', color: 'var(--text-secondary)', maxWidth: 'var(--measure)' }}>{context}</div>}
      <p style={{ font: 'var(--type-reading)', color: 'var(--text-primary)', maxWidth: 'var(--measure)' }}>{statement}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ font: '500 13px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>Julgue o item.</span>
        <div role="group" aria-label="Resposta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {choice('C', 'Certo')}{choice('E', 'Errado')}
        </div>
      </div>
      {showConfidence && answer && !revealed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ font: '500 14px/1.2 var(--font-body)', color: 'var(--text-secondary)' }}>Sua confiança</span>
          <div className="qb-seg" role="group" aria-label="Confiança">
            {CONF.map(([v, l]) => <button key={v} className="qb-seg__opt" aria-pressed={confidence === v} onClick={() => onConfidence && onConfidence(v)}>{l}</button>)}
          </div>
        </div>
      )}
      {revealed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--divider)' }}>
          <Badge tone={answer === answerKey ? 'correct' : 'incorrect'}>{answer === answerKey ? 'Você acertou' : 'Você errou'}</Badge>
          {confidence && <span style={{ font: '400 13px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>Confiança: {CONF.find(c => c[0] === confidence)[1].toLowerCase()}</span>}
          <span style={{ flex: 1 }} />
          {conceptLink && <button className="qb-linkbtn" onClick={conceptLink.onClick}><Icon name="network" size={16} />{conceptLink.label}</button>}
        </div>
      )}
    </article>
  );
}
