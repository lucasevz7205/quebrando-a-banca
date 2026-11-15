import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
import { subjectStats } from './EditalTree.jsx';

function groups(s) {
  const g = [];
  s.topics.forEach(t => { const k = (String(t.num).match(/^\d+/) || [t.num])[0]; let x = g.find(y => y.key === k); if (!x) { x = { key: k, topics: [] }; g.push(x); } x.topics.push(t); });
  return g;
}

function Meter({ label, value, detail, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, font: '500 11px/1.2 var(--font-body)', color: 'var(--text-secondary)' }}><span>{label}</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value == null ? '—' : Math.round(value) + '%'}</span></div>
      <div style={{ height: 4, borderRadius: 999, background: 'var(--state-progress-track)', overflow: 'hidden' }}><div style={{ width: (value || 0) + '%', height: '100%', background: color }} /></div>
      <span style={{ font: '400 10.5px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{detail}</span>
    </div>
  );
}

export function SubjectRadial({ subjects = [], summary, size = 520, pageSize = 6, onSelectTopic, onOpenList, layout = 'auto', style }) {
  const ref = React.useRef(null);
  const [avail, setAvail] = React.useState(size);
  const [subjectId, setSubjectId] = React.useState(null);
  const [page, setPage] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setAvail(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const subj = subjects.find(s => s.id === subjectId);
  const nodes = subj
    ? groups(subj).map(g => ({ id: g.key, label: (g.topics.length === 1 && g.topics[0].title ? g.topics[0].num + ' ' + g.topics[0].title : 'Assunto ' + g.key), meta: g.topics.length + (g.topics.length > 1 ? ' tópicos' : ' tópico'), icon: 'file-text', topic: g.topics[0] }))
    : subjects.map(s => ({ id: s.id, label: s.short || s.name, meta: s.topics.length + ' tópicos · ' + s.block, icon: s.icon || 'book-open' }));
  const pages = Math.max(1, Math.ceil(nodes.length / pageSize));
  const p = Math.min(page, pages - 1);
  const shown = nodes.slice(p * pageSize, p * pageSize + pageSize);
  const pick = n => { if (subj) onSelectTopic && onSelectTopic(subj.id, n.topic.id); else { setSubjectId(n.id); setPage(0); } };
  const st = subj ? subjectStats(subj) : summary;
  const mode = layout === 'auto' ? (avail < size ? 'list' : 'radial') : layout;

  const center = (
    <div style={{ width: size * 0.36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>{subj ? subj.block : 'Edital'}</span>
      <span style={{ font: '600 16px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>{subj ? subj.name : 'Matérias'}</span>
      {st && <>
        <Meter label="Taxa de acertos" value={st.accuracy} color="var(--state-correct)" detail={st.correct + ' de ' + (st.valid != null ? st.valid : st.correct + st.wrong) + ' válidas'} />
        <Meter label="Cobertura" value={st.coverage} color="var(--qb-gold-bright)" detail={st.studied + ' de ' + st.total + ' tópicos estudados'} />
        <span style={{ font: '500 12px/1.2 var(--font-mono)', color: 'var(--text-secondary)' }}>{st.answered} respostas</span>
      </>}
    </div>
  );

  const pager = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
      {subj && <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => { setSubjectId(null); setPage(0); }}>Matérias</Button>}
      {pages > 1 && <Button variant="secondary" size="sm" icon="chevron-left" disabled={p === 0} onClick={() => setPage(p - 1)}>Anterior</Button>}
      {pages > 1 && <span style={{ font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }} aria-live="polite">Página {p + 1} de {pages} · {nodes.length} opções</span>}
      {pages > 1 && <Button variant="secondary" size="sm" iconRight="chevron-right" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Próxima</Button>}
      {onOpenList && <Button variant="ghost" size="sm" icon="list" onClick={() => onOpenList(subj && subj.id)}>Lista completa</Button>}
    </div>
  );

  if (mode === 'list') {
    return (
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', ...style }}>
        <div className="qb-panel" style={{ padding: 18 }}>{center}</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map(n => <li key={n.id}><button className="qb-radial__row" onClick={() => pick(n)}><Icon name={n.icon} size={20} color="var(--qb-gold)" /><span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ font: '500 15px/1.2 var(--font-body)' }}>{n.label}</span><span style={{ font: '400 13px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{n.meta}</span></span><Icon name="chevron-right" size={18} color="var(--text-muted)" /></button></li>)}
        </ul>
        {pager}
      </div>
    );
  }
  const R = size / 2 - 70;
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', ...style }}>
      <nav aria-label={subj ? 'Assuntos de ' + subj.name : 'Matérias do edital'} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(208,179,134,.4)', background: 'radial-gradient(circle,#173653 0%,rgba(10,30,52,.9) 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 70, borderRadius: '50%', border: '1px dashed rgba(165,138,103,.3)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: size * 0.27, borderRadius: '50%', border: '1px solid rgba(208,179,134,.35)', background: 'var(--surface-sunken)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>{center}</div>
        {shown.map((n, i) => {
          const a = (-90 + (360 / shown.length) * i) * Math.PI / 180;
          return (
            <button key={n.id} className="qb-radial__node" onClick={() => pick(n)} style={{ left: size / 2 + R * Math.cos(a), top: size / 2 + R * Math.sin(a), width: 132, marginLeft: -66 }}>
              <span className="qb-radial__orb"><Icon name={n.icon} size={24} strokeWidth={1.5} /></span>
              <span className="qb-radial__label" style={{ fontSize: 13, maxWidth: 132, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.label}</span>
              <span className="qb-radial__meta">{n.meta}</span>
            </button>
          );
        })}
      </nav>
      {pager}
      <p style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)', textAlign: 'center' }}>O anel é só navegação: a lista completa, filtros e dados continuam disponíveis.</p>
    </div>
  );
}
