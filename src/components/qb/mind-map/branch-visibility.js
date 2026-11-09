/* Pure, account-agnostic visibility state for the Three.js mental map.
 * Only changes which existing concepts are drawn. Never edits any study data.
 */
export function createBranchVisibility(graph, {initialDepth = 1, expandedPaths = null} = {}) {
  const nodes = new Map([["root", {path:"root",parent:null,title:graph.title}],
    ...(graph.nodes||[]).map(n=>[n.path,n])]);
  const children = new Map([...nodes.keys()].map(path=>[path,[]]));
  for(const n of graph.nodes||[]) {
    if(children.has(n.parent))children.get(n.parent).push(n.path);
  }
  const hasChildren = path => (children.get(path)?.length||0)>0;
  const expanded = expandedPaths
    ? new Set([...expandedPaths].filter(path=>nodes.has(path)&&hasChildren(path)))
    : new Set(["root"]);
  if(!expandedPaths)
    for(const [path] of nodes)
      if(path!=="root" && path.split(".").length<=initialDepth && hasChildren(path)) expanded.add(path);
  function ancestors(path) {
    const chain=[];
    let cursor=path,seen=new Set();
    while(cursor && nodes.has(cursor) && !seen.has(cursor)) {
      seen.add(cursor);
      const parent=nodes.get(cursor)?.parent;
      if(parent && nodes.has(parent)){chain.push(parent);cursor=parent;}
      else break;
    }
    return chain.reverse();
  }
  function visiblePaths() {
    const visible=new Set(["root"]);
    const stack=["root"];
    while(stack.length){
      const path=stack.pop();
      if(!expanded.has(path))continue;
      for(const child of children.get(path)||[]){
        visible.add(child);
        stack.push(child);
      }
    }
    return visible;
  }
  function reveal(path) {
    if(!nodes.has(path))return false;
    let changed=false;
    for(const ancestor of ancestors(path))
      if(!expanded.has(ancestor)){expanded.add(ancestor);changed=true;}
    return changed;
  }
  function open(path) {
    if(!hasChildren(path))return false;
    const revealed=reveal(path);
    if(!expanded.has(path)){expanded.add(path);return true;}
    return revealed;
  }
  function close(path) {
    if(!hasChildren(path))return false;
    return expanded.delete(path);
  }
  function toggle(path) {
    if(!hasChildren(path))return false;
    if(expanded.has(path))return close(path);
    return open(path);
  }
  function openAll() {
    for(const path of nodes.keys())if(hasChildren(path))expanded.add(path);
  }
  function collapseAll() {
    expanded.clear();
    expanded.add("root"); // preserve entry to all first-level branches
  }
  function summary() {
    const visible=visiblePaths();
    const expandable=[...visible].filter(hasChildren);
    return {
      visible:visible.size,
      total:nodes.size,
      expanded:expandable.filter(path=>expanded.has(path)).length,
      expandable:expandable.length,
    };
  }
  return {visiblePaths,reveal,open,close,toggle,openAll,collapseAll,summary,
    expandedPaths:()=>[...expanded],
    isExpanded:path=>expanded.has(path),hasChildren,
    childCount:path=>children.get(path)?.length||0,
    has:path=>nodes.has(path),
    isVisible:path=>visiblePaths().has(path)};
}
