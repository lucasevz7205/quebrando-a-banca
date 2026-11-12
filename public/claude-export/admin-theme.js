/* Quebrando a Banca: experiência cinematográfica restrita ao admin.
   A inclusão deste arquivo é controlada no React por user.role === "admin".
   Não altera armazenamento de aprendizagem, rotas nem pontuação. */
(function(){
"use strict";
const media={
  light:{video:"https://media.base44.com/videos/public/6aef9673577cba58a2c91a3c/e307497be_gemini_generated_video_362B7BA6.mp4",poster:"https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/98e13314a_gemini_generated_video_362B7BA6_at3.jpg"},
  dark:{video:"https://media.base44.com/videos/public/6aef9673577cba58a2c91a3c/cf918d059_gemini_generated_video_4AED7DD6.mp4",poster:"https://media.base44.com/images/public/6aef9673577cba58a2c91a3c/5c37ea4ce_gemini_generated_video_4AED7DD6_at3.jpg"}
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
    if(video.dataset.qbVideoSrc===item.video)return;
    video.dataset.qbVideoSrc=item.video;
    video.poster=item.poster;
    layer.style.backgroundImage="url("+JSON.stringify(item.poster)+")";
    const hadSource=video.hasAttribute("src");
    if(hadSource){
      video.pause();
      video.src=item.video;video.load();
      if(html.dataset.qbAmbient==="motion"&&html.dataset.qbFoco!=="1"&&!document.hidden){
        const p=video.play();if(p&&typeof p.catch==="function")p.catch(()=>{});
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