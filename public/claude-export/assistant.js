/* Assistente de desempenho: respostas locais verificáveis e consulta opcional à IA Base44. */
(() => {
  'use strict';
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const pct=(n,d)=>d?Math.round(100*n/d)+'%':'sem dados';
  const key=v=>{const d=new Date(v);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  let state=null, opened=false, lastQuestion='', busy=false;
  function now(){return key(new Date())}
  function getDaily(day){return window.QBInsights?.analyze(state,day)||null}
  function localAnswer(question){
    const text=normalize(question),day=(question.match(/\b20\d\d-\d\d-\d\d\b/)||[])[0]||now();
    const s=getDaily(day),p=(n,d)=>pct(n,d);
    if(!s)return 'O módulo de análise ainda não carregou. Atualize a página.';
    const n=s.c+s.e;
    if(/(quem e voce|o que faz|ajuda|funciona|comandos|capacidades)/.test(text)) return 'Eu sou o assistente local do Quebrando a Banca. Posso consultar suas estatísticas reais, apontar disciplinas mais fracas, mostrar as tarefas e revisões e explicar como navegar. Para perguntas abertas, há uma opção separada de IA generativa que consome créditos de integração.';
    if(/(taref|agenda|planeja|meta|penden|atrasad|calendario|semana)/.test(text)){
      const tasks=(state.pl||[]).filter(t=>t.data===day&&!t.arquivada),toDo=tasks.filter(t=>t.status!=='concluida');
      return `${day}: ${s.done} de ${tasks.length} tarefas concluídas. ${toDo.length} pendentes.${toDo.length?' Próximas: '+toDo.slice(0,4).map(v=>v.titulo).join('; ')+'.':''} Use a aba Hoje para iniciar o cronômetro, concluir ou reagendar.`;
    }
    if(/(revis|flashcard|cart|memori|intervalo)/.test(text)){
      let due=0,newCount=0;for(const v of state.cav?.values()||[]){if(v.prox && v.prox<=now())due++;if(!(v.hist||[]).length)newCount++;}
      return `No dia ${day}, ${s.cardRatings} avaliações de flashcards foram registradas. No momento, ${due} cartões avaliados têm revisão vencida e há ${newCount} cartões ainda não avaliados. Os limites diários do sistema continuam válidos. Acesse Estudo → Flashcards.`;
    }
    if(/(pior|fraca|priorid|dificuld|disciplina|materia|reforc|onde errei)/.test(text)){
      const data=window.QBInsights?.trend(state,day,7)||[];
      const grouped=new Map();for(const d of data)for(const v of d.subjects.values()){let o=grouped.get(v.name)||{n:0,c:0,e:0};o.n+=v.n;o.c+=v.c;o.e+=v.e;grouped.set(v.name,o)}
      const ranked=[...grouped.entries()].filter(([,v])=>v.c+v.e>=5).sort((a,b)=>a[1].c/(a[1].c+a[1].e)-b[1].c/(b[1].c+b[1].e));
      if(!ranked.length)return 'Ainda não há amostra suficiente por disciplina nos últimos sete dias. Responda pelo menos cinco itens da mesma matéria para obter uma comparação.';
      const most=ranked.slice(0,3).map(([m,v])=>`${m}: ${p(v.c,v.c+v.e)} (${v.c+v.e} marcados)`);
      return `Menor aproveitamento nos últimos sete dias: ${most.join('; ')}. Priorize primeiro os itens errados das matérias com menor percentual e confirme a tendência após novas rodadas.`;
    }
    if(/(simulad|nota liquida|pontuac|resultado da prova)/.test(text)){
      const sims=state.sims||[];const last=sims.filter(s=>s.tipo==='obj').sort((a,b)=>String(b.data).localeCompare(String(a.data)))[0];
      return last?`Último simulado objetivo registrado: ${last.data}. Nota líquida P1: ${Number(last.p1||0)}, P2: ${Number(last.p2||0)}, total: ${Number(last.p1||0)+Number(last.p2||0)}. Você pode consultar a aba Simulado para detalhes. Não confunda esse total com acerto percentual nas rodadas.`:'Nenhum simulado objetivo foi encontrado no banco.';
    }
    if(/(certeza|confianca|calibr|chute|erros com certeza)/.test(text)){
      const t=window.QBInsights?.trend(state,day,7)||[],a=t.reduce((x,v)=>x+v.sure,0),c=t.reduce((x,v)=>x+v.sureC,0);
      return `Nas últimas sete datas até ${day}, foram ${a} respostas com certeza, das quais ${c} certas (${p(c,a)}). A meta de calibração do método é 90%. Antes de marcar certeza, tente explicar o fundamento.`;
    }
    if(/(desempenho|acertos|erros|aproveitamento|analise|quantas|treinei|progresso)/.test(text)){
      return `Em ${day}: ${s.items} itens em ${s.rounds} rodadas; ${s.c} certos, ${s.e} errados, ${s.b} em branco. Aproveitamento: ${p(s.c,n)}. Nota líquida: ${s.c-s.e}. ${s.cardRatings} cartões avaliados e ${s.done}/${s.tasks} tarefas concluídas. Abra Desempenho → Análise diária para os gráficos.`;
    }
    return `Não encontrei uma regra local confiável para essa pergunta. Posso ajudar com desempenho, erros, prioridades, revisões, simulados e planejamento. Para uma explicação aberta, use “Consultar IA”, que solicitará sua confirmação antes de consumir créditos.`;
  }
  function fillBubble(bubble,message,source=''){bubble.textContent=String(message).slice(0,4000);if(source){const label=document.createElement('em');label.textContent=source;bubble.appendChild(label)}const parent=bubble.parentElement;if(parent)parent.scrollTop=parent.scrollHeight}
  function addMessage(message,who='bot',source=''){const parent=document.getElementById('qb-chat-messages');if(!parent)return null;const bubble=document.createElement('div');bubble.className='qb-chat-bubble '+who;parent.appendChild(bubble);fillBubble(bubble,message,source);while(parent.children.length>30)parent.removeChild(parent.firstChild);return bubble}
  function setOpen(on){opened=on;document.getElementById('qb-chat-panel').hidden=!on;document.getElementById('qb-chat-launch').hidden=on;if(on)document.getElementById('qb-chat-input')?.focus()}
  function submit(question){const q=String(question||'').trim().slice(0,500);if(!q)return;lastQuestion=q;addMessage(q,'user');addMessage(localAnswer(q),'bot','Análise local · sem consumo de créditos');const input=document.getElementById('qb-chat-input');if(input)input.value=''}
  function makeContext(){const s=getDaily(now()),week=window.QBInsights?.trend(state,now(),7)||[],a=week.reduce((n,x)=>n+x.c,0),b=week.reduce((n,x)=>n+x.c+x.e,0);return {date:now(),itemsToday:s?.items||0,correctToday:s?.c||0,wrongToday:s?.e||0,blankToday:s?.b||0,tasksDoneToday:s?.done||0,tasksTotalToday:s?.tasks||0,cardRatingsToday:s?.cardRatings||0,accuracy7days:b?Math.round(100*a/b):null};}
  async function askGenerative(){if(busy)return;if(!lastQuestion){addMessage('Digite sua pergunta antes de solicitar a consulta à IA.');return;}
    if(!window.confirm('Esta consulta à IA do Base44 poderá consumir créditos de integração. Deseja enviar a pergunta e um resumo estatístico do seu desempenho?'))return;
    busy=true;const btn=document.getElementById('qb-chat-ai');btn.disabled=true;btn.textContent='Consultando IA…';
    const live='IA Base44 · respondendo em tempo real…';let bubble=null,text='';
    try{if(!window.QBBridge?.ask)throw Error('A conexão autenticada não está disponível.');bubble=addMessage('…','bot',live);
      const v=await window.QBBridge.ask('assistantLLM',{question:lastQuestion,context:makeContext()},{onDelta:d=>{text+=d;if(bubble)fillBubble(bubble,text,live)}});
      const final=typeof v==='string'?v:(text||'Sem resposta.');if(bubble)fillBubble(bubble,final,'IA Base44 · pode consumir créditos de integração');else addMessage(final,'bot','IA Base44 · pode consumir créditos de integração')}
    catch(e){const err='Não foi possível consultar a IA. '+(e?.message||'Tente novamente.');if(bubble)fillBubble(bubble,text?text+'\n\n'+err:err);else addMessage(err,'bot')}
    finally{busy=false;btn.disabled=false;btn.textContent='Consultar IA (usa créditos)'}
  }
  function mount(S){state=S;if(document.getElementById('qb-chat-launch'))return;
    const root=document.createElement('div');root.id='qb-assistant-root';root.innerHTML=`<button id="qb-chat-launch" class="qb-chat-launch" type="button" aria-haspopup="dialog" aria-controls="omni-drawer" title="Abrir O Arquiteto (Tutor, Cornell e Laboratório)"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>O Arquiteto</button>
      <section id="qb-chat-panel" class="qb-chat-panel" role="dialog" aria-label="Assistente Quebrando a Banca" hidden><div class="qb-chat-header"><div class="qb-chat-heading"><span class="qb-chat-orb" aria-hidden="true"><span></span></span><div class="qb-chat-titles"><strong>Assistente de estudo</strong><small>Inteligência aplicada à sua preparação</small><span class="qb-chat-status">Análise local · sem créditos</span></div></div><button type="button" id="qb-chat-close" class="qb-chat-close" aria-label="Fechar">✕</button></div><div id="qb-chat-messages" class="qb-chat-messages" aria-live="polite"></div><div class="qb-chat-chips" aria-label="Perguntas rápidas ao assistente"><button type="button" data-qb-prompt="Como está meu desempenho?"><span class="qb-chat-chip-icon" aria-hidden="true">↗</span><span class="qb-chat-chip-label"><strong>Desempenho</strong><small>Meus resultados</small></span></button><button type="button" data-qb-prompt="Quais são as matérias mais fracas?"><span class="qb-chat-chip-icon" aria-hidden="true">◈</span><span class="qb-chat-chip-label"><strong>Pontos fracos</strong><small>Onde reforçar</small></span></button><button type="button" data-qb-prompt="Quais tarefas ainda faltam?"><span class="qb-chat-chip-icon" aria-hidden="true">✓</span><span class="qb-chat-chip-label"><strong>Tarefas</strong><small>Meu planejamento</small></span></button><button type="button" data-qb-prompt="Como estão minhas revisões?"><span class="qb-chat-chip-icon" aria-hidden="true">↺</span><span class="qb-chat-chip-label"><strong>Revisões</strong><small>O que retomar</small></span></button></div><form id="qb-chat-form" class="qb-chat-form"><input id="qb-chat-input" type="text" placeholder="Pergunte sobre seus estudos..." autocomplete="off" maxlength="500" aria-label="Pergunta ao assistente"/><button type="submit">Enviar</button></form><div class="qb-chat-opt"><span>Modo local sem custo. IA generativa só com confirmação.</span><button id="qb-chat-ai" type="button">Consultar IA (usa créditos)</button></div></section>`;
    document.body.appendChild(root);
    document.getElementById('qb-chat-launch').addEventListener('click',()=>{
      if(window.QBOmniStudy && typeof window.QBOmniStudy.openStudio === 'function'){
        window.QBOmniStudy.openStudio('tutor');
      } else {
        setOpen(true);
      }
    });
    document.getElementById('qb-chat-close').addEventListener('click',()=>setOpen(false));
    document.getElementById('qb-chat-form').addEventListener('submit',e=>{e.preventDefault();submit(document.getElementById('qb-chat-input').value)});
    document.querySelectorAll('[data-qb-prompt]').forEach(b=>b.addEventListener('click',()=>submit(b.dataset.qbPrompt)));
    document.getElementById('qb-chat-ai').addEventListener('click',askGenerative);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened)setOpen(false)});
    addMessage('Posso resumir seu desempenho diário, apontar matérias fracas, verificar tarefas, revisões e simulados. Minhas respostas locais usam apenas os registros do aplicativo.','bot','Assistente local');
  }
  window.QBAssistant={mount};
})();
