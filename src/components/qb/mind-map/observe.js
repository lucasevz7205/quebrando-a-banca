export function observeMindMap(frame) {
  let detach = () => {};
  function attach() {
    detach();
    detach = () => {};
    const doc = frame.contentDocument;
    const main = doc?.getElementById("main");
    if (!main) return;

    const view = doc.defaultView;
    let panel = null, release = () => {}, mode = "list", lastPath = "", lastTopic = "";
    function sync() {
      const next = main.querySelector("[data-map3]");
      if (next === panel) return;
      release();
      release = () => {};
      panel = next;
      if (!next) { mode = "list"; lastPath = ""; lastTopic = ""; return; }

      const graph = JSON.parse(next.dataset.graph);
      if (graph.topic !== lastTopic) lastPath = "";
      lastTopic = graph.topic;
      const list = next.parentElement.querySelector("[data-map-list]");
      const explore = next.querySelector("[data-map-explore]");
      const status = next.querySelector("[data-map-status]");
      const chooser = next.querySelector("[data-map-select]");
      const open = next.querySelector("[data-map-open]");
      const modes = [...next.querySelectorAll("[data-map-mode]")];
      let scene = null, version = 0, disposed = false;
      const nodes = new Map(graph.nodes.map(n => [n.path,n]));
      chooser.add(new view.Option(graph.title + " · conceito central", "root"));
      for (const node of graph.nodes) {
        const indent = "› ".repeat(node.path.split(".").length);
        chooser.add(new view.Option(indent + node.title, node.path));
      }
      function select(path) {
        lastPath = nodes.has(path) ? path : "root";
        chooser.value = lastPath;
        open.disabled = lastPath === "root";
        scene?.select(lastPath);
      }
      function showList(message = "") {
        version++;
        mode = "list";
        scene?.dispose();
        scene = null;
        explore.hidden = true;
        list.hidden = false;
        status.textContent = message;
        modes.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mapMode === "list")));
      }
      async function show3d() {
        if (scene) return;
        const request = ++version;
        mode = "3d";
        status.textContent = "Carregando visualização…";
        try {
          const { startMapScene } = await import("./scene");
          if (disposed || request !== version) return;
          explore.hidden = false;
          scene = startMapScene(next, graph, select, () => showList("A visualização 3D ficou indisponível. A lista está aberta."));
          if (!scene) throw new Error("WebGL2 unavailable");
          status.textContent = "";
          list.hidden = true;
          modes.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mapMode === "3d")));
          select(lastPath || "root");
        } catch {
          if (!disposed && request === version) showList("O 3D está indisponível neste navegador. A lista está aberta.");
        }
      }
      function act(event) {
        const button = event.target.closest("button");
        if (!button) return;
        if (button.dataset.mapMode === "list") showList();
        if (button.dataset.mapMode === "3d") show3d();
        if (button.dataset.mapCamera) scene?.adjust(button.dataset.mapCamera);
        if (button.hasAttribute("data-map-open") && nodes.has(lastPath)) {
          const path = lastPath;
          showList();
          doc.dispatchEvent(new view.CustomEvent("qb-map-open-node", { detail: { topic: graph.topic, path } }));
        }
      }
      function change() { select(chooser.value); }
      next.addEventListener("click", act);
      chooser.addEventListener("change", change);
      release = () => {
        disposed = true;
        version++;
        scene?.dispose();
        next.removeEventListener("click", act);
        chooser.removeEventListener("change", change);
      };
      next.hidden = false;
      if (mode === "3d") show3d();
    }
    const observer = new view.MutationObserver(sync);
    observer.observe(main, { childList: true });
    sync();
    detach = () => { observer.disconnect(); release(); };
  }
  frame.addEventListener("load", attach);
  attach();
  return () => {
    frame.removeEventListener("load", attach);
    detach();
  };
}
