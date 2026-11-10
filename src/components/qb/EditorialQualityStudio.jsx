import {useMemo,useState} from "react";
import {
  auditEditorialCollection,buildEditorialPrompts,EDITORIAL_VERSION
} from "@/lib/editorial-engine";
import revisions from "../../../scripts/rf-reformulacao/depois-2026-11-10.json";
import drafts from "@/data/rf-questoes-revisao-2026-11-10.json";
import "./editorial-quality.css";

const PRODUCTS=[
 {id:"revision",label:"Revisão"},
 {id:"mapa",label:"Mapa mental"},
 {id:"flashcards",label:"Flashcards"},
 {id:"questions",label:"Questões CEBRASPE"},
 {id:"audit",label:"Auditoria cega"}
];
const WARNINGS={
 SOURCE_VERIFICATION:"Fontes originais a conferir",
 BLIND_REVIEW:"Revisão cega ainda não registrada",
 HUMAN_REVIEW:"Revisão humana pendente",
 PERFECT_KEY_BALANCE:"Equilíbrio C/E a avaliar",
 LOW_OPERATION_VARIETY:"Diversidade cognitiva",
 LOW_MECHANISM_VARIETY:"Diversidade de falsificações",
 FORMULAIC_STEMS:"Redação repetitiva"
};
function downloadJSON(data,name){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),el=document.createElement("a");
 el.href=url;el.download=name;el.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function EditorialQualityStudio(){
 const report=useMemo(()=>auditEditorialCollection(revisions,drafts),[]);
 const [topicId,setTopicId]=useState("rf-2-1");
 const [phase,setPhase]=useState("questions");
 const [source,setSource]=useState("");
 const [location,setLocation]=useState("");
 const [textSource,setTextSource]=useState("");
 const [cargo,setCargo]=useState("Câmara dos Deputados · Analista Legislativo, Registro e Redação");
 const [error,setError]=useState("");
 const [bundle,setBundle]=useState(null);
 const selected=report.topics.find(t=>t.topicId===topicId);
 const original=revisions[topicId];
 const sum=selected?.counts||{};
 const pending=useMemo(()=>{
   const grouped=new Map();
   for(const x of selected?.warnings||[]){
     const key=x.code;
     if(!grouped.has(key))grouped.set(key,{code:key,title:WARNINGS[key]||key,count:0,sample:x.why});
     grouped.get(key).count++;
   }
   return [...grouped.values()].sort((a,b)=>b.count-a.count);
 },[selected]);
 const issueCount=report.totals.blockers;
 const prepare=e=>{
   e.preventDefault();setError("");
   try {
     const material=buildEditorialPrompts({
       topicId,title:original.titulo,materia:"Reconhecimento de fala, transcrição e IA",
       cargo,source,location,textSource,
       existingNodeIds:[],existingQuestions:drafts.filter(q=>q.topico===topicId).map(q=>q.enunciado)
     });
     setBundle(material);
   }catch(ex){setBundle(null);setError(ex.message||"Dados insuficientes para preparar as instruções.");}
 };
 const copy=async()=>{
   const txt=bundle?.[phase];if(!txt)return;
   try{await navigator.clipboard.writeText(txt);setError("Instruções copiadas.");}
   catch{setError("Não foi possível copiar automaticamente. Selecione o texto abaixo.");}
 };
 return <section className="qb-card qb-editorial-studio" aria-labelledby="qb-editorial-heading">
  <div className="qb-editorial-title">
   <div>
    <p className="qb-editorial-eyebrow">PROTOCOLO {EDITORIAL_VERSION}</p>
    <h2 id="qb-editorial-heading">Estúdio editorial integrado</h2>
    <p>Controle de qualidade para revisão, mapa mental, flashcards e questões de Certo/Errado. Nenhuma análise deste painel consome créditos ou altera o banco.</p>
   </div>
   <button type="button" className="qb-editorial-secondary" onClick={()=>downloadJSON(report,"auditoria-reconhecimento-fala.json")}>Exportar auditoria</button>
  </div>
  <div className="qb-editorial-stats" role="group" aria-label="Inventário verificado">
   <div><strong>{report.totals.topics}</strong><span>revisões</span></div>
   <div><strong>{report.totals.nodes}</strong><span>nós</span></div>
   <div><strong>{report.totals.cards}</strong><span>flashcards</span></div>
   <div><strong>{report.totals.linkedQuestions}/{report.totals.questions}</strong><span>questões vinculadas</span></div>
  </div>
  <div className="qb-editorial-alert" role="status">
   <strong>{issueCount===0?"Vínculos e campos obrigatórios íntegros":"Há bloqueios estruturais"}</strong>
   <p>{report.totals.reviewed} de {report.totals.questions} questões aprovadas por revisão humana. A conferência de fonte primária, gabarito e vigência não é substituída pela auditoria automática.</p>
  </div>
  <label className="qb-editorial-control">Assunto a inspecionar
   <select value={topicId} onChange={e=>{setTopicId(e.target.value);setBundle(null);setError("");}}>
    {report.topics.map((t,i)=><option value={t.topicId} key={t.topicId}>2.{i+1} · {t.title}</option>)}
   </select>
  </label>
  <div className="qb-editorial-detail">
   <h3>{selected?.title}</h3>
   <p>{sum.enrichedNodes}/{sum.nodes} nós enriquecidos · {sum.linkedCards}/{sum.cards} flashcards vinculados · {sum.linkedQuestions}/{sum.questions} questões vinculadas · {sum.correct} C / {sum.wrong} E.</p>
   <strong>{selected?.blockers.length} bloqueios estruturais · {selected?.warnings.length} avisos editoriais</strong>
   {selected?.blockers.length>0&&<details><summary>Consultar bloqueios</summary>
    <ul>{selected.blockers.map((x,i)=><li key={i}><b>{x.location}:</b> {x.why}</li>)}</ul>
   </details>}
   <details><summary>Consultar tipos de pendência, agrupados</summary>
    <ul>{pending.map(x=><li key={x.code}><b>{x.title} ({x.count})</b>: {x.sample}</li>)}</ul>
   </details>
   <p className="qb-editorial-note">O equilíbrio observado de 10 itens C e 10 itens E por assunto não é evidência de que essa seja a frequência da banca. Os itens continuam em revisão, não em treino.</p>
  </div>
  <div className="qb-editorial-divider"/>
  <h3>Preparar produção enriquecida a partir de fonte verificável</h3>
  <p>O roteiro assegura os mesmos IDs conceituais e a mesma fonte entre os quatro produtos. O gerador não consulta automaticamente URLs e não deve afirmar que confirmou apostilas ou legislação sem lê-las.</p>
  <form className="qb-editorial-form" onSubmit={prepare}>
   <label>Fonte ou documento de origem
    <input required maxLength={1000} value={source} onChange={e=>setSource(e.target.value)}
      placeholder="Título oficial, edição, autoria ou URL verificável"/>
   </label>
   <label>Página, seção e data/versão
    <input required maxLength={300} value={location} onChange={e=>setLocation(e.target.value)}
      placeholder="Ex.: pp. 12–15, versão consultada em AAAA-MM-DD"/>
   </label>
   <label>Cargo-alvo
    <input required maxLength={200} value={cargo} onChange={e=>setCargo(e.target.value)}/>
   </label>
   <label>Trecho da fonte, copiado e conferido
    <textarea required minLength={150} maxLength={16000} rows={5} value={textSource}
      onChange={e=>setTextSource(e.target.value)}
      placeholder="Cole o trecho real da fonte primária; não substitua por resumo criado por IA."/>
   </label>
   <button type="submit" className="qb-primary">Preparar cinco instruções editoriais · sem créditos</button>
  </form>
  {error&&<p className="qb-editorial-message" role="status">{error}</p>}
  {bundle&&<div className="qb-editorial-output">
    <div className="qb-editorial-output-controls">
     <label>Produto
      <select value={phase} onChange={e=>setPhase(e.target.value)}>
       {PRODUCTS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
     </label>
     <button type="button" className="qb-editorial-secondary" onClick={copy}>Copiar instrução</button>
     <button type="button" className="qb-editorial-secondary" onClick={()=>downloadJSON(bundle,topicId+"-instrucoes-editoriais.json")}>Exportar pacote</button>
    </div>
    <textarea readOnly value={bundle[phase]} rows={12} aria-label={"Instrução para "+phase}/>
    <p>As instruções são rascunhos operacionais. Qualquer execução por IA usa os créditos do serviço escolhido e continua sujeita a revisão humana, auditoria e aprovação antes da importação.</p>
   </div>}
 </section>;
}
