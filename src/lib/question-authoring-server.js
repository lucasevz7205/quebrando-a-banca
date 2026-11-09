import {createServerFn} from "@tanstack/react-start";
import {requireUser} from "@/lib/auth-middleware";
import {requestSchema,generationPrompt,reviewPrompt,validateDrafts,applyReview,METHOD_VERSION} from "./question-authoring";
const inFlight=new Set();
const extract=result=>typeof result==="string"?result:(result?.response??result?.output??result?.text??result);
export const generateLabDrafts=createServerFn({method:"POST"}).middleware([requireUser]).validator(requestSchema)
.handler(async({context,data})=>{
 if(context.user.role!=="admin")throw new Error("Geração restrita ao administrador do laboratório.");
 if(inFlight.has(context.user.id))throw new Error("Já há um lote em geração. Aguarde.");
 inFlight.add(context.user.id);
 try{
  const core=context.getBase44().asServiceRole.integrations.Core;
  const questions=validateDrafts(extract(await core.InvokeLLM({prompt:generationPrompt(data)})),data);
  const reviewed=applyReview(questions,extract(await core.InvokeLLM({prompt:reviewPrompt(questions,data)})));
  const batch=crypto.randomUUID();
  return {protocolo:METHOD_VERSION,questoes:reviewed.map((q,i)=>({...q,
   id:"autoral/"+batch+"/"+(i+1),documento:"laboratorio/"+batch,tipo:"autoral",
   origem:"Inédita — Quebrando a Banca, formato C/E, inspirada no estilo CEBRASPE",
   materia:data.materia,assunto:data.assunto,cargo:data.cargo,
   fonte:data.fonte,localizacaoFonte:data.localizacao,textoFonte:data.textoFonte,
   criadoEm:new Date().toISOString(),autor:"IA do laboratório",revisaoHumana:null
  }))};
 } finally {inFlight.delete(context.user.id);}
});
