import {
  BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, LineBasicMaterial, LineDashedMaterial, LineSegments, Matrix4,
  MOUSE, TOUCH, MeshBasicMaterial, PerspectiveCamera, Plane, Raycaster, Scene, SphereGeometry, Vector2, Vector3, WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { placeMap } from "./layout";
import { createBranchVisibility } from "./branch-visibility";
import { createNodeActivation, DOUBLE_CLICK_MS } from "./node-activation";
import { directionalPanOffset, initials, nearestProjectedHit, resolveLabelPositions, wheelZoomFactor } from "./mouse-navigation";

/* Câmera em 2,5D (11/11/2026): o mapa é lido de frente; inclinação máxima de 35°
 * em qualquer direção, nunca de cabeça para baixo. */
export const CAMERA_TILT_LIMIT = 35 * Math.PI / 180;

export function startMapScene(panel, graph, onSelect, onLost, expandedPaths = null) {
  const doc = panel.ownerDocument, view = doc.defaultView;
  const stage = panel.querySelector("[data-map-stage]"), labels = panel.querySelector("[data-map-labels]");
  const canvas = doc.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (!gl) return null;
  const renderer = new WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(1.65, view.devicePixelRatio || 1));
  stage.prepend(canvas);
  const camera = new PerspectiveCamera(42, 1, .1, 5000), scene = new Scene();
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.zoomToCursor = true;
  controls.rotateSpeed = .52;
  controls.zoomSpeed = .74;
  // Como num mapa: arrastar desloca; girar é a ação secundária.
  controls.mouseButtons = {LEFT:MOUSE.PAN,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.ROTATE};
  controls.touches = {ONE:TOUCH.PAN,TWO:TOUCH.DOLLY_ROTATE};
  controls.minPolarAngle = Math.PI / 2 - CAMERA_TILT_LIMIT;
  controls.maxPolarAngle = Math.PI / 2 + CAMERA_TILT_LIMIT;
  controls.minAzimuthAngle = -CAMERA_TILT_LIMIT;
  controls.maxAzimuthAngle = CAMERA_TILT_LIMIT;

  const coords = placeMap(graph);
  const branches = createBranchVisibility(graph, {expandedPaths});
  const byPath = new Map(coords.map((node,i) => [node.path, i]));
  const byId = new Map(coords.filter(n => n.id).map(n => [n.id, n.path]));
  const world = coords.map(n => new Vector3(n.x,n.y,n.z));
  const reach = Math.max(4, ...world.map(v => v.length()));
  const geometry = new SphereGeometry(1, 12, 8);
  const material = new MeshBasicMaterial();
  const spheres = new InstancedMesh(geometry, material, coords.length);
  spheres.frustumCulled = false; // visible instance slots are compacted on each branch toggle
  const computed = view.getComputedStyle(panel);
  /* Admin: o núcleo é a placa dourada (HTML) centrada no nó; a esfera raiz e o aro de foco ficam minúsculos para não duplicar a forma. */
  const rootHidden = doc.documentElement.classList.contains("qb-admin-experience");
  const sphereScale = depth => depth === 0 ? (rootHidden ? .001 : .54) : depth === 1 ? .37 : .22;
  // Tokens do design system (só existem no admin); fora dele valem as cores originais.
  const token = (name, fallback) => computed.getPropertyValue(name).trim() || fallback;
  const colorFor = node => computed.getPropertyValue("--qb-node-" + (node.status || "sem-evidencia")).trim() || "#9da8c4";
  // Sem partículas decorativas: menos carga visual durante a evocação (11/11/2026).
  coords.forEach((node,i) => {
    const scale = sphereScale(node.depth);
    spheres.setMatrixAt(i, new Matrix4().makeScale(scale,scale,scale).setPosition(world[i]));
    spheres.setColorAt(i, new Color(colorFor(node)));
  });
  scene.add(spheres);
  /* Cada ligação herda o indicador do conceito de destino.
   * A conexão começa num tom de fundo e termina na cor da evidência do filho.
   * Falta de respostas/cartões continua neutra mesmo que o pai esteja forte.
   */
  const hierarchyPairs=coords.slice(1).map(n=>[n.parent,n.path]);
  const crossPairs=graph.links.map(([a,b])=>[byId.get(a),byId.get(b)]);
  function lineGeometry(pairs, crossLink = false) {
    const positions=[],colors=[];
    const backdrop=new Color(token("--qbds-map-backdrop", "#232d4e"));
    for(const [a,b] of pairs) {
      if(!byPath.has(a)||!byPath.has(b))continue;
      const source=coords[byPath.get(a)], target=coords[byPath.get(b)];
      const from=world[byPath.get(a)],to=world[byPath.get(b)];
      positions.push(from.x,from.y,from.z,to.x,to.y,to.z);
      const tip=new Color(colorFor(target));
      const base=crossLink ? new Color(colorFor(source)).lerp(backdrop,.3)
                            : tip.clone().lerp(backdrop,.57);
      colors.push(base.r,base.g,base.b,tip.r,tip.g,tip.b);
    }
    const geometry=new BufferGeometry();
    geometry.setAttribute("position",new Float32BufferAttribute(positions,3));
    geometry.setAttribute("color",new Float32BufferAttribute(colors,3));
    return geometry;
  }
  const hierarchy = new LineSegments(lineGeometry(hierarchyPairs),
    new LineBasicMaterial({vertexColors:true,transparent:true,opacity:.94}));
  const cross = new LineSegments(lineGeometry(crossPairs,true),
    new LineDashedMaterial({vertexColors:true,dashSize:.28,gapSize:.16,transparent:true,opacity:.83}));
  cross.computeLineDistances();
  scene.add(hierarchy,cross);
  const focus = new InstancedMesh(geometry, new MeshBasicMaterial({color: token("--qbds-map-focus", "#e2ddff"), wireframe: true, transparent: true, opacity: .7}), 1);
  focus.visible = false;
  scene.add(focus);

  const point = new Vector3();
  const visibleSlots = [];
  let visiblePaths = branches.visiblePaths();
  const tagList = coords.map((node,i) => {
    const wrapper=doc.createElement("span");
    wrapper.className="qb-map3-node-actions";
    const tag = doc.createElement("button");
    tag.type = "button";
    tag.textContent = node.title;
    const sample=node.respondidas ? " · Questões: " + Math.round(node.percentual*100) + "%, " + node.respondidas + "/" + node.questoes + " respondidas" : " · Questões: sem respostas válidas";
    const cards=node.flashcardsAvaliados ? " · Flashcards: " + node.flashcardsLembrados + "/" + node.flashcardsAvaliados + " lembrados" : node.flashcards ? " · Flashcards: nenhum avaliado" : "";
    tag.title=node.title + (node.statusLabel ? " · " + node.statusLabel + sample + cards : "") + " · Toque para selecionar; toque de novo para evocar o conceito";
    tag.style.setProperty("--qb-node-dot",colorFor(node));
    tag.className = node.depth ? "qb-map3-tag" : "qb-map3-tag qb-map3-origin";
    tag.setAttribute("aria-pressed", "false");
    tag.addEventListener("click", event => activateNode(node.path,event));
    wrapper.append(tag);
    let toggle=null;
    if(branches.hasChildren(node.path)){
      toggle=doc.createElement("button");
      toggle.type="button";
      toggle.className="qb-map3-branch-toggle";
      toggle.dataset.mapToggleNode=node.path;
      toggle.title="Abrir ou fechar os subramos de " + node.title;
      toggle.setAttribute("aria-label","Abrir ou fechar ramificações de " + node.title);
      toggle.addEventListener("click",event=>{
        event.stopPropagation();
        toggleBranch(node.path);
        onSelect(node.path,false,false);
      });
      wrapper.append(toggle);
    }
    labels.append(wrapper);
    return {wrapper,tag,toggle,i};
  });
  let width = 0, height = 0, distance = 0, selected = "root", animation = 0;
  // Keep the target stationary during the double-click window.
  // The first click selects immediately; zoom follows only if no second click.
  let pendingFocus=0;
  function cancelPendingFocus(){
    if(pendingFocus){view.clearTimeout(pendingFocus);pendingFocus=0;}
  }
  const activateNode=createNodeActivation((path,_zoom,explain)=>{
    cancelPendingFocus();
    onSelect(path,false,explain);
    if(!explain){
      pendingFocus=view.setTimeout(()=>{
        pendingFocus=0;
        onSelect(path,true,false);
      },DOUBLE_CLICK_MS+20);
    }
  });
  function syncVisibility(){
    visiblePaths=branches.visiblePaths();
    visibleSlots.length=0;
    let slot=0;
    for(let i=0;i<coords.length;i++){
      const node=coords[i];
      if(!visiblePaths.has(node.path))continue;
      const scale=sphereScale(node.depth);
      spheres.setMatrixAt(slot,new Matrix4().makeScale(scale,scale,scale).setPosition(world[i]));
      spheres.setColorAt(slot,new Color(colorFor(node)));
      visibleSlots.push(i);
      slot++;
    }
    spheres.count=slot;
    spheres.instanceMatrix.needsUpdate=true;
    if(spheres.instanceColor)spheres.instanceColor.needsUpdate=true;
    hierarchy.geometry.dispose();
    hierarchy.geometry=lineGeometry(hierarchyPairs.filter(([parent,child])=>visiblePaths.has(parent)&&visiblePaths.has(child)));
    cross.geometry.dispose();
    cross.geometry=lineGeometry(crossPairs.filter(([from,to])=>visiblePaths.has(from)&&visiblePaths.has(to)),true);
    cross.computeLineDistances();
    render();
  }
  function toggleBranch(path){
    cancelPendingFocus();
    if(!branches.toggle(path))return branches.summary();
    syncVisibility();
    zoom(path);
    return branches.summary();
  }
  function setBranchMode(action,path="root"){
    cancelPendingFocus();
    if(action==="all")branches.openAll();
    else if(action==="minimal")branches.collapseAll();
    else if(action==="open")branches.open(path);
    else if(action==="close")branches.close(path);
    else if(action==="toggle")branches.toggle(path);
    syncVisibility();
    if(action==="all"||action==="minimal")reset();
    else if(action==="open"||action==="close"||action==="toggle")zoom(path);
    return branches.summary();
  }
  const motion=view.matchMedia("(prefers-reduced-motion: reduce)");
  const targetStart=new Vector3(),cameraStart=new Vector3(),targetEnd=new Vector3(),cameraEnd=new Vector3();
  function cancelZoom(){view.cancelAnimationFrame(animation);animation=0;}
  function onControlStart(){cancelPendingFocus();cancelZoom();}
  controls.addEventListener("start",onControlStart);
  function render() {
    if (!width || !height) return;
    renderer.render(scene,camera);
    // Prioritize selected concept, its direct neighborhood and main branches.
    // Colliding labels are suppressed, NOT their spheres or diagnostic edges.
    const selectedParent=coords[byPath.get(selected)]?.parent;
    const candidates=[];
    for (const {i,toggle} of tagList) {
      const node=coords[i];
      if(!visiblePaths.has(node.path))continue;
      const ancestor=selected.startsWith(node.path+".");
      const adjacent=node.path===selected||node.parent===selected||node.parent===selectedParent;
      if(!(adjacent||ancestor||node.path==="root"||node.parent==="root"))continue;
      point.copy(world[i]).project(camera);
      if(Math.abs(point.z)>1||Math.abs(point.x)>1||Math.abs(point.y)>1)continue;
      const priority=node.path===selected?0:node.path==="root"?1:ancestor?2:node.parent===selected?3:node.parent==="root"?4:5;
      candidates.push({path:node.path,index:i,priority,
        x:(point.x+1)*width/2,y:(1-point.y)*height/2,
        width:Math.min(270,Math.max(75,node.title.length*6.4+22+(toggle?34:0))),
        shortWidth:initials(node.title).length*9+22+(toggle?34:0),
        height:30});
    }
    const displayed=resolveLabelPositions(candidates,{width,height,padding:8});
    for(const {wrapper,tag,toggle,i} of tagList){
      const node=coords[i],place=displayed.get(node.path);
      wrapper.hidden=!place;
      if(!place)continue;
      wrapper.style.left=place.x+"px";
      wrapper.style.top=place.y+"px";
      const label=place.short?initials(node.title):node.title;
      if(tag.textContent!==label)tag.textContent=label;
      tag.setAttribute("aria-label",node.title);
      wrapper.dataset.short=place.short?"true":"false";
      tag.setAttribute("aria-pressed",String(selected===node.path));
      if(toggle){
        const open=branches.isExpanded(node.path);
        toggle.textContent=open?"−":"+";
        toggle.setAttribute("aria-expanded",String(open));
        toggle.setAttribute("aria-label",(open?"Recolher":"Abrir")+" "+branches.childCount(node.path)+" subramos de "+node.title);
      }
    }
  }
  function fitDistance(){
    // Base the overview on VISIBLE nodes, not on hidden deep descendants.
    const radius=Math.max(4,...visibleSlots.map(i=>world[i].length()));
    return (radius+2.2)/(Math.tan(camera.fov*Math.PI/360)*Math.min(1,camera.aspect))*1.05;
  }
  function reset() {
    cancelZoom();
    distance=fitDistance();
    controls.target.set(0,0,0);
    camera.position.set(0,0,distance); // de frente: o plano do mapa fica legível
    controls.update();
    render();
  }
  function resize() {
    const nextWidth = stage.clientWidth, nextHeight = stage.clientHeight;
    if (!nextWidth || !nextHeight) return;
    width = nextWidth;
    height = nextHeight;
    camera.aspect = width / height;
    const initial=!distance;
    camera.updateProjectionMatrix();
    distance=fitDistance();
    controls.minDistance=2.8;
    controls.maxDistance=Math.max(distance*4.2,reach*4.5,80);
    renderer.setSize(width,height,false);
    if(initial)reset();
    else {controls.update();render();}
  }
  function zoom(path) {
    if(!distance)return;
    cancelZoom();
    const i=byPath.get(path);
    if(i===undefined)return;
    const center=world[i];
    const span=coords.reduce((r,node,j)=>node.parent===path&&visiblePaths.has(node.path)
      ?Math.max(r,center.distanceTo(world[j])):r,1.5);
    const zoomDistance=path==="root"?fitDistance():Math.max(5.5,
      (span+2.7)/(Math.tan(camera.fov*Math.PI/360)*Math.min(1,camera.aspect)));
    targetStart.copy(controls.target);cameraStart.copy(camera.position);
    targetEnd.copy(center);
    const direction=camera.position.clone().sub(controls.target).normalize();
    cameraEnd.copy(center).addScaledVector(direction,zoomDistance);
    if(motion.matches){
      controls.target.copy(targetEnd);camera.position.copy(cameraEnd);controls.update();render();return;
    }
    const start=view.performance.now();
    const tick=now=>{
      const t=Math.min(1,(now-start)/420), eased=t*t*(3-2*t);
      controls.target.lerpVectors(targetStart,targetEnd,eased);
      camera.position.lerpVectors(cameraStart,cameraEnd,eased);
      controls.update();
      if(t<1) animation=view.requestAnimationFrame(tick); else animation=0;
    };
    animation=view.requestAnimationFrame(tick);
  }
  function select(path, shouldZoom = false) {
    cancelPendingFocus();
    if(branches.reveal(path))syncVisibility();
    selected = path;
    const i = byPath.get(path);
    focus.visible = i !== undefined;
    if (focus.visible) {
      const r = coords[i].depth === 0 ? (rootHidden ? .001 : .69) : coords[i].depth === 1 ? .52 : .35;
      focus.setMatrixAt(0,new Matrix4().makeScale(r,r,r).setPosition(world[i]));
      focus.instanceMatrix.needsUpdate = true;
      focus.frustumCulled = false;
    }
    if(shouldZoom)zoom(path);
    render();
  }
  function pointFor(path) {
    const i=byPath.get(path);
    if(i===undefined || !width || !height)return {x:width/2,y:height/2};
    const projected=world[i].clone().project(camera);
    const clamp=(n,limit)=>Math.min(limit-14,Math.max(14,n));
    return {x:clamp((projected.x+1)*width/2,width),y:clamp((1-projected.y)*height/2,height)};
  }
  function adjust(action) {
    cancelPendingFocus();
    cancelZoom();
    if (action === "reset") { reset(); return; }
    if (action === "front") { // vista de frente, mantendo o foco atual
      const d=camera.position.distanceTo(controls.target);
      camera.position.copy(controls.target).add(new Vector3(0,0,d));
      controls.update(); render(); return;
    }
    const pan=directionalPanOffset(action,camera.position.distanceTo(controls.target),camera.fov,camera.aspect);
    if (pan) {
      camera.updateMatrixWorld();
      const right=new Vector3().setFromMatrixColumn(camera.matrixWorld,0);
      const up=new Vector3().setFromMatrixColumn(camera.matrixWorld,1);
      const shift=right.multiplyScalar(pan.right).add(up.multiplyScalar(pan.up));
      camera.position.add(shift);
      controls.target.add(shift);
      controls.update();
      render();
      return;
    }
    const offset = new Vector3().subVectors(camera.position,controls.target);
    if (action === "left" || action === "right") offset.applyAxisAngle(new Vector3(0,1,0), action === "left" ? .28 : -.28);
    else offset.setLength(Math.max(controls.minDistance,Math.min(controls.maxDistance,offset.length() * (action === "in" ? .82 : 1.22))));
    camera.position.copy(controls.target).add(offset);
    controls.update();
    render();
  }
  // Scroll always zooms toward the pointer, including when it is over a label.
  // Capture the wheel before OrbitControls can apply its separate wheel zoom;
  // pinch gestures still belong to OrbitControls.
  const wheelRay=new Raycaster(), wheelPointer=new Vector2(), wheelPlane=new Plane();
  const wheelNormal=new Vector3(), wheelBefore=new Vector3(), wheelAfter=new Vector3();
  function onWheel(event){
    const concept=stage.querySelector("[data-map-concept]");
    if(concept&&!concept.hidden)return; // explanation must scroll independently
    if(!event.deltaY)return;
    event.preventDefault();
    event.stopPropagation();
    if(!width||!height)return;
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    cancelZoom();
    cancelPendingFocus();
    wheelPointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
    camera.getWorldDirection(wheelNormal);
    wheelPlane.setFromNormalAndCoplanarPoint(wheelNormal,controls.target);
    wheelRay.setFromCamera(wheelPointer,camera);
    const anchored=!!wheelRay.ray.intersectPlane(wheelPlane,wheelBefore);
    const offset=camera.position.clone().sub(controls.target);
    const nextDistance=Math.max(controls.minDistance,Math.min(controls.maxDistance,
      offset.length()*wheelZoomFactor(event.deltaY,event.deltaMode,height)));
    camera.position.copy(controls.target).add(offset.setLength(nextDistance));
    controls.update();
    if(anchored){
      wheelRay.setFromCamera(wheelPointer,camera);
      if(wheelRay.ray.intersectPlane(wheelPlane,wheelAfter)){
        const translation=wheelBefore.clone().sub(wheelAfter);
        controls.target.add(translation);
        camera.position.add(translation);
        controls.update();
      }
    }
    render();
  }
  const ray = new Raycaster(), mouse = new Vector2();
  let down = null, allowClick = false;
  function pointerDown(e) { down = [e.clientX,e.clientY]; allowClick=false; }
  function pointerUp(e) {
    allowClick=!!down && Math.hypot(e.clientX-down[0],e.clientY-down[1])<=7;
    down=null;
  }
  function clickNode(e) {
    if(!allowClick)return; // drag/rotation should not select a concept
    allowClick=false;
    const box=canvas.getBoundingClientRect();
    mouse.set((e.clientX-box.left)/box.width*2-1,1-(e.clientY-box.top)/box.height*2);
    ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObject(spheres)[0];
    const index=hit&&visibleSlots[hit.instanceId];
    let path=index!==undefined?coords[index].path:null;
    if(!path){
      const targets=visibleSlots.map(i=>{
        const p=world[i].clone().project(camera);
        return {path:coords[i].path,x:(p.x+1)*width/2,y:(1-p.y)*height/2,
          visible:p.z>=-1&&p.z<=1, radius:coords[i].depth<2?10:7};
      });
      path=nearestProjectedHit(targets,{x:(e.clientX-box.left)*width/box.width,
        y:(e.clientY-box.top)*height/box.height},view.matchMedia("(pointer:coarse)").matches?34:23);
    }
    if(path)activateNode(path,e);
  }
  let lastHover=0;
  function onPointerMove(e){
    if(e.buttons||!width||!height)return;
    const stamp=Number(e.timeStamp)||view.performance.now();
    if(stamp-lastHover<38)return;
    lastHover=stamp;
    const box=canvas.getBoundingClientRect();
    if(!box.width||!box.height)return;
    mouse.set((e.clientX-box.left)/box.width*2-1,1-(e.clientY-box.top)/box.height*2);
    ray.setFromCamera(mouse,camera);
    canvas.style.cursor=ray.intersectObject(spheres).length?"pointer":"grab";
  }
  function onContextMenu(e){e.preventDefault();}
  function onPointerCancel(){down=null;allowClick=false;}
  const observer = new view.ResizeObserver(resize);
  observer.observe(stage);
  controls.addEventListener("change",render);
  canvas.addEventListener("pointerdown",pointerDown);
  canvas.addEventListener("pointerup",pointerUp);
  canvas.addEventListener("pointercancel",onPointerCancel);
  canvas.addEventListener("pointermove",onPointerMove);
  canvas.addEventListener("click",clickNode);
  canvas.addEventListener("contextmenu",onContextMenu);
  stage.addEventListener("wheel",onWheel,{capture:true,passive:false});
  canvas.addEventListener("webglcontextlost",onLost);
  syncVisibility();
  resize();
  return {
    select, adjust, pointFor, setBranchMode,
    branchSummary:()=>branches.summary(),
    expandedPaths:()=>branches.expandedPaths(),
    hasChildren:path=>branches.hasChildren(path),
    isExpanded:path=>branches.isExpanded(path),
    dispose() {
      observer.disconnect();
      cancelPendingFocus();
      cancelZoom();
      controls.removeEventListener("start",onControlStart);
      controls.dispose();
      canvas.removeEventListener("pointerdown",pointerDown);
      canvas.removeEventListener("pointerup",pointerUp);
      canvas.removeEventListener("pointercancel",onPointerCancel);
      canvas.removeEventListener("pointermove",onPointerMove);
      canvas.removeEventListener("click",clickNode);
      canvas.removeEventListener("contextmenu",onContextMenu);
      stage.removeEventListener("wheel",onWheel,true);
      canvas.removeEventListener("webglcontextlost",onLost);
      hierarchy.geometry.dispose();
      hierarchy.material.dispose();
      cross.geometry.dispose();
      cross.material.dispose();
      focus.material.dispose();
      focus.dispose();
      spheres.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      labels.replaceChildren();
    },
  };
}
