/* Quebrando a Banca · Runtime AXON para o Menu Superior Orbital, Transições de Partículas,
 * Modo Cockpit Retrátil e Gaveta Radial Rápida (Quick Radial Command).
 * Não faz chamadas de IA, não altera dados do banco e respeita prefers-reduced-motion.
 */
(function (root) {
  "use strict";

  const TAB_META = {
    "tab-portal":    { key: "portal",    icon: "◉", color: [122, 168, 255], progress: 1 },
    "tab-painel":    { key: "painel",    icon: "◷", color: [255, 149, 113], progress: 0.82 },
    "tab-edital":    { key: "edital",    icon: "▦", color: [217, 152, 255], progress: 0.74 },
    "tab-treinar":   { key: "treinar",   icon: "◎", color: [141, 162, 255], progress: 0.88 },
    "tab-estudo":    { key: "estudo",    icon: "◇", color: [73, 215, 251],  progress: 0.78 },
    "tab-simulado":  { key: "simulado",  icon: "◈", color: [68, 197, 255],  progress: 0.65 },
    "tab-historico": { key: "historico", icon: "↗", color: [180, 162, 255], progress: 0.85 }
  };

  function seeded(seed) {
    let current = (seed || 29) >>> 0;
    return () => {
      current = (Math.imul(current, 1664525) + 1013904223) >>> 0;
      return current / 4294967296;
    };
  }

  function decorateTopTabs(doc) {
    const nav = doc.querySelector("header.top.qb-app-header nav.tabs.qb-primary-nav");
    if (!nav) return null;
    const circumference = 2 * Math.PI * 8.5;
    const buttons = [...nav.querySelectorAll("button")];
    for (const btn of buttons) {
      if (btn.querySelector(".qb-nav-orb")) continue;
      const meta = TAB_META[btn.id] || { icon: "◇", progress: 0.75 };
      const offset = (circumference * (1 - (meta.progress || 0.75))).toFixed(2);
      const orb = doc.createElement("span");
      orb.className = "qb-nav-orb";
      orb.setAttribute("aria-hidden", "true");
      orb.innerHTML =
        `<svg viewBox="0 0 22 22"><circle class="qb-nav-orb-track" cx="11" cy="11" r="8.5"/>` +
        `<circle class="qb-nav-orb-arc" cx="11" cy="11" r="8.5" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset}"/></svg>` +
        `<span>${meta.icon}</span>`;
      btn.prepend(orb);
    }
    return nav;
  }

  function mountNavRibbonFlow(doc, nav) {
    if (!nav || nav.querySelector(".qb-nav-flow-canvas")) return { focus() {}, dispose() {} };
    const win = doc.defaultView || root;
    const reduced = win.matchMedia?.("(prefers-reduced-motion: reduce)");
    const canvas = doc.createElement("canvas");
    canvas.className = "qb-nav-flow-canvas";
    canvas.setAttribute("aria-hidden", "true");
    nav.prepend(canvas);
    const ctx = canvas.getContext?.("2d", { alpha: true });
    if (!ctx) return { focus() {}, dispose() {} };

    const rand = seeded(884123);
    const filaments = Array.from({ length: 44 }, (_, i) => ({
      x: i / 44,
      y: 0.18 + rand() * 0.64,
      speed: (rand() < 0.5 ? -1 : 1) * (0.04 + rand() * 0.08),
      size: 0.7 + rand() * 1.35,
      alpha: 0.14 + rand() * 0.34,
      phase: rand() * Math.PI * 2
    }));

    let targetX = 0.5;
    let currentX = 0.5;
    let activeRgb = [141, 162, 255];
    let raf = 0;
    let disposed = false;

    function syncActiveTarget(hoveredBtn = null) {
      const btn = hoveredBtn || nav.querySelector('button[aria-current="page"]') || nav.querySelector("button");
      if (!btn) return;
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      if (navRect.width > 0) {
        targetX = Math.max(0.05, Math.min(0.95, (btnRect.left + btnRect.width / 2 - navRect.left) / navRect.width));
      }
      const meta = TAB_META[btn.id];
      if (meta?.color) activeRgb = meta.color;
    }

    function canAnimate() {
      return !disposed && !reduced?.matches && !doc.hidden && doc.documentElement?.dataset?.qbAmbient !== "still";
    }

    function frame(now) {
      raf = 0;
      if (!canAnimate()) return;
      const rect = nav.getBoundingClientRect();
      const dpr = Math.min(win.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      currentX += (targetX - currentX) * 0.12;
      const t = now / 1000;
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const haloX = currentX * rect.width;
      const grad = ctx.createRadialGradient(haloX, rect.height / 2, 2, haloX, rect.height / 2, Math.max(48, rect.width * 0.16));
      grad.addColorStop(0, `rgba(${activeRgb.join(",")},0.22)`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      for (const f of filaments) {
        const px = ((f.x + t * f.speed) % 1 + 1) % 1 * rect.width;
        const py = (f.y + 0.09 * Math.sin(t * 1.6 + f.phase)) * rect.height;
        const dist = Math.abs(px - haloX) / Math.max(1, rect.width);
        const boost = dist < 0.16 ? 1.75 : 1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${activeRgb.join(",")},${Math.min(0.85, f.alpha * boost).toFixed(3)})`;
        ctx.arc(px, py, f.size * (dist < 0.16 ? 1.25 : 1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      raf = win.requestAnimationFrame(frame);
    }

    function start() {
      syncActiveTarget();
      if (canAnimate() && !raf) raf = win.requestAnimationFrame(frame);
    }

    nav.addEventListener("pointerover", e => {
      const btn = e.target.closest?.("button");
      if (btn && nav.contains(btn)) {
        syncActiveTarget(btn);
        start();
      }
    });
    nav.addEventListener("pointerleave", () => syncActiveTarget(null));
    nav.addEventListener("focusin", e => {
      const btn = e.target.closest?.("button");
      if (btn && nav.contains(btn)) syncActiveTarget(btn);
    });

    const mut = win.MutationObserver
      ? new win.MutationObserver(() => {
          syncActiveTarget();
          if (!canAnimate() && raf) {
            win.cancelAnimationFrame(raf);
            raf = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          } else {
            start();
          }
        })
      : null;
    mut?.observe(doc.documentElement, { attributes: true, attributeFilter: ["data-qb-ambient"] });
    mut?.observe(nav, { subtree: true, attributes: true, attributeFilter: ["aria-current"] });

    start();
    return {
      sync: syncActiveTarget,
      dispose() {
        disposed = true;
        if (raf) win.cancelAnimationFrame(raf);
        mut?.disconnect();
      }
    };
  }

  function mountUniversalTransitions(doc) {
    const win = doc.defaultView || root;
    const reduced = win.matchMedia?.("(prefers-reduced-motion: reduce)");
    const main = doc.getElementById("main");
    if (!main) return () => {};

    let canvas = doc.querySelector(".qb-axon-transition-layer");
    if (!canvas) {
      canvas = doc.createElement("canvas");
      canvas.className = "qb-axon-transition-layer";
      canvas.hidden = true;
      canvas.setAttribute("aria-hidden", "true");
      doc.body.appendChild(canvas);
    }
    const ctx = canvas.getContext?.("2d", { alpha: true });
    let burstRaf = 0;

    function triggerBurstFromElement(el) {
      main.classList.remove("qb-axon-view-entering");
      void main.offsetWidth;
      main.classList.add("qb-axon-view-entering");

      if (reduced?.matches || doc.documentElement?.dataset?.qbAmbient === "still" || !ctx || !el?.getBoundingClientRect) {
        return;
      }

      const rect = el.getBoundingClientRect();
      const vw = Math.max(1, win.innerWidth || 800);
      const vh = Math.max(1, win.innerHeight || 600);
      const dpr = Math.min(win.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.hidden = false;

      const ox = rect.left + rect.width / 2;
      const oy = rect.top + rect.height / 2;
      const tx = vw / 2;
      const ty = Math.min(vh * 0.44, oy + 210);
      const meta = TAB_META[el.id] || { color: [141, 162, 255] };
      const rgb = meta.color.join(",");
      const rand = seeded((el.id || "axon").length * 917 + Math.round(ox));

      const particles = Array.from({ length: 68 }, (_, i) => {
        const angle = (i / 68) * Math.PI * 2;
        return {
          ox: ox + Math.cos(angle) * (rand() * 18),
          oy: oy + Math.sin(angle) * (rand() * 10),
          tx: tx + Math.cos(angle) * (24 + rand() * 120),
          ty: ty + Math.sin(angle) * (18 + rand() * 80),
          phase: rand() * Math.PI * 2,
          spin: (rand() < 0.5 ? -1 : 1) * (1.2 + rand() * 2),
          size: 0.9 + rand() * 1.8,
          alpha: 0.35 + rand() * 0.55
        };
      });

      if (burstRaf) win.cancelAnimationFrame(burstRaf);
      const start = win.performance?.now?.() || Date.now();
      const duration = 420;

      function step(now) {
        const elapsed = (now || Date.now()) - start;
        const t = Math.min(1, Math.max(0, elapsed / duration));
        const ease = t * t * (3 - 2 * t);
        ctx.clearRect(0, 0, vw, vh);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const halo = Math.sin(Math.PI * t);
        for (const p of particles) {
          const curl = p.phase + 5 * t * p.spin;
          const spread = (1 - ease) * 24 * halo;
          const x = p.ox + (p.tx - p.ox) * ease + Math.cos(curl) * spread;
          const y = p.oy + (p.ty - p.oy) * ease + Math.sin(curl) * spread;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${rgb},${(p.alpha * halo).toFixed(3)})`;
          ctx.arc(x, y, p.size * (0.8 + halo * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        if (t < 1) {
          burstRaf = win.requestAnimationFrame(step);
        } else {
          ctx.clearRect(0, 0, vw, vh);
          canvas.hidden = true;
          burstRaf = 0;
        }
      }
      burstRaf = win.requestAnimationFrame(step);
    }

    doc.addEventListener("click", e => {
      const btn = e.target.closest?.("nav.tabs.qb-primary-nav button, .subnav button, #qb-radial-return-action");
      if (btn) triggerBurstFromElement(btn);
    });

    return triggerBurstFromElement;
  }

  function mountCockpitHeader(doc) {
    const win = doc.defaultView || root;
    const header = doc.querySelector("header.top.qb-app-header");
    const utilities = doc.querySelector(".qb-header-utilities");
    const main = doc.getElementById("main");
    if (!header || !main) return;

    let manualOverride = null; // null = auto, true = compact, false = expanded

    if (utilities && !doc.getElementById("qb-cockpit-toggle")) {
      const toggle = doc.createElement("button");
      toggle.type = "button";
      toggle.id = "qb-cockpit-toggle";
      toggle.className = "theme-b qb-utility-action qb-cockpit-toggle";
      toggle.setAttribute("aria-pressed", "false");
      toggle.title = "Alternar cabeçalho compacto (Modo Cockpit)";
      toggle.textContent = "Topo: amplo";
      toggle.addEventListener("click", () => {
        const isCockpit = header.dataset.cockpit === "true";
        manualOverride = !isCockpit;
        evaluateCockpit();
      });
      const themeBtn = doc.getElementById("theme-b");
      if (themeBtn) utilities.insertBefore(toggle, themeBtn);
      else utilities.appendChild(toggle);
    }

    function evaluateCockpit() {
      const toggle = doc.getElementById("qb-cockpit-toggle");
      const inDeepActivity = Boolean(
        main.querySelector(".scorebar") ||
        main.querySelector("[data-map3]") ||
        (win.scrollY || 0) > 105
      );
      const shouldCompact = manualOverride !== null ? manualOverride : inDeepActivity;
      if (shouldCompact) {
        header.dataset.cockpit = "true";
        if (toggle) {
          toggle.setAttribute("aria-pressed", "true");
          toggle.textContent = "Topo: compacto";
        }
      } else {
        delete header.dataset.cockpit;
        if (toggle) {
          toggle.setAttribute("aria-pressed", "false");
          toggle.textContent = "Topo: amplo";
        }
      }
    }

    win.addEventListener?.("scroll", evaluateCockpit, { passive: true });
    const mut = win.MutationObserver ? new win.MutationObserver(evaluateCockpit) : null;
    mut?.observe(main, { childList: true });
    evaluateCockpit();
  }

  function mountQuickRadialCommand(doc) {
    const win = doc.defaultView || root;
    const brandMark = doc.querySelector(".qb-header-brand-mark");
    if (!brandMark) return;

    brandMark.setAttribute("role", "button");
    brandMark.setAttribute("tabindex", "0");
    brandMark.setAttribute("aria-label", "Abrir Hub Radial Rápido (Alt+M)");
    brandMark.title = "Abrir Hub Radial Rápido (Alt+M)";

    let backdrop = doc.getElementById("qb-quick-radial-modal");
    if (!backdrop) {
      backdrop = doc.createElement("div");
      backdrop.id = "qb-quick-radial-modal";
      backdrop.className = "qb-quick-radial-backdrop";
      backdrop.hidden = true;
      backdrop.innerHTML =
        `<div class="qb-quick-radial-dialog" role="dialog" aria-modal="true" aria-label="Navegação Radial Rápida AXON">` +
        `<button type="button" class="qb-quick-radial-close" data-quick-radial-close>Fechar · Esc</button>` +
        `<div data-quick-radial-mount></div>` +
        `</div>`;
      doc.body.appendChild(backdrop);
    }

    const mountNode = backdrop.querySelector("[data-quick-radial-mount]");
    let cleanupRadial = null;
    let currentSection = null;

    function closeModal() {
      if (backdrop.hidden) return;
      cleanupRadial?.();
      cleanupRadial = null;
      backdrop.hidden = true;
    }

    function renderModal(section = null) {
      if (!win.QBRadialDashboard) return;
      currentSection = section;
      cleanupRadial?.();
      cleanupRadial = null;
      const available = ["painel", "edital", "treinar", "estudo", ...(doc.getElementById("tab-simulado") ? ["simulado"] : []), "historico"];
      mountNode.innerHTML = win.QBRadialDashboard.render(currentSection, available);
      cleanupRadial = win.QBRadialDashboard.wire(mountNode, {
        onModule: key => renderModal(key),
        onBack: () => renderModal(null),
        onOpen: target => {
          closeModal();
          const tabBtn = doc.querySelector(`nav.tabs button[data-view="${target}"]`) ||
                         doc.querySelector(`.subnav button[data-sub="${target}"]`);
          if (tabBtn) {
            tabBtn.click();
          } else {
            try {
              win.location.hash = "#" + target;
              const parentKey = { cartoes: "estudo", mapa: "estudo", pegadinhas: "estudo", conteudo: "estudo", aprendizagem: "estudo", caderno: "treinar", metodo: "historico", analiseDia: "historico" }[target] || target;
              doc.getElementById("tab-" + parentKey)?.click();
            } catch {}
          }
        }
      });
    }

    function toggleModal() {
      if (!backdrop.hidden) {
        closeModal();
        return;
      }
      if (doc.querySelector("#main .qb-radial-hub")) {
        doc.querySelector("#main .qb-radial-node")?.focus();
        return;
      }
      backdrop.hidden = false;
      renderModal(null);
    }

    brandMark.addEventListener("click", toggleModal);
    brandMark.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleModal();
      }
    });

    backdrop.addEventListener("click", e => {
      if (e.target === backdrop || e.target.closest?.("[data-quick-radial-close]")) {
        closeModal();
      }
    });

    doc.addEventListener("keydown", e => {
      if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleModal();
      } else if (e.key === "Escape" && !backdrop.hidden && !currentSection) {
        closeModal();
      }
    });
  }

  function init(doc = typeof document !== "undefined" ? document : null) {
    if (!doc) return null;
    const nav = decorateTopTabs(doc);
    const ribbon = mountNavRibbonFlow(doc, nav);
    const triggerBurst = mountUniversalTransitions(doc);
    mountCockpitHeader(doc);
    mountQuickRadialCommand(doc);
    return { nav, ribbon, triggerBurst };
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init(document));
    } else {
      init(document);
    }
  }

  root.QBAxonShell = {
    init,
    decorateTopTabs,
    mountNavRibbonFlow,
    mountUniversalTransitions,
    mountCockpitHeader,
    mountQuickRadialCommand,
    TAB_META
  };
})(typeof window !== "undefined" ? window : globalThis);
