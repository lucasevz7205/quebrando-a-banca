/* Approved art mounted only in administrator's iframe. */
(function(){
  "use strict";
  function mount(){
    if(!document.documentElement.classList.contains("qb-admin-experience"))return;
    const brand=document.querySelector(".qb-app-header .qb-header-brand");
    if(!brand||brand.querySelector(".qb-admin-visual-brand"))return;
    const originalArt="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/7dfe76522_qb_admin_brand_art.webp";
    const swordArt="https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/f2ac0024c_qb_admin_sword_art.webp";
    const art=document.createElement("img");
    art.className="qb-admin-visual-brand";art.src=originalArt;art.alt="";
    art.loading="eager";art.decoding="async";
    const mobile=document.createElement("img");
    mobile.className="qb-admin-visual-sword";mobile.src=swordArt;mobile.alt="";
    mobile.loading="eager";mobile.decoding="async";
    brand.prepend(mobile);brand.prepend(art);
    // Keep title in DOM for screen readers; remove the synthetic ornament.
    brand.querySelectorAll(".qb-admin-laurel").forEach(el=>el.remove());
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();