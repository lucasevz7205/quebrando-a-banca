import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/AuthContext";
import Heading from "@/components/qb/Heading";
import {
  listStudyAccountsForAdmin, createStudyAccountForAdmin,
  setStudyAccountActiveForAdmin, importStudyContentForAdmin, bindReservedStudyAccountForAdmin
} from "@/lib/study-admin";
import {STUDY_CONTENT_COLLECTIONS} from "@/lib/study-provisioning";
import {decodeStudyCatalog,auditStudyCatalog} from "@/lib/study-import";

export const Route = createFileRoute("/_authed/contas")({
  loader:()=>listStudyAccountsForAdmin(),
  head:()=>({meta:[{title:"Contas e concursos · Quebrando a Banca"}]}),
  component:StudyAccountsPage
});

function StudyAccountsPage() {
  const accounts=Route.useLoaderData()||[];
  const router=useRouter(),{user}=useAuth();
  const create=useServerFn(createStudyAccountForAdmin);
  const change=useServerFn(setStudyAccountActiveForAdmin);
  const upload=useServerFn(importStudyContentForAdmin);
  const bind=useServerFn(bindReservedStudyAccountForAdmin);
  const [form,setForm]=useState({userId:"",examName:"",examDate:""});
  const [target,setTarget]=useState("");
  const [reservedTarget,setReservedTarget]=useState("");
  const [registeredUserId,setRegisteredUserId]=useState("");
  const [collection,setCollection]=useState("edital");
  const [file,setFile]=useState(null);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");
  if(user?.role!=="admin")return <p>Acesso reservado ao administrador.</p>;
  const chosen=accounts.find(a=>a.id===target);
  const run=async fn=>{
    setBusy(true);setError("");setStatus("");
    try{await fn();await router.invalidate();}
    catch(err){setError(err?.message||"Não foi possível concluir a operação.");}
    finally{setBusy(false);}
  };
  const createAccount=event=>{
    event.preventDefault();
    run(async()=>{
      await create({data:form});
      setForm({userId:"",examName:"",examDate:""});
      setStatus("Vínculo criado desativado. Importe os materiais antes de ativar.");
    });
  };
  const importFile=event=>{
    event.preventDefault();
    run(async()=>{
      if(!target||!chosen)throw new Error("Selecione um projeto de estudo.");
      if(!file)throw new Error("Selecione um arquivo JSON com o conteúdo desta coleção.");
      if(file.size>20*1024*1024)throw new Error("Arquivo acima de 20 MB. Divida a importação em arquivos menores.");
      const text=await file.text(),parsed=JSON.parse(text),documents=auditStudyCatalog(decodeStudyCatalog(parsed,collection),collection);
      if(!documents.length)throw new Error("Nenhum registro encontrado no arquivo.");
      let inserted=0,skipped=0;
      for(let i=0;i<documents.length;i+=25){
        const result=await upload({data:{accountId:target,collection,documents:documents.slice(i,i+25)}});
        inserted+=result.imported;skipped+=result.skipped;
        setStatus("Importando "+Math.min(i+25,documents.length)+"/"+documents.length+" registros…");
      }
      setStatus("Importação concluída: "+inserted+" novos, "+skipped+" já existentes. Histórico dos estudantes preservado.");
      setFile(null);
      event.currentTarget?.reset?.();
    });
  };
  return <section style={{maxWidth:1100,margin:"0 auto",display:"grid",gap:18}}>
    <Heading title="Contas e concursos">
      Um único Quebrando a Banca, com materiais, questões e desempenho separados por login.
    </Heading>
    {[
      { title:"Solicitações pendentes", rows:accounts.filter(a=>a.pending), empty:"Nenhuma solicitação aguardando atendimento." },
      { title:"Ambientes cadastrados", rows:accounts.filter(a=>!a.pending), empty:"Nenhum ambiente adicional cadastrado." }
    ].map(({title,rows,empty})=><section className="qb-card" key={title}>
      <h2>{title}</h2>
      {!rows.length?<p>{empty}</p>:
      <div style={{display:"grid",gap:12}}>
        {rows.map(a=><article key={a.id} style={{border:"1px solid #d5dce7",borderRadius:12,padding:14,display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div>
            <strong>{a.examName}</strong> <span className="qb-pill">{a.pending?"Pendente":a.active?"Ativo":"Desativado"}</span>
            <p style={{fontSize:13,overflowWrap:"anywhere"}}>Login (ID): {a.userId}<br/>
            {a.examDate?"Prova: "+a.examDate+" · ":""}
            Edital: {a.ready.edital?"cadastrado":"pendente"} · Questões: {a.ready.questoes?"cadastradas":"pendentes"}<br/>
            {!a.ready.edital||!a.ready.questoes?"O acesso pode ser habilitado, mas o treino ficará vazio até a importação.":""}</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {a.pending&&<a href="#importar-materiais" onClick={()=>setTarget(a.id)}>Providenciar materiais</a>}
            {!a.active&&!/^[a-f0-9]{24}$/i.test(a.userId)&&<button type="button" className="qb-primary" onClick={()=>{setReservedTarget(a.id);setRegisteredUserId("");}}>Vincular login</button>}
            {a.active&&<Link to="/estudar" search={{conta:a.id}} className="qb-primary">Ver ambiente</Link>}
            <button className="qb-primary" type="button" disabled={busy||!a.active&&!/^[a-f0-9]{24}$/i.test(a.userId)}
              onClick={()=>run(async()=>{
                const needsContent=!a.ready.edital||!a.ready.questoes;
                await change({data:{accountId:a.id,active:!a.active,allowEmpty:needsContent}});
                setStatus(a.active?"Ambiente desativado; dados preservados.":needsContent?"Acesso habilitado para o login vinculado. Importe edital e questões nesta conta para liberar o Treinar.":"Ambiente ativado para o login vinculado.");
              })}>{a.active?"Desativar":!a.ready.edital||!a.ready.questoes?"Habilitar acesso (sem questões)":"Ativar"}</button>
          </div>
        </article>)}
      </div>}
    </section>)}
    {reservedTarget&&<section className="qb-card">
      <h2>Associar projeto reservado a um login cadastrado</h2>
      <p>O apelido serve apenas para reservar o projeto. Depois que o candidato se cadastrar, informe o ID real dele. O vínculo não transfere projetos de outros usuários.</p>
      <form onSubmit={event=>{event.preventDefault();run(async()=>{await bind({data:{accountId:reservedTarget,userId:registeredUserId.trim()}});setReservedTarget("");setRegisteredUserId("");setStatus("Projeto reservado associado ao candidato. Importe o edital e as questões antes de ativar.");});}} style={{display:"grid",gap:12}}>
        <label>ID real do usuário cadastrado
          <input required value={registeredUserId} onChange={e=>setRegisteredUserId(e.target.value)} placeholder="ID do candidato no Base44" maxLength={160}/></label>
        <button className="qb-primary" type="submit" disabled={busy}>Associar o login ao projeto</button>
        <button type="button" onClick={()=>setReservedTarget("")}>Cancelar</button>
      </form>
    </section>}
    <section className="qb-card">
      <h2>Vincular login a um concurso</h2>
      <p>Use o vínculo manual para um login existente. Candidatos que se cadastram por conta própria aparecem em Solicitações pendentes.</p>
      <form onSubmit={createAccount} style={{display:"grid",gap:12}}>
        <label>ID do usuário no Base44
          <input required value={form.userId} onChange={e=>setForm(v=>({...v,userId:e.target.value}))} placeholder="ID do login cadastrado" maxLength={160}/></label>
        <label>Concurso
          <input required value={form.examName} onChange={e=>setForm(v=>({...v,examName:e.target.value}))} placeholder="Ex.: Tribunal de Contas · Analista" maxLength={160}/></label>
        <label>Data da prova (se conhecida)
          <input type="date" value={form.examDate} onChange={e=>setForm(v=>({...v,examDate:e.target.value}))}/></label>
        <button className="qb-primary" type="submit" disabled={busy}>Criar vínculo desativado</button>
      </form>
    </section>
    <section className="qb-card" id="importar-materiais">
      <h2>Importar materiais do concurso</h2>
      <p>Selecione o projeto vinculado ao candidato. Agora é possível acrescentar material mesmo com o acesso ativo, sem interromper a sessão. Os IDs existentes não são sobrescritos e o histórico do aluno permanece separado.</p>
      <form onSubmit={importFile} style={{display:"grid",gap:12}}>
        <label>Ambiente de destino
          <select required value={target} onChange={e=>setTarget(e.target.value)}>
            <option value="">Selecione o projeto do candidato</option>
            {accounts.filter(a=>!a.pending).map(a=><option key={a.id} value={a.id}>{a.examName} · {a.userId}{a.active?" · Ativo":""}</option>)}
          </select></label>
        <label>Tipo de material
          <select value={collection} onChange={e=>setCollection(e.target.value)}>
            {STUDY_CONTENT_COLLECTIONS.map(c=><option key={c} value={c}>{c}</option>)}
          </select></label>
        <label>Arquivo JSON
          <input required type="file" accept=".json,application/json" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
        <button className="qb-primary" type="submit" disabled={busy||!chosen||!file}>Importar coleção</button>
      </form>
      <p style={{fontSize:12}}>Aceita lista JSON ou objeto com <code>questoes</code> / <code>edital</code>. Arquivos PDF não são convertidos automaticamente. Para mapas e flashcards importe <strong>revisao</strong>. O treino clássico deste projeto utiliza itens Certo/Errado; questões de múltipla escolha exigem formato e correção próprios, portanto não serão convertidas silenciosamente.</p>
    </section>
    {status&&<p role="status" style={{padding:12,border:"1px solid #b5d3bb",borderRadius:9}}>{status}</p>}
    {error&&<p role="alert" style={{padding:12,border:"1px solid #e2b1b1",borderRadius:9,color:"#a52222"}}>{error}</p>}
  </section>;
}
