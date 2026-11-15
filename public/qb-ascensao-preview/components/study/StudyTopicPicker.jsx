import React from 'react';
import { Icon } from '../core/Icon.jsx';

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let seq = 0;

export function StudyTopicPicker({ subjects = [], value, onSelect, counts = {}, countLabel = ['mapa', 'mapas'], recents = [], favorites = [], pendingReviews = [], label = 'Assunto', placeholder = 'Buscar por matéria, código ou assunto', emptyTitle = 'Título não disponível nos arquivos', style }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const trigger = React.useRef(null), input = React.useRef(null), list = React.useRef(null), closeBtn = React.useRef(null);
  const uid = React.useMemo(() => 'qb-picker-' + (++seq), []);
  const index = React.useMemo(() => { const m = {}; subjects.forEach(s => s.topics.forEach(t => { m[t.id] = { s, t }; })); return m; }, [subjects]);
  const cur = value ? index[value] : null;
  const sections = React.useMemo(() => {
    const out = [], toks = norm(q).split(/\s+/).filter(Boolean);
    if (!toks.length) [['recent', 'Recentes', 'history', recents], ['fav', 'Favoritos', 'bookmark', favorites], ['rev', 'Revisões pendentes', 'repeat', pendingReviews]].forEach(([key, lab, icon, ids]) => {
      const items = ids.map(id => index[id]).filter(Boolean);
      if (items.length) out.push({ key, label: lab, icon, items, shortcut: true });
    });
    subjects.forEach(s => {
      const items = s.topics.filter(t => { const h = norm(s.name + ' ' + (s.short || '') + ' ' + t.num + ' ' + (s.short || '') + ' ' + t.num + ' ' + (t.title || '')); return toks.every(k => h.includes(k)); }).map(t => ({ s, t }));
      if (items.length) out.push({ key: s.id, label: s.name, meta: s.block, icon: s.icon || 'book-open', items, total: s.topics.length });
    });
    return out;
  }, [subjects, q, recents, favorites, pendingReviews, index]);
  const flat = sections.flatMap(sec => sec.items.map(it => ({ ...it, sec })));

  const show = () => { setQ(''); setOpen(true); };
  const close = () => { setOpen(false); trigger.current && trigger.current.focus(); };
  const choose = it => { if (!it) return; onSelect && onSelect({ subjectId: it.s.id, topicId: it.t.id }); close(); };
  React.useEffect(() => {
    if (!open) return;
    const i = flat.findIndex(f => !f.sec.shortcut && f.t.id === value);
    setActive(i < 0 ? 0 : i);
    input.current && input.current.focus();
  }, [open]);
  React.useEffect(() => {
    if (!open || !list.current) return;
    const el = document.getElementById(uid + '-' + active), box = list.current;
    if (!el) return;
    const top = el.offsetTop - 40, bottom = el.offsetTop + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = Math.max(0, top);
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 6;
  }, [active, open, q]);
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(flat[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === input.current ? closeBtn.current : input.current).focus(); }
  };
  const count = id => { const n = counts[id]; return n ? n + ' ' + (n > 1 ? countLabel[1] : countLabel[0]) : null; };
  let i = -1;
  return (
    <div style={{ minWidth: 0, ...style }}>
      <button ref={trigger} type="button" className="qb-picker__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={show}>
        <Icon name="search" size={18} color="var(--qb-gold)" />
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="qb-overline" style={{ fontSize: 11 }}>{label}</span>
          {cur ? <span style={{ font: '500 15px/1.35 var(--font-body)' }}><span className="qb-picker__code" style={{ marginRight: 8 }}>{cur.s.short} {cur.t.num}</span><span style={cur.t.title ? undefined : { fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>{cur.t.title || emptyTitle}</span></span>
            : <span style={{ font: '400 15px/1.35 var(--font-body)', color: 'var(--text-muted)' }}>{value ? 'Identificador não encontrado: ' + value : 'Selecionar assunto'}</span>}
        </span>
        <Icon name="chevron-down" size={18} color="var(--text-muted)" />
      </button>
      {open && (
        <div className="qb-picker__scrim" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
          <div role="dialog" aria-modal="true" aria-label={'Selecionar ' + label.toLowerCase()} className="qb-picker" onKeyDown={onKey}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px 10px 16px', borderBottom: '1px solid var(--divider)' }}>
              <Icon name="search" size={18} color="var(--text-muted)" />
              <input ref={input} role="combobox" aria-expanded="true" aria-controls={uid + '-list'} aria-activedescendant={flat.length ? uid + '-' + active : undefined} aria-autocomplete="list" aria-label={placeholder} value={q} onChange={e => { setQ(e.target.value); setActive(0); }} placeholder={placeholder} autoComplete="off" spellCheck="false" style={{ flex: 1, minWidth: 0, height: 44, border: 0, outline: 'none', background: 'transparent', color: 'var(--qb-ivory)', font: '400 16px/1.4 var(--font-body)' }} />
              <button ref={closeBtn} type="button" className="qb-iconbtn" aria-label="Fechar seletor" onClick={close}><Icon name="x" size={18} /></button>
            </div>
            <div ref={list} id={uid + '-list'} role="listbox" aria-label="Assuntos por matéria" className="qb-picker__list">
              {sections.map(sec => (
                <div key={sec.key} role="group" aria-label={sec.label}>
                  <div className="qb-picker__group"><Icon name={sec.icon} size={14} /><span style={{ flex: 1, minWidth: 0 }}>{sec.label}</span><span style={{ font: '500 11px/1 var(--font-mono)', color: 'var(--text-muted)', letterSpacing: 0 }}>{sec.meta ? sec.meta + ' · ' : ''}{sec.total && sec.items.length !== sec.total ? sec.items.length + ' de ' + sec.total : sec.items.length}</span></div>
                  {sec.items.map(it => { i++; const n = i, on = it.t.id === value, c = count(it.t.id); return (
                    <div key={sec.key + it.t.id} id={uid + '-' + n} role="option" aria-selected={on} data-active={n === active} data-topic-id={it.t.id} className="qb-picker__opt" onMouseMove={() => n !== active && setActive(n)} onClick={() => choose(it)}>
                      <span className="qb-picker__code">{sec.shortcut ? it.s.short + ' ' : ''}{it.t.num}</span>
                      <span style={it.t.title ? { minWidth: 0 } : { minWidth: 0, fontStyle: 'italic', color: 'var(--text-muted)' }}>{it.t.title || emptyTitle}</span>
                      <span style={{ font: '500 12px/1.7 var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c}</span>
                      <span style={{ display: 'flex', paddingTop: 2 }}>{on && <Icon name="check" size={16} color="var(--qb-gold-bright)" />}</span>
                    </div>); })}
                </div>
              ))}
              {!flat.length && <div style={{ padding: '28px 16px', textAlign: 'center', font: '400 15px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>Nenhum assunto corresponde a “{q}”.<br /><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tente o código (ex.: 10.6) ou parte do nome da matéria.</span></div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '8px 16px', borderTop: '1px solid var(--divider)', font: '400 12px/1.4 var(--font-mono)', color: 'var(--text-muted)' }}>
              <span>↑ ↓ percorrer · Enter selecionar · Esc fechar</span>
              <span aria-live="polite">{flat.length} {flat.length === 1 ? 'resultado' : 'resultados'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
