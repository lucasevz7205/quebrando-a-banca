/* Frases de bolso: pistas rápidas para evocar ANTES de olhar a definição. */
const MEC_MEMORIA={
  F1:{lema:'Todo? Ache a exceção.',pergunta:'A regra realmente vale em TODOS os casos?',armadilha:'Uma palavra absoluta amplia uma regra que tem limite.',acao:'Sublinhe “sempre”, “nunca” e “todos”; procure a ressalva na fonte.'},
  F2:{lema:'Só isso? Ache outro caso.',pergunta:'A fonte também permite outra hipótese?',armadilha:'A expressão “apenas” corta possibilidades que a regra permite.',acao:'Transforme “somente” em pergunta: existe mais uma hipótese válida?'},
  F3:{lema:'Parecido não é igual.',pergunta:'Este termo é exatamente o conceito correto?',armadilha:'O item troca um termo por outro próximo, mas diferente.',acao:'Compare os dois conceitos com uma diferença decisiva.'},
  F4:{lema:'Número trocado, item errado.',pergunta:'Prazo, número, quórum ou verbo estão idênticos à fonte?',armadilha:'Um pequeno detalhe derruba todo o enunciado.',acao:'Confira separadamente cada número, prazo, sujeito e verbo de obrigação.'},
  F5:{lema:'Regra ou exceção?',pergunta:'O texto fala da regra geral ou de um caso excepcional?',armadilha:'O item toma a exceção como regra, ou apaga a ressalva.',acao:'Diga a regra primeiro e depois enuncie a exceção.'},
  F6:{lema:'Duas verdades, ligação falsa.',pergunta:'O conector estabelece mesmo essa relação?',armadilha:'Duas afirmações verdadeiras são ligadas por uma causa ou condição falsa.',acao:'Leia as duas metades separadas e teste “porque”, “se”, “embora” e “portanto”.'},
  F7:{lema:'Não invente uma conclusão.',pergunta:'Onde está o apoio literal ou lógico para a conclusão?',armadilha:'O item afirma mais do que a fonte permite concluir.',acao:'Aponte o trecho que sustenta a inferência; sem suporte, desconfie.'},
  F8:{lema:'Fonte certa, data certa.',pergunta:'A fonte, a redação e o entendimento continuam vigentes?',armadilha:'Mistura regras antigas, fontes diferentes ou entendimento superado.',acao:'Identifique a fonte e o marco temporal antes do julgamento.'},
  F9:{lema:'Uma parte falsa derruba tudo.',pergunta:'Todas as partes do item estão corretas?',armadilha:'Esconde uma parte errada entre afirmações verdadeiras.',acao:'Separe as orações ligadas por “e”, “bem como” ou ponto e vírgula.'},
  F10:{lema:'Dois testes: sentido e gramática.',pergunta:'A reescrita preserva o sentido E a correção?',armadilha:'A nova redação parece equivalente, mas muda o sentido ou a norma.',acao:'Compare a ideia original; depois confira regência, concordância e pontuação.'},
  V1:{lema:'Mudou a forma, não a regra.',pergunta:'O sentido continua idêntico apesar das outras palavras?',armadilha:'Uma paráfrase verdadeira parece falsa por não copiar a fonte.',acao:'Traduza as duas frases para a mesma ideia, sem se prender ao vocabulário.'},
  V2:{lema:'Dizer “um” não exclui “outros”.',pergunta:'O item afirma um exemplo ou diz que é o único?',armadilha:'Uma informação incompleta pode ser verdadeira.',acao:'Só trate como exclusão quando aparecer “apenas”, “único” ou equivalente.'},
  V3:{lema:'Nem todo “sempre” é falso.',pergunta:'Há alguma exceção real a essa regra absoluta?',armadilha:'A palavra absoluta assusta, mesmo quando a regra é absoluta.',acao:'Confirme o alcance na fonte; não marque E só por aparecer “nunca”.'},
  V4:{lema:'Estranho pode ser exceção certa.',pergunta:'Essa hipótese incomum está prevista na fonte?',armadilha:'Uma exceção verdadeira contraria a intuição.',acao:'Lembre a hipótese expressa antes de descartar o item.'}
};
function mecanStats(code,ids){
  const out={total:ids.length,respondidos:0,acertos:0,erros:0,confErros:0,caderno:0,errosHistoricos:0,reincidentes:0};
  for(const id of ids){
    const r=S.r.get(id),q=S.q.get(id);
    if(!r||!q||!Number(r.tentativas))continue;
    const historico=(r.hist||[]).filter(h=>(h.m==='C'||h.m==='E')&&typeof h.ok==='boolean');
    const anteriores=historico.filter(h=>h.ok===false).length;
    out.errosHistoricos+=anteriores;
    if(anteriores>=2)out.reincidentes++;
    const marca=r.ultimaMarcada;
    if(marca!=='C'&&marca!=='E')continue;
    out.respondidos++;
    const bom=marca===q.gabarito;
    if(bom)out.acertos++;
    else{
      out.erros++;
      const h=(r.hist||[]).filter(h=>h.m==='C'||h.m==='E').at(-1);
      if((h?Number(h.c):Number(r.conf))===3)out.confErros++;
    }
    if(r.noCaderno)out.caderno++;
  }
  return out;
}
function viewMecanismos(){
  const rk=S.an.get('ranking');
  const geral=new Map((rk?.geral||[]).map(x=>[x.mecanismo,x]));
  const porMat=new Map();
  for(const x of rk?.porMateria||[]){if(!porMat.has(x.materia))porMat.set(x.materia,[]);porMat.get(x.materia).push(x);}
  const mats=[...porMat.keys()].filter(x=>x!=='OUTRA').sort((a,b)=>(SIG_MAT[a]||a).localeCompare(SIG_MAT[b]||b,'pt-BR'));
  const matOpts=`<option value="">Todas as matérias</option>`+mats.map(k=>`<option value="${esc(k)}" ${S.fMecMat===k?'selected':''}>${esc(SIG_MAT[k]||k)}</option>`).join('');
  const exemplos=new Map();
  for(const [id,doc] of S.an){
    if(id==='ranking')continue;
    for(const it of doc.itens||[]){
      if(!MEC[it.mecanismo]||it.anulado||!it.evidencia||it.confianca==='baixa')continue;
      if(S.fMecMat&&it.materia!==S.fMecMat)continue;
      if(!exemplos.has(it.mecanismo))exemplos.set(it.mecanismo,[]);
      const rows=exemplos.get(it.mecanismo);
      if(rows.length<2)rows.push({...it,doc:doc.titulo});
    }
  }
  const all=MEC_ORD.map(code=>{
    const ids=idsDoMec(code),personal=mecanStats(code,ids),raw=(S.fMecMat?(porMat.get(S.fMecMat)||[]).find(x=>x.mecanismo===code):geral.get(code));
    const denominator=S.fMecMat?(porMat.get(S.fMecMat)||[])[0]?.total:rk?.totalValidos;
    return {code,d:MEC[code],memo:MEC_MEMORIA[code],ids,personal,raw,denominator};
  });
  const itemsWithPractice=all.filter(x=>x.personal.total>0);
  const personalTotal=itemsWithPractice.reduce((n,x)=>n+x.personal.respondidos,0);
  const errTotal=itemsWithPractice.reduce((n,x)=>n+x.personal.erros,0);
  const confidenceErrors=itemsWithPractice.reduce((n,x)=>n+x.personal.confErros,0);
  const recurrent=itemsWithPractice.reduce((n,x)=>n+x.personal.reincidentes,0);
  const foco=S.mecFoco||'todos';
  let chosen=all.filter(x=>foco==='erros'?x.personal.erros>0:foco==='praticar'?x.personal.respondidos<5&&x.ids.length>0:foco==='frequentes'?Number(x.raw?.n||0)>0:true);
  if(foco==='frequentes')chosen.sort((a,b)=>Number(b.raw?.n||0)-Number(a.raw?.n||0));
  if(foco==='erros')chosen.sort((a,b)=>b.personal.erros-a.personal.erros||b.personal.confErros-a.personal.confErros);
  const focusOptions=[['todos','Todos os mecanismos'],['erros','Errei neles'],['praticar','Preciso praticar'],['frequentes','Frequentes na amostra']];
  const destaque=all.filter(x=>x.personal.erros>0||x.personal.reincidentes>0).sort((a,b)=>b.personal.confErros-a.personal.confErros||b.personal.reincidentes-a.personal.reincidentes||b.personal.erros-a.personal.erros).slice(0,3);
  const orderedStats=all.filter(x=>Number(x.raw?.n||0)>0).sort((a,b)=>Number(b.raw?.n||0)-Number(a.raw?.n||0));
  const topSample=orderedStats.slice(0,3);
  const selectedMat=S.fMecMat?SIG_MAT[S.fMecMat]||S.fMecMat:'amostra geral';
  const card=x=>{
    const {code,d,memo,personal,ids,raw,denominator}=x;
    const isTrue=code[0]==='V';
    const status=personal.erros?`${personal.erros} ${personal.erros===1?'erro':'erros'} em ${personal.respondidos} respondidos${personal.confErros?` · ${personal.confErros} com certeza`:''}`:personal.reincidentes?`Últimos itens corretos; ${personal.reincidentes} com erros repetidos no histórico`:personal.respondidos>=5?`${personal.acertos}/${personal.respondidos} últimas respostas certas`:personal.respondidos>0?`${personal.acertos}/${personal.respondidos} certas · amostra pequena`:ids.length?`Ainda sem respostas · ${ids.length} questões vinculadas`:'Sem questões vinculadas';
    const label=personal.erros?'Atenção aos erros':personal.reincidentes?'Erros repetidos anteriormente':personal.respondidos>=5?'Prática registrada':'Aprender e praticar';
    const entries=(exemplos.get(code)||[]).map(e=>`<li>“${esc(e.evidencia)}” <small>${esc(SIG_MAT[e.materia]||e.materia||'')} · ${esc(e.doc||'Prova analisada')}${typeof e.item==='number'?' · item '+e.item:''}</small></li>`).join('');
    const opened=S.mecOpen.has(code);
    return `<details class="qb-trap-card ${isTrue?'is-true':'is-false'}" data-mec-card="${code}" ${opened?'open':''}>
      <summary class="qb-trap-card-summary"><span class="qb-trap-code">${code}</span><span class="qb-trap-heading"><strong>${esc(d.n)}</strong><span>${esc(memo.lema)}</span></span><span class="qb-trap-card-state ${personal.erros?'needs-attention':''}">${esc(label)}</span><span class="qb-trap-chevron" aria-hidden="true">⌄</span></summary>
      <div class="qb-trap-card-content"><div class="qb-trap-core">
        <div class="qb-trap-explain"><small>O QUE A BANCA FAZ</small><p>${esc(memo.armadilha)}</p><small>PISTAS NO ENUNCIADO</small><p>${esc(d.s)}</p></div>
        <div class="qb-trap-vaccine"><small>PERGUNTA QUE EVITA O ERRO</small><h4>${esc(memo.pergunta)}</h4><p>${esc(memo.acao)}</p></div>
      </div>
      <div class="qb-trap-evidence">
        <div><span class="qb-trap-evidence-label">Seu treino (última resposta em cada item)</span><strong>${esc(status)}</strong></div>
        <div><span class="qb-trap-evidence-label">Frequência na amostra histórica</span><strong>${rk&&denominator?`${Number(raw?.n||0)} de ${denominator} itens (${(100*Number(raw?.n||0)/denominator).toLocaleString('pt-BR',{maximumFractionDigits:1})}%)`:'Sem contagem disponível'}</strong></div>
      </div>
      <details class="qb-trap-recall"><summary>Treino rápido de lembrança: qual é a pergunta-chave?</summary><p>${esc(memo.pergunta)}</p><p><b>Resposta preventiva:</b> ${esc(d.v)}</p></details>
      ${entries?`<details class="qb-trap-examples"><summary>Ver exemplos classificados (${(exemplos.get(code)||[]).length})</summary><ul>${entries}</ul><p>Trechos da análise disponível, não exemplos fictícios. Confira sempre a fonte original.</p></details>`:''}
      <div class="qb-trap-bottom">${ids.length?`<button type="button" class="qb-trap-action" data-mec-treinar="${code}">Treinar ${ids.length} ${ids.length===1?'questão':'questões'} deste mecanismo</button>`:'<span class="qb-trap-unlinked">Sem questões disponíveis para este mecanismo no filtro atual.</span>'}<span>${isTrue?'Item verdadeiro que parece falso':'Mecanismo típico de item errado'}</span></div>
      </div></details>`;
  };
  const first=chosen.filter(x=>x.code.startsWith('F'));
  const second=chosen.filter(x=>x.code.startsWith('V'));
  const important=chosen.length?`${chosen.length} ${chosen.length===1?'mecanismo':'mecanismos'}`:'Nenhum mecanismo com esse filtro';
  const spots=topSample.map(x=>`<li><strong>${x.code} · ${esc(x.memo.lema)}</strong><span>${x.raw.n} itens na amostra · ${esc(x.memo.pergunta)}</span></li>`).join('');
  return `<div class="qb-traps-lab">
    <section class="qb-trap-overview"><div><span class="qb-trap-label">COMO ESTUDAR AS PEGADINHAS</span><h3>Reconheça. Interrompa. Confira.</h3><p>Em cada mecanismo, memorize uma frase curta, procure o sinal e faça uma pergunta preventiva antes de julgar a assertiva.</p></div><div class="qb-trap-steps"><span><b>1</b> Reconheça o sinal</span><span><b>2</b> Faça a pergunta</span><span><b>3</b> Treine no item</span></div></section>
    <div class="qb-trap-metrics"><div class="qb-trap-metric"><small>Itens classificados já respondidos</small><strong>${personalTotal}</strong><span>Nas questões ligadas aos mecanismos</span></div><div class="qb-trap-metric ${errTotal?'warn':''}"><small>Erros na última resposta</small><strong>${errTotal}</strong><span>${confidenceErrors} ${confidenceErrors===1?'erro com certeza':'erros com certeza'} · ${recurrent} ${recurrent===1?'item com erros repetidos':'itens com erros repetidos'}</span></div><div class="qb-trap-metric"><small>Mecanismos com treino disponível</small><strong>${itemsWithPractice.length}<i>/14</i></strong><span>Amostra pessoal não é a frequência da banca</span></div></div>
    ${destaque.length?`<section class="qb-trap-next"><div><span class="qb-trap-label">PREVENÇÃO PERSONALIZADA</span><h3>Revise estes erros primeiro</h3></div><div>${destaque.map(x=>`<button type="button" data-mec-open="${x.code}"><b>${x.code}</b><span>${esc(x.memo.lema)}</span><small>${x.personal.erros?`${x.personal.erros} ${x.personal.erros===1?'erro':'erros'} na última resposta`:`${x.personal.reincidentes} ${x.personal.reincidentes===1?'item reincidente':'itens reincidentes'}`} · abrir</small></button>`).join('')}</div></section>`:`<section class="qb-trap-next qb-trap-neutral"><span class="qb-trap-label">PRÓXIMA AÇÃO</span><h3>${personalTotal?'Nenhum erro registrado nos itens classificados que você respondeu.':'Você ainda não tem respostas classificadas suficientes para medir seu padrão de erro.'}</h3><p>${personalTotal?'Isso não prova domínio permanente. Abra os mecanismos ainda não praticados e faça questões novas.':'Comece pelos três mecanismos mais presentes na amostra, sempre verificando o enunciado e a fonte.'}</p></section>`}
    <div class="qb-trap-controls"><label>Disciplina <select id="f-mecmat">${matOpts}</select></label><div class="qb-trap-focus" role="group" aria-label="Filtrar mecanismos">${focusOptions.map(([k,l])=>`<button data-mec-foco="${k}" aria-pressed="${foco===k}">${l}</button>`).join('')}</div></div>
    <section class="qb-trap-list"><div class="qb-trap-section-title"><div><span class="qb-trap-label">QUANDO O ITEM É ERRADO</span><h3>Armadilhas que mudam a regra</h3></div><span>${first.length} ${first.length===1?'mecanismo':'mecanismos'}</span></div>${first.map(card).join('')||'<p class="qb-trap-empty">Nenhuma armadilha atende a este filtro.</p>'}</section>
    <section class="qb-trap-list"><div class="qb-trap-section-title"><div><span class="qb-trap-label">QUANDO O ITEM É CERTO</span><h3>Verdades que parecem pegadinhas</h3></div><span>${second.length} ${second.length===1?'mecanismo':'mecanismos'}</span></div>${second.map(card).join('')||'<p class="qb-trap-empty">Nenhuma regra verdadeira atende a este filtro.</p>'}</section>
    <details class="qb-trap-bank-context"><summary>Entenda o índice da banca e os mecanismos mais frequentes (${esc(selectedMat)})</summary><p>A incidência mostra <b>quantas vezes cada mecanismo apareceu na amostra de ${rk?.totalValidos||'itens'} itens classificados</b>, não a chance de ele cair na sua prova nem a probabilidade de você errar. Sua dificuldade pessoal aparece somente nas respostas que você realizou.</p>${spots?`<ol>${spots}</ol>`:'<p>Não há estatísticas históricas para este filtro.</p>'}<small>Metodologia preservada: ${esc(rk?.metodo||'Classificação ainda indisponível')}. ${rk?.calculadoEm?'Último cálculo: '+esc(rk.calculadoEm)+'.':''} Não inferir riscos a partir de amostras pequenas.</small></details>
    <p class="qb-trap-footnote">Critério pessoal: acerto/erro na última resposta de cada questão associada ao mecanismo. Respostas em branco não entram. “Erros com certeza” usa confiança máxima registrada na tentativa. Esses dados não incluem todas as questões da plataforma.</p>
  </div>`;
}
