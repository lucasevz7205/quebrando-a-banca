import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
import { TaskCard } from './TaskCard.jsx';

export function WeekCalendar({ days = [], today, selectedDate, onSelectDay, selectedTaskId, onSelectTask, previews = {}, maxVisible = 4, weekLabel, onPrevWeek, onNextWeek, onToday, isCurrentWeek = true, style }) {
  const [openDays, setOpenDays] = React.useState([]);
  return (
    <section aria-label="Calendário semanal" style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="ghost" size="sm" icon="chevron-left" onClick={onPrevWeek} aria-label="Semana anterior">Anterior</Button>
        <span style={{ font: '600 15px/1.2 var(--font-body)', color: 'var(--text-primary)', minWidth: 160, textAlign: 'center' }} aria-live="polite">{weekLabel}</span>
        <Button variant="ghost" size="sm" iconRight="chevron-right" onClick={onNextWeek} aria-label="Próxima semana">Próxima</Button>
        {!isCurrentWeek && <Button variant="secondary" size="sm" icon="calendar" onClick={onToday}>Semana atual</Button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + days.length + ', minmax(190px, 1fr))', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map(d => {
          const done = d.tasks.filter(t => t.status === 'done').length;
          const mins = d.tasks.reduce((a, t) => a + t.minutes, 0);
          const open = openDays.includes(d.date);
          const vis = open ? d.tasks : d.tasks.slice(0, maxVisible);
          const isToday = d.date === today, isSel = d.date === selectedDate;
          return (
            <div key={d.date} className={'qb-day' + (isToday ? ' is-today' : '') + (isSel && !isToday ? ' is-selected' : '')}>
              <button className="qb-day__head" onClick={() => onSelectDay && onSelectDay(d.date)} aria-pressed={isSel} aria-label={d.weekday + ' ' + d.dayNum + ', ' + done + ' de ' + d.tasks.length + ' tarefas concluídas'}>
                <span className="qb-overline">{d.weekday}{isToday ? ' · hoje' : ''}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ font: '600 22px/1 var(--font-body)', color: isToday ? 'var(--qb-gold-bright)' : 'var(--text-primary)' }}>{d.dayNum}</span>
                  <span style={{ font: '400 12px/1 var(--font-body)', color: 'var(--text-muted)' }}>{done}/{d.tasks.length} · {Math.round(mins / 6) / 10} h</span>
                </span>
                <span aria-hidden="true" style={{ height: 3, borderRadius: 999, background: 'var(--state-progress-track)', overflow: 'hidden', marginTop: 4 }}><span style={{ display: 'block', height: '100%', width: (d.tasks.length ? (done / d.tasks.length) * 100 : 0) + '%', background: 'var(--state-correct)' }} /></span>
              </button>
              {d.tasks.length === 0 && <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)', padding: '4px' }}>Sem tarefas</span>}
              {vis.map(t => <TaskCard key={t.id} task={t} compact selected={t.id === selectedTaskId} preview={previews[t.id]} onClick={() => onSelectTask && onSelectTask(t)} />)}
              {d.tasks.length > maxVisible && (
                <button className="qb-linkbtn" style={{ fontSize: 13, padding: '2px 4px' }} onClick={() => setOpenDays(o => open ? o.filter(x => x !== d.date) : [...o, d.date])}>
                  <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />{open ? 'Mostrar menos' : '+ ' + (d.tasks.length - maxVisible) + ' tarefas'}
                </button>
              )}
              {d.autoReviews ? <span style={{ font: '400 11px/1.3 var(--font-body)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="lock" size={12} />{d.autoReviews} revisões automáticas</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
