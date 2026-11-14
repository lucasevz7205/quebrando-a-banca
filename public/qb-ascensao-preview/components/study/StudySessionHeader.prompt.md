Study session bar — subject, topic, progress "N de M", timer, pause and focus-mode toggle. Plain navy, no imagery.

```jsx
<StudySessionHeader subject="Direito Constitucional" topic="Processo legislativo — emendas"
  current={4} total={20} elapsed={754} focusMode={focus}
  onToggleFocus={() => setFocus(f => !f)} onTogglePause={pause} onBack={exit} />
```

- `unit="Cartão"` for flashcard sessions.
- Wraps onto two lines on mobile; timer stays visible.
