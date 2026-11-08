/* Referências de Flashcards ao mapa: exato apenas com id/caminho de nó registrado.
 * Uma comparação por palavras é rotulada como sugestão, nunca como origem confirmada.
 */
(()=>{
  const words=t=>new Set(String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/[^a-z0-9]+/).filter(s=>s.length>=5));
  function resolve(map,card){
    if(!map||!Array.isArray(map.ramos)||!map.ramos.length)return {status:"unavailable",path:null};
    const nodes=[];
    const walk=(node,path)=>{
      if(!node||typeof node!=="object")return;
      nodes.push({node,path});
      (node.f||[]).forEach((c,i)=>walk(c,path+"."+i));
    };
    map.ramos.forEach((n,i)=>walk(n,String(i)));
    const nodeId=String(card?.mapaNoId??card?.mapNodeId??card?.mapaNodeId??"").trim();
    const path=String(card?.mapaPath??card?.mapNodePath??"").trim();
    if(nodeId){
      const found=nodes.filter(({node})=>String(node.id||"")===nodeId);
      if(found.length===1)return {status:"exact",path:found[0].path,title:String(found[0].node.t||""),nodeId};
    }
    if(path){
      const found=nodes.find(x=>x.path===path);
      if(found&&(!nodeId||String(found.node.id||"")===nodeId))
        return {status:"exact",path:found.path,title:String(found.node.t||""),nodeId:found.node.id||null};
    }
    const target=words([card?.tema,card?.q,...(card?.a||[])].join(" "));
    let best=null,second=-1;
    for(const item of nodes){
      const check=words([item.node.t,item.node.n,item.node.x?.e,item.node.x?.ex].join(" "));
      let score=0;
      target.forEach(w=>{if(check.has(w))score++});
      if(!best||score>best.score){second=best?.score??-1;best={...item,score};}
      else if(score>second)second=score;
    }
    if(best&&best.score>=3&&best.score>second)
      return {status:"suggested",path:best.path,title:String(best.node.t||""),nodeId:best.node.id||null};
    return {status:"topic",path:null,title:String(map.centro||"")};
  }
  window.QBMapLinks={resolve};
})();
