/* Decoder seguro para importar materiais por coleção; não converte nem
 * inventa gabaritos ou formatos de prova. A validação final é do servidor. */
export function decodeStudyCatalog(value,collection) {
  if(Array.isArray(value))return value;
  if(value && typeof value==="object"){
    if(Object.hasOwn(value,collection)&&!Array.isArray(value[collection]))
      throw new Error("Formato da coleção "+collection+" inválido: esperado uma lista JSON.");
    for(const key of [collection,"records","documents","questoes","questions","itens","items","edital","topicos"]) {
      if(Array.isArray(value[key]))return value[key];
    }
    const entries=Object.entries(value);
    if(entries.length&&entries.every(([,doc])=>doc&&typeof doc==="object"&&!Array.isArray(doc)))
      return entries.map(([id,doc])=>({...doc,id:doc.id||id}));
  }
  throw new Error("JSON não reconhecido. Use lista de documentos ou um objeto com a coleção como chave. PDFs precisam de conversão e conferência antes de importar.");
}
export function normalizeStudyQuestion(row) {
  const original=row||{};
  const raw=original.alternativas??original.opcoes??original.options;
  if(raw==null)return {...original};
  let items;
  if(Array.isArray(raw)){
    items=raw.map((entry,index)=>{
      const letter=String(typeof entry==="object"&&entry!==null?(entry.letra||entry.id||String.fromCharCode(65+index)):String.fromCharCode(65+index)).toUpperCase();
      const content=typeof entry==="string"?entry:(entry?.texto||entry?.text||entry?.conteudo||entry?.label||"");
      return {letra:letter,texto:String(content).trim().replace(/^[A-E][).]\s*/, "")};
    });
  }else if(typeof raw==="object"){
    items=Object.entries(raw).map(([letra,texto])=>({letra:String(letra).toUpperCase(),texto:String(typeof texto==="string"?texto:(texto?.texto||texto?.text||"")).trim()}));
  }else throw new Error("Alternativas devem ser lista ou objeto A–E.");
  items.sort((a,b)=>a.letra.localeCompare(b.letra));
  const key=String(original.gabarito||original.resposta||original.correta||"").trim().toUpperCase();
  if(items.length<4||items.length>5||new Set(items.map(x=>x.letra)).size!==items.length||
    items.some(x=>!["A","B","C","D","E"].includes(x.letra)||!x.texto)||!items.some(x=>x.letra===key))
    throw new Error("Questão "+String(original.id||"?")+": alternativas incompletas ou gabarito A–E incompatível.");
  return {...original,gabarito:key,alternativas:items,formato:"multipla_escolha"};
}
export function auditStudyCatalog(documents,collection){
  if(!Array.isArray(documents)||!documents.length)throw new Error("Nenhum registro encontrado no arquivo.");
  const seen=new Set();
  const normalized=documents.map((row,i)=>{
    if(!row||typeof row!=="object"||Array.isArray(row))
      throw new Error("Documento "+(i+1)+" inválido.");
    return collection==="questoes"?normalizeStudyQuestion(row):row;
  });
  for(const [i,row] of normalized.entries()){
    const id=String(row.id||"").trim();
    if(!id)throw new Error("Documento "+(i+1)+" sem identificador id. Não será criado automaticamente um identificador que possa colidir.");
    if(seen.has(id))throw new Error("Identificador repetido no JSON: "+id);
    seen.add(id);
    if(collection==="questoes"){
      if(!String(row.enunciado||"").trim())throw new Error("Questão "+id+" sem enunciado.");
      if(!row.alternativas&&!["C","E"].includes(row.gabarito))
        throw new Error("Questão "+id+": gabarito C/E inválido. Para múltipla escolha, informe quatro ou cinco alternativas A–E.");
    }
  }
  return normalized;
}
