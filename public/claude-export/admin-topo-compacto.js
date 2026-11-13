/* Admin: manter o cabeçalho em modo cockpit compacto. */
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
    new MutationObserver(() => apply(header)).observe(header, { attributes: true, attributeFilter: ["data-cockpit"] });
    new MutationObserver(() => apply(header)).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return true;
  }
  if (!start()) {
    const boot = new MutationObserver(() => { if (start()) boot.disconnect(); });
    boot.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
