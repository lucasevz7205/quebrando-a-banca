/* AXON-style concept reveal. Uses a short-lived particle morph above the existing
 * Three.js scene, never a second WebGL context. No personal data leaves the
 * authenticated iframe. The effect stops entirely after the transition.
 */
export function createAxonReveal(stage, win) {
  const panel = stage.querySelector("[data-map-concept]");
  const card = panel?.querySelector("[data-map-concept-card]");
  const particles = stage.querySelector("[data-map-axon]");
  const context = particles?.getContext("2d", { alpha: true });
  if (!panel || !card) return { show() {}, hide() {}, dispose() {} };
  // The explanation remains usable even when the secondary canvas is unavailable.
  if (!context) return {
    show() {panel.hidden=false;panel.dataset.open="true";panel.querySelector(".qb-map3-concept-close")?.focus({preventScroll:true});},
    hide() {panel.hidden=true;panel.dataset.open="false";},
    dispose() {panel.hidden=true;panel.dataset.open="false";},
    get active(){return !panel.hidden;},
  };
  // Cores do efeito vêm dos tokens do admin (tripla "r,g,b"); fora dele valem as originais.
  let fxStyle = null; // lido uma vez por revelação, não a cada quadro
  const fx = (name, fallback) => {
    try {
      fxStyle ||= win.getComputedStyle(win.document.documentElement);
      return fxStyle.getPropertyValue(name).trim() || fallback;
    } catch { return fallback; }
  };
  const reduce = win.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, closing = 0, serial = 0, active = false;
  const cancelFrame = () => { if (frame) win.cancelAnimationFrame(frame); frame = 0; };
  const clear = () => {
    cancelFrame();
    context.clearRect(0, 0, particles.width, particles.height);
    particles.hidden = true;
  };
  function measure(origin) {
    const rect = stage.getBoundingClientRect();
    const ratio = Math.min(1.65, win.devicePixelRatio || 1);
    particles.width = Math.max(1, Math.round(rect.width * ratio));
    particles.height = Math.max(1, Math.round(rect.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // offset geometry is measured before CSS scale/blur, unlike getBoundingClientRect.
    return {
      width: rect.width, height: rect.height,
      x: Math.min(rect.width - 10, Math.max(10, Number.isFinite(origin?.x) ? origin.x : rect.width / 2)),
      y: Math.min(rect.height - 10, Math.max(10, Number.isFinite(origin?.y) ? origin.y : rect.height / 2)),
      left: card.offsetLeft, top: card.offsetTop,
      cw: card.offsetWidth, ch: card.offsetHeight,
    };
  }
  // Stable random values avoid visual jumps when a different node is selected.
  function seeded(seed) {
    let current = (seed || 17) >>> 0;
    return () => { current = (Math.imul(current, 1664525) + 1013904223) >>> 0; return current / 4294967296; };
  }
  function buildParticles(size, key = "") {
    const random = seeded([...String(key)].reduce((s,c) => (Math.imul(s, 33) + c.charCodeAt(0)) >>> 0, 73));
    const count = Math.min(780, Math.max(380, Math.round(size.width * size.height / 750)));
    const field = [];
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2, radius = Math.sqrt(random()) * 24;
      // Most particles condense into the explanation-card silhouette.
      const edge = i % 5 !== 0;
      const u = random(), side = i % 4;
      const margin = 4;
      const tx = edge ? (side===0?size.left+margin:side===1?size.left+size.cw-margin:size.left+size.cw*u) : size.left+size.cw*(.12+.76*u);
      const ty = edge ? (side===2?size.top+margin:side===3?size.top+size.ch-margin:size.top+size.ch*u) : size.top+size.ch*(.14+.66*random());
      field.push({
        ox:size.x+Math.cos(angle)*radius, oy:size.y+Math.sin(angle)*radius,
        tx,ty, phase:random()*6.283, spin:(.35+random())*(random()<.5?-1:1),
        size:.55+random()*1.65, alpha:.35+random()*.65,
      });
    }
    return field;
  }
  const ease = t => t*t*(3-2*t);
  function paint(field, size, t) {
    context.clearRect(0,0,size.width,size.height);
    context.save();
    context.globalCompositeOperation = "lighter";
    const progress = ease(Math.min(1,t));
    const halo = Math.sin(Math.PI * Math.min(1,t));
    // A diffused light pulse expands from the point that was clicked.
    const glowA = fx("--qbds-gold-bright-rgb", "188,161,255"), glowB = fx("--qbds-bronze-rgb", "90,105,219");
    const dotA = fx("--qbds-gold-rgb", "150,169,255"), dotB = fx("--qbds-gold-bright-rgb", "198,150,255"), trail = fx("--qbds-bronze-rgb", "170,152,250");
    const glow = context.createRadialGradient(size.x,size.y,1,size.x,size.y,Math.max(28,130+190*t));
    glow.addColorStop(0,"rgba("+glowA+","+(0.26*halo)+")");
    glow.addColorStop(.5,"rgba("+glowB+","+(0.09*halo)+")");
    glow.addColorStop(1,"rgba(0,0,0,0)");
    context.fillStyle=glow;
    context.beginPath();context.arc(size.x,size.y,130+190*t,0,Math.PI*2);context.fill();
    for (let i=0;i<field.length;i++) {
      const p=field[i];
      const turbulence=(1-progress)*Math.sin(Math.PI*t)*(.34+Math.sin(p.phase*2)**2);
      const curl=(p.phase+9*t*p.spin), orbit=(36+Math.sqrt(i)*3.2)*turbulence;
      const x=p.ox+(p.tx-p.ox)*progress+Math.cos(curl)*orbit;
      const y=p.oy+(p.ty-p.oy)*progress+Math.sin(curl)*orbit;
      const opacity=p.alpha*(.62+halo*.38)*(1-Math.max(0,(t-.80)*3.7));
      const blue=i%6<3 ? dotA : dotB;
      context.fillStyle="rgba("+blue+","+(opacity*.94)+")";
      context.beginPath();context.arc(x,y,p.size*(1+.35*halo),0,Math.PI*2);context.fill();
      if(i%7===0 && halo>.06) {
        context.strokeStyle="rgba("+trail+","+(opacity*.30*halo)+")";
        context.beginPath();context.moveTo(x,y);
        context.lineTo(x-Math.cos(curl)*8*halo,y-Math.sin(curl)*8*halo);
        context.stroke();
      }
    }
    context.restore();
  }
  function show(origin, key = "") {
    fxStyle = null;
    const turn=++serial;
    if(closing){win.clearTimeout(closing);closing=0;}
    clear();
    panel.hidden = false;
    panel.dataset.open = "false";
    panel.classList.remove("qb-map3-concept-leaving");
    active=true;
    const size=measure(origin);
    card.style.setProperty("--axon-x", (size.x-size.left)+"px");
    card.style.setProperty("--axon-y", (size.y-size.top)+"px");
    const scroller=panel.querySelector("[data-map-concept-scroll]");
    if(scroller)scroller.scrollTop=0;
    // Animations are optional. Reduced-motion users get an instantaneous, accessible explanation.
    const focusClose=()=>panel.querySelector(".qb-map3-concept-close")?.focus({preventScroll:true});
    if(reduce.matches) {panel.dataset.open="true";focusClose();return;}
    const field=buildParticles(size,key);
    const start=win.performance.now(), duration=860;
    let focused=false;
    particles.hidden=false;
    const tick=now=>{
      if(turn!==serial)return;
      const t=Math.min(1,(now-start)/duration);
      paint(field,size,t);
      if(t>.20)panel.dataset.open="true";
      if(t>.30 && !focused){focused=true;focusClose();}
      if(t<1)frame=win.requestAnimationFrame(tick);
      else {frame=0;particles.hidden=true;context.clearRect(0,0,size.width,size.height);}
    };
    frame=win.requestAnimationFrame(tick);
  }
  function hide(immediate = false) {
    ++serial;
    clear();
    active=false;
    if(closing){win.clearTimeout(closing);closing=0;}
    if(panel.hidden)return;
    if(immediate || reduce.matches){panel.hidden=true;panel.dataset.open="false";return;}
    panel.dataset.open="false";
    panel.classList.add("qb-map3-concept-leaving");
    closing=win.setTimeout(()=>{panel.hidden=true;panel.classList.remove("qb-map3-concept-leaving");closing=0;},240);
  }
  return {show,hide,get active(){return active;},dispose(){hide(true);}};
}
