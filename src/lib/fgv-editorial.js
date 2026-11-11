/* Auditoria estrutural FGV/A–E. Não homologa gabarito nem fonte. */
const asText=x=>String(x??"").trim();
const norm=x=>asText(x).normalize("NFKC").toLocaleLowerCase("pt-BR").replace(/\s+/g," ");
export function auditFGVBundle(topic,revision,questions=[]){
 const blockers=[],warnings=[],err=(code,id,message)=>blockers.push({code,id,message}),
 warn=(code,id,message)=>warnings.push({code,id,message});
 const nodes=new Set(),seenNode=new Set();
 function visit(items){
  for(const node of Array.isArray(items)?items:[]){
   if(!node?.id||seenNode.has(node.id))err("NODE_ID",node?.id||topic.id,"Nó sem ID exclusivo.");
   if(node?.id)seenNode.add(node.id),nodes.add(node.id);
   if(!asText(node?.x?.e)||!asText(node?.x?.ex)||!asText(node?.x?.trap)||!asText(node?.x?.src))
    err("NODE_DETAIL",node?.id||topic.id,"Explicação, exemplo, armadilha e fonte são obrigatórios.");
   visit(node.f);
  }
 }
 visit(revision?.mapa?.ramos);
 if(!nodes.size)err("MAP_EMPTY",topic.id,"Mapa vazio.");
 if(topic.id!==revision?.id)err("REVISION_TOPIC",topic.id,"Assunto e revisão possuem IDs diferentes.");
 const seenQ=new Set(),seenText=new Set(),seenCard=new Set();
 for(const card of revision?.cartoes||[]){
   if(!nodes.has(card.mapaNoId))err("CARD_NODE",card.id,"Cartão sem nó real.");
   if(!asText(card.q)||!Array.isArray(card.a)||!card.a.some(Boolean)||!asText(card.src))
     err("CARD_CONTENT",card.id,"Frente, resposta e fonte obrigatórias.");
   const key=norm(card.q);
   if(seenCard.has(key))warn("CARD_REPEAT",card.id,"Cartão com pergunta repetida.");
   seenCard.add(key);
 }
 for(const q of questions){
   if(seenQ.has(q.id)||!q.id)err("QUESTION_ID",q.id,"ID duplicado ou ausente.");
   seenQ.add(q.id);
   if(q.topico!==topic.id||q.cap!==topic.caps[0])err("QUESTION_TOPIC",q.id,"Questão atribuída a assunto ou capítulo diferente.");
   if(!nodes.has(q.mapaNoId))err("QUESTION_NODE",q.id,"Questão sem remissão para nó real.");
   const opts=Array.isArray(q.alternativas)?q.alternativas:[];
   const labels=opts.map(o=>asText(o.letra));
   if(opts.length!==5||labels.join("")!=="ABCDE"||opts.some(o=>asText(o.texto).length<8))
     err("QUESTION_OPTIONS",q.id,"FGV: cinco alternativas A–E com redação completa.");
   if(!labels.includes(q.gabarito))err("QUESTION_ANSWER",q.id,"Gabarito não presente nas alternativas.");
   if(!asText(q.enunciado)||!asText(q.comentario)||!asText(q.fonte))
     err("QUESTION_SOURCE",q.id,"Enunciado, explicação e referência são obrigatórios.");
   const line=norm(q.enunciado);
   if(seenText.has(line))err("QUESTION_DUPLICATE",q.id,"Enunciado integral repetido.");
   seenText.add(line);
   if(q.statusEditorial!=="revisado")warn("REVIEW_PENDING",q.id,"Gabarito autoral ainda sem revisão humana.");
 }
 return {topicId:topic.id,version:"fgv-1.0",counts:{nodes:nodes.size,flashcards:revision?.cartoes?.length||0,questions:questions.length},
  blockers,warnings,canPublish:blockers.length===0&&questions.length>0&&questions.every(q=>q.statusEditorial==="revisado"&&q.revisaoHumana?.fonteConferida===true&&q.revisaoHumana?.gabaritoConferido===true),
  note:"Auditoria estrutural. Verificação da correção jurídica, validade e proximidade estilística FGV requer leitura da fonte e parecer humano."};
}
