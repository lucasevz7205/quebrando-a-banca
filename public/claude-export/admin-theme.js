/* Quebrando a Banca: experiência cinematográfica restrita ao admin.
   A inclusão deste arquivo é controlada no React por user.role === "admin".
   Não altera armazenamento de aprendizagem, rotas nem pontuação. */
(function(){
"use strict";
const media={
  // Novos vídeos aprovados: cena diurna CFD6C054 (claro) e noturna FA7F3298 (escuro).
  // O pôster de cada tema é um quadro do mesmo vídeo, inclusive no modo estático.
  light:{video:"https://media.base44.com/videos/public/6aef9673577cba58a2c91a3c/975f1c2b3_gemini_generated_video_CFD6C054.mp4",poster:"https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/44c20f8ca_gemini_generated_video_CFD6C054_frame.jpg"},
  dark:{video:"https://media.base44.com/videos/public/6aef9673577cba58a2c91a3c/1af59e0ae_gemini_generated_video_FA7F3298.mp4",poster:"https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/dc13890b5_gemini_generated_video_FA7F3298_frame.jpg"}
};
function initialize(){
  const html=document.documentElement;
  html.classList.add("qb-admin-experience");
  const brand=document.querySelector(".qb-app-header .qb-header-brand");
  if(brand&&!brand.querySelector(".qb-admin-laurel")){
    const left=document.createElement("span");left.className="qb-admin-laurel";left.setAttribute("aria-hidden","true");
    const right=document.createElement("span");right.className="qb-admin-laurel is-right";right.setAttribute("aria-hidden","true");
    brand.prepend(left);brand.append(right);
  }
  const video=document.querySelector("[data-qb-background-video]");
  const layer=document.getElementById("qb-ambient-background");
  const preferDark=window.matchMedia("(prefers-color-scheme: dark)");
  function changeScene(){
    if(!video||!layer)return;
    const explicit=html.getAttribute("data-theme");
    const theme=explicit==="light"?"light":explicit==="dark"?"dark":preferDark.matches?"dark":"light";
    const item=media[theme];
    // Mesmo quando o MP4 já está configurado, atualizar o pôster estático.
    const sameSource=video.dataset.qbVideoSrc===item.video;
    video.poster=item.poster;
    html.style.setProperty("--qb-scene-image","url("+JSON.stringify(item.poster)+")");
    layer.style.backgroundImage="url("+JSON.stringify(item.poster)+")";
    if(sameSource)return;
    video.dataset.qbVideoSrc=item.video;
    const hadSource=video.hasAttribute("src");
    // Não exibir quadro do tema anterior durante a troca nem sobrepor
    // a textura antiga durante a decodificação do novo MP4.
    layer.removeAttribute("data-ready");
    if(hadSource){
      video.pause();
      const running=html.dataset.qbAmbient==="motion"&&html.dataset.qbFoco!=="1"&&!document.hidden;
      if(running){
        video.src=item.video;
        video.load();
        const p=video.play();
        if(p&&typeof p.catch==="function")p.catch(()=>{});
      }else{
        // Ainda no modo estático/foco: usa o JPG correspondente e evita baixar vídeo.
        video.removeAttribute("src");
      }
    }
  }
  new MutationObserver(changeScene).observe(html,{attributes:true,attributeFilter:["data-theme"]});
  preferDark.addEventListener?.("change",changeScene);
  changeScene();
  document.addEventListener("pointerdown",event=>{
    const node=event.target?.closest?.(".qb-radial-node");
    if(!node||!node.closest(".qb-radial-hub"))return;
    node.classList.add("qb-admin-pressed");
    setTimeout(()=>node.classList.remove("qb-admin-pressed"),340);
  },{passive:true,capture:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();