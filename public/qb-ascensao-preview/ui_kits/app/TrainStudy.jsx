(() => {
const { PageHeader, Tabs, Panel, Button, Badge, EmptyState, TrainingRadial } = window.QuebrandoABancaDesignSystem_3e4054;
const VIEW_LABEL = { train: 'Treinar', study: 'Estudo', dashboard: 'Menu principal', edital: 'Edital', plan: 'Planejamento', performance: 'Desempenho', questions: 'sessão de questões', flashcards: 'revisão de flashcards' };

function TrainScreen({ go, openArchitect, dispatch, sel, setSel }) {
  const E = window.QB_EDITAL, N = window.QB_NAV;
  const late = Object.values(window.QB_PLAN.weeks).flat().filter(t => t.status === 'late');
  const weak = E.subjects.flatMap(s => s.topics.filter(t => t.correct + t.wrong >= 10).map(t => ({ s, t, acc: t.correct / (t.correct + t.wrong) * 100, n: t.correct + t.wrong }))).sort((a, b) => a.acc - b.acc).slice(0, 6);
  const linkInfo = (subjectId, topicId, action) => { const r = N.resolve({ action, subjectId, topicId }); return { available: r.ok, nodeId: r.nodeId, note: r.ok ? r.note : 'Sem vínculo na demonstração' }; };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader overline="Treinar · questões CEBRASPE (Certo/Errado)" title="Treinar" description="Escolha a matéria e o assunto no anel; cada assunto abre quatro ações com o contexto preservado." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <Panel variant="ornate" style={{ flex: '1 1 600px', minWidth: 0 }}>
          <TrainingRadial subjects={E.subjects} value={sel} onChange={setSel} pending={N.pendingByTopic} linkInfo={linkInfo} onAction={i => dispatch(i, 'train')} />
        </Panel>
        <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Rodada sugerida</span>
            <h2 style={{ font: 'var(--type-h2)' }}>Processo legislativo · 5 itens</h2>
            <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>Emendas e medidas provisórias (DC 2a). Cerca de 10 minutos.</span>
            <Button iconRight="arrow-right" onClick={() => dispatch({ action: 'train', subjectId: 'dc', topicId: 'dc-2a' }, 'train')}>Iniciar rodada</Button>
          </Panel>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="qb-overline">Revisões e pendências</span>
            <span style={{ font: '600 32px/1 var(--font-body)', color: 'var(--text-primary)' }}>{late.length}</span>
            <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>atividades atrasadas no planejamento ({late.filter(t => t.auto).length} revisões automáticas).</span>
            <Button variant="secondary" icon="calendar-days" onClick={() => go('plan', 'hoje')}>Ver no planejamento</Button>
          </Panel>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="qb-overline">Armadilhas da banca</span>
            <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>Treine padrões frequentes de pegadinha com O Arquiteto no modo Banca CEBRASPE.</span>
            <Button variant="secondary" icon="sparkles" onClick={() => openArchitect({ subjectId: 'dc', origin: 'Treinar · armadilhas' })}>Abrir O Arquiteto</Button>
          </Panel>
        </div>
      </div>
      <Panel style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}><h2 style={{ font: 'var(--type-h2)' }}>Assuntos com menor taxa de acertos</h2><span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Somente assuntos com pelo menos 10 respostas válidas.</span></div>
        {weak.map(({ s, t, acc, n }) => (
          <div key={t.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid var(--divider)' }}>
            <span style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}><span style={{ font: '500 14px/1.3 var(--font-body)', color: 'var(--text-primary)' }}><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--qb-gold)', marginRight: 8 }}>{s.short} {t.num}</span>{t.title || 'Título não disponível'}</span><span style={{ font: '400 12px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{s.name}</span></span>
            <span style={{ font: '500 13px/1.2 var(--font-mono)', color: acc < 60 ? 'var(--state-incorrect)' : 'var(--text-secondary)' }}>{Math.round(acc)}% · {t.correct}/{n}</span>
            <Button size="sm" variant="secondary" icon="locate-fixed" onClick={() => { setSel({ subjectId: s.id, topicId: t.id }); window.scrollTo(0, 0); }}>Ver ações</Button>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function MissingLink({ missing, onBack, go }) {
  const N = window.QB_NAV, i = missing.intent;
  const label = N.topicLabel(i.subjectId, i.topicId);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, margin: '0 auto' }}>
      <PageHeader overline="Remissão" title="Sem vínculo para esta ação" />
      <Panel style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EmptyState tone="unavailable" icon="link" title={label || 'Assunto não encontrado'} description={N.reasons[missing.reason] || N.reasons['unknown-action']} />
        <code style={{ font: '400 12px/1.6 var(--font-mono)', color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>action: {i.action} · subjectId: {String(i.subjectId)} · topicId: {String(i.topicId)}{i.nodeId ? ' · nodeId: ' + i.nodeId : ''} · motivo: {missing.reason}</code>
        <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>Nenhum outro assunto foi aberto no lugar. Seu progresso e a seleção anterior foram mantidos.</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button icon="arrow-left" onClick={onBack}>Voltar para {VIEW_LABEL[missing.back] || 'a tela anterior'}</Button>
          {label && <Button variant="secondary" icon="scroll-text" onClick={() => go('edital', 'lista')}>Ver no edital</Button>}
        </div>
      </Panel>
    </div>
  );
}

function StudyScreen({ tab, setTab, go, mapProps }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader overline="Estudo · teoria, mapas e revisão" title="Estudo" actions={<Tabs label="Ferramentas de estudo" value={tab} onChange={setTab} items={[{ id: 'mapa', label: 'Mapas mentais', icon: 'network' }, { id: 'cards', label: 'Flashcards', icon: 'layers' }]} />} />
      {tab === 'mapa' && <MindMapScreen {...mapProps} go={go} />}
      {tab === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          {[['Processo legislativo', 5, 'Direito Constitucional', true], ['Licitações e contratos', 0, 'Direito Administrativo', false], ['Emprego de tempos verbais', 0, 'Língua Portuguesa', false]].map(([n, c, s, ok]) => (
            <Panel key={n} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="qb-overline">{s}</span>
              <h3 style={{ font: 'var(--type-h2)' }}>{n}</h3>
              <span style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>{ok ? c + ' cartões para revisar hoje' : 'Baralho de exemplo vazio'}</span>
              {ok ? <Button icon="play" onClick={() => go('flashcards')}>Revisar agora</Button> : <EmptyState compact title="Sem cartões" description="Crie cartões pelo Scanner do Arquiteto." />}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TrainScreen, StudyScreen, MissingLink, QB_VIEW_LABEL: VIEW_LABEL });
})();
