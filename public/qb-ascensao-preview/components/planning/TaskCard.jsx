import React from 'react';
import { Icon } from '../core/Icon.jsx';

export const TASK_TYPES = {
  estudo: { label: 'Estudo', icon: 'book-open' },
  revisao: { label: 'Revisão', icon: 'repeat' },
  questoes: { label: 'Questões', icon: 'target' },
  flashcards: { label: 'Flashcards', icon: 'layers' },
  simulado: { label: 'Simulado', icon: 'graduation-cap' },
  discursiva: { label: 'Discursiva', icon: 'square-pen' },
};

export function TaskCard({ task, selected, onClick, preview, compact = false, style }) {
  const t = TASK_TYPES[task.type] || TASK_TYPES.estudo;
  const done = task.status === 'done', late = task.status === 'late';
  return (
    <button className={'qb-task' + (done ? ' is-done' : '') + (late ? ' is-late' : '')} aria-pressed={!!selected} onClick={onClick} style={style}
      aria-label={t.label + ': ' + (task.topicNum ? task.topicNum + ' ' : '') + task.title + ', ' + task.subject + ', ' + task.minutes + ' minutos, ' + (done ? 'concluída' : late ? 'atrasada' : 'pendente')}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11px/1 var(--font-body)', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--qb-gold)' }}>
        <Icon name={t.icon} size={13} />{t.label}
        {task.auto && <span title="Revisão automática — não é movida pelos ajustes" style={{ display: 'inline-flex', color: 'var(--text-muted)' }}><Icon name="lock" size={12} /></span>}
        <span style={{ marginLeft: 'auto', font: '500 11px/1 var(--font-mono)', color: 'var(--text-muted)', letterSpacing: 0, textTransform: 'none' }}>{task.minutes} min</span>
      </span>
      <span style={{ font: '500 ' + (compact ? 13 : 14) + 'px/1.3 var(--font-body)', color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
        {task.topicNum && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--qb-gold)', marginRight: 6 }}>{task.topicNum}</span>}{task.title}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', font: '400 12px/1.2 var(--font-body)', color: 'var(--text-muted)' }}>
        {task.subject}
        {done && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--state-correct)' }}><Icon name="circle-check" size={13} />Concluída</span>}
        {late && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--state-incorrect)' }}><Icon name="clock" size={13} />Atrasada</span>}
        {preview && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--qb-gold-bright)' }}><Icon name="calendar-clock" size={13} />{preview}</span>}
      </span>
    </button>
  );
}
