import { createAxonReveal } from "./axon-reveal";

export function observeMindMap(frame) {
  let detach = () => {};
  function attach() {
    detach();
    detach = () => {};
    const doc = frame.contentDocument;
    const main = doc?.getElementById("main");
    if (!main) return;

    const view = doc.defaultView;
    let panel = null, release = () => {}, mode = "list", lastPath = "", lastTopic = "", rememberedBranches = null, consumedFocusNonce = "";
    function sync() {
      const next = main.querySelector("[data-map3]");
      if (next === panel) return;
      release();
      release = () => {};
      panel = next;
      if (!next) { mode = "list"; lastPath = ""; lastTopic = ""; return; }

      const graph = JSON.parse(next.dataset.graph);
      const incomingNonce=next.dataset.mapFocusNonce||"";
      const requested=next.dataset.mapFocusPath||"";
      const deepLink=!!incomingNonce && incomingNonce!==consumedFocusNonce;
      if (graph.topic !== lastTopic) {lastPath = "";rememberedBranches = null;}
      lastTopic = graph.topic;
      const list = next.parentElement.querySelector("[data-map-list]");
      const explore = next.querySelector("[data-map-explore]");
      const status = next.querySelector("[data-map-status]");
      const chooser = next.querySelector("[data-map-select]");
      const pathBar = next.querySelector("[data-map-path]");
      const detail = next.querySelector("[data-map-detail]");
      const quickBranches = next.querySelector("[data-map-quick-branches]");
      const branchStatus = next.querySelector("[data-map-branch-status]");
      const branchButtons = [...next.querySelectorAll("[data-map-branch]")];
      const modes = [...next.querySelectorAll("[data-map-mode]")];
      let scene = null, version = 0, disposed = false;
      /* Percurso de evocação: ramo por ramo, na ordem do mapa (11/11/2026) */
      const tourPaths = graph.nodes.map(n => n.path);
      let tourIndex = -1;
      const reveal = createAxonReveal(next.querySelector("[data-map-stage]"), view);
      const nodes = new Map(graph.nodes.map(n => [n.path,n]));
      const quickButtons=[];
      for(const node of graph.nodes.filter(n=>n.parent==="root")){
        const button=doc.createElement("button");
        button.type="button";
        button.dataset.mapJump=node.path;
        button.textContent=node.title;
        button.title="Focar "+node.title+" no mapa tridimensional";
        button.setAttribute("aria-pressed","false");
        button.style.setProperty("--qb-jump-dot","var(--qb-node-"+(node.status||"sem-evidencia")+")");
        quickBranches?.append(button);
        quickButtons.push(button);
      }
      chooser.add(new view.Option(graph.title + " · conceito central", "root"));
      for (const node of graph.nodes) {
        const indent = "› ".repeat(node.path.split(".").length);
        chooser.add(new view.Option(indent + node.title, node.path));
      }
      const byId = new Map();
      for (const node of graph.nodes) byId.set(node.id, byId.has(node.id) ? null : node.path);
      function updateBranchControls(){
        if(!scene)return;
        const summary=scene.branchSummary();
        if(branchStatus)branchStatus.textContent=summary.visible+" de "+summary.total+" conceitos visíveis";
        for(const button of branchButtons){
          const action=button.dataset.mapBranch;
          button.disabled=action==="open" ? (!scene.hasChildren(lastPath)||scene.isExpanded(lastPath))
            : action==="close" ? (!scene.hasChildren(lastPath)||!scene.isExpanded(lastPath))
            : action==="all" ? summary.visible===summary.total
            : false;
        }
      }
      // Ao fechar o conceito, devolver o foco a um controle seguro, sem abrir o seletor nativo.
      function returnFocus() {
        const target = next.querySelector('[data-map-open]') || next.querySelector('[data-map-stage]');
        if (!target) return;
        if (!target.hasAttribute('tabindex') && target.tagName !== 'BUTTON') target.setAttribute('tabindex', '-1');
        target.focus({preventScroll:true});
      }
      function select(path, zoom = true, expand = false) {
        lastPath = nodes.has(path) ? path : "root";
        chooser.value = lastPath;
        for(const button of quickButtons){
          const p=button.dataset.mapJump;
          button.setAttribute("aria-pressed",String(lastPath===p||lastPath.startsWith(p+".")));
        }
        const origin = scene?.pointFor(lastPath);
        scene?.select(lastPath, zoom);
        updateBranchControls();
        pathBar.replaceChildren();
        const parts = lastPath === "root" ? [] : lastPath.split(".");
        const paths = ["root", ...parts.map((_, i) => parts.slice(0, i + 1).join("."))];
        for (const path of paths) {
          const button = doc.createElement("button");
          button.type = "button";
          button.dataset.mapPathTarget = path;
          button.textContent = path === "root" ? "Visão geral" : nodes.get(path).title;
          if (path === lastPath) button.setAttribute("aria-current", "location");
          pathBar.append(button);
        }
        const tour = tourIndex >= 0 && tourPaths[tourIndex] === lastPath ? { i: tourIndex + 1, n: tourPaths.length } : null;
        next.dispatchEvent(new view.CustomEvent("qb-map-render-node", { detail: { topic: graph.topic, path: lastPath, tour } }));
        detail.querySelector(":scope > .qb-mastery-detail, .m-no > .qb-mastery-detail")?.setAttribute("open", "");
        if(mode === "3d") {
          if(expand) reveal.show(origin,graph.topic+":"+lastPath);
          else reveal.hide(true);
        }
      }
      function showList(message = "") {
        reveal.hide(true);
        version++;
        mode = "list";
        if(scene)rememberedBranches=scene.expandedPaths();
        scene?.dispose();
        scene = null;
        explore.hidden = true;
        list.hidden = false;
        status.textContent = message;
        modes.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mapMode === "list")));
        if(lastPath!=="root"){
          // WebGL fallback must land on the SAME concept, not at the chapter.
          const wanted=graph.topic+":"+lastPath;
          const target=[...list.querySelectorAll("[data-map-node]")].find(n=>n.dataset.mapNode===wanted);
          if(target){
            target.classList.add("qb-map-remission-target");
            view.requestAnimationFrame(()=>target.scrollIntoView({block:"center",behavior:"smooth"}));
          }
        }
      }
      async function show3d(openRemission = false, fromQuestion = false) {
        if (scene) return;
        const request = ++version;
        mode = "3d";
        status.textContent = "Carregando visualização…";
        try {
          const { startMapScene } = await import("./scene");
          if (disposed || request !== version) return;
          explore.hidden = false;
          scene = startMapScene(next, graph, select, () => showList("A visualização 3D ficou indisponível. A lista está aberta."), rememberedBranches);
          if (!scene) throw new Error("WebGL2 unavailable");
          status.textContent = "";
          list.hidden = true;
          modes.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mapMode === "3d")));
          select(lastPath || "root", lastPath !== "" && lastPath !== "root", openRemission && lastPath!=="root");
          updateBranchControls();
          if(fromQuestion){
            // Selecting the right node is not enough if the actual 3D map
            // remains below the fold. Bring the map itself into the viewport.
            view.requestAnimationFrame(()=>{
              const target=openRemission?next:next.parentElement.querySelector(".qb-map-remission-banner")||next;
              target.scrollIntoView({block:"start",behavior:view.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
            });
          }
        } catch {
          if (!disposed && request === version) showList("O 3D está indisponível neste navegador. A lista está aberta.");
        }
      }
      function act(event) {
        const button = event.target.closest("button");
        if (!button) return;
        if (button.hasAttribute("data-map-close")) {
          reveal.hide();
          returnFocus();
          return;
        }
        if (button.dataset.mapMode === "list") showList();
        if (button.dataset.mapMode === "3d") show3d();
        if (button.dataset.mapCamera === "reset") {select("root", true, false);reveal.hide();}
        else if (button.dataset.mapCamera) scene?.adjust(button.dataset.mapCamera);
        if (button.dataset.mapBranch && scene) {
          const action=button.dataset.mapBranch;
          scene.setBranchMode(action,lastPath||"root");
          select(action==="minimal"?"root":lastPath,false,false);
          updateBranchControls();
          return;
        }
        if (button.dataset.mapJump) select(button.dataset.mapJump,true,false);
        if (button.dataset.mapPathTarget) select(button.dataset.mapPathTarget,true,true);
        if (button.dataset.mir && byId.get(button.dataset.mir)) select(byId.get(button.dataset.mir));
        if (button.hasAttribute("data-map-open")) select(lastPath, true, true);
        if (button.hasAttribute("data-map-tour") && tourPaths.length) {
          tourIndex = 0;
          select(tourPaths[0], true, true);
        }
      }
      function change() { select(chooser.value,true,false); }
      function tourNext() {
        if (tourIndex < 0) return;
        tourIndex++;
        if (tourIndex >= tourPaths.length) {
          tourIndex = -1;
          reveal.hide();
          select("root", true, false);
          if (status) status.textContent = "Percurso concluído.";
          return;
        }
        select(tourPaths[tourIndex], true, true);
      }
      function keydown(event) {
        if(event.key === "Escape" && reveal.active) {
          reveal.hide();
          returnFocus();
          event.preventDefault();
        }
      }
      next.addEventListener("click", act);
      next.addEventListener("keydown", keydown);
      next.addEventListener("qb-map-tour-next", tourNext);
      chooser.addEventListener("change", change);
      release = () => {
        disposed = true;
        version++;
        reveal.dispose();
        if(scene)rememberedBranches=scene.expandedPaths();
        scene?.dispose();
        next.removeEventListener("click", act);
        next.removeEventListener("keydown", keydown);
        next.removeEventListener("qb-map-tour-next", tourNext);
        chooser.removeEventListener("change", change);
      };
      next.hidden = false;
      if(deepLink){
        consumedFocusNonce=incomingNonce;
        lastPath=nodes.has(requested)?requested:"root";
        show3d(lastPath!=="root",true);
      } else if (mode === "3d") show3d();
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
