/* QB · cabeçalho recolhível v2 (somente administrador).
 * Preserva o mesmo elemento #countdown, os observadores de atualização,
 * o botão Cockpit original e os controles de sincronização/OmniStudy.
 */
(function () {
  "use strict";
  const doc=document;
  const root=doc.documentElement;

  function placeCountdown(header){
    const countdown=header.querySelector("#countdown");
    const kicker=header.querySelector(".qb-header-kicker");
    if(!countdown||!kicker)return;
    // O cabeçalho usa flex-direction:column. A linha compartilhada mantém
    // concurso e prazo lado a lado sem alterar a estrutura de todo o header.
    let line=header.querySelector(".qb-admin-examline");
    if(!line){
      line=doc.createElement("div");
      line.className="qb-admin-examline";
      line.setAttribute("role","group");
      line.setAttribute("aria-label","Concurso e prazo da prova");
      kicker.before(line);
    }
    if(kicker.parentElement!==line)line.appendChild(kicker);
    // Mover, nunca clonar: updateCounts e a observação da data seguem vivos.
    if(countdown.parentElement!==line)line.appendChild(countdown);
  }

  function mount(header){
    const utilities=header.querySelector(".qb-header-utilities");
    if(!utilities)return;
    if(!utilities.id)utilities.id="qb-admin-utility-controls";
    let btn=utilities.querySelector(".qb-cabecalho-toggle");
    if(!btn){
      btn=doc.createElement("button");
      btn.type="button";
      btn.className="qb-cabecalho-toggle";
      btn.setAttribute("aria-controls",utilities.id);
      btn.setAttribute("aria-expanded","true");
      btn.textContent="Recolher";
      btn.addEventListener("click",()=>{
        const collapsed=header.classList.toggle("qb-cabecalho-recolhido");
        btn.setAttribute("aria-expanded",String(!collapsed));
        btn.textContent=collapsed?"Expandir":"Recolher";
        if(collapsed){
          const submenu=utilities.querySelector(".qb-admin-tools-more");
          if(submenu)submenu.open=false;
        }
      });
      utilities.append(btn);
    }
    placeCountdown(header);
  }

  function scan(){
    if(!root.classList.contains("qb-admin-experience"))return false;
    const header=doc.querySelector("header.top.qb-app-header");
    if(!header)return false;
    mount(header);
    return true;
  }

  function init(){
    if(scan())return;
    // Caso o tema admin seja iniciado após o DOM, observar apenas a mudança
    // da classe raiz e parar imediatamente após montar, sem loop global.
    const observer=new MutationObserver(()=>{
      if(scan())observer.disconnect();
    });
    observer.observe(root,{attributes:true,attributeFilter:["class"]});
  }
  if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();