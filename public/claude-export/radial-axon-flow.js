/* AXON ring-flow: motion vocabulary adapted from the existing map's
 * axon-reveal.js (seeded particles, curl, turbulence and eased morph).
 * One small 2D canvas per mounted radial screen, never a new WebGL context.
 */
(function(){
  "use strict";
  const TAU=Math.PI*2;
  const COLORS=[[255,149,113],[217,152,255],[141,162,255],[73,215,251],[68,197,255],[180,162,255]];
  function seeded(seed){
    let current=(seed||17)>>>0;
    return ()=>{current=(Math.imul(current,1664525)+1013904223)>>>0;return current/4294967296;};
  }
  const ease=t=>t*t*(3-2*t);
  function colorAt(angle){
    const fraction=(((angle+Math.PI/2)%TAU)+TAU)%TAU/TAU;
    const scaled=fraction*COLORS.length,lo=Math.floor(scaled)%COLORS.length;
    const next=(lo+1)%COLORS.length,t=scaled-Math.floor(scaled);
    return COLORS[lo].map((x,i)=>Math.round(x+(COLORS[next][i]-x)*t)).join(",");
  }
  function mount(root){
    const stage=root?.querySelector("[data-radial-stage]");
    const idle=stage?.querySelector("[data-radial-flow]");
    const transition=stage?.querySelector("[data-radial-particles]");
    const ctx=idle?.getContext("2d",{alpha:true});
    const tx=transition?.getContext("2d",{alpha:true});
    if(!ctx||!stage)return {focus(){},select(_b,go){go();},dispose(){}};
    const win=stage.ownerDocument.defaultView;
    const doc=stage.ownerDocument;
    const reduced=win.matchMedia("(prefers-reduced-motion: reduce)");
    const rand=seeded(319071);
    const strands=Array.from({length:132},(_,i)=>({
      a:TAU*i/132+(rand()-.5)*.13,
      r:.357+(rand()-.5)*.10,
      speed:(rand()<.5?-1:1)*(.055+rand()*.095),
      phase:rand()*TAU,size:.45+rand()*1.2,opacity:.13+rand()*.48
    }));
    let focusIndex=-1,disposed=false,raf=0,transitionRaf=0,lastTime=0,observing=true;
    let dimensions={w:0,h:0,ratio:1};
    let onScreen=true;

    function resize(){
      const rect=stage.getBoundingClientRect();
      const ratio=Math.min(win.devicePixelRatio||1,1.5);
      const w=Math.max(1,Math.round(rect.width*ratio)),h=Math.max(1,Math.round(rect.height*ratio));
      if(w===dimensions.w*dimensions.ratio && h===dimensions.h*dimensions.ratio)return;
      dimensions={w:rect.width,h:rect.height,ratio};
      idle.width=w;idle.height=h;
      ctx.setTransform(ratio,0,0,ratio,0,0);
    }
    function draw(time){
      if(!dimensions.w||!dimensions.h)return;
      const size=Math.min(dimensions.w,dimensions.h);
      const cx=dimensions.w/2,cy=dimensions.h/2;
      ctx.clearRect(0,0,dimensions.w,dimensions.h);
      ctx.save();
      ctx.globalCompositeOperation="lighter";
      for(let i=0;i<strands.length;i++){
        const s=strands[i];
        const angle=s.a+time*s.speed;
        const radius=size*(s.r+.008*Math.sin(time*.77+s.phase));
        const centerIndex=((angle+Math.PI/2+TAU)%TAU)/TAU;
        const sector=Math.floor(centerIndex*root.querySelectorAll(".qb-radial-node").length);
        const highlighted=focusIndex===sector;
        const length=.018+s.size*.018;
        ctx.strokeStyle="rgba("+colorAt(angle)+","+(s.opacity*(highlighted?1.9:1)).toFixed(3)+")";
        ctx.lineWidth=s.size*(highlighted?1.35:1);
        ctx.beginPath();
        ctx.arc(cx,cy,radius,angle-length,angle+length);
        ctx.stroke();
        if(i%4===0){
          const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius;
          ctx.beginPath();
          ctx.fillStyle="rgba(224,240,255,"+(s.opacity*(highlighted?1.45:.8)).toFixed(3)+")";
          ctx.arc(x,y,s.size*.9,0,TAU);ctx.fill();
        }
      }
      ctx.restore();
    }
    function active(){
      return !disposed&&!reduced.matches&&!doc.hidden&&onScreen
        && doc.documentElement.dataset.qbAmbient!=="still";
    }
    function loop(now){
      raf=0;
      if(disposed||(!root.isConnected&&root.isConnected!==undefined)){dispose();return;}
      if(!active())return;
      if(now-lastTime>31){lastTime=now;resize();draw(now/1000);}
      raf=win.requestAnimationFrame(loop);
    }
    function sync(){
      if(disposed)return;
      if(!active()){
        if(raf){win.cancelAnimationFrame(raf);raf=0;}
        ctx.clearRect(0,0,dimensions.w,dimensions.h);
        return;
      }
      if(!raf)raf=win.requestAnimationFrame(loop);
    }
    function focus(index){
      focusIndex=Number.isInteger(index)?index:-1;
    }
    function select(button,go){
      if(disposed||reduced.matches||!tx){go();return;}
      // Same seeded AXON particle morph used on the 3D map, now travelling
      // through the living annulus and collapsing into its central hub.
      const rect=stage.getBoundingClientRect();
      const origin=button.getBoundingClientRect();
      if(!rect.width||!rect.height){go();return;}
      const ratio=Math.min(win.devicePixelRatio||1,1.5);
      transition.width=Math.round(rect.width*ratio);
      transition.height=Math.round(rect.height*ratio);
      tx.setTransform(ratio,0,0,ratio,0,0);
      transition.hidden=false;
      const cx=rect.width/2,cy=rect.height/2,size=Math.min(rect.width,rect.height);
      const ox=origin.left+origin.width/2-rect.left,oy=origin.top+origin.height/2-rect.top;
      const seed=[...(button.dataset.radialModule||button.dataset.radialTarget||"menu")]
        .reduce((s,c)=>(Math.imul(s,33)+c.charCodeAt(0))>>>0,73);
      const random=seeded(seed);
      const field=Array.from({length:410},(_,i)=>{
        const p=i/410*TAU,theta=Math.atan2(oy-cy,ox-cx)+(random()-.5)*.83;
        const a=theta+(random()-.5)*.72,r=size*(.32+random()*.10);
        const angle=random()*TAU,small=Math.sqrt(random())*14;
        return {
          ox:i%4===0?ox+Math.cos(angle)*small:cx+Math.cos(a)*r,
          oy:i%4===0?oy+Math.sin(angle)*small:cy+Math.sin(a)*r,
          tx:cx+Math.cos(p)*size*(.03+.12*random()),
          ty:cy+Math.sin(p)*size*(.03+.12*random()),
          phase:random()*TAU,spin:(random()<.5?-1:1)*(.3+random()),
          size:.6+random()*1.7,alpha:.3+random()*.7,
          rgb:colorAt(theta+(i%11)*.075)
        };
      });
      root.dataset.transitioning="true";
      let ended=false;
      const start=win.performance.now(),duration=810;
      function finish(){
        if(ended)return;
        ended=true;
        if(transitionRaf){win.cancelAnimationFrame(transitionRaf);transitionRaf=0;}
        tx.clearRect(0,0,rect.width,rect.height);
        transition.hidden=true;
        if(!disposed)go();
      }
      function tick(now){
        transitionRaf=0;
        if(disposed||ended)return;
        const t=Math.min(1,(now-start)/duration),progress=ease(t);
        tx.clearRect(0,0,rect.width,rect.height);
        tx.save();tx.globalCompositeOperation="lighter";
        const halo=Math.sin(Math.PI*t);
        const glow=tx.createRadialGradient(cx,cy,2,cx,cy,Math.max(25,size*(.05+progress*.35)));
        glow.addColorStop(0,"rgba(153,175,255,"+(halo*.28)+")");
        glow.addColorStop(.6,"rgba(97,76,205,"+(halo*.10)+")");
        glow.addColorStop(1,"rgba(0,0,0,0)");
        tx.beginPath();tx.arc(cx,cy,Math.max(25,size*(.05+progress*.35)),0,TAU);
        tx.fillStyle=glow;tx.fill();
        for(const particle of field){
          const turbulence=(1-progress)*Math.sin(Math.PI*t)*(.34+Math.sin(particle.phase*2)**2);
          const curl=particle.phase+9*t*particle.spin;
          const orbit=(22+Math.sqrt(field.length)*1.8)*turbulence;
          const x=particle.ox+(particle.tx-particle.ox)*progress+Math.cos(curl)*orbit;
          const y=particle.oy+(particle.ty-particle.oy)*progress+Math.sin(curl)*orbit;
          const alpha=particle.alpha*(.62+halo*.38)*(1-Math.max(0,(t-.76)*3.9));
          tx.fillStyle="rgba("+particle.rgb+","+(alpha*.94)+")";
          tx.beginPath();tx.arc(x,y,particle.size*(1+halo*.35),0,TAU);tx.fill();
          if(halo>.08 && particle.size>1.85){
            tx.beginPath();tx.moveTo(x,y);
            tx.lineTo(x-Math.cos(curl)*8*halo,y-Math.sin(curl)*8*halo);
            tx.strokeStyle="rgba("+particle.rgb+","+(alpha*.30*halo)+")";
            tx.lineWidth=.7;tx.stroke();
          }
        }
        tx.restore();
        if(t<1)transitionRaf=win.requestAnimationFrame(tick);
        else finish();
      }
      transitionRaf=win.requestAnimationFrame(tick);
    }
    const onVisibility=()=>sync();
    const onChange=()=>sync();
    const mutation=win.MutationObserver
      ?new win.MutationObserver(onChange):null;
    mutation?.observe(doc.documentElement,{attributes:true,attributeFilter:["data-qb-ambient"]});
    const intersection=win.IntersectionObserver
      ?new win.IntersectionObserver(entries=>{onScreen=!!entries[0]?.isIntersecting;sync();}):null;
    intersection?.observe(root);
    const observer=win.ResizeObserver?new win.ResizeObserver(resize):null;
    observer?.observe(stage);
    const onResize=()=>{resize();sync();};
    win.addEventListener("resize",onResize);
    doc.addEventListener("visibilitychange",onVisibility);
    reduced.addEventListener?.("change",onChange);
    function dispose(){
      if(disposed)return;
      disposed=true;
      if(raf)win.cancelAnimationFrame(raf);
      if(transitionRaf)win.cancelAnimationFrame(transitionRaf);
      observer?.disconnect();
      intersection?.disconnect();
      mutation?.disconnect();
      win.removeEventListener("resize",onResize);
      doc.removeEventListener("visibilitychange",onVisibility);
      reduced.removeEventListener?.("change",onChange);
      ctx.clearRect(0,0,dimensions.w,dimensions.h);
      if(tx)tx.clearRect(0,0,transition.width,transition.height);
      transition.hidden=true;
    }
    resize();sync();
    return {focus,select,dispose};
  }
  window.QBAxonRingFlow={mount};
})();