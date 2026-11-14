CEBRASPE Certo/Errado question card — statement at 18px reading size, C/E choices, confidence step, then result + remission to the concept node.

```jsx
<QuestionCard code="Q 0412" year={2023} exam="Câmara dos Deputados · Analista Legislativo"
  tags={['Direito Constitucional', 'Processo legislativo']}
  statement="A proposta de emenda à Constituição rejeitada não pode ser reapresentada na mesma sessão legislativa."
  answer={answer} onAnswer={setAnswer} confidence={conf} onConfidence={setConf}
  answerKey={revealed ? 'C' : null}
  conceptLink={{ label: 'Ver no mapa: Limites formais', onClick: openNode }} />
```

- Result is announced with icon + text ("Sua resposta · incorreta", "Gabarito"), never color alone.
- Pair with `AnswerActionBar` (confirm/skip) and `FeedbackDrawer` (fundamento).
- No imagery inside — reading area stays plain.
