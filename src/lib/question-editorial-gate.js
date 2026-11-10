import {validateDrafts} from "./question-authoring.js";
// Legacy imports remain compatible; the new authoring protocol always requires review.
export function assertEditorialImport(items) {
 for(const q of items){
  if(!q.protocolo?.startsWith("cebraspe-"))continue;
  if(!["cebraspe-2.0","cebraspe-3.0"].includes(q.protocolo))throw new Error("Versão editorial não suportada.");
  if(q.tipo!=="autoral")throw new Error("Questão gerada deve manter autoria inédita.");
  const review=q.revisaoHumana;
  if(q.statusEditorial!=="revisado"||!review||typeof review.responsavel!=="string"||review.responsavel.trim().length<3||
    typeof review.parecer!=="string"||review.parecer.trim().length<20||typeof review.data!=="string"||
    !/^\d{4}-\d{2}-\d{2}$/.test(review.data)||!Number.isFinite(Date.parse(review.data)))
   throw new Error("Rascunho exige revisão humana: responsável, data AAAA-MM-DD e parecer fundamentado.");
  for(const f of ["materia","assunto","cargo","fonte","localizacaoFonte","textoFonte"])
   if(typeof q[f]!=="string"||!q[f].trim())throw new Error("Metadados editoriais incompletos: "+f);
  validateDrafts({questoes:[q]},{quantidade:1,textoFonte:q.textoFonte});
  if(q.protocolo==="cebraspe-3.0"){
   if(typeof q.topico!=="string"||!q.topico.trim()||typeof q.mapaNoId!=="string"||!q.mapaNoId.trim())
    throw new Error("Protocolo 3.0 exige tópico e ID exato do nó do mapa.");
   if(!q.revisaoIA||!Array.isArray(q.revisaoIA.problemas)||q.revisaoIA.problemas.length||
      q.revisaoIA.gabarito!==q.gabarito||typeof q.revisaoIA.justificativa!=="string"||q.revisaoIA.justificativa.length<20)
    throw new Error("Protocolo 3.0 exige revisão cega independente sem divergência nem pendências.");
   if(["fonteConferida","gabaritoConferido","univocidadeConferida","remissaoConferida"].some(k=>review[k]!==true))
    throw new Error("Protocolo 3.0 exige conferência humana explícita de fonte, gabarito, univocidade e remissão.");
   if(q.fonte.toLocaleLowerCase("pt-BR").includes("revisão pedagógica")||
      /reelabora|material já cadastrado/i.test(q.provenienciaFonte||""))
    throw new Error("Protocolo 3.0 não aceita revisão pedagógica derivada como fonte primária confirmada.");
  }
 }
}
