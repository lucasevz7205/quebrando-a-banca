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
    /* estático por padrão (11/11/2026): menos carga visual no estudo; o estudante liga a animação se quiser */
    let mode="still";
    let unavailable=false;
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
      const motion=mode==="motion"&&!reduce.matches&&!unavailable;
      document.documentElement.dataset.qbAmbient=motion?"motion":"still";
      toggle.textContent=unavailable?"Fundo: indisponível":motion?"Fundo: animado":"Fundo: estático";
      toggle.setAttribute("aria-pressed",String(motion));
      toggle.setAttribute("aria-label",motion?"Pausar vídeo de fundo":"Ativar vídeo de fundo");
      toggle.title=unavailable?"Vídeo indisponível. Fundo estático mantido.":reduce.matches
        ?"Movimento desativado nas preferências de acessibilidade do dispositivo."
        :motion?"Pausar a animação de fundo e manter o quadro atual."
        :"Reproduzir o vídeo no fundo de toda a interface.";
      toggle.disabled=reduce.matches||unavailable;
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
      if(unavailable||reduce.matches)return;
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
    paint();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();