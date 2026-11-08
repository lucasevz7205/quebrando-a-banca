/* Quebrando a Banca: índice de associação de questões aos seus recursos de estudo.
 * Fonte: banco de questões e edital existentes. Não copia nem altera gabaritos.
 * "Vinculado por capítulo" não significa cobertura conceitual validada.
 */
(() => {
  'use strict';
  const values=x=>x instanceof Map?[...x.values()]:Array.isArray(x)?x:[];
  const asText=x=>String(x??'').trim();
  function build(questions,topics,revisions) {
    const ed=values(topics),q=values(questions),r=revisions||new Map();
    const byCap=new Map(),byTopic=new Map(),byQuestion=new Map(),virtualTopics=new Map();
    for(const topic of ed)for(const cap of topic.caps||[]){
      if(!byCap.has(cap))byCap.set(cap,[]);
      byCap.get(cap).push(topic);
    }
    let coveredWithMaterials=0,withoutResources=0,withoutTopic=0,withMap=0,withFlashcards=0;
    for(const question of q) {
      if(!question?.id)continue;
      const matched=(byCap.get(question.cap)||[]).sort((a,b)=>(a.ordem||9999)-(b.ordem||9999));
      const first=matched[0];
      const topicId=first?.id||'unmapped:'+asText(question.cap||'sem-capitulo');
      if(!first){
        withoutTopic++;
        if(!virtualTopics.has(topicId))virtualTopics.set(topicId,{id:topicId,cap:question.cap||'',titulo:question.capNome||question.cap||'Sem capítulo do edital',sigla:'_',virtual:true,ordem:99999});
      }
      const related=matched.filter(t=>Boolean(r.get(t.id)?.mapa)||(r.get(t.id)?.cartoes||[]).length>0);
      const hasMap=related.some(t=>!!r.get(t.id)?.mapa);
      const hasFlashcards=related.some(t=>(r.get(t.id)?.cartoes||[]).length>0);
      if(hasMap||hasFlashcards)coveredWithMaterials++;
      else if(first)withoutResources++;
      if(hasMap)withMap++;
      if(hasFlashcards)withFlashcards++;
      if(!byTopic.has(topicId))byTopic.set(topicId,[]);
      byTopic.get(topicId).push(question);
      byQuestion.set(question.id,{question,topicId,matchedIds:matched.map(t=>t.id),
        linkedBy:'capitulo',hasMap,hasFlashcards,source:asText(question.ref),hasComment:!!asText(question.comentario)});
    }
    for(const qs of byTopic.values())qs.sort((a,b)=>(Number(a.ordem)||0)-(Number(b.ordem)||0)||a.id.localeCompare(b.id,'pt-BR',{numeric:true}));
    return {byTopic,byQuestion,virtualTopics,total:byQuestion.size,
      withTopic:byQuestion.size-withoutTopic,withoutTopic,withoutResources,
      withMap,withFlashcards,coveredWithMaterials};
  }
  function card(question) {
    if(!question?.id)return null;
    const key=asText(question.gabarito);
    const interpretation=key==='C'?'Certo':key==='E'?'Errado':key==='X'?'Anulado':'Não confirmado';
    const explanation=asText(question.comentario);
    const answers=['Gabarito oficial no banco: '+interpretation];
    if(explanation)answers.push('Comentário: '+explanation);
    else answers.push('Comentário não cadastrado. Consulte a fonte antes de considerar o conceito dominado.');
    return {q:'Julgue CERTO ou ERRADO e explique: '+asText(question.enunciado),
      a:answers,tema:asText(question.tema||question.capNome||question.cap)||'Questão de revisão',
      src:asText(question.ref||question.origem||question.cap),questionId:question.id,
      fromQuestion:true,graded:key==='C'||key==='E'};
  }
  const key=id=>'q~'+id+'@0';
  const questionId=key=>/^q~(.+)@0$/.exec(asText(key))?.[1]||null;
  window.QBQuestionLinks={build,card,key,questionId};
})();