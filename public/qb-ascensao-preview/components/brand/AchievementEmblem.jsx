import React from 'react';
import { Icon } from '../core/Icon.jsx';

const EMBLEMS = {
  soldado: { cls: 'qb-emblem-soldado', name: 'O Soldado', virtue: 'Disciplina e ação' },
  sabio: { cls: 'qb-emblem-sabio', name: 'O Sábio', virtue: 'Conhecimento e reflexão' },
  estrategista: { cls: 'qb-emblem-estrategista', name: 'O Estrategista', virtue: 'Visão e decisão' },
  ascensao: { cls: 'qb-emblem-ascensao', name: 'A Ascensão', virtue: 'A união das virtudes na conquista' },
};

export function AchievementEmblem({ variant = 'soldado', state = 'earned', size = 112, progress, rule, showLabel = true, style }) {
  const e = EMBLEMS[variant] || EMBLEMS.soldado;
  const locked = state === 'locked';
  const pct = progress != null ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : null;
  const stateText = state === 'earned' ? 'Conquistado' : locked ? 'Bloqueado' : `${pct ?? 0}% concluído`;
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: Math.max(size, 140), ...style }} aria-label={`${e.name} — ${stateText}${rule ? '. ' + rule : ''}`}>
      <div style={{ position: 'relative', width: size, height: size * 154 / 184 }}>
        <div className={`qb-img ${e.cls}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '18%', backgroundColor: 'var(--qb-obsidian)', filter: locked ? 'grayscale(1) brightness(.45)' : state === 'in-progress' ? 'saturate(.7) brightness(.8)' : 'none', boxShadow: state === 'earned' ? '0 0 28px -6px rgba(242,199,110,.45)' : 'none' }} />
        {locked && <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--qb-parchment)' }}><Icon name="lock" size={size * 0.24} /></span>}
        {state === 'earned' && <span aria-hidden="true" style={{ position: 'absolute', right: -6, bottom: -6, width: 28, height: 28, borderRadius: '50%', background: 'var(--qb-navy-deep)', border: '1px solid var(--state-correct)', color: 'var(--state-correct)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={16} strokeWidth={2.25} /></span>}
      </div>
      {showLabel && (
        <figcaption style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
          <span style={{ font: '600 13px/1.2 var(--font-display)', letterSpacing: '.12em', color: locked ? 'var(--text-muted)' : 'var(--qb-ivory)', textTransform: 'uppercase' }}>{e.name}</span>
          <span style={{ font: 'italic 500 15px/1.25 var(--font-serif)', color: 'var(--text-secondary)' }}>{e.virtue}</span>
          {state === 'in-progress' && pct != null && (
            <span style={{ width: Math.min(size, 120), height: 4, borderRadius: 999, background: 'var(--state-progress-track)', marginTop: 4, overflow: 'hidden' }}><span style={{ display: 'block', width: `${pct}%`, height: '100%', background: 'var(--state-progress)' }} /></span>
          )}
          <span style={{ font: '400 12px/1.35 var(--font-body)', color: 'var(--text-muted)', maxWidth: 160 }}>{rule ? rule : stateText}</span>
        </figcaption>
      )}
    </figure>
  );
}
