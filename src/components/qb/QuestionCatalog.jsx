import { useState } from "react";
import { incidence } from "@/lib/qb-catalog";
import { creationBrief } from "@/lib/question-authoring";

const groups = [["autoral", "Inéditas"], ["prova", "Provas analisadas"], ["cebraspe", "Referências CEBRASPE"]];
const sorted = values => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true }));
const pct = value => new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(value);

function download(name, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Filter({ label, value, options, onChange, empty }) {
  return <label>{label}<select value={value} onChange={e => onChange(e.target.value)}>
    <option value="">{empty}</option>
    {options.map(option => <option key={option}>{option}</option>)}
  </select></label>;
}

export default function QuestionCatalog({ items }) {
  const [group, setGroup] = useState("autoral");
  const [area, setArea] = useState("");
  const [materia, setMateria] = useState("");
  const [assunto, setAssunto] = useState("");
  const [cargo, setCargo] = useState("");
  const [ano, setAno] = useState("");
  const [page, setPage] = useState(0);
  const category = items.filter(q => q.tipo === group);
  const scoped = category.filter(q => !area || q.ambiente === area);
  const subject = scoped.filter(q => !materia || q.materia === materia);
  const topic = subject.filter(q => !assunto || q.assunto === assunto);
  const role = topic.filter(q => !cargo || q.cargo === cargo);
  const results = role.filter(q => !ano || String(q.ano) === ano);
  const stats = group === "prova" ? incidence(category, materia, assunto, cargo, ano) : null;
  const last = Math.max(0, Math.ceil(results.length / 25) - 1);

  return <section className="qb-card">
    <h2>Catálogo do Laboratório</h2>
    <div className="qb-filters" aria-label="Acervos">
      {groups.map(([id, label]) => <button key={id} type="button" aria-pressed={group === id} onClick={() => {
        setGroup(id); setArea(""); setMateria(""); setAssunto(""); setCargo(""); setAno(""); setPage(0);
      }}>{label} ({items.filter(q => q.tipo === id).length})</button>)}
    </div>
    <div className="qb-filters">
      {group === "autoral" && <Filter label="Ambiente" value={area} options={sorted(category.map(q => q.ambiente))}
        empty="Todos os ambientes" onChange={v => { setArea(v); setMateria(""); setAssunto(""); setCargo(""); setPage(0); }}/>}
      <Filter label="Matéria" value={materia} options={sorted(scoped.map(q => q.materia))} empty="Todas"
        onChange={v => { setMateria(v); setAssunto(""); setCargo(""); setAno(""); setPage(0); }}/>
      <Filter label="Assunto" value={assunto} options={sorted(subject.map(q => q.assunto))} empty="Todos"
        onChange={v => { setAssunto(v); setCargo(""); setAno(""); setPage(0); }}/>
      {(group !== "autoral" || topic.some(q => q.cargo)) && <>
        <Filter label="Cargo" value={cargo} options={sorted(topic.map(q => q.cargo))} empty="Todos"
          onChange={v => { setCargo(v); setAno(""); setPage(0); }}/>
        {group !== "autoral" && <Filter label="Ano" value={ano} options={sorted(role.map(q => q.ano))} empty="Todos"
          onChange={v => { setAno(v); setPage(0); }}/> }
      </>}
    </div>
    <p>{results.length} itens no recorte.</p>
    {group === "autoral" && <button type="button" disabled={!results.length}
      onClick={() => download("quebrando-a-banca-ineditas.json", { versao: 1, questoes: results })}>Exportar inéditas em JSON</button>}
    {group === "prova" && <div className="qb-note">
      {stats?.total ? <>
        <p>Incidência na amostra do cargo: <strong>{stats.ocorrencias}/{stats.total} ({pct(stats.ocorrencias / stats.total)})</strong>.
          O denominador reúne itens válidos da matéria no cargo e período selecionados.</p>
        <h3>Caçador de Pegadinhas · mecanismos de falsificação</h3>
        <p>{stats.falsos} itens falsos no assunto; {stats.semMecanismo} sem classificação disponível.</p>
        <ul>{stats.rows.map(row => <li key={row.mecanismo}>{row.mecanismo} · {row.n}/{stats.falsos} ({pct(row.proporcao)})</li>)}</ul>
        <button type="button" disabled={!stats.rows.length} onClick={() => download("quebrando-a-banca-pauta.json", creationBrief({
          materia, assunto, cargo, ano, stats,
          evidencias: results.filter(q => stats.rows.some(row => row.referencias.includes(q.id)))
            .map(({ id, prova, item, evidencia, mecanismo, vacina }) => ({ id, prova, item, evidencia, mecanismo, vacina })),
        }))}>Exportar pauta de criação</button>
      </> : <p>Selecione matéria, assunto e cargo com itens válidos para calcular a incidência observada.</p>}
    </div>}
    <div className="qb-table"><table>
      <thead><tr><th>Questão</th><th>Matéria / assunto</th><th>Origem</th></tr></thead>
      <tbody>{results.slice(page * 25, (page + 1) * 25).map(q => <tr key={JSON.stringify([q.ambiente, q.id])}>
        <td><details><summary>{q.id}</summary><p>{q.enunciado || q.evidencia || "Enunciado indisponível"}</p>
          <p>Gabarito: {q.gabarito || "—"}</p><p>{q.comentario}</p>
          <small>{typeof q.fonte === "string" ? q.fonte : q.fonte?.documento}{q.fonte?.pagina ? ` · p. ${q.fonte.pagina}` : ""}</small>
        </details></td>
        <td>{q.materia}<br/><small>{q.assunto}</small></td>
        <td>{q.ambiente || q.orgao || "Órgão a confirmar"}<br/>
          {(group !== "autoral" || q.cargo) && <small>{q.cargo || "Cargo a confirmar"}{q.ano ? ` · ${q.ano}` : ""}</small>}
          {q.tipo === "prova" && !q.valido && <p>Fora do cálculo</p>}
        </td>
      </tr>)}</tbody>
    </table></div>
    <div className="qb-pagination">
      <button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
      <span>Página {page + 1} de {last + 1}</span>
      <button disabled={page >= last} onClick={() => setPage(page + 1)}>Próxima</button>
    </div>
  </section>;
}
