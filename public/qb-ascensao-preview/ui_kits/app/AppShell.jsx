(() => {
const { BrandHeader } = window.QuebrandoABancaDesignSystem_3e4054;

const QB_NAV = [
  { id: 'dashboard', label: 'Início', icon: 'house' },
  { id: 'questions', label: 'Questões', icon: 'list-checks' },
  { id: 'map', label: 'Mapas', icon: 'network' },
  { id: 'flashcards', label: 'Flashcards', icon: 'layers' },
  { id: 'tutor', label: 'Tutor', icon: 'message-circle' },
];

function AppShell({ active, onNavigate, onProfile, children, wide }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 0', maxWidth: 1312, width: '100%', margin: '0 auto' }}>
        <BrandHeader items={QB_NAV} activeId={active} onNavigate={onNavigate} notifications={1} user={window.QB_DATA.user} onStats={() => onNavigate('dashboard')} onProfile={onProfile} />
      </div>
      <main style={{ flex: 1, width: '100%', maxWidth: wide ? 1312 : 1272, margin: '0 auto', padding: '24px 16px 48px' }}>{children}</main>
    </div>
  );
}

Object.assign(window, { AppShell, QB_NAV });
})();
