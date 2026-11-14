import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { Badge } from '../core/Badge.jsx';
import { Button } from '../core/Button.jsx';

function Section({ title, icon, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 12px/1.2 var(--font-body)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--qb-gold)' }}><Icon name={icon} size={16} />{title}</h3>
      {children}
    </section>
  );
}

export function FeedbackDrawer({ open = true, mode = 'drawer', onClose, result, answerKey, explanation, legalBasis, trap, concept, onOpenConcept, onFlashcards, style }) {
  const [showTrap, setShowTrap] = React.useState(result === 'incorrect');
  React.useEffect(() => { setShowTrap(result === 'incorrect'); }, [result]);
  if (!open) return null;
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--qb-gold)', font: '600 26px/1 var(--font-display)', color: 'var(--qb-gold)', flexShrink: 0 }} aria-hidden="true">{answerKey}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ font: '400 22px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>Gabarito: {answerKey === 'C' ? 'Certo' : 'Errado'}</span>
          {result && <Badge tone={result}>{result === 'correct' ? 'Você acertou' : 'Você errou'}</Badge>}
        </div>
      </div>
      {explanation && (
        <Section title="Fundamento" icon="scale">
          <p style={{ font: '400 16px/1.65 var(--font-body)', color: 'var(--text-secondary)' }}>{explanation}</p>
          {legalBasis && <span style={{ font: '500 13px/1.4 var(--font-mono)', color: 'var(--text-muted)' }}>{legalBasis}</span>}
        </Section>
      )}
      {trap && (
        <Section title="Mecanismo da pegadinha" icon="shield-alert">
          {showTrap ? (
            <div style={{ padding: 16, borderRadius: 12, background: 'var(--surface-sunken)', border: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ font: '600 15px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{trap.name}</span>
              <span style={{ font: '400 15px/1.6 var(--font-body)', color: 'var(--text-secondary)' }}>{trap.description}</span>
            </div>
          ) : <button className="qb-linkbtn" onClick={() => setShowTrap(true)}><Icon name="chevron-down" size={16} />Ver como o item tenta induzir ao erro</button>}
        </Section>
      )}
      {concept && (
        <Section title="Conceito no mapa" icon="network">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, font: '400 14px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
            {concept.path.map((p, i) => <React.Fragment key={i}>{i > 0 && <Icon name="chevron-right" size={14} />}<span style={i === concept.path.length - 1 ? { color: 'var(--text-primary)', fontWeight: 500 } : null}>{p}</span></React.Fragment>)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" icon="locate-fixed" onClick={onOpenConcept}>Abrir nó exato</Button>
            {onFlashcards && <Button variant="ghost" size="sm" icon="layers" onClick={onFlashcards}>Criar flashcard</Button>}
          </div>
        </Section>
      )}
    </div>
  );
  if (mode === 'inline') return <div className="qb-panel" style={{ display: 'flex', flexDirection: 'column', ...style }}>{body}</div>;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 'var(--z-drawer)', display: 'flex', justifyContent: 'flex-end', ...style }}>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,15,.55)' }} />
      <aside role="dialog" aria-label="Correção da questão" style={{ position: 'relative', width: 'min(460px,100%)', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderLeft: '1px solid rgba(208,179,134,.45)', boxShadow: 'var(--shadow-drawer)', animation: 'qb-rise var(--dur-slow) var(--ease-enter)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 12px 24px', borderBottom: '1px solid var(--divider)' }}>
          <span className="qb-overline">Correção</span>
          {onClose && <IconButton icon="x" label="Fechar correção" onClick={onClose} />}
        </div>
        {body}
      </aside>
    </div>
  );
}
