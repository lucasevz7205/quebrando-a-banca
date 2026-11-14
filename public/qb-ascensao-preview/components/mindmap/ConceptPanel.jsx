import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { Badge } from '../core/Badge.jsx';
import { Button } from '../core/Button.jsx';

const H = ({ children }) => <h3 className="qb-overline" style={{ color: 'var(--qb-gold)' }}>{children}</h3>;

export function ConceptPanel({ title, path = [], mastery, summary, example, connections = [], sources = [], onNavigate, onReview, reviewCount, returnTo, onReturn, onClose, style }) {
  const tone = mastery && mastery.state;
  return (
    <aside className="qb-panel" aria-label={`Conceito: ${title}`} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', ...style }}>
      {returnTo && (
        <button onClick={onReturn} className="qb-navlink" style={{ height: 44, borderRadius: 0, justifyContent: 'flex-start', padding: '0 20px', borderBottom: '1px solid var(--divider)', background: 'rgba(242,199,110,.06)', color: 'var(--qb-gold-bright)', width: '100%' }}>
          <Icon name="corner-up-left" size={16} />Voltar à {returnTo}
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: 24, overflowY: 'auto' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
              {path.map((p, i) => <React.Fragment key={i}>{i > 0 && <Icon name="chevron-right" size={13} />}<span>{p}</span></React.Fragment>)}
            </div>
            {onClose && <IconButton icon="x" label="Fechar painel" size="sm" onClick={onClose} />}
          </div>
          <h2 style={{ font: '400 26px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>{title}</h2>
          {mastery && <div><Badge tone={tone === 'progress' ? 'attention' : tone}>{mastery.text}</Badge></div>}
        </header>
        {summary && <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><H>Resumo</H><p style={{ font: '400 16px/1.65 var(--font-body)', color: 'var(--text-secondary)', maxWidth: 'var(--measure)' }}>{summary}</p></section>}
        {example && <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><H>Exemplo</H><div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-sunken)', font: '400 15px/1.6 var(--font-body)', color: 'var(--text-secondary)' }}>{example}</div></section>}
        {connections.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><H>Conexões</H>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {connections.map(c => <button key={c.id} className="qb-chip" onClick={() => onNavigate && onNavigate(c.id)}>{c.relation && <span style={{ color: 'var(--text-muted)' }}>{c.relation}</span>}{c.label}<Icon name="arrow-right" size={14} /></button>)}
            </div>
          </section>
        )}
        {onReview && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><H>Revisão ativa</H>
            <Button variant="secondary" icon="layers" onClick={onReview} fullWidth>{reviewCount ? `Revisar ${reviewCount} flashcards deste conceito` : 'Revisar este conceito'}</Button>
          </section>
        )}
        {sources.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><H>Fontes</H>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sources.map((s, i) => <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', font: '400 13px/1.45 var(--font-mono)', color: 'var(--text-muted)' }}><Icon name="file-text" size={14} style={{ marginTop: 2 }} />{s}</li>)}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}
