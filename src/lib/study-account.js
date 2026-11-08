import { createServerFn } from "@tanstack/react-start";
import { studyShell } from "@/lib/study-shell.server";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { pendingStudyRequest, requestStudyAccess, studyRequestSchema } from "@/lib/study-onboarding";
import { listDocuments, writeDocument } from "@/lib/study-documents";
import { getStudyPreviewAccount, readStudyPreview, studyAccountStorage } from "@/lib/study-preview.server";

async function resolveAccount(base44, user) {
  const matches = await base44.entities.StudyAccount.filter({ user_id: user.id, active: true }, "created_date", 2);
  if (matches.length > 1) throw new Error("Há mais de um concurso ativo para esta conta. Solicite a correção ao administrador.");
  const account = matches[0];
  if (!account) return null;
  return { id: account.id, userId: user.id, name: account.exam_name, date: account.exam_date || null };
}

export const getStudyAccount = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (context.user.role === "admin") return { legacy: true, markup: studyShell(true) };
    const service = context.getBase44().asServiceRole;
    const account = await resolveAccount(service, context.user);
    return account ? { ...account, markup: studyShell(false) } :
      { pending: await pendingStudyRequest(service.entities.StudyAccount, context.user) };
  });

export const submitStudyRequest = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(studyRequestSchema)
  .handler(({ context, data }) => {
    if (!context.user.id || context.user.role !== "user") throw new Error("Esta solicitação é exclusiva para candidatos.");
    return requestStudyAccess(context.getBase44().asServiceRole.entities, context.user, data);
  });

const accountIdSchema = z.string().min(1).max(100);
const readArgs = z.object({
  collection: z.string().max(50),
  order: z.string().max(100).nullish(),
  direction: z.enum(["asc", "desc"]).nullish(),
  limit: z.number().int().positive().max(10000).nullish(),
});

export const getStudyPreview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ accountId: accountIdSchema }))
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const account = await getStudyPreviewAccount(context, data.accountId);
    return { ...account, markup: studyShell(false) };
  });

export const listStudyPreview = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.strictObject({ accountId: accountIdSchema, args: readArgs }))
  .handler(({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    return readStudyPreview(context, data.accountId, data.args);
  });

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("list"),
    accountId: accountIdSchema,
    args: readArgs,
  }),
  z.object({
    action: z.literal("write"),
    accountId: accountIdSchema,
    args: z.object({
      path: z.string().max(300),
      operation: z.enum(["set", "update"]),
      value: z.record(z.string(), z.unknown()),
    }),
  }),
]);

export const accessStudyAccount = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(requestSchema)
  .handler(async ({ context, data }) => {
    const base44 = context.getBase44().asServiceRole;
    const account = await resolveAccount(base44, context.user);
    if (!account || account.id !== data.accountId) throw new Error("Ambiente de estudo indisponível para este login.");
    const storage = studyAccountStorage(base44.entities, account.id);
    return data.action === "list" ? listDocuments(storage, data.args) : writeDocument(storage, data.args);
  });
