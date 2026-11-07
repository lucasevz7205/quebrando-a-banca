import { createFileRoute } from "@tanstack/react-router";
import { getData } from "@/lib/qb-server";
import Heading from "@/components/qb/Heading";
import ProposalCard from "@/components/qb/ProposalCard";
export const Route=createFileRoute("/_authed/propostas")({loader:()=>getData(),head:()=>({meta:[{title:"Propostas · Quebrando a Banca"}]}),component:Proposals});
function Proposals(){const s=Route.useLoaderData();return <><Heading title="Propostas de correção">Compare o antes e o depois. Uma aprovação gera uma nova decisão, preservando o original.</Heading>{!s.proposals.length&&<div className="qb-card"><h2>Nenhuma proposta pendente.</h2><p>Abra uma questão para propor uma correção ou importe propostas na página Fontes e arquivos.</p></div>}{[...s.proposals].reverse().map(p=><ProposalCard key={p.id} p={p} decision={s.decisions.find(d=>d.proposal_id===p.id)}/>)}</>;}
