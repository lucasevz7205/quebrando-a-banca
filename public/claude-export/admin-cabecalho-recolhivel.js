/* QB · cabeçalho recolhível v2 (somente administrador).
 * Preserva o #countdown e aguarda o #qb-sync-status antes de movê-lo:
 * offline-sync.js insere seus controles relativamente ao prazo da prova.
 * Mantém o botão Cockpit e todas as ações originais de OmniStudy.
 */
(function () {
  "use strict";
  const doc=document;
  const root=doc.documentElement;

  function placeCountdown(header){
    const countdown=header.querySelector("#countdown");
    const kicker=header.querySelector(".qb-header-kicker");
    // O prazo só sai da faixa original APÓS offline-sync.js montar o status.
    // Caso contrário a sincronização pode usar uma referência fora do pai.
    if(!countdown||!kicker||!header.querySelector("#qb-sync-status"))return false;
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
    return true;
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
    if(placeCountdown(header))return;
    // Observe somente os filhos da faixa e pare assim que a sincronização
    // aparecer. Não instale um observador global permanente, que prejudica
    // a fluidez da rolagem no Safari do iPad.
    const observer=new MutationObserver(()=>{
      if(!header.isConnected){observer.disconnect();return;}
      if(placeCountdown(header))observer.disconnect();
    });
    observer.observe(utilities,{childList:true});
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