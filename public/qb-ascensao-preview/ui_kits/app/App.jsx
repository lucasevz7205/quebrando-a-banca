(() => {
const KEY = 'qb-uikit-v2';
const SUBS = { plan: 'hoje', edital: 'lista', study: 'mapa', performance: 'diaria' };
const SESSIONS = ['questions', 'flashcards'];

function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  const [view, setView] = React.useState(() => { const v = new URLSearchParams(location.search).get('view') || saved.view || 'dashboard'; return v === 'nolink' ? 'train' : v; });
  const [subs, setSubs] = React.useState({ ...SUBS, ...(saved.subs || {}) });
  const [ui, setUiState] = React.useState({ bg: 'dynamic', theme: 'dark', focus: false, ...(saved.prefs || {}), collapsed: false, sync: 'ok', quick: false, studio: { open: false }, ctx: null, toasts: [] });
  const [session, setSession] = React.useState({ idx: 0, answers: {}, drawer: false, focus: false, bannerDismissed: false });
  const [cards, setCards] = React.useState({ idx: 0, flipped: false, ratings: [] });
  const [mapSel, setMapSel] = React.useState('em');
  const [mapTopic, setMapTopic] = React.useState('dc-2a');
  const [recentTopics, setRecentTopics] = React.useState([]);
  const [trainSel, setTrainSel] = React.useState({ subjectId: null, topicId: null });
  const [missing, setMissing] = React.useState(null);
  const [backTo, setBackTo] = React.useState('dashboard');
  const [returnTo, setReturnTo] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const setUi = p => setUiState(u => {
    const n = { ...u, ...p };
    if (p.toast) { n.toasts = [...u.toasts, { id: Date.now() + Math.random(), ...p.toast }]; delete n.toast; }
    return n;
  });
  const toast = t => setUi({ toast: t });
  React.useEffect(() => { localStorage.setItem(KEY, JSON.stringify({ view, subs, prefs: { bg: ui.bg, theme: ui.theme, focus: ui.focus } })); }, [view, subs, ui.bg, ui.theme, ui.focus]);
  React.useEffect(() => { window.scrollTo(0, 0); }, [view]);
  React.useEffect(() => {
    if (!SESSIONS.includes(view) || paused) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [view, paused]);

  const go = (v, arg) => {
    if (v === 'map') {
      const o = arg || {};
      setMapTopic(o.topicId || (o.node && window.QB_LINKS.nodeTopic[o.node]) || mapTopic);
      setMapSel(o.node || null); setReturnTo(o.returnTo || null); setSubs(s => ({ ...s, study: 'mapa' })); setView('study'); return;
    }
    if (typeof arg === 'string' && SUBS[v]) setSubs(s => ({ ...s, [v]: arg }));
    if (v === 'tutor') { setUi({ studio: { open: true } }); return; }
    if (SESSIONS.includes(v) && ![...SESSIONS, 'study', 'nolink'].includes(view)) setBackTo(view);
    setView(v);
  };
  const setSub = v => t => setSubs(s => ({ ...s, [v]: t }));
  const openArchitect = (ctx, tool) => setUi({ ctx: ctx || ui.ctx, studio: { open: true, tool }, quick: false });
  // Single entry point for contextual actions: resolve the intent first; no link → explicit "sem vínculo" state.
  const dispatch = (intent, origin) => {
    const from = origin || view, r = window.QB_NAV.resolve(intent);
    if (!r.ok) { setMissing({ intent, reason: r.reason, back: from }); setView('nolink'); return; }
    if (intent.action === 'architect') return openArchitect({ subjectId: intent.subjectId, topicId: intent.topicId, origin: window.QB_VIEW_LABEL[from] });
    if (intent.action === 'mindmap') return go('map', { topicId: intent.topicId, node: r.nodeId, returnTo: { label: window.QB_VIEW_LABEL[from] || 'atividade anterior', view: from } });
    setBackTo(from);
    if (intent.action === 'review') return setView('flashcards');
    setSession(s => r.questionIndex != null ? { ...s, idx: r.questionIndex, drawer: false } : s.idx >= window.QB_DATA.questions.length ? { ...s, idx: 0, drawer: false } : s);
    setView('questions');
  };
  const pickMapTopic = id => { setMapTopic(id); setMapSel(null); setRecentTopics(r => [id, ...r.filter(x => x !== id)].slice(0, 4)); };
  const timer = { elapsed, paused, onTogglePause: () => setPaused(p => !p) };
  const q = window.QB_DATA.questions[Math.min(session.idx, 4)];
  const layer = <ArchitectLayer ui={view === 'questions' && !ui.ctx ? { ...ui, ctx: { subjectId: 'dc', topicId: 'dc-2a', origin: 'questão ' + q.code } } : ui} setUi={setUi} />;

  if (view === 'welcome') return <Welcome onEnter={() => go('dashboard')} />;
  if (view === 'questions') return <>{<QuestionSession session={session} setSession={setSession} go={go} backTo={backTo} {...timer} />}{layer}</>;
  if (view === 'flashcards') return <>{<FlashcardSession cards={cards} setCards={setCards} go={go} backTo={backTo} {...timer} />}{layer}</>;
  const mapProps = { topicId: mapTopic, onTopic: pickMapTopic, recents: recentTopics, selected: mapSel, setSelected: setMapSel, dispatch, returnTo, onReturn: () => { const r = returnTo; setReturnTo(null); setView(r.view); } };
  const shown = view === 'nolink' ? (missing ? missing.back : 'train') : view;
  return (
    <>
      <Shell ui={ui} setUi={setUi} view={shown} quick={view === 'plan' ? subs.plan : null} go={go} wide={view === 'study' || view === 'plan' || view === 'train' || view === 'performance'} plain={shown === 'performance'}>
        {view === 'dashboard' && <Dashboard go={go} openArchitect={() => openArchitect()} />}
        {view === 'plan' && <PlanScreen tab={subs.plan} setTab={setSub('plan')} go={go} openArchitect={openArchitect} toast={toast} />}
        {view === 'edital' && <EditalScreen tab={subs.edital} setTab={setSub('edital')} go={go} openArchitect={openArchitect} toast={toast} />}
        {view === 'train' && <TrainScreen go={go} openArchitect={openArchitect} dispatch={dispatch} sel={trainSel} setSel={setTrainSel} />}
        {view === 'nolink' && missing && <MissingLink missing={missing} go={go} onBack={() => setView(missing.back)} />}
        {view === 'study' && <StudyScreen tab={subs.study} setTab={setSub('study')} go={go} mapProps={mapProps} />}
        {view === 'simulado' && <SimuladoScreen toast={toast} />}
        {view === 'performance' && <PerformanceScreen tab={subs.performance} setTab={setSub('performance')} go={go} dispatch={dispatch} />}
      </Shell>
      {layer}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
