(() => {
const { HeroAscension, RadialNavigation, Panel, ProgressBar, AchievementEmblem, Button, Icon, Badge } = window.QuebrandoABancaDesignSystem_3e4054;

function PlanItem({ icon, title, meta, done, onClick }) {
  return (
    <button onClick={onClick} className="qb-radial__row" style={{ background: 'transparent', minHeight: 60 }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${done ? 'var(--state-correct)' : 'rgba(208,179,134,.55)'}`, color: done ? 'var(--state-correct)' : 'var(--qb-gold)', flexShrink: 0 }}>
        <Icon name={done ? 'check' : icon} size={18} />
      </span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: '500 15px/1.3 var(--font-body)', textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{title}</span>
        <span style={{ font: '400 13px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>{done ? 'Concluído' : meta}</span>
      </span>
      {!done && <Icon name="chevron-right" size={18} color="var(--text-muted)" />}
    </button>
  );
}

function Dashboard({ go, progress }) {
  const answered = progress.answered;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeroAscension scene="sunset" height={260} focal="right" eyebrow={window.QB_DATA.exam} title="A Ascensão continua" subtitle="Hoje: processo legislativo — 5 questões e 5 flashcards.">
        <Button iconRight="arrow-right" onClick={() => go('questions')}>{answered ? 'Continuar sessão' : 'Iniciar sessão'}</Button>
        <Button variant="secondary" icon="network" onClick={() => go('map')}>Abrir mapa do tema</Button>
      </HeroAscension>
      <div className="qb-dash-grid">
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }} padding="24px 16px 28px">
          <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <h2 style={{ font: 'var(--type-h2)' }}>Sua jornada</h2>
            <Badge tone="neutral" icon="info">Dados de demonstração</Badge>
          </div>
          <RadialNavigation size={500} onSelect={go}
            center={{ value: 0.42, overline: 'Edital', label: 'Analista Legislativo' }}
            items={[
              { id: 'questions', label: 'Questões', icon: 'list-checks', meta: `${5 - answered} restantes` },
              { id: 'map', label: 'Mapas mentais', icon: 'network', meta: '2 nós com erro' },
              { id: 'flashcards', label: 'Flashcards', icon: 'layers', meta: `${5 - progress.cards} pendentes` },
              { id: 'tutor', label: 'Tutor', icon: 'message-circle', meta: 'Demonstração' },
              { id: 'dashboard', label: 'Revisão', icon: 'history', meta: '12 itens' },
            ]} />
        </Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ font: 'var(--type-h2)', marginBottom: 8 }}>Plano de hoje</h2>
            <PlanItem icon="list-checks" title="Questões · Emendas e MPs" meta="5 itens Cebraspe · ~10 min" done={answered >= 5} onClick={() => go('questions')} />
            <PlanItem icon="layers" title="Flashcards · Processo legislativo" meta="5 cartões · ~5 min" done={progress.cards >= 5} onClick={() => go('flashcards')} />
            <PlanItem icon="network" title="Revisar nó “Limites formais”" meta="2 erros recentes" onClick={() => go('map', { node: 'lf' })} />
          </Panel>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ font: 'var(--type-h2)' }}>Desempenho por tema</h2>
            <ProgressBar value={0.68} label="Direito Constitucional" tone="correct" />
            <ProgressBar value={0.54} label="Regimento Interno da Câmara" tone="correct" />
            <ProgressBar value={0.31} label="Língua Portuguesa" tone="correct" />
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Percentual de acertos nos últimos 30 dias.</span>
          </Panel>
          <Panel variant="ornate" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ font: '600 15px/1.2 var(--font-display)', letterSpacing: '.12em', color: 'var(--qb-gold)' }}>MARCOS DA ASCENSÃO</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <AchievementEmblem variant="soldado" state="earned" size={80} rule="7 dias seguidos" style={{ width: 110 }} />
              <AchievementEmblem variant="sabio" state="in-progress" progress={0.6} size={80} rule="200 flashcards" style={{ width: 110 }} />
              <AchievementEmblem variant="estrategista" state="locked" size={80} rule="1 simulado completo" style={{ width: 110 }} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
})();
