/* A normal click selects; a second activation on the same node opens AXON.
 * Keyboard/screen-reader activation is selection-only; the explicit Expandir
 * conceito button remains accessible as an unambiguous alternative.
 */
export function createNodeActivation(onSelect,{doubleClickMs=350}={}){
  let previousPath=null, previousAt=-Infinity;
  return function activate(path,event){
    const clicks=Number(event?.detail)||0;
    const now=Number.isFinite(event?.timeStamp)?event.timeStamp:0;
    const double=clicks>=2 || (clicks>0 && previousPath===path && now>previousAt && now-previousAt<doubleClickMs);
    if(clicks>0) {
      previousPath=double?null:path;
      previousAt=now;
    } else {
      previousPath=null;
      previousAt=-Infinity;
    }
    onSelect(path,true,double); // single click now brings the selected branch into view
    return double;
  };
}
