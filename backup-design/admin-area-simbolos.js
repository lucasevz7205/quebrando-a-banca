/* Admin · radiais de área: símbolo por matéria, nome ou sigla conforme o espaço real, nome completo ao selecionar. */
(function () {
  "use strict";
  const P = {
    CP: '<path d="M12 2.5v4M10 4.5h4M9.5 12.5c-1.6-1-2.2-2.3-2.2-3.6A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 4.7 2.4c0 1.3-.6 2.6-2.2 3.6M9 21l.9-8.5h4.2L15 21M7 21h10"/>',
    DA: '<path d="M9 3h6v4H9zM12 7v3M5 10h14M5 10v3M19 10v3M3 13h4v4H3zM17 13h4v4h-4zM10 13h4v4h-4zM12 10v3"/>',
    DC: '<path d="M3 9l9-5 9 5zM6 9v9M10 9v9M14 9v9M18 9v9M3 20h18"/>',
    JUR: '<path d="M12 4v16M7 20h10M5 8h14M5 8l-3 6h6zM19 8l-3 6h6zM2 14a3 2 0 0 0 6 0M16 14a3 2 0 0 0 6 0"/>',
    LG: '<path d="M4 5h16v11H11l-4 4v-4H4zM8 9h8M8 12.5h5"/>',
    LI: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    LP: '<path d="M20 4C11 4 6 9 6 16l-2 4M6 16c6 0 11-4 14-12M9.5 14.5l6-6"/>',
    PL: '<path d="M3 18a9 9 0 0 1 18 0M7 18a5 5 0 0 1 10 0M2 21h20M12 9v3"/>',
    RF: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    TI: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>'
  };
  const SEL = ":hover,:focus-visible,.is-focused";
  let ctx = null;

  // Largura útil de um compartimento em repouso (o selecionado fica alargado e com fonte zerada).
  function restingNode(node) {
    const hub = node.closest(".qb-area-hub") || document;
    const all = hub.querySelectorAll(".qb-area-node");
    for (const n of all) if (!n.matches(SEL)) return n;
    return node;
  }
  function fits(text, label, node) {
    ctx = ctx || document.createElement("canvas").getContext("2d");
    const ref = restingNode(node);
    const cs = getComputedStyle(label), ns = getComputedStyle(ref);
    const px = parseFloat(cs.fontSize) || 12;
    ctx.font = (cs.fontStyle || "normal") + " " + (px ? cs.fontWeight : "400") + " " + px + "px " + cs.fontFamily;
    // O compartimento é um círculo: a largura útil do texto é a corda, ~80% do diâmetro.
    const inner = ref.clientWidth * 0.8 - parseFloat(ns.paddingLeft) - parseFloat(ns.paddingRight);
    if (inner <= 0) return true;
    const space = ctx.measureText(" ").width;
    let lines = 1, cur = 0;
    for (const w of text.split(/\s+/)) {
      const ww = ctx.measureText(w).width * 1.08; // margem p/ espaçamento entre letras do CSS
      if (ww > inner) return false;
      const need = cur === 0 ? ww : cur + space + ww;
      if (need <= inner) cur = need; else { lines++; cur = ww; }
    }
    return lines <= 2;
  }

  function idFrom(name) {
    const n = (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (/ciencia politica/.test(n)) return "CP";
    if (/jurisprudencia/.test(n)) return "JUR";
    if (/linguistic/.test(n)) return "LG";
    if (/ingles|inglesa/.test(n)) return "LI";
    if (/portugues/.test(n)) return "LP";
    if (/processo legislativo/.test(n)) return "PL";
    if (/administrativ/.test(n)) return "DA";
    if (/constitucional/.test(n)) return "DC";
    if (/reconhecimento|fala/.test(n)) return "RF";
    if (/tecnologia|informacao|ti e dados/.test(n)) return "TI";
    return "";
  }

  function decorate(node) {
    const id = idFrom(node.dataset.areaName);
    if (!id || !P[id]) return;
    const icon = node.querySelector(".qb-radial-node-icon");
    const label = node.querySelector(".qb-radial-node-label");
    if (!icon || !label) return;
    if (!node.dataset.qbSym) {
      node.dataset.qbSym = id;
      node.dataset.qbShort = (node.dataset.areaName || label.textContent).trim();
      label.dataset.qbFull = node.dataset.qbShort;
      icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[id] + "</svg>";
    }
    // Mede o nome curto na fonte normal (sem o estilo de sigla), sem alterar o texto.
    const had = node.hasAttribute("data-qb-sigla-on");
    if (had) node.removeAttribute("data-qb-sigla-on");
    const ok = fits(node.dataset.qbShort, label, node);
    const target = ok ? node.dataset.qbShort : id;
    if (label.textContent !== target) label.textContent = target;
    if (!ok) node.setAttribute("data-qb-sigla-on", "");
  }

  function adjust(hub) {
    const stage = hub.querySelector("[data-radial-stage]");
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    hub.querySelectorAll(".qb-area-node[data-qb-sym]").forEach((node) => {
      const cur = parseFloat(node.style.getPropertyValue("--qb-shift")) || 0;
      if (!node.matches(SEL) || node.disabled) { if (cur) node.style.removeProperty("--qb-shift"); return; }
      const r = node.getBoundingClientRect();
      const left = r.left - cur, right = r.right - cur, m = 4;
      let d = 0;
      if (left < sr.left + m) d = sr.left + m - left;
      else if (right > sr.right - m) d = sr.right - m - right;
      node.style.setProperty("--qb-shift", d.toFixed(1) + "px");
    });
  }

  function mount(hub) {
    hub.querySelectorAll(".qb-area-node").forEach(decorate);
    if (hub.dataset.qbSymReady === "1") { adjust(hub); return; }
    hub.dataset.qbSymReady = "1";
    const go = () => { requestAnimationFrame(() => adjust(hub)); setTimeout(() => adjust(hub), 330); };
    ["pointerover", "pointerout", "focusin", "focusout", "pointerdown"].forEach((t) => hub.addEventListener(t, go, { passive: true }));
    window.addEventListener("resize", () => { hub.querySelectorAll(".qb-area-node").forEach(decorate); go(); }, { passive: true });
    go();
  }

  function scan() {
    if (!document.documentElement.classList.contains("qb-admin-experience")) return;
    const main = document.getElementById("main");
    if (!main) return;
    main.querySelectorAll(".qb-area-hub").forEach(mount);
  }
  let queued = false;
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; scan(); }); }
  function init() {
    const main = document.getElementById("main");
    if (!main) return;
    new MutationObserver(schedule).observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    schedule();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
