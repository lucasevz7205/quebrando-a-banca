/* Extrai a hierarquia de textos Markdown/IA, sem inventar conteúdo. */
const clean = (v, max = 2400) => String(v == null ? "" : v).replace(/\r/g, "").trim().slice(0, max);
const titleClean = v => clean(v, 220).replace(/\*\*|__|\x60/g, "").replace(/^\s*#+\s*/, "").trim();
const collapse = v => clean(v, 2400).replace(/\s+/g, " ").trim();
const FIELD_RX = /^(?:\*\*|__)?(defini[çc][ãa]o|conceito|explica[çc][ãa]o|detalhe|nota|etiqueta|exemplo|caso pr[áa]tico|pegadinha|armadilha|aten[çc][ãa]o|fonte|refer[êe]ncia|dispositivo|base legal|fundamento|artigo)(?:\*\*|__)?\s*:\s*(.+)$/i;
const TYPE_RX = /^(exce[çc][ãa]o|requisito|prazo|qu[óo]rum|compet[êe]ncia|classifica[çc][ãa]o|efeito|veda[çc][ãa]o|procedimento|regra|esp[ée]cies?|hip[óo]teses?|etapas?|princ[íi]pios?|elementos?)\s*:/i;
const MAX_NODES=150, MAX_ROOTS=32, MAX_CHILDREN=32, MAX_DEPTH=6;
const unboldLabel=v=>String(v||"")
  .replace(/^(\*\*|__)([^*]+?):\1\s*/, "$2: ")
  .replace(/^(\*\*|__)([^*]+)\1(?=:)/, "$2");
function conceptType(value) {
  const s=titleClean(value).toLowerCase();
  if(/^exce[çc]/.test(s))return "Exceção";
  if(/^requisito|^condi[çc]/.test(s))return "Requisito";
  if(/^prazo/.test(s))return "Prazo";
  if(/^qu[óo]rum/.test(s))return "Quórum";
  if(/^compet[êe]ncia/.test(s))return "Competência";
  if(/^classifica[çc]|^esp[ée]cies?/.test(s))return "Classificação";
  if(/^veda[çc]/.test(s))return "Vedação";
  if(/^efeito/.test(s))return "Efeito";
  if(/^procedimento|^etapas?/.test(s))return "Procedimento";
  if(/^regra/.test(s))return "Regra";
  return "";
}
const prefixSlug = v => clean(v,70).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"mapa";

export function flatMindMapNodes(tree) {
  const result=[];
  function visit(nodes,depth=0) {
    for(const node of nodes||[]) {
      result.push({id:node.id,t:node.t,n:node.n||"",rotulo:node.rotulo||"",e:node.x?.e||"",ex:node.x?.ex||"",trap:node.x?.trap||"",src:node.x?.src||"",depth});
      visit(node.f,depth+1);
    }
  }
  visit(tree?.ramos);
  return result;
}

export function parseHierarchicalMindMap(input, fallbackTitle="Mapa mental", prefix="map", options={}) {
  const source=clean(input,27000).replace(/\u00a0/g," ");
  if(!source)return null;
  const raw=source.split("\n").filter(l=>!/^\s*\x60{3}/.test(l));
  const nonEmpty=raw.filter(l=>l.trim());
  const h1AsTitle=/^#\s+\S/.test(nonEmpty[0]?.trim()||"");
  const center=h1AsTitle?titleClean(nonEmpty[0].trim().slice(2)):clean(fallbackTitle,240);
  const prefixId=prefixSlug(prefix).slice(0,24);
  let seen=0,signals=0,titles=0,lost=0,current=null;
  const roots=[],stack=[],errors=[];
  function add(label,explanation,level,labelType="") {
    if(seen>=MAX_NODES){lost++;return null}
    while(stack.length&&stack[stack.length-1].level>=level)stack.pop();
    const siblings=stack.length?(stack[stack.length-1].node.f ||=[]):roots;
    if(siblings.length>=(stack.length?MAX_CHILDREN:MAX_ROOTS)){lost++;return null}
    const depth=stack.length;
    if(depth>=MAX_DEPTH){lost++;return null}
    const id=prefixId+"-m"+(++seen);
    const t=titleClean(label).slice(0,150)||"Conceito "+seen;
    const body=collapse(explanation);
    const node={id,t,n:body.slice(0,300),rotulo:labelType,x:{e:body}};
    siblings.push(node);stack.push({node,level});current=node;
    titles++;return node;
  }
  function field(line) {
    const m=unboldLabel(line).match(FIELD_RX);
    if(!m||!current)return false;
    const what=m[1].toLowerCase(),value=collapse(m[2]);
    if(/exemplo|caso/.test(what))current.x.ex=[current.x.ex,value].filter(Boolean).join(" ").slice(0,1200);
    else if(/pegadinha|armadilha|aten/.test(what))current.x.trap=[current.x.trap,value].filter(Boolean).join(" ").slice(0,1200);
    else if(/fonte|refer|dispositivo|base legal|fundamento|artigo/.test(what))current.x.src=[current.x.src,value].filter(Boolean).join(" ").slice(0,600);
    else if(/etiqueta|nota|detalhe/.test(what))current.n=[current.n,value].filter(Boolean).join(" ").slice(0,600);
    else current.x.e=[current.x.e,value].filter(Boolean).join(" ").slice(0,2400);
    return true;
  }
  let activeH=0,headingOffset=h1AsTitle?1:0,firstSkipped=false;
  for(const rawLine of raw) {
    const line=rawLine.trim();if(!line)continue;
    if(h1AsTitle&&!firstSkipped&&line===nonEmpty[0].trim()){firstSkipped=true;continue}
    if(/^(\*{3,}|-{3,}|_{3,})$/.test(line))continue;
    const h=line.match(/^(#{1,6})\s+(.+)$/);
    if(h) {
      signals++;
      const level=Math.max(0,(h[1].length-headingOffset)*100);
      add(titleClean(h[2]),"",level);
      activeH=level;continue;
    }
    const numbering=line.match(/^(\d+(?:\.\d+){1,5})[.)]?\s+(.+)$/);
    const bullet=rawLine.match(/^(\s*)(?:[-*+•–—]|\d+[.)]|[a-z][.)])\s+(.+)$/i);
    if(numbering) {
      signals++;
      const level=activeH+numbering[1].split(".").length*10;
      const matched=numbering[2].match(/^(.{2,100}?):\s+(.+)$/);
      add(matched?matched[1]:numbering[2],matched?matched[2]:"",level,conceptType(numbering[2]));
      continue;
    }
    if(bullet) {
      signals++;
      const level=activeH+10+bullet[1].replace(/\t/g,"  ").length+1;
      const value=unboldLabel(bullet[2].trim());
      while(stack.length&&stack[stack.length-1].level>=level)stack.pop();
      current=stack.length?stack[stack.length-1].node:null;
      if(field(value))continue;
      const m=value.match(/^(.{2,100}?):\s+(.+)$/);
      add(m?m[1]:value,m?m[2]:"",level,conceptType(value));
      continue;
    }
    const typed=unboldLabel(line).match(/^(.{2,100}?):\s+(.+)$/);
    if(field(line))continue;
    if(typed&&(TYPE_RX.test(line)||/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.!?]{2,70}:/.test(line))) {
      signals++;add(typed[1],typed[2],activeH+10,conceptType(typed[1]));continue;
    }
    if(current) {
      current.x.e=[current.x.e,collapse(line)].filter(Boolean).join(" ").slice(0,2400);
      if(!current.n)current.n=collapse(line).slice(0,300);
    } else if(line.length<135)add(line,"",0);
    else add(fallbackTitle,line,0);
  }
  if((options.force ? signals<1||titles<1 : signals<2||titles<2))return null;
  if(lost)errors.push("O texto excedeu a capacidade do mapa: "+lost+" itens não foram adicionados. Divida a entrada em partes menores.");
  return {centro:center||fallbackTitle,ramos:roots,ligacoes:[],structureDetected:true,structuredNodes:seen,warnings:errors,sourceLength:source.length};
}

/* A IA preenche campos somente em nós já reconhecidos; nunca muda ramos, ordem ou ID. */
export function enrichHierarchicalMindMap(skeleton,fields,source="") {
  const tree=structuredClone(skeleton);
  const edits=new Map((Array.isArray(fields)?fields:[]).filter(f=>f&&typeof f.id==="string").map(f=>[f.id,f]));
  const sourceText=String(source||"");
  let applied=0;
  function visit(nodes) {
    for(const n of nodes||[]) {
      const e=edits.get(n.id);
      if(e) {
        const nextN=collapse(e.n).slice(0,600),nextE=collapse(e.e).slice(0,2400);
        const nextEx=collapse(e.ex).slice(0,1200),nextTrap=collapse(e.trap).slice(0,1200);
        const nextSrc=collapse(e.src).slice(0,600),nextRotulo=clean(e.rotulo,100);
        if(nextN)n.n=nextN;
        if(nextE)n.x.e=nextE;
        if(nextEx)n.x.ex=nextEx;
        if(nextTrap)n.x.trap=nextTrap;
        if(nextSrc&&sourceText.includes(nextSrc))n.x.src=nextSrc;
        if(nextRotulo)n.rotulo=nextRotulo;
        applied++;
      }
      visit(n.f);
    }
  }
  visit(tree.ramos);
  return {mapa:tree,applied,total:flatMindMapNodes(tree).length};
}
