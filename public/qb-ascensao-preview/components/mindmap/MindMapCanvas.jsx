import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

const MASTERY = { correct: ['circle-check', 'var(--state-correct)', 'Domínio demonstrado'], incorrect: ['circle-x', 'var(--state-incorrect)', 'Erros recentes'], 'no-evidence': ['circle-dashed', 'var(--state-no-evidence)', 'Sem evidência'], progress: ['loader-circle', 'var(--state-progress)', 'Em estudo'] };
const RADII = [0, 175, 330, 470];

function buildTree(nodes) {
  const byId = {}, kids = {};
  nodes.forEach(n => { byId[n.id] = n; kids[n.id] = []; });
  let root = null;
  nodes.forEach(n => { if (n.parent && kids[n.parent]) kids[n.parent].push(n.id); else if (!n.parent) root = n.id; });
  return { byId, kids, root };
}

function layout(tree, expanded) {
  const pos = {};
  const leaves = id => (expanded.has(id) && tree.kids[id].length ? tree.kids[id].reduce((s, k) => s + leaves(k), 0) : 1);
  const place = (id, depth, a0, a1) => {
    const a = (a0 + a1) / 2, r = RADII[Math.min(depth, 3)] + Math.max(0, depth - 3) * 140;
    pos[id] = { x: r * Math.cos(a), y: r * Math.sin(a) * 0.74, depth };
    if (!expanded.has(id)) return;
    const total = leaves(id);
    let cur = a0;
    tree.kids[id].forEach(k => { const span = (a1 - a0) * leaves(k) / total; place(k, depth + 1, cur, cur + span); cur += span; });
  };
  if (tree.root) place(tree.root, 0, -Math.PI / 2, Math.PI * 1.5);
  pos[tree.root] = { x: 0, y: 0, depth: 0 };
  return pos;
}

export function MindMapCanvas({ nodes = [], selectedId, onSelect, defaultExpanded, view: viewProp, onViewChange, focusPath = true, height = 560, style }) {
  const tree = React.useMemo(() => buildTree(nodes), [nodes]);
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded || nodes.filter(n => !n.parent || !nodes.find(p => p.id === n.parent)?.parent).map(n => n.id)));
  const [viewState, setViewState] = React.useState('map');
  const view = viewProp || viewState;
  const setView = v => { setViewState(v); onViewChange && onViewChange(v); };
  const [userZoom, setUserZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [box, setBox] = React.useState({ w: 800, h: height });
  const drag = React.useRef(null);
  const wrapRef = React.useRef(null);
  const pos = React.useMemo(() => layout(tree, expanded), [tree, expanded]);
  React.useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [view]);

  const pathSet = React.useMemo(() => { const s = new Set(); let c = selectedId; while (c && tree.byId[c]) { s.add(c); c = tree.byId[c].parent; } return s; }, [selectedId, tree]);
  const isVisible = id => { let p = tree.byId[id] && tree.byId[id].parent; while (p) { if (!expanded.has(p)) return false; p = tree.byId[p].parent; } return true; };
  const visible = nodes.filter(n => isVisible(n.id) && pos[n.id]);
  const bb = visible.reduce((b, n) => { const p = pos[n.id]; return { x0: Math.min(b.x0, p.x - 100), x1: Math.max(b.x1, p.x + 100), y0: Math.min(b.y0, p.y - 26), y1: Math.max(b.y1, p.y + 26) }; }, { x0: 0, x1: 0, y0: 0, y1: 0 });
  const fit = Math.max(0.7, Math.min(1.15, (box.w - 32) / (bb.x1 - bb.x0), (box.h - 110) / (bb.y1 - bb.y0)));
  const zoom = fit * userZoom;
  const off = { x: -(bb.x0 + bb.x1) / 2 * zoom, y: -(bb.y0 + bb.y1) / 2 * zoom + 4 };
  const related = id => !focusPath || !selectedId || pathSet.has(id) || tree.byId[id].parent === selectedId || (tree.byId[selectedId] && tree.byId[id].parent === tree.byId[selectedId].parent);

  const click = n => {
    if (tree.kids[n.id].length && (n.id === selectedId || !expanded.has(n.id))) {
      setExpanded(prev => { const s = new Set(prev); s.has(n.id) && n.id === selectedId ? s.delete(n.id) : s.add(n.id); return s; });
    }
    onSelect && onSelect(n.id);
  };
  const centerOn = id => { const p = pos[id]; if (p) setPan({ x: -p.x * zoom - off.x, y: -p.y * zoom - off.y }); };
  const reset = () => { setUserZoom(1); setPan({ x: 0, y: 0 }); };

  const toolbar = (
    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 2 }}>
      <div className="qb-seg" role="group" aria-label="Visualização">
        <button className="qb-seg__opt" aria-pressed={view === 'map'} onClick={() => setView('map')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="network" size={16} />Mapa</button>
        <button className="qb-seg__opt" aria-pressed={view === 'list'} onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="list" size={16} />Lista</button>
      </div>
    </div>
  );

  if (view === 'list') {
    const Row = ({ id, depth }) => {
      const n = tree.byId[id], k = tree.kids[id], open = expanded.has(id), m = n.mastery && MASTERY[n.mastery];
      return (
        <li>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: depth * 22 }}>
            {k.length ? <IconButton size="sm" icon={open ? 'chevron-down' : 'chevron-right'} label={open ? 'Recolher' : 'Expandir'} onClick={() => setExpanded(p => { const s = new Set(p); open ? s.delete(id) : s.add(id); return s; })} /> : <span style={{ width: 36 }} />}
            <button className="qb-navlink" aria-current={id === selectedId ? 'page' : undefined} onClick={() => onSelect && onSelect(id)} style={{ color: id === selectedId ? undefined : 'var(--text-primary)', fontWeight: depth < 2 ? 600 : 500 }}>
              {m && <Icon name={m[0]} size={15} color={m[1]} label={m[2]} />}{n.label}
            </button>
          </div>
          {open && k.length > 0 && <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{k.map(c => <Row key={c} id={c} depth={depth + 1} />)}</ul>}
        </li>
      );
    };
    return (
      <div className="qb-panel qb-panel--sunken" style={{ position: 'relative', height, overflow: 'auto', padding: '64px 16px 16px', ...style }}>
        {toolbar}
        <ul role="tree" style={{ listStyle: 'none', margin: 0, padding: 0 }}>{tree.root && <Row id={tree.root} depth={0} />}</ul>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="qb-panel qb-panel--sunken" style={{ position: 'relative', height, overflow: 'hidden', padding: 0, touchAction: 'none', cursor: drag.current ? 'grabbing' : 'grab', backgroundImage: 'radial-gradient(circle at 50% 50%,rgba(30,65,102,.55) 0%,rgba(16,28,45,0) 65%),radial-gradient(rgba(165,138,103,.14) 1px,transparent 1px)', backgroundSize: '100% 100%,28px 28px', ...style }}
      onPointerDown={e => { if (e.target.closest('button')) return; drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (drag.current) setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }); }}
      onPointerUp={() => { drag.current = null; }}>
      {toolbar}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2 }}>
        <IconButton variant="solid" size="sm" icon="zoom-in" label="Aproximar" onClick={() => setUserZoom(z => Math.min(2.2, z + 0.2))} />
        <IconButton variant="solid" size="sm" icon="zoom-out" label="Afastar" onClick={() => setUserZoom(z => Math.max(0.5, z - 0.2))} />
        <IconButton variant="solid" size="sm" icon="maximize" label="Enquadrar mapa" onClick={reset} />
        <IconButton variant="solid" size="sm" icon="locate-fixed" label="Centralizar no nó selecionado" onClick={() => centerOn(selectedId || tree.root)} />
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 14, flexWrap: 'wrap', zIndex: 2, font: '400 12px/1 var(--font-body)', color: 'var(--text-muted)' }}>
        {['correct', 'incorrect', 'no-evidence'].map(k => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name={MASTERY[k][0]} size={14} color={MASTERY[k][1]} />{MASTERY[k][2]}</span>)}
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(${pan.x + off.x}px,${pan.y + off.y}px) scale(${zoom})`, transition: drag.current ? 'none' : 'transform var(--dur-slow) var(--ease-standard)' }}>
        <svg width="1" height="1" style={{ position: 'absolute', overflow: 'visible' }} aria-hidden="true">
          {visible.filter(n => n.parent && pos[n.parent]).map(n => {
            const a = pos[n.parent], b = pos[n.id], on = pathSet.has(n.id) && pathSet.has(n.parent);
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return <path key={n.id} d={`M${a.x},${a.y} Q${mx * 1.05},${my * 0.95} ${b.x},${b.y}`} fill="none" stroke={on ? 'var(--qb-gold-bright)' : 'rgba(165,138,103,.45)'} strokeWidth={on ? 2 : 1.25} opacity={related(n.id) ? 1 : 0.35} />;
          })}
        </svg>
        {visible.map(n => {
          const p = pos[n.id], m = n.mastery && MASTERY[n.mastery], hidden = !expanded.has(n.id) ? tree.kids[n.id].length : 0;
          const cls = ['qb-mm__node', p.depth === 0 && 'qb-mm__node--root', p.depth === 1 && 'qb-mm__node--l1', !related(n.id) && 'is-dim'].filter(Boolean).join(' ');
          return (
            <button key={n.id} className={cls} aria-selected={n.id === selectedId} aria-expanded={tree.kids[n.id].length ? expanded.has(n.id) : undefined} style={{ left: p.x, top: p.y, width: 'max-content' }} onClick={() => click(n)}>
              {m && <Icon name={m[0]} size={15} color={m[1]} label={m[2]} />}
              <span style={{ whiteSpace: n.label.length > 24 ? 'normal' : 'nowrap' }}>{n.label}</span>
              {hidden > 0 && <span style={{ font: '500 11px/1 var(--font-mono)', color: 'var(--qb-gold)', padding: '3px 6px', borderRadius: 6, background: 'rgba(208,179,134,.12)' }}>+{hidden}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
