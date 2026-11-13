import { AuthScene, GlassCard } from "./AuthScene";

// Full-screen scene shared by the auth pages: the looping video, a veil and a glass card.
// The children keep the shadcn tokens; the scene forces the dark theme locally.
export function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <AuthScene>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,251,242,.25)] backdrop-blur-xl">
          <Icon className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(2,6,14,.65)]">{title}</h1>
        {subtitle && <p className="mt-2 text-slate-300/90">{subtitle}</p>}
      </div>
      <GlassCard className="p-8 text-card-foreground">{children}</GlassCard>
      {footer && <p className="mt-6 text-center text-sm text-slate-300/80">{footer}</p>}
    </AuthScene>
  );
}
