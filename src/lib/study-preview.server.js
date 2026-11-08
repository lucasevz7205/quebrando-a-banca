import { listDocuments } from "./study-documents.js";
import { assertStudyAdministrator } from "./study-provisioning.js";

export function studyAccountStorage(entities, accountId) {
  return {
    documents: entities.StudyDocument,
    parts: entities.StudyDocumentPart,
    scope: { study_account_id: accountId },
  };
}

function previewEntities(context) {
  assertStudyAdministrator(context.user);
  return context.getBase44().asServiceRole.entities;
}

export async function getStudyPreviewAccount(context, accountId) {
  const account = await previewEntities(context).StudyAccount.get(accountId);
  if (!account?.active || account.id !== accountId) {
    throw new Error("Selecione um ambiente de estudo ativo em Contas.");
  }
  return { id: account.id, name: account.exam_name, date: account.exam_date || null, preview: true };
}

export function readStudyPreview(context, accountId, args) {
  return listDocuments(studyAccountStorage(previewEntities(context), accountId), args);
}
