// Demo data v2 — edital, plan, performance, simulado. ALL numbers are fictitious and generated deterministically.
// Topic numbering per subject follows the heat-map reference screenshots; titles only where they appear in the references.
(() => {
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const range = (p, a, b) => Array.from({ length: b - a + 1 }, (_, i) => p + (a + i));
  const SUBJECTS = [
    { id: 'lp', name: 'Língua Portuguesa', short: 'LP', block: 'P1', icon: 'feather', nums: ['1', '2', '3', '4.1', '4.2', ...range('5.', 1, 8), ...range('6.', 1, 4)] },
    { id: 'li', name: 'Língua Inglesa', short: 'LI', block: 'P1', icon: 'globe', nums: ['1', '2', '3'] },
    { id: 'da', name: 'Direito Administrativo e Administração Pública', short: 'DA', block: 'P1', icon: 'building-2', nums: ['1', '1.1', '1.2', '2.1', '2.2', ...range('3.', 1, 4), ...range('4.', 1, 4), '5.1', '5.2', ...range('6.', 1, 5), '7', '8', ...range('8.', 1, 4), ...range('9.', 1, 4), ...range('10.', 1, 7), '11', '12'] },
    { id: 'dc', name: 'Direito Constitucional e Regimento Interno', short: 'DC', block: 'P1', icon: 'landmark', nums: ['1', '2a', '2b', '2c', '2d', '2e', '2f', '3', '4', '5', '6', ...range('7.', 1, 4), '8.1', '8.2'] },
    { id: 'ti', name: 'Tecnologia da Informação e Dados', short: 'TI', block: 'P1', icon: 'database', nums: ['1', '1.2', '1.3', '1.4', '2', '2.1', '3', '4', '4.1', '4.2', '4.3', '5', '5.1', '5.2', '5.3', '6', '7.1', ...range('8.', 1, 4)] },
    { id: 'lg', name: 'Linguística', short: 'Linguística', block: 'P2', icon: 'languages', nums: ['1', '2', ...range('3.', 1, 8), '4.1', '4.2', ...range('5.', 1, 3), '6.1', '6.2', ...range('7.', 1, 3), '8', '9', '10', '11', '12', '13'] },
    { id: 'rf', name: 'Reconhecimento de Fala, Transcrição e IA', short: 'Fala e IA', block: 'P2', icon: 'audio-lines', nums: [...range('1.', 1, 8), ...range('2.', 1, 8), ...range('3.', 1, 4), ...range('4.', 1, 3)] },
    { id: 'pl', name: 'Processo Legislativo e Regimentos', short: 'Proc. Legislativo', block: 'P2', icon: 'scroll-text', nums: [...range('1.', 1, 5), '2.1', '3.1'] },
    { id: 'cp', name: 'Ciência Política', short: 'Ciência Política', block: 'P2', icon: 'vote', nums: range('', 1, 11) },
  ];
  const BLOCKS = { P1: 'Conhecimentos básicos', P2: 'Conhecimentos específicos (rótulo demonstrativo)' };
  const TITLES = {
    'lp-1': 'Compreensão e interpretação de textos de gêneros variados', 'lp-4.2': 'Emprego de tempos e modos verbais',
    'da-10.1': 'Licitações públicas: conceitos, princípios, modalidades e procedimentos', 'da-10.6': 'Papel do fiscalizador do contrato',
    'ti-3': 'Ferramentas de comunicação e colaboração: correio eletrônico, internet e aplicativos', 'ti-4': 'Correio eletrônico e assinatura digital',
    'ti-4.2': 'Noções de vírus, worms e programas maliciosos', 'cp-3': 'Sistemas e formas de governo',
  };
  const GROUP_TITLES = { 'da:3': 'Governança na Administração Pública', 'da:4': 'Poderes administrativos e processo administrativo', 'dc:2': 'Regimento Interno da Câmara dos Deputados', 'da:10': 'Licitações e contratos' };

  const subjects = SUBJECTS.map(s => ({
    id: s.id, name: s.name, short: s.short, block: s.block, blockLabel: BLOCKS[s.block], icon: s.icon,
    topics: s.nums.map(num => {
      const id = s.id + '-' + num;
      const r = rnd();
      let correct = 0, wrong = 0, blank = 0, status = 'not-started';
      if (r > 0.42) {
        const n = 6 + Math.floor(rnd() * 54);
        const acc = [0.48, 0.66, 0.8, 0.87, 0.94][Math.floor(rnd() * 5)] + (rnd() - 0.5) * 0.04;
        correct = Math.round(n * acc); wrong = n - correct; blank = rnd() > 0.7 ? 1 + Math.floor(rnd() * 3) : 0;
        const pct = correct / n;
        status = pct >= 0.9 && n >= 20 ? 'mastered' : pct >= 0.75 ? (rnd() > 0.3 ? 'reviewing' : 'studying') : 'studying';
      } else if (r > 0.33) status = 'studying';
      return { id, num, title: TITLES[id] || null, known: !!TITLES[id], status, correct, wrong, blank };
    }),
  }));

  // ---------- Plan ----------
  const TODAY = '2026-11-14';
  const WD = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const types = ['estudo', 'revisao', 'questoes', 'revisao', 'questoes', 'flashcards', 'estudo', 'discursiva'];
  const allTopics = subjects.flatMap(s => s.topics.map(t => ({ s, t })));
  const iso = d => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const weekStart = offset => addDays('2026-11-08', offset * 7);
  let tid = 0;
  function genWeek(offset) {
    const start = weekStart(offset); const tasks = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, d);
      const count = 7 + ((d * 3 + offset * 5 + 14) % 3);
      for (let k = 0; k < count; k++) {
        const pick = allTopics[(d * 17 + k * 11 + (offset + 5) * 23) % allTopics.length];
        const type = (offset === 0 && d === 3 && k === 0) ? 'simulado' : types[(d + k * 3) % types.length];
        const past = date < TODAY;
        const done = past && (offset < 0 ? (k + d) % 7 !== 0 : (k + d) % 3 !== 0);
        tasks.push({ id: 't' + (++tid), date, subjectId: pick.s.id, subject: pick.s.name, topicNum: type === 'simulado' ? null : pick.t.num,
          title: type === 'simulado' ? 'Simulado curto · P1 (demonstração)' : (pick.t.title || 'Tópico ' + pick.t.num + ' — ' + pick.s.short),
          type, minutes: type === 'simulado' ? 90 : type === 'discursiva' ? 60 : type === 'flashcards' ? 15 : type === 'revisao' ? 25 : 40,
          status: done ? 'done' : past ? 'late' : 'pending', auto: type === 'revisao' && k % 2 === 0 });
      }
    }
    return tasks;
  }
  const plan = { today: TODAY, weekday: WD, weekStart, addDays, weeks: { 0: genWeek(0), '-1': genWeek(-1), 1: genWeek(1) }, genWeek,
    hours: [2, 3, 3, 3, 3, 3, 5],
    cycle: [{ subjectId: 'dc', name: 'Direito Constitucional e Regimento Interno', minutes: 90 }, { subjectId: 'pl', name: 'Processo Legislativo e Regimentos', minutes: 90 }, { subjectId: 'lp', name: 'Língua Portuguesa', minutes: 60 }, { subjectId: 'da', name: 'Direito Administrativo e Administração Pública', minutes: 90 }, { subjectId: 'ti', name: 'Tecnologia da Informação e Dados', minutes: 60 }, { subjectId: 'lg', name: 'Linguística', minutes: 60 }] };

  // ---------- Performance (training only; simulados kept apart) ----------
  const days = [];
  const base = [[64, 51, 13, 0], null, [88, 70, 17, 1], [120, 98, 21, 1], [6, 5, 1, 0], [140, 119, 20, 1], [96, 82, 14, 0], [110, 90, 19, 1], null, [130, 107, 22, 1], [150, 125, 24, 1], [118, 100, 17, 1], [160, 135, 24, 1], [248, 205, 42, 1]];
  base.forEach((v, i) => { const date = addDays('2026-11-01', i); days.push(v ? { date, n: v[0], correct: v[1], wrong: v[2], blank: v[3] } : { date, n: 0, correct: 0, wrong: 0, blank: 0 }); });
  const performance = { days, today: { flashcards: 62, rounds: 11 }, review: { n: 40, correct: 31, wrong: 9 } };

  // ---------- Simulado ----------
  const simulado = {
    profile: 'Câmara dos Deputados · Analista Legislativo — perfil de exemplo das referências',
    next: { date: '2026-11-21', label: 'sábado, 21/11' },
    objective: { items: 180, minutes: 300 }, discursive: { minutes: 180, minLines: 20, maxLines: 30 },
    scoring: { correct: 1, wrong: -1, blank: 0 },
    blocks: [
      { block: 'P1', label: 'Conhecimentos básicos', subjects: [{ name: 'Língua Portuguesa', planned: 20, available: 64 }, { name: 'Língua Inglesa', planned: 10, available: 6 }, { name: 'Direito Administrativo e Adm. Pública', planned: 25, available: 112 }, { name: 'Direito Constitucional e Regimento Interno', planned: 20, available: 98 }, { name: 'Tecnologia da Informação e Dados', planned: 15, available: 41 }] },
      { block: 'P2', label: 'Conhecimentos específicos', subjects: [{ name: 'Linguística', planned: 25, available: 37 }, { name: 'Reconhecimento de Fala, Transcrição e IA', planned: 25, available: 18 }, { name: 'Processo Legislativo e Regimentos', planned: 25, available: 52 }, { name: 'Ciência Política', planned: 15, available: 29 }] },
    ],
    demoItems: [
      { s: 'DC', key: 'C', text: 'A matéria constante de proposta de emenda à Constituição rejeitada ou havida por prejudicada não pode ser objeto de nova proposta na mesma sessão legislativa.' },
      { s: 'DC', key: 'E', text: 'Durante a vigência de estado de defesa, a Constituição poderá ser emendada, desde que a proposta seja de iniciativa do Presidente da República.' },
      { s: 'DC', key: 'C', text: 'Compete privativamente à Câmara dos Deputados autorizar, por dois terços de seus membros, a instauração de processo contra o Presidente da República.' },
      { s: 'DA', key: 'C', text: 'Segundo a Lei n.º 14.133/2021, o fiscal do contrato determinará o que for necessário à regularização das faltas ou dos defeitos observados.' },
      { s: 'DC', key: 'C', text: 'É vedada a edição de medida provisória sobre matéria relativa a partidos políticos.' },
      { s: 'CP', key: 'E', text: 'O Brasil adota o sistema de governo parlamentarista, cabendo ao primeiro-ministro a chefia de governo.' },
      { s: 'DC', key: 'E', text: 'A emenda à Constituição será promulgada pelo Presidente da República, após a sanção.' },
      { s: 'DC', key: 'C', text: 'A proposta de emenda à Constituição será discutida e votada em cada Casa do Congresso Nacional, em dois turnos, considerando-se aprovada se obtiver, em ambos, três quintos dos votos dos respectivos membros.' },
      { s: 'LP', key: 'E', text: 'Na frase “Refiro-me à pessoas que chegaram cedo”, o emprego do acento indicativo de crase está correto.' },
      { s: 'DC', key: 'C', text: 'Se a medida provisória não for apreciada em até quarenta e cinco dias contados de sua publicação, entrará em regime de urgência.' },
    ],
    history: [
      { id: 'h3', date: '31/10/2026', kind: 'Objetiva · completo', items: 180, correct: 121, wrong: 38, blank: 21, minutes: 284 },
      { id: 'h2', date: '17/10/2026', kind: 'Objetiva · P1', items: 90, correct: 58, wrong: 22, blank: 10, minutes: 142 },
      { id: 'h1', date: '03/10/2026', kind: 'Discursiva', items: null, correct: null, wrong: null, blank: null, minutes: 171, note: 'Sem correção automática' },
    ],
  };

  window.QB_EDITAL = { subjects, groupTitles: GROUP_TITLES, blocks: BLOCKS };
  window.QB_PLAN = plan;
  window.QB_PERF = performance;
  window.QB_SIM = simulado;
})();
