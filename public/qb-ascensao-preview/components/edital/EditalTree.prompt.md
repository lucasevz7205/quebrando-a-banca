The full verticalised edital (bloco → matéria → assunto → tópico). Status and accuracy are shown side by side but separately.

```jsx
<EditalTree subjects={filtered} expanded={open} onToggle={toggle} highlightId={sel} evokeFirst={evoke}
  onAction={(a, t) => a === 'architect' ? openArchitect({ topic: t }) : go(a, t)} />
```

- Status: Não iniciado (circle-dashed) · Em estudo (book-open) · Revisando (repeat) · Dominado (circle-check).
- Coverage criterion: topic counts as covered when status ≠ Não iniciado. `subjectStats()` is exported.
- Placeholder titles render italic + muted ("Título não disponível nos arquivos").
