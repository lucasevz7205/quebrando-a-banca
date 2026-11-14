(() => {
const { BrandHeader, StudySessionHeader, Flashcard, Panel, AchievementEmblem, Button } = window.QuebrandoABancaDesignSystem_3e4054;

function FlashcardSession({ cards, setCards, elapsed, paused, onTogglePause, go }) {
  const D = window.QB_DATA;
  const { idx, flipped, ratings } = cards;
  const done = idx >= D.flashcards.length;
  const card = D.flashcards[Math.min(idx, D.flashcards.length - 1)];
  const node = D.mapNodes.find(n => n.id === card.node);
  const parent = node && D.mapNodes.find(n => n.id === node.parent);
  const rate = r => setCards(c => ({ idx: c.idx + 1, flipped: false, ratings: [...c.ratings, r] }));

  React.useEffect(() => {
    const onKey = e => { if (!done && e.key === ' ') { e.preventDefault(); setCards(c => ({ ...c, flipped: !c.flipped })); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BrandHeader variant="compact" floating={false} onExit={() => go('dashboard')}>
        <span className="qb-overline">Revisão espaçada</span>
        <span style={{ font: '400 16px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>Processo legislativo</span>
      </BrandHeader>
      <StudySessionHeader subject="Flashcards · Direito Constitucional" topic="Processo legislativo" unit="Cartão" current={Math.min(idx + 1, D.flashcards.length)} total={D.flashcards.length} elapsed={elapsed} paused={paused} onTogglePause={onTogglePause} onBack={() => go('dashboard')} />
      <main style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '40px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {done ? (
          <Panel variant="ornate" padding={32} style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            <AchievementEmblem variant="sabio" state="in-progress" progress={0.62} size={110} rule="Rumo a 200 flashcards revisados" />
            <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Revisão concluída</span>
              <h1 style={{ font: 'var(--type-h1)' }}>{ratings.length} cartões revisados</h1>
              <p style={{ font: 'var(--type-body)', color: 'var(--text-secondary)' }}>{ratings.filter(r => r === 'errei').length} marcados como “Errei” voltam ainda nesta sessão. Os intervalos são ilustrativos nesta demonstração.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                <Button icon="house" onClick={() => go('dashboard')}>Voltar ao início</Button>
                <Button variant="secondary" icon="rotate-ccw" onClick={() => setCards({ idx: 0, flipped: false, ratings: [] })}>Revisar de novo</Button>
              </div>
            </div>
          </Panel>
        ) : (
          <>
            <Flashcard key={idx} deck="Constitucional" height={380} front={card.front}
              back={<><p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 19, lineHeight: 1.5 }}>{card.back}</p><p style={{ margin: '14px 0 0', font: '400 13px/1.4 var(--font-mono)', color: 'var(--text-muted)' }}>{card.basis}</p></>}
              origin={node && `${parent ? parent.label + ' › ' : ''}${node.label}`} onOpenOrigin={() => go('map', { node: card.node, returnTo: { label: 'revisão de flashcards', view: 'flashcards' } })}
              flipped={flipped} onFlip={() => setCards(c => ({ ...c, flipped: !c.flipped }))} onRate={rate} />
            {!flipped && <span style={{ textAlign: 'center', font: '400 12px/1 var(--font-mono)', color: 'var(--text-muted)' }}>Espaço · virar cartão</span>}
          </>
        )}
      </main>
    </div>
  );
}

Object.assign(window, { FlashcardSession });
})();
