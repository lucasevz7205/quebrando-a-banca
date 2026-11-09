// The study document is rendered in a same-origin frame. In the isolated
// administrative preview the header uses its static artwork.
export function observeStudyMotion(frame) {
  let detach = () => {};
  function attach() {
    detach();
    detach = () => {};
    const doc = frame.contentDocument;
    const canvas = doc?.querySelector("[data-study-motion]");
    const toggle = doc?.querySelector("[data-motion-toggle]");
    const today = doc?.getElementById("tab-painel");
    if (!canvas || !toggle || !today) return;

    const host = canvas.closest(".qb-header-row");
    const view = doc.defaultView;
    const motion = view.matchMedia("(prefers-reduced-motion: reduce)");
    let enabled = !motion.matches;
    let visible = false;
    let stop = null;
    let revision = 0;
    let available = true;

    function updateLabel() {
      const label = enabled ? "Pausar animação" : "Ativar animação";
      toggle.title = label;
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("aria-pressed", String(enabled));
    }
    function sync() {
      const turn = ++revision;
      if (!enabled || !visible || doc.hidden || today.getAttribute("aria-current") !== "page" || !available) {
        stop?.();
        stop = null;
        return;
      }
      if (stop) return;
      import("./simulation").then(({ startMotion }) => {
        if (turn !== revision) return;
        stop = startMotion(canvas, host);
        if (!stop) unavailable();
      }).catch(() => {
        if (turn === revision) unavailable();
      });
    }
    function unavailable() {
      available = false;
      toggle.hidden = true;
    }
    function changePreference() {
      enabled = !motion.matches;
      updateLabel();
      sync();
    }
    function toggleMotion() {
      enabled = !enabled;
      updateLabel();
      sync();
    }
    toggle.hidden = false;
    updateLabel();
    const intersection = new view.IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const navigation = new view.MutationObserver(sync);
    intersection.observe(host);
    navigation.observe(today, { attributes: true, attributeFilter: ["aria-current"] });
    toggle.addEventListener("click", toggleMotion);
    canvas.addEventListener("webglcontextlost", unavailable);
    doc.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", changePreference);
    detach = () => {
      revision++;
      stop?.();
      intersection.disconnect();
      navigation.disconnect();
      toggle.removeEventListener("click", toggleMotion);
      canvas.removeEventListener("webglcontextlost", unavailable);
      doc.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", changePreference);
    };
  }
  frame.addEventListener("load", attach);
  attach();
  return () => {
    frame.removeEventListener("load", attach);
    detach();
  };
}
