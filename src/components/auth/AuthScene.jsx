// Cena das telas de entrada (12/11/2026): vídeo em loop atrás de um véu escuro e
// de um cartão de vidro. Só no login, cadastro e MFA — nunca durante o estudo.
// prefers-reduced-motion pausa o vídeo no primeiro quadro.
const VIDEO = "/claude-export/login-720.mp4"; // 720p, ~0,4 MB (original 13 MB)

function syncReducedMotion(v) {
  if (!v || typeof window === "undefined" || !window.matchMedia) return;
  const q = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    if (q.matches) v.pause();
    else {
      const p = v.play();
      if (p) p.catch(() => {});
    }
  };
  sync();
  if (q.addEventListener) q.addEventListener("change", sync);
  else if (q.addListener) q.addListener(sync);
}

export function AuthScene({ children }) {
  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060b16] px-4 py-8 text-foreground">
      <video
        ref={syncReducedMotion}
        className="pointer-events-none fixed inset-0 h-full w-full select-none object-cover"
        src={VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(140% 60% at 50% 40%, rgba(6,10,18,.38) 0%, rgba(6,10,18,.16) 50%, rgba(6,10,18,0) 100%), linear-gradient(180deg, rgba(6,10,18,.30) 0%, rgba(6,10,18,.06) 40%, rgba(6,10,18,.48) 100%)",
        }}
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

// O cartão de vidro das telas de entrada: borda clara, fundo translúcido e blur.
export function GlassCard({ className = "", children }) {
  return (
    <div
      className={
        "rounded-2xl border border-white/15 bg-[rgba(8,14,26,.60)] shadow-[0_18px_48px_-12px_rgba(2,6,14,.70),inset_0_1px_0_0_rgba(255,251,242,.16)] backdrop-blur-2xl " +
        className
      }
    >
      {children}
    </div>
  );
}
