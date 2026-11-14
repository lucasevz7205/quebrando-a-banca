(() => {
const KEY = 'qb-uikit-view';

function App() {
  const [view, setView] = React.useState(() => new URLSearchParams(location.search).get('view') || localStorage.getItem(KEY) || 'dashboard');
  const [session, setSession] = React.useState({ idx: 0, answers: {}, drawer: false, focus: false, bannerDismissed: false });
  const [cards, setCards] = React.useState({ idx: 0, flipped: false, ratings: [] });
  const [mapSel, setMapSel] = React.useState('em');
  const [returnTo, setReturnTo] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => { localStorage.setItem(KEY, view); window.scrollTo(0, 0); }, [view]);
  React.useEffect(() => {
    if (!['questions', 'flashcards'].includes(view) || paused) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [view, paused]);

  const go = (v, opts = {}) => {
    if (v === 'map') { if (opts.node) setMapSel(opts.node); setReturnTo(opts.returnTo || null); }
    setView(v);
  };
  const progress = { answered: Object.values(session.answers).filter(a => a.revealed).length, cards: cards.ratings.length };
  const timer = { elapsed, paused, onTogglePause: () => setPaused(p => !p) };

  if (view === 'welcome') return <Welcome onEnter={() => go('dashboard')} />;
  if (view === 'questions') return <QuestionSession session={session} setSession={setSession} go={go} {...timer} />;
  if (view === 'flashcards') return <FlashcardSession cards={cards} setCards={setCards} go={go} {...timer} />;
  return (
    <AppShell active={view} onNavigate={go} onProfile={() => go('welcome')} wide={view === 'map'}>
      {view === 'dashboard' && <Dashboard go={go} progress={progress} />}
      {view === 'map' && <MindMapScreen selected={mapSel} setSelected={setMapSel} returnTo={returnTo} onReturn={() => { const r = returnTo; setReturnTo(null); go(r.view); }} go={go} />}
      {view === 'tutor' && <TutorScreen session={session} go={go} />}
    </AppShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
