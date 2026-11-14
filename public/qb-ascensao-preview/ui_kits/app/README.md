# UI kit — Quebrando a Banca: A Ascensão (study app)

Click-through recreation of the learning platform, composed only from the design-system components (`window.QuebrandoABancaDesignSystem_3e4054`).

**Source note:** the only existing product UI provided was the "Exemplo de dashboard superior" strip on the brand sheet (`assets/reference/dashboard-header-reference.png`) plus the component/behaviour spec in `uploads/CLAUDE_DESIGN_SYSTEM.md`. Screens are therefore composed from that spec — not traced from production screenshots. Replace with real screens when available.

## Flow
1. **Welcome** (`?view=welcome`, or click the profile avatar) — full night scene, vertical emblem, e-mail + Entrar.
2. **Dashboard** (default) — `BrandHeader`, sunset `HeroAscension`, `RadialNavigation` (list fallback < 500px), plan of the day, performance bars, milestone emblems.
3. **Questões** — compact header, `StudySessionHeader`, `QuestionCard` → confidence → `AnswerActionBar` confirm → `FeedbackDrawer`. Keys: **C / E** answer, **Enter** confirm/next. After an error a factual `CognitiveAlertBanner` appears. Focus-mode toggle hides chrome.
4. **Mapa** — `MindMapCanvas` + `ConceptPanel`. Opened from a question it shows "Voltar à questão Q 0412" and returns with state preserved.
5. **Flashcards** — `Flashcard` flip (Space) → rate → next; completion panel with Sábio emblem progress.
6. **Tutor** — context panel + `TutorPanel` with canned demo replies to the three suggestions.

## Files
- `index.html` — loads styles, bundle, `data.js`, then the screens.
- `data.js` — demo content (CF/88 arts. 60, 62, 66, 67), illustrative metrics.
- `AppShell.jsx` · `Welcome.jsx` · `Dashboard.jsx` · `QuestionSession.jsx` · `MindMapScreen.jsx` · `FlashcardSession.jsx` · `TutorScreen.jsx` · `App.jsx` (view state, timer, cross-screen remission).

All AI/SRS behaviour is simulated and labelled "Demonstração".
