import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Tabs } from '../navigation/Tabs.jsx';
import { SocraticChat } from './SocraticChat.jsx';
import { FeynmanLab } from './FeynmanLab.jsx';
import { CornellNotebook } from './CornellNotebook.jsx';
import { ScannerFlashcards } from './ScannerFlashcards.jsx';
import { PomodoroAudio } from './PomodoroAudio.jsx';

const TOOLS = [
  { id: 'socratico', label: 'Tutor Socrático', icon: 'message-circle' },
  { id: 'feynman', label: 'Laboratório Feynman', icon: 'lightbulb' },
  { id: 'cornell', label: 'Caderno Cornell', icon: 'notebook-pen' },
  { id: 'cards', label: 'Flashcards 3D e Scanner', icon: 'layers' },
  { id: 'pomodoro', label: 'Pomodoro e Áudio Alfa', icon: 'timer' },
];

export function ArchitectStudio({ open = true, mode = 'modal', onClose, subjects = [], context = {}, onContextChange, tool: toolProp, onToolChange, deck = [], style }) {
  const [toolState, setToolState] = React.useState(toolProp || 'socratico');
  const tool = toolProp || toolState;
  const setTool = t => { setToolState(t); onToolChange && onToolChange(t); };
  React.useEffect(() => {
    if (!open || mode !== 'modal') return;
    const k = e => { if (e.key === 'Escape' && !document.querySelector('[role=alertdialog]')) onClose && onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, mode]);
  if (!open) return null;
  const subj = subjects.find(s => s.id === context.subjectId) || subjects[0];
  const topic = subj && (subj.topics.find(t => t.id === context.topicId) || subj.topics[0]);
  const tLabel = topic ? (subj.short || subj.name) + ' ' + topic.num + (topic.title ? ' · ' + topic.title : '') : 'o tópico';
  const panel = (
    <div role={mode === 'modal' ? 'dialog' : 'region'} aria-modal={mode === 'modal' || undefined} aria-label="O Arquiteto — estúdio de aprendizagem ativa" className="qb-panel qb-panel--ornate"
      style={{ position: 'relative', width: mode === 'modal' ? 'min(1180px, 100%)' : '100%', maxHeight: mode === 'modal' ? 'calc(100vh - 48px)' : undefined, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', ...style }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 14px 20px', borderBottom: '1px solid var(--divider)', flexWrap: 'wrap' }}>
        <span className="qb-badge qb-badge--gold" style={{ letterSpacing: '.12em', fontWeight: 600 }}>O ARQUITETO</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 220 }}>
          <span style={{ font: '400 20px/1.2 var(--font-heading)', color: 'var(--text-primary)' }}>Estúdio de aprendizagem ativa</span>
          <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>{context.origin ? 'Aberto a partir de ' + context.origin + ' · ' : ''}Contexto: {tLabel}</span>
        </div>
        <span className="qb-badge qb-badge--neutral" title="Respostas e análises simuladas; nenhum serviço de IA é chamado"><Icon name="info" size={13} />Simulação</span>
        {onClose && <button className="qb-btn qb-btn--secondary qb-btn--sm" onClick={onClose}><Icon name="x" size={16} />Fechar{mode === 'modal' ? ' (Esc)' : ''}</button>}
      </header>
      <div style={{ padding: '12px 16px 0' }}><Tabs label="Ferramentas do Arquiteto" items={TOOLS} value={tool} onChange={setTool} /></div>
      <div style={{ padding: 16, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {tool === 'socratico' && <SocraticChat subjects={subjects} subjectId={subj && subj.id} topicId={topic && topic.id} onContextChange={(s, t) => onContextChange && onContextChange({ ...context, subjectId: s, topicId: t })} origin={context.origin} style={{ flex: 1, minHeight: 460 }} />}
        {tool === 'feynman' && <FeynmanLab topicLabel={tLabel} />}
        {tool === 'cornell' && <CornellNotebook topicLabel={tLabel} />}
        {tool === 'cards' && <ScannerFlashcards topicLabel={tLabel} deck={deck} />}
        {tool === 'pomodoro' && <PomodoroAudio />}
      </div>
    </div>
  );
  if (mode !== 'modal') return panel;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,15,.72)', backdropFilter: 'blur(6px)' }} />
      {panel}
    </div>
  );
}
