import {useState} from "react";
import {createFileRoute} from "@tanstack/react-router";
import {getData} from "@/lib/qb-server";
import Heading from "@/components/qb/Heading";
import TaskForm from "@/components/qb/TaskForm";
export const Route=createFileRoute("/_authed/tarefas")({loader:()=>getData(),head:()=>({meta:[{title:"Tarefas · Quebrando a Banca"}]}),component:Tasks});
function Tasks(){const s=Route.useLoaderData(),map=new Map();s.tasks.forEach(t=>map.set(t.task_id,t));const [selected,setSelected]=useState(null);return <><Heading title="Mesa de trabalho">Atribuições manuais para Codex, Claude e Gemini. O registro não envia mensagens nem executa tarefas automaticamente.</Heading><div className="qb-grid"><div>{[...map.values()].map(t=><article className="qb-card" key={t.task_id}><span className="qb-pill">{t.assignee} · {t.status}</span><h2>{t.title}</h2><p>{t.question_ids}</p><p>{t.notes}</p><button onClick={()=>setSelected(t)}>Atualizar</button></article>)}</div><div><button onClick={()=>setSelected(null)}>+ Nova tarefa</button><TaskForm key={selected?.id||"new"} task={selected}/></div></div></>;}
