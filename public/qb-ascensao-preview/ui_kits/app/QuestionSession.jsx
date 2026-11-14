(() => {
const { BrandHeader, StudySessionHeader, QuestionCard, AnswerActionBar, FeedbackDrawer, CognitiveAlertBanner, Panel, Badge, Button } = window.QuebrandoABancaDesignSystem_3e4054;

function SessionSummary({ answers, go }) {
  const qs = window.QB_DATA.questions;
  const right = qs.filter(q => answers[q.id] && answers[q.id].answer === q.key).length;
  return (
    <Panel variant="ornate" style={{ display: 'flex', flexDirection: 'column', gap: 18 }} padding={32}>
      <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Sessão concluída</span>
      <h1 style={{ font: 'var(--type-h1)' }}>{right} de {qs.length} acertos</h1>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {qs.map(q => { const a = answers[q.id]; const ok = a && a.answer === q.key; return (
          <li key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--divider)' }}>
            <span style={{ font: '500 13px/1 var(--font-mono)', color: 'var(--text-muted)', width: 56 }}>{q.code}</span>
            <span style={{ flex: 1, font: '400 14px/1.4 var(--font-body)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.statement}</span>
            <Badge tone={!a ? 'no-evidence' : ok ? 'correct' : 'incorrect'}>{!a ? 'Pulada' : ok ? 'Acertou' : 'Errou'}</Badge>
          </li>); })}
      </ul>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button iconRight="arrow-right" onClick={() => go('flashcards')}>Seguir para flashcards</Button>
        <Button variant="secondary" icon="house" onClick={() => go('dashboard')}>Voltar ao início</Button>
      </div>
    </Panel>
  );
}

function QuestionSession({ session, setSession, elapsed, paused, onTogglePause, go }) {
  const qs = window.QB_DATA.questions;
  const { idx, answers, drawer, focus, bannerDismissed } = session;
  const done = idx >= qs.length;
  const q = qs[Math.min(idx, qs.length - 1)];
  const st = answers[q.id] || {};
  const [loading, setLoading] = React.useState(false);
  const patch = p => setSession(s => ({ ...s, ...p }));
  const setAns = p => setSession(s => ({ ...s, answers: { ...s.answers, [q.id]: { ...(s.answers[q.id] || {}), ...p } } }));
  const confirm = () => { if (!st.answer) return; setLoading(true); setTimeout(() => { setLoading(false); setAns({ revealed: true }); patch({ drawer: true }); }, 450); };
  const next = () => patch({ idx: idx + 1, drawer: false });
  const openConcept = () => go('map', { node: q.node, returnTo: { label: `questão ${q.code}`, view: 'questions' } });
  const wrong = qs.filter(x => answers[x.id] && answers[x.id].revealed && answers[x.id].answer !== x.key);

  React.useEffect(() => {
    const onKey = e => {
      if (done || e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      if (!st.revealed && (k === 'c' || k === 'e')) setAns({ answer: k.toUpperCase() });
      if (e.key === 'Enter') { st.revealed ? next() : confirm(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!focus && (
        <BrandHeader variant="compact" floating={false} onExit={() => go('dashboard')}>
          <span className="qb-overline">Sessão de questões</span>
          <span style={{ font: '400 16px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>Processo legislativo</span>
        </BrandHeader>
      )}
      <StudySessionHeader subject="Direito Constitucional" topic="Processo legislativo — emendas e medidas provisórias" current={Math.min(idx + 1, qs.length)} total={qs.length} elapsed={elapsed} paused={paused} onTogglePause={onTogglePause} focusMode={focus} onToggleFocus={() => patch({ focus: !focus })} onBack={() => go('dashboard')} />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <main style={{ width: '100%', maxWidth: 820, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {done ? <SessionSummary answers={answers} go={go} /> : (
            <>
              {!focus && wrong.length > 0 && !bannerDismissed && (
                <CognitiveAlertBanner tone="attention" title={`${wrong.length} ${wrong.length > 1 ? 'erros' : 'erro'} nesta sessão`} onDismiss={() => patch({ bannerDismissed: true })}
                  actions={<Button size="sm" variant="secondary" icon="network" onClick={() => go('map', { node: wrong[wrong.length - 1].node, returnTo: { label: `questão ${q.code}`, view: 'questions' } })}>Revisar o conceito no mapa</Button>}>
                  O último erro foi em “{window.QB_DATA.mapNodes.find(n => n.id === wrong[wrong.length - 1].node).label}”.
                </CognitiveAlertBanner>
              )}
              <QuestionCard key={q.id} code={q.code} year={q.year} exam={window.QB_DATA.exam} tags={q.tags} statement={q.statement}
                answer={st.answer || null} onAnswer={a => setAns({ answer: a })} confidence={st.confidence || null} onConfidence={c => setAns({ confidence: c })}
                answerKey={st.revealed ? q.key : null} bookmarked={!!st.bookmarked} onBookmark={() => setAns({ bookmarked: !st.bookmarked })}
                conceptLink={{ label: `Ver no mapa: ${window.QB_DATA.mapNodes.find(n => n.id === q.node).label}`, onClick: openConcept }} />
            </>
          )}
        </main>
        {!done && (
          <FeedbackDrawer open={drawer && st.revealed} onClose={() => patch({ drawer: false })} result={st.answer === q.key ? 'correct' : 'incorrect'} answerKey={q.key}
            explanation={q.explanation} legalBasis={q.basis} trap={q.trap}
            concept={{ path: (() => { const p = []; let n = window.QB_DATA.mapNodes.find(x => x.id === q.node); while (n) { p.unshift(n.label); n = window.QB_DATA.mapNodes.find(x => x.id === n.parent); } return p; })() }}
            onOpenConcept={openConcept} onFlashcards={() => go('flashcards')} />
        )}
      </div>
      {!done && (
        <AnswerActionBar sticky state={st.revealed ? 'answered' : loading ? 'loading' : st.answer ? 'ready' : 'idle'}
          onConfirm={confirm} onNext={next} onSkip={next} onReview={() => setAns({ bookmarked: !st.bookmarked })} reviewMarked={!!st.bookmarked}
          onOpenFeedback={() => patch({ drawer: true })} />
      )}
    </div>
  );
}

Object.assign(window, { QuestionSession });
})();
