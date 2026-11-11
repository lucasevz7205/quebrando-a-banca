/* Decoder seguro para importar materiais por coleção; não converte nem
 * inventa gabaritos ou formatos de prova. A validação final é do servidor. */
export function decodeStudyCatalog(value,collection) {
  if(Array.isArray(value))return value;
  if(value && typeof value==="object"){
    for(const key of [collection,"records","documents","questoes","questions","itens","items","edital","topicos"]) {
      if(Array.isArray(value[key]))return value[key];
    }
    const entries=Object.entries(value);
    if(entries.length&&entries.every(([,doc])=>doc&&typeof doc==="object"&&!Array.isArray(doc)))
      return entries.map(([id,doc])=>({...doc,id:doc.id||id}));
  }
  throw new Error("JSON não reconhecido. Use lista de documentos ou um objeto com a coleção como chave. PDFs precisam de conversão e conferência antes de importar.");
}
export function auditStudyCatalog(documents,collection){
  if(!Array.isArray(documents)||!documents.length)throw new Error("Nenhum registro encontrado no arquivo.");
  const seen=new Set();
  for(const [i,row] of documents.entries()){
    if(!row||typeof row!=="object"||Array.isArray(row))
      throw new Error("Documento "+(i+1)+" inválido.");
    const id=String(row.id||"").trim();
    if(!id)throw new Error("Documento "+(i+1)+" sem identificador id. Não será criado automaticamente um identificador que possa colidir.");
    if(seen.has(id))throw new Error("Identificador repetido no JSON: "+id);
    seen.add(id);
    if(collection==="questoes"){
      if(!String(row.enunciado||"").trim())throw new Error("Questão "+id+" sem enunciado.");
      if(!["C","E"].includes(row.gabarito))
        throw new Error("Questão "+id+": gabarito incompatível com o treino Certo/Errado. Nenhuma alternativa foi convertida ou perdida.");
    }
  }
  return documents;
}
