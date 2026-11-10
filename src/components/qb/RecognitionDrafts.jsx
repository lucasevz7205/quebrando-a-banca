import {useState} from "react";
import drafts from "@/data/rf-questoes-revisao-2026-11-10.json";

export default function RecognitionDrafts(){
 const [topic,setTopic]=useState("rf-2-1");
 const topics=[...new Map(drafts.map(q=>[q.topico,q])).values()];
 const items=drafts.filter(q=>q.topico===topic);
 const download=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(items,null,2)],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download=topic+"-revisao-editorial.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className="qb-card" aria-labelledby="rf-drafts-heading">
  <h2 id="rf-drafts-heading">Reconhecimento de fala · revisão de questões</h2>
  <p>160 questões inéditas, 20 por assunto. Aguardam revisão humana antes de entrar no treino. Os mapas e flashcards atualizados estão em Estudar.</p>
  <label>Assunto <select value={topic} onChange={e=>setTopic(e.target.value)}>
   {topics.map(q=><option key={q.topico} value={q.topico}>{q.cap} · {q.capNome}</option>)}
  </select></label>
  <p>{items.length} questões · formato Certo ou Errado</p>
  <button type="button" onClick={download}>Exportar este assunto para revisão</button>
  <details key={topic}><summary>Conferir enunciados e comentários</summary>
   {items.map((q,i)=><article key={q.id} style={{borderTop:"1px solid var(--qb-line, #30334b)",padding:"16px 0"}}>
    <strong>{i+1}. {q.id} · {q.tema}</strong>
    <p style={{whiteSpace:"pre-line"}}>{q.enunciado}</p>
    <details><summary>Ver gabarito e justificativa</summary>
     <p><strong>{q.gabarito==="C"?"Certo":"Errado"}</strong> · {q.mecanismo}</p>
     <p>{q.comentario}</p><p><strong>Pergunta preventiva:</strong> {q.perguntaPreventiva}</p>
     <p><small>{q.fonte}</small></p>
     <p><small>Reelaboração do conteúdo cadastrado; exemplos pedagógicos inéditos. Sem revisão humana registrada.</small></p>
    </details>
   </article>)}
  </details>
 </section>;
}
