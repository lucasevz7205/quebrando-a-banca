import {validateDrafts} from "./question-authoring.js";
// Legacy imports remain compatible; the new authoring protocol always requires review.
export function assertEditorialImport(items) {
 for(const q of items){
  if(!q.protocolo?.startsWith("cebraspe-"))continue;
  if(q.protocolo!=="cebraspe-2.0")throw new Error("Versão editorial não suportada.");
  if(q.tipo!=="autoral")throw new Error("Questão gerada deve manter autoria inédita.");
  const review=q.revisaoHumana;
  if(q.statusEditorial!=="revisado"||!review||typeof review.responsavel!=="string"||review.responsavel.trim().length<3||
    typeof review.parecer!=="string"||review.parecer.trim().length<20||typeof review.data!=="string"||
    !/^\d{4}-\d{2}-\d{2}$/.test(review.data)||!Number.isFinite(Date.parse(review.data)))
   throw new Error("Rascunho exige revisão humana: responsável, data AAAA-MM-DD e parecer fundamentado.");
  for(const f of ["materia","assunto","cargo","fonte","localizacaoFonte","textoFonte"])
   if(typeof q[f]!=="string"||!q[f].trim())throw new Error("Metadados editoriais incompletos: "+f);
  validateDrafts({questoes:[q]},{quantidade:1,textoFonte:q.textoFonte});
 }
}
