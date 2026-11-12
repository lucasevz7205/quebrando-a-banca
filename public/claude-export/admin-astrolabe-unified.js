/* QB admin · Astrolábio estratégico unificado.
   Acrescenta somente decoração e interações de ponteiros aos radiais existentes.
   Não reescreve os botões, as rotas, a lógica dos dados ou o desempenho.
*/
(function () {
  "use strict";
  if (!document.documentElement.classList.contains("qb-admin-experience")) return;
  const needleMarkup = [
    '<div class="qb-astro-needles" aria-hidden="true"><svg viewBox="0 0 1000 1000">',
    '<defs><linearGradient id="qb-needle-main" x1="0" y1="0" x2="1" y2="1">',
    '<stop stop-color="#D4BE99"/><stop offset=".48" stop-color="#7992A3"/><stop offset="1" stop-color="#C09F71"/></linearGradient></defs>',
    '<path d="M500 500L486 322 500 218 514 322Z" fill="url(#qb-needle-main)" stroke="#D8B88A" stroke-width="2.1"/>',
    '<path d="M500 500 490 630 500 704 510 630Z" fill="#758B9A" stroke="#BCAB8C" stroke-width="1.5"/>',
    '<path d="M500 500 500 241" stroke="#E9CEAA" stroke-width="2.4" opacity=".7"/>',
    '<path d="M500 500 500 684" stroke="#9B4442" stroke-width="4" opacity=".8"/>',
    '<circle cx="500" cy="500" r="23" fill="#0D2945" stroke="#A69277" stroke-width="3"/>',
    '<circle cx="500" cy="500" r="9" fill="#BDA682" stroke="#5B7281" stroke-width="2"/>',
    '</svg></div>'
  ].join("");
  const moduleLabels = {
    "painel":"Planejamento",
    "edital":"Edital",
    "treinar":"Treinar",
    "estudo":"Estudo",
    "simulado":"Simulado",
    "historico":"Desempenho"
  };
  function indexFromEvent(root,event) {
    let node=event.target?.closest?.(".qb-radial-node");
    if(node&&root.contains(node)&&!node.disabled)return node;
    const segment=event.target?.closest?.("[data-ring-sector]");
    if(segment&&root.contains(segment)){
      node=root.querySelector('.qb-radial-node[data-radial-index="'+segment.dataset.ringSector+'"]');
      if(node&&!node.disabled)return node;
    }
    return null;
  }
  function mount(hub){
    if(hub.dataset.qbAstroReady==="1")return;
    const stage=hub.querySelector("[data-radial-stage]");
    if(!stage)return;
    const nodes=[...stage.querySelectorAll(".qb-radial-node")];
    if(!nodes.length)return;
    hub.dataset.qbAstroReady="1";
    hub.classList.add("qb-admin-astro");
    hub.dataset.qbAstroCount=String(nodes.length);

    const disc=document.createElement("div");
    disc.className="qb-astro-disc";
    disc.setAttribute("aria-hidden","true");
    stage.prepend(disc);

    const seats=nodes.map((node,i)=>{
      const seat=document.createElement("div");
      seat.className="qb-astro-seat";
      seat.setAttribute("aria-hidden","true");
      const x=parseFloat(node.style.getPropertyValue("--node-x"));
      const y=parseFloat(node.style.getPropertyValue("--node-y"));
      const theta=(-90+i*360/nodes.length)*Math.PI/180;
      const px=Number.isFinite(x)?x:50+37*Math.cos(theta);
      const py=Number.isFinite(y)?y:50+37*Math.sin(theta);
      seat.style.left=px+"%";
      seat.style.top=py+"%";
      stage.insertBefore(seat,stage.querySelector(".qb-radial-network"));
      return {node,seat,x:px,y:py};
    });
    const pointer=document.createElement("div");
    pointer.innerHTML=needleMarkup;
    const needle=pointer.firstElementChild;
    const core=stage.querySelector(".qb-radial-core");
    stage.insertBefore(needle,core||null);

    if(hub.dataset.radialScreen==="menu"){
      const title=core?.querySelector("strong");
      const eyebrow=core?.querySelector(".qb-radial-core-eyebrow");
      const sub=core?.querySelector(".qb-radial-core-sub");
      if(title)title.textContent="CENTRO DE COMANDO";
      if(eyebrow)eyebrow.textContent="ESTRATÉGIA";
      if(sub)sub.textContent="Escolha uma direção";
    }
    let currentAngle=0,initialized=false;
    const rotate=node=>{
      if(!node||node.disabled)return;
      const info=seats.find(item=>item.node===node);
      if(!info)return;
      const angle=Math.atan2(info.x-50,50-info.y)*180/Math.PI;
      if(!initialized){
        currentAngle=angle;
        needle.style.transition="none";
        needle.style.transform="rotate("+currentAngle+"deg)";
        // The transition becomes active after the initial position is established.
        window.requestAnimationFrame?.(()=>{needle.style.transition="";});
        initialized=true;
      }else{
        const delta=((angle-currentAngle%360+540)%360)-180;
        currentAngle+=delta;
        needle.style.transform="rotate("+currentAngle+"deg)";
      }
      seats.forEach(item=>{
        const chosen=item.node===node;
        item.seat.classList.toggle("qb-astro-seat-active",chosen);
        item.node.classList.toggle("qb-astro-selected",chosen);
      });
      hub.dataset.qbAstroSelected=node.dataset.radialIndex||"0";
      hub.setAttribute("data-astro-selection",node.getAttribute("aria-label")||node.textContent.trim());
    };
    const initial=nodes.find(n=>!n.disabled);
    rotate(initial);
    hub.addEventListener("pointerover",event=>{
      const n=indexFromEvent(hub,event);if(n)rotate(n);
    },{passive:true});
    hub.addEventListener("pointerdown",event=>{
      const n=indexFromEvent(hub,event);if(n)rotate(n);
    },{passive:true,capture:true});
    hub.addEventListener("focusin",event=>{
      const n=indexFromEvent(hub,event);if(n)rotate(n);
    });
    // Teclado, seleção programática e os seletores rápidos usam a mesma bússola.
    const watch=new MutationObserver(changes=>{
      for(const record of changes){
        const item=record.target;
        if(item?.classList?.contains("is-focused")){
          rotate(item);
          return;
        }
      }
    });
    nodes.forEach(node=>watch.observe(node,{attributes:true,attributeFilter:["class"]}));
  }

  let queued=false;
  function scan(){
    queued=false;
    const main=document.getElementById("main");
    if(!main)return;
    main.querySelectorAll(".qb-radial-hub").forEach(mount);
  }
  function schedule(){
    if(queued)return;
    queued=true;
    queueMicrotask(scan);
  }
  function initialize(){
    const main=document.getElementById("main");
    if(!main)return;
    const observer=new MutationObserver(schedule);
    observer.observe(main,{subtree:true,childList:true});
    schedule();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
})();