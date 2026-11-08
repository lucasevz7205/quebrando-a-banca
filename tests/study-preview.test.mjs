import assert from "node:assert/strict";
import { test } from "node:test";
import { getStudyPreviewAccount, readStudyPreview } from "../src/lib/study-preview.server.js";

const accounts = [
  { id: "fiscal", active: true, exam_name: "Área Fiscal", user_id: "candidate" },
  { id: "inactive", active: false, exam_name: "Área Fiscal", user_id: "other" },
];
const rows = [
  { study_account_id: "fiscal", collection: "planejamento", legacy_id: "day", payload_json: '{"titulo":"Tarefa fiscal"}' },
  { study_account_id: "another", collection: "planejamento", legacy_id: "day", payload_json: '{"titulo":"Outro ambiente"}' },
];
const context = {
  user: { role: "admin" },
  getBase44: () => ({ asServiceRole: { entities: {
    StudyAccount: { get: async id => accounts.find(account => account.id === id) },
    StudyDocument: { filter: async query => rows.filter(row => Object.entries(query).every(([k, v]) => row[k] === v)) },
  } } }),
};

test("a candidate cannot use preview reads, even for an existing account", async () => {
  const candidate = {
    user: { role: "user" },
    getBase44: () => assert.fail("Service-role access before authorization"),
  };
  await assert.rejects(getStudyPreviewAccount(candidate, "fiscal"), { status: 403 });
  assert.throws(() => readStudyPreview(candidate, "fiscal", { collection: "planejamento" }), { status: 403 });
});

test("an admin can open an active candidate interface and read only its selected scope", async () => {
  assert.deepEqual(await getStudyPreviewAccount(context, "fiscal"), {
    id: "fiscal", name: "Área Fiscal", date: null, preview: true,
  });
  await assert.rejects(getStudyPreviewAccount(context, "inactive"), /ambiente de estudo ativo/);
  await assert.rejects(getStudyPreviewAccount(context, "missing"), /ambiente de estudo ativo/);
  assert.deepEqual(await readStudyPreview(context, "fiscal", { collection: "planejamento" }), [
    { id: "day", titulo: "Tarefa fiscal" },
  ]);
  await assert.rejects(readStudyPreview(context, "fiscal", { collection: "User" }), /Coleção não permitida/);
});
