Hierarchical performance explorer (Matéria → Assunto → Tópico). Build `nodes` from the answers of the selected scope; list in `actions` only what the navigation service can really open.

```jsx
<SubjectPerformanceExplorer description="14/11/2026 · somente treino" onAction={intent => dispatch(intent, 'performance')}
  nodes={[{ id: 'dc', level: 'subject', name: 'Direito Constitucional e Regimento Interno', code: 'DC', icon: 'landmark', subjectId: 'dc', correct: 40, wrong: 9, blank: 1,
    children: [{ id: 'dc:2', level: 'group', code: '2', name: 'Regimento Interno da Câmara dos Deputados', subjectId: 'dc', correct: 21, wrong: 6,
      children: [{ id: 'dc-2a', level: 'topic', code: '2a', name: 'Processo legislativo', subjectId: 'dc', topicId: 'dc-2a', correct: 3, wrong: 2, actions: ['train', 'mindmap', 'review', 'architect'] }] }] }]} />
```
