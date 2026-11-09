import {useState} from "react";
import {useServerFn} from "@tanstack/react-start";
import {generateLabDrafts} from "@/lib/question-authoring-server";
import {generateSubjectDrafts, QUESTION_GROUP_SIZE, SUBJECT_QUESTION_LIMIT} from "@/lib/question-authoring";

const quantities = Array.from({length: SUBJECT_QUESTION_LIMIT}, (_, i) => i + 1);

export default function QuestionAuthoring(){
 const run=useServerFn(generateLabDrafts);
 const [form,setForm]=useState({materia:"",assunto:"",cargo:"",quantidade:3,fonte:"",localizacao:"",textoFonte:"",mecanismos:[]});
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState(null);
 const field=(key,label,max,multiline=false)=><label key={key}>{label}{multiline?<textarea required minLength={100} maxLength={max} rows={8} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input required maxLength={max} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>;
 const [activeForm,setActiveForm]=useState(null);
 const canResume=Boolean(error && result && activeForm===form && result.questoes.length<form.quantidade);
 const generate=async (completed=[])=>{
  setBusy(true);
  setError("");
  setActiveForm(form);
  if(!completed.length)setResult(null);
  try{
   await generateSubjectDrafts(form, data=>run({data}), setResult, completed);
  }catch(e){
   setError(e.message||"Falha na geração. Você pode tentar novamente.");
  }finally{
   setBusy(false);
  }
 };
 const submit=e=>{e.preventDefault();return generate();};
 const download=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(result.questoes,null,2)],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="questoes-rascunhos-cebraspe.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className="qb-card qb-form"><h2>Criação de questões · C/E</h2>
 <p>Conceitos, contextos e relações com revisão de falsificações. Informe um trecho-fonte suficiente e sua referência. A IA não consulta a URL nem confirma a vigência da fonte.</p>
 <form onSubmit={submit}><fieldset disabled={busy} style={{border:0,padding:0,display:"grid",gap:12}}>
 <div className="qb-filters">{field("materia","Matéria",150)}{field("assunto","Assunto / tópico",200)}{field("cargo","Cargo-alvo",200)}
 <label>Quantidade<select value={form.quantidade} onChange={e=>setForm({...form,quantidade:Number(e.target.value)})}>{quantities.map(n=><option key={n}>{n}</option>)}</select></label></div>
 {field("fonte","Referência da fonte (título ou URL)",1000)}{field("localizacao","Artigo, página ou seção e versão/data",300)}{field("textoFonte","Texto-fonte para fundamentação",14000,true)}
 <p>Até {SUBJECT_QUESTION_LIMIT} rascunhos por assunto. Cada grupo de até {QUESTION_GROUP_SIZE} utiliza duas chamadas de IA com créditos Base44 para elaboração e revisão.</p>
 <button className="qb-primary" type="submit">{busy?"Elaborando e revisando…":"Gerar rascunhos com IA (usa créditos)"}</button></fieldset></form>
 {error&&<p role="alert">{error}</p>}
 {canResume&&<button type="button" onClick={()=>generate(result.questoes)}>Continuar lote</button>}
 {busy&&!result&&<p role="status">Preparando o primeiro grupo de {activeForm?.quantidade ?? form.quantidade} questões solicitadas.</p>}
 {result&&<div aria-live="polite"><h3>{result.questoes.length} de {activeForm?.quantidade} rascunhos gerados</h3>
 <p>Nenhuma questão foi adicionada ao treino. A checagem automática não substitui revisão humana da fonte, do gabarito e da originalidade.</p>
 {result.questoes.map((q,i)=><details key={q.id}><summary>{i+1}. {q.statusEditorial==="bloqueado"?"Bloqueado para revisão":"Aguardando revisão humana"} · {q.operacao}</summary>
 <p>{q.enunciado}</p><p><strong>Gabarito proposto: {q.gabarito}</strong> · {q.mecanismo||"Correto sem pegadinha"}</p>
 <p>{q.justificativa}</p><p><strong>Ponto decisivo:</strong> {q.trechoDecisivo}</p><p><strong>Correção / validade:</strong> {q.correcaoMinima}</p>
 <p><strong>Pergunta preventiva:</strong> {q.perguntaPreventiva}</p><p><strong>Evidência na fonte:</strong> {q.evidenciaFonte}</p>
 <p><strong>Conceito:</strong> {q.conceito} · <strong>Relação:</strong> {q.relacao}</p><p><strong>Revisão IA:</strong> {q.revisaoIA.justificativa}</p>
 {q.revisaoIA.problemas.length>0&&<ul>{q.revisaoIA.problemas.map((p,j)=><li key={j}>{p}</li>)}</ul>}
 </details>)}
 <button onClick={download}>Exportar rascunhos e pareceres em JSON</button>
 <p>Para importar, revise o arquivo e preencha revisaoHumana com responsavel, data e parecer; altere statusEditorial para revisado. Itens bloqueados exigem correção e nova revisão antes da importação.</p>
 </div>}</section>;
}
