import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

/* ---------- Autonomia da rotina (planner.js) ---------- */
const plannerCode = readFileSync("public/claude-export/planner.js", "utf8");
const today = "2026-11-08"; // domingo
function planner(tasks, selected = today) {
  const env = { window: {}, document: { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null }, setInterval: () => 1 };
  runInNewContext(plannerCode, env);
  const S = {
    studyAccount: true, studyAccountName: "PCMG", pl: tasks.map(t => ({ ...t })),
    ed: new Map(), q: new Map(), r: new Map(), cav: new Map(), rv: new Map(),
    planWeekStart: today, planSelectedDay: selected,
  };
  return { P: env.window.QBPlanner, S };
}
const base = [
  { id: "a", trilha: "00", data: "2026-11-09", titulo: "Tarefa 01", tipo: "estudo", status: "planejada", minutos: 60 },
  { id: "b", trilha: "00", data: "2026-11-12", titulo: "Tarefa 02", tipo: "estudo", status: "planejada", minutos: 60 },
  { id: "c", trilha: "01", data: "2026-11-16", titulo: "Tarefa 03", tipo: "estudo", status: "planejada", minutos: 60 },
  { id: "d", trilha: "01", data: "2026-11-18", titulo: "Tarefa 04", tipo: "estudo", status: "planejada", minutos: 60 },
  { id: "old", trilha: "00", data: "2026-11-02", titulo: "Atrasada", tipo: "revisao", status: "planejada", minutos: 30 },
  { id: "ok", trilha: "00", data: "2026-11-03", titulo: "Feita", tipo: "estudo", status: "concluida", minutos: 30 },
];

test("painel de autonomia aparece com todos os ajustes rápidos", () => {
  const { P, S } = planner(base, "2026-11-09");
  const html = P.render(S, { hoje: () => today, proxDe: () => null });
  for (const act of ["pull-next-trail-tasks", "pull-next-week", "pull-overdue-today", "push-day-pending", "rebalance-week"])
    assert.match(html, new RegExp(`data-plan-action="${act}"`), act);
  assert.match(html, /AUTONOMIA DA ROTINA/);
  assert.match(html, /data-plan-pull-count/);
  // o editor da trilha consolidada continua disponível
  assert.match(html, /Editar Cronograma da Trilha · Antecipar ou Reagendar Objetivos/);
});

test("puxa objetivos posteriores da trilha para o dia selecionado ou para a semana atual", () => {
  const { P, S } = planner(base, "2026-11-09");
  const day = P.routine.pullNext(S, today, 2, "day");
  assert.deepEqual(day.map(t => [t.id, t.data]), [["b", "2026-11-09"], ["c", "2026-11-09"]]);
  const week = P.routine.pullNext(S, today, 2, "week");
  assert.deepEqual(week.map(t => t.id), ["c", "d"]);
  assert.ok(week.every(t => t.data >= today && t.data <= "2026-11-14"));
  assert.equal(new Set(week.map(t => t.data)).size, 2);
});

test("traz atrasados para hoje sem tocar no que já foi concluído", () => {
  const { P, S } = planner(base);
  const moved = P.routine.pullOverdue(S, today);
  assert.deepEqual(moved.map(t => [t.id, t.data]), [["old", today]]);
});

test("desafoga o dia (+1) e redistribui a semana por carga", () => {
  const heavy = [
    ...base,
    { id: "e", data: "2026-11-09", titulo: "Extra 1", tipo: "questoes", status: "planejada", minutos: 90 },
    { id: "f", data: "2026-11-09", titulo: "Extra 2", tipo: "questoes", status: "planejada", minutos: 90 },
    { id: "run", data: "2026-11-09", titulo: "Em curso", tipo: "estudo", status: "executando", minutos: 60 },
  ];
  const { P, S } = planner(heavy, "2026-11-09");
  const pushed = P.routine.pushDay(S, "2026-11-09");
  assert.deepEqual(pushed.map(t => t.id).sort(), ["a", "e", "f"]);
  assert.ok(pushed.every(t => t.data === "2026-11-10"));
  const balanced = P.routine.rebalanceWeek(S, today);
  assert.ok(balanced.length >= 1);
  assert.ok(balanced.every(t => t.id !== "run" && t.id !== "ok"));
  const after = new Map(S.pl.map(t => [t.id, t.data]));
  for (const t of balanced) after.set(t.id, t.data);
  const load = new Map();
  for (const t of S.pl) { const d = after.get(t.id); if (d >= today && d <= "2026-11-14") load.set(d, (load.get(d) || 0) + (t.minutos || 60)); }
  assert.ok(Math.max(...load.values()) <= 150, "nenhum dia fica sobrecarregado depois de redistribuir");
});

/* ---------- Ciclos: refazer blocos pendentes ---------- */
test("refazer ciclos substitui só os blocos pendentes e não replaneja dias passados", () => {
  const env = { window: {}, Date, Intl };
  runInNewContext(readFileSync("public/claude-export/study-cycles.js", "utf8"), env);
  const cycle = env.window.QBStudyCycles;
  const topics = [
    { id: "p1", materia: "Português", titulo: "Crase", ordem: 1 },
    { id: "d1", materia: "Direito Penal", titulo: "Crime", ordem: 1 },
  ];
  const config = { dayMinutes: [120, 120, 120, 120, 120, 120, 120], subjects: ["Português", "Direito Penal"], cycleMinutes: 50, breakMinutes: 10 };
  const first = cycle.generate({ config, start: today, edital: topics, today });
  const doneOne = { ...first.tasks[0], status: "concluida" };
  const existing = [doneOne, ...first.tasks.slice(1)];
  assert.throws(() => cycle.generate({ config, start: today, edital: topics, existing, today }), /já possui ciclos/);
  const redo = cycle.generate({ config, start: today, edital: topics, existing, today: "2026-11-10", replacePending: true });
  assert.ok(redo.tasks.length > 0);
  assert.ok(redo.tasks.every(t => t.data >= "2026-11-10"));
  assert.ok(redo.tasks.every(t => !existing.some(e => e.id === t.id)), "ids novos, sem sobrescrever blocos antigos");
});

/* ---------- Cornell: cadernos só das matérias do concurso do usuário ---------- */
const cornellCode = readFileSync("public/claude-export/omnistudy-cornell.js", "utf8");
function cornell(S) {
  const window = { Array, Object, Date, Math };
  window.window = window;
  if (S) { window.S = S; window.QBApp = { S }; }
  runInNewContext(cornellCode, window);
  return window.QBOmniCornell;
}
const ARR_IDS = ["nb-pl", "nb-lp", "nb-da", "nb-dc", "nb-lg", "nb-cp", "nb-ti"];

test("candidato vê apenas os cadernos das matérias do seu concurso, nunca os do ARR", () => {
  const S = {
    studyAccount: true, studyAccountName: "PCMG · Escrivão",
    ed: new Map([
      ["pcmg-1", { id: "pcmg-1", materia: "Língua Portuguesa", sigla: "port", ordem: 1 }],
      ["pcmg-2", { id: "pcmg-2", materia: "Direito Penal", sigla: "dp", ordem: 2 }],
      ["pcmg-3", { id: "pcmg-3", materia: "Informática", sigla: "inf", ordem: 3 }],
    ]),
    q: new Map(), pl: [],
  };
  const api = cornell(S);
  // estado antigo contaminado com cadernos e folha-exemplo do ARR
  const state = {
    cornellNotebooks: [
      { id: "nb-pl", name: "Processo Legislativo (PL)", sigla: "PL", custom: false },
      { id: "nb-lp", name: "Língua Portuguesa (LP)", sigla: "LP", custom: false },
      { id: "nb-meu", name: "Meu caderno de revisão", sigla: "REV", custom: true },
    ],
    cornellNotes: [
      { id: "cornell-seed-1", title: "Espécies Normativas", subject: "Processo Legislativo (PL)", notebookId: "nb-pl" },
      { id: "minha", title: "Minha folha", subject: "Meu caderno de revisão", notebookId: "nb-meu" },
    ],
  };
  const nbs = api.ensureNotebooks(state, S);
  const names = Array.from(nbs.map(nb => nb.name));
  assert.deepEqual(Array.from(names.slice(0, 3)), ["Língua Portuguesa", "Direito Penal", "Informática"]);
  assert.ok(names.includes("Meu caderno de revisão"), "caderno criado pelo usuário é preservado");
  assert.ok(!nbs.some(nb => ARR_IDS.includes(nb.id)), "nenhum caderno do ARR");
  assert.ok(!names.some(n => /Processo Legislativo|Linguística|Ciência Política/.test(n)));
  assert.ok(!state.cornellNotes.some(n => n.id === "cornell-seed-1"), "folha-exemplo do ARR removida");

  // ao excluir um caderno da matéria, ele não volta sozinho
  assert.equal(api.deleteNotebook(state, "nb-inf"), true);
  assert.ok(!api.ensureNotebooks(state, S).some(nb => nb.id === "nb-inf"));
});

test("candidato com edital ainda carregando recebe caderno geral, não os do ARR", () => {
  const S = { studyAccount: true, studyAccountName: "Área Fiscal", ed: new Map(), q: new Map(), pl: [] };
  const api = cornell(S);
  const nbs = api.ensureNotebooks({}, S);
  assert.deepEqual(Array.from(nbs.map(nb => nb.id)), ["nb-geral"]);
});

test("conta ARR (legada) mantém suas folhas ao alinhar cadernos com o próprio edital", () => {
  const S = {
    ed: new Map([
      ["pl-1", { id: "pl-1", materia: "Processo Legislativo e Regimentos", sigla: "pl", ordem: 1 }],
      ["lp-1", { id: "lp-1", materia: "Língua Portuguesa", sigla: "lp", ordem: 2 }],
    ]),
  };
  const api = cornell(S);
  const state = { cornellNotes: [{ id: "n1", title: "Quóruns", subject: "Processo Legislativo (PL)", notebookId: "nb-pl" }] };
  api.ensureNotebooks(state); // sem S: legado → cadernos padrão
  const nbs = api.ensureNotebooks(state, S);
  assert.deepEqual(Array.from(nbs.map(nb => nb.id)), ["nb-pl", "nb-lp"]);
  assert.equal(state.cornellNotes[0].notebookId, "nb-pl");
  assert.equal(state.cornellNotes[0].subject, "Processo Legislativo e Regimentos");
});

/* ---------- OmniStudy separado por concurso ---------- */
test("OmniStudy usa armazenamento próprio por concurso e não semeia conteúdo do ARR para o candidato", () => {
  const storage = new Map();
  const window = {
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)) },
  };
  runInNewContext(readFileSync("public/claude-export/omnistudy-ai.js", "utf8"), { window, Date, Math, JSON, console });
  const omni = window.QBOmniStudy;
  assert.equal(omni.storageKey, "qb_omnistudy_state_v2");
  assert.equal(omni.state.cornellNotes[0].id, "cornell-seed-1"); // legado preservado
  const key = omni.syncContestContext({ studyAccount: true, studyAccountName: "PCMG · Escrivão" });
  assert.equal(key, "qb_omnistudy_state_v2__pcmg-escrivao");
  assert.equal(omni.state.cornellNotes.length, 0);
  assert.equal(omni.state.decks[0].cards.length, 0);
  assert.match(omni.state.subject, /PCMG/);
  assert.ok(storage.has("qb_omnistudy_state_v2__pcmg-escrivao"));
  const shell = readFileSync("src/components/qb/study-shell.html", "utf8");
  assert.match(shell, /window\.S=S; window\.QBApp=\{S,render:/);
  assert.match(shell, /syncContestContext\?\.\(S\)/);
});
