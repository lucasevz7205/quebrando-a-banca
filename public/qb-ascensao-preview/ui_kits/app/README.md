# UI kit — Quebrando a Banca (plataforma de estudos)

Click-through of the full platform, composed only from design-system components (`window.QuebrandoABancaDesignSystem_3e4054`). All data is demonstrative (`data.js`, `data-edital.js`) and every screen computes metrics through `metrics.js`.

## Screens (`?view=` to deep-link)
- `dashboard` — Menu principal: sunset banner, separate indicators (acertos, cobertura, volume, tarefas), radial shortcuts incl. O Arquiteto, Hoje list, milestones.
- `plan` — Planejamento: Hoje / Semana / Ciclos; panorama; reschedule with preview/undo; week navigation (3 demo weeks); hours + cycle sequence.
- `edital` — Lista (tree, filters, Evocar antes de ler, contextual actions) / Mapa de calor / Radial.
- `train` — Treinar: TrainingRadial (matéria → assunto → 4 ações) as the main selector, plus suggested round, pending items, weakest topics. Every action goes through `QB_NAV.resolve` (`links.js`); no link → `nolink` state with safe return.
- `study` — Estudo: Mapas mentais (StudyTopicPicker + MindMapCanvas + ConceptPanel; node → related questions) / Flashcards decks → `flashcards` session.
- `simulado` — Preparação / Histórico; objective exam, discursive, result.
- `performance` — Análise diária / histórica / Método (v4: filtros, indicadores, evolução, prioridades, explorer por matéria, questões do período — ver `docs/DESEMPENHO-V4.md`).
- `questions`, `flashcards` — focused sessions (v1), with O Arquiteto launcher keeping context.
- `welcome` — boas-vindas (avatar → sair).
- **O Arquiteto** — global: chip in the toolbar, floating launcher, topic actions in the edital, task panel, Treinar.

## Files
`index.html` · `data.js` · `data-edital.js` · `metrics.js` · `links.js` (identifiers + navigation service) · `Shell.jsx` (toolbar + nav + background + Arquiteto layer) · `Welcome.jsx` · `Dashboard.jsx` · `PlanScreen.jsx` · `EditalScreen.jsx` · `TrainStudy.jsx` · `MindMapScreen.jsx` · `SimuladoScreen.jsx` · `PerformanceScreen.jsx` · `QuestionSession.jsx` · `FlashcardSession.jsx` · `App.jsx`.

See `docs/ATUALIZACAO-V3.md`, `docs/CONTRATOS-NAVEGACAO.md` and `docs/ATUALIZACAO-V2.md` for the reference → implementation matrix and what is functional / simulated / pending integration.
