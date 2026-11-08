import { z } from "zod";
import { validateStudyAccountDraft } from "./study-provisioning.js";

const cooldownMs = 60_000;
const leaseMs = 120_000;
const normalize = name => name.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

export const studyRequestSchema = z.strictObject({
  examName: z.string().trim().min(3).max(160),
  examDate: z.string().max(10).optional(),
});

export async function pendingStudyRequest(accounts, user) {
  const [row] = await accounts.filter({ user_id: user.id, active: false, access_pending: true }, "created_date", 1);
  return row ? { examName: row.exam_name, examDate: row.exam_date || null } : null;
}

// Base44 creates its own record IDs and does not enforce unique entity fields.
// A filtered update on the one coordination row serializes account mutations across workers.
export async function withStudyRequestGate(gates, action) {
  const rows = await gates.list("created_date", 2);
  if (rows.length !== 1) throw new Error("O serviço de solicitações está temporariamente indisponível.");
  const { id } = rows[0];
  const now = Date.now();
  const token = crypto.randomUUID();
  const claim = await gates.updateMany(
    { id, lease_until: { $lte: now } },
    { $set: { lease_until: now + leaseMs, lease_token: token } },
  );
  if (claim.updated !== 1) {
    throw new Error("Há outra operação de acesso em andamento. Aguarde alguns instantes e tente novamente.");
  }

  // On an ambiguous write failure, leave the lease to expire before allowing a retry.
  const result = await action();
  await gates.updateMany({ id, lease_token: token }, { $set: { lease_until: 0, lease_token: "" } });
  return result;
}

export async function requestStudyAccess(entities, user, input) {
  if (!user?.id || user.role !== "user") throw new Error("Esta solicitação é exclusiva para candidatos.");
  const data = studyRequestSchema.parse(input);
  const draft = validateStudyAccountDraft({ ...data, userId: user.id });
  const accounts = entities.StudyAccount;
  const owner = { user_id: user.id };

  async function currentRequest() {
    const [active] = await accounts.filter({ ...owner, active: true }, "created_date", 1);
    if (active) return { status: "active" };
    const pending = await pendingStudyRequest(accounts, user);
    return pending ? { status: "pending", pending } : null;
  }

  return await currentRequest() ?? await withStudyRequestGate(entities.StudyRequestGate, async () => {
    const current = await currentRequest();
    if (current) return current;
    const now = Date.now();
    const [recent] = await accounts.filter({ ...owner, access_requested_at: { $gt: now - cooldownMs } }, "-access_requested_at", 1);
    if (recent) return { status: "cooldown" };

    const rows = await accounts.filter(owner, "created_date", 1000);
    const existing = rows.find(row => normalize(row.exam_name) === normalize(draft.exam_name));
    const request = { access_pending: true, access_requested_at: now };
    const row = existing
      ? await accounts.update(existing.id, { ...request, ...(draft.exam_date ? { exam_date: draft.exam_date } : {}) })
      : await accounts.create({ ...draft, ...request });
    return { status: "pending", pending: { examName: row.exam_name, examDate: row.exam_date || null } };
  });
}
