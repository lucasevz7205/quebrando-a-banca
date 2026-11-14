(() => {
const { BrandLogo, Button } = window.QuebrandoABancaDesignSystem_3e4054;

function Welcome({ onEnter }) {
  const [email, setEmail] = React.useState('lucas@exemplo.com');
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', isolation: 'isolate', display: 'flex', alignItems: 'center' }}>
      <div className="qb-img qb-scene-night" aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundPosition: '65% 40%', zIndex: -2 }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'linear-gradient(90deg,rgba(10,30,52,.97) 0%,rgba(10,30,52,.9) 32%,rgba(10,30,52,.4) 60%,rgba(10,30,52,.1) 100%),linear-gradient(180deg,rgba(10,30,52,0) 60%,rgba(10,30,52,.8) 100%)' }} />
      <main style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: 'clamp(24px,5vw,64px)' }}>
        <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <BrandLogo variant="vertical" size={220} style={{ marginLeft: -16 }} />
          <p style={{ font: 'italic 500 22px/1.35 var(--font-serif)', color: 'var(--qb-parchment)' }}>Conhecimento · Estratégia · Disciplina · Conquista</p>
          <form onSubmit={e => { e.preventDefault(); onEnter(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: 'var(--type-label)', color: 'var(--text-secondary)' }}>E-mail</span>
              <input className="qb-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <Button type="submit" size="lg" iconRight="arrow-right" fullWidth>Entrar</Button>
            <Button variant="ghost" size="sm">Criar conta</Button>
          </form>
          <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Protótipo de demonstração — nenhum dado é enviado.</p>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { Welcome });
})();
