/* PDF cabecalho-recolhivel: botão nativo, simples, sem observador permanente. Admin apenas. */
(function(){
  "use strict";
  function mount(header){
    const utilities=header.querySelector(".qb-header-utilities");
    if(!utilities||utilities.querySelector(".qb-cabecalho-toggle"))return;
    if(!utilities.id)utilities.id="qb-admin-utility-controls";
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="qb-cabecalho-toggle";
    btn.setAttribute("aria-controls",utilities.id);
    btn.setAttribute("aria-expanded","true");
    btn.textContent="Recolher";
    btn.addEventListener("click",function(){
      const collapsed=header.classList.toggle("qb-cabecalho-recolhido");
      btn.setAttribute("aria-expanded",collapsed?"false":"true");
      btn.textContent=collapsed?"Expandir":"Recolher";
      // Ocultar o menu secundário se ele estiver aberto na hora de recolher.
      if(collapsed){
        const details=utilities.querySelector(".qb-admin-tools-more");
        if(details)details.open=false;
      }
    });
    utilities.append(btn);
  }
  function init(){
    if(!document.documentElement.classList.contains("qb-admin-experience"))return;
    const header=document.querySelector("header.top.qb-app-header");
    if(header)mount(header);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();