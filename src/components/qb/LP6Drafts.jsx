import {useEffect,useMemo,useState} from "react";
const SOURCE="https://media.base44.com/files/public/6aef9673577cba58a2c91a3c/b7e7a81dc_lp6.json";
export default function LP6Drafts(){
 const [items,setItems]=useState([]),[error,setError]=useState(""),[topic,setTopic]=useState("");
 useEffect(()=>{let active=true;fetch(SOURCE).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(active){setItems(Array.isArray(data)?data:[]);setTopic(data?.[0]?.cap||"")}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 const topics=useMemo(()=>[...new Map(items.map(q=>[q.cap,q.capNome])).entries()], [items]);
 const filtered=items.filter(q=>q.cap===topic);
 return <section className="qb-card" aria-labelledby="lp6-drafts-heading">
 <h2 id="lp6-drafts-heading">Língua Portuguesa · LP6 v3 · revisão editorial</h2>
 <p>{items.length} questões inéditas · C/E · aguardando revisão humana. Não integram o treino até validação editorial.</p>
 {error&&<p role="alert">Não foi possível carregar as questões: {error}</p>}
 {!!topics.length&&<><label>Assunto <select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
 <p>{filtered.length} questões neste assunto</p>
 <details key={topic}><summary>Conferir enunciados, gabaritos e comentários</summary>
 {filtered.map((q,i)=><article key={q.id} style={{borderTop:"1px solid var(--qb-line,#30334b)",padding:"16px 0"}}>
 <strong>{i+1}. {q.id} · {q.tema}</strong><p style={{whiteSpace:"pre-line"}}>{q.enunciado}</p>
 <details><summary>Ver gabarito e análise</summary>
 <p><strong>{q.gabarito==="C"?"Certo":"Errado"}</strong> · mecanismo {q.mecanismo} · {q.dificuldadePlanejada}</p>
 <p>{q.comentario}</p><p><strong>Correção mínima:</strong> {q.correcaoMinima}</p>
 <p><strong>Pergunta preventiva:</strong> {q.perguntaPreventiva}</p>
 <p><strong>Fonte declarada:</strong> {q.ref}</p>
 {q.revisaoIA?.problemas?.length>0&&<p><strong>Ressalvas da revisão IA:</strong> {q.revisaoIA.problemas.join(" · ")}</p>}
 <small>Status: {q.statusEditorial}</small>
 </details></article>)}</details>
 <button type="button" onClick={()=>{const blob=new Blob([JSON.stringify(filtered,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=topic+"-lp6-v3-revisao.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Exportar assunto para revisão</button></>}
 </section>
}