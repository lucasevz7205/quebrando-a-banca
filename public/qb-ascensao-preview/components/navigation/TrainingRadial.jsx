import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

export const TRAINING_ACTIONS = [
  { id: 'train', label: 'Treinar', icon: 'target', hint: 'Questões deste assunto' },
  { id: 'mindmap', label: 'Mapa Mental', icon: 'network', hint: 'Mapa do assunto' },
  { id: 'review', label: 'Revisão Ativa', icon: 'layers', hint: 'Revisão deste assunto' },
  { id: 'architect', label: 'O Arquiteto', icon: 'sparkles', hint: 'Tutor com este contexto' },
];
const rate = (c, w) => (c + w ? (c / (c + w)) * 100 : null);
const subjRate = s => { let c = 0, w = 0; s.topics.forEach(t => { c += t.correct; w += t.wrong; }); return { acc: rate(c, w), valid: c + w }; };
const pct = v => Math.round(v) + '%';

function Ring({ value }) {
  const r = 39, C = 2 * Math.PI * r;
  return (
    <svg aria-hidden="true" width="84" height="84" viewBox="0 0 84 84" style={{ position: 'absolute', left: -6, top: -6, transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(165,138,103,.3)" strokeWidth="2" />
      {value != null && <circle cx="42" cy="42" r={r} fill="none" stroke="var(--qb-gold-bright)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - value / 100)} />}
    </svg>
  );
}

export function TrainingRadial({ subjects = [], value, onChange, onAction, pending = {}, linkInfo, size = 540, pageSize = 9, layout = 'auto', emptyTitle = 'Título não disponível nos arquivos', style }) {
  const [inner, setInner] = React.useState({ subjectId: null, topicId: null });
  const sel = value || inner;
  const set = v => { if (!value) setInner(v); onChange && onChange(v); };
  const [mode, setMode] = React.useState(layout === 'list' ? 'list' : 'radial');
  const [page, setPage] = React.useState(0);
  const [avail, setAvail] = React.useState(size);
  const ref = React.useRef(null);
  const first = React.useRef(true);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setAvail(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  // No silent fallback: an unknown id simply resolves to the level above.
  const subj = subjects.find(s => s.id === sel.subjectId) || null;
  const topic = subj ? subj.topics.find(t => t.id === sel.topicId) || null : null;
  const level = topic ? 3 : subj ? 2 : 1;
  React.useEffect(() => { if (first.current) { first.current = false; return; } ref.current && ref.current.focus(); }, [level, subj && subj.id]);

  const narrow = avail < size;
  const radial = mode === 'radial' && !narrow && layout !== 'list';
  const toSubjects = () => { setPage(0); set({ subjectId: null, topicId: null }); };
  const toTopics = () => set({ subjectId: subj.id, topicId: null });
  const fire = a => { const info = linkInfo ? linkInfo(subj.id, topic.id, a.id) || {} : {}; onAction && onAction({ subjectId: subj.id, topicId: topic.id, action: a.id, nodeId: info.nodeId }); };
  const onKey = e => { if (e.key !== 'Escape' || level === 1) return; e.stopPropagation(); level === 3 ? toTopics() : toSubjects(); };

  let nodes;
  if (level === 1) nodes = subjects.map(s => { const r = subjRate(s); return { key: s.id, icon: s.icon || 'book-open', label: s.short || s.name, full: s.name, ring: r.acc, meta: r.acc != null ? pct(r.acc) + ' de acertos' : 'Sem respostas', sub: s.topics.length + ' assuntos · ' + r.valid + ' válidas', onClick: () => { setPage(0); set({ subjectId: s.id, topicId: null }); } }; });
  else if (level === 2) nodes = subj.topics.map(t => { const a = rate(t.correct, t.wrong), p = pending[t.id]; return { key: t.id, code: t.num, label: t.title, full: t.title || emptyTitle, untitled: !t.title, ring: a, meta: a != null ? pct(a) + ' de acertos' : 'Sem respostas', sub: (a != null ? t.correct + ' de ' + (t.correct + t.wrong) + ' válidas' : 'Sem respostas válidas') + (p ? ' · ' + p + (p > 1 ? ' pendentes' : ' pendente') : ''), pend: p, onClick: () => set({ subjectId: subj.id, topicId: t.id }) }; });
  else nodes = TRAINING_ACTIONS.map(a => { const info = linkInfo ? linkInfo(subj.id, topic.id, a.id) || {} : {}; return { key: a.id, icon: a.icon, label: a.label, full: a.label, meta: info.note || a.hint, sub: info.note || a.hint, off: info.available === false, action: a, nodeId: info.nodeId, onClick: () => fire(a) }; });

  const pages = radial ? Math.max(1, Math.ceil(nodes.length / pageSize)) : 1;
  const p = Math.min(page, pages - 1);
  const shown = radial ? nodes.slice(p * pageSize, p * pageSize + pageSize) : nodes;
  const tAcc = topic ? rate(topic.correct, topic.wrong) : null;
  const sAcc = subj ? subjRate(subj) : null;
  const tPend = topic ? pending[topic.id] : 0;
  const attrs = n => n.action ? { 'data-action': n.action.id, 'data-subject-id': subj.id, 'data-topic-id': topic.id, 'data-node-id': n.nodeId || undefined } : level === 2 ? { 'data-subject-id': subj.id, 'data-topic-id': n.key } : { 'data-subject-id': n.key };
  const stat = { font: '500 12px/1.3 var(--font-mono)', color: 'var(--text-secondary)' };

  const center = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
      {level === 1 && <><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Nível 1 · Matérias</span><span style={{ font: '400 22px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>Escolha a matéria</span><span style={stat}>{subjects.length} matérias</span></>}
      {level === 2 && <><span className="qb-overline" style={{ color: 'var(--qb-gold)' }}>Nível 2 · Assuntos</span><span style={{ font: '400 19px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>{subj.name}</span><span style={stat}>{sAcc.acc != null ? pct(sAcc.acc) + ' de acertos · ' + sAcc.valid + ' válidas' : 'Sem respostas válidas'}</span><Button variant="ghost" size="sm" icon="arrow-left" onClick={toSubjects}>Matérias</Button></>}
      {level === 3 && <><span style={{ font: '500 13px/1.2 var(--font-mono)', color: 'var(--qb-gold)' }}>{subj.short} {topic.num}</span><span style={{ font: (topic.title ? '400 17px/1.25 var(--font-heading)' : 'italic 400 14px/1.3 var(--font-body)'), color: topic.title ? 'var(--text-primary)' : 'var(--text-muted)' }}>{topic.title || emptyTitle}</span><span style={stat}>{tAcc != null ? pct(tAcc) + ' · ' + topic.correct + ' de ' + (topic.correct + topic.wrong) + ' válidas' : 'Sem respostas válidas'}</span>{tPend ? <span style={stat}>{tPend} {tPend > 1 ? 'atividades pendentes' : 'atividade pendente'}</span> : null}<Button variant="ghost" size="sm" icon="arrow-left" onClick={toTopics}>Assuntos</Button></>}
    </div>
  );

  const R = size / 2 - 64;
  return (
    <div ref={ref} tabIndex={-1} onKeyDown={onKey} aria-label={level === 1 ? 'Seleção de matéria' : level === 2 ? 'Assuntos de ' + subj.name : 'Ações para ' + subj.short + ' ' + topic.num} style={{ display: 'flex', flexDirection: 'column', gap: 14, outline: 'none', minWidth: 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <nav aria-label="Caminho da seleção" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button className="qb-tool" aria-current={level === 1 ? 'step' : undefined} onClick={toSubjects}>Matérias</button>
          {subj && <><Icon name="chevron-right" size={14} color="var(--text-muted)" /><button className="qb-tool" aria-current={level === 2 ? 'step' : undefined} onClick={toTopics}>{subj.short || subj.name}</button></>}
          {topic && <><Icon name="chevron-right" size={14} color="var(--text-muted)" /><span className="qb-tool" aria-current="step" style={{ cursor: 'default', fontFamily: 'var(--font-mono)' }}>{topic.num}</span></>}
        </nav>
        {!narrow && layout !== 'list' && (
          <div role="group" aria-label="Formato da navegação" style={{ display: 'flex', gap: 6 }}>
            <button className="qb-tool" aria-pressed={mode === 'radial'} onClick={() => setMode('radial')}><Icon name="locate-fixed" size={14} />Radial</button>
            <button className="qb-tool" aria-pressed={mode === 'list'} onClick={() => setMode('list')}><Icon name="list" size={14} />Lista</button>
          </div>
        )}
      </div>
      <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{level === 1 ? 'Matérias' : level === 2 ? 'Assuntos de ' + subj.name : 'Ações para o assunto ' + topic.num}</span>
      {radial ? (
        <>
          <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, alignSelf: 'center' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(208,179,134,.4)', background: 'radial-gradient(circle,#173653 0%,rgba(10,30,52,.9) 62%)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 64, borderRadius: '50%', border: '1px dashed rgba(165,138,103,.3)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: size * 0.26, borderRadius: '50%', border: '1px solid rgba(208,179,134,.35)', background: 'var(--surface-sunken)' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: size * 0.4 }}>{center}</div>
            {shown.map((n, i) => {
              const a = (-90 + (360 / shown.length) * i) * Math.PI / 180;
              return (
                <button key={n.key} className="qb-radial__node" title={n.full} onClick={n.onClick} {...attrs(n)} style={{ left: size / 2 + R * Math.cos(a), top: size / 2 + R * Math.sin(a), width: 128, marginLeft: -64, gap: 8 }}>
                  <span style={{ position: 'relative', display: 'flex' }}>
                    <span className="qb-radial__orb">{n.icon ? <Icon name={n.icon} size={24} strokeWidth={1.5} /> : <span style={{ font: '500 15px/1 var(--font-mono)' }}>{n.code}</span>}</span>
                    {level < 3 && <Ring value={n.ring} />}
                    {n.pend ? <span aria-hidden="true" className="qb-iconbtn__count" style={{ top: -2, right: -6 }}>{n.pend}</span> : null}
                  </span>
                  {n.label && <span className="qb-radial__label" style={{ fontSize: 13, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.label}</span>}
                  <span className="qb-radial__meta" style={{ marginTop: n.label ? -4 : 0, color: n.off ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{n.meta}{n.pend ? <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}> · {n.pend} pendentes</span> : null}</span>
                </button>
              );
            })}
          </div>
          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" icon="chevron-left" disabled={p === 0} onClick={() => setPage(p - 1)}>Anterior</Button>
              <span aria-live="polite" style={{ font: '500 13px/1 var(--font-body)', color: 'var(--text-secondary)' }}>Página {p + 1} de {pages} · {nodes.length} assuntos</span>
              <Button variant="secondary" size="sm" iconRight="chevron-right" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Próxima</Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="qb-panel qb-panel--sunken" style={{ padding: 16 }}>{center}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shown.map(n => (
              <li key={n.key}>
                <button className="qb-radial__row" onClick={n.onClick} {...attrs(n)}>
                  {n.icon ? <Icon name={n.icon} size={20} color="var(--qb-gold)" /> : <span style={{ font: '500 13px/1.4 var(--font-mono)', color: 'var(--qb-gold)', minWidth: 40 }}>{n.code}</span>}
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ font: n.untitled ? 'italic 400 14px/1.35 var(--font-body)' : '500 15px/1.35 var(--font-body)', color: n.untitled ? 'var(--text-muted)' : 'inherit' }}>{n.full}</span>
                    <span style={{ font: '400 13px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{level === 1 ? n.meta + ' · ' + n.sub : n.sub}</span>
                  </span>
                  <Icon name={level === 3 ? 'arrow-right' : 'chevron-right'} size={18} color="var(--text-muted)" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {level > 1 && <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)', textAlign: 'center' }}>Esc volta um nível. A seleção é mantida ao retornar de uma atividade.</span>}
    </div>
  );
}
