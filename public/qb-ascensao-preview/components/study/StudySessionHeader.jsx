import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { ProgressBar } from '../core/ProgressBar.jsx';

function fmt(s) { const m = Math.floor(s / 60), r = s % 60; return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`; }

export function StudySessionHeader({ subject, topic, current = 0, total = 0, unit = 'Questão', elapsed = 0, focusMode = false, onToggleFocus, onBack, paused = false, onTogglePause, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 64, padding: '8px 12px', borderBottom: '1px solid var(--divider)', background: 'var(--canvas)', flexWrap: 'wrap', ...style }}>
      {onBack && <IconButton icon="arrow-left" label="Voltar" onClick={onBack} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '1 1 180px' }}>
        <span className="qb-overline" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subject}</span>
        <span style={{ font: '400 18px/1.25 var(--font-heading)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic}</span>
      </div>
      {total > 0 && (
        <ProgressBar value={current / total} label={unit} valueText={`${current} de ${total}`} style={{ flex: '1 1 150px', maxWidth: 320 }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span role="timer" aria-label={`Tempo de sessão ${fmt(elapsed)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 10, background: 'var(--surface-sunken)', border: 'var(--border-hairline)', font: '500 14px/1 var(--font-mono)', color: paused ? 'var(--text-muted)' : 'var(--text-primary)' }}>
          <Icon name="timer" size={16} color="var(--qb-gold)" />{fmt(elapsed)}
        </span>
        {onTogglePause && <IconButton icon={paused ? 'play' : 'pause'} label={paused ? 'Retomar' : 'Pausar'} onClick={onTogglePause} />}
        {onToggleFocus && <IconButton icon="focus" label="Modo foco" pressed={focusMode} onClick={onToggleFocus} />}
      </div>
    </div>
  );
}
