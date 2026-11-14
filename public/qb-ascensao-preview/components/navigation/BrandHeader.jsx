import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { BrandLogo } from '../brand/BrandLogo.jsx';

function useWidth(ref) {
  const [w, setW] = React.useState(1200);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setW(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return w;
}

const Divider = () => <span aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', margin: '14px 0', background: 'linear-gradient(180deg,rgba(208,179,134,0),rgba(208,179,134,.55),rgba(208,179,134,0))' }} />;

export function BrandHeader({ variant = 'full', items = [], activeId, onNavigate, notifications = 0, user, onSearch, onNotifications, onStats, onProfile, onExit, children, floating = true, style }) {
  const ref = React.useRef(null);
  const w = useWidth(ref);
  const narrow = w < 760;
  const iconNav = !narrow && w < 1100;
  const showArt = w >= 900;
  const shell = {
    position: 'relative', display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden',
    background: 'linear-gradient(180deg,#0F2640 0%,#0A1E34 100%)',
    border: floating ? '1px solid rgba(208,179,134,.45)' : 0, borderBottom: '1px solid rgba(208,179,134,.35)',
    borderRadius: floating ? 'var(--radius-card)' : 0, boxShadow: floating ? 'var(--shadow-raised)' : 'none', ...style,
  };

  if (variant === 'compact') {
    return (
      <header ref={ref} style={{ ...shell, height: 'var(--header-h-compact)', padding: '0 12px 0 16px' }}>
        <BrandLogo variant="mark" mark="q-sword" size={30} />
        <Divider />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 16 }}>{children}</div>
        {onExit && <IconButton icon="x" label="Sair da sessão" onClick={onExit} />}
      </header>
    );
  }

  return (
    <header ref={ref} style={{ ...shell, height: 'var(--header-h)', gap: narrow ? 8 : 16, padding: narrow ? '0 8px 0 0' : '0 12px 0 0' }}>
      {showArt && (
        <div className="qb-img qb-scene-sword-ribbon" aria-hidden="true" style={{ width: 200, alignSelf: 'stretch', backgroundPosition: '20% 40%', WebkitMaskImage: 'linear-gradient(90deg,#000 55%,transparent)', maskImage: 'linear-gradient(90deg,#000 55%,transparent)', flexShrink: 0, marginRight: -40 }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: narrow ? 8 : 16, paddingLeft: showArt ? 0 : (narrow ? 12 : 16), flexShrink: 0 }}>
        {!showArt && <BrandLogo variant="mark" mark="q-sword" size={narrow ? 26 : 32} />}
        {showArt && <Divider />}
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ font: narrow ? '600 16px/1 var(--font-serif)' : '600 24px/1 var(--font-serif)', color: 'var(--qb-ivory)', whiteSpace: 'nowrap' }}>Quebrando a Banca</span>
        </span>
      </div>
      {!narrow && items.length > 0 && (
        <nav aria-label="Principal" style={{ display: 'flex', gap: 4, marginLeft: 8, flexShrink: 0 }}>
          {items.map(it => (
            <button key={it.id} className="qb-navlink" aria-current={it.id === activeId ? 'page' : undefined} aria-label={iconNav ? it.label : undefined} title={iconNav ? it.label : undefined} onClick={() => onNavigate && onNavigate(it.id)} style={iconNav ? { width: 44, padding: 0, justifyContent: 'center' } : undefined}>
              {it.icon && <Icon name={it.icon} size={18} />}{!iconNav && it.label}
            </button>
          ))}
        </nav>
      )}
      <div style={{ flex: 1 }} />
      {!narrow && <Divider />}
      <div style={{ display: 'flex', alignItems: 'center', gap: narrow ? 2 : 4 }}>
        {!narrow && <IconButton icon="search" label="Buscar" onClick={onSearch} />}
        <IconButton icon="bell" label="Notificações" count={notifications} onClick={onNotifications} />
        {!narrow && <IconButton icon="chart-column" label="Desempenho" onClick={onStats} />}
        {narrow && items.length > 0 && <IconButton icon="menu" label="Menu" />}
        <button onClick={onProfile} aria-label={user ? `Perfil de ${user.name}` : 'Perfil'} className="qb-iconbtn qb-iconbtn--round" style={{ marginLeft: narrow ? 0 : 4 }}>
          {user && user.initials
            ? <span style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--qb-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px/1 var(--font-display)', color: 'var(--qb-gold)', background: 'var(--qb-navy-raised)' }}>{user.initials}</span>
            : <Icon name="circle-user" size={30} />}
        </button>
      </div>
    </header>
  );
}
