(() => {
const { PageHeader, Tabs, Panel, Button, Badge, StatCard, CompositionTable, QuestionNavigator, ExamTimer, ConfirmDialog, Icon, EmptyState } = window.QuebrandoABancaDesignSystem_3e4054;
const RULES = { cebraspe: { label: '+1 certo · −1 errado · 0 branco', c: 1, w: -1 }, simples: { label: '+1 certo · 0 errado · 0 branco', c: 1, w: 0 } };

function SimuladoScreen({ toast }) {
  const S = window.QB_SIM;
  const [stage, setStage] = React.useState('prep');
  const [tab, setTab] = React.useState('prep');
  const [rule, setRule] = React.useState('cebraspe');
  const [lines, setLines] = React.useState(30);
  const [worry, setWorry] = React.useState(false);
  const [worryLeft, setWorryLeft] = React.useState(300);
  const [answers, setAnswers] = React.useState(() => S.demoItems.map(() => ({ answer: null, flagged: false })));
  const [cur, setCur] = React.useState(0);
  const [filter, setFilter] = React.useState('all');
  const per = Math.round(S.objective.minutes * 60 / S.objective.items);
  const total = per * S.demoItems.length;
  const [left, setLeft] = React.useState(total);
  const [ask, setAsk] = React.useState(false);
  const [history, setHistory] = React.useState(S.history);
  const [text, setText] = React.useState('');
  const [last, setLast] = React.useState(null);
  React.useEffect(() => {
    if (stage !== 'exam' && stage !== 'disc' && !(stage === 'prep' && worry)) return;
    const t = setInterval(() => { if (stage === 'prep') setWorryLeft(x => Math.max(0, x - 1)); else setLeft(x => Math.max(0, x - 1)); }, 1000);
    return () => clearInterval(t);
  }, [stage, worry]);
  const short = S.blocks.flatMap(b => b.subjects).filter(s => s.available < s.planned);
  const setA = (i, p) => setAnswers(a => a.map((x, k) => k === i ? { ...x, ...p } : x));
  const pending = answers.filter(a => !a.answer).length;
  const finish = () => {
    const c = answers.filter((a, i) => a.answer === S.demoItems[i].key).length;
    const b = answers.filter(a => !a.answer || a.answer === 'B').length;
    const w = answers.length - c - b;
    const r = RULES[rule];
    const res = { c, w, b, net: c * r.c + w * r.w, time: total - left, rule: r.label };
    setLast(res); setAsk(false); setStage('result');
    setHistory(h => [{ id: 'n' + Date.now(), date: '14/11/2026', kind: 'Objetiva · demo (10 itens)', items: answers.length, correct: c, wrong: w, blank: b, minutes: Math.round((total - left) / 60) }, ...h]);
  };
  const start = () => { setAnswers(S.demoItems.map(() => ({ answer: null, flagged: false }))); setCur(0); setLeft(total); setStage('exam'); };
  const fmt = s => Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';

  if (stage === 'exam') {
    const it = S.demoItems[cur], a = answers[cur];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(260px,320px)', gap: 18, alignItems: 'start' }}>
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 18 }} padding={28}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><span style={{ font: '500 13px/1 var(--font-mono)', color: 'var(--text-muted)' }}>Item {cur + 1} de {answers.length}</span><Badge tone="neutral" icon={null}>{it.s}</Badge><Badge tone="gold" icon={null}>Simulado · demonstração</Badge><span style={{ flex: 1 }} /><button className="qb-iconbtn qb-iconbtn--sm" aria-pressed={a.flagged} aria-label="Marcar para revisão" onClick={() => setA(cur, { flagged: !a.flagged })}><Icon name="flag" size={18} /></button></div>
          <p style={{ font: 'var(--type-reading)', color: 'var(--text-primary)', maxWidth: '68ch' }}>{it.text}</p>
          <div role="group" aria-label="Resposta" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[['C', 'Certo'], ['E', 'Errado'], ['B', 'Em branco']].map(([k, l]) => <button key={k} className="qb-choice" aria-pressed={a.answer === k} onClick={() => setA(cur, { answer: a.answer === k ? null : k })}><span className="qb-choice__key">{k}</span>{l}</button>)}
          </div>
          <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Regra: {RULES[rule].label}. Sem gabarito durante a prova.</span>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Button variant="ghost" icon="chevron-left" disabled={cur === 0} onClick={() => setCur(cur - 1)}>Anterior</Button>
            <div style={{ display: 'flex', gap: 8 }}>{cur < answers.length - 1 && <Button variant="secondary" iconRight="chevron-right" onClick={() => setCur(cur + 1)}>Próximo</Button>}<Button variant="crimson" icon="flag" onClick={() => setAsk(true)}>Finalizar</Button></div>
          </div>
        </Panel>
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 150 }}>
          <ExamTimer remaining={left} total={total} />
          <QuestionNavigator items={answers} current={cur} onGo={setCur} filter={filter} onFilter={setFilter} />
        </Panel>
        <ConfirmDialog open={ask} title="Finalizar o simulado?" description={pending ? pending + ' itens sem resposta serão contados como em branco.' : 'Todos os itens foram respondidos.'} confirmLabel="Finalizar e ver resultado" onConfirm={finish} onCancel={() => setAsk(false)} />
      </div>
    );
  }

  if (stage === 'disc') {
    const nLines = text.split('\n').length, chars = text.length, limit = lines * 75;
    return (
      <Panel style={{ display: 'flex', flexDirection: 'column', gap: 14 }} padding={28}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Discursiva · tema de exemplo</span><p style={{ font: 'var(--type-reading)' }}>Discorra sobre o papel do fiscal e do gestor do contrato administrativo na Lei n.º 14.133/2021, distinguindo suas atribuições.</p></div>
          <ExamTimer remaining={left} total={S.discursive.minutes * 60} />
        </div>
        <textarea className="qb-textarea" style={{ minHeight: 320, fontSize: 16 }} value={text} maxLength={limit} onChange={e => setText(e.target.value)} aria-label="Texto da discursiva" />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', font: '400 13px/1.3 var(--font-mono)', color: chars > limit * 0.95 ? 'var(--state-attention)' : 'var(--text-muted)' }}><span>{nLines} linhas · {chars}/{limit} caracteres (≈ {lines} linhas × 75)</span><span>Sem correção automática nesta demonstração</span></div>
        <div style={{ display: 'flex', gap: 8 }}><Button icon="check" onClick={() => { setHistory(h => [{ id: 'd' + Date.now(), date: '14/11/2026', kind: 'Discursiva · demo', items: null, minutes: Math.round((S.discursive.minutes * 60 - left) / 60), note: 'Autoavaliação pendente' }, ...h]); setStage('prep'); setTab('hist'); toast({ tone: 'success', title: 'Discursiva entregue', message: 'Registrada no histórico, sem nota automática.' }); }}>Entregar</Button><Button variant="ghost" onClick={() => setStage('prep')}>Sair sem entregar</Button></div>
      </Panel>
    );
  }

  if (stage === 'result' && last) {
    const subjects = [...new Set(S.demoItems.map(i => i.s))];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PageHeader overline="Resultado · simulado de demonstração" title="Resultado do simulado" description="Separado das estatísticas de treino." actions={<><Button variant="secondary" icon="rotate-ccw" onClick={start}>Refazer</Button><Button icon="history" onClick={() => { setStage('prep'); setTab('hist'); }}>Histórico</Button></>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          <StatCard compact label="Acertos" tone="correct" value={last.c} /><StatCard compact label="Erros" tone="incorrect" value={last.w} /><StatCard compact label="Em branco" value={last.b} />
          <StatCard compact label="Nota líquida" tone="gold" value={(last.net > 0 ? '+' : '') + last.net} detail={last.rule} /><StatCard compact label="Tempo" value={fmt(last.time)} detail={'de ' + fmt(total)} />
        </div>
        <Panel><table className="qb-table"><thead><tr><th>Matéria</th><th className="num">Itens</th><th className="num">Certos</th><th className="num">Errados</th><th className="num">Brancos</th></tr></thead><tbody>{subjects.map(s => { const idx = S.demoItems.map((x, i) => x.s === s ? i : -1).filter(i => i >= 0); const c = idx.filter(i => answers[i].answer === S.demoItems[i].key).length, b = idx.filter(i => !answers[i].answer || answers[i].answer === 'B').length; return <tr key={s}><td style={{ color: 'var(--text-primary)' }}>{s}</td><td className="num">{idx.length}</td><td className="num">{c}</td><td className="num">{idx.length - c - b}</td><td className="num">{b}</td></tr>; })}</tbody></table></Panel>
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2 style={{ font: 'var(--type-h2)', marginBottom: 6 }}>Revisão das respostas</h2>
          {S.demoItems.map((it, i) => { const a = answers[i].answer, ok = a === it.key, blank = !a || a === 'B'; return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px minmax(0,1fr) auto', gap: 10, alignItems: 'start', padding: '10px 0', borderBottom: '1px solid var(--divider)' }}>
              <span style={{ font: '500 13px/1.5 var(--font-mono)', color: 'var(--text-muted)' }}>{i + 1}</span>
              <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>{it.text}</span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}><Badge tone={blank ? 'no-evidence' : ok ? 'correct' : 'incorrect'}>{blank ? 'Em branco' : ok ? 'Certo' : 'Errado'}</Badge><span style={{ font: '400 12px/1 var(--font-mono)', color: 'var(--text-muted)' }}>sua: {a || '—'} · gab.: {it.key}</span></span>
            </div>); })}
        </Panel>
      </div>
    );
  }

  const tp = S.blocks.reduce((a, b) => a + b.subjects.reduce((x, s) => x + s.planned, 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader overline="Simulados · perfil de exemplo" title="Simulado" description={S.profile + '. Valores são do perfil, não regras fixas.'} actions={<Tabs label="Simulados" value={tab} onChange={setTab} items={[{ id: 'prep', label: 'Preparação', icon: 'graduation-cap' }, { id: 'hist', label: 'Histórico', icon: 'history', count: history.length }]} />} />
      {tab === 'hist' ? (
        <Panel>
          <table className="qb-table"><thead><tr><th>Data</th><th>Modalidade</th><th className="num">Itens</th><th className="num">C</th><th className="num">E</th><th className="num">B</th><th className="num">Nota líquida</th><th className="num">Tempo</th></tr></thead>
            <tbody>{history.map(h => <tr key={h.id}><td>{h.date}</td><td style={{ color: 'var(--text-primary)' }}>{h.kind}</td><td className="num">{h.items ?? '—'}</td><td className="num">{h.correct ?? '—'}</td><td className="num">{h.wrong ?? '—'}</td><td className="num">{h.blank ?? '—'}</td><td className="num">{h.correct != null ? (h.correct - h.wrong > 0 ? '+' : '') + (h.correct - h.wrong) : h.note || '—'}</td><td className="num">{h.minutes} min</td></tr>)}</tbody></table>
          <p style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)', marginTop: 10 }}>Nota líquida do histórico calculada com +1/−1/0. Resultados de simulado não entram na taxa de acertos de treino.</p>
        </Panel>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
            <Panel variant="ornate" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Próximo simulado</span><span style={{ font: '400 26px/1.2 var(--font-heading)' }}>{S.next.label}</span><span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Agendado no planejamento.</span></Panel>
            <Panel style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="qb-overline">Objetiva</span><span style={{ font: '600 20px/1.2 var(--font-body)' }}>{S.objective.items} itens · {S.objective.minutes} min</span>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}>Regra de pontuação<select className="qb-select" value={rule} onChange={e => setRule(e.target.value)}>{Object.entries(RULES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</select></label>
              <Button icon="play" onClick={start}>Iniciar objetiva · demo 10 itens</Button>
            </Panel>
            <Panel style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="qb-overline">Discursiva</span><span style={{ font: '600 20px/1.2 var(--font-body)' }}>{S.discursive.minutes} min</span>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}>Limite de linhas<select className="qb-select" value={lines} onChange={e => setLines(+e.target.value)}>{[20, 30, 45, 60].map(n => <option key={n} value={n}>{n} linhas</option>)}</select></label>
              <Button variant="secondary" icon="square-pen" onClick={() => { setText(''); setLeft(S.discursive.minutes * 60); setStage('disc'); }}>Iniciar discursiva</Button>
            </Panel>
          </div>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="qb-check"><input type="checkbox" checked={worry} onChange={e => { setWorry(e.target.checked); setWorryLeft(300); }} />Preparação opcional: 5 minutos escrevendo sobre preocupações antes de começar</label>
            {worry && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><textarea className="qb-textarea" placeholder="Escreva livremente o que preocupa você sobre a prova. Não é salvo." aria-label="Escrita de preocupações" /><span style={{ font: '400 13px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{Math.floor(worryLeft / 60)}:{String(worryLeft % 60).padStart(2, '0')} restantes · pode pular a qualquer momento</span></div>}
          </Panel>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}><h2 style={{ font: 'var(--type-h2)' }}>Composição · {tp} itens</h2><Badge tone="neutral" icon="info">Distribuição estimada</Badge><span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>O perfil de exemplo não fixa itens por matéria; a divisão é uma estimativa editável.</span></div>
            <CompositionTable blocks={S.blocks} />
            {short.length > 0 && <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 12, borderRadius: 12, border: '1px solid rgba(242,199,110,.45)', background: 'rgba(242,199,110,.06)', font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}><Icon name="triangle-alert" size={18} color="var(--state-attention)" style={{ marginTop: 2 }} />Banco insuficiente em {short.map(s => s.name).join(' e ')}. O simulado completo usaria menos itens nessas matérias ou repetiria questões — ajuste a composição ou importe mais questões.</div>}
          </Panel>
        </>
      )}
    </div>
  );
}

Object.assign(window, { SimuladoScreen });
})();
