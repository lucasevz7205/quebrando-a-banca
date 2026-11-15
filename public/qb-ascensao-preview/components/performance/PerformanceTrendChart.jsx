import React from 'react';
import { Panel } from '../core/Panel.jsx';
import { EmptyState } from '../data/EmptyState.jsx';

const enrich = d => { const valid = d.correct + d.wrong; return { ...d, valid, pct: valid ? (d.correct / valid) * 100 : null }; };
const srOnly = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
const TICKS = [0, 25, 50, 75, 100];

export function PerformanceTrendChart({ data = [], previous = null, currentLabel = 'Período atual', previousLabel = 'Período anterior', previousNote, granularity, granularities = [], onGranularity, height = 260, minSample = 10, title = 'Evolução da precisão', subtitle, style }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(640);
  const [active, setActive] = React.useState(null);
  const id = React.useId();
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setW(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const pts = data.map(enrich), prev = previous ? previous.map(enrich) : null;
  const withData = pts.filter(p => p.pct != null);
  const hasPrev = !!prev && prev.some(p => p.pct != null);
  const L = 42, R = 14, T = 14, B = 30, iw = Math.max(10, w - L - R), ih = height - T - B, n = pts.length;
  const X = i => L + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const Y = v => T + ih - (v / 100) * ih;
  const pathOf = arr => { let d = '', pen = false; arr.forEach((p, i) => { if (i >= n || p.pct == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(p.pct).toFixed(1); pen = true; }); return d; };
  const step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / (pts[0] && pts[0].label.length > 6 ? 110 : 56)))));
  const colW = n > 1 ? iw / (n - 1) : iw;
  const a = active != null && pts[active] ? pts[active] : null;
  const ap = a && prev && prev[active] && prev[active].pct != null ? prev[active] : null;
  const hi = withData.reduce((m, p) => (!m || p.pct > m.pct ? p : m), null), lo = withData.reduce((m, p) => (!m || p.pct < m.pct ? p : m), null);
  const gaps = n - withData.length;
  const summary = withData.length ? withData.length + ' de ' + n + (n === 1 ? ' período' : ' períodos') + ' com respostas válidas. Maior taxa: ' + Math.round(hi.pct) + '% (' + hi.label + '); menor: ' + Math.round(lo.pct) + '% (' + lo.label + ').' + (gaps ? ' ' + gaps + ' sem registros, mantidos sem ponto.' : '') : 'Nenhuma resposta válida no período.';
  const onKey = e => {
    if (!n) return;
    const k = e.key; let i = active == null ? n - 1 : active;
    if (k === 'ArrowRight') i = Math.min(n - 1, i + 1); else if (k === 'ArrowLeft') i = Math.max(0, i - 1); else if (k === 'Home') i = 0; else if (k === 'End') i = n - 1; else if (k === 'Escape') { setActive(null); return; } else return;
    e.preventDefault(); setActive(i);
  };
  const tipLeft = a ? (X(active) > w / 2 ? Math.max(0, X(active) - 14 - 204) : Math.min(w - 204, X(active) + 14)) : 0;
  const row = (k, v, c) => <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ color: 'var(--text-muted)' }}>{k}</span><span style={{ fontFamily: 'var(--font-mono)', color: c || 'var(--text-primary)' }}>{v}</span></div>;
  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <h2 id={id + 't'} className="qb-overline" style={{ color: 'var(--qb-gold)', margin: 0 }}>{title}</h2>
          {subtitle && <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>{subtitle}</span>}
        </div>
        {granularities.length > 0 && (
          <div className="qb-seg" role="group" aria-label="Agrupar por">
            {granularities.map(g => <button key={g.id} type="button" className="qb-seg__opt" style={{ height: 32, fontSize: 13 }} aria-pressed={g.id === granularity} onClick={() => onGranularity && onGranularity(g.id)}>{g.label}</button>)}
          </div>
        )}
      </div>
      <div ref={ref} style={{ width: '100%', minWidth: 0 }}>
        {!withData.length ? <EmptyState tone="empty" compact title="Sem respostas no período" description="Não há respostas válidas no escopo selecionado. Nenhum ponto é estimado." /> : (
          <div className="qb-perf-chart" tabIndex={0} role="group" aria-roledescription="gráfico interativo" aria-labelledby={id + 't'} aria-describedby={id + 's'} style={{ position: 'relative' }}
            onKeyDown={onKey} onFocus={() => active == null && setActive(n - 1)} onBlur={() => setActive(null)} onMouseLeave={() => setActive(null)}>
            <svg width={w} height={height} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
              {TICKS.map(t => <g key={t}><line x1={L} x2={L + iw} y1={Y(t)} y2={Y(t)} stroke="var(--viz-grid)" /><text x={L - 8} y={Y(t) + 4} textAnchor="end" fill="var(--text-secondary)" style={{ font: '400 11px var(--font-mono)' }}>{t}%</text></g>)}
              {a && <line x1={X(active)} x2={X(active)} y1={T} y2={T + ih} stroke="var(--qb-bronze)" strokeDasharray="3 3" />}
              {hasPrev && <path d={pathOf(prev)} fill="none" stroke="var(--viz-2)" strokeWidth="1.5" strokeDasharray="5 4" strokeLinejoin="round" opacity=".8" />}
              <path d={pathOf(pts)} fill="none" stroke="var(--qb-gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => p.pct == null
                ? <circle key={i} cx={X(i)} cy={Y(0)} r="3" fill="var(--canvas)" stroke="var(--state-no-evidence)" strokeDasharray="2 2" />
                : <circle key={i} cx={X(i)} cy={Y(p.pct)} r={i === active ? 5 : 3} fill={p.valid < minSample ? 'var(--surface)' : 'var(--qb-gold)'} stroke="var(--qb-gold)" strokeWidth="1.5" />)}
              {pts.map((p, i) => (i % step === 0 && (n - 1 - i >= step || i === n - 1)) || i === n - 1 ? <text key={i} x={X(i)} y={height - 8} textAnchor={n > 1 && i === n - 1 ? 'end' : n > 1 && i === 0 ? 'start' : 'middle'} fill="var(--text-secondary)" style={{ font: '400 11px var(--font-mono)' }}>{p.label}</text> : null)}
              {pts.map((p, i) => <rect key={i} x={X(i) - colW / 2} y={T} width={colW} height={ih + B} fill="transparent" onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} />)}
            </svg>
            {a && (
              <div style={{ position: 'absolute', top: T, left: tipLeft, width: 204, pointerEvents: 'none', padding: '10px 12px', borderRadius: 12, background: 'var(--surface-sunken)', border: '1px solid var(--qb-bronze)', boxShadow: 'var(--shadow-raised)', display: 'flex', flexDirection: 'column', gap: 4, font: '400 12px/1.4 var(--font-body)' }}>
                <strong style={{ font: '600 12px/1.3 var(--font-body)', color: 'var(--qb-gold)' }}>{a.longLabel || a.label}</strong>
                {a.pct == null ? <span style={{ color: 'var(--text-secondary)' }}>Sem respostas registradas.</span> : <>
                  {row('Acertos', a.correct, 'var(--state-correct)')}{row('Erros', a.wrong, 'var(--state-incorrect)')}{row('Total válido', a.valid)}{row('Percentual', Math.round(a.pct) + '%', 'var(--qb-gold-bright)')}
                  {a.valid < minSample && <span style={{ color: 'var(--state-attention)' }}>Amostra pequena (menos de {minSample})</span>}
                </>}
                {a.blank > 0 && row('Em branco', a.blank)}
                {ap && <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 4, marginTop: 2 }}>{row(previousLabel, Math.round(ap.pct) + '% · ' + ap.correct + '/' + ap.valid)}</div>}
              </div>
            )}
            <span aria-live="polite" style={srOnly}>{a ? (a.longLabel || a.label) + ': ' + (a.pct == null ? 'sem respostas registradas' : a.correct + ' acertos, ' + a.wrong + ' erros, ' + a.valid + ' válidas, ' + Math.round(a.pct) + ' por cento') + (ap ? '. ' + previousLabel + ': ' + Math.round(ap.pct) + ' por cento' : '') : ''}</span>
          </div>
        )}
      </div>
      {withData.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', font: '400 12px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="22" height="8" aria-hidden="true"><line x1="0" x2="22" y1="4" y2="4" stroke="var(--qb-gold)" strokeWidth="2" /></svg>{currentLabel}</span>
          {hasPrev && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="22" height="8" aria-hidden="true"><line x1="0" x2="22" y1="4" y2="4" stroke="var(--viz-2)" strokeWidth="1.5" strokeDasharray="5 4" /></svg>{previousLabel}</span>}
          {pts.some(p => p.pct != null && p.valid < minSample) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="3.5" fill="none" stroke="var(--qb-gold)" strokeWidth="1.5" /></svg>amostra pequena</span>}
          {gaps > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="3.5" fill="none" stroke="var(--state-no-evidence)" strokeDasharray="2 2" /></svg>sem registros (linha interrompida)</span>}
        </div>
      )}
      {!hasPrev && previousNote && <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-muted)' }}>{previousNote}</span>}
      <p id={id + 's'} style={{ margin: 0, font: '400 13px/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>{summary}</p>
      {n > 0 && (
        <details>
          <summary className="qb-linkbtn" style={{ fontSize: 13, display: 'inline-flex' }}>Ver dados em tabela</summary>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table className="qb-table"><caption style={srOnly}>{title}</caption>
              <thead><tr><th>Período</th><th className="num">Acertos</th><th className="num">Erros</th><th className="num">Válidas</th><th className="num">%</th>{hasPrev && <th className="num">Anterior</th>}</tr></thead>
              <tbody>{pts.map((p, i) => <tr key={p.key || i}><td>{p.label}</td>{p.pct == null ? <td colSpan={4} style={{ color: 'var(--text-muted)' }}>Sem registros</td> : <><td className="num">{p.correct}</td><td className="num">{p.wrong}</td><td className="num">{p.valid}</td><td className="num">{Math.round(p.pct)}%</td></>}{hasPrev && <td className="num">{prev[i] && prev[i].pct != null ? Math.round(prev[i].pct) + '%' : '—'}</td>}</tr>)}</tbody>
            </table>
          </div>
        </details>
      )}
    </Panel>
  );
}
