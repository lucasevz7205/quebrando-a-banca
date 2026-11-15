import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
import { Button } from '../core/Button.jsx';
import { ProgressBar } from '../core/ProgressBar.jsx';
import { EmptyState } from '../data/EmptyState.jsx';

const ACTIONS = { train: { label: 'Treinar', icon: 'target' }, mindmap: { label: 'Abrir mapa', icon: 'map' }, review: { label: 'Revisão ativa', icon: 'layers' }, architect: { label: 'O Arquiteto', icon: 'sparkles' } };
const LEVEL = { subject: 'Matéria', group: 'Assunto', topic: 'Tópico' };
const SORTS = [{ id: 'edital', label: 'Ordem do edital' }, { id: 'accuracy', label: 'Menor acerto' }, { id: 'volume', label: 'Mais respostas' }];
const stat = n => { const valid = n.correct + n.wrong; return { valid, pct: valid ? Math.round((n.correct / valid) * 100) : null }; };
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

function Row({ node, open, toggle, onAction, minSample, lowBelow, prep }) {
  const { valid, pct } = stat(node);
  const kids = node.children ? prep(node.children) : null;
  const isOpen = open.has(node.id), pid = 'qbperf-' + node.id.replace(/[^a-z0-9]/gi, '_');
  const badge = !valid ? <Badge tone="no-evidence">Sem respostas</Badge> : valid < minSample ? <Badge tone="attention">Amostra pequena</Badge> : pct < lowBelow ? <Badge tone="incorrect">Abaixo de {lowBelow}%</Badge> : pct >= 85 ? <Badge tone="correct">85% ou mais</Badge> : <Badge tone="neutral" icon={null}>{lowBelow}–84%</Badge>;
  const onKey = e => {
    const k = e.key;
    if (k === 'ArrowRight' && !isOpen) { e.preventDefault(); toggle(node.id); }
    else if (k === 'ArrowLeft' && isOpen) { e.preventDefault(); toggle(node.id); }
    else if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Home' || k === 'End') {
      const all = [...e.currentTarget.closest('.qb-perf-explorer').querySelectorAll('[data-perf-row]')], i = all.indexOf(e.currentTarget);
      const t = k === 'Home' ? all[0] : k === 'End' ? all[all.length - 1] : all[i + (k === 'ArrowDown' ? 1 : -1)];
      if (t) { e.preventDefault(); t.focus(); }
    }
  };
  const acts = (node.actions || []).filter(a => ACTIONS[a]);
  return (
    <li>
      <button type="button" className="qb-perf-row" data-perf-row={node.id} aria-expanded={isOpen} aria-controls={pid} onClick={() => toggle(node.id)} onKeyDown={onKey}>
        <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={16} color="var(--qb-gold)" />
        <span className="qb-perf-row__name"><span className="qb-perf-row__title">
          {node.icon && <Icon name={node.icon} size={16} color="var(--qb-gold)" />}
          {node.level !== 'subject' && node.code && <span style={{ font: '500 12px/1 var(--font-mono)', color: 'var(--qb-gold)', flexShrink: 0 }}>{node.code}</span>}
          <span style={{ font: (node.level === 'subject' ? '600 15px' : node.level === 'group' ? '600 14px' : '400 14px') + '/1.35 var(--font-body)', color: node.untitled ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: node.untitled ? 'italic' : 'normal', minWidth: 0 }}>{node.name}</span></span>
          <span className="qb-perf-row__level">{LEVEL[node.level]}{kids ? ' · ' + plural(node.children.length, node.level === 'subject' ? 'item' : 'tópico', node.level === 'subject' ? 'itens' : 'tópicos') : ''}</span>
        </span>
        <span className="qb-perf-row__bar">{valid ? <ProgressBar value={pct / 100} showValue={false} size="sm" tone={pct >= 85 ? 'correct' : pct < lowBelow ? 'gold' : 'progress'} /> : <span style={{ display: 'block', height: 4, borderRadius: 999, border: '1px dashed rgba(171,162,152,.5)' }} />}</span>
        <span className="qb-perf-row__pct">{pct == null ? '—' : pct + '%'}</span>
        <span className="qb-perf-row__counts">{valid ? <><b style={{ color: 'var(--state-correct)', fontWeight: 500 }}>{node.correct} C</b> · <b style={{ color: 'var(--state-incorrect)', fontWeight: 500 }}>{node.wrong} E</b> · {plural(valid, 'válida', 'válidas')}</> : 'sem respostas válidas'}</span>
        <span className="qb-perf-row__badge">{badge}</span>
      </button>
      {isOpen && (kids ? (
        kids.length ? <ul id={pid} className="qb-perf-children">{kids.map(c => <Row key={c.id} node={c} open={open} toggle={toggle} onAction={onAction} minSample={minSample} lowBelow={lowBelow} prep={prep} />)}</ul>
          : <p id={pid} className="qb-perf-detail" style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Nenhum item com respostas neste nível.</p>
      ) : (
        <div id={pid} className="qb-perf-detail">
          <dl style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', margin: 0 }}>
            {[['Acertos', node.correct, 'var(--state-correct)'], ['Erros', node.wrong, 'var(--state-incorrect)'], ['Em branco', node.blank || 0], ['Respostas válidas', valid]].map(([k, v, c]) => <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}><dd style={{ margin: 0, font: '600 14px/1 var(--font-mono)', color: c || 'var(--text-primary)' }}>{v}</dd><dt style={{ font: '400 12px/1 var(--font-body)', color: 'var(--text-muted)' }}>{k}</dt></div>)}
          </dl>
          {!valid && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Sem respostas válidas no período selecionado; o percentual não é calculado.</span>}
          {acts.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {acts.map(a => <Button key={a} size="sm" variant="secondary" icon={ACTIONS[a].icon} data-action={a} data-subject-id={node.subjectId} data-topic-id={node.topicId} data-node-id={node.nodeId || undefined}
                onClick={() => onAction && onAction({ action: a, subjectId: node.subjectId, topicId: node.topicId, ...(node.nodeId ? { nodeId: node.nodeId } : {}) })}>{ACTIONS[a].label}</Button>)}
            </div>
          ) : <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>Nenhum conteúdo vinculado a este tópico.</span>}
        </div>
      ))}
    </li>
  );
}

export function SubjectPerformanceExplorer({ nodes = [], onAction, reveal, minSample = 20, lowBelow = 60, title = 'Desempenho por matéria e assunto', description, emptyTitle = 'Sem dados no escopo', emptyDescription = 'Nenhuma matéria corresponde aos filtros.', style }) {
  const [open, setOpen] = React.useState(() => new Set());
  const [sort, setSort] = React.useState('edital');
  const [only, setOnly] = React.useState(false);
  const root = React.useRef(null);
  const toggle = id => setOpen(o => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const single = nodes.length === 1 ? nodes[0].id : null;
  React.useEffect(() => { if (single) setOpen(o => new Set([...o, single])); }, [single]);
  const token = reveal ? reveal.token : null;
  React.useEffect(() => {
    if (!reveal) return;
    const ids = [];
    nodes.forEach(s => { if (s.id !== reveal.subjectId) return; ids.push(s.id); (s.children || []).forEach(c => { if (c.id === reveal.topicId) ids.push(c.id); else if (c.children && c.children.some(t => t.id === reveal.topicId)) ids.push(c.id, reveal.topicId); }); });
    setOpen(o => new Set([...o, ...ids]));
    const t = setTimeout(() => { const el = root.current && root.current.querySelector('[data-perf-row="' + reveal.topicId + '"]'); el && el.focus(); }, 80);
    return () => clearTimeout(t);
  }, [token]);
  const prep = list => {
    let l = only ? list.filter(n => n.correct + n.wrong > 0) : list.slice();
    if (sort === 'accuracy') l.sort((a, b) => { const x = stat(a).pct, y = stat(b).pct; return (x == null) - (y == null) || x - y; });
    if (sort === 'volume') l.sort((a, b) => stat(b).valid - stat(a).valid);
    return l;
  };
  const branches = []; const walk = l => l.forEach(n => { if (n.children) { branches.push(n.id); walk(n.children); } }); walk(nodes);
  const top = prep(nodes);
  return (
    <section ref={root} className="qb-panel qb-perf-explorer" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '1 1 260px' }}>
          <h2 style={{ font: 'var(--type-h2)', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
          {description && <p style={{ margin: 0, font: '400 13px/1.45 var(--font-body)', color: 'var(--text-secondary)' }}>{description}</p>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <div className="qb-seg" role="group" aria-label="Ordenar">{SORTS.map(s => <button key={s.id} type="button" className="qb-seg__opt" style={{ height: 32, fontSize: 13 }} aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>{s.label}</button>)}</div>
          <div className="qb-seg" role="group" aria-label="Exibição"><button type="button" className="qb-seg__opt" style={{ height: 32, fontSize: 13 }} aria-pressed={only} onClick={() => setOnly(v => !v)}>Só com respostas</button></div>
          <Button size="sm" variant="ghost" icon="chevrons-down" onClick={() => setOpen(new Set(branches))}>Expandir</Button>
          <Button size="sm" variant="ghost" icon="chevrons-up" onClick={() => setOpen(new Set())}>Recolher</Button>
        </div>
      </div>
      {!top.length ? <EmptyState tone="empty" compact title={emptyTitle} description={only && nodes.length ? 'Nenhuma matéria tem respostas válidas no período selecionado.' : emptyDescription} /> : (
        <>
          <div className="qb-perf-head" aria-hidden="true"><span></span><span>Nome</span><span>Desempenho</span><span style={{ textAlign: 'right' }}>%</span><span>Acertos · erros · válidas</span><span>Indicador</span></div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{top.map(n => <Row key={n.id} node={n} open={open} toggle={toggle} onAction={onAction} minSample={minSample} lowBelow={lowBelow} prep={prep} />)}</ul>
        </>
      )}
    </section>
  );
}
