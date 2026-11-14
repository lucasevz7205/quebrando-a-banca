Flip flashcard with concept origin and Errei/Difícil/Bom/Fácil self-rating showing the next interval.

```jsx
<Flashcard deck="Direito Constitucional"
  front="PEC rejeitada pode ser reapresentada na mesma sessão legislativa?"
  back={<><strong>Não.</strong> A matéria só pode ser objeto de nova proposta na sessão legislativa seguinte (CF, art. 60, § 5º).</>}
  origin="Emendas › Limites formais" onOpenOrigin={openNode}
  onRate={r => next(r)} />
```

- Flip is a 360ms Y-rotation; instant under `prefers-reduced-motion`.
- Keep `demo` on until a real SRS is wired — never imply real scheduling.
