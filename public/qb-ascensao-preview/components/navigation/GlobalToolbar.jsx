import React from 'react';
import { Icon } from '../core/Icon.jsx';

const SYNC = { ok: ['cloud', 'Sincronizado', 'var(--state-correct)'], syncing: ['refresh-cw', 'Sincronizando…', 'var(--qb-gold-bright)'], offline: ['cloud-off', 'Offline', 'var(--state-incorrect)'] };

function Menu({ label, icon, minWidth, children }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null), btn = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const out = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, [open]);
  const onKey = e => {
    if (!open) return;
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); btn.current.focus(); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...ref.current.querySelectorAll('[role^="menuitem"]')], i = items.indexOf(document.activeElement);
    items[e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length].focus();
  };
  return (
    <div ref={ref} onKeyDown={onKey} style={{ position: 'relative' }}>
      <button ref={btn} className="qb-tool" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><Icon name={icon} size={14} />{label}<Icon name="chevron-down" size={14} /></button>
      {open && <div role="menu" aria-label={label} className="qb-menu" style={{ right: 0, top: 38, minWidth }}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

function Radio({ checked, onClick, children }) {
  return <button role="menuitemradio" aria-checked={checked} className="qb-menu__item" style={{ minHeight: 44 }} onClick={onClick}><span style={{ width: 16, display: 'flex' }}>{checked && <Icon name="check" size={16} color="var(--qb-gold-bright)" />}</span>{children}</button>;
}

export function GlobalToolbar({ sync = 'ok', onSync, background = 'dynamic', onBackground, theme = 'dark', onTheme, focusMode = false, onFocusMode, tools = [], onTool, collapsed = false, onCollapse, onArchitect, style }) {
  const s = SYNC[sync] || SYNC.ok;
  const cap = { padding: '8px 12px 4px', font: '600 11px/1 var(--font-body)', letterSpacing: 'var(--tracking-overline)', textTransform: 'uppercase', color: 'var(--text-muted)' };
  return (
    <div role="toolbar" aria-label="Controles globais" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 6, ...style }}>
      <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 6px', font: '500 12px/1 var(--font-body)', color: 'var(--text-secondary)' }}><Icon name={s[0]} size={14} color={s[2]} className={sync === 'syncing' ? 'qb-spin' : undefined} />{s[1]}</span>
      {sync === 'offline' && onSync && <button className="qb-tool" onClick={onSync}><Icon name="refresh-cw" size={14} />Tentar novamente</button>}
      {onArchitect && <button className="qb-tool qb-tool--accent" onClick={onArchitect}><Icon name="sparkles" size={14} />O Arquiteto</button>}
      {onFocusMode && <button className="qb-tool" aria-pressed={focusMode} onClick={() => onFocusMode(!focusMode)} title="Reduz cenário e cabeçalho durante o estudo"><Icon name="focus" size={14} />Modo foco{focusMode ? ': ativo' : ''}</button>}
      {(onBackground || onTheme) && (
        <Menu label="Preferências" icon="settings" minWidth={240}>{() => <>
          {onBackground && <><div style={cap}>Fundo</div>
            <Radio checked={background === 'dynamic'} onClick={() => onBackground('dynamic')}>Cena</Radio>
            <Radio checked={background === 'static'} onClick={() => onBackground('static')}>Estático</Radio></>}
          {onTheme && <><div style={cap}>Tema</div>
            <Radio checked={theme === 'dark'} onClick={() => onTheme('dark')}>Escuro</Radio>
            <Radio checked={theme === 'contrast'} onClick={() => onTheme('contrast')}>Alto contraste</Radio></>}
        </>}</Menu>
      )}
      {tools.length > 0 && (
        <Menu label="Ferramentas" icon="wrench">{close => tools.map(t => <button key={t.id} role="menuitem" className="qb-menu__item" style={{ minHeight: 44 }} onClick={() => { close(); onTool && onTool(t.id); }}>{t.icon && <Icon name={t.icon} size={16} color="var(--qb-gold)" />}{t.label}</button>)}</Menu>
      )}
      {onCollapse && <button className="qb-tool" onClick={onCollapse} aria-pressed={collapsed}><Icon name={collapsed ? 'chevrons-down' : 'chevrons-up'} size={14} />{collapsed ? 'Expandir' : 'Recolher'}</button>}
    </div>
  );
}
