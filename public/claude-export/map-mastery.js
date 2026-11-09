/* Mapa diagnóstico: agrega questões e respostas já existentes, sem gravar avaliações.
 * Ligações semânticas só são exatas com IDs declarados; nunca por similaridade de texto.
 * Dados individuais entram em memória pelo app autenticado, não neste arquivo estático.
 */
(function (root) {
  "use strict";
  const asMap = v => v && typeof v.get === "function" && typeof v.values === "function" ? v : new Map(Array.isArray(v) ? v : Object.entries(v || {}));
  const text = v => String(v == null ? "" : v);
  const escapeHtml = v => text(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const unique = items => [...new Set(items)];
  const eligible = q => !!q && q.foraNivel !== true && !/^SIM/i.test(text(q.cap)) && (q.gabarito==="C" || q.gabarito==="E");
  const days = (a,b) => { const v=Date.parse(b)-Date.parse(a);return Number.isFinite(v)?v/86400000:null; };
  function retained(r) {
    if (!r || !r.tentativas) return false;
    if (r.retidoEm) return true;
    const hist=Array.isArray(r.hist)?r.hist:[];
    const first = r.primeiraEm || hist[0]?.em;
    return !!first && hist.some(h => h.ok === true && h.c !== 1 && h.em && days(first,h.em)>=7);
  }
  function erroHistorico(r) {
    return !!r && (Number(r.erros)>0 || Number(r.brancos)>0 ||
      (Array.isArray(r.hist) && r.hist.some(h=>h.ok === false)));
  }
  function stats(ids, questions, responses) {
    const items = unique(ids).map(id => questions.get(id)).filter(eligible);
    const result = {total:items.length,respondidas:0,acertos:0,erros:0,brancos:0,naoRespondidas:0,
      historicoErro:0,caderno:0,retidas:0,retidasEntreAcertos:0,percentual:null,cobertura:0,retencao:0,
      status:"sem-evidencia",label:"Sem evidência"};
    for (const q of items) {
      const r=responses.get(q.id);
      if (!r || !Number(r.tentativas)) {result.naoRespondidas++;continue;}
      const marcou = text(r.ultimaMarcada);
      if (marcou==="B"){result.brancos++;continue;}
      if (marcou!=="C" && marcou!=="E"){result.naoRespondidas++;continue;}
      result.respondidas++;
      const acertou=marcou===q.gabarito;
      if (acertou) result.acertos++; else result.erros++;
      if (erroHistorico(r))result.historicoErro++;
      if (r.noCaderno)result.caderno++;
      if (retained(r)) {result.retidas++;if(acertou)result.retidasEntreAcertos++;}
    }
    result.percentual = result.respondidas ? result.acertos / result.respondidas : null;
    result.cobertura = result.total ? result.respondidas/result.total : 0;
    result.retencao = result.respondidas ? result.retidasEntreAcertos/result.respondidas : 0;
    if (result.respondidas === 0) {result.status="sem-evidencia";result.label="Não avaliado";}
    else if (result.respondidas < 5) {result.status="amostra-insuficiente";result.label="Amostra pequena";}
    else if (result.percentual < .7 || (result.caderno>0 && result.erros>=2)) {result.status="deficiente";result.label="Precisa de reforço";}
    else if (result.percentual>=.85 && result.cobertura>=.8 && result.retencao>=.6 && result.caderno===0) {
      result.status="forte";result.label="Forte, com retenção";
    } else if (result.percentual>=.85){result.status="bom-sem-retencao";result.label="Bom acerto; confirmar retenção";}
    else {result.status="em-desenvolvimento";result.label="Em desenvolvimento";}
    return result;
  }
  function build({topicId, map, cards=[], questions, responses, topic=null}={}) {
    const q=asMap(questions),r=asMap(responses),nodes=[],byPath=new Map(),byId=new Map(),parentByPath=new Map();
    const visit=(node,path,parent)=> {
      const entry={path,parent,id:node?.id||null,title:text(node?.t||"Conceito"),node,children:[],direct:new Set(),all:new Set()};
      nodes.push(entry);byPath.set(path,entry);parentByPath.set(path,parent);
      if (entry.id) {
        if(!byId.has(entry.id))byId.set(entry.id,[]);
        byId.get(entry.id).push(entry);
      }
      (node?.f||[]).forEach((child,i)=>{const childEntry=visit(child,path+"."+i,path);entry.children.push(childEntry.path);});
      return entry;
    };
    (map?.ramos||[]).forEach((n,i)=>visit(n,text(i),null));
    const connect=(entry,qid)=>{
      if (!entry || typeof qid!=="string" || !eligible(q.get(qid)))return;
      entry.direct.add(qid);
    };
    // ID dentro do nó é a evidência editorial mais forte.
    for(const entry of nodes)
      for(const id of entry.node?.x?.questaoIds||[])connect(entry,id);
    // Somente se o ID do nó é único nesse mapa.
    for(const question of q.values()){
      if (!eligible(question) || !question.mapaNoId || byId.get(question.mapaNoId)?.length!==1)continue;
      if (question.topico===topicId || (topic?.caps||[]).includes(question.cap))
        connect(byId.get(question.mapaNoId)[0],question.id);
    }
    // Flashcards têm links exatos nó-pergunta, não links inferidos pelo texto.
    for(const card of cards||[]) {
      if (!card?.mapaNoId || byId.get(card.mapaNoId)?.length!==1)continue;
      for(const id of card.questaoIds||[])connect(byId.get(card.mapaNoId)[0],id);
    }
    for(const entry of nodes.slice().reverse()){
      for(const id of entry.direct)entry.all.add(id);
      for(const childPath of entry.children)
        for(const id of byPath.get(childPath).all)entry.all.add(id);
      entry.stat=stats([...entry.all],q,r);
      entry.directStat=stats([...entry.direct],q,r);
    }
    const linked = new Set(nodes.flatMap(n=>[...n.direct]));
    // A estatística do edital engloba todas as questões de seus capítulos, mesmo sem vínculo semântico exato.
    const chapterIds=[...q.values()].filter(item=>eligible(item) && (topic?.caps||[]).includes(item.cap)).map(item=>item.id);
    const unlinked=chapterIds.filter(id=>!linked.has(id));
    return {topicId,topic,title:map?.centro||topic?.titulo||topicId,nodes,
      byPath,byId,linked,unlinked,chapterIds,edital:stats(chapterIds,q,r),
      linkedStats:stats([...linked],q,r),questions:q,responses:r};
  }
  function percent(x){return x==null?"–":Math.round(x*100)+"%";}
  function badge(entry) {
    if(!entry) return "";
    const s=entry.stat||entry,attr=escapeHtml(s.label||"Não avaliado");
    return '<span class="qb-mastery-badge qb-mastery-'+escapeHtml(s.status)+
      '" title="'+attr+'">'+escapeHtml(s.respondidas?percent(s.percentual)+" · "+s.respondidas+"/"+s.total+" respondidas":s.label)+
      '</span>';
  }
  function detail(result,path,{limit=40}={}){
    const entry=result.byPath.get(path);if(!entry)return "";
    const s=entry.stat,qs=[...entry.all].map(id=>result.questions.get(id)).filter(eligible);
    const esc=escapeHtml;
    const rows=qs.slice(0,limit).map(q=>{
      const r=result.responses.get(q.id),marcou=text(r?.ultimaMarcada),answered=Number(r?.tentativas)>0&&(marcou==="C"||marcou==="E");
      const correct=answered&&marcou===q.gabarito,mark=!answered?"Não respondida":correct?"Acerto recente":"Erro recente";
      return '<li><button type="button" class="lnk" data-qcard="'+esc(q.id)+'">'+esc(q.enunciado)+'</button><span class="qb-mastery-qstatus">'+esc(mark)+'</span></li>';
    }).join("");
    const remaining=qs.length-limit;
    const evidence=s.respondidas?percent(s.percentual)+" de acerto na última resposta":"Nenhuma resposta válida";
    return '<details class="qb-mastery-detail"><summary>Diagnóstico do '+esc(entry.children.length?"ramo":"conceito")+
      ' · '+esc(s.label)+' · '+esc(s.respondidas)+'/'+esc(s.total)+' respondidas</summary>'+
      '<div class="qb-mastery-inside"><p class="qb-mastery-metrics">'+esc(evidence)+
      ' · '+esc(s.caderno)+' no caderno de erros · '+esc(s.retidasEntreAcertos)+' retenções confirmadas</p>'+
      '<p class="qb-mastery-caption">Agrega apenas questões vinculadas exatamente a este nó ou a seus descendentes. O percentual não inclui questões sem resposta nem simulado fora do edital.</p>'+
      (rows?'<ol class="qb-mastery-questions">'+rows+'</ol>':'<p class="qb-mastery-caption">Ainda não há questões com vínculo exato a este ramo.</p>')+
      (remaining>0?'<p>Mais '+remaining+' questões vinculadas no banco.</p>':"")+'</div></details>';
  }
  function overview(result){
    const roots=result.nodes.filter(n=>n.parent==null);
    const s=result.edital;const percentText=s.respondidas?percent(s.percentual)+" de acertos nas questões respondidas":"Nenhum item respondido";
    const row=roots.map(n=>'<li><b>'+escapeHtml(n.title)+'</b>'+badge(n)+
      '<small>'+n.stat.respondidas+'/'+n.stat.total+' respondidas · '+n.stat.retidasEntreAcertos+' retenções</small></li>').join("");
    return '<section class="qb-map-diagnostic" aria-label="Desempenho no mapa e no edital">'+
      '<div class="qb-map-diagnostic-head"><h3>Diagnóstico dos ramos</h3><span>'+escapeHtml(percentText)+' no edital</span></div>'+
      '<p>'+escapeHtml(result.topic?.titulo||result.title)+' · '+s.respondidas+'/'+s.total+' questões respondidas no assunto</p>'+
      '<ul class="qb-mastery-roots">'+row+'</ul>'+
      (result.topic?.id?'<button class="btn ghost small" data-mastery-edital type="button">Ver assunto no edital</button>':"")+ 
      (result.unlinked.length?'<p class="qb-mastery-caption">'+result.unlinked.length+
      ' questões do edital ainda não têm vínculo semântico com um nó e não são atribuídas artificialmente aos ramos.</p>':"")+
      '<p class="qb-mastery-caption">Forte exige 5+ questões respondidas, ≥85% de acerto, cobertura ≥80%, retenção em pelo menos 60% e nenhum item no caderno. Amostra pequena ou ausência de resposta não significam domínio nem deficiência.</p>'+
      '</section>';
  }
  const api={build,stats,badge,detail,overview,percent,escapeHtml};
  root.QBMapMastery=api;
  if(typeof module!=="undefined" && module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
