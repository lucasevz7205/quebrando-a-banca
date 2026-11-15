Main selector of the Treinar screen: matéria → assunto → ação, radial with a linear alternative.

```jsx
<TrainingRadial subjects={edital.subjects} value={sel} onChange={setSel} pending={pendingByTopic}
  linkInfo={(subjectId, topicId, action) => nav.describe({ subjectId, topicId, action })}
  onAction={intent => nav.dispatch(intent)} />
```

- `onAction` receives `{ subjectId, topicId, action, nodeId? }`; buttons also carry `data-action / data-subject-id / data-topic-id / data-node-id`.
- Keep `value` in app state so returning from a session restores the same level.
- Accuracy ring/percent only with valid answers; otherwise "Sem respostas". Do not use achievement emblems as performance indicators.
- An action without a link stays clickable and must lead to an explicit "sem vínculo" state — never to another topic.
