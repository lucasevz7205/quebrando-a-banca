Contextual tutor chat — context chip (current question/node), messages with remission chips, quick suggestions, and an honest "Demonstração" state.

```jsx
<TutorPanel contextLabel="Q 0412 · Limites formais" thinking={busy}
  messages={[
    { role: 'user', text: 'Por que o item está certo?' },
    { role: 'tutor', text: 'Porque o § 5º do art. 60 veda nova proposta na mesma sessão legislativa…', refs: [{ id: 'lf', label: 'Limites formais', kind: 'concept' }] },
  ]}
  suggestions={['Explique com um exemplo', 'Qual a pegadinha?', 'Gerar 3 flashcards']}
  onSend={ask} onRef={openNode} />
```

- Never claim memory, adaptation or a live model while `demo` is true.
- Tutor avatar uses the reduced Q-sword mark, not a robot icon.
