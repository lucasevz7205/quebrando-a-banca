(() => {
const { MindMapCanvas, ConceptPanel, Badge, Panel, Button, EmptyState, StudyTopicPicker } = window.QuebrandoABancaDesignSystem_3e4054;

function MindMapScreen({ topicId, onTopic, recents, selected, setSelected, returnTo, onReturn, go, dispatch }) {
  const D = window.QB_DATA, E = window.QB_EDITAL, L = window.QB_LINKS, N = window.QB_NAV;
  const subj = E.subjects.find(s => s.topics.some(t => t.id === topicId));
  const topic = subj && subj.topics.find(t => t.id === topicId);
  const map = L.maps[topicId];
  // selected === null means "open at the map root" (explicit); an unknown id is reported, never replaced.
  const node = map ? D.mapNodes.find(n => n.id === (selected || map.rootNodeId)) : null;
  const picker = <StudyTopicPicker label="Assunto do mapa" subjects={E.subjects} value={topicId} counts={N.mapCounts} recents={recents} onSelect={s => onTopic(s.topicId)} style={{ flex: '1 1 360px', maxWidth: 520 }} />;
  const back = returnTo && <Button variant="secondary" icon="corner-up-left" onClick={onReturn}>Voltar para {returnTo.label}</Button>;
  const head = (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: '1 1 280px' }}>
        <span className="qb-overline">{subj ? subj.name : 'Assunto não encontrado'} · Mapa mental</span>
        <h1 style={{ font: 'var(--type-h1)' }}>{map ? map.title : topic ? subj.short + ' ' + topic.num : 'Mapa mental'}</h1>
      </div>
      {picker}
    </div>
  );
  if (!map || !node) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {head}
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <EmptyState tone="unavailable" icon="link" title={!map ? 'Nenhum mapa vinculado a este assunto' : 'Nó não encontrado neste mapa'}
            description={!map ? 'A base de demonstração só contém o mapa de DC 2a. Nenhum outro mapa foi aberto no lugar.' : 'O identificador “' + selected + '” não existe no mapa ' + map.mapId + '.'} />
          <code style={{ font: '400 12px/1.6 var(--font-mono)', color: 'var(--text-muted)' }}>topicId: {String(topicId)}{selected ? ' · nodeId: ' + selected : ''}</code>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {back}
            {map && <Button variant="secondary" icon="network" onClick={() => setSelected(null)}>Abrir a raiz do mapa</Button>}
            {!map && <Button variant="secondary" icon="network" onClick={() => onTopic('dc-2a')}>Abrir o mapa de DC 2a</Button>}
          </div>
        </Panel>
      </div>
    );
  }
  const c = D.concepts[node.id] || { summary: 'Conteúdo deste nó ainda não preenchido na demonstração.' };
  const path = []; let p = D.mapNodes.find(n => n.id === node.parent);
  while (p) { path.unshift(p.label); p = D.mapNodes.find(n => n.id === p.parent); }
  const card = D.flashcards.filter(f => f.node === node.id).length;
  const qn = D.questions.filter(q => q.node === node.id).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {head}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Badge tone="neutral" icon="info">Domínio baseado nas suas respostas (demonstração)</Badge>
        <span style={{ font: '400 12px/1.4 var(--font-mono)', color: 'var(--text-muted)' }}>{map.mapId} · nó {node.id}</span>
        <span style={{ flex: 1 }} />
        {qn > 0 ? <Button size="sm" variant="secondary" icon="target" onClick={() => dispatch({ action: 'node-questions', subjectId: subj.id, topicId, nodeId: node.id }, 'study')}>{qn} {qn > 1 ? 'questões deste nó' : 'questão deste nó'}</Button>
          : <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Nenhuma questão vinculada a este nó</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'stretch' }}>
        <MindMapCanvas key={(returnTo ? 'r' : 'n') + topicId} nodes={D.mapNodes} selectedId={node.id} onSelect={setSelected} defaultExpanded={['pl', 'em', 'lo', 'mp']} height={620} style={{ flex: '1 1 520px', minWidth: 0 }} />
        <ConceptPanel key={node.id} title={node.label} path={path}
          mastery={node.mastery ? { state: node.mastery, text: D.masteryText[node.mastery] } : undefined}
          summary={c.summary} example={c.example} connections={c.connections || []} sources={c.sources || []}
          onNavigate={setSelected} reviewCount={card || undefined} onReview={() => go('flashcards')}
          returnTo={returnTo && returnTo.label} onReturn={onReturn} style={{ flex: '1 1 340px', maxWidth: 420, height: 620 }} />
      </div>
    </div>
  );
}

Object.assign(window, { MindMapScreen });
})();
