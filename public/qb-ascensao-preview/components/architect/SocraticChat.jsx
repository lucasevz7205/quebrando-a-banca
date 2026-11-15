import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
import { SelectField } from '../data/SelectField.jsx';
import { EmptyState } from '../data/EmptyState.jsx';
import { ConfirmDialog } from '../feedback/ConfirmDialog.jsx';

const MODES = [['socratico', 'Socrático'], ['feynman', 'Feynman'], ['banca', 'Banca CEBRASPE'], ['oral', 'Arguição oral']];
const QUICK = [['retencao', 'target', 'Testar retenção'], ['armadilhas', 'triangle-alert', 'Armadilhas da banca'], ['analogia', 'lightbulb', 'Analogia Feynman'], ['voz', 'mic', 'Arguição por voz']];

function reply(kind, topic) {
  const t = topic || 'este tópico';
  const R = {
    socratico: 'Antes de eu responder: o que você já sabe sobre "' + t + '"? Diga em uma frase qual problema essa regra resolve.',
    feynman: 'Explique "' + t + '" com palavras simples, sem termos técnicos, como se fosse para alguém fora do concurso. Depois eu aponto as lacunas.',
    banca: 'Julgue o item (exemplo demonstrativo, não extraído de prova): "Sobre ' + t + ', a regra admite exceções sempre que houver interesse público." Certo ou errado? Justifique.',
    oral: 'Arguição: em até 60 segundos, exponha "' + t + '" como numa banca oral. Pode digitar sua resposta — a entrada por voz não está disponível nesta demonstração.',
    retencao: 'Teste de retenção — sem consultar material: 1) Qual a ideia central de "' + t + '"? 2) Cite um dispositivo ou exemplo. 3) Qual erro é mais comum? Responda e compare com suas notas.',
    armadilhas: 'Padrões frequentes de pegadinha (genéricos, para treino): palavras absolutas ("sempre", "somente"), exceção inventada, troca de competência ou de prazo. Quer que eu monte um item com um deles sobre "' + t + '"?',
    analogia: 'Analogia para "' + t + '": pense num síndico e no zelador de um prédio — um decide o que precisa ser feito no dia a dia, o outro cuida das decisões maiores. Onde a analogia falha?',
  };
  return R[kind] || R.socratico;
}

export function SocraticChat({ subjects = [], subjectId, topicId, onContextChange, origin, style }) {
  const subj = subjects.find(s => s.id === subjectId) || subjects[0];
  const topic = subj && (subj.topics.find(t => t.id === topicId) || subj.topics[0]);
  const key = topic ? topic.id : 'none';
  const tLabel = topic ? (topic.num + ' · ' + (topic.title || 'Tópico ' + topic.num)) : '';
  const [hist, setHist] = React.useState({});
  const [mode, setMode] = React.useState('socratico');
  const [text, setText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [voiceMsg, setVoiceMsg] = React.useState(false);
  const [ask, setAsk] = React.useState(false);
  const listRef = React.useRef(null);
  const msgs = hist[key] || [];
  React.useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs.length, busy]);
  const push = m => setHist(h => ({ ...h, [key]: [...(h[key] || []), m] }));
  const answer = (kind, userText) => {
    if (userText) push({ role: 'user', text: userText });
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (userText && /erro/i.test(userText)) push({ role: 'error', text: 'Não foi possível gerar a resposta (erro simulado).', retry: kind });
      else push({ role: 'tutor', mode, text: reply(kind, topic && (topic.title || topic.num)) });
    }, 900);
  };
  const send = () => { const t = text.trim(); if (!t || busy) return; setText(''); answer(mode, t); };
  const quick = k => { if (k === 'voz') { setVoiceMsg(true); return; } answer(k, QUICK.find(q => q[0] === k)[2]); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, ...style }}>
      <div className="qb-panel qb-panel--sunken" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.3fr) auto', gap: 10, alignItems: 'end' }}>
          <SelectField label="Matéria do concurso" value={subj ? subj.id : ''} onChange={v => { const s = subjects.find(x => x.id === v); onContextChange && onContextChange(v, s.topics[0].id); }} options={subjects.map(s => ({ value: s.id, label: s.name }))} />
          <SelectField label="Assunto / tópico do edital" value={topic ? topic.id : ''} onChange={v => onContextChange && onContextChange(subj.id, v)} options={subj ? subj.topics.map(t => ({ value: t.id, label: t.num + ' · ' + (t.title || 'Tópico ' + t.num) })) : []} />
          <Button variant="secondary" size="sm" icon="trash-2" disabled={!msgs.length} onClick={() => setAsk(true)} style={{ height: 44 }}>Limpar histórico</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="qb-overline">Modo</span>
          <div className="qb-seg" role="group" aria-label="Modo pedagógico">{MODES.map(([v, l]) => <button key={v} className="qb-seg__opt" aria-pressed={mode === v} onClick={() => setMode(v)}>{l}</button>)}</div>
          <span style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--text-muted)' }}>Histórico separado por tópico{origin ? ' · aberto a partir de ' + origin : ''}</span>
        </div>
      </div>
      <div ref={listRef} role="log" aria-live="polite" aria-label="Conversa" style={{ flex: 1, minHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
        {!msgs.length && !busy && <EmptyState icon="message-circle" title={'Nenhuma conversa em ' + (topic ? topic.num : 'este tópico')} description="Escolha um modo e escreva sua dúvida, ou use uma ação rápida abaixo." />}
        {msgs.map((m, i) => m.role === 'user'
          ? <div key={i} className="qb-arch-msg" style={{ alignSelf: 'flex-end', background: 'var(--qb-navy-hover)', border: '1px solid rgba(208,179,134,.5)', color: 'var(--text-primary)', borderBottomRightRadius: 4 }}>{m.text}</div>
          : m.role === 'error'
            ? <div key={i} role="alert" className="qb-arch-msg" style={{ alignSelf: 'flex-start', border: '1px solid rgba(238,138,124,.55)', background: 'rgba(238,138,124,.08)', color: 'var(--text-primary)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Icon name="circle-x" size={16} color="var(--state-incorrect)" />{m.text}<Button size="sm" variant="ghost" icon="rotate-ccw" onClick={() => answer(m.retry)}>Tentar novamente</Button></div>
            : <div key={i} className="qb-arch-msg" style={{ alignSelf: 'flex-start', background: 'var(--surface)', border: 'var(--border-hairline)', color: 'var(--text-secondary)', borderBottomLeftRadius: 4 }}>
                <p style={{ font: '600 11px/1 var(--font-body)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--qb-gold)' }}>O Arquiteto · {MODES.find(x => x[0] === m.mode)[1]}</p><p>{m.text}</p>
              </div>)}
        {busy && <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 13px/1 var(--font-body)', color: 'var(--text-muted)' }}><Icon name="loader-circle" size={16} className="qb-spin" />O Arquiteto está elaborando (simulação)…</div>}
      </div>
      {voiceMsg && <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: '1px dashed rgba(171,162,152,.5)', font: '400 13px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}><Icon name="mic-off" size={16} color="var(--text-muted)" />Arguição por voz indisponível nesta demonstração (sem microfone nem reconhecimento de fala). Use o modo Arguição oral por texto.<button className="qb-iconbtn qb-iconbtn--sm" style={{ marginLeft: 'auto' }} aria-label="Fechar aviso" onClick={() => setVoiceMsg(false)}><Icon name="x" size={14} /></button></div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{QUICK.map(([k, ic, l]) => <button key={k} className="qb-chip" onClick={() => quick(k)} disabled={busy}><Icon name={ic} size={14} />{l}</button>)}</div>
      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: 8 }}>
        <input className="qb-input" value={text} onChange={e => setText(e.target.value)} placeholder={'Responda ou tire sua dúvida sobre ' + (topic ? (topic.title || topic.num) : 'o tópico') + '…'} aria-label="Mensagem ao Arquiteto" />
        <Button type="submit" icon="send" disabled={!text.trim() || busy}>Enviar</Button>
      </form>
      <ConfirmDialog open={ask} tone="danger" title="Limpar o histórico deste tópico?" description={'Remove as ' + msgs.length + ' mensagens de ' + tLabel + '. Conversas de outros tópicos são mantidas.'} confirmLabel="Limpar histórico" onCancel={() => setAsk(false)} onConfirm={() => { setHist(h => ({ ...h, [key]: [] })); setAsk(false); }} />
    </div>
  );
}
