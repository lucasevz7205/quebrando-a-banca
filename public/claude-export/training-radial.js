/* Quebrando a Banca | Treinar: menu radial por matéria > assunto.
 * Conserva o modelo de dados, os IDs do edital e a correção CEBRASPE.
 * Apenas interface de seleção, sem duplicação ou mutação de questões.
 */
(function(root){
"use strict";
const PAGE_SIZE=6;
const PALETTE=["#ff9571","#d998ff","#8da2ff","#49d7fb","#44c5ff","#b4a2ff"];
const SHORT={CP:"Ciência Política",DA:"Administrativo",DC:"Constitucional",JUR:"Jurisprudência",LG:"Linguística",LI:"Inglês",LP:"Português",PL:"Processo Legislativo",RF:"Fala e IA",TI:"TI e Dados"};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const str=v=>String(v??"").trim();
const value=map=>map&&typeof map.values==="function"?[...map.values()]:[];
const unique=items=>[...new Set(items.filter(Boolean))];
const empty=()=>({total:0,respondidas:0,acertos:0,erros:0,brancos:0,pendentes:0});
/* Mesma regra do percentual consolidado de Desempenho/Histórico:
 * já errou OU deixou em branco alguma vez = não é acerto consolidado,
 * ainda que a última resposta seja C. A regra é propositalmente distinta
 * da precisão por tentativa na Análise diária. SIM e foraNivel não entram.
 */
const eligible=q=>!!q&&!/^SIM/i.test(str(q.cap))&&!q.foraNivel;
const everWrong=r=>Number(r?.erros||0)>0||Number(r?.brancos||0)>0||
  (r?.hist||[]).some(h=>!h?.ok);
function summary(ids,questions,responses){
  const result=empty(),distinct=unique(ids);
  for(const id of distinct){
    const q=questions?.get(id),resp=responses?.get(id);
    if(!eligible(q))continue;
    result.total++;
    if(!resp?.tentativas)continue;
    result.respondidas++;
    const last=str(resp.ultimaMarcada||[...(resp.hist||[])].reverse().find(e=>["C","E","B"].includes(e.m))?.m);
    if(last==="B")result.brancos++;
    else if(last===q.gabarito&&!everWrong(resp))result.acertos++;
    else result.erros++;
  }
  result.pendentes=Math.max(0,result.total-result.respondidas);
  return result;
}
function build({questions,topics,responses,index}){
  const byMatter=new Map();
  const courseTopics=value(topics).filter(t=>t?.id&&t.sigla).sort((a,b)=>(a.materiaOrdem??999)-(b.materiaOrdem??999)||(a.ordem??9999)-(b.ordem??9999));
  const assigned=new Set(),chapterOwner=new Map();
  // Mesmo critério de topicoDoCap() no Histórico: menor ordem do edital.
  for(const t of courseTopics.slice().sort((a,b)=>(a.ordem||0)-(b.ordem||0)))for(const cap of t.caps||[])if(!chapterOwner.has(cap))chapterOwner.set(cap,t.sigla);
  for(const t of courseTopics){
    if(!byMatter.has(t.sigla))byMatter.set(t.sigla,{
      id:t.sigla,name:t.materia||t.sigla,short:SHORT[t.sigla]||t.materia||t.sigla,
      prova:t.prova||"",ordem:t.materiaOrdem??999,topics:[]
    });
    const fromIndex=(index?.byTopic?.get(t.id)||[]).map(q=>q.id);
    const fromExplicit=value(questions).filter(q=>q.topico===t.id).map(q=>q.id);
    const ids=unique([...fromIndex,...fromExplicit]).filter(id=>questions?.has(id));
    ids.forEach(id=>assigned.add(id));
    const historicIds=value(questions).filter(q=>(t.caps||[]).includes(q.cap)).map(q=>q.id);
    byMatter.get(t.sigla).topics.push({
      id:t.id,title:t.titulo||t.id,num:t.num||"",sigla:t.sigla,
      caption:t.titulo||t.id,questionIds:ids,statIds:historicIds,
      stats:summary(historicIds,questions,responses),
      ordem:t.ordem??9999
    });
  }
  // Questions whose original chapters are not present in the edital stay
  // accessible, but are clearly labelled as unclassified rather than forced
  // into an unrelated discipline.
  const orphan=value(questions).filter(q=>q?.id&&!assigned.has(q.id));
  if(orphan.length){
    const subject=byMatter.get("_outros")||{
      id:"_outros",name:"Outros capítulos",short:"Outros capítulos",
      prova:"",ordem:9999,topics:[]
    };
    const byCap=new Map();
    for(const q of orphan){
      const cap=str(q.cap)||"sem-capitulo";
      if(!byCap.has(cap))byCap.set(cap,[]);
      byCap.get(cap).push(q);
    }
    for(const [cap,qs] of byCap){
      const ids=qs.map(q=>q.id);
      subject.topics.push({
        id:"cap:"+cap,title:qs[0].capNome||cap,num:cap,
        caption:qs[0].capNome||cap,sigla:"_outros",
        questionIds:ids,statIds:ids,stats:summary(ids,questions,responses),ordem:9999
      });
    }
    byMatter.set("_outros",subject);
  }
  const matters=[...byMatter.values()].sort((a,b)=>a.ordem-b.ordem||a.name.localeCompare(b.name,"pt-BR"));
  for(const mat of matters){
    mat.topics.sort((a,b)=>a.ordem-b.ordem||String(a.num).localeCompare(String(b.num),"pt-BR",{numeric:true}));
    mat.questionIds=unique(mat.topics.flatMap(t=>t.questionIds));
    const byHistoricalCap=value(questions).filter(q=>(mat.id==="_outros"?
      !chapterOwner.has(q.cap):chapterOwner.get(q.cap)===mat.id)).map(q=>q.id);
    mat.statIds=unique(byHistoricalCap);
    mat.stats=summary(mat.statIds,questions,responses);
    mat.available=mat.topics.filter(t=>t.questionIds.length).length;
  }
  return {matters,stats:summary([...(questions?.keys?.()||[])],questions,responses),totalQuestions:questions?.size||0};
}
function percentages(s){
  const total=Math.max(0,Number(s?.respondidas)||0);
  const fraction=x=>total?Math.max(0,Math.min(100,100*(Number(x)||0)/total)):0;
  return {acertos:fraction(s?.acertos),erros:fraction(s?.erros),brancos:fraction(s?.brancos)};
}
function point(radius,angle){
  const rad=(angle-90)*Math.PI/180;
  return {x:500+Math.cos(rad)*radius,y:500+Math.sin(rad)*radius};
}
function arc(radius,start,end){
  const a=point(radius,start),b=point(radius,end);
  return "M"+a.x.toFixed(2)+" "+a.y.toFixed(2)+" A"+radius+" "+radius+" 0 "+(end-start>180?1:0)+" 1 "+b.x.toFixed(2)+" "+b.y.toFixed(2);
}
function render(model,selection={}){
  const selected=model?.matters?.find(m=>m.id===selection.matter)||null;
  const matterMode=!selected;
  // The training ring must not bury real practice under pages of empty topics.
  // The full edital remains available in the Edital tab, without hiding data.
  const items=matterMode?model?.matters||[]:selected.topics.filter(t=>t.questionIds.length);
  const withoutQuestions=selected?selected.topics.length-items.length:0;
  const totalPages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
  const page=Math.max(0,Math.min(totalPages-1,Math.floor(Number(selection.page)||0)));
  const visible=items.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const baseline=selected?.stats||model?.stats||empty();
  const pct=percentages(baseline);
  const statsText=esc(JSON.stringify(baseline));
  const short=selected?selected.short:"Todas as matérias";
  const intro=matterMode?"Selecione a matéria":"Selecione o assunto";
  const metrics=(s,p)=>'<span class="qb-train-bar-segment qb-train-bar-correct" style="width:'+p.acertos.toFixed(2)+'%" aria-hidden="true"></span>'
    +'<span class="qb-train-bar-segment qb-train-bar-wrong" style="width:'+p.erros.toFixed(2)+'%" aria-hidden="true"></span>'
    +'<span class="qb-train-bar-segment qb-train-bar-blank" style="width:'+p.brancos.toFixed(2)+'%" aria-hidden="true"></span>';
  const sectors=[],nodes=[];
  const n=visible.length;
  for(let i=0;i<n;i++){
    const entry=visible[i],position=i*360/Math.max(1,n);
    const angle=(position-90)*Math.PI/180;
    const x=50+37*Math.cos(angle),y=50+37*Math.sin(angle);
    const color=PALETTE[i%PALETTE.length];
    const start=position-360/Math.max(n,1)*.47,end=position+360/Math.max(n,1)*.47;
    const title=matterMode?entry.name:entry.title;
    const label=matterMode?entry.short:entry.title;
    const available=entry.questionIds.length>0;
    const count=entry.stats.total;
    const caption=matterMode?entry.available+" assuntos · "+count+" questões":(entry.num?"Edital "+entry.num+" · ":"")+count+" questões";
    sectors.push('<path class="qb-radial-sector" data-ring-sector="'+i+'" style="--index:'+i+';--sector-color:'+color+'" d="'+arc(368,start,end)+'"/>');
    nodes.push('<button type="button" class="qb-radial-node qb-train-node"'
      +(matterMode?' data-train-matter="'+esc(entry.id)+'"':' data-train-topic="'+esc(entry.id)+'"')
      +' data-radial-index="'+i+'" data-train-name="'+esc(title)+'"'
      +' data-train-stats="'+esc(JSON.stringify(entry.stats))+'"'
      +' style="--node-x:'+x.toFixed(3)+'%;--node-y:'+y.toFixed(3)+'%;--index:'+i+';--sector-color:'+color+'"'
      +' title="'+esc(title+' · '+count+' questões; '+entry.stats.respondidas+' respondidas')+'"'
      +' aria-label="'+esc(title+'; '+count+' questões; '+entry.stats.acertos+' acertos e '+entry.stats.erros+' erros')+'"'
      +(!available?' disabled aria-disabled="true"':'')+'>'
      +'<span class="qb-radial-node-icon" aria-hidden="true">'+(matterMode?'◉':'◇')+'</span>'
      +'<span class="qb-radial-node-label">'+esc(label)+'</span>'
      +'<span class="qb-radial-node-caption">'+esc(caption)+'</span></button>');
  }
  const links=visible.map((_,i)=>{
    const a=i*360/Math.max(n,1),step=360/Math.max(n,1);
    return '<path class="qb-radial-link" style="--index:'+i+'" d="'+arc(368,a-step*.48,a+step*.48)+'"/>';
  }).join("");
  const pages='<nav class="qb-train-pagination" aria-label="Páginas de '+(matterMode?'matérias':'assuntos')+'">'
      +'<button type="button" data-train-page="'+(page-1)+'" '+(page===0?'disabled':'')+' aria-label="Página anterior">← Anterior</button>'
      +'<span>Página '+(page+1)+' de '+totalPages+' · '+items.length+' '+(matterMode?'matérias':'assuntos')+'</span>'
      +'<button type="button" data-train-page="'+(page+1)+'" '+(page===totalPages-1?'disabled':'')+' aria-label="Próxima página">Próxima →</button></nav>';
  return '<section class="qb-radial-hub qb-train-hub" data-train-screen="'+(matterMode?'subjects':'topics')+'"'
    +' data-radial-screen="'+(matterMode?'train-mat':'train-topic:'+esc(selected.id))+'"'
    +' data-train-default="'+statsText+'" data-train-default-title="'+esc(short)+'"'
    +' aria-label="Treinar por '+(matterMode?'matéria':'assunto')+'">'
    +'<div class="qb-radial-topline qb-train-head"><div><span class="qb-radial-overline">AXON · PRÁTICA CEBRASPE</span>'
    +'<h2 class="qb-radial-screen-title" tabindex="-1">'+(matterMode?'Treinar por matéria':esc(selected.name))+'</h2>'
    +'<p class="qb-train-head-description">'+esc(intro)+' · '+(matterMode?'depois escolha o assunto':'escolha um assunto para configurar a rodada')+'</p></div>'
    +'<div class="qb-train-head-actions">'
    +(selected?'<button type="button" class="qb-radial-return-top" data-train-back>← Matérias</button>':'')
    +'<button type="button" class="qb-train-classic" data-train-classic>Treino clássico por capítulo</button>'
    +'</div></div>'
    +(selected?'<div class="qb-train-quick-jump"><label for="qb-train-topic-jump">Ir direto ao assunto</label>'
      +'<select id="qb-train-topic-jump" data-train-topic-select><option value="">Selecione…</option>'
      +items.map(t=>'<option value="'+esc(t.id)+'">'+esc((t.num?t.num+' · ':'')+t.title)+' ('+t.stats.total+')</option>').join("")
      +'</select></div>':'')
    +'<div class="qb-radial-stage qb-train-stage" data-radial-stage>'
    +'<div class="qb-radial-annulus" aria-hidden="true"><div class="qb-radial-annulus-light"></div><div class="qb-radial-annulus-texture"></div><div class="qb-radial-annulus-filaments"></div></div>'
    +'<svg class="qb-radial-network" viewBox="0 0 1000 1000" aria-hidden="true">'
    +'<circle cx="500" cy="500" r="368" class="qb-radial-orbit"/><circle cx="500" cy="500" r="251" class="qb-radial-orbit qb-radial-orbit-inner"/>'
    +sectors.join("")+links+'</svg>'
    +'<canvas class="qb-radial-flow" data-radial-flow aria-hidden="true"></canvas>'
    +'<div class="qb-radial-aura" aria-hidden="true"></div>'
    +'<div class="qb-radial-core qb-train-core" data-train-core role="group" aria-label="Desempenho da última resposta por questão">'
    +'<span class="qb-train-core-eyebrow">SEU DESEMPENHO</span>'
    +'<strong data-train-core-title>'+esc(short)+'</strong>'
    +'<span class="qb-train-core-percent" data-train-percent>'+(baseline.respondidas?Math.round(pct.acertos)+'%':'–')+'</span>'
    +'<span class="qb-train-core-caption">acertos consolidados</span>'
    +'<div class="qb-train-core-bar" data-train-bar role="img" aria-label="'+esc(baseline.acertos+' acertos, '+baseline.erros+' erros e '+baseline.brancos+' em branco, em '+baseline.respondidas+' questões respondidas')+'">'
      +metrics(baseline,pct)+'</div>'
    +'<div class="qb-train-core-stats"><span class="qb-train-score-ok" data-train-ok>'+baseline.acertos+' acertos</span>'
    +'<span class="qb-train-score-err" data-train-error>'+baseline.erros+' erros</span>'
    +'<span class="qb-train-score-blank" data-train-blank>'+baseline.brancos+' brancos</span></div>'
    +'<small data-train-coverage>'+baseline.respondidas+' de '+baseline.total+' respondidas</small>'
    +'</div>'+nodes.join("")
    +'<canvas class="qb-radial-particles" data-radial-particles aria-hidden="true" hidden></canvas>'
    +'</div>'
    +pages
    +'<nav class="qb-train-shortcuts" aria-label="Outras formas de treinar">'
    +'<button type="button" data-train-review>Revisões vencidas</button>'
    +'<button type="button" data-train-errors>Caderno de erros</button>'
    +'</nav>'
    +'<p class="qb-train-bottom-note">Passe o cursor ou use as setas para ver o desempenho de cada '+(matterMode?'matéria':'assunto')
    +' no centro. Regra de Desempenho histórico: um erro ou branco anterior impede contar o item como acerto consolidado, mesmo após acertá-lo. SIM e fora do nível não entram.'
    +(withoutQuestions?' '+withoutQuestions+' assuntos do edital ainda não têm questões neste banco e não aparecem no círculo.':'')
    +'</p></section>';
}
function wire(container,handlers={}){
  const section=container?.querySelector(".qb-train-hub");
  if(!section)return ()=>{};
  const flow=root.QBAxonRingFlow?.mount(section);
  let moving=false;
  const nodes=[...section.querySelectorAll(".qb-train-node")];
  const sectors=[...section.querySelectorAll(".qb-radial-sector")];
  const usable=nodes.filter(n=>!n.disabled);
  const defaultStats=JSON.parse(section.dataset.trainDefault||"{}");
  const defaultTitle=section.dataset.trainDefaultTitle;
  function nodeFrom(target){
    const node=target?.closest?.(".qb-train-node");
    if(node)return node;
    const sector=target?.closest?.("[data-ring-sector]");
    if(!sector)return null;
    return nodes[Number(sector.dataset.ringSector)]||null;
  }
  function present(stats,title){
    const count=Math.max(0,Number(stats.respondidas)||0);
    const pct=percentages(stats);
    const fill=selector=>section.querySelector(selector);
    const label=fill("[data-train-core-title]");
    if(label)label.textContent=title||defaultTitle;
    const percent=fill("[data-train-percent]");
    if(percent)percent.textContent=count?Math.round(pct.acertos)+"%":"–";
    const widths=[pct.acertos,pct.erros,pct.brancos];
    [...section.querySelectorAll(".qb-train-bar-segment")].forEach((el,i)=>{el.style.width=widths[i].toFixed(2)+"%"});
    const bar=fill("[data-train-bar]");
    if(bar)bar.setAttribute("aria-label",stats.acertos+" acertos, "+stats.erros+" erros e "+stats.brancos+" em branco, em "+count+" respondidas");
    const ok=fill("[data-train-ok]"),error=fill("[data-train-error]"),blank=fill("[data-train-blank]"),coverage=fill("[data-train-coverage]");
    if(ok)ok.textContent=stats.acertos+" acertos";
    if(error)error.textContent=stats.erros+" erros";
    if(blank)blank.textContent=stats.brancos+" brancos";
    if(coverage)coverage.textContent=count+" de "+stats.total+" respondidas";
  }
  function highlight(node){
    const index=node&&!node.disabled?Number(node.dataset.radialIndex):-1;
    nodes.forEach(n=>n.classList.toggle("is-focused",Number(n.dataset.radialIndex)===index));
    sectors.forEach(s=>s.classList.toggle("is-focused",Number(s.dataset.ringSector)===index));
    flow?.focus?.(index);
    if(index<0)present(defaultStats,defaultTitle);
    else {
      try{present(JSON.parse(node.dataset.trainStats),node.dataset.trainName)}catch{present(defaultStats,defaultTitle)}
    }
  }
  function transition(node,callback){
    if(moving||!node||node.disabled)return;
    moving=true;
    highlight(node);
    const proceed=()=>{flow?.dispose?.();callback();};
    if(flow?.select)flow.select(node,proceed);
    else proceed();
  }
  section.addEventListener("pointerover",e=>highlight(nodeFrom(e.target)));
  section.addEventListener("pointerout",e=>{
    const node=nodeFrom(e.target);
    if(node&&!node.contains(e.relatedTarget))highlight(nodeFrom(e.relatedTarget));
  });
  section.addEventListener("focusin",e=>highlight(nodeFrom(e.target)));
  section.addEventListener("focusout",e=>{
    if(!section.contains(e.relatedTarget))highlight(null);
  });
  section.addEventListener("keydown",e=>{
    if(moving)return;
    if(e.key==="Escape"&&section.dataset.trainScreen==="topics"){
      e.preventDefault();handlers.onBack?.();return;
    }
    if(["ArrowRight","ArrowDown","ArrowLeft","ArrowUp"].includes(e.key) && usable.length){
      if(e.target.closest?.("select"))return;
      e.preventDefault();
      const current=usable.indexOf(nodeFrom(e.target));
      const d=["ArrowRight","ArrowDown"].includes(e.key)?1:-1;
      const index=current<0?0:(current+d+usable.length)%usable.length;
      usable[index].focus();highlight(usable[index]);
    }
  });
  section.addEventListener("change",e=>{
    const select=e.target.closest?.("[data-train-topic-select]");
    if(select?.value)handlers.onTopic?.(select.value);
  });
  section.addEventListener("click",e=>{
    const action=e.target.closest?.("[data-train-page],[data-train-classic],[data-train-back],[data-train-matter],[data-train-topic],[data-train-review],[data-train-errors]")
      ||nodeFrom(e.target);
    if(!action||action.disabled||!section.contains(action)||moving)return;
    if(action.hasAttribute("data-train-page"))handlers.onPage?.(Number(action.dataset.trainPage));
    else if(action.hasAttribute("data-train-back"))handlers.onBack?.();
    else if(action.hasAttribute("data-train-classic"))handlers.onClassic?.();
    else if(action.hasAttribute("data-train-review"))handlers.onReview?.();
    else if(action.hasAttribute("data-train-errors"))handlers.onErrors?.();
    else if(action.hasAttribute("data-train-matter"))transition(action,()=>handlers.onMatter?.(action.dataset.trainMatter));
    else if(action.hasAttribute("data-train-topic"))transition(action,()=>handlers.onTopic?.(action.dataset.trainTopic));
  });
  return ()=>flow?.dispose?.();
}
root.QBTrainingRadial={build,summary,percentages,render,wire,pageSize:PAGE_SIZE};
if(typeof module!=="undefined"&&module.exports)module.exports=root.QBTrainingRadial;
})(typeof window!=="undefined"?window:globalThis);
