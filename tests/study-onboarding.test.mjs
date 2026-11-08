import assert from "node:assert/strict";
import { test } from "node:test";
import { pendingStudyRequest, requestStudyAccess, withStudyRequestGate } from "../src/lib/study-onboarding.js";

const candidate = { id: "candidate-1", role: "user" };
const other = { id: "candidate-2", role: "user" };
const draft = { examName: "Tribunal de Contas", examDate: "2027-02-28" };

function fixture(rows = []) {
  const gate = { id: "gate", lease_until: 0, lease_token: "" };
  const matches = (row, query) => Object.entries(query).every(([key, value]) => {
    if (value?.$gt !== undefined) return row[key] > value.$gt;
    if (value?.$lte !== undefined) return row[key] <= value.$lte;
    return row[key] === value;
  });
  const entities = {
    StudyRequestGate: {
      list: async () => [{ ...gate }],
      async updateMany(query, data) {
        if (!matches(gate, query)) return { updated: 0 };
        Object.assign(gate, data.$set);
        return { updated: 1 };
      },
    },
    StudyAccount: {
      filter: async (query, _sort, limit) => rows.filter(row => matches(row, query)).slice(0, limit),
      async create(data) {
        const row = { id: "account-" + rows.length, ...data };
        rows.push(row);
        return row;
      },
      async update(id, data) {
        const row = rows.find(row => row.id === id);
        Object.assign(row, data);
        return row;
      },
    },
  };
  return { entities, rows, gate };
}

test("the server owns the link and rejects caller-supplied identity, flags and invalid dates", async () => {
  const { entities, rows } = fixture();
  await assert.rejects(requestStudyAccess(entities, null, draft));
  await assert.rejects(requestStudyAccess(entities, { ...candidate, role: "admin" }, draft));
  for (const field of ["userId", "user_id", "active", "access_pending"]) {
    await assert.rejects(requestStudyAccess(entities, candidate, { ...draft, [field]: other.id }));
  }
  await assert.rejects(requestStudyAccess(entities, candidate, { ...draft, examDate: "2027-02-30" }));
  assert.equal(rows.length, 0);
  assert.deepEqual(await requestStudyAccess(entities, candidate, draft), { status: "pending", pending: draft });
  assert.equal(rows[0].user_id, candidate.id);
  assert.equal(rows[0].active, false);
  assert.equal(rows[0].access_pending, true);
});

test("simultaneous and repeated submissions keep one pending request, scoped to its owner", async () => {
  const { entities, rows } = fixture();
  const alternate = { examName: "Outro concurso" };
  const attempts = await Promise.allSettled([
    requestStudyAccess(entities, candidate, draft),
    requestStudyAccess(entities, candidate, alternate),
  ]);
  assert.equal(attempts.filter(attempt => attempt.status === "fulfilled").length, 1);
  assert.equal(rows.length, 1);
  assert.deepEqual(await requestStudyAccess(entities, candidate, alternate), { status: "pending", pending: draft });
  assert.equal(await pendingStudyRequest(entities.StudyAccount, other), null);
  assert.deepEqual(await requestStudyAccess(entities, other, alternate),
    { status: "pending", pending: { examName: alternate.examName, examDate: null } });
  assert.equal(rows.length, 2);
});

test("active accounts take precedence and a completed request is subject to a cooldown", async () => {
  const { entities, rows } = fixture();
  await requestStudyAccess(entities, candidate, draft);
  Object.assign(rows[0], { active: true, access_pending: false });
  assert.equal(await pendingStudyRequest(entities.StudyAccount, candidate), null);
  assert.deepEqual(await requestStudyAccess(entities, candidate, draft), { status: "active" });
  rows[0].active = false;
  assert.deepEqual(await requestStudyAccess(entities, candidate, draft), { status: "cooldown" });
  assert.equal(rows.length, 1);
});

test("requesting the same previously linked exam retains its account ID and data", async () => {
  const old = { id: "legacy-account", user_id: candidate.id, exam_name: "Tribunal  de Contas", exam_date: draft.examDate, active: false };
  const { entities, rows } = fixture([old]);
  await requestStudyAccess(entities, candidate, { examName: " tribunal de contas " });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "legacy-account");
  assert.equal(rows[0].exam_date, draft.examDate);
  assert.equal(rows[0].access_pending, true);
});

test("a failed write keeps the lease until expiry so an ambiguous retry cannot duplicate it", async () => {
  const { entities, gate } = fixture();
  await assert.rejects(withStudyRequestGate(entities.StudyRequestGate, () => { throw new Error("network"); }), /network/);
  assert.ok(gate.lease_until > Date.now());
  await assert.rejects(requestStudyAccess(entities, candidate, draft), /em andamento/);
  gate.lease_until = 0;
  await requestStudyAccess(entities, candidate, draft);
  assert.equal(gate.lease_until, 0);
});
