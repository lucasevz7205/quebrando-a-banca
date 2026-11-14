(() => {
const { TutorPanel, Panel, Badge, Button, Icon } = window.QuebrandoABancaDesignSystem_3e4054;

function TutorScreen({ session, go }) {
  const D = window.QB_DATA;
  const q = D.questions[Math.min(session.idx, D.questions.length - 1)];
  const st = session.answers[q.id] || {};
  const node = D.mapNodes.find(n => n.id === q.node);
  const [messages, setMessages] = React.useState([
    { role: 'tutor', text: `Estou com a ${q.code} e o conceito “${node.label}” como contexto. O que você quer entender?` },
  ]);
  const [thinking, setThinking] = React.useState(false);
  const send = t => {
    setMessages(m => [...m, { role: 'user', text: t }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages(m => [...m, { role: 'tutor', text: D.tutorReplies[t] || 'Na demonstração, só as sugestões abaixo têm resposta preparada. Em produção, a resposta citaria a fonte legal do conceito.', refs: [{ id: node.id, label: node.label, kind: 'concept' }] }]);
    }, 900);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,340px) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
      <Panel style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="qb-overline">Contexto da conversa</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ font: '500 13px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{q.code}</span>
          {st.revealed ? <Badge tone={st.answer === q.key ? 'correct' : 'incorrect'}>{st.answer === q.key ? 'Acertou' : 'Errou'}</Badge> : <Badge tone="no-evidence">Não respondida</Badge>}
        </div>
        <p style={{ font: '400 15px/1.6 var(--font-body)', color: 'var(--text-secondary)' }}>{q.statement}</p>
        <div style={{ height: 1, background: 'var(--divider)' }} />
        <button className="qb-linkbtn" onClick={() => go('map', { node: node.id, returnTo: { label: 'conversa com o tutor', view: 'tutor' } })}><Icon name="network" size={16} />Conceito: {node.label}</button>
        <button className="qb-linkbtn" onClick={() => go('questions')}><Icon name="list-checks" size={16} />Voltar à questão</button>
      </Panel>
      <TutorPanel style={{ height: 'min(680px, calc(100vh - 160px))' }} contextLabel={`${q.code} · ${node.label}`} messages={messages} thinking={thinking}
        suggestions={Object.keys(D.tutorReplies)} onSend={send} onRef={id => go('map', { node: id, returnTo: { label: 'conversa com o tutor', view: 'tutor' } })} />
    </div>
  );
}

Object.assign(window, { TutorScreen });
})();
