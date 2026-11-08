/* Quebrando a Banca · processos pedagógicos v1.
 * Eventos prospectivos privados. Nunca reclassifica o legado nem altera vencimentos.
 */
(() => {
  'use strict';
  const DAY=86400000, POLICY='aprendizagem-v1';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hash=x=>{let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)};
  const version=q=>hash(JSON.stringify([q.enunciado,q.gabarito,q.comentario,q.ref]));
  const uid=()=>crypto.randomUUID();
  const validDate=x=>Number.isFinite(Date.parse(x));
  const flags=S=>({...{p1:true,p2:true,p3:true,p4:true,p5:true,p6:true,p7:true,p8:true},...(S.cfg?.get('aprendizagem')?.flags||{})});
  const enabled=(S,k)=>flags(S)[k]!==false;
  const cfg=S=>S.cfg?.get('aprendizagem')||{};
  const values=m=>m instanceof Map?[...m.values()]:[];
  const events=S=>values(S.learningEvents);
  const catalog=S=>values(S.learningContent).filter(x=>x.active!==false);
  const practices=S=>events(S).filter(e=>e.kind==='practice'&&!e.skipped&&!e.invalid);
  const conceptOf=(S,q)=>q.learningConcept||catalog(S).find(c=>(c.sourceItems||[]).includes(q.id))?.concept||null;
  const rounds=S=>[...(S.rodadas||[]).filter(x=>x.id!==S.round?.id),...(S.round?[S.round]:[])];
  function attempts(S) {
    const out=new Map();
    for(const rd of rounds(S)) for(const item of rd.itens||[]) if(item.learning?.id) {
      const e={...item.learning,ok:item.marcada===item.gabarito,marked:item.marcada,confidence:item.conf??null};
      const current=S.q?.get(e.item); if(current&&version(current)!==e.version)e.invalid=true;
      out.set(e.id,e);
    }
    for(const e of events(S)) if(e.kind==='attempt') {const c=S.learningContent?.get(e.item),q=S.q?.get(e.item);out.set(e.id,{...e,invalid:e.invalid||!!(c&&c.version!==e.version)||!!(q&&version(q)!==e.version)});}
    return [...out.values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id));
  }
  function prior(S,q) {
    return attempts(S).filter(e=>e.item===q.id&&e.version===version(q)&&e.origin==='treino'&&!e.invalid);
  }
  /* Alocação do piloto P1 por tentativa, não por matéria. Uma matéria não determina o grupo. */
  function condition(q,rd) {return parseInt(hash([rd?.id||'',''+(rd?.idx??0),q.id].join('|')),16)%2?'especifico':'padrao'}
  function feedback(S,q,a) {
    if(!enabled(S,'p1')||!a||a.rep||a.marcada==='B'||![1,2,3].includes(a.conf)) return '';
    if(!a.acertou&&a.conf===3) return '<span class="calib alert">Erro com certeza: qual trecho sustentou sua escolha? Confira a regra e verifique se houve troca de conceitos.</span>';
    if(!a.acertou&&a.conf===2) return '<span class="calib">Você sinalizou dúvida. Compare sua interpretação com a regra do comentário antes de seguir.</span>';
    if(a.acertou&&a.conf===3) return '<span class="calib">Certeza e acerto nesta tentativa. A revisão posterior verificará a manutenção do acerto.</span>';
    if(a.acertou&&a.conf===2&&q.comentario&&a.pilotFeedback==='especifico') return '<span class="calib">Acertou com dúvida. O acerto não prova domínio: identifique a regra decisiva antes de avançar.</span><div class="learn-rule"><b>Evocação rápida</b><p>Qual elemento do enunciado confirma a regra? Por que o julgamento oposto estaria errado? Responda de memória e confira com o comentário abaixo.</p></div>';
    return '';
  }
  function metadata(S,q,L,conf,rd) {
    const ps=prior(S,q), at=new Date().toISOString();
    const ref=ps.find(p=>Date.parse(at)-Date.parse(p.at)<=10*DAY&&!ps.some(x=>x.reference===p.id&&Date.parse(x.at)-Date.parse(p.at)>=7*DAY))||ps.at(-1);
    return {id:rd.id+':'+rd.idx,policy:POLICY,kind:'attempt',item:q.id,version:version(q),
      concept:conceptOf(S,q),cap:q.cap,at,origin:'treino',exposure:ps.length?'seen':'unknown',
      reference:ref?.id||null,referenceAt:ref?.at||null,
      feedback:enabled(S,'p1')&&L===q.gabarito&&conf===2&&q.comentario?condition(q,rd):'padrao',
      allocation: 'piloto-p1-por-tentativa-v1',
      confidence:[1,2,3].includes(conf)?conf:null,marked:L,ok:L===q.gabarito,elapsedMs:rd.learningShown?.idx===rd.idx?Math.max(0,Date.now()-rd.learningShown.at):null};
  }
  function metrics(list,now=Date.now()) {
    const all=[...new Map(list.filter(e=>e&&e.id).map(e=>[e.id,e])).values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
    const valid=all.filter(e=>!e.invalid&&e.kind==='attempt'&&validDate(e.at)&&e.version&&['C','E','B'].includes(e.marked)&&['treino','transferencia'].includes(e.origin));
    const used=new Set(), transferSeen=new Set();
    const result={immediate:[],recognition:[],transfer:[],retention:[],retentionSeen:[],retentionNew:[],unknown:0,confidence:{1:[],2:[],3:[],unknown:[]},feedback:{padrao:[],especifico:[]},eligibleFeedback:{padrao:[],especifico:[]}};
    for(const e of valid) {
      result.immediate.push(e);
      result.confidence[[1,2,3].includes(e.confidence)?e.confidence:'unknown'].push(e);
      if(e.exposure==='seen') result.recognition.push(e);
      else if(e.exposure!=='new') result.unknown++;
      const key=e.item+'|'+e.version;
      const ref=all.find(x=>x.id===e.reference&&!x.invalid&&validDate(x.at)&&valid.includes(x));
      const age=ref?(Date.parse(e.at)-Date.parse(ref.at))/DAY:NaN;
      if(e.origin==='transferencia'&&e.exposure==='new'&&e.reviewed===true&&ref&&ref.item!==e.item&&ref.concept===e.concept&&age>=0&&!transferSeen.has(key)){result.transfer.push(e);transferSeen.add(key)}
      const compatible=ref&&(e.item===ref.item&&e.version===ref.version||result.transfer.includes(e)&&e.concept===ref.concept);
      if(compatible&&age>=7&&age<=10&&!used.has(ref.id)) {
        used.add(ref.id);
        const row={...e,reexposures:all.filter(x=>x.id!==e.id&&x.item===e.item&&validDate(x.at)&&Date.parse(x.at)>Date.parse(ref.at)&&Date.parse(x.at)<Date.parse(e.at)).length};
        result.retention.push(row);
        (e.exposure==='new'?result.retentionNew:result.retentionSeen).push(row);
        if(ref.ok&&ref.confidence===2&&result.feedback[ref.feedback])result.feedback[ref.feedback].push(row);
      }
    }
    for(const e of valid) if(e.ok&&e.confidence===2&&result.eligibleFeedback[e.feedback]&&now-Date.parse(e.at)>=10*DAY)result.eligibleFeedback[e.feedback].push(e);
    result.excluded=all.filter(e=>e.kind==='attempt'||!e.kind).length-valid.length;
    return result;
  }
  function simulate(history,fixedDue,today,exam) {
    const base={policy:'shadow-v1',fixedDue,suggestedDue:fixedDue,mode:'simulation',reason:'Histórico insuficiente: manter calendário fixo'};
    const hs=history.filter(e=>!e.invalid&&validDate(e.at)&&['C','E'].includes(e.marked)).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
    if(hs.length<3||!validDate(today))return base;
    const last=hs[hs.length-1], recent=hs.slice(-3);
    let days=!last.ok?1:last.confidence!==3?3:recent.every(e=>e.ok)?7:3;
    if(exam&&validDate(exam))days=Math.max(1,Math.min(days,Math.floor((Date.parse(exam)-Date.parse(today))/DAY/5)));
    const suggestedDue=new Date(Date.parse(today+'T12:00:00Z')+days*DAY).toISOString().slice(0,10);
    return {...base,suggestedDue,days,reason:!last.ok?'Erro recente':last.confidence!==3?'Confiança ainda instável':'Três tentativas recentes avaliadas'};
  }
  function eligibleVariants(S) {
    const es=events(S), as=attempts(S);
    /* Evocação livre sem correção validada é prática, não prova de domínio. */
    return catalog(S).filter(c=>c.type==='variant'&&c.reviewed===true&&c.reserved===true&&c.contextChanged===true&&c.concept&&c.answer&&c.prompt&&c.explanation&&c.reference&&
      Array.isArray(c.sourceItems)&&c.sourceItems.some(id=>S.q?.has(id))&&
      !es.some(e=>e.item===c.id)&&!as.some(e=>e.item===c.id)&&
      as.some(e=>e.concept===c.concept&&e.ok===true&&e.origin==='treino'&&!e.invalid&&c.sourceItems.includes(e.item)));
  }
  const rate=xs=>xs.length?Math.round(xs.filter(x=>x.ok).length/xs.length*100)+'%':'Dados insuficientes';
  const stat=(title,xs)=>'<div class="learn-stat"><b>'+rate(xs)+'</b><span>'+esc(title)+'</span><small>'+xs.filter(x=>x.ok).length+' acertos / '+xs.length+' tentativas</small></div>';
  const panel=(title,body,open=false)=>'<details class="learn-panel" '+(open?'open':'')+'><summary>'+esc(title)+'</summary><div>'+body+'</div></details>';
  const button=(action,label,id='',other='')=>'<button class="btn ghost small" data-learn="'+action+'" data-id="'+esc(id)+'" '+other+'>'+esc(label)+'</button>';
  let ctx=null, activity=null, pending=new Map(), saving=false, error='', drafts={}, selected='indicadores';
  function draw(force=true){if(ctx)ctx.render(force)}
  async function save(e) {
    if(!ctx?.S.db)throw new Error('Banco de estudo indisponível.');
    pending.set(e.id,e);
    try {await ctx.S.db.doc('aprendizagem/'+e.id).set(e);ctx.S.learningEvents.set(e.id,e);pending.delete(e.id);error='';}
    catch(err){error='Registro ainda não salvo. Mantenha esta página aberta e tente novamente.';throw err}
  }
  function recordPrimary(e){if(e)save(e).catch(()=>{draw(false)});}
  function statusHTML(){return pending.size&&error?'<div class="notice" role="alert">'+esc(error)+' '+button('retry','Tentar salvar novamente')+'</div>':'';}
  function mount(S,api) {
    ctx={S,...api};
    S.learningEvents ||= new Map(); S.learningContent ||= new Map();
    S.db.collection('aprendizagem').onSnapshot(s=>{
      for(const d of s.docs) S.learningEvents.set(d.id,{...d.data(),id:d.id});
      S.learningLoaded=true;if(['aprendizagem','painel','conteudo'].includes(S.view))draw(false);
    },()=>{error='Não foi possível carregar os registros de aprendizagem.';draw()});
    S.db.collection('aprendizagem_conteudos').onSnapshot(s=>{
      S.learningContent=new Map(s.docs.map(d=>[d.id,{...d.data(),id:d.id}]));
      S.learningContentLoaded=true;if(['aprendizagem','conteudo'].includes(S.view))draw(false);
    },()=>{error='Não foi possível carregar as atividades.';draw()});
  }
  function weekly(S,today) {
    const end=Date.parse(today+'T23:59:59Z'), start=end-7*DAY;
    const list=rounds(S).flatMap(rd=>(rd.itens||[]).map((i,n)=>({id:rd.id+':'+n,at:i.learning?.at||rd.inicio,cap:rd.cap,marked:i.marcada,ok:i.marcada===i.gabarito}))).filter(e=>validDate(e.at)&&Date.parse(e.at)>start&&Date.parse(e.at)<=end);
    const by=new Map();
    for(const e of list){const key=e.cap||e.concept||'Sem assunto';if(!by.has(key))by.set(key,[]);by.get(key).push(e)}
    const worst=[...by].filter(([,a])=>a.length>=5).sort((a,b)=>a[1].filter(x=>x.ok).length/a[1].length-b[1].filter(x=>x.ok).length/b[1].length)[0];
    const suggestion=worst?'Revisar '+worst[0]+' e explicar os erros antes de conferir o comentário.':'Registrar pelo menos cinco tentativas em um assunto para orientar o próximo ciclo.';
    const day=new Date(today+'T12:00:00Z');day.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7));
    const id='semana-'+day.toISOString().slice(0,10);
    const saved=events(S).find(e=>e.kind==='weekly'&&e.id===id);
    return {id,list,worst,suggestion,saved,start:new Date(start+1).toISOString().slice(0,10)};
  }
  function weeklyHTML(S,today) {
    if(!enabled(S,'p8'))return '';
    const w=weekly(S,today);
    return panel('Diagnóstico dos últimos 7 dias', '<p>'+esc(w.start)+' a '+esc(today)+' · '+w.list.length+' tentativas de treino · '+w.list.filter(x=>x.ok).length+' acertos.</p><p>'+esc(w.suggestion)+'</p><label>Ação da próxima semana<textarea data-learn-draft="weekly" rows="2">'+esc(drafts.weekly??w.saved?.text??w.suggestion)+'</textarea></label>'+button('weekly','Salvar decisão do ciclo',today)+(w.saved?'<p class="rule">Decisão salva · '+(w.saved.completed?'concluída':'pendente')+'. As tarefas do calendário permanecem editáveis.</p>'+button('weekly-toggle',w.saved.completed?'Reabrir ação':'Marcar ação concluída',today):'')+button('plan','Abrir planejamento'),false);
  }
  function contentHTML(S,m) {
    /* A evocação regular permanece nos Flashcards já existentes. Em Materiais, só o pré-teste contextual é complementar. */
    const cards=catalog(S).filter(c=>c.material===m.id&&c.type==='pretest'&&enabled(S,'p7'));
    if(!cards.length)return '';
    return '<div class="learn-inline">'+cards.map(c=>button('start','Sondagem antes da leitura',c.id)).join('')+'</div>';
  }
  function activityHTML() {
    if(!activity)return '';
    const a=activity,c=a.card, answered=a.phase==='feedback', isCE=c.type==='variant';
    const response=answered?'<div class="learn-rule"><b>'+ (isCE?'Gabarito: '+esc(c.answer):'Compare sua resposta')+'</b><p>'+esc(c.explanation)+'</p><small>'+esc(c.reference)+'</small></div><p>'+esc(a.skipped?'Revelação sem tentativa registrada separadamente.':'Sua resposta: '+a.response)+'</p>':
      '<p class="statement">'+esc(c.prompt)+'</p>'+(isCE?'<fieldset><legend>Sua resposta</legend><label><input type="radio" name="learn-answer" value="C"> Certo</label><label><input type="radio" name="learn-answer" value="E"> Errado</label><label><input type="radio" name="learn-answer" value="B"> Em branco</label></fieldset><label>Confiança antes da correção<select id="learn-confidence"><option value="">Selecione</option><option value="1">Chute</option><option value="2">Dúvida</option><option value="3">Certeza</option></select></label>':'<label>Sua explicação<textarea data-learn-draft="response" rows="3" placeholder="Responda com suas palavras antes de conferir.">'+esc(drafts.response||'')+'</textarea></label>')+
      button('answer','Responder e conferir')+(!isCE?button('skip',c.type==='pretest'?'Pular e ver explicação':'Revelar sem tentar'):'');
    return '<section class="learn-active" aria-live="polite"><h3>'+esc(c.title)+'</h3><p class="rule">'+({variant:'Aplicação em outro contexto',duel:'Duelo de conceitos',recall:'Evocação',pretest:a.known?'Sondagem antes da releitura · conteúdo já praticado':'Pré-teste · exposição anterior não confirmada'}[c.type]||'Prática')+'</p>'+response+(!answered?button('abandon','Encerrar atividade sem responder'):'')+(answered?button('close','Concluir')+((c.sourceItems||[]).length?button('source','Praticar itens relacionados'):''):'')+'</section>';
  }
  /* P1: resumo do piloto. Resultados só são comparáveis depois do seguimento. */
  function pilotHTML(S,m) {
    if(!enabled(S,'p1'))return '<div class="learn-pilot-info"><b>Piloto de feedback desativado.</b><p>A correção padrão e o histórico existente continuam preservados.</p></div>';
    const answered=m.immediate.filter(e=>e.marked==='C'||e.marked==='E');
    const count=(ok,conf)=>answered.filter(e=>e.ok===ok&&e.confidence===conf).length;
    const state=(label,num,explanation,kind)=>'<div class="learn-pilot-state '+kind+'"><small>'+label+'</small><strong>'+num+'</strong><span>'+explanation+'</span></div>';
    const groups=['padrao','especifico'];
    const rows=groups.map(k=>{
      const eligible=m.eligibleFeedback[k]||[],follow=m.feedback[k]||[];
      const eligIds=new Set(eligible.map(e=>e.id));
      const observed=follow.filter(e=>eligIds.has(e.reference));
      const pct=eligible.length?Math.round(observed.length/eligible.length*100)+'%':'–';
      return '<div class="learn-pilot-arm"><div><b>'+ (k==='padrao'?'Feedback padrão':'Feedback + evocação') +'</b><span>'+eligible.length+' verificações já elegíveis · '+observed.length+' realizadas ('+pct+' de acompanhamento)</span></div><strong>'+rate(observed)+'</strong><small>'+observed.length+' respostas verificadas</small></div>';
    }).join('');
    const sufficient=groups.every(k=>{
      const es=m.eligibleFeedback[k]||[],ids=new Set(es.map(x=>x.id));
      const done=(m.feedback[k]||[]).filter(e=>ids.has(e.reference));
      return done.length>=30&&es.length>0&&done.length/es.length>=.7;
    });
    return '<section class="learn-pilot-info" aria-label="Piloto P1">'+
      '<div class="learn-pilot-intro"><span class="learn-overline">P1 · FEEDBACK E METACOGNIÇÃO</span><h3>Confiança não é domínio</h3><p>Após responder questões, o sistema registra seu grau de certeza. Um acerto com dúvida pode exigir confirmação da regra, e um erro com certeza pode revelar uma confusão a investigar.</p></div>'+
      '<div class="learn-pilot-states">'+
      state('Acertou · certeza',count(true,3),'Verificar retenção depois','stable')+
      state('Acertou · dúvida',count(true,2),'Confirmar a regra decisiva','attention')+
      state('Errou · dúvida',count(false,2),'Corrigir a interpretação','attention')+
      state('Errou · certeza',count(false,3),'Investigar o conceito','alert')+
      '</div><details class="learn-pilot-method"><summary>Como estamos avaliando o novo feedback?</summary>'+
      '<p>Quando há acerto com dúvida e comentário disponível, cada tentativa é alocada de forma reprodutível a feedback padrão ou feedback com pergunta de evocação. Os dois grupos recebem o gabarito comentado.</p>'+
      '<div class="learn-pilot-arms">'+rows+'</div>'+
      '<p class="learn-pilot-verdict">'+(sufficient?'Há acompanhamento suficiente para uma análise exploratória. Verifique comparabilidade dos itens, conceitos e perdas antes de interpretar qualquer diferença.':'Resultado ainda inconclusivo. A regra inicial requer pelo menos 30 verificações por grupo, acompanhamento de 70% e análise da comparabilidade dos conceitos.')+'</p>'+
      '<small>Verificação tardia: primeira revisão elegível entre 7 e 10 dias da tentativa de referência. Os dados legados sem metadados são mantidos, mas não presumidos equivalentes. Este desenho não comprova causalidade.</small>'+
      '</details></section>';
  }
  function render(S,today) {
    const m=metrics([...attempts(S),...events(S).filter(e=>e.kind!=='attempt')]);
    const nav='<div class="chips">'+[['indicadores','Evidências'],['agenda','Simulação de revisões']].map(([id,label])=>'<button class="chip" data-learn="section" data-id="'+id+'" aria-pressed="'+(selected===id)+'">'+label+'</button>').join('')+'</div>';
    let body='';
    if(selected==='indicadores')body=pilotHTML(S,m)+(enabled(S,'p4')?'<p class="rule">Registros feitos após esta atualização. Os números antigos continuam no Desempenho. Retenção usa a primeira verificação entre 7 e 10 dias após a referência registrada.</p><div class="learn-grid">'+stat('Desempenho imediato',m.immediate)+stat('Reconhecimento · item visto',m.recognition)+stat('Transferência · primeira variante válida',m.transfer)+stat('Retenção · verificações tardias',m.retention)+'</div>'+panel('Como interpretar', '<p>As populações podem se sobrepor. Não some retenção e transferência. “Reconhecimento” é um indicador operacional de acertos em itens já vistos, não um diagnóstico de memória.</p><p>Retenção em vistos: '+rate(m.retentionSeen)+' (n='+m.retentionSeen.length+'). Em inéditos: '+rate(m.retentionNew)+' (n='+m.retentionNew.length+').</p><p>'+m.unknown+' tentativas com exposição anterior desconhecida. '+m.excluded+' registros fora das métricas. '+m.retention.filter(x=>x.reexposures).length+' verificações com reexposição intermediária registrada.</p>')+
      panel('Confiança e piloto do feedback', '<div class="learn-grid">'+[1,2,3,'unknown'].map(k=>stat(({1:'Chute',2:'Dúvida',3:'Certeza',unknown:'Confiança desconhecida'})[k],m.confidence[k])).join('')+'</div><p>Alocação exploratória por tentativa. Ambos os grupos recebem gabarito comentado; não há garantia de equivalência entre itens.</p><div class="learn-grid">'+stat('Feedback padrão · retenção',m.feedback.padrao)+stat('Feedback específico · retenção',m.feedback.especifico)+'</div><p>Os grupos recebem gabarito comentado. Resultados observados podem refletir diferenças de itens, usuários ou exposição. Consulte os critérios e a cobertura do piloto P1 acima.</p>'):'<p>Indicadores desativados.</p>');
    /* Não criar uma segunda área de prática: flashcards ficam na Revisão; contrastes de conceitos ficam em Pegadinhas. */
    if(selected==='agenda') {
      const rows=enabled(S,'p6')?values(S.r).filter(r=>r.proxRevisao).slice(0,20).map(r=>{
        const s=simulate(attempts(S).filter(e=>e.item===r.qid),r.proxRevisao,today,cfg(S).examDate);
        return '<tr><td>'+esc(r.qid)+'</td><td>'+esc(s.fixedDue)+'</td><td>'+esc(s.suggestedDue)+'</td><td>'+esc(s.reason)+'</td></tr>';
      }).join(''):'';
      body='<p class="rule">O ciclo semanal permanece no Painel. Esta tela apenas simula hipóteses de espaçamento; não altera vencimentos.</p>'+panel('Revisão adaptativa · simulação', '<p>A agenda fixa continua valendo. A simulação shadow-v1 não grava nem altera vencimentos. Os primeiros 20 itens são apresentados para inspeção.</p><div class="tbl-wrap"><table><thead><tr><th>Item</th><th>Agenda atual</th><th>Sugestão</th><th>Motivo</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+button('simulation','Registrar esta simulação'));
    }
    if(selected==='indicadores'&&enabled(S,'p4')){const ps=events(S).filter(e=>e.kind==='practice');const starts=events(S).filter(e=>e.kind==='exposure'&&e.origin!=='editor');body+=panel('Participação nas atividades','<p>'+ps.filter(e=>!e.skipped).length+' tentativas de evocação/duelo/pré-teste · '+ps.filter(e=>e.skipped).length+' revelações sem tentativa · '+events(S).filter(e=>e.kind==='abandonment').length+' encerramentos sem resposta.</p><p>'+starts.length+' aberturas registradas. Tempo de resposta acumulado nas atividades: '+Math.round(ps.reduce((n,e)=>n+(e.elapsedMs||0),0)/60000)+' min. Não inclui a leitura posterior da correção.</p>');}
    const loading=(!S.learningLoaded||!S.learningContentLoaded)?'<p class="rule">Carregando registros pedagógicos…</p>':'';
    const warn=error?'<div class="notice" role="alert">'+esc(error)+(pending.size?button('retry','Tentar salvar novamente'):'')+'</div>':'';
    return '<div class="learn"><h2 class="section-title">Aprendizagem · evidências</h2>'+nav+loading+warn+(saving?'<p role="status">Salvando…</p>':'')+body+'</div>';
  }
  function editorHTML(S) {
    return panel('Nova atividade pedagógica', '<p>As atividades ficam na sua conta. Gabaritos e questões existentes não são substituídos.</p><label>Tipo<select id="learn-type"><option value="recall">Evocação</option><option value="pretest">Pré-teste</option><option value="duel">Duelo</option><option value="variant">Variante reservada</option></select></label><label>Título<input id="learn-title" maxlength="160"></label><label>Conceito específico<input id="learn-concept" maxlength="100" placeholder="Ex.: DNS × DHCP"></label><label>Pergunta<textarea id="learn-prompt" rows="3"></textarea></label><label>Explicação / diferença decisiva<textarea id="learn-explanation" rows="3"></textarea></label><label>Fonte<input id="learn-reference"></label><label>Gabarito (variantes)<select id="learn-answer-key"><option value="C">Certo</option><option value="E">Errado</option></select></label><label>Material vinculado<select id="learn-material"><option value="">Sem vínculo</option>'+values(S.mat).map(m=>'<option value="'+esc(m.id)+'">'+esc(m.titulo||m.id)+'</option>').join('')+'</select></label><label><input type="checkbox" id="learn-reviewed"> Revisei o gabarito e a explicação.</label><label><input type="checkbox" id="learn-context"> A variante exige a mesma regra em outro contexto, sem mera troca de palavras.</label><p class="rule">Uma variante criada nesta tela já foi exposta a você e não entra como inédita na sua própria avaliação. Ela poderá servir como prática.</p>'+button('create','Salvar atividade'),true)+
      panel('Controles de liberação', '<p>Desligar um processo preserva os registros. A revisão adaptativa permanece em simulação.</p>'+Object.entries(flags(S)).map(([k,v])=>'<label><input type="checkbox" data-learn-flag="'+k+'" '+(v?'checked':'')+'> '+esc(k.toUpperCase())+'</label>').join('')+button('flags','Salvar controles'));
  }
  function validateCard(c) {
    if(!['variant','duel','recall','pretest'].includes(c.type))throw new Error('Tipo de atividade inválido.');
    for(const key of ['title','concept','prompt','explanation','reference'])if(typeof c[key]!=='string'||!c[key].trim())throw new Error('Preencha título, conceito, pergunta, explicação e fonte.');
    if(c.prompt.length>10000||c.explanation.length>10000)throw new Error('Atividade muito longa.');
    if(c.type==='variant'&&!['C','E'].includes(c.answer))throw new Error('Gabarito inválido.');
    return true;
  }
  async function begin(id) {
    const S=ctx.S,c=catalog(S).find(x=>x.id===id);
    if(!c)throw new Error('Atividade indisponível.');
    if(!S.learningLoaded||!S.learningContentLoaded)throw new Error('Aguarde o carregamento dos registros.');
    if(activity)throw new Error('Conclua a atividade aberta antes de iniciar outra.');
    if(!enabled(S,{variant:'p2',duel:'p3',recall:'p5',pretest:'p7'}[c.type]))throw new Error('Processo desativado.');
    if(c.type==='variant'&&!eligibleVariants(S).some(x=>x.id===id))throw new Error('Variante sem elegibilidade confirmada.');
    const seen=events(S).some(e=>e.item===id);
    const reference=attempts(S).filter(e=>e.concept===c.concept&&!e.invalid&&e.ok===true&&e.origin==='treino'&&(c.sourceItems||[]).includes(e.item)).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).at(-1);
    const attemptId=uid(), at=new Date().toISOString();
    await save({id:attemptId+'-exposure',kind:'exposure',item:id,version:c.version||hash(c.prompt+c.answer+c.explanation),at,origin:c.type});
    activity={id:attemptId,card:c,phase:'question',seen,reference,startedAt:at,known:(c.sourceItems||[]).some(id=>S.r.get(id)?.tentativas>0)};drafts.response='';
    /* O pré-teste integra a biblioteca de Materiais. Sem tela de prática redundante. */
    ctx.setView(c.type==='pretest'?'conteudo':'pegadinhas');
  }
  async function answer(skip) {
    if(!activity||activity.phase!=='question')return;
    const a=activity,c=a.card;
    let response=String(drafts.response||'').trim(), confidence=null;
    if(c.type==='variant') {
      response=document.querySelector('input[name="learn-answer"]:checked')?.value;
      confidence=Number(document.getElementById('learn-confidence')?.value)||null;
      if(!response||response!=='B'&&!confidence)throw new Error('Marque a resposta e a confiança antes de conferir.');
      if(response==='B')confidence=null;
    } else if(!skip&&!response)throw new Error('Escreva uma tentativa ou escolha revelar sem tentar.');
    const e=a.result||{id:a.id,kind:c.type==='variant'?'attempt':'practice',item:c.id,version:c.version||hash(c.prompt+c.answer+c.explanation),concept:c.concept,at:new Date().toISOString(),
      origin:c.type==='variant'?'transferencia':c.type,exposure:!a.seen&&c.reserved?'new':a.seen?'seen':'unknown',
      reference:a.reference?.id||null,referenceAt:a.reference?.at||null,reviewed:c.reviewed===true,
      marked:c.type==='variant'?response:null,ok:c.type==='variant'?response===c.answer:null,confidence,
      response:skip?'':response,skipped:!!skip,elapsedMs:Date.now()-Date.parse(a.startedAt),policy:POLICY,
      material:c.material||null,knownContent:!!a.known,followUpAfter:new Date(Date.now()+7*DAY).toISOString()};
    a.result=e;
    await save(e);
    a.phase='feedback';a.response=e.response||e.marked;a.skipped=e.skipped;
  }
  async function action(name,id) {
    const S=ctx.S;
    if(name==='section'){selected=id;return}
    if(name==='plan'){ctx.setView('painel');return}
    if(name==='abandon'){if(activity){activity.abandonment ||= {id:activity.id+'-abandon',kind:'abandonment',item:activity.card.id,at:new Date().toISOString(),origin:activity.card.type};await save(activity.abandonment);}activity=null;return}
    if(name==='close'){if(activity?.phase==='feedback'){activity.completion ||= {id:activity.id+'-complete',kind:'completion',item:activity.card.id,at:new Date().toISOString(),origin:activity.card.type};await save(activity.completion);}activity=null;return}
    if(name==='start'){await begin(id);return}
    if(name==='source'){const c=activity?.card;const ids=(c?.sourceItems||[]).filter(id=>S.q.has(id));if(!ids.length)throw new Error('Nenhum item vinculado disponível.');if(S.round&&!S.round.fim)throw new Error('Conclua sua rodada atual primeiro.');activity=null;ctx.startSource(ids,c.title);return}
    if(name==='answer'||name==='skip'){await answer(name==='skip');return}
    if(name==='retry'){for(const e of [...pending.values()])await save(e);if(activity?.result&&!pending.has(activity.id)){activity.phase='feedback';activity.response=activity.result.response||activity.result.marked;activity.skipped=activity.result.skipped;}return}
    if(name==='weekly'){
      const w=weekly(S,id), text=String(drafts.weekly??w.saved?.text??w.suggestion).trim();
      if(!text)throw new Error('Escreva a ação do ciclo.');
      await save({...w.saved,id:w.id,kind:'weekly',periodEnd:id,at:new Date().toISOString(),text,attempts:w.list.length,policy:POLICY});return;
    }
    if(name==='weekly-toggle'){const w=weekly(S,id);if(w.saved)await save({...w.saved,completed:!w.saved.completed,at:new Date().toISOString()});return;}
    if(name==='simulation'){
      if(!enabled(S,'p6'))throw new Error('Simulação desativada.');
      const date=ctx.hoje(),id='simulation-'+date+'-'+uid();
      const decisions=values(S.r).filter(r=>r.proxRevisao).map(r=>({item:r.qid,...simulate(attempts(S).filter(e=>e.item===r.qid),r.proxRevisao,date,cfg(S).examDate)}));
      // One immutable event per item keeps writes below the bridge document limit.
      for(const row of decisions.slice(0,20))await save({id:id+'-'+row.item,kind:'schedule-simulation',at:new Date().toISOString(),...row});
      return;
    }
    if(name==='flags'){
      const next={...cfg(S),flags:Object.fromEntries([...document.querySelectorAll('[data-learn-flag]')].map(e=>[e.dataset.learnFlag,e.checked]))};
      await S.db.doc('config/aprendizagem').set(next);S.cfg.set('aprendizagem',next);return;
    }
    if(name==='create'){
      const v=k=>document.getElementById('learn-'+k)?.value?.trim()||'';
      const c={id:'learn-'+uid(),type:v('type'),title:v('title'),concept:v('concept'),prompt:v('prompt'),explanation:v('explanation'),reference:v('reference'),material:v('material'),
        answer:v('answer-key'),reviewed:document.getElementById('learn-reviewed').checked,contextChanged:document.getElementById('learn-context').checked,reserved:false,active:true,createdAt:new Date().toISOString()};
      validateCard(c);c.version=hash(JSON.stringify(c));await S.db.doc('aprendizagem_conteudos/'+c.id).set(c);S.learningContent.set(c.id,c);
      await save({id:uid(),kind:'exposure',item:c.id,version:c.version,origin:'editor',at:new Date().toISOString()});
      error='Atividade salva.';return;
    }
  }
  function wire(S,api) {
    ctx={S,...api};
    document.querySelectorAll('[data-learn-draft]').forEach(el=>el.addEventListener('input',()=>{drafts[el.dataset.learnDraft]=el.value}));
    document.querySelectorAll('[data-learn]').forEach(el=>el.addEventListener('click',async()=>{
      if(saving)return;saving=true;el.disabled=true;
      try{await action(el.dataset.learn,el.dataset.id)}catch(e){error=e.message||'Não foi possível concluir.'}
      finally{saving=false;draw()}
    }));
  }
  window.addEventListener?.('beforeunload',event=>{if(pending.size){event.preventDefault();event.returnValue='';}});
  window.QBLearning={recordPrimary,statusHTML,version,metadata,feedback,metrics,simulate,eligibleVariants,validateCard,attempts,mount,render,wire,weeklyHTML,contentHTML,activityHTML,flags,enabled};
})();
