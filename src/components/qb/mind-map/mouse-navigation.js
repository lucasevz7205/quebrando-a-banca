/* Mouse/trackpad navigation helpers. Pure: no DOM or user data. */
export function wheelZoomFactor(deltaY, deltaMode = 0, viewportHeight = 600) {
  const unit=deltaMode===1?16:deltaMode===2?viewportHeight:1;
  const pixels=Math.max(-140,Math.min(140,(Number(deltaY)||0)*unit));
  // One notch: ~14% distance change; fine trackpads remain controllable.
  return Math.exp(pixels * .00135);
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
/* Labels closer to the focus take priority; overlapping less-important labels
 * disappear while the spheres remain clickable via raycasting and hit tolerance.
 */
export function resolveLabelPositions(candidates,{width,height,padding=5}={}){
  const placed=[];
  const results=new Map();
  const ordered=[...candidates].sort((a,b)=>a.priority-b.priority || a.index-b.index);
  for(const entry of ordered){
    const w=Math.max(50,Math.min(entry.width||150,Math.max(50,width-12)));
    const h=entry.height||32;
    const x=entry.x, y=entry.y;
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<2||x>width-2||y<2||y>height-2)continue;
    const left=x-w/2,right=x+w/2,top=y+10,bottom=top+h;
    if(left<2||right>width-2||top<2||bottom>height-2)continue;
    if(placed.some(b=>left<b.right+padding&&right+padding>b.left&&top<b.bottom+padding&&bottom+padding>b.top))continue;
    placed.push({left,right,top,bottom});
    results.set(entry.path,{x,y});
  }
  return results;
}
