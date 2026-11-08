import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { withStudyRequestGate } from "@/lib/study-onboarding";
import { writeDocument } from "@/lib/study-documents";
import {
  assertStudyAdministrator, canActivateStudyAccount,
  validateStudyAccountDraft, validateStudyContentBatch
} from "@/lib/study-provisioning";

const service = context => {
  assertStudyAdministrator(context.user);
  return context.getBase44().asServiceRole.entities;
};
const accountIdSchema = z.string().min(1).max(160);

async function getAccount(entities, id) {
  // IDs must be matched against current accounts, not accepted from browser state.
  const accounts = await entities.StudyAccount.filter({}, "created_date", 1000, 0);
  const account = accounts.find(row => row.id === id);
  if (!account) throw new Error("Vínculo de concurso inexistente.");
  return account;
}

async function materialReady(entities, id) {
  const [topics, questions] = await Promise.all([
    entities.StudyDocument.filter({study_account_id: id,collection:"edital"}, "created_date", 1, 0),
    entities.StudyDocument.filter({study_account_id: id,collection:"questoes"}, "created_date", 1, 0)
  ]);
  return {edital:topics.length>0,questoes:questions.length>0};
}

export const listStudyAccountsForAdmin = createServerFn({method:"GET"})
  .middleware([requireUser])
  .handler(async ({context}) => {
    const entities=service(context);
    const accounts=await entities.StudyAccount.filter({},"created_date",1000,0);
    const result=await Promise.all(accounts.map(async a => ({
      id:a.id,userId:a.user_id,examName:a.exam_name,examDate:a.exam_date||null,
      active:Boolean(a.active),pending:!a.active && a.access_pending === true,ready:await materialReady(entities,a.id)
    })));
    return result.sort((a,b)=>a.examName.localeCompare(b.examName,"pt-BR"));
  });

export const createStudyAccountForAdmin = createServerFn({method:"POST"})
  .middleware([requireUser])
  .validator(z.object({
    userId:z.string().min(1).max(160),
    examName:z.string().min(1).max(160),
    examDate:z.string().max(10).nullish()
  }))
  .handler(async ({context,data}) => {
    const entities=service(context);
    const draft=validateStudyAccountDraft(data,context.user.id);
    const result = await withStudyRequestGate(entities.StudyRequestGate, async () => {
      const existing=await entities.StudyAccount.filter({user_id:draft.user_id},"created_date",1000,0);
      if (existing.some(row=>row.exam_name.toLowerCase()===draft.exam_name.toLowerCase())) return null;
      const created=await entities.StudyAccount.create(draft);
      return {id:created.id,active:false};
    });
    if (!result) throw new Error("Este login já possui um vínculo com esse concurso.");
    return result;
  });

export const setStudyAccountActiveForAdmin = createServerFn({method:"POST"})
  .middleware([requireUser])
  .validator(z.object({accountId:accountIdSchema,active:z.boolean()}))
  .handler(async ({context,data}) => {
    const entities=service(context);
    const account=await getAccount(entities,data.accountId);
    if(data.active) {
      const materials=await materialReady(entities,account.id);
      if(!canActivateStudyAccount(materials)) {
        throw new Error("Carregue pelo menos um tópico de edital e uma questão válida antes de ativar.");
      }
    }
    const changed = await withStudyRequestGate(entities.StudyRequestGate, async () => {
      if (data.active) {
        const existing=await entities.StudyAccount.filter({user_id:account.user_id,active:true},"created_date",2,0);
        if (existing.some(row=>row.id!==account.id)) return false;
      }
      await entities.StudyAccount.update(account.id,{
        active:data.active,
        ...(data.active ? {access_pending:false} : {})
      });
      return true;
    });
    if (!changed) throw new Error("Outro concurso já está ativo para esse login. Desative-o primeiro.");
    return {id:account.id,active:data.active};
  });

export const importStudyContentForAdmin = createServerFn({method:"POST"})
  .middleware([requireUser])
  .validator(z.object({
    accountId:accountIdSchema,
    collection:z.string().min(1).max(30),
    documents:z.array(z.record(z.string(),z.unknown())).min(1).max(25)
  }))
  .handler(async ({context,data}) => {
    const entities=service(context);
    const account=await getAccount(entities,data.accountId);
    if(account.active) {
      throw new Error("Para importar novos materiais, desative temporariamente o concurso. O histórico existente será preservado.");
    }
    const documents=validateStudyContentBatch(data.collection,data.documents);
    const storage={
      documents:entities.StudyDocument,
      parts:entities.StudyDocumentPart,
      scope:{study_account_id:account.id}
    };
    let imported=0,skipped=0;
    for(const doc of documents) {
      const existing=await entities.StudyDocument.filter({
        study_account_id:account.id,collection:data.collection,legacy_id:doc.id
      },"created_date",2,0);
      if(existing.length>1)throw new Error("Duplicidade no armazenamento: "+doc.id);
      if(existing.length){skipped++;continue;}
      await writeDocument(storage,{path:data.collection+"/"+doc.id,operation:"set",value:doc});
      imported++;
    }
    return {imported,skipped,collection:data.collection};
  });
