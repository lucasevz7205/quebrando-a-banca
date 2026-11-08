import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { listDocuments, writeDocument } from "@/lib/study-documents";

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
    if (context.user.role === "admin") return { legacy: true };
    return resolveAccount(context.getBase44().asServiceRole, context.user);
  });

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("list"),
    accountId: z.string().min(1).max(100),
    args: z.object({
      collection: z.string().max(50),
      order: z.string().max(100).nullish(),
      direction: z.enum(["asc", "desc"]).nullish(),
      limit: z.number().int().positive().max(10000).nullish(),
    }),
  }),
  z.object({
    action: z.literal("write"),
    accountId: z.string().min(1).max(100),
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
    const storage = {
      documents: base44.entities.StudyDocument,
      parts: base44.entities.StudyDocumentPart,
      scope: { study_account_id: account.id },
    };
    return data.action === "list" ? listDocuments(storage, data.args) : writeDocument(storage, data.args);
  });
