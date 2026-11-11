import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const env = { window: {}, Date, Intl };
runInNewContext(readFileSync("public/claude-export/study-cycles.js", "utf8"), env);
const cycle = env.window.QBStudyCycles;
const start = "2026-11-08";
const topics = [
  { id: "dt-1", materia: "Direito Tributário", titulo: "Imunidades", ordem: 1, caps: ["DT-1"] },
  { id: "dt-2", materia: "Direito Tributário", titulo: "Impostos", ordem: 2, caps: ["DT-2"] },
  { id: "lp-1", materia: "Português", titulo: "Classes gramaticais", ordem: 1, caps: ["LP-1"] },
  { id: "lp-2", materia: "Português", titulo: "Sintaxe", ordem: 2, caps: ["LP-2"] },
  { id: "da-1", materia: "Direito Administrativo", titulo: "Licitações", ordem: 1, caps: ["DA-1"] }
];
const config = { dayMinutes: [0, 180, 120, 120, 0, 0, 0], subjects: ["Português", "Direito Tributário", "Direito Administrativo"], cycleMinutes: 50, breakMinutes: 10 };

test("respect weekly availability and round-robin across exactly the selected subjects", () => {
  const plan = cycle.generate({ config, start, edital: topics, today: start });
  assert.equal(plan.intensity, 0.8);
  assert.equal(plan.subjects, 3);
  assert.ok(plan.tasks.length > 3);
  assert.equal(plan.goalMinutes, 420);
  assert.ok(plan.plannedMinutes <= 420 * 0.8);
  assert.deepEqual([...new Set(plan.tasks.map(t => t.materia))].sort(), [...config.subjects].sort());
  assert.deepEqual([...plan.tasks.slice(0, 3).map(t => t.materia)], config.subjects);
  assert.ok(plan.tasks.every(t => t.topico && t.cicloEstudo && t.status === "planejada"));
  for (const [i, minutes] of config.dayMinutes.entries()) {
    const date = cycle.shift(start, i);
    const scheduled = plan.tasks.filter(t => t.data === date);
    const study = scheduled.reduce((n, t) => n + t.minutos, 0);
    const breaks = Math.max(0, scheduled.length - 1) * config.breakMinutes;
    assert.ok(study + breaks <= Math.round(minutes * plan.intensity), date);
  }
});

test("completion increases next weekly intensity without duplicating old study topics", () => {
  const first = cycle.generate({ config, start, edital: topics, today: start });
  const completed = first.tasks.map(t => ({ ...t, status: "concluida" }));
  const next = cycle.generate({ config, start: "2026-11-15", edital: topics, existing: completed, today: start });
  assert.equal(next.intensity, 1);
  assert.ok(next.tasks.length > 0);
  assert.notEqual(next.tasks[0].id, completed[0].id);
  const priorForSubject = completed.filter(t => t.materia === next.tasks[0].materia).length;
  const subjectTopics = cycle.availableSubjects(topics).get(next.tasks[0].materia);
  assert.equal(next.tasks[0].topico, subjectTopics[priorForSubject % subjectTopics.length].id);
  assert.throws(() => cycle.generate({ config, start: "2026-11-15", edital: topics, existing: [...completed, ...next.tasks], today: start }), /já possui ciclos/);
});

test("low completion retains conservative load and manual activities consume free time", () => {
  const first = cycle.generate({ config, start, edital: topics, today: start });
  const busy = { id: "manual-1", data: "2026-11-16", minutos: 90, status: "planejada", tipo: "simulado" };
  const next = cycle.generate({ config, start: "2026-11-15", edital: topics, existing: [...first.tasks, busy], today: start });
  assert.equal(next.intensity, 0.8);
  const plannedMonday = next.tasks.filter(t => t.data === "2026-11-16").reduce((n,t) => n + t.minutos, 0);
  assert.ok(plannedMonday + busy.minutos <= Math.round(config.dayMinutes[1] * 0.8));
});

test("rejects zero availability, unavailable subjects, retroactive planning and invalid blocks", () => {
  assert.throws(() => cycle.normalize({ ...config, dayMinutes: Array(7).fill(0) }), /disponível/);
  assert.throws(() => cycle.generate({ config: { ...config, subjects: ["Inexistente"] }, start, edital: topics }), /ausente do edital/);
  assert.throws(() => cycle.generate({ config, start, edital: topics, today: "2026-11-25" }), /retroativos/);
  assert.throws(() => cycle.normalize({ ...config, cycleMinutes: 17 }), /duração/);
});

test("progress by matter isolates auto-generated blocks and ignores other manual tasks", () => {
  const plan = cycle.generate({ config, start, edital: topics, today: start });
  const first = { ...plan.tasks[0], status: "concluida" };
  const score = cycle.weekProgress([...plan.tasks.slice(1), first, { id: "other", data: start, minutos: 999, status: "concluida" }], start);
  assert.equal(score.sessions, plan.tasks.length);
  assert.equal(score.done, 1);
  assert.equal(score.doneMinutes, first.minutos);
  assert.equal(Object.keys(score.bySubject).length, 3);
});
