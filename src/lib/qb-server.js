import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { project, validateProposal, planImport, fields } from "./qb-domain";
import { listDocuments } from "./study-documents";
import { editorialAuthorals, proofCatalog, studyCatalog } from "./qb-catalog";
import { assertEditorialImport } from "./question-editorial-gate";
function client(context){if(context.user.role!=="admin")throw new Error("Acesso restrito ao administrador durante a preparação.");return context.getBase44().asServiceRole;}
async function all(entity){const out=[];for(let skip=0;;skip+=500){const page=await entity.list("created_date",500,skip);out.push(...page);if(page.length<500)return out;if(skip>50000)throw new Error("Limite de leitura excedido.");}}
async function snapshot(b){const [questions,proposals,decisions,tasks,sources]=await Promise.all(["Question","Proposal","Decision","TaskEvent","Source"].map(n=>all(b.entities[n])));return {originals:questions.map(q=>JSON.parse(q.original_json)),proposals,decisions,tasks,sources:sources.map(({content_base64,...s})=>s)};}
export const getData=createServerFn({method:"GET"}).middleware([requireUser]).handler(({context})=>snapshot(client(context)));
async function catalogScope(documents, parts, scope, label) {
 const storage = { documents, parts, scope };
 const [questions, edital] = await Promise.all(
  ["questoes", "edital"].map(collection => listDocuments(storage, { collection }))
 );
 return { items: studyCatalog(questions, edital, label), edital };
}

export const getQuestionLab = createServerFn({ method: "GET" })
 .middleware([requireUser])
 .handler(async ({ context }) => {
  const b = client(context);
  const { ClaudeDocument, ClaudeDocumentPart, StudyDocument, StudyDocumentPart } = b.entities;
  const [data, camara, fiscal] = await Promise.all([
   snapshot(b),
   catalogScope(ClaudeDocument, ClaudeDocumentPart, {}, "Câmara dos Deputados"),
   // Ambiente que contém as Trilhas 00–03; não inclui respostas nem progresso.
   catalogScope(StudyDocument, StudyDocumentPart, { study_account_id: "6af069aa28e43e39f27bd73c" }, "Área Fiscal"),
  ]);
  const editorial = project(data.originals, data.decisions);
  const analyzed = proofCatalog(editorial, camara.edital);
  return { ...data, catalog: [...camara.items, ...fiscal.items, ...editorialAuthorals(editorial), ...analyzed] };
 });

const proposalSchema=z.object({question_id:z.string().min(1).max(300),field:z.enum(fields),before:z.string().max(12000),after:z.string().trim().min(1).max(12000),source:z.string().trim().min(1).max(2000),evidence:z.string().trim().min(1).max(6000),responsible:z.string().trim().min(1).max(100)});
export const propose=createServerFn({method:"POST"}).middleware([requireUser]).validator(proposalSchema).handler(async({context,data})=>{const b=client(context),s=await snapshot(b);validateProposal(data,project(s.originals,s.decisions).find(q=>q.id===data.question_id));return b.entities.Proposal.create({...data,author:context.user.email});});
export const decide=createServerFn({method:"POST"}).middleware([requireUser]).validator(z.object({proposal_id:z.string().max(100),outcome:z.enum(["aprovada","rejeitada"]),reason:z.string().trim().min(5).max(2000)})).handler(async({context,data})=>{const b=client(context),s=await snapshot(b);if(s.decisions.some(d=>d.proposal_id===data.proposal_id))throw new Error("Esta proposta já tem decisão.");const p=s.proposals.find(p=>p.id===data.proposal_id);if(!p)throw new Error("Proposta não encontrada.");if(data.outcome==="aprovada")validateProposal(p,project(s.originals,s.decisions).find(q=>q.id===p.question_id));return b.entities.Decision.create({proposal_id:p.id,question_id:p.question_id,field:p.field,before:p.before,after:p.after,outcome:data.outcome,reason:data.reason,source:p.source+" | "+p.evidence,author:context.user.email});});
export const saveTask=createServerFn({method:"POST"}).middleware([requireUser]).validator(z.object({task_id:z.string().max(100).optional(),title:z.string().trim().min(3).max(300),assignee:z.enum(["Codex","Claude","Gemini","Lucas"]),status:z.enum(["pendente","em andamento","concluída"]),question_ids:z.string().max(5000),notes:z.string().max(6000)})).handler(({context,data})=>client(context).entities.TaskEvent.create({...data,task_id:data.task_id||crypto.randomUUID(),author:context.user.email}));
export const readSource=createServerFn({method:"GET"}).middleware([requireUser]).validator(z.object({id:z.string().max(100)})).handler(async({context,data})=>{const b=client(context),s=await b.entities.Source.get(data.id);if(s.content_base64)return s;const parts=await b.entities.SourcePart.filter({sha256:s.sha256},"part",500);return {...s,content_base64:parts.map(p=>p.content_base64).join("")};});
export const importQuestions=createServerFn({method:"POST"}).middleware([requireUser]).validator(z.object({text:z.string().max(2000000),name:z.string().min(1).max(200),commit:z.boolean()})).handler(async({context,data})=>{
 const b=client(context),s=await snapshot(b),incoming=JSON.parse(data.text),plan=planImport(incoming,s.originals);
 assertEditorialImport(plan.fresh);
 if(!data.commit)return {added:plan.fresh.length,skipped:plan.skipped,conflicts:plan.conflicts};
 if(plan.conflicts.length)throw new Error("Há IDs com conteúdo divergente. Use propostas de correção; os originais foram preservados.");
 if(plan.fresh.length>100)throw new Error("Importe no máximo 100 itens novos por arquivo nesta versão.");
 const bytes=new TextEncoder().encode(data.text),hash=[...new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))].map(x=>x.toString(16).padStart(2,"0")).join("");
 const old=await b.entities.Source.filter({sha256:hash});
 if(!old.length){let binary="";for(const x of bytes)binary+=String.fromCharCode(x);const encoded=btoa(binary);
 for(let i=0;i<encoded.length;i+=8000){const prior=await b.entities.SourcePart.filter({sha256:hash,part:i/8000});if(!prior.length)await b.entities.SourcePart.create({sha256:hash,part:i/8000,content_base64:encoded.slice(i,i+8000)});}
 await b.entities.Source.create({path:data.name,sha256:hash,content_base64:"",batch:"importação",bytes:bytes.length});}
 for(const q of plan.fresh)await b.entities.Question.create({stable_id:q.id,original_json:JSON.stringify(q),batch:hash});
 return {added:plan.fresh.length,skipped:plan.skipped,conflicts:[]};
});
