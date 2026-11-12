/* QB · assets originais, integrados a controles reais. Apenas administração. */
(function(){
  "use strict";
  function mount(){
    if(!document.documentElement.classList.contains("qb-admin-experience"))return;
    const brand=document.querySelector(".qb-app-header .qb-header-brand");
    if(!brand||brand.querySelector(".qb-admin-brand-title-art"))return;
    // São recortes da arte aprovada, não recriações com SVG.
    const sword=document.createElement("img");
    sword.className="qb-admin-brand-sword-art";
    sword.src="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/f2ac0024c_qb_admin_sword_art.webp";
    sword.alt="";sword.loading="eager";sword.decoding="async";
    const title=document.createElement("img");
    title.className="qb-admin-brand-title-art";
    title.src="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/3b93317ff_qb_admin_title_cropped.webp";
    title.alt="";title.loading="eager";title.decoding="async";
    brand.querySelectorAll(".qb-admin-laurel,.qb-admin-visual-brand,.qb-admin-visual-sword").forEach(el=>el.remove());
    brand.prepend(title);brand.prepend(sword);
    // h1 e controles continuam no DOM, com funções intactas.
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();