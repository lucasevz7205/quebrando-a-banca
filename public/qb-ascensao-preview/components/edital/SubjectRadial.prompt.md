Radial entry to the edital: choose a subject, then an assunto; opens the topic highlighted in EditalTree.

```jsx
<SubjectRadial subjects={edital.subjects} summary={totals} onSelectTopic={(s, t) => openInList(s, t)} onOpenList={() => setTab('lista')} />
```

- Never label accuracy as "cobertura": the core shows both, with their criteria.
- Paginates at 6 nodes; below `size` width it renders as a list (keyboard / mobile).
