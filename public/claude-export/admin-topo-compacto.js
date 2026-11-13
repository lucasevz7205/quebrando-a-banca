/* Admin · topo: sempre compacto (modo cockpit). O topo amplo foi removido; o botão "Topo: amplo/compacto" fica oculto. */
(function () {
  "use strict";
  function isAdmin() { return document.documentElement.classList.contains("qb-admin-experience"); }
  function apply(header) {
    if (isAdmin() && header.dataset.cockpit !== "true") header.dataset.cockpit = "true";
  }
  function start() {
    const header = document.querySelector("header.top.qb-app-header");
    if (!header) return false;
    apply(header);
    // axon-shell.js reavalia o topo ao rolar e ao trocar de tela; aqui ele é mantido compacto.
    new MutationObserver(() => apply(header)).observe(header, { attributes: true, attributeFilter: ["data-cockpit"] });
    new MutationObserver(() => apply(header)).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return true;
  }
  if (!start()) {
    const boot = new MutationObserver(() => { if (start()) boot.disconnect(); });
    boot.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
