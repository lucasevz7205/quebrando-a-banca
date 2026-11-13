/* Inventário não destrutivo RF 2.1–2.8. Não modifica coleções nem histórico. */
import fs from "node:fs";
const qs=JSON.parse(fs.readFileSync("src/data/rf-questoes-revisao-2026-11-10.json","utf8"));
const revisoes=JSON.parse(fs.readFileSync("scripts/rf-reformulacao/depois-2026-11-10.json","utf8"));
const isArchitect=x=>String(x?.protocolo||"").startsWith("cebraspe-")||/arquiteto/i.test(String(x?.origem||""));
const rows=[],summary=[];
const auditoriaUsuario={inventarioAprovado:true,aprovadoEm:"2026-11-13",escopo:"autorizacao para prosseguir com triagem e propostas; nao valida fontes ou gabaritos"};
for(let n=1;n<=8;n++){
 const id="rf-2-"+n, q=qs.filter(x=>x.topico===id), cards=revisoes[id]?.cartoes||[];
 const eligibleQuestions=q.filter(x=>!isArchitect(x));
 const eligibleCards=cards.map((c,i)=>({c,i})).filter(({c})=>!isArchitect(c));
 for(const x of eligibleQuestions)rows.push({tipo:"questao",topico:id,id:x.id,tema:x.tema||"",defeito:"a diagnosticar; não presumir erro",fonteVerificada:false});
 for(const {c,i} of eligibleCards)rows.push({tipo:"cartao",topico:id,id:id+"@"+i,tema:c.tema||"",pergunta:c.q||"",defeito:"a diagnosticar; não presumir erro",fonteVerificada:false});
 summary.push({topico:id,questoesProtegidas:q.length-eligibleQuestions.length,questoesElegiveis:eligibleQuestions.length,cartoesElegiveis:eligibleCards.length});
}
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/rf2-inventario-pendente.json",JSON.stringify({geradoEm:"2026-11-13",escopo:"snapshot de codigo; conferir banco ativo antes de qualquer alteracao",summary,rows,auditoriaUsuario},null,2)+"\n");
console.log(JSON.stringify({summary,totalElegiveis:rows.length,paradaObrigatoria:rows.length>60&&!auditoriaUsuario.inventarioAprovado},null,2));
if(rows.length>60&&!auditoriaUsuario.inventarioAprovado)console.log("BLOQUEADO: inventário requer auditoria do usuário.");
else console.log("INVENTÁRIO APROVADO: liberar triagem e propostas; preservar originais e exigir conferência de fontes.");
