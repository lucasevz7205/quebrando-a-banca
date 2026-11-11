/* Mouse/trackpad navigation helpers. Pure: no DOM or user data. */
export function wheelZoomFactor(deltaY, deltaMode = 0, viewportHeight = 600) {
  const unit=deltaMode===1?16:deltaMode===2?viewportHeight:1;
  const pixels=Math.max(-140,Math.min(140,(Number(deltaY)||0)*unit));
  // One notch: ~14% distance change; fine trackpads remain controllable.
  return Math.exp(pixels * .00135);
}
/* Directional screen-space pan for the on-map arrow pad.
 * Returns the displacement in camera right/up units (not rotation).
 * Scales with zoom so a button tap remains useful both near and far.
 */
export function directionalPanOffset(action,distance,fovDegrees=42,aspect=1) {
  const direction={
    "pan-up":[0,1],
    "pan-down":[0,-1],
    "pan-left":[-1,0],
    "pan-right":[1,0]
  }[action];
  if(!direction)return null;
  const vertical=2*Math.max(0,Number(distance)||0)*Math.tan(fovDegrees*Math.PI/360);
  const verticalStep=Math.max(.5,Math.min(14,vertical*.15));
  const horizontalStep=Math.max(.5,Math.min(14,vertical*Math.max(.3,Number(aspect)||1)*.15));
  return {right:direction[0]*horizontalStep,up:direction[1]*verticalStep};
}
export function nearestProjectedHit(nodes, pointer, radius=26){
  let best=null, distance=Infinity;
  for(const n of nodes){
    if(!n.visible || !Number.isFinite(n.x) || !Number.isFinite(n.y))continue;
    const d=Math.hypot(pointer.x-n.x,pointer.y-n.y);
    const max=radius + (n.radius||0);
    if(d<=max && d<distance){distance=d;best=n;}
  }
  return best?.path??null;
}
/* Labels closer to the focus take priority. When the full label collides, try
 * the short form (initials, entry.shortWidth) before hiding it, so the student
 * still sees which concept each sphere is (11/11/2026).
 */
export function initials(title,max=4){
  const words=String(title||"").split(/\s+/).filter(w=>w.length>2||/^[A-ZÀ-Ú0-9]/.test(w));
  const s=(words.length?words:[String(title||"?")]).slice(0,max).map(w=>w[0].toUpperCase()).join("");
  return s||"?";
}
export function resolveLabelPositions(candidates,{width,height,padding=5}={}){
  const placed=[];
  const results=new Map();
  const ordered=[...candidates].sort((a,b)=>a.priority-b.priority || a.index-b.index);
  const fits=(x,y,w,h)=>{
    const left=x-w/2,right=x+w/2,top=y+10,bottom=top+h;
    if(left<2||right>width-2||top<2||bottom>height-2)return null;
    if(placed.some(b=>left<b.right+padding&&right+padding>b.left&&top<b.bottom+padding&&bottom+padding>b.top))return null;
    return {left,right,top,bottom};
  };
  for(const entry of ordered){
    const x=entry.x, y=entry.y;
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<2||x>width-2||y<2||y>height-2)continue;
    const h=entry.height||32;
    const w=Math.max(50,Math.min(entry.width||150,Math.max(50,width-12)));
    let box=fits(x,y,w,h), short=false;
    if(!box && entry.shortWidth){ box=fits(x,y,Math.max(28,entry.shortWidth),h); short=!!box; }
    if(!box)continue;
    placed.push(box);
    results.set(entry.path,short?{x,y,short:true}:{x,y});
  }
  return results;
}
