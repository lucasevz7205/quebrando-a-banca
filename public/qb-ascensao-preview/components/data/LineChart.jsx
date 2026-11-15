import React from 'react';
import { EmptyState } from './EmptyState.jsx';

export function LineChart({ data = [], height = 220, yMax = 100, yTicks = [0, 25, 50, 75, 100], format = v => v + '%', minSample = 10, label, color = 'var(--viz-1)', style }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(600);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setW(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const pts = data.filter(d => d.y != null);
  if (!pts.length) return <div ref={ref} style={style}><EmptyState tone="empty" title="Sem respostas no período" description="Responda questões para formar a série." compact /></div>;
  const L = 44, R = 12, T = 12, B = 28, iw = Math.max(10, w - L - R), ih = height - T - B;
  const X = i => L + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const Y = v => T + ih - (v / yMax) * ih;
  const segs = []; let curSeg = null;
  data.forEach((d, i) => { if (d.y == null) { curSeg = null; return; } if (!curSeg) { curSeg = []; segs.push(curSeg); } curSeg.push([X(i), Y(d.y)]); });
  const path = segs.map(s => 'M' + s.map(p => p[0] + ',' + p[1]).join('L')).join('');
  const area = segs.filter(s => s.length > 1).map(s => 'M' + s[0][0] + ',' + (T + ih) + 'L' + s.map(p => p[0] + ',' + p[1]).join('L') + 'L' + s[s.length - 1][0] + ',' + (T + ih) + 'Z').join('');
  const step = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(iw / 70))));
  return (
    <div ref={ref} style={{ width: '100%', ...style }}>
      <svg width={w} height={height} role="img" aria-label={label || 'Gráfico de linha'} style={{ display: 'block', overflow: 'visible' }}>
        {yTicks.map(t => <g key={t}><line x1={L} x2={L + iw} y1={Y(t)} y2={Y(t)} stroke="var(--viz-grid)" /><text x={L - 8} y={Y(t) + 4} textAnchor="end" fill="var(--text-muted)" style={{ font: '400 11px var(--font-mono)' }}>{format(t)}</text></g>)}
        {area && <path d={area} fill="var(--viz-area)" />}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => d.y == null ? null : (
          <circle key={i} cx={X(i)} cy={Y(d.y)} r={i === data.length - 1 ? 5 : 3.5} fill={d.n != null && d.n < minSample ? 'var(--qb-navy-deep)' : color} stroke={color} strokeWidth="1.5">
            <title>{d.x + ': ' + format(Math.round(d.y)) + (d.n != null ? ' · ' + d.n + ' respostas' : '')}</title>
          </circle>
        ))}
        {data.map((d, i) => (i % step === 0 && (data.length - 1 - i >= step || i === data.length - 1)) || i === data.length - 1 ? <text key={'x' + i} x={X(i)} y={height - 8} textAnchor="middle" fill="var(--text-muted)" style={{ font: '400 11px var(--font-mono)' }}>{d.x}</text> : null)}
      </svg>
      {data.some(d => d.n != null && d.n < minSample) && <p style={{ margin: '6px 0 0 ' + L + 'px', font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>○ ponto vazado = amostra pequena (menos de {minSample} respostas). Dias sem respostas ficam sem ponto.</p>}
    </div>
  );
}
