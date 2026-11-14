import React from 'react';
import { Button } from '../core/Button.jsx';

export function AnswerActionBar({ state = 'idle', allowSkip = true, onConfirm, onNext, onSkip, onReview, onOpenFeedback, reviewMarked = false, showHints = true, sticky = false, style }) {
  const answered = state === 'answered';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 16px', borderTop: '1px solid var(--divider)', background: 'rgba(10,30,52,.92)', backdropFilter: 'blur(8px)', ...(sticky ? { position: 'sticky', bottom: 0, zIndex: 'var(--z-header)' } : {}), ...style }}>
      {onReview && <Button variant="secondary" size="sm" icon="bookmark" onClick={onReview} aria-pressed={reviewMarked}>{reviewMarked ? 'Na revisão' : 'Marcar para revisão'}</Button>}
      {allowSkip && !answered && onSkip && <Button variant="ghost" size="sm" icon="skip-forward" onClick={onSkip}>Pular</Button>}
      <span style={{ flex: 1 }} />
      {showHints && <span aria-hidden="true" style={{ font: '400 12px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{answered ? 'Enter · próxima' : 'C / E · responder   Enter · confirmar'}</span>}
      {answered && onOpenFeedback && <Button variant="secondary" icon="book-open" onClick={onOpenFeedback}>Ver fundamento</Button>}
      {answered
        ? <Button iconRight="arrow-right" onClick={onNext}>Próxima questão</Button>
        : <Button iconRight="check" onClick={onConfirm} disabled={state === 'idle'} loading={state === 'loading'}>Confirmar resposta</Button>}
    </div>
  );
}
