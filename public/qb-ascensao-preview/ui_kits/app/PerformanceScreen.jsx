(() => {
const { PageHeader, Tabs, Panel, Button, Badge, EmptyState, SelectField, Icon, PerformanceMetricCard, PerformanceTrendChart, SubjectPerformanceExplorer, PerformancePriorityPanel, PerformancePeriodSelector } = window.QuebrandoABancaDesignSystem_3e4054;
const GRANS = [{ id: 'day', label: 'Diário' }, { id: 'week', label: 'Semanal' }, { id: 'month', label: 'Mensal' }];
const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
const pct = v => v == null ? '—' : Math.round(v) + '%';
const CALIB = 'Compara a confiança declarada antes do gabarito com o acerto observado. A fórmula ainda não foi formalizada e não há registros de confiança nesta base; por isso nenhum valor é exibido nem estimado. Não deve ser confundida com a taxa de acerto.';

const scopeOf = (mode, f) => ({ from: mode === 'day' ? f.date : f.from, to: mode === 'day' ? f.date : f.to, subjectId: f.subjectId, topicId: f.topicId });
function scopeLabel(mode, f) {
  const C = window.QB_PERF_CALC, s = window.QB_EDITAL.subjects.find(x => x.id === f.subjectId), t = s && s.topics.find(x => x.id === f.topicId);
  const when = mode === 'day' ? C.fmtLong(f.date) : C.fmtFull(f.from) + ' a ' + C.fmtFull(f.to) + ' (' + C.plural(C.length({ from: f.from, to: f.to }), 'dia', 'dias') + ')';
  return when + ' · ' + (s ? s.name + (t ? ' › ' + t.num + (t.title ? ' ' + t.title : '') : '') : 'Todas as matérias');
}

function Filters({ mode, f, setF }) {
  const C = window.QB_PERF_CALC, E = window.QB_EDITAL, P = window.QB_PLAN;
  const s = E.subjects.find(x => x.id === f.subjectId);
  const presets = [['7', '7 dias', C.addDays(P.today, -6)], ['14', '14 dias', C.addDays(P.today, -13)]].map(([id, label, from]) => ({ id, label, from: from < C.bounds.min ? C.bounds.min : from, to: P.today }));
  const dirty = f.subjectId !== 'all' || (mode === 'day' ? f.date !== P.today : f.from !== presets[0].from || f.to !== P.today);
  return (
    <Panel padding={14} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 14px', alignItems: 'flex-end' }}>
      <PerformancePeriodSelector mode={mode} value={mode === 'day' ? { date: f.date } : { from: f.from, to: f.to }} min={C.bounds.min} max={C.bounds.max} today={P.today} presets={presets} onChange={v => setF({ ...f, ...v })} />
      <SelectField label="Matéria" style={{ flex: '1 1 200px' }} value={f.subjectId} onChange={v => setF({ ...f, subjectId: v, topicId: 'all' })} options={[{ value: 'all', label: 'Todas as matérias' }, ...E.subjects.map(x => ({ value: x.id, label: x.name }))]} />
      <SelectField label="Assunto" style={{ flex: '1 1 200px' }} value={f.topicId} onChange={v => setF({ ...f, topicId: v })} options={[{ value: 'all', label: s ? 'Todos os assuntos' : 'Escolha uma matéria primeiro' }, ...(s ? s.topics.map(t => ({ value: t.id, label: t.num + (t.title ? ' — ' + t.title : '') })) : [])]} />
      {dirty && <Button variant="ghost" icon="rotate-ccw" onClick={() => setF(mode === 'day' ? { ...f, date: P.today, subjectId: 'all', topicId: 'all' } : { ...f, from: presets[0].from, to: P.today, subjectId: 'all', topicId: 'all' })}>Limpar</Button>}
    </Panel>
  );
}

function Questions({ sc, total, dispatch }) {
  const C = window.QB_PERF_CALC, D = window.QB_DATA;
  const [qf, setQf] = React.useState('all');
  const all = C.answers(sc), list = all.filter(a => qf === 'all' || a.result === qf);
  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 260px', minWidth: 0 }}>
          <h2 style={{ font: 'var(--type-h2)', margin: 0 }}>Questões do período</h2>
          <p style={{ margin: 0, font: '400 13px/1.45 var(--font-body)', color: 'var(--text-secondary)' }}>{total ? C.plural(total, 'item julgado', 'itens julgados') + ' no escopo. Na base demonstrativa, ' + (all.length ? C.plural(all.length, 'tem', 'têm') + ' enunciado disponível.' : 'nenhum tem enunciado disponível.') : 'Lista apenas o que foi efetivamente respondido no escopo.'}</p>
        </div>
        {all.length > 0 && <div className="qb-seg" role="group" aria-label="Filtrar questões">{[['all', 'Todas', all.length], ['wrong', 'Erros', all.filter(a => a.result === 'wrong').length], ['correct', 'Acertos', all.filter(a => a.result === 'correct').length]].map(([id, l, n]) => <button key={id} type="button" className="qb-seg__opt" style={{ height: 32, fontSize: 13 }} aria-pressed={qf === id} onClick={() => setQf(id)}>{l} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{n}</span></button>)}</div>}
      </div>
      {!total ? <EmptyState tone="empty" compact title="Sem questões respondidas" description="Não há respostas registradas no período e nos filtros selecionados." />
        : !all.length ? <EmptyState tone="empty" compact title="Enunciados fora da demonstração" description="As respostas deste escopo existem só como contagem fictícia. Na integração, cada resposta abre a questão original." />
        : !list.length ? <EmptyState tone="empty" compact title="Nenhuma questão neste filtro" description="Altere o filtro para ver as demais respostas." /> : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            {list.map((a, i) => { const q = D.questions.find(x => x.id === a.questionId); return (
              <li key={a.questionId} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center', padding: '12px 0', borderTop: i ? '1px solid var(--divider)' : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 320px', minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <span style={{ font: '500 12px/1 var(--font-mono)', color: 'var(--qb-gold)' }}>{q.code}</span>
                    <Badge tone={a.result === 'correct' ? 'correct' : 'incorrect'}>{a.result === 'correct' ? 'Acerto' : 'Erro'}</Badge>
                    <span style={{ font: '400 12px/1.3 var(--font-mono)', color: 'var(--text-secondary)' }}>marcou {a.given} · gabarito {q.key} · {C.fmt(a.date)}</span>
                  </div>
                  <span style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.statement}</span>
                </div>
                <Button size="sm" variant="secondary" iconRight="arrow-right" onClick={() => dispatch({ action: 'question', subjectId: a.subjectId, topicId: a.topicId, questionId: a.questionId }, 'performance')}>Abrir questão</Button>
              </li>); })}
          </ul>
        )}
    </Panel>
  );
}

function Analysis({ mode, f, setF, go, dispatch }) {
  const C = window.QB_PERF_CALC, P = window.QB_PLAN, PF = window.QB_PERF, S = window.QB_SIM;
  const [reveal, setReveal] = React.useState(null);
  const sc = scopeOf(mode, f), cur = C.sum(C.rows(sc));
  let base = null, baseLabel = '';
  if (mode === 'day') { for (let d = C.addDays(f.date, -1); d >= C.bounds.min; d = C.addDays(d, -1)) { const s = C.sum(C.rows({ ...sc, from: d, to: d })); if (s.valid) { base = s; baseLabel = 'vs. ' + C.fmt(d); break; } } }
  const prevSc = mode === 'range' ? C.previousScope(sc) : null, prevAgg = prevSc ? C.sum(C.rows(prevSc)) : null;
  if (prevAgg && prevAgg.valid) { base = prevAgg; baseLabel = 'vs. ' + C.fmt(prevSc.from) + '–' + C.fmt(prevSc.to); }
  const cmp = (a, b, unit) => base && cur.valid ? { delta: Math.round(a - b), label: signed(Math.round(a - b)) + (unit || '') + ' ' + baseLabel } : null;
  const winFrom = C.addDays(f.date || sc.from, -6), win = mode === 'day' ? { ...sc, from: winFrom < C.bounds.min ? C.bounds.min : winFrom } : sc;
  const prevWin = C.previousScope(win);
  const data = C.series(win, f.gran), previous = prevWin ? C.series(prevWin, f.gran) : null;
  const tk = C.tasks(sc), done = tk.filter(t => t.status === 'done').length, fc = C.flashcards(sc);
  const range = C.fmt(win.from) + ' a ' + C.fmt(win.to);
  const onPriority = it => { const a = it.action; if (a.intent) dispatch(a.intent, 'performance'); else if (a.go) go(a.go[0], a.go[1]); else if (a.open) setReveal({ ...a.open, token: Date.now() }); };
  const sim = S.history.filter(h => h.correct != null).reduce((a, h) => ({ c: a.c + h.correct, v: a.v + h.correct + h.wrong, k: a.k + 1 }), { c: 0, v: 0, k: 0 });
  const rv = PF.review, rvValid = rv.correct + rv.wrong;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Filters mode={mode} f={f} setF={setF} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}><Badge tone="neutral" icon="info">Dados demonstrativos</Badge><span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>Somente rodadas de treino. Revisões e simulados são séries separadas.</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,188px),1fr))', gap: 12 }}>
        <PerformanceMetricCard label="Itens julgados" icon="list-checks" state={cur.n ? 'ok' : 'empty'} value={cur.n} comparison={cmp(cur.n, base ? base.n : 0)}
          breakdown={[{ label: cur.correct === 1 ? 'acerto' : 'acertos', value: cur.correct, tone: 'correct' }, { label: cur.wrong === 1 ? 'erro' : 'erros', value: cur.wrong, tone: 'incorrect' }, { label: 'em branco', value: cur.blank }]}
          formula="acertos + erros + brancos. Questões não realizadas ficam fora." warning={cur.n && cur.valid < C.RULES.chartMinSample ? 'Amostra pequena' : null} />
        <PerformanceMetricCard label="Taxa de acerto" icon="target" tone="correct" state={cur.valid ? 'ok' : 'empty'} stateText="Sem respostas válidas" value={pct(cur.accuracy)} detail={cur.correct + ' de ' + C.plural(cur.valid, 'resposta válida', 'respostas válidas')} comparison={cmp(cur.accuracy, base ? base.accuracy : 0, ' p.p.')}
          formula="acertos ÷ (acertos + erros) · brancos fora" method="Itens em branco não entram no denominador. O percentual sempre aparece com as respostas válidas que o sustentam." />
        <PerformanceMetricCard label="Nota líquida" icon="scale" tone="gold" state={cur.n ? 'ok' : 'empty'} value={signed(cur.net)} detail={cur.correct + ' − ' + cur.wrong + ' = ' + signed(cur.net)} comparison={cmp(cur.net, base ? base.net : 0)}
          formula="Regra CEBRASPE: +1 acerto · −1 erro · 0 branco" method="Regra selecionada no perfil da prova. Com outra regra de pontuação, a fórmula exibida muda junto com o valor." />
        <PerformanceMetricCard label="Calibração da confiança" icon="circle-help" state="pending" formula="Aguardando fórmula formal e registros de confiança." method={CALIB} />
        <PerformanceMetricCard label="Tarefas concluídas" icon="calendar" state={tk.length ? 'ok' : 'empty'} stateText="Sem tarefas planejadas" value={done} unit={'de ' + tk.length} detail={tk.length - done ? C.plural(tk.length - done, 'tarefa não concluída', 'tarefas não concluídas') : 'Todas concluídas'}
          formula="concluídas ÷ planejadas no período" action={{ label: 'Abrir planejamento', onClick: () => go('plan', mode === 'day' && f.date === P.today ? 'hoje' : 'semana') }} />
        <PerformanceMetricCard label="Flashcards avaliados" icon="layers" state={fc != null ? 'ok' : 'empty'} stateText="Sem avaliações registradas" value={fc} detail={mode === 'range' ? 'Registro apenas de ' + C.fmt(P.today) + ' na demonstração' : null} formula="avaliações de cartões registradas no período" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <PerformanceTrendChart style={{ flex: '3 1 480px' }} subtitle={(mode === 'day' ? '7 dias até ' + C.fmt(f.date) : range) + ' · taxa de acerto do treino'} data={data} previous={previous}
          currentLabel={range} previousLabel={prevWin ? C.fmt(prevWin.from) + ' a ' + C.fmt(prevWin.to) : undefined} previousNote="Sem registros no período anterior de mesma duração; a comparação não é exibida."
          granularity={f.gran} granularities={GRANS} onGranularity={g => setF({ ...f, gran: g })} minSample={C.RULES.chartMinSample} />
        <PerformancePriorityPanel style={{ flex: '2 1 340px' }} basis={'Base: ' + range + ' e planejamento até ' + C.fmt(sc.to)} items={C.priorities(win)} onAction={onPriority} />
      </div>
      {mode === 'range' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          <Panel style={{ flex: '3 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="qb-overline" style={{ color: 'var(--qb-gold)', margin: 0 }}>Período atual × anterior</h2>
            {!prevSc ? <EmptyState tone="empty" compact title="Sem período anterior comparável" description={'Os registros começam em ' + C.fmtFull(C.bounds.min) + '. Reduza o intervalo para comparar períodos de mesma duração.'} /> : (
              <div style={{ overflowX: 'auto' }}><table className="qb-table"><thead><tr><th>Indicador</th><th className="num">{C.fmt(prevSc.from)}–{C.fmt(prevSc.to)}</th><th className="num">{C.fmt(sc.from)}–{C.fmt(sc.to)}</th><th className="num">Diferença</th></tr></thead>
                <tbody>{[['Itens julgados', prevAgg.n, cur.n, ''], ['Respostas válidas', prevAgg.valid, cur.valid, ''], ['Taxa de acerto', prevAgg.accuracy, cur.accuracy, '%'], ['Nota líquida', prevAgg.valid ? prevAgg.net : null, cur.valid ? cur.net : null, '']].map(([k, a, b, u]) => <tr key={k}><td style={{ color: 'var(--text-primary)' }}>{k}</td><td className="num">{a == null ? '—' : Math.round(a) + u}</td><td className="num">{b == null ? '—' : Math.round(b) + u}</td><td className="num">{a == null || b == null ? '—' : signed(Math.round(b) - Math.round(a)) + (u ? ' p.p.' : '')}</td></tr>)}</tbody></table></div>
            )}
          </Panel>
          <div style={{ flex: '2 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Séries separadas · não somadas ao treino</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
              <PerformanceMetricCard compact label="Revisões (acumulado)" icon="repeat" state={rvValid ? 'ok' : 'empty'} value={pct(rvValid ? rv.correct / rvValid * 100 : null)} detail={rv.correct + ' de ' + rvValid + ' válidas'} />
              <PerformanceMetricCard compact label="Simulados (histórico)" icon="graduation-cap" state={sim.v ? 'ok' : 'empty'} value={pct(sim.v ? sim.c / sim.v * 100 : null)} detail={sim.c + ' de ' + sim.v + ' válidas · ' + C.plural(sim.k, 'prova', 'provas')} />
            </div>
          </div>
        </div>
      )}
      <SubjectPerformanceExplorer nodes={C.tree(sc)} reveal={reveal} minSample={C.RULES.tableMinSample} lowBelow={C.RULES.lowAccuracy} onAction={intent => dispatch(intent, 'performance')}
        description={'Respostas de treino em ' + (mode === 'day' ? C.fmtFull(f.date) : C.fmt(sc.from) + ' a ' + C.fmt(sc.to)) + '. Ações aparecem só quando há conteúdo vinculado ao tópico.'} />
      <Questions sc={sc} total={cur.n} dispatch={dispatch} />
    </div>
  );
}

const METHOD = [
  ['list-checks', 'Itens julgados', 'acertos + erros + itens em branco. Questões ainda não realizadas não são contadas em nenhum indicador.'],
  ['target', 'Taxa de acerto', 'acertos ÷ (acertos + erros). Itens em branco não entram no denominador. Sem respostas válidas, o cartão informa "Sem respostas válidas" em vez de 0%.'],
  ['scale', 'Nota líquida', 'Regra CEBRASPE selecionada: +1 por acerto, −1 por erro, 0 por branco. A regra aparece junto ao número.'],
  ['circle-help', 'Calibração da confiança', CALIB],
  ['calendar', 'Tarefas concluídas', 'tarefas do planejamento com status concluído ÷ tarefas planejadas no período e nos filtros. Sem tarefas planejadas, nenhum valor é exibido.'],
  ['layers', 'Flashcards avaliados', 'Quantidade de avaliações de cartões registradas no período. Não mede acerto.'],
  ['activity', 'Evolução e comparação', 'Um ponto por dia, semana (domingo a sábado) ou mês com respostas válidas. Períodos sem registro ficam sem ponto e interrompem a linha. A comparação usa o período imediatamente anterior de mesma duração e só aparece quando ele tem registros.'],
  ['flag', 'Prioridades', 'Erros recorrentes: 5 ou mais erros no mesmo tópico em pelo menos 2 dias. Baixa precisão: menos de 60% com 20 ou mais respostas válidas. Pendências vencidas e revisões agendadas vêm do planejamento. Métrica sem registros nunca gera prioridade.'],
  ['split', 'Limites', 'Treino, revisão e simulado são séries separadas. Amostras com menos de 10 (gráfico) ou 20 (hierarquia) respostas válidas são sinalizadas. Indicadores não são diagnósticos.'],
];

function PerformanceScreen({ tab, setTab, go, dispatch }) {
  const missing = Object.entries({ PerformanceMetricCard, PerformanceTrendChart, SubjectPerformanceExplorer, PerformancePriorityPanel, PerformancePeriodSelector }).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return <PageHeader overline="Análise do estudo" title="Desempenho"><EmptyState tone="empty" title="Componentes de Desempenho ainda não compilados" description={'Ausentes no pacote do design system: ' + missing.join(', ') + '. Recarregue após a recompilação.'} /></PageHeader>;
  return <PerformanceBody tab={tab} setTab={setTab} go={go} dispatch={dispatch} />;
}

function PerformanceBody({ tab, setTab, go, dispatch }) {
  const C = window.QB_PERF_CALC, P = window.QB_PLAN;
  const from7 = C.addDays(P.today, -6);
  const [daily, setDaily] = React.useState({ date: P.today, subjectId: 'all', topicId: 'all', gran: 'day' });
  const [hist, setHist] = React.useState({ from: from7 < C.bounds.min ? C.bounds.min : from7, to: P.today, subjectId: 'all', topicId: 'all', gran: 'day' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, border: 'var(--border-hairline)', background: 'var(--surface-sunken)', padding: '20px 24px' }}>
        <div aria-hidden="true" className="qb-img qb-scene-night" style={{ position: 'absolute', inset: '0 0 0 40%', backgroundPosition: '70% 30%', opacity: .3, WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 80%)', maskImage: 'linear-gradient(90deg,transparent,#000 80%)' }}></div>
        <PageHeader style={{ position: 'relative' }} overline="Análise do estudo" title="Desempenho"
          description={tab === 'metodo' ? 'Fórmulas e regras de cálculo de cada indicador.' : <><span style={{ color: 'var(--text-muted)' }}>Período analisado: </span>{scopeLabel(tab === 'diaria' ? 'day' : 'range', tab === 'diaria' ? daily : hist)}</>}
          actions={<Tabs label="Análises" value={tab} onChange={setTab} items={[{ id: 'diaria', label: 'Análise diária', icon: 'calendar' }, { id: 'historica', label: 'Análise histórica', icon: 'activity' }, { id: 'metodo', label: 'Método', icon: 'scale' }]} />} />
      </div>
      {tab === 'diaria' && <Analysis mode="day" f={daily} setF={setDaily} go={go} dispatch={dispatch} />}
      {tab === 'historica' && <Analysis mode="range" f={hist} setF={setHist} go={go} dispatch={dispatch} />}
      {tab === 'metodo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 12 }}>
          {METHOD.map(([i, t, d]) => <Panel key={t} padding={18} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}><span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(208,179,134,.55)', color: 'var(--qb-gold)' }}><Icon name={i} size={18} /></span><span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '600 15px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{t}</span><span style={{ font: '400 14px/1.55 var(--font-body)', color: 'var(--text-secondary)' }}>{d}</span></span></Panel>)}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PerformanceScreen });
})();
