import test from "node:test";
import assert from "node:assert/strict";
import { editorialAuthorals, incidence, proofCatalog, studyCatalog } from "../src/lib/qb-catalog.js";
import { ranking } from "../src/lib/qb-domain.js";

test("fiscal questions follow the edital and preserve their source without assigning a past exam", () => {
  const question = { id: "fiscal-t04-ce25", cap: "FISCAL-DC-04", origem: "Autoral original",
    enunciado: "Item autoral", gabarito: "E", fonte: { documento: "Apostila", pagina: 16 } };
  const [item] = studyCatalog([question], [{ id: "fiscal-t04", caps: [question.cap],
    materia: "Direito Constitucional", titulo: "Constitucionalismo" }], "Área Fiscal");
  assert.equal(item.assunto, "Constitucionalismo");
  assert.equal(item.cargo, null);
  assert.equal(item.fonte.pagina, 16);
  assert.equal(proofCatalog([question], []).length, 0);
});

test("incidence uses distinct eligible proof items and false items for the mechanism denominator", () => {
  const base = { documento: "analise/CD26-PLF-CG", materia: "Direito Administrativo", gabarito: "E", topico: "A" };
  const question = (item, overrides = {}) => ({ ...base, id: String(item), item, ...overrides });
  const first = question(1, { mecanismo: "F3" });
  const items = proofCatalog([first, { ...first, id: "copy" }, question(2), question(3, { topico: "B", gabarito: "C" }),
    question(4, { anulado: true }), question(5, { duplicataProva: true }),
    question(6, { mecanismo: "F1", pending: ["mecanismo"] }),
    question(7, { documento: "analise/CD26-TEC-CE" })], []);
  const result = incidence(items, base.materia, "A", "Policial Legislativo Federal", "2026");
  assert.deepEqual([result.ocorrencias, result.total, result.falsos, result.semMecanismo], [3, 4, 3, 2]);
  assert.deepEqual(result.rows, [{ mecanismo: "F3", n: 1, proporcao: 1 / 3, referencias: ["1"] }]);
  assert.equal(incidence(items, base.materia, "A", "Policial Legislativo Federal", "2025").total, 0);
});

test("an editorial original is exportable without entering the historical mechanism ranking", () => {
  const item = { id: "original-1", tipo: "autoral", enunciado: "Item", gabarito: "E", mecanismo: "F3",
    materia: "Direito Constitucional", assunto: "Constitucionalismo" };
  assert.equal(editorialAuthorals([item]).length, 1);
  assert.equal(ranking([item]).total, 0);
});
