(() => {
const { PageHeader, Tabs, StatCard, BarChart, Panel, WeekCalendar, TaskCard, RescheduleActions, CycleConfigurator, Button, Badge, EmptyState, Icon } = window.QuebrandoABancaDesignSystem_3e4054;
const WDL = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function PlanScreen({ tab, setTab, go, openArchitect, toast }) {
  const P = window.QB_PLAN, M = window.QB_METRICS;
  const [tasks, setTasks] = React.useState(() => [...P.weeks['-1'], ...P.weeks[0], ...P.weeks[1]]);
  const [offset, setOffset] = React.useState(0);
  const [selDate, setSelDate] = React.useState(P.today);
  const [selTask, setSelTask] = React.useState(null);
  const [qty, setQty] = React.useState(3);
  const [preview, setPreview] = React.useState(null);
  const [undo, setUndo] = React.useState(null);
  const [hours, setHours] = React.useState(P.hours);
  const [cycle, setCycle] = React.useState(P.cycle);
  React.useEffect(() => { [-1, 0, 1].forEach(o => { P.weeks[o] = tasks.filter(t => t.date >= P.weekStart(o) && t.date <= P.addDays(P.weekStart(o), 6)); }); }, [tasks]);

  const dl = iso => { const d = new Date(iso + 'T12:00:00Z'); return WDL[d.getUTCDay()] + ' ' + M.fmtDate(iso); };
  const start = P.weekStart(offset), end = P.addDays(start, 6);
  const days = Array.from({ length: 7 }, (_, i) => { const date = P.addDays(start, i); const ts = tasks.filter(t => t.date === date); return { date, weekday: P.weekday[i], dayNum: +date.slice(8), tasks: ts, autoReviews: ts.filter(t => t.auto).length }; });
  const movable = t => t.status !== 'done' && !t.auto;
  const late = tasks.filter(t => t.status === 'late');
  const dayMovable = tasks.filter(t => t.date === selDate && movable(t));
  const weekPending = tasks.filter(t => t.date >= P.weekStart(0) && t.date <= P.addDays(P.weekStart(0), 6) && movable(t));

  const compute = action => {
    let ch = [], skipped = 0, desc = '';
    const after = tasks.filter(t => t.date > selDate && movable(t) && t.status === 'pending').sort((a, b) => a.date.localeCompare(b.date));
    if (action === 'pull') { ch = after.slice(0, qty).map(t => ({ t, to: selDate })); desc = 'antecipar as próximas ' + qty + ' atividades para ' + dl(selDate); }
    if (action === 'spread') {
      const targets = Array.from({ length: 7 }, (_, i) => P.addDays(P.today, i));
      const load = Object.fromEntries(targets.map(d => [d, tasks.filter(t => t.date === d).length]));
      ch = tasks.filter(t => t.date > P.addDays(P.today, 6) && movable(t)).slice(0, qty).map(t => { const d = targets.reduce((a, b) => load[b] < load[a] ? b : a); load[d]++; return { t, to: d }; });
      desc = 'distribuir as próximas ' + qty + ' atividades nos próximos 7 dias, priorizando os dias mais leves';
    }
    if (action === 'late') { ch = late.filter(t => !t.auto).map(t => ({ t, to: P.today })); skipped = late.filter(t => t.auto).length; desc = 'trazer ' + ch.length + ' atividades atrasadas para hoje'; }
    if (action === 'relieve') { ch = dayMovable.slice(-qty).map(t => ({ t, to: P.addDays(selDate, 1) })); skipped = tasks.filter(t => t.date === selDate && t.auto && t.status !== 'done').length; desc = 'aliviar ' + dl(selDate) + ' movendo ' + ch.length + ' atividades para o dia seguinte'; }
    if (action === 'redistribute') {
      const targets = Array.from({ length: 7 }, (_, i) => P.addDays(P.today, i));
      const pool = [...late.filter(t => !t.auto), ...tasks.filter(t => t.date >= P.today && t.date <= P.addDays(P.weekStart(0), 6) && movable(t) && t.status === 'pending')];
      ch = pool.map((t, i) => ({ t, to: targets[i % targets.length] })).filter(c => c.to !== c.t.date || c.t.status === 'late');
      skipped = late.filter(t => t.auto).length; desc = 'redistribuir ' + ch.length + ' pendências igualmente pelos próximos 7 dias';
    }
    setPreview({ action, description: desc, skipped, changes: ch.map(c => ({ id: c.t.id, title: (c.t.topicNum ? c.t.topicNum + ' ' : '') + c.t.title, from: dl(c.t.date) + (c.t.status === 'late' ? ' (atrasada)' : ''), to: dl(c.to), _to: c.to })) });
  };
  const apply = () => {
    const prev = tasks;
    const map = Object.fromEntries(preview.changes.map(c => [c.id, c._to]));
    setTasks(ts => ts.map(t => map[t.id] ? { ...t, date: map[t.id], status: 'pending' } : t));
    const msg = preview.changes.length + ' atividades reagendadas. Nada foi concluído ou apagado.';
    setUndo({ prev, msg }); setPreview(null);
    toast({ tone: 'success', title: 'Cronograma ajustado', message: msg, action: { label: 'Desfazer', onClick: () => { setTasks(prev); setUndo(null); } } });
  };
  const previews = preview ? Object.fromEntries(preview.changes.map(c => [c.id, '→ ' + c.to])) : {};

  const today = window.QB_PERF.days[window.QB_PERF.days.length - 1];
  const td = M.dayStats(today);
  const last7 = window.QB_PERF.days.slice(-7).map(M.dayStats);
  const s7 = last7.reduce((a, d) => ({ c: a.c + d.correct, v: a.v + d.valid }), { c: 0, v: 0 });
  const todayTasks = tasks.filter(t => t.date === P.today);
  const tDone = todayTasks.filter(t => t.status === 'done').length;
  const sel = selTask && tasks.find(t => t.id === selTask);

  const reschedule = (
    <RescheduleActions dayLabel={dl(selDate)} quantity={qty} onQuantity={setQty} counts={{ late: late.filter(t => !t.auto).length, day: dayMovable.length, week: weekPending.length + late.filter(t => !t.auto).length }}
      preview={preview} onPreview={compute} onConfirm={apply} onCancel={() => setPreview(null)} lastApplied={undo && undo.msg} onUndo={() => { setTasks(undo.prev); setUndo(null); }}
      onEdit={() => { setTab('semana'); setSelDate(P.today); compute('pull'); }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader overline="Planejamento de estudos · dados demonstrativos" title="Planejamento" description="Tarefas do dia, calendário da semana e sequência do ciclo de matérias."
        actions={<Tabs label="Visualização do planejamento" value={tab} onChange={setTab} items={[{ id: 'hoje', label: 'Hoje', icon: 'calendar' }, { id: 'semana', label: 'Semana', icon: 'calendar-days' }, { id: 'ciclos', label: 'Ciclos', icon: 'repeat' }]} />} />
      <Panel padding={16} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Panorama de {dl(P.today)}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
            <StatCard compact label="Respostas C/E" value={td.valid} detail={td.blank + ' em branco à parte'} />
            <StatCard compact label="Taxa de acertos" tone="correct" value={M.pct(td.accuracy)} detail={td.correct + '/' + td.valid} />
            <StatCard compact label="Tarefas" value={tDone + '/' + todayTasks.length} detail="concluídas hoje" />
          </div>
          <button className="qb-linkbtn" style={{ alignSelf: 'flex-start' }} onClick={() => go('performance')}>Abrir análise diária →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '500 13px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>Acertos nas rodadas de treino · últimos 7 dias</span>
          <BarChart height={120} max={100} format={v => Math.round(v) + '%'} label="Taxa de acertos por dia" data={last7.map(d => ({ label: M.fmtDate(d.date), value: d.accuracy, muted: d.valid > 0 && d.valid < 10, title: M.fmtDate(d.date) + ': ' + (d.valid ? M.pct(d.accuracy) + ' (' + d.correct + '/' + d.valid + ')' : 'sem respostas') }))} />
          <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>No período: {s7.c}/{s7.v} acertos ({M.pct(s7.c / s7.v * 100)}). Brancos fora do cálculo; barra esmaecida = menos de 10 respostas.</span>
        </div>
      </Panel>

      {tab === 'hoje' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16, alignItems: 'start' }}>
          <Panel style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2 style={{ font: 'var(--type-h2)', flex: 1 }}>Hoje · {dl(P.today)}</h2><span style={{ font: '400 13px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{Math.round(todayTasks.reduce((a, t) => a + t.minutes, 0) / 6) / 10} h planejadas · {hours[6]} h disponíveis</span></div>
            {todayTasks.map(t => <TaskCard key={t.id} task={t} selected={t.id === selTask} preview={previews[t.id]} onClick={() => setSelTask(t.id)} />)}
            {late.length > 0 && <>
              <span className="qb-overline" style={{ color: 'var(--state-incorrect)', marginTop: 8 }}>Atrasadas · {late.length}</span>
              {late.slice(0, 3).map(t => <TaskCard key={t.id} task={t} selected={t.id === selTask} preview={previews[t.id]} onClick={() => setSelTask(t.id)} />)}
              {late.length > 3 && <span style={{ font: '400 13px/1 var(--font-body)', color: 'var(--text-muted)' }}>+ {late.length - 3} atrasadas — veja a semana</span>}
            </>}
          </Panel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sel ? (
              <Panel variant="ornate" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Tarefa selecionada</span>
                <h3 style={{ font: '400 22px/1.25 var(--font-heading)' }}>{sel.topicNum ? sel.topicNum + ' · ' : ''}{sel.title}</h3>
                <span style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>{sel.subject} · {sel.minutes} min · {dl(sel.date)}{sel.auto ? ' · revisão automática' : ''}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button icon="play" onClick={() => go(sel.type === 'questoes' || sel.type === 'revisao' ? 'questions' : sel.type === 'flashcards' ? 'flashcards' : sel.type === 'simulado' ? 'simulado' : 'study')}>Iniciar</Button>
                  <Button variant="secondary" icon="check" disabled={sel.status === 'done'} onClick={() => { setTasks(ts => ts.map(t => t.id === sel.id ? { ...t, status: 'done' } : t)); toast({ tone: 'success', title: 'Tarefa concluída' }); }}>Marcar concluída</Button>
                  <Button variant="ghost" icon="sparkles" onClick={() => openArchitect({ subjectId: sel.subjectId, origin: 'tarefa de ' + dl(sel.date) })}>O Arquiteto</Button>
                </div>
              </Panel>
            ) : <EmptyState icon="calendar" title="Selecione uma tarefa" description="Veja detalhes, inicie a atividade ou abra O Arquiteto no contexto dela." />}
            {reschedule}
          </div>
        </div>
      )}

      {tab === 'semana' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reschedule}
          <Panel padding={14}>
            <WeekCalendar days={days} today={P.today} selectedDate={selDate} onSelectDay={d => { setSelDate(d); setPreview(null); }} selectedTaskId={selTask} onSelectTask={t => setSelTask(t.id)} previews={previews}
              weekLabel={M.fmtDate(start) + ' a ' + M.fmtDate(end) + (offset === 0 ? ' · semana atual' : '')} onPrevWeek={() => setOffset(o => Math.max(-1, o - 1))} onNextWeek={() => setOffset(o => Math.min(1, o + 1))} onToday={() => setOffset(0)} isCurrentWeek={offset === 0} />
          </Panel>
          <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Demonstração com 3 semanas (anterior, atual e próxima). Carga da semana: {Math.round(days.reduce((a, d) => a + d.tasks.reduce((x, t) => x + t.minutes, 0), 0) / 60)} h planejadas · {Math.round(days.reduce((a, d) => a + d.tasks.filter(t => t.status === 'done').reduce((x, t) => x + t.minutes, 0), 0) / 60)} h realizadas · {hours.reduce((a, b) => a + b, 0)} h disponíveis.</span>
        </div>
      )}

      {tab === 'ciclos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--text-secondary)', maxWidth: '72ch' }}>O <strong>calendário</strong> diz quando você estuda (horas por dia). O <strong>ciclo</strong> diz o que vem a seguir (sequência de matérias) — ao terminar uma matéria, o plano passa para a próxima, independentemente do dia da semana.</p>
          <CycleConfigurator hours={hours} onHoursChange={setHours} cycle={cycle} onCycleChange={setCycle} available={window.QB_EDITAL.subjects.map(s => ({ id: s.id, name: s.name }))} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PlanScreen });
})();
