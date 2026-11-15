# Quebrando a Banca — A Ascensão · Design System

**Quebrando a Banca: A Ascensão** is a strategic learning platform for Brazilian *concursos públicos* (current focus: Câmara dos Deputados — Analista Legislativo, banca **CEBRASPE**). It combines an AI tutor, interactive mind maps, CEBRASPE Certo/Errado questions, flashcards and adaptive (spaced) review.

The identity is **epic, classical and cinematic** — an ascent to a citadel on a mountain top — built on four virtues: **Conhecimento · Estratégia · Disciplina · Conquista**. The product rule that overrides everything: *the journey is cinematic, the study is quiet.* Scenes and emblems set the mood on navigation, milestones and rewards; reading areas stay simple, accessible (WCAG AA) and low on cognitive load.

## Sources
All material was supplied by the project owner in `uploads/` (kept in the project):
- `uploads/CLAUDE_DESIGN_SYSTEM.md` — owner's identity & interface guide V1 (palette, symbols, type, layout, component list, pedagogical principles). States the six core hex values were verified in the existing **Base44** app CSS (Base44 app itself was not provided — no codebase or Figma access).
- Brand sheet (`assets/reference/brand-sheet.jpg`) — wordmark with laurels, vertical emblem, four symbol variants, app icon, reduced symbols, and an example dashboard header.
- Q-sword logo (`assets/logo/logo-q-sword-full.jpg`).
- Day & night citadel scenes (`assets/scenes/ascension-day.jpg`, `ascension-night.jpg`).
- Bronze astrolabe-like disc (`assets/artifacts/bronze-disc.jpg`).

Logos, marks, emblems, the sunset strip and the header art were **cropped programmatically from the brand sheet** (marks also had their dark background keyed out → `*-transparent.png`). Nothing was redrawn.

## Products
One product surface: the **study web app** (dashboard, questions, mind map, flashcards, tutor). See `ui_kits/app/`.

---

## CONTENT FUNDAMENTALS
- **Language:** Brazilian Portuguese. Legal/edital vocabulary used precisely (PEC, sessão legislativa, gabarito, quórum, CF/88, art. 60, § 5º).
- **Voice:** a calm mentor/strategist. Second person, addressing the student as **você** ("Você errou", "Sua confiança"). The system never says "eu" except the tutor in conversation ("Estou com a Q 0412 como contexto").
- **Two registers:**
  - *Ceremonial* (titles, milestones, welcome): short, elevated, Cinzel caps — "A Ascensão continua", "MARCOS DA ASCENSÃO", "O SÁBIO — Conhecimento e reflexão".
  - *Instrumental* (study): plain, factual, short sentences — "Julgue o item.", "Confirmar resposta", "2 erros nas últimas 5 questões".
- **Casing:** sentence case for UI and headings ("Plano de hoje", "Mecanismo da pegadinha"). ALL CAPS only for Cinzel brand/milestone text and tracked 12px overlines. Title Case is not used.
- **Buttons:** infinitive verbs — Confirmar, Revisar, Pular, Abrir nó exato, Mostrar resposta, Voltar à questão.
- **Honesty rules (from the owner's guide):** state observable facts, never diagnoses ("52 minutos sem pausa", not "você está cansado"); never claim real AI, memory, adaptation or scheduling that doesn't exist — label it **"Demonstração"** / "Intervalos ilustrativos"; emblems always state their rule ("7 dias seguidos com sessão").
- **Numbers:** mono for codes and timers (`Q 0412`, `12:34`, `4 de 20`, `CF/88, art. 60, § 5º`). Use non-breaking space after §.
- **Emoji:** never. Unicode used only for typographic punctuation: middle dot separators ( · ), em dash, curly quotes “ ”, › in breadcrumbs.
- **Motto** (exact): *Conhecimento · Estratégia · Disciplina · Conquista.*

## VISUAL FOUNDATIONS
- **Colour:** dark-first. Canvas `#0A1E34` navy deep; cards `#173653` navy raised; bronze `#A58A67` for hairlines/ornament; gold `#D0B386` for selection, links, accents; ivory `#F1E8D5` text; crimson `#A92E3A` alert/brand red (fill only — 2.5:1 as text fails). Cinematic extension (obsidian, midnight, steel blue, moonlight, gold bright `#F2C76E`, gold shadow, ribbon red `#B91522`, stone, parchment) is *estimated from the art* — use for illustration-adjacent moments, focus ring (gold bright) and notification dot (ribbon red).
- **Learning states** are their own tokens and always carry icon + text: correct = patina `#7CC4A4` (oxidised bronze), incorrect = ember `#EE8A7C` (deliberately not the brand red), no evidence = ash `#ABA298`, progress/attention = gold bright. They fail on `--surface-hover`; keep state text on canvas/surface.
- **Type:** Cinzel (brand, ceremonial caps, tracking .02em; subtitle "A ASCENSÃO" tracked .32em) · Cormorant Garamond italic (motto, subtitles, emblem virtues) · Georgia (content H1/H2) · Inter (all reading and UI; reading 18/1.65, body 16/1.6, labels 14, captions 13) · JetBrains Mono (data). Never letter-space long text.
- **Spacing:** 4px base — 4, 8, 12, 16, 24, 32, 48, 64, 96. Content max 1240px; reading measure 68ch. Touch targets ≥ 44px.
- **Radii:** controls 12px (sm 10, lg 14), cards 18px, flashcards 20px, emblem plaques ~18–22%, chips/badges pill. Nothing square-cornered except full-bleed scenes.
- **Cards:** navy-raised fill, 1px bronze hairline at 38% alpha, 18px radius, deep navy shadow (`0 10px 30px -12px rgba(8,10,15,.7)` + 4% ivory inner top line). *Ornate* variant (milestones only): 60% gold border + soft top light gradient. No coloured left-border accents.
- **Backgrounds:** solid navy for all study areas. Imagery = painted, cinematic, warm-gold vs cool-moonlight scenes (citadel, ruins, sword with red ribbon). Used full-bleed only on welcome; as a contained banner on the dashboard; never inside sessions. Faint 28px bronze dot-grid + radial navy glow on the mind-map canvas. No textures, no grain, no decorative gradients on surfaces.
- **Protection:** text over scenes always sits on the left with a horizontal navy gradient (97% → 5%) plus a bottom fade; never capsules over imagery.
- **Transparency & blur:** only `--surface-glass` (72% navy + 14px blur) over imagery and the sticky action bar (92% navy + 8px blur). Overlays behind drawers: obsidian 55%.
- **Borders & ornament:** bronze hairlines; gold rules that fade at both ends (`--gradient-gold-rule`) flanking subtitles, like the brand sheet; vertical fading dividers in headers. Concentric bronze rings around the radial dashboard.
- **Shadows/glow:** shadows are navy/obsidian, never grey. Selected/active = `--glow-gold` (gold 1px + 24px soft halo). Earned emblems get a warm halo.
- **Motion:** calm and ceremonial — `cubic-bezier(.2,0,0,1)` standard, `.16,1,.3,1` for entries; 120/200/360/900ms. Fades and short rises (8px), flashcard Y-flip 360ms, progress seal fills over 900ms. No bounces, no parallax. `prefers-reduced-motion` → instant.
- **Hover:** surfaces lighten to `#1E4166`, borders go bronze → gold, icons ivory → gold bright; primary gold button lightens (`#DCC39A`). **Press:** darker fill (`#BFA073`) + 1px translateY. **Focus:** 2px navy gap + 2px gold-bright ring.
- **Layout:** framed floating header (18px radius, gold hairline) on app screens; flush 56px compact header in sessions; sticky bottom action bar in questions; right-side drawer (460px) for corrections; 2-column map + 380px concept panel.
- **Imagery colour vibe:** warm (sunset gold, torchlight) against cool (moonlit navy); saturated ribbon red as the single hot accent.

## ICONOGRAPHY
- **UI glyphs:** [Lucide](https://lucide.dev) outline icons (ISC), copied programmatically from `lucide-static@0.460.0` into `assets/icons/*.svg` and embedded in `components/core/Icon.jsx`. Stroke 1.75 at 20–24px — matches the thin outline search/bell/bars/user icons in the brand-sheet header. Colour = `currentColor` (ivory default, gold for active/accents). *The original app's icon set was not provided; Lucide is the closest match — flagged.*
- **Brand symbols are images, not icons:** O Soldado (helmet), O Sábio (owl + book), O Estrategista (board), A Ascensão (citadel + red road) in `assets/emblems/`; reduced marks (mountain, sword, mountain + ribbon, Q-sword) in `assets/logo/`. Use them as milestones and avatars — never as generic UI icons, never recoloured, never emoji substitutes.
- **Bronze disc** (`assets/artifacts/bronze-disc.jpg`): seals, milestone backdrops, transitions — always labelled, never a bare control.
- No icon font, no emoji, no unicode pictograms. State meaning pairs icon + text (circle-check / circle-x / circle-dashed / loader-circle).

---

## Components (`window.QuebrandoABancaDesignSystem_3e4054`)
**v1 (owner's guide §5):** BrandHeader · HeroAscension · RadialNavigation · StudySessionHeader · QuestionCard · AnswerActionBar · FeedbackDrawer · MindMapCanvas · ConceptPanel · Flashcard · CognitiveAlertBanner · AchievementEmblem. *DesignSystemGallery* = this project's Design System tab.

**v2 (module coverage from the reference screenshots — see `docs/ATUALIZACAO-V2.md`):**
- `navigation/` — **MainNav** (Menu principal, Planejamento + Hoje, Edital, Treinar, Estudo, Simulado, Desempenho; amplo/compacto/recolhido) · **GlobalToolbar** (O Arquiteto, estado de sincronização, Modo foco, Preferências › Fundo e Tema, Ferramentas, recolher) · **Tabs** · **PageHeader**
- `data/` — **StatCard** · **SelectField** · **SearchField** · **LineChart** · **BarChart** · **EmptyState**
- `edital/` — **EditalTree** (+ TopicRow, StatusTag, subjectStats) · **HeatmapGrid** (+ HeatmapCell, heatTier) · **HeatmapLegend** · **SubjectRadial**
- `planning/` — **WeekCalendar** · **TaskCard** · **RescheduleActions** (preview → aplicar/cancelar → desfazer) · **CycleConfigurator**
- `simulado/` — **CompositionTable** · **QuestionNavigator** · **ExamTimer**
- `architect/` — **ArchitectStudio** (O Arquiteto) · **ArchitectLauncher** · **SocraticChat** · **FeynmanLab** · **CornellNotebook** · **ScannerFlashcards** · **PomodoroAudio**
- `feedback/` — **ConfirmDialog** · **ToastStack**

**v3 (Treinar radial, barra superior, seletor de assuntos — see `docs/ATUALIZACAO-V3.md` and `docs/CONTRATOS-NAVEGACAO.md`):**
- `navigation/` — **TrainingRadial** (matéria → assunto → Treinar / Mapa Mental / Revisão Ativa / O Arquiteto; emits `{ subjectId, topicId, action, nodeId }`; lista alternativa) · **GlobalToolbar** simplified (no "Topo")
- `study/` — **StudyTopicPicker** (hierarchical searchable combobox; replaces long selects)

**v4 (Desempenho — see `docs/DESEMPENHO-V4.md`):**
- `performance/` — **PerformanceMetricCard** (indicator with formula, breakdown, comparison, empty/pending states) · **PerformancePeriodSelector** (day or range) · **PerformanceTrendChart** (accuracy over time, gaps for days without records, previous-period overlay, keyboard + data table) · **PerformancePriorityPanel** (evidence-based priorities) · **SubjectPerformanceExplorer** (Matéria → Assunto → Tópico with contextual actions)

### Intentional additions
- **Icon**, **Button**, **IconButton**, **Badge**, **Panel**, **ProgressBar** (`core/`) — primitives the module components are built from.
- **BrandLogo** — single API for the supplied lockups/marks. Main brand = "Quebrando a Banca" only; "A Ascensão" is reserved for the future student-evolution journey (`subtitle` prop, `vertical` art).
- **TutorPanel** (`tutor/`) — compact conversation embed, now titled "O Arquiteto". The module itself is ArchitectStudio.

### Accessibility & responsiveness rules (all modules)
- State is never colour-only: heat bands have a legend + % + aria-label; study status uses icon + text; sync, late tasks, bank shortage, timers use icon + text.
- Accuracy band (heat) and study status are separate dimensions with separate tokens (`--heat-*` vs `--status-*`).
- Keyboard: Tabs (←/→), radial nodes and heat cells are buttons, dialogs close on Esc, focus ring = gold bright.
- Narrow screens: MainNav scrolls horizontally and hides labels < 760px; Radial navigators switch to lists; WeekCalendar scrolls horizontally; grids use auto-fit.
- Honesty: "Dados demonstrativos", "Simulação", "Definição pendente", "Título não disponível nos arquivos".

## UI kits
- `ui_kits/app/` — full study platform click-through (Menu principal, Planejamento Hoje/Semana/Ciclos, Edital Lista/Mapa de calor/Radial, Treinar, Estudo, Simulado, Desempenho, O Arquiteto, sessão de questões, sessão de flashcards, boas-vindas). See its README.

## Index
- `styles.css` — entry; imports `tokens/*.css` + `components/components.css`.
- `tokens/` — `fonts.css` (@font-face, self-hosted woff2), `colors.css`, `typography.css`, `spacing.css`, `effects.css` (shadows, gradients, motion), `data-viz.css` (heat bands, study status, chart series), `assets.css` (image classes: `.qb-img .qb-scene-night`, `.qb-emblem-sabio`, `.qb-mark-q-sword`…), `base.css`.
- `fonts/` — Cinzel, Cormorant Garamond, Inter, JetBrains Mono (Google Fonts, latin subset).
- `components/` — `core/`, `brand/`, `navigation/`, `data/`, `edital/`, `planning/`, `simulado/`, `architect/`, `feedback/`, `study/`, `questions/`, `mindmap/`, `flashcards/`, `tutor/` (each: `.jsx`, `.d.ts`, `.prompt.md`, one `*.card.html`); `components.css` + `modules.css` for hover/focus/active states.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `assets/` — `logo/`, `emblems/`, `scenes/`, `artifacts/`, `icons/` (Lucide SVGs), `reference/` (original brand sheet + header example).
- `ui_kits/app/` — product recreation.
- `docs/ATUALIZACAO-V2.md` — v2 change list, reference → implementation matrix, functional/simulated/integration status.
- `docs/ATUALIZACAO-V3.md` — v3 report (what changed, what works in the demo, what needs real integration) · `docs/CONTRATOS-NAVEGACAO.md` — events, identifiers and cross-reference contracts.
- `thumbnail.html`, `SKILL.md`.

## Caveats
- **Fonts are substitutes:** Cinzel / Cormorant Garamond approximate the reference lettering (not confirmed originals). Georgia is a system font.
- Cinematic hex values are estimates from raster art, not vector swatches. Marks are raster crops (~2× of a 1600px sheet) — fine to ~64px; request vector/hi-res originals for larger use.
- No Base44 codebase or production screenshots were available; UI-kit screens are composed from the guide, not traced.
