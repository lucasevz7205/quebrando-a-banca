(() => {
const { PageHeader, Tabs, StatCard, Panel, SearchField, SelectField, EditalTree, HeatmapGrid, HeatmapLegend, SubjectRadial, Button, Badge, EmptyState, Icon } = window.QuebrandoABancaDesignSystem_3e4054;
const STATUS = [['all', 'Todos os status'], ['not-started', 'Não iniciado'], ['studying', 'Em estudo'], ['reviewing', 'Revisando'], ['mastered', 'Dominado']];

function EditalScreen({ tab, setTab, go, openArchitect, toast }) {
  const E = window.QB_EDITAL, M = window.QB_METRICS;
  const [q, setQ] = React.useState('');
  const [subj, setSubj] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [evoke, setEvoke] = React.useState(false);
  const [open, setOpen] = React.useState(['da']);
  const [hl, setHl] = React.useState(null);
  const tot = M.totals(E.subjects);
  const ql = q.trim().toLowerCase();
  const filtered = E.subjects.filter(s => subj === 'all' || s.id === subj).map(s => ({ ...s, topics: s.topics.filter(t => (status === 'all' || t.status === status) && (!ql || t.num.toLowerCase().startsWith(ql) || (t.title || '').toLowerCase().includes(ql) || s.name.toLowerCase().includes(ql))) })).filter(s => s.topics.length);
  React.useEffect(() => {
    if (!hl || tab !== 'lista') return;
    const t = setTimeout(() => { const el = document.querySelector('[data-topic-id="' + hl + '"]'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 180, behavior: 'smooth' }); }, 60);
    return () => clearTimeout(t);
  }, [hl, tab]);
  const reveal = (sid, tid) => { setSubj('all'); setStatus('all'); setQ(''); setOpen(o => o.includes(sid) ? o : [...o, sid]); setHl(tid); setTab('lista'); };
  const onAction = (a, t) => {
    const s = E.subjects.find(x => x.topics.includes(t) || x.topics.some(y => y.id === t.id));
    if (a === 'architect') return openArchitect({ subjectId: s.id, topicId: t.id, origin: 'edital ' + s.short + ' ' + t.num });
    if (a === 'study' && evoke) return openArchitect({ subjectId: s.id, topicId: t.id, origin: 'Evocar antes de ler · ' + s.short + ' ' + t.num }, 'cornell');
    if (a === 'questions') return go('questions');
    if (a === 'flashcards') return go('flashcards');
    go('study');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader overline="Edital verticalizado · dados demonstrativos" title="Edital" description="Bloco → matéria → assunto → tópico, com status de estudo e taxa de acertos separados."
        actions={<Tabs label="Visualização do edital" value={tab} onChange={setTab} items={[{ id: 'lista', label: 'Lista', icon: 'list' }, { id: 'calor', label: 'Mapa de calor', icon: 'grid-3x3' }, { id: 'radial', label: 'Radial', icon: 'target' }]} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
        <StatCard compact label="Taxa de acertos" tone="correct" value={M.pct(tot.accuracy)} detail={tot.correct + ' de ' + tot.valid + ' respostas válidas'} note="acertos ÷ (acertos + erros)" />
        <StatCard compact label="Cobertura" value={M.pct(tot.coverage)} detail={tot.studied + ' de ' + tot.total + ' tópicos iniciados'} note="Tópico coberto = status diferente de Não iniciado" />
        <StatCard compact label="Respostas" value={tot.answered} detail={tot.blank + ' em branco'} />
        <StatCard compact label="Matérias" value={E.subjects.length} detail={'P1: ' + E.subjects.filter(s => s.block === 'P1').length + ' · P2: ' + E.subjects.filter(s => s.block === 'P2').length} />
      </div>
      <p style={{ font: '400 12px/1.5 var(--font-body)', color: 'var(--text-muted)' }}><Icon name="info" size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Numeração dos tópicos conforme as referências enviadas. Títulos só aparecem quando constam nos arquivos; os demais ficam marcados como indisponíveis — importe o edital oficial para completar.</p>

      {tab !== 'radial' && (
        <Panel padding={12} style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,2fr) minmax(180px,1.4fr) minmax(160px,1fr) auto', gap: 10, alignItems: 'end' }}>
          <SearchField value={q} onChange={setQ} placeholder="Buscar tópico, número ou palavra" label="Buscar no edital" />
          <SelectField label="Matéria" hideLabel value={subj} onChange={setSubj} options={[{ value: 'all', label: 'Todas as matérias' }, { label: 'P1 · ' + E.blocks.P1, options: E.subjects.filter(s => s.block === 'P1').map(s => ({ value: s.id, label: s.name })) }, { label: 'P2', options: E.subjects.filter(s => s.block === 'P2').map(s => ({ value: s.id, label: s.name })) }]} />
          <SelectField label="Status" hideLabel value={status} onChange={setStatus} options={STATUS.map(([v, l]) => ({ value: v, label: l }))} />
          <label className="qb-check"><input type="checkbox" checked={evoke} onChange={e => setEvoke(e.target.checked)} />Evocar antes de ler</label>
        </Panel>
      )}

      {tab === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="sm" variant="ghost" icon="chevrons-down" onClick={() => setOpen(filtered.map(s => s.id))}>Expandir tudo</Button>
            <Button size="sm" variant="ghost" icon="chevrons-up" onClick={() => setOpen([])}>Recolher tudo</Button>
            <span style={{ flex: 1 }} />
            <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap', font: '400 12px/1 var(--font-body)', color: 'var(--text-muted)' }}><span className="qb-overline">Status de estudo</span>{[['circle-dashed', 'Não iniciado', 'var(--status-not-started)'], ['book-open', 'Em estudo', 'var(--status-studying)'], ['repeat', 'Revisando', 'var(--status-reviewing)'], ['circle-check', 'Dominado', 'var(--status-mastered)']].map(([i, l, c]) => <span key={l} style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: c }}><Icon name={i} size={13} />{l}</span>)}</span>
          </div>
          {['P1', 'P2'].map(b => filtered.some(s => s.block === b) && (
            <section key={b} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 className="qb-overline" style={{ color: 'var(--qb-gold)', padding: '6px 2px' }}>{b} · {E.blocks[b]}</h2>
              <EditalTree subjects={filtered.filter(s => s.block === b)} expanded={ql || status !== 'all' ? filtered.map(s => s.id) : open} onToggle={id => setOpen(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id])} highlightId={hl} evokeFirst={evoke} onAction={onAction} groupTitles={E.groupTitles} />
            </section>
          ))}
          {!filtered.length && <EmptyState title="Nenhum tópico encontrado" description="Ajuste a busca ou os filtros." action={<Button size="sm" variant="secondary" onClick={() => { setQ(''); setSubj('all'); setStatus('all'); }}>Limpar filtros</Button>} />}
        </div>
      )}

      {tab === 'calor' && (
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}><h2 style={{ font: 'var(--type-h2)' }}>Mapa de calor · acertos por tópico</h2><span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Toque num quadrado para abrir o tópico na lista. O número é o do edital.</span></div>
          {filtered.length ? <HeatmapGrid subjects={filtered} selectedTopicId={hl} onSelect={reveal} /> : <EmptyState title="Nenhum tópico com estes filtros" />}
          <HeatmapLegend />
          <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>O mapa mostra só a faixa de acertos. O status de estudo (Não iniciado, Em estudo, Revisando, Dominado) aparece na Lista.</span>
        </Panel>
      )}

      {tab === 'radial' && (
        <Panel style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }} padding="20px 16px">
          <SubjectRadial subjects={E.subjects} summary={tot} size={560} onSelectTopic={reveal} onOpenList={sid => { if (sid) setOpen(o => [...new Set([...o, sid])]); setTab('lista'); }} />
        </Panel>
      )}
    </div>
  );
}

Object.assign(window, { EditalScreen });
})();
