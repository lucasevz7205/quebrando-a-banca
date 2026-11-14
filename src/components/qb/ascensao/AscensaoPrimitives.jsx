import React from "react";
import { Loader2, MessageSquare, Sparkles, Compass } from "lucide-react";

export function Panel({
  children,
  variant = "default",
  interactive = false,
  className = "",
  style,
  onClick,
  ...rest
}) {
  const variantClass =
    variant === "sunken"
      ? "qb-panel--sunken"
      : variant === "glass"
        ? "qb-panel--glass"
        : variant === "ornate"
          ? "qb-panel--ornate"
          : "";
  const interactiveClass = interactive ? "qb-panel--interactive" : "";

  return (
    <div
      className={`qb-panel ${variantClass} ${interactiveClass} ${className}`.trim()}
      style={style}
      onClick={onClick}
      role={interactive && onClick ? "button" : undefined}
      tabIndex={interactive && onClick ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  loading = false,
  icon: Icon,
  className = "",
  disabled,
  type = "button",
  ...rest
}) {
  const sizeClass = size === "sm" ? "qb-btn--sm" : size === "lg" ? "qb-btn--lg" : "";
  const fullClass = full ? "qb-btn--full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`qb-btn qb-btn--${variant} ${sizeClass} ${fullClass} ${className}`.trim()}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="qb-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  round = false,
  count,
  pressed,
  className = "",
  type = "button",
  ...rest
}) {
  const variantClass =
    variant === "outline"
      ? "qb-iconbtn--outline"
      : variant === "solid"
        ? "qb-iconbtn--solid"
        : "";
  const sizeClass = size === "sm" ? "qb-iconbtn--sm" : "";
  const roundClass = round ? "qb-iconbtn--round" : "";

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={`qb-iconbtn ${variantClass} ${sizeClass} ${roundClass} ${className}`.trim()}
      {...rest}
    >
      {Icon ? <Icon size={size === "sm" ? 16 : 18} aria-hidden="true" /> : null}
      {typeof count === "number" && count > 0 ? (
        <span className="qb-iconbtn__count">{count > 99 ? "99+" : count}</span>
      ) : null}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon: Icon,
  className = "",
  ...rest
}) {
  return (
    <span className={`qb-badge qb-badge--${tone} ${className}`.trim()} {...rest}>
      {Icon ? <Icon size={13} aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  );
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  height = 8,
  color = "var(--state-progress)",
}) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  return (
    <div>
      {(label || showPercent) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
            gap: 8,
          }}
        >
          {label ? (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
          ) : (
            <span />
          )}
          {showPercent ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--qb-gold)",
              }}
            >
              {pct}%
            </span>
          ) : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progresso"}
        style={{
          height,
          borderRadius: "var(--radius-pill)",
          background: "var(--state-progress-track)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "var(--radius-pill)",
            background: color,
            transition: "width var(--dur-slow) var(--ease-standard)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Cabeçalho principal da marca.
 * Regra de identidade: exibe apenas "Quebrando a Banca" e o emblema Q + espada;
 * nunca acrescenta subtítulo "A Ascensão" no logotipo ou cabeçalho.
 */
export function BrandHeader({
  navItems = [],
  activeNav,
  onSelectNav,
  onOpenTutor,
  tutorUnread = 0,
  onSwitchClassic,
  readOnlyPreview = false,
  rightSlot,
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-header)",
        minHeight: "var(--header-h)",
        background: "rgba(10, 30, 52, 0.9)",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
        borderBottom: "var(--border-hairline)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/qb-ascensao-preview/assets/logo/mark-q-sword-transparent.png"
            alt="Emblema Quebrando a Banca"
            width={40}
            height={40}
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: "0.06em",
              color: "var(--qb-gold)",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            Quebrando a Banca
          </span>
          {readOnlyPreview ? <Badge tone="attention">Prévia somente leitura</Badge> : null}
        </div>

        {navItems.length > 0 ? (
          <nav
            aria-label="Navegação principal"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="qb-navlink"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onSelectNav?.(item.id)}
                >
                  {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                  <span>{item.label}</span>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: "rgba(208, 179, 134, 0.16)",
                        color: "var(--qb-gold-bright)",
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onOpenTutor ? (
            <Button
              variant="secondary"
              size="sm"
              icon={MessageSquare}
              onClick={onOpenTutor}
            >
              Tutor IA{tutorUnread > 0 ? ` (${tutorUnread})` : ""}
            </Button>
          ) : null}
          {onSwitchClassic ? (
            <Button
              variant="ghost"
              size="sm"
              icon={Compass}
              onClick={onSwitchClassic}
              title="Alternar para o painel clássico completo"
            >
              Modo clássico
            </Button>
          ) : null}
          {rightSlot}
        </div>
      </div>
    </header>
  );
}

export function HeroAscension({
  eyebrow = "Jornada de Estudo",
  title,
  subtitle,
  progress = 0,
  dayMode = false,
  primaryAction,
  secondaryAction,
  metrics = [],
}) {
  const sceneClass = dayMode ? "qb-scene-day" : "qb-scene-night";

  return (
    <section
      className="qb-panel qb-panel--ornate"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 250,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <div
        aria-hidden="true"
        className={`qb-img ${sceneClass}`}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.45,
          backgroundPosition: "center right",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-scene-protect)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "28px 28px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(240px, 1fr)",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={14} style={{ color: "var(--qb-gold-bright)" }} aria-hidden="true" />
            <span className="qb-overline" style={{ color: "var(--qb-gold)" }}>
              {eyebrow}
            </span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(24px, 3vw, 34px)",
              lineHeight: 1.2,
              color: "var(--qb-ivory)",
              letterSpacing: "0.02em",
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              style={{
                margin: "0 0 18px",
                color: "var(--text-secondary)",
                maxWidth: "60ch",
                fontSize: 15,
              }}
            >
              {subtitle}
            </p>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {primaryAction}
            {secondaryAction}
          </div>
        </div>

        <Panel
          variant="glass"
          style={{
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <ProgressBar
            value={progress}
            max={100}
            label="Domínio geral do edital"
          />
          {metrics.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {metrics.map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(16, 28, 45, 0.72)",
                    border: "var(--border-hairline)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 18,
                      fontWeight: 600,
                      color: m.accent || "var(--qb-ivory)",
                    }}
                  >
                    {m.value}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}

export function RadialNavigation({ items = [], activeId, onSelect }) {
  const positions = [
    { top: "14%", left: "50%" },
    { top: "38%", left: "86%" },
    { top: "82%", left: "73%" },
    { top: "82%", left: "27%" },
    { top: "38%", left: "14%" },
  ];

  return (
    <div>
      {/* Desktop orbital view */}
      <div
        className="qb-radial-desktop"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          height: 360,
          margin: "0 auto",
        }}
      >
        <div
          aria-hidden="true"
          className="qb-img qb-artifact-disc"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 156,
            height: 156,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px solid rgba(208, 179, 134, 0.55)",
            boxShadow: "var(--glow-gold)",
            opacity: 0.9,
          }}
        />
        {items.slice(0, 5).map((item, idx) => {
          const pos = positions[idx] || positions[0];
          const Icon = item.icon;
          const isCurrent = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="qb-radial__node"
              style={{ top: pos.top, left: pos.left }}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => onSelect?.(item.id)}
            >
              <span className="qb-radial__orb">
                {Icon ? <Icon size={24} aria-hidden="true" /> : null}
              </span>
              <span className="qb-radial__label">{item.label}</span>
              {item.meta ? <span className="qb-radial__meta">{item.meta}</span> : null}
            </button>
          );
        })}
      </div>

      {/* Compact list fallback on smaller screens */}
      <div
        className="qb-radial-mobile"
        style={{
          display: "none",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className="qb-radial__row"
              onClick={() => onSelect?.(item.id)}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--surface-sunken)",
                  border: "var(--border-hairline)",
                  color: "var(--qb-gold)",
                  flexShrink: 0,
                }}
              >
                {Icon ? <Icon size={18} aria-hidden="true" /> : null}
              </span>
              <span style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: 15 }}>{item.label}</strong>
                {item.meta ? (
                  <small style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.meta}</small>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .qb-radial-desktop { display: none !important; }
          .qb-radial-mobile { display: flex !important; }
        }
        @media (max-width: 820px) {
          .qb-ascensao-shell section > div[style*="grid-template-columns"] {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

const EMBLEM_SRC = {
  soldado: "/qb-ascensao-preview/assets/emblems/emblem-soldado.png",
  sabio: "/qb-ascensao-preview/assets/emblems/emblem-sabio.png",
  estrategista: "/qb-ascensao-preview/assets/emblems/emblem-estrategista.png",
  ascensao: "/qb-ascensao-preview/assets/emblems/emblem-ascensao.png",
};

export function AchievementEmblem({
  id = "soldado",
  title,
  subtitle,
  unlocked = true,
  size = 64,
}) {
  const src = EMBLEM_SRC[id] || EMBLEM_SRC.soldado;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: unlocked ? 1 : 0.45,
      }}
    >
      <img
        src={src}
        alt={title || id}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-emblem)",
          objectFit: "cover",
          border: unlocked ? "1px solid rgba(242, 199, 110, 0.55)" : "var(--border-hairline)",
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--qb-ivory)" }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}
