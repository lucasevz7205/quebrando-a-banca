/* Admin brand: original transparent art, real controls, compact cockpit.
 * No student-facing UI or document data is changed here.
 */
(function () {
  "use strict";
  const TITLE="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/518e6cb96_qb_admin_title_alpha.png";
  const SWORD="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/83c9768ab_qb_admin_sword_alpha.png";
  const GROUPS=[
    {cls:"qb-admin-tools-study",label:"Estudo"},
    {cls:"qb-admin-tools-view",label:"Aparência"}
  ];
  function makeImage(cls,url){
    const img=document.createElement("img");
    img.className=cls;img.src=url;img.alt="";img.loading="eager";img.decoding="async";
    img.draggable=false;img.setAttribute("aria-hidden","true");
    return img;
  }
  function build(){
    if(!document.documentElement.classList.contains("qb-admin-experience"))return;
    const header=document.querySelector("header.top.qb-app-header");
    const brand=header?.querySelector(".qb-header-brand");
    const row=header?.querySelector(".qb-header-row");
    const utilities=header?.querySelector(".qb-header-utilities");
    if(!header||!brand||!row||!utilities)return;
    if(!brand.querySelector(".qb-admin-title-actual")){
      brand.querySelectorAll(".qb-admin-laurel,.qb-admin-brand-sword-art,.qb-admin-brand-title-art,.qb-admin-visual-brand,.qb-admin-visual-sword").forEach(el=>el.remove());
      brand.prepend(makeImage("qb-admin-title-actual",TITLE));
      row.appendChild(makeImage("qb-admin-sword-actual",SWORD));
    }
    if(!utilities.querySelector(".qb-admin-controls")){
      const controls=document.createElement("div");
      controls.className="qb-admin-controls";
      controls.setAttribute("role","group");
      controls.setAttribute("aria-label","Ações do Dashboard");
      for(const group of GROUPS){
        const el=document.createElement("div");
        el.className="qb-admin-tools "+group.cls;
        el.setAttribute("role","group");
        el.setAttribute("aria-label",group.label);
        controls.append(el);
      }
      const more=document.createElement("details");
      more.className="qb-admin-tools-more";
      more.innerHTML='<summary aria-label="Abrir ferramentas e conta">Ferramentas</summary><div class="qb-admin-tools-more-panel" role="group" aria-label="Ferramentas e conta"></div>';
      controls.append(more);
      utilities.prepend(controls);
      document.addEventListener("pointerdown",event=>{
        if(more.open&&!more.contains(event.target))more.open=false;
      },{capture:true,passive:true});
    }
    const study=utilities.querySelector(".qb-admin-tools-study");
    const view=utilities.querySelector(".qb-admin-tools-view");
    const extra=utilities.querySelector(".qb-admin-tools-more-panel");
    function destination(node){
      const id=node.id;
      if(["omni-pomo-pill","omni-studio-trigger","countdown","qb-sync-status"].includes(id))return study;
      if(["qb-background-toggle","qb-cockpit-toggle","theme-b"].includes(id))return view;
      return extra;
    }
    let moving=false;
    const observer=new MutationObserver(()=>organize());
    function organize(){
      if(moving)return;
      moving=true;
      observer.disconnect();
      for(const el of [...utilities.children]){
        if(el.classList.contains("qb-admin-controls"))continue;
        // Move original controls, preserving every registered handler.
        destination(el).appendChild(el);
      }
      // Move controls injected later directly into the original utility strip.
      observer.observe(utilities,{childList:true});
      moving=false;
    }
    organize();
    const compact=header.querySelector("#qb-cockpit-toggle");
    if(compact){
      compact.setAttribute("aria-label","Alternar topo compacto e amplo");
      compact.title="Mostrar mais ou menos espaço no cabeçalho";
    }
    // Exam counter remains data-driven. Present only the actionable time remaining.
    const countdown=header.querySelector("#countdown");
    if(countdown){
      function shorten(){
        const full=countdown.textContent.trim();
        const days=full.match(/\b(\d+)\s+dias?\b/i);
        countdown.setAttribute("data-qb-short",days?"Prova · "+days[1]+" dias":full.replace(/^Prova em /,"Prova · "));
        countdown.title=full;
      }
      const counterObserver=new MutationObserver(shorten);
      counterObserver.observe(countdown,{childList:true,characterData:true,subtree:true});
      shorten();
    }
    header.classList.add("qb-admin-modern-header");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build,{once:true});
  else build();
})();