/* Quebrando a Banca — full-viewport ambient background.
 * The MP4 is provided by the owner and is not part of the study data.
 * Pausing preserves the last decoded video frame; no duplicate stream or
 * always-on animation is required for the static option.
 */
(() => {
  "use strict";
  const KEY="qb-ambient-background-mode";
  function mount(){
    const layer=document.getElementById("qb-ambient-background");
    const video=layer?.querySelector("[data-qb-background-video]");
    const toggle=document.getElementById("qb-background-toggle");
    if(!layer||!video||!toggle)return;
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
    /* fluido por padrão nas telas de escolha (12/11/2026): o modo foco já aquieta o fundo
     * durante treino, revisão, mapa e flashcards, então a animação fica para a navegação.
     * Com economia de dados ligada, o padrão continua estático (o MP4 tem 58 MB). */
    let mode="motion";
    try{if(navigator.connection&&navigator.connection.saveData)mode="still";}catch(_){ }
    let unavailable=false;
    let focused=document.documentElement.dataset.qbFoco==="1";
    try {
      const stored=localStorage.getItem(KEY);
      if(stored==="still"||stored==="motion")mode=stored;
    } catch (_) { /* private browsing / storage disabled */ }
    video.muted=true;
    video.defaultMuted=true;
    video.playsInline=true;
    video.preload="none"; // static mode uses the local poster without fetching the MP4
    function frame(){
      // A paused frame remains visible after playback; fresh static sessions
      // use the local poster without requesting the 58 MB MP4.
      if(video.readyState<1 || video.readyState>=2 || video.currentTime>.04 || (mode==="motion"&&!reduce.matches))return;
      try{
        const at=Number.isFinite(video.duration)?Math.min(.12,video.duration*.02):.12;
        video.currentTime=Math.max(.02,at);
      }catch(_){/* leave the CSS fallback until the frame is available */}
    }
    function paint(){
      const motion=mode==="motion"&&!reduce.matches&&!unavailable&&!focused;
      document.documentElement.dataset.qbAmbient=motion?"motion":"still";
      toggle.textContent=unavailable?"Fundo: indisponível":focused?"Fundo: foco":motion?"Fundo: animado":"Fundo: estático";
      toggle.setAttribute("aria-pressed",String(motion));
      toggle.setAttribute("aria-label",focused?"Fundo em modo foco durante a atividade":motion?"Pausar vídeo de fundo":"Ativar vídeo de fundo");
      toggle.title=unavailable?"Vídeo indisponível. Fundo estático mantido.":focused
        ?"Modo foco: o fundo fica quieto durante a atividade e volta ao sair."
        :reduce.matches
        ?"Movimento desativado nas preferências de acessibilidade do dispositivo."
        :motion?"Pausar a animação de fundo e manter o quadro atual."
        :"Reproduzir o vídeo no fundo de toda a interface.";
      toggle.disabled=reduce.matches||unavailable||focused;
      if(!motion||document.hidden){
        video.pause();
        if(!motion)frame();
        return;
      }
      // Attach the remote source lazily: users choosing a static background
      // never request the 58 MB video, only the local JPG poster.
      if(!video.src){
        const source=video.dataset.qbVideoSrc;
        if(!source){unavailable=true;paint();return;}
        video.src=source;
        video.load();
      }
      const attempt=video.play();
      if(attempt&&typeof attempt.catch==="function"){
        attempt.catch(()=>{
          if(unavailable)return;
          mode="still";
          paint();
        });
      }
    }
    function loadedFrame(){
      layer.dataset.ready="true";
      if(mode!=="motion"||reduce.matches)video.pause();
    }
    function onError(){
      unavailable=true;
      layer.removeAttribute("data-ready");
      video.pause();
      paint();
    }
    function onToggle(){
      if(unavailable||reduce.matches||focused)return;
      mode=mode==="motion"?"still":"motion";
      try{localStorage.setItem(KEY,mode)}catch(_){}
      paint();
    }
    function onVisibility(){paint();}
    function onMotionPreference(){paint();}
    video.addEventListener("loadedmetadata",frame);
    video.addEventListener("loadeddata",loadedFrame);
    video.addEventListener("error",onError);
    toggle.addEventListener("click",onToggle);
    document.addEventListener("visibilitychange",onVisibility);
    window.addEventListener("pagehide",()=>video.pause(),{once:true});
    reduce.addEventListener?.("change",onMotionPreference);
    /* Modo foco (12/11/2026): a página avisa quando uma atividade começa (treino,
     * revisão, mapa, flashcards). O vídeo pausa e o chip trava em "Fundo: foco";
     * ao sair, o modo salvo do estudante volta sozinho. */
    window.QBAmbient={
      setFocus(on){
        on=!!on;
        if(on===focused)return;
        focused=on;
        if(on)document.documentElement.dataset.qbFoco="1";
        else delete document.documentElement.dataset.qbFoco;
        paint();
      },
      get focused(){return focused;},
    };
    paint();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();