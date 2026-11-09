/* Quebrando a Banca: análise diária derivada de questões, sessões, cartões e tarefas. */
(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=(n,d)=>d?Math.round(n/d*100)+'%':'–';
  const dateKey=v=>{const d=new Date(v);return isNaN(d)?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const shift=(v,k)=>{const [y,m,d]=v.split('-').map(Number);return dateKey(new Date(y,m-1,d+k,12))};
  const short=v=>{const [y,m,d]=String(v).split('-');return d+'/'+m};
  const rounds=S=>S.rodadas||[];
  function analyze(S,day){
    const x={day,items:0,c:0,e:0,b:0,sure:0,sureC:0,rounds:0,roundMinutes:0,tasks:0,done:0,taskMinutes:0,cardRatings:0,simCount:0,simPoints:0,subjects:new Map()};
    const capMap=new Map();for(const t of S.ed?.values()||[])for(const cap of t.caps||[])if(!capMap.has(cap))capMap.set(cap,t.materia||'Outros');
    for(const r of rounds(S)){
      if(dateKey(r.inicio)!==day)continue;
      let has=0;
      for(const item of r.itens||[]){
        if(!['C','E','B'].includes(item.marcada)||!['C','E'].includes(item.gabarito))continue;
        const q=S.q?.get(item.qid);
        if(q?.foraNivel||q?.foraEdital||q?.anulado)continue;
        const sub=capMap.get(q?.cap||r.cap)||q?.materia||(r.capNome||'Outros').split(' · ')[0];
        let z=x.subjects.get(sub);if(!z){z={name:sub,n:0,c:0,e:0,b:0};x.subjects.set(sub,z)}
        has++;x.items++;z.n++;
        if(item.marcada==='B'){x.b++;z.b++;}
        else if(item.marcada===item.gabarito){x.c++;z.c++;}
        else{x.e++;z.e++;}
        if(item.marcada!=='B'&&Number(item.conf)===3){x.sure++;if(item.marcada===item.gabarito)x.sureC++}
      }
      if(has)x.rounds++;
      const mins=(new Date(r.fim)-new Date(r.inicio))/60000;
      if(r.fim&&mins>0&&mins<=720)x.roundMinutes+=mins;
    }
    for(const task of S.pl||[])if(!task.arquivada&&task.data===day){x.tasks++;if(task.status==='concluida')x.done++;x.taskMinutes+=Number(task.segundos||0)/60;}
    for(const v of S.cav?.values()||[])for(const a of v.hist||[])if(a.em&&dateKey(a.em)===day)x.cardRatings++;
    for(const v of S.sims||[])if(v.data===day){x.simCount++;if(v.tipo==='obj')x.simPoints+=(Number(v.p1)||0)+(Number(v.p2)||0)}
    x.roundMinutes=Math.round(x.roundMinutes);x.taskMinutes=Math.round(x.taskMinutes);return x;
  }
  const trend=(S,day,n=14)=>Array.from({length:n},(_,i)=>analyze(S,shift(day,i-n+1)));
  function advice(x){
    const messages=[];
    const weak=[...x.subjects.values()].filter(z=>z.c+z.e>=5).sort((a,b)=>a.c/(a.c+a.e)-b.c/(b.c+b.e));
    if(weak.length&&weak[0].c/(weak[0].c+weak[0].e)<.8){const z=weak[0];messages.push(['Reforçar '+z.name,`${z.e} erros em ${z.c+z.e} respostas (${pct(z.c,z.c+z.e)}). Retome os erros e teste a evocação.`])}
    if(x.sure>=5&&x.sureC/x.sure<.9)messages.push(['Recalibrar a certeza',`${x.sure-x.sureC} erros entre ${x.sure} respostas marcadas com certeza. Confirme a regra antes de marcar.`]);
    if(x.tasks>x.done)messages.push(['Reorganizar o planejamento',`${x.tasks-x.done} das ${x.tasks} tarefas do dia continuam pendentes. Reprograme as que não concluiu.`]);
    if(!x.items)messages.push(['Iniciar uma rodada','Nenhuma resposta de treino foi registrada nesta data. Resolva questões para obter um diagnóstico.']);
    if(x.e&&!messages.some(a=>a[0].startsWith('Reforçar')))messages.push(['Consolidar os erros',`Você errou ${x.e} itens. Consulte o caderno de erros e os cartões de contraste.`]);
    if(!x.cardRatings)messages.push(['Revisar os flashcards','Nenhum cartão foi avaliado nesta data. Confira a fila de revisão ativa.']);
    return messages.slice(0,3);
  }
  function curve(points){
    if(!points.length)return '';
    let p=`M ${points[0][0]} ${points[0][1]}`;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],q=points[Math.max(0,i-2)],z=points[Math.min(i+1,points.length-1)],dx=(b[0]-a[0])/3;
      const dy1=(b[1]-q[1])*dx/Math.max(1,b[0]-q[0]),dy2=(z[1]-a[1])*dx/Math.max(1,z[0]-a[0]);
      p+=` C ${a[0]+dx} ${Math.max(20,Math.min(210,a[1]+dy1))}, ${b[0]-dx} ${Math.max(20,Math.min(210,b[1]-dy2))}, ${b[0]} ${b[1]}`;
    }
    return p;
  }
  function graph(S,date){
    const a=trend(S,date),w=850,h=262,L=78,T=24,B=45,R=24;
    const x=i=>+(L+(w-L-R)*i/13).toFixed(1),y=v=>+(T+(h-T-B)*(1-v/100)).toFixed(1);
    const pts=a.map((v,i)=>v.c+v.e?[x(i),y(100*v.c/(v.c+v.e)),v]:null).filter(Boolean);
    const line=curve(pts),area=pts.length>1?`${line} L ${pts.at(-1)[0]} ${h-B} L ${pts[0][0]} ${h-B} Z`:'';
    const grid=[0,25,50,75,100].map(v=>`<line class="qb-dg" x1="${L}" x2="${w-R}" y1="${y(v)}" y2="${y(v)}"/><text class="qb-da" x="${L-10}" y="${y(v)+4}" text-anchor="end">${v}%</text>`).join('');
    const latest=pts.at(-1), recent=latest?.[2];
    const marks=pts.map(p=>`${p===latest?`<circle class="qb-dot-halo" cx="${p[0]}" cy="${p[1]}" r="12" aria-hidden="true"/>`:''}<circle class="qb-dot" cx="${p[0]}" cy="${p[1]}" r="5.4"><title>${short(p[2].day)} · ${pct(p[2].c,p[2].c+p[2].e)} · ${p[2].items} questões</title></circle>`).join('');
    const recentSummary=recent?`<div class="qb-chart-latest"><strong>${pct(recent.c,recent.c+recent.e)}</strong><span>Último dia com respostas<br><b>${short(recent.day)} · ${recent.c}/${recent.c+recent.e} acertos</b></span></div>`:'';
    const description=recent?`Último dia com respostas: ${short(recent.day)}, ${pct(recent.c,recent.c+recent.e)} de acertos.`:'Sem respostas registradas no período.';
    const labels=a.map((v,i)=>i%3===1||i===13?`<text class="qb-da" x="${x(i)}" y="${h-14}" text-anchor="middle">${short(v.day)}</text>`:'').join('');
    return `<section class="qb-analytics-card"><div class="qb-analytics-head"><div><span>EVOLUÇÃO DE ACERTOS</span><h3>Precisão diária</h3></div><small>14 dias</small></div><p class="qb-chart-sub">Resultados das rodadas de treino, sem misturar notas de simulados.</p><div class="qb-chart-screen">${recentSummary}<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Precisão de acertos nas rodadas por dia. ${esc(description)}"><defs><linearGradient id="qb-daily-grad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#aa88ff" stop-opacity=".42"/><stop offset="1" stop-color="#7654db" stop-opacity=".02"/></linearGradient></defs>${grid}${area?`<path fill="url(#qb-daily-grad)" d="${area}"/>`:''}${line?`<path class="qb-daily-line" d="${line}"/>`:''}${marks}${labels}</svg></div>${pts.length<2?'<p class="qb-chart-sub">A curva aparecerá com resultados de pelo menos dois dias.</p>':''}</section>`;
  }
  function compact(S,day){
    const selected=analyze(S,day), series=trend(S,day,7);
    const correct=series.reduce((sum,row)=>sum+row.c,0);
    const judged=series.reduce((sum,row)=>sum+row.c+row.e,0);
    const bars=series.map(row=>{
      const n=row.c+row.e, percent=pct(row.c,n);
      const label=n?`${short(row.day)}: ${row.c} de ${n} acertos, ${percent}`:`${short(row.day)}: sem respostas válidas para calcular a taxa`;
      return `<button type="button" data-qb-go-daily="${esc(row.day)}" aria-label="${esc(label)}. Abrir análise diária." title="${esc(label)}">
        <span>${percent}</span><span class="qb-pulse-track"${n&&!row.c?' data-zero':''}>${n?`<i style="--accuracy:${percent}"></i>`:''}</span><span>${short(row.day)}</span>
      </button>`;
    }).join('');
    return `<section class="qb-study-pulse" aria-label="Panorama do desempenho">
      <div><div class="qb-pulse-head"><div><span class="qb-pulse-kicker">Dados do dia selecionado</span><h3>Panorama do desempenho</h3></div><span class="qb-pulse-date">${short(day)}</span></div>
        <div class="qb-pulse-metrics">
          <div><strong>${selected.c+selected.e}</strong><small>Respostas C/E</small></div>
          <div><strong>${pct(selected.c,selected.c+selected.e)}</strong><small>Taxa de acerto</small></div>
          <div><strong>${selected.done}/${selected.tasks}</strong><small>Tarefas concluídas</small></div>
        </div>
        <button type="button" class="qb-pulse-link" data-qb-go-daily="${esc(day)}">Abrir análise diária →</button>
      </div>
      <div class="qb-pulse-plot">
        <span class="qb-pulse-range">7 dias · ${short(series[0].day)} a ${short(day)}</span>
        <h4>Acertos nas rodadas de treino</h4>
        <div class="qb-pulse-bars" role="group" aria-label="Abrir análise de um dia">${bars}</div>
        <p class="qb-pulse-note">${judged?`No período: ${correct}/${judged} acertos (${pct(correct,judged)}). Em branco fora do cálculo.`:'Sem respostas C/E registradas neste período.'}</p>
      </div>
    </section>`;
  }
  function render(S,now){
    if(!S.insightsDay)S.insightsDay=now();
    const d=S.insightsDay,x=analyze(S,d),pr=analyze(S,shift(d,-1)),t=trend(S,d,7),weekC=t.reduce((s,v)=>s+v.c,0),weekN=t.reduce((s,v)=>s+v.c+v.e,0);
    const delta=(x.c+x.e)&&(pr.c+pr.e)?Math.round(100*x.c/(x.c+x.e)-100*pr.c/(pr.c+pr.e)):null;
    const kpis=[['Itens julgados',x.items,`${x.rounds} rodadas · ${x.b} em branco`],['Taxa de acerto',pct(x.c,x.c+x.e),`${x.c} certos · ${x.e} errados`],['Nota líquida',`${x.c-x.e>0?'+':''}${x.c-x.e}`,'+1 certo · −1 errado'],['Certeza calibrada',pct(x.sureC,x.sure),`${x.sure} com confiança máxima`],['Tarefas concluídas',`${x.done}/${x.tasks}`,'Do calendário do dia'],['Flashcards avaliados',x.cardRatings,'Avaliações registradas']];
    const subjects=[...x.subjects.values()].sort((a,b)=>b.n-a.n).slice(0,20).map(v=>`<div class="qb-subject-analytic"><div><b>${esc(v.name)}</b><small>${v.c} certas · ${v.e} erradas · ${v.b} em branco</small></div><div class="qb-subject-meter"><span><i style="width:${v.c+v.e?100*v.c/(v.c+v.e):0}%"></i></span><b>${pct(v.c,v.c+v.e)}</b></div></div>`).join('');
    const rec=advice(x).map((a,i)=>`<div class="qb-analytic-advice"><em>0${i+1}</em><div><b>${esc(a[0])}</b><p>${esc(a[1])}</p></div></div>`).join('');
    return `<div class="wrap qb-analytics"><section class="qb-analytics-intro qb-page-hero" aria-label="Análise diária"><div class="qb-page-hero-copy"><span class="qb-page-kicker">ANÁLISE DIÁRIA · QUEBRANDO A BANCA</span><h2>Seu desempenho, em números</h2><p>Diagnósticos gerados automaticamente a partir do que você realmente fez.</p></div><div class="qb-analytics-filter"><label for="qb-insights-date">Data</label><input id="qb-insights-date" type="date" value="${esc(d)}"/><button type="button" class="btn ghost small" id="qb-insights-today">Hoje</button></div></section>
      <div class="qb-analytics-kpis">${kpis.map(([l,v,n])=>`<div class="qb-analytic-kpi"><small>${esc(l)}</small><strong>${esc(v)}</strong><span>${esc(n)}</span></div>`).join('')}</div>
      <div class="qb-analytics-columns">${graph(S,d)}<section class="qb-analytics-card qb-analytic-recommendations"><div class="qb-analytics-head"><div><span>PRIORIDADES</span><h3>O que fazer agora</h3></div></div>${rec}<div class="qb-analytic-foot">Média dos últimos 7 dias: <b>${pct(weekC,weekN)}</b>${delta===null?'':` · Ante o dia anterior: <b>${delta>0?'+':''}${delta} p.p.</b>`}</div></section></div>
      <div class="qb-analytics-columns qb-analytics-secondary"><section class="qb-analytics-card"><div class="qb-analytics-head"><div><span>DISCIPLINAS</span><h3>Acertos por matéria</h3></div></div>${subjects||'<p class="qb-chart-sub">Sem respostas registradas nesta data.</p>'}</section><section class="qb-analytics-card"><div class="qb-analytics-head"><div><span>REGISTROS DO DIA</span><h3>Execução</h3></div></div><div class="qb-analytics-facts"><div><span>Rodadas de treino</span><b>${x.rounds}</b></div><div><span>Duração das rodadas encerradas</span><b>${x.roundMinutes} min</b></div><div><span>Tempo registrado em tarefas</span><b>${x.taskMinutes} min</b></div><div><span>Simulados realizados</span><b>${x.simCount}</b></div>${x.simCount?`<div><span>Nota líquida nos simulados objetivos</span><b>${x.simPoints}</b></div>`:''}</div><p class="qb-chart-sub">Tempos de fontes diferentes não são somados, para evitar dupla contagem.</p></section></div><p class="qb-analytics-note">Dados de rodadas, tarefas, cartões e simulados. O diário foi retirado da análise. Questões respondidas em simulados são exibidas separadamente.</p></div>`;
  }
  function wire(S,rerender,now){const i=document.getElementById('qb-insights-date');if(i)i.addEventListener('change',()=>{if(/^\d{4}-\d{2}-\d{2}$/.test(i.value)){S.insightsDay=i.value;rerender(true)}});const b=document.getElementById('qb-insights-today');if(b)b.addEventListener('click',()=>{S.insightsDay=now();rerender(true)})}
  window.QBInsights={analyze,trend,advice,compact,render,wire};
})();
