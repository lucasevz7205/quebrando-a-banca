/* Limites e interpretação do parecer Cornell: não são certificação factual. */
const txt=(value,max=12000)=>String(value??"").trim().slice(0,max);
const list=(value,max=12,limit=300)=>Array.isArray(value)?
  value.slice(0,max).map(v=>txt(v,limit)).filter(Boolean):[];
export function normalizeCornellReview(raw,sourceText="") {
  let value=raw;
  if(typeof raw==="string"){
    try{value=JSON.parse(raw.trim())}
    catch{
      const match=raw.match(/\{[\s\S]*\}/);
      if(!match)throw new Error("A IA não retornou um parecer Cornell estruturado.");
      try{value=JSON.parse(match[0])}catch{throw new Error("Parecer Cornell inválido. A nota original foi preservada.");}
    }
  }
  if(!value||typeof value!=="object")throw new Error("Parecer Cornell inválido.");
  if(!value.suggested||typeof value.suggested!=="object"||
    !Array.isArray(value.suggested.cues)||
    typeof value.suggested.notes!=="string"||
    typeof value.suggested.summary!=="string"||
    !Array.isArray(value.issues))
    throw new Error("A IA retornou uma revisão incompleta; nenhuma alteração foi aplicada.");
  const suggested={
    cues:list(value.suggested.cues,20,400),
    notes:txt(value.suggested.notes,12000),
    summary:txt(value.suggested.summary,2500)
  };
  if(!suggested.notes||!suggested.cues.length)
    throw new Error("A proposta de revisão está sem notas ou perguntas suficientes.");
  const reference=txt(sourceText,15000);
  const withSource=reference.length>=80;
  const allowedFields=new Set(["cues","notes","summary"]);
  const allowedTypes=new Set(["factual","lacuna","clareza","evidencia","organizacao"]);
  const issues=value.issues.slice(0,20).map(i=>{
    const evidence=txt(i?.sourceExcerpt,500);
    const supported=withSource&&evidence.length>=8&&reference.includes(evidence);
    return {
      field:allowedFields.has(i?.field)?i.field:"notes",
      type:allowedTypes.has(i?.type)?i.type:"clareza",
      description:txt(i?.description,800),
      sourceExcerpt:supported?evidence:"",
      excerptMatched:Boolean(supported)
    };
  }).filter(i=>i.description);
  return {
    verdict:txt(value.verdict,900)||"Revisão sugerida para conferência do estudante.",
    issues,suggested,
    referenceMode:withSource?"comparacao_com_fonte":"revisao_preliminar",
    matchedExcerpts:issues.filter(i=>i.excerptMatched).length,
    notice:withSource
      ?"Comparação assistida com o texto de referência informado pelo usuário. Não certifica a autenticidade da fonte, jurisprudência ou atualização da lei."
      :"Sem texto-fonte suficiente: revisão preliminar de clareza e possíveis inconsistências. NÃO é verificação factual independente.",
  };
}
