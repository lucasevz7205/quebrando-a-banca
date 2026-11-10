/* AXON unified radial shell for Hoje, Edital, Estudo, Simulado and Desempenho.
 * Does NOT replace data screens. The caller supplies real existing destinations.
 * The same living annulus and AXON particle transitions used by Treinar are reused.
 */
(function(root){
"use strict";
const PALETTE=["#ff9571","#d998ff","#8da2ff","#49d7fb","#44c5ff","#b4a2ff"];
const PER_PAGE=6;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function point(deg){
 const t=(deg-90)*Math.PI/180;
 return {x:50+Math.cos(t)*37,y:50+Math.sin(t)*37};
}
function arc(degStart,degEnd){
 const coord=deg=>{const p=point(deg);return {x:p.x*10,y:p.y*10}};
 const a=coord(degStart),b=coord(degEnd);
 return "M"+a.x.toFixed(2)+" "+a.y.toFixed(2)+" A370 370 0 0 1 "+b.x.toFixed(2)+" "+b.y.toFixed(2);
}
function rate(stats){
 if(!stats||!stats.respondidas)return null;
 return Math.round(100*stats.acertos/stats.respondidas);
}
function fractions(s){
 const d=s?.respondidas||0;
 return d?[(s.acertos||0)*100/d,(s.erros||0)*100/d,(s.brancos||0)*100/d]:[0,0,0];
}
function bar(s){
 const f=fractions(s);
 return '<div class="qb-train-core-bar" data-area-bar role="img" aria-label="'+esc((s?.acertos||0)+' acertos consolidados, '+(s?.erros||0)+' erros, '+(s?.brancos||0)+' em branco')+'">'
   +f.map((n,i)=>'<span class="qb-train-bar-segment '+["qb-train-bar-correct","qb-train-bar-wrong","qb-train-bar-blank"][i]+'" style="width:'+n.toFixed(2)+'%"></span>').join("")
   +'</div>';
}
function render(config){
 const items=config.items||[],pageCount=Math.max(1,Math.ceil(items.length/PER_PAGE));
 const page=clamp(Math.floor(Number(config.page)||0),0,pageCount-1);
 const selected=items.slice(page*PER_PAGE,(page+1)*PER_PAGE);
 const count=selected.length;
 const stats=config.stats||null;
 const sector=[],nodes=[],arcs=[];
 for(let i=0;i<count;i++){
   const item=selected[i],p=point(i*360/count),tone=PALETTE[i%PALETTE.length];
   const step=360/count;
   sector.push('<path class="qb-radial-sector" data-ring-sector="'+i+'" style="--sector-color:'+tone+'" d="'+arc(i*step-step*.47,i*step+step*.47)+'"/>');
   arcs.push('<path class="qb-radial-link" style="--index:'+i+'" d="'+arc(i*step-step*.48,i*step+step*.48)+'"/>');
   nodes.push('<button type="button" class="qb-radial-node qb-area-node" data-area-item="'+esc(item.id)+'" data-radial-index="'+i+'"'
     +(item.stats?' data-area-stats="'+esc(JSON.stringify(item.stats))+'"':'')
     +' data-area-name="'+esc(item.name)+'" aria-label="'+esc(item.name+(item.caption?' · '+item.caption:''))+'"'
     +' style="--node-x:'+p.x.toFixed(3)+'%;--node-y:'+p.y.toFixed(3)+'%;--index:'+i+';--sector-color:'+tone+'"'
     +(item.disabled?' disabled aria-disabled="true"':'')+'>'
     +'<span class="qb-radial-node-icon" aria-hidden="true">'+esc(item.icon||"◇")+'</span>'
     +'<span class="qb-radial-node-label">'+esc(item.name)+'</span>'
     +'<span class="qb-radial-node-caption">'+esc(item.caption||"")+'</span></button>');
 }
 return '<section class="qb-radial-hub qb-area-hub" data-radial-screen="'+esc(config.area+":"+(config.level||"main"))+'"'
   +' aria-label="'+esc(config.title||"Navegação")+'">'
   +'<header class="qb-radial-topline qb-area-heading"><div><span class="qb-radial-overline">AXON · '+esc(config.kicker||"NAVEGAÇÃO")+'</span>'
   +'<h2 class="qb-radial-screen-title" tabindex="-1">'+esc(config.title||"Escolha uma opção")+'</h2>'
   +'<p class="qb-area-intro">'+esc(config.subtitle||"Explore as opções disponíveis.")+'</p></div>'
   +'<div class="qb-area-actions">'
   +(config.parent?'<button type="button" class="qb-radial-return-top" data-area-back>← Voltar</button>':'')
   +'<button type="button" class="qb-train-classic" data-area-original>'+esc(config.originalLabel||"Abrir tela completa")+'</button>'
   +'</div></header>'
   +(config.quickSelect?'<div class="qb-train-quick-jump"><label for="qb-area-select">Acesso direto</label>'
     +'<select id="qb-area-select" data-area-select><option value="">Selecione…</option>'
     +items.map(item=>'<option value="'+esc(item.id)+'" '+(item.disabled?'disabled':'')+'>'+esc(item.name)+'</option>').join("")
     +'</select></div>':'')
   +'<div class="qb-radial-stage qb-area-stage" data-radial-stage>'
   +'<div class="qb-radial-annulus" aria-hidden="true"><div class="qb-radial-annulus-light"></div><div class="qb-radial-annulus-texture"></div><div class="qb-radial-annulus-filaments"></div></div>'
   +'<svg class="qb-radial-network" viewBox="0 0 1000 1000" aria-hidden="true">'
   +'<circle cx="500" cy="500" r="368" class="qb-radial-orbit"/><circle cx="500" cy="500" r="251" class="qb-radial-orbit qb-radial-orbit-inner"/>'
   +sector.join("")+arcs.join("")+'</svg>'
   +'<canvas class="qb-radial-flow" data-radial-flow aria-hidden="true"></canvas><div class="qb-radial-aura" aria-hidden="true"></div>'
   +'<div class="qb-radial-core qb-area-core" role="group" aria-label="Resumo da área" data-area-core>'
   +'<span class="qb-train-core-eyebrow">'+esc(config.centerEyebrow||"QUEBRANDO A BANCA")+'</span>'
   +'<strong data-area-title>'+esc(config.centerTitle||config.title)+'</strong>'
   +(stats?'<span class="qb-train-core-percent" data-area-percent>'+(rate(stats)===null?'–':rate(stats)+'%')+'</span>'
     +'<span class="qb-train-core-caption">acertos consolidados</span>'
     +bar(stats)
     +'<div class="qb-train-core-stats"><span class="qb-train-score-ok" data-area-correct>'+stats.acertos+' acertos</span>'
     +'<span class="qb-train-score-err" data-area-wrong>'+stats.erros+' erros</span></div>'
     +'<small data-area-coverage>'+stats.respondidas+' de '+stats.total+' respondidas</small>'
     :'<span class="qb-area-core-caption">'+esc(config.centerCaption||"Escolha uma opção do anel")+'</span>')
   +'</div>'+nodes.join("")
   +'<canvas class="qb-radial-particles" data-radial-particles aria-hidden="true" hidden></canvas></div>'
   +'<nav class="qb-train-pagination" aria-label="Páginas do menu">'
   +'<button type="button" data-area-page="'+(page-1)+'" '+(page<=0?'disabled':'')+'>← Anterior</button>'
   +'<span>Página '+(page+1)+' de '+pageCount+' · '+items.length+' opções</span>'
   +'<button type="button" data-area-page="'+(page+1)+'" '+(page===pageCount-1?'disabled':'')+'>Próxima →</button></nav>'
   +'<div class="qb-area-footer">'+esc(config.footer||"Passe o cursor sobre um setor para explorar. Os menus superiores e as telas originais permanecem disponíveis.")+'</div>'
   +'</section>';
}
function wire(container,config,handlers={}){
 const section=container?.querySelector(".qb-area-hub");
 if(!section)return ()=>{};
 const ring=root.QBAxonRingFlow?.mount(section);
 const nodes=[...section.querySelectorAll(".qb-area-node")];
 const sectors=[...section.querySelectorAll(".qb-radial-sector")];
 const enabled=nodes.filter(n=>!n.disabled);
 const control={busy:false},itemById=new Map((config.items||[]).map(i=>[i.id,i]));
 const originalTitle=section.querySelector("[data-area-title]")?.textContent;
 const core=section.querySelector("[data-area-core]");
 const originalStats=config.stats||null;
 const nodeFrom=t=>{
   const node=t?.closest?.(".qb-area-node");
   if(node)return node;
   const seg=t?.closest?.("[data-ring-sector]");
   return seg?nodes[Number(seg.dataset.ringSector)]||null:null;
 };
 function show(stats,title){
   const name=section.querySelector("[data-area-title]");
   if(name)name.textContent=title||originalTitle;
   if(!originalStats)return;
   const s=stats||originalStats,p=rate(s);
   const pct=section.querySelector("[data-area-percent]");
   if(pct)pct.textContent=p===null?"–":p+"%";
   const parts=fractions(s);
   section.querySelectorAll(".qb-train-bar-segment").forEach((el,i)=>el.style.width=parts[i].toFixed(2)+"%");
   const correct=section.querySelector("[data-area-correct]"),wrong=section.querySelector("[data-area-wrong]"),coverage=section.querySelector("[data-area-coverage]");
   if(correct)correct.textContent=s.acertos+" acertos";
   if(wrong)wrong.textContent=s.erros+" erros";
   if(coverage)coverage.textContent=s.respondidas+" de "+s.total+" respondidas";
   section.querySelector("[data-area-bar]")?.setAttribute("aria-label",s.acertos+" acertos consolidados, "+s.erros+" erros e "+s.brancos+" brancos");
 }
 function focus(node){
   const i=node&&!node.disabled?Number(node.dataset.radialIndex):-1;
   nodes.forEach((n,j)=>n.classList.toggle("is-focused",j===i));
   sectors.forEach((n,j)=>n.classList.toggle("is-focused",j===i));
   ring?.focus?.(i);
   const item=node?itemById.get(node.dataset.areaItem):null;
   show(item?.stats,item?.name);
 }
 function navigate(node){
   if(!node||node.disabled||control.busy)return;
   const id=node.dataset.areaItem;
   const item=itemById.get(id);
   if(!item||item.disabled)return;
   control.busy=true;focus(node);
   const go=()=>{ring?.dispose?.();handlers.onSelect?.(item)};
   if(ring?.select)ring.select(node,go);
   else go();
 }
 section.addEventListener("pointerover",e=>focus(nodeFrom(e.target)));
 section.addEventListener("pointerout",e=>{
   const prev=nodeFrom(e.target);
   if(prev&&!prev.contains(e.relatedTarget))focus(nodeFrom(e.relatedTarget));
 });
 section.addEventListener("focusin",e=>focus(nodeFrom(e.target)));
 section.addEventListener("focusout",e=>{
   if(!section.contains(e.relatedTarget))focus(null);
 });
 section.addEventListener("keydown",e=>{
   if(control.busy)return;
   if(e.key==="Escape"&&config.parent){e.preventDefault();handlers.onBack?.();return;}
   if(["ArrowRight","ArrowDown","ArrowLeft","ArrowUp"].includes(e.key)&&!e.target.closest?.("select")&&enabled.length){
     e.preventDefault();
     const current=enabled.indexOf(nodeFrom(e.target)),delta=["ArrowRight","ArrowDown"].includes(e.key)?1:-1;
     const next=current<0?0:(current+delta+enabled.length)%enabled.length;
     enabled[next].focus();focus(enabled[next]);
   }
 });
 section.addEventListener("change",e=>{
   if(e.target.matches?.("[data-area-select]")&&e.target.value){
     const item=itemById.get(e.target.value);
     if(item&&!item.disabled)handlers.onSelect?.(item);
   }
 });
 section.addEventListener("click",e=>{
   const action=e.target.closest?.("[data-area-page],[data-area-back],[data-area-original],[data-area-item]")||nodeFrom(e.target);
   if(!action||!section.contains(action)||control.busy)return;
   if(action.hasAttribute("data-area-page"))handlers.onPage?.(Number(action.dataset.areaPage));
   else if(action.hasAttribute("data-area-back"))handlers.onBack?.();
   else if(action.hasAttribute("data-area-original"))handlers.onOriginal?.();
   else if(action.hasAttribute("data-area-item"))navigate(action);
 });
 return ()=>ring?.dispose?.();
}
root.QBAreaRadial={render,wire,rate,fractions,pageSize:PER_PAGE};
if(typeof module!=="undefined"&&module.exports)module.exports=root.QBAreaRadial;
})(typeof window!=="undefined"?window:globalThis);
