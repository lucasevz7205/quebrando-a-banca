Radial dashboard — 4–7 study shortcuts orbiting a central progress seal; auto-switches to a linear list on narrow containers.

```jsx
<RadialNavigation
  center={{ value: 0.42, overline: 'Edital', label: 'Analista Legislativo' }}
  items={[
    { id: 'questoes', label: 'Questões', icon: 'list-checks', meta: '20 hoje' },
    { id: 'mapa', label: 'Mapas mentais', icon: 'network', meta: '3 em foco' },
    { id: 'flash', label: 'Flashcards', icon: 'layers', meta: '38 pendentes' },
    { id: 'tutor', label: 'Tutor', icon: 'message-circle' },
    { id: 'revisao', label: 'Revisão', icon: 'history' },
  ]}
  onSelect={go} />
```

- Each node: icon orb + label + optional meta (text, not color).
- The bronze disc is a labelled seal backdrop only — never a control.
- `layout="list"` forces the accessible linear version (mobile, keyboard-heavy users).
