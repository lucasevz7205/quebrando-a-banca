Correction side-sheet (or inline card): gabarito, fundamento with legal basis, trap mechanism, and "Abrir nó exato" remission to the mind map.

```jsx
<div style={{ position: 'relative' }}>
  …question…
  <FeedbackDrawer open={open} onClose={close} result="incorrect" answerKey="C"
    explanation="A matéria constante de PEC rejeitada ou havida por prejudicada não pode ser objeto de nova proposta na mesma sessão legislativa."
    legalBasis="CF/88, art. 60, § 5º"
    trap={{ name: 'Troca de prazo', description: 'O item é correto; a pegadinha comum é confundir com projetos de lei, que admitem reapresentação por maioria absoluta.' }}
    concept={{ path: ['Direito Constitucional', 'Processo legislativo', 'Emendas', 'Limites formais'] }}
    onOpenConcept={openNode} />
</div>
```

- Trap section collapsed when correct, open when incorrect (progressive disclosure).
- `mode="inline"` for mobile or review lists.
