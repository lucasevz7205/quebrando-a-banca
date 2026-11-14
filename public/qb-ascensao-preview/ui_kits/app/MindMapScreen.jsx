(() => {
const { MindMapCanvas, ConceptPanel, Badge } = window.QuebrandoABancaDesignSystem_3e4054;

function MindMapScreen({ selected, setSelected, returnTo, onReturn, go }) {
  const D = window.QB_DATA;
  const node = D.mapNodes.find(n => n.id === selected) || D.mapNodes[0];
  const c = D.concepts[node.id] || { summary: 'Conteúdo deste nó ainda não preenchido na demonstração.' };
  const path = []; let p = D.mapNodes.find(n => n.id === node.parent);
  while (p) { path.unshift(p.label); p = D.mapNodes.find(n => n.id === p.parent); }
  const card = D.flashcards.filter(f => f.node === node.id).length;
  const expanded = ['pl', 'em', 'lo', 'mp'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="qb-overline">Direito Constitucional · Mapa mental</span>
          <h1 style={{ font: 'var(--type-h1)' }}>Processo legislativo</h1>
        </div>
        <Badge tone="neutral" icon="info">Domínio baseado nas suas respostas (demonstração)</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 20, alignItems: 'stretch' }}>
        <MindMapCanvas key={returnTo ? 'r' : 'n'} nodes={D.mapNodes} selectedId={node.id} onSelect={setSelected} defaultExpanded={expanded} height={620} />
        <ConceptPanel key={node.id} title={node.label} path={path}
          mastery={node.mastery ? { state: node.mastery, text: D.masteryText[node.mastery] } : undefined}
          summary={c.summary} example={c.example} connections={c.connections || []} sources={c.sources || []}
          onNavigate={setSelected} reviewCount={card || undefined} onReview={() => go('flashcards')}
          returnTo={returnTo && returnTo.label} onReturn={onReturn} style={{ height: 620 }} />
      </div>
    </div>
  );
}

Object.assign(window, { MindMapScreen });
})();
