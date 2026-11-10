/* AXON radial navigation for the existing Quebrando a Banca workspace.
 * Navigation-only layer: every destination opens a real, existing view.
 * Uses no AI calls, DB writes, third-party framework or persistent animation.
 */
(function(){
  "use strict";

  const MODULES=[
    {key:"painel",label:"Hoje",icon:"◷",description:"Planejamento e prioridades do dia"},
    {key:"edital",label:"Edital",icon:"▦",description:"Cobertura, assuntos e lacunas"},
    {key:"treinar",label:"Treinar",icon:"◎",description:"Prática deliberada e correção"},
    {key:"estudo",label:"Estudo",icon:"◇",description:"Mapas, revisões e materiais"},
    {key:"simulado",label:"Simulado",icon:"◈",description:"Simulação de prova e resultados"},
    {key:"historico",label:"Desempenho",icon:"↗",description:"Evolução e diagnóstico de erros"}
  ];
  const SUBMODULES={
    painel:[
      {label:"Planejamento",description:"Tarefas, agenda e metas de hoje",target:"painel",icon:"◷"},
      {label:"Revisões",description:"Flashcards para consolidar",target:"cartoes",icon:"↺"},
      {label:"Prática de hoje",description:"Resolver questões da banca",target:"treinar",icon:"◎"},
      {label:"Meu progresso",description:"Resultados e tarefas do dia",target:"analiseDia",icon:"↗"}
    ],
    edital:[
      {label:"Edital completo",description:"Disciplinas e tópicos",target:"edital",icon:"▦"},
      {label:"Mapas de conceitos",description:"Conexões dos conteúdos",target:"mapa",icon:"◇"},
      {label:"Pegadinhas",description:"Mecanismos da banca",target:"pegadinhas",icon:"⌁"},
      {label:"Materiais",description:"Biblioteca de estudo",target:"conteudo",icon:"▤"}
    ],
    treinar:[
      {label:"Resolver questões",description:"Configurar nova rodada",target:"treinar",icon:"◎"},
      {label:"Caderno de erros",description:"Retomar itens difíceis",target:"caderno",icon:"✳"},
      {label:"Flashcards",description:"Prática de recuperação",target:"cartoes",icon:"▧"},
      {label:"Pegadinhas",description:"Treinar mecanismos de erro",target:"pegadinhas",icon:"⌁"}
    ],
    estudo:[
      {label:"Mapa mental 3D",description:"Explorar conceitos com AXON",target:"mapa",icon:"◇"},
      {label:"Flashcards",description:"Memorização e revisão",target:"cartoes",icon:"▧"},
      {label:"Materiais",description:"Fontes e resumos",target:"conteudo",icon:"▤"},
      {label:"Aprendizagem",description:"Retenção e recuperação",target:"aprendizagem",icon:"↗"},
      {label:"Pegadinhas",description:"Entender falsificações",target:"pegadinhas",icon:"⌁"}
    ],
    simulado:[
      {label:"Painel de simulados",description:"Objetiva, discursiva e histórico",target:"simulado",icon:"◈"},
      {label:"Resultados",description:"Consultar provas realizadas",target:"simulado",icon:"▤"},
      {label:"Meu desempenho",description:"Diagnóstico dos resultados",target:"analiseDia",icon:"↗"},
      {label:"Método",description:"Estratégia de prova",target:"metodo",icon:"⌁"}
    ],
    historico:[
      {label:"Análise diária",description:"Resultados e atividades do dia",target:"analiseDia",icon:"◷"},
      {label:"Histórico",description:"Evolução ao longo do tempo",target:"historico",icon:"↗"},
      {label:"Caderno de erros",description:"Itens que exigem atenção",target:"caderno",icon:"✳"},
      {label:"Método de estudo",description:"Como evoluir e revisar",target:"metodo",icon:"◇"}
    ]
  };
  const allowedKeys=new Set(MODULES.map(m=>m.key));
  const escape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const moduleFor=key=>MODULES.find(m=>m.key===key)||null;
  const COLORS=["#79c8ff","#5fa1ff","#a895ff","#ff906f","#b88dff","#38d9fa"];
  function positions(count){
    // Nodes live INSIDE the luminous annular band, never outside as cards.
    // Keep labels stationary while its electric filaments move.
    const radius=count>=6?37:36.5;
    return Array.from({length:count},(_,i)=>{
      const a=(-Math.PI/2)+(Math.PI*2*i/count);
      return {x:50+Math.cos(a)*radius,y:50+Math.sin(a)*radius,angle:i*360/count};
    });
  }
  function ringPoint(radius,angle){
    const rad=(angle-90)*Math.PI/180;
    return {x:500+Math.cos(rad)*radius,y:500+Math.sin(rad)*radius};
  }
  function arc(radius,start,end){
    const from=ringPoint(radius,start),to=ringPoint(radius,end);
    const fixed=n=>n.toFixed(2);
    return "M"+fixed(from.x)+" "+fixed(from.y)+" A"+radius+" "+radius+" 0 "+(end-start>180?1:0)+" 1 "+fixed(to.x)+" "+fixed(to.y);
  }
  function render(section=null,availableKeys=null){
    const keys=Array.isArray(availableKeys)?availableKeys.filter(k=>allowedKeys.has(k)):MODULES.map(m=>m.key);
    const normalized=keys.includes(section)?section:null;
    const selected=moduleFor(normalized);
    const list=selected?SUBMODULES[normalized]:MODULES.filter(m=>keys.includes(m.key));
    const pts=positions(list.length);
    const step=360/list.length;
    const links=pts.map((p,i)=>{
      const start=p.angle-step*.48,end=p.angle+step*.48;
      return '<path class="qb-radial-link" style="--index:'+i+'" d="'+arc(368,start,end)+'" />';
    }).join("");
    const sectors=pts.map((p,i)=>{
      const start=p.angle-step*.47,end=p.angle+step*.47;
      return '<path class="qb-radial-sector" data-ring-sector="'+i+'"'
        +' style="--index:'+i+';--sector-color:'+COLORS[i%COLORS.length]+'"'
        +' d="'+arc(368,start,end)+'" />';
    }).join("");
    const nodes=list.map((node,i)=>{
      const p=pts[i],isRoot=!selected,prop=isRoot?'data-radial-module':'data-radial-target';
      const target=isRoot?node.key:node.target;
      return '<button type="button" class="qb-radial-node" '+prop+'="'+escape(target)+'" data-radial-index="'+i+'" style="--node-x:'+p.x.toFixed(3)+'%;--node-y:'+p.y.toFixed(3)+'%;--index:'+i+';--sector-color:'+COLORS[i%COLORS.length]+';" aria-label="'+escape(node.label)+': '+escape(node.description)+'">'
        +'<span class="qb-radial-node-icon" aria-hidden="true">'+node.icon+'</span>'
        +'<span class="qb-radial-node-label">'+escape(node.label)+'</span>'
        +'<span class="qb-radial-node-caption">'+escape(node.description)+'</span>'
        +'</button>';
    }).join("");
    const title=selected?selected.label:"Quebrando a Banca";
    const screen=selected?"Área de estudo":"Central de navegação";
    const center=selected
      ?'<button type="button" class="qb-radial-core qb-radial-core-back" data-radial-back title="Voltar ao menu principal" aria-label="Voltar ao menu principal">'
        +'<span class="qb-radial-core-orb" aria-hidden="true"></span><span class="qb-radial-core-eyebrow">ÁREA SELECIONADA</span>'
        +'<strong>'+escape(title)+'</strong><span class="qb-radial-core-sub">← Menu principal</span></button>'
      :'<div class="qb-radial-core"><span class="qb-radial-core-orb" aria-hidden="true"></span>'
        +'<span class="qb-radial-core-eyebrow">AXON · HUB</span>'
        +'<strong>QUEBRANDO<br>A BANCA</strong><span class="qb-radial-core-sub">Explore uma área</span></div>';
    return '<section class="qb-radial-hub" data-radial-screen="'+escape(normalized||"menu")+'" aria-label="'+escape(title)+'">'
      +'<div class="qb-radial-topline"><div><span class="qb-radial-overline">QUEBRANDO A BANCA / '+escape(screen.toUpperCase())+'</span>'
      +'<h2 class="qb-radial-screen-title" tabindex="-1">'+(selected?escape(selected.label):"Menu principal")+'</h2>'
      +'</div>'+(selected?'<button type="button" class="qb-radial-return-top" data-radial-back>← Voltar ao menu principal</button>':'<span class="qb-radial-top-status"><i aria-hidden="true"></i>'+list.length+' módulos disponíveis</span>')+'</div>'
      +'<div class="qb-radial-stage" data-radial-stage>'
      +'<div class="qb-radial-annulus" aria-hidden="true"><div class="qb-radial-annulus-light"></div><div class="qb-radial-annulus-texture"></div><div class="qb-radial-annulus-filaments"></div></div>'
      +'<svg class="qb-radial-network" viewBox="0 0 1000 1000" aria-hidden="true">'
      +'<defs><linearGradient id="qb-radial-trace" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4784ff"/><stop offset="52%" stop-color="#a998ff"/><stop offset="100%" stop-color="#3b70ff"/></linearGradient></defs>'
      +'<circle cx="500" cy="500" r="368" class="qb-radial-orbit"/><circle cx="500" cy="500" r="251" class="qb-radial-orbit qb-radial-orbit-inner"/>'
      +sectors+links+'</svg>'
      +'<canvas class="qb-radial-flow" data-radial-flow aria-hidden="true"></canvas>'
      +'<div class="qb-radial-aura" aria-hidden="true"></div>'
      +center+nodes
      +'<canvas class="qb-radial-particles" data-radial-particles aria-hidden="true" hidden></canvas>'
      +'</div><div class="qb-radial-footer">'
      +(selected?'<span>Selecione uma função do círculo para abrir a interface existente.</span>'
        :'<span>Selecione uma área para explorar suas ferramentas.</span>')
      +'<span>Também é possível navegar pelas abas superiores.</span></div></section>';
  }

  function wire(container,handlers={}){
    const root=container?.querySelector(".qb-radial-hub");
    if(!root)return;
    let moving=false;
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
    function transition(button,go){
      if(moving)return;
      moving=true;
      if(reduce.matches){go();return;}
      const stage=root.querySelector("[data-radial-stage]");
      const canvas=stage?.querySelector("[data-radial-particles]");
      const ctx=canvas?.getContext("2d");
      if(!stage||!ctx){go();return;}
      const rect=stage.getBoundingClientRect();
      if(!rect.width||!rect.height){go();return;}
      const origin=button.getBoundingClientRect();
      const ox=origin.left+origin.width/2-rect.left,oy=origin.top+origin.height/2-rect.top;
      const dpr=Math.min(window.devicePixelRatio||1,1.6);
      canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const sparks=Array.from({length:175},(_,i)=>{
        const angle=2*Math.PI*i/175*3.618;
        const depth=.28+(i%13)/13;
        return {angle,depth,spin:i%2?1:-1,size:.7+(i%5)*.33};
      });
      canvas.hidden=false;
      root.dataset.transitioning="true";
      const start=window.performance.now(),duration=590;
      function tick(now){
        const t=Math.min(1,(now-start)/duration);
        ctx.clearRect(0,0,rect.width,rect.height);
        ctx.save();ctx.globalCompositeOperation="lighter";
        const ease=1-Math.pow(1-t,3);
        const cx=rect.width/2,cy=rect.height/2;
        for(const p of sparks){
          const spread=Math.min(rect.width,rect.height)*(.08+p.depth*.42);
          const r=spread*ease;
          const spin=p.angle+p.spin*t*.55;
          const x=ox+(cx-ox)*t*.57+Math.cos(spin)*r;
          const y=oy+(cy-oy)*t*.57+Math.sin(spin)*r;
          ctx.beginPath();ctx.fillStyle="rgba("+(p.depth>.63?"159,151,255":"82,156,255")+","+(Math.sin(Math.PI*t)*.82)+")";
          ctx.arc(x,y,p.size*(1+Math.sin(Math.PI*t)),0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
        if(t<1)window.requestAnimationFrame(tick);
        else{ctx.clearRect(0,0,rect.width,rect.height);canvas.hidden=true;go();}
      }
      window.requestAnimationFrame(tick);
    }
    root.addEventListener("keydown",event=>{
      if(event.key!=="Escape"||root.dataset.radialScreen==="menu"||moving)return;
      const back=root.querySelector("[data-radial-back]");
      if(!back)return;
      event.preventDefault();
      transition(back,()=>handlers.onBack?.());
    });
    root.addEventListener("click",event=>{
      const control=event.target.closest("[data-radial-module],[data-radial-target],[data-radial-back]");
      if(!control||!root.contains(control))return;
      if(control.hasAttribute("data-radial-back"))transition(control,()=>handlers.onBack?.());
      else if(control.hasAttribute("data-radial-module")){
        const key=control.dataset.radialModule;
        if(allowedKeys.has(key))transition(control,()=>handlers.onModule?.(key));
      } else {
        const target=control.dataset.radialTarget;
        const section=root.dataset.radialScreen;
        if(SUBMODULES[section]?.some(item=>item.target===target))
          transition(control,()=>handlers.onOpen?.(target));
      }
    });
  }
  window.QBRadialDashboard={render,wire,modules:MODULES.map(m=>m.key),
    submodules:key=>(SUBMODULES[key]||[]).map(m=>m.target)};
})();