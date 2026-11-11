import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const script = readFileSync("public/claude-export/planner.js", "utf8");
const today = "2026-11-08";
const task = {
  id: "fiscal-pl-t04", topico: "fiscal-t04", capitulo: "FISCAL-DC-04",
  trilha: "00", data: "2026-11-09", titulo: "Tarefa 04 · Constitucionalismo",
  tipo: "estudo", status: "planejada", notas: "Leia o recorte <indicado>."
};
const review = {
  id: "fiscal-pl-extra-00", trilha: "00", data: "2026-11-14",
  titulo: "Limpe os erros", tipo: "revisao", status: "planejada",
};
const later = { ...task, id: "fiscal-pl-t21", trilha: "01", data: "2026-11-16" };
const callbacks = { hoje: () => today, proxDe: () => null };

function fixture(studyAccount = true) {
  const listeners = new Map();
  const document = {
    querySelector: sel => sel === "[data-plan-trail]" ? {
      addEventListener: (event, fn) => listeners.set(event, fn)
    } : null,
    querySelectorAll: () => [],
    getElementById: () => null,
  };
  const env = { window: {}, document, setInterval: () => 1 };
  runInNewContext(script, env);
  const S = {
    studyAccount, studyAccountName: "Área Fiscal", pl: [task, review, later],
    ed: new Map(), q: new Map([["q", {}]]), r: new Map(), cav: new Map(),
    rv: new Map([[task.topico, { mapa: {}, cartoes: [{ q: "?" }] }]]),
    planWeekStart: today, planSelectedDay: today,
  };
  return { planner: env.window.QBPlanner, S, listeners };
}

test("candidate starts on the next scheduled day and sees scoped task shortcuts", () => {
  const { planner, S } = fixture();
  const html = planner.render(S, callbacks);
  assert.equal(S.planSelectedDay, task.data);
  assert.match(html, /Trilhas de estudo · Área Fiscal/);
  assert.match(html, /Leia o recorte &lt;indicado&gt;/);
  assert.match(html, /data-ir-mapa="fiscal-t04"/);
  assert.match(html, /data-ir-cart="fiscal-t04"/);
  assert.match(html, /data-treinar="FISCAL-DC-04"/);
  assert.match(html, /value="2026-11-16"[^>]*>Trilha 01/);
  S.planSelectedDay = review.data;
  assert.match(planner.render(S, callbacks), /data-sub="caderno"/);
});

test("choosing a trail opens its week and earliest scheduled day", () => {
  const { planner, S, listeners } = fixture();
  let renders = 0;
  planner.wire(S, { ...callbacks, render: () => renders++ });
  listeners.get("change")({ target: { value: "2026-12-31" } });
  assert.equal(renders, 0);
  listeners.get("change")({ target: { value: later.data } });
  assert.equal(S.planSelectedDay, later.data);
  assert.equal(S.planWeekStart, "2026-11-15");
  assert.equal(renders, 1);
});

test("the administrator keeps the existing planner", () => {
  const { planner, S } = fixture(false);
  S.planSelectedDay = task.data;
  const html = planner.render(S, callbacks);
  assert.match(html, /Sua semana de estudos/);
  assert.doesNotMatch(html, /data-plan-trail|data-ir-mapa|data-ir-cart|Trilhas de estudo ·/);
});

test("consolidated trail schedule editor lists posterior and anterior objectives to place in current day or week", () => {
  const { planner, S } = fixture(true);
  S.planSelectedDay = task.data; // 2026-11-09
  const html = planner.render(S, callbacks);
  assert.match(html, /Editar Cronograma da Trilha · Antecipar ou Reagendar Objetivos/);
  assert.match(html, /data-plan-reprog-scope="posteriores"/);
  assert.match(html, /data-plan-reprog-scope="anteriores"/);
  assert.match(html, /data-plan-target-day="fiscal-pl-t21"/);
  assert.match(html, /data-plan-action="move-today"/);
  assert.match(html, /data-plan-action="shift-prev-day"/);
  assert.match(html, /data-plan-action="shift-next-day"/);
});
