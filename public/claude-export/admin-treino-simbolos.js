/* QB · Treinar: ícone individual por matéria e sigla responsiva.
 * A UI é apenas decorativa: os botões nativos continuam com seus próprios
 * eventos, códigos de matéria, navegação e atributos de acessibilidade.
 */
(function(){
  "use strict";
  const PATHS=Object.freeze({
    CP:'<path d="M12 2.5v4M10 4.5h4M9.5 12.5c-1.6-1-2.2-2.3-2.2-3.6A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 4.7 2.4c0 1.3-.6 2.6-2.2 3.6M9 21l.9-8.5h4.2L15 21M7 21h10"/>',
    DA:'<path d="M9 3h6v4H9zM12 7v3M5 10h14M5 10v3M19 10v3M3 13h4v4H3zM17 13h4v4h-4zM10 13h4v4h-4zM12 10v3"/>',
    DC:'<path d="M3 9l9-5 9 5zM6 9v9M10 9v9M14 9v9M18 9v9M3 20h18"/>',
    JUR:'<path d="M12 4v16M7 20h10M5 8h14M5 8l-3 6h6zM19 8l-3 6h6zM2 14a3 2 0 0 0 6 0M16 14a3 2 0 0 0 6 0"/>',
    LG:'<path d="M4 5h16v11H11l-4 4v-4H4zM8 9h8M8 12.5h5"/>',
    LI:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    LP:'<path d="M20 4C11 4 6 9 6 16l-2 4M6 16c6 0 11-4 14-12M9.5 14.5l6-6"/>',
    PL:'<path d="M3 18a9 9 0 0 1 18 0M7 18a5 5 0 0 1 10 0M2 21h20M12 9v3"/>',
    RF:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    TI:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>'
  });
  const SELECTED=":hover,:focus-visible,.is-focused,.qb-astro-selected";
  let measure=null;
  let scanQueued=false;
  function isAdmin(){
    return document.documentElement.classList.contains("qb-admin-experience");
  }
  function normalWidth(node){
    const stage=node.closest("[data-radial-stage]");
    const available=stage?.clientWidth||560;
    const reference=[...(node.closest(".qb-train-hub")?.querySelectorAll(".qb-train-node")||[])]
      .find(item=>item!==node&&!item.matches(SELECTED));
    if(reference&&reference.clientWidth)return reference.clientWidth;
    if(window.matchMedia("(max-width:500px)").matches)return Math.max(64,Math.min(107,available*.235));
    return Math.max(92,Math.min(152,available*.205));
  }
  function fits(short,label,node){
    if(!short||!label)return true;
    const canvas=measure||(measure=document.createElement("canvas").getContext("2d"));
    if(!canvas)return short.length<10;
    const cs=getComputedStyle(label);
    const fontSize=Math.max(11,parseFloat(cs.fontSize)||12);
    canvas.font=(cs.fontStyle||"normal")+" "+(cs.fontWeight||"700")+" "+fontSize+"px "+(cs.fontFamily||"system-ui");
    const width=normalWidth(node);
    const ns=getComputedStyle(node);
    const inner=Math.max(36,width*.80-(parseFloat(ns.paddingLeft)||0)-(parseFloat(ns.paddingRight)||0));
    const gap=canvas.measureText(" ").width;
    let lines=1,used=0;
    for(const word of short.split(/\s+/)){
      const wordWidth=canvas.measureText(word).width*1.08;
      if(wordWidth>inner)return false;
      const next=used===0?wordWidth:used+gap+wordWidth;
      if(next>inner){lines++;used=wordWidth;}else used=next;
    }
    return lines<=2;
  }
  function decorate(node){
    const id=node.dataset.trainMatter;
    if(!Object.prototype.hasOwnProperty.call(PATHS,id))return;
    const icon=node.querySelector(".qb-radial-node-icon");
    const label=node.querySelector(".qb-radial-node-label");
    if(!icon||!label)return;
    if(!node.dataset.qbSym){
      node.dataset.qbSym=id;
      node.dataset.qbShort=label.textContent.trim();
      label.dataset.qbFull=node.dataset.trainName||node.dataset.qbShort;
      icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+PATHS[id]+'</svg>';
    }
    // Não modificar os atributos de classe nem o nome real da matéria.
    // Siglas somente quando a largura do compartimento não comporta o resumo.
    const isAbbrev=!fits(node.dataset.qbShort,label,node);
    const target=isAbbrev?id:node.dataset.qbShort;
    if(label.textContent!==target)label.textContent=target;
    node.toggleAttribute("data-qb-sigla-on",isAbbrev);
  }
  function adjust(hub){
    const stage=hub.querySelector("[data-radial-stage]");
    if(!stage?.isConnected)return;
    const bounds=stage.getBoundingClientRect();
    hub.querySelectorAll(".qb-train-node[data-qb-sym]").forEach(node=>{
      const cur=parseFloat(node.style.getPropertyValue("--qb-shift"))||0;
      if(node.disabled||!node.matches(SELECTED)){
        if(cur!==0)node.style.removeProperty("--qb-shift");
        return;
      }
      const rect=node.getBoundingClientRect();
      const left=rect.left-cur,right=rect.right-cur,edge=4;
      const dx=left<bounds.left+edge?bounds.left+edge-left:right>bounds.right-edge?bounds.right-edge-right:0;
      if(Math.abs(dx-cur)>.5)node.style.setProperty("--qb-shift",dx.toFixed(1)+"px");
    });
  }
  function mount(hub){
    if(hub.dataset.trainScreen!=="subjects")return;
    const nodes=[...hub.querySelectorAll(".qb-train-node[data-train-matter]")];
    if(!nodes.length)return;
    nodes.forEach(decorate);
    if(hub.dataset.qbSymReady==="1")return;
    hub.dataset.qbSymReady="1";
    let queued=false,settle=null;
    const redraw=()=>{
      if(!hub.isConnected||queued)return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;adjust(hub);});
      if(settle)clearTimeout(settle);
      settle=setTimeout(()=>{if(hub.isConnected)adjust(hub);},330);
    };
    ["pointerover","pointerout","focusin","focusout","pointerdown"].forEach(
      type=>hub.addEventListener(type,redraw,{passive:true})
    );
    // O AXON muda a seleção por classe; observar apenas estes seis botões.
    const focusObserver=new MutationObserver(redraw);
    nodes.forEach(node=>focusObserver.observe(node,{attributes:true,attributeFilter:["class"]}));
    redraw();
  }
  function scan(){
    scanQueued=false;
    if(!isAdmin())return;
    document.querySelectorAll('#main .qb-train-hub[data-train-screen="subjects"]')
      .forEach(mount);
  }
  function schedule(){
    if(scanQueued)return;
    scanQueued=true;
    requestAnimationFrame(scan);
  }
  function addedTraining(node){
    return node.nodeType===1&&
      (node.matches?.('.qb-train-hub[data-train-screen="subjects"]')||
       node.querySelector?.('.qb-train-hub[data-train-screen="subjects"]'));
  }
  function initialize(){
    if(!isAdmin())return;
    const main=document.getElementById("main");
    if(!main)return;
    const observer=new MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(addedTraining)))schedule();
    });
    observer.observe(main,{subtree:true,childList:true});
    window.addEventListener("resize",()=>{
      if(!isAdmin())return;
      document.querySelectorAll('#main .qb-train-hub[data-train-screen="subjects"]')
        .forEach(hub=>{
          hub.querySelectorAll(".qb-train-node[data-train-matter]").forEach(decorate);
          adjust(hub);
        });
    },{passive:true});
    schedule();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
})();