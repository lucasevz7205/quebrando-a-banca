Radial mind map of an edital topic — drag to pan, zoom controls, click to select/expand, gold path to the selected node; "Lista" toggle gives an accessible tree.

```jsx
<MindMapCanvas height={560} selectedId={sel} onSelect={setSel}
  nodes={[
    { id: 'pl', label: 'Processo legislativo' },
    { id: 'em', label: 'Emendas', parent: 'pl', mastery: 'incorrect' },
    { id: 'lf', label: 'Limites formais', parent: 'em', mastery: 'incorrect' },
    { id: 'lm', label: 'Limites materiais', parent: 'em', mastery: 'correct' },
    { id: 'lo', label: 'Leis ordinárias', parent: 'pl', mastery: 'no-evidence' },
  ]} />
```

- Pair with `ConceptPanel` on the right for the selected node.
- Clicking a selected node with children toggles its branch; collapsed branches show "+N".
- Mastery = icon + label (never color only). Legend is built-in.
