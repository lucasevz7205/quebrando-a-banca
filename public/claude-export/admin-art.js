/* Admin brand: approved transparent assets + original live controls.
 * Do not reparent countdown, theme, background, sync or OmniStudy: other
 * feature scripts insert controls relative to these direct DOM children.
 */
(function () {
  "use strict";
  const TITLE="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/518e6cb96_qb_admin_title_alpha.png";
  const SWORD="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/83c9768ab_qb_admin_sword_alpha.png";
  function art(cls,src) {
    const el=document.createElement("img");
    el.className=cls;el.src=src;el.alt="";el.draggable=false;
    el.loading="eager";el.decoding="async";el.setAttribute("aria-hidden","true");
    return el;
  }
  function init() {
    if(!document.documentElement.classList.contains("qb-admin-experience"))return;
    const header=document.querySelector("header.top.qb-app-header");
    const brand=header?.querySelector(".qb-header-brand");
    const row=header?.querySelector(".qb-header-row");
    const utilities=header?.querySelector(".qb-header-utilities");
    if(!header||!brand||!row||!utilities)return;
    if(!brand.querySelector(".qb-admin-title-actual")) {
      brand.querySelectorAll(".qb-admin-laurel,.qb-admin-brand-sword-art,.qb-admin-brand-title-art,.qb-admin-visual-brand,.qb-admin-visual-sword").forEach(el=>el.remove());
      brand.prepend(art("qb-admin-title-actual",TITLE));
      row.append(art("qb-admin-sword-actual",SWORD));
    }
    let more=utilities.querySelector(".qb-admin-tools-more");
    if(!more){
      more=document.createElement("details");
      more.className="qb-admin-tools-more";
      more.innerHTML='<summary>Ferramentas</summary><div class="qb-admin-tools-more-panel" role="group" aria-label="Ferramentas e conta"></div>';
      utilities.append(more);
      document.addEventListener("pointerdown",event=>{
        if(more.open&&!more.contains(event.target))more.open=false;
      },{capture:true,passive:true});
    }
    const panel=more.querySelector(".qb-admin-tools-more-panel");
    const onlySecondary=new Set(["qb-pwa-install","qb-logout"]);
    // Never move the motion toggle from its original parent while the motion
    // controller may still attach events.
    let locked=false;
    const observer=new MutationObserver(()=>moveSecondary());
    function moveSecondary(){
      if(locked)return;
      locked=true;observer.disconnect();
      for(const child of [...utilities.children]){
        if(onlySecondary.has(child.id))panel.append(child);
        if(child.classList.contains("qb-utility-lab"))panel.append(child);
      }
      observer.observe(utilities,{childList:true});
      locked=false;
    }
    moveSecondary();
    // The original AXON cockpit toggle remains the sole owner of its state.
    const compact=document.getElementById("qb-cockpit-toggle");
    if(compact){
      compact.title="Alternar cabeçalho compacto e amplo";
      compact.setAttribute("aria-label","Alternar cabeçalho compacto e amplo");
    }
    const countdown=header.querySelector("#countdown");
    if(countdown){
      const paint=()=>{
        const full=countdown.textContent.trim();
        const days=full.match(/\b(\d+)\s+dias?\b/i);
        countdown.setAttribute("data-qb-short",days?"Prova · "+days[1]+" dias":full.replace(/^Prova em /,"Prova · "));
        countdown.title=full;
      };
      new MutationObserver(paint).observe(countdown,{subtree:true,childList:true,characterData:true});
      paint();
    }
    header.classList.add("qb-admin-modern-header");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();