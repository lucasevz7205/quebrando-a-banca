import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
import { Flashcard } from '../flashcards/Flashcard.jsx';

const SAMPLE = 'Texto de exemplo (simulação de leitura): O fiscal do contrato acompanha a execução, anota ocorrências e determina o necessário à regularização de faltas ou defeitos. O gestor coordena as atividades de fiscalização e os atos formais do contrato.';

export function ScannerFlashcards({ deck = [], topicLabel = 'o tópico', style }) {
  const [tab, setTab] = React.useState('cards');
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [rated, setRated] = React.useState([]);
  const [scan, setScan] = React.useState(null);
  const [drafts, setDrafts] = React.useState([]);
  const card = deck[i % Math.max(1, deck.length)];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      <div className="qb-seg" role="group" aria-label="Ferramenta" style={{ alignSelf: 'flex-start' }}>
        <button className="qb-seg__opt" aria-pressed={tab === 'cards'} onClick={() => setTab('cards')}>Flashcards 3D</button>
        <button className="qb-seg__opt" aria-pressed={tab === 'scan'} onClick={() => setTab('scan')}>Scanner</button>
      </div>
      {tab === 'cards' ? (deck.length ? (
        <div style={{ maxWidth: 640, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: '400 13px/1 var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center' }}>Cartão {(i % deck.length) + 1} de {deck.length} · {rated.length} avaliados</span>
          <Flashcard key={i} height={300} deck={topicLabel} front={card.front} back={card.back} flipped={flipped} onFlip={() => setFlipped(f => !f)} onRate={r => { setRated(x => [...x, r]); setFlipped(false); setI(n => n + 1); }} />
        </div>
      ) : <p style={{ color: 'var(--text-muted)' }}>Sem cartões para este tópico.</p>) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>1 · Entrada do material</span>
            {!scan ? (
              <button className="qb-dropzone" onClick={() => setScan(SAMPLE)}>
                <Icon name="scan-line" size={28} color="var(--qb-gold)" />
                <span style={{ font: '600 15px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>Enviar foto ou PDF</span>
                <span style={{ font: '400 13px/1.4 var(--font-body)' }}>Demonstração: clique para carregar um texto de exemplo. Nenhum arquivo é lido.</span>
              </button>
            ) : (
              <>
                <textarea className="qb-textarea" style={{ minHeight: 180 }} value={scan} onChange={e => setScan(e.target.value)} aria-label="Texto reconhecido — revise antes de gerar" />
                <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Revise o texto reconhecido: erros de leitura viram erros nos cartões.</span>
                <div style={{ display: 'flex', gap: 8 }}><Button size="sm" icon="sparkles" onClick={() => setDrafts(scan.split('. ').filter(s => s.length > 20).slice(0, 3).map((s, k) => ({ front: 'Complete: ' + s.split(' ').slice(0, 6).join(' ') + '…', back: s.replace(/\.$/, '') + '.', ok: false, k })))}>Gerar cartões (simulado)</Button><Button size="sm" variant="ghost" onClick={() => { setScan(null); setDrafts([]); }}>Descartar</Button></div>
              </>
            )}
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>2 · Revisão dos cartões</span>
            {!drafts.length ? <p style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-muted)' }}>Os cartões sugeridos aparecem aqui para edição e aprovação.</p> : drafts.map((d, k) => (
              <div key={k} className="qb-panel qb-panel--sunken" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input className="qb-input" value={d.front} onChange={e => setDrafts(x => x.map((y, j) => j === k ? { ...y, front: e.target.value } : y))} aria-label={'Frente do cartão ' + (k + 1)} />
                <textarea className="qb-textarea" style={{ minHeight: 60 }} value={d.back} onChange={e => setDrafts(x => x.map((y, j) => j === k ? { ...y, back: e.target.value } : y))} aria-label={'Verso do cartão ' + (k + 1)} />
                <Button size="sm" variant={d.ok ? 'primary' : 'secondary'} icon={d.ok ? 'check' : 'plus'} onClick={() => setDrafts(x => x.map((y, j) => j === k ? { ...y, ok: !y.ok } : y))}>{d.ok ? 'Aprovado' : 'Aprovar cartão'}</Button>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
