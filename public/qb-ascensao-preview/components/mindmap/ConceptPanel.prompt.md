Concept detail panel next to the mind map — breadcrumb, mastery badge, summary, example, connections, active-review CTA and sources; `returnTo` adds the "Voltar à questão" bar.

```jsx
<ConceptPanel title="Limites formais" path={['Processo legislativo', 'Emendas']}
  mastery={{ state: 'incorrect', text: '2 erros nas últimas 5 questões' }}
  summary="Regras sobre iniciativa, quórum, turnos e reapresentação de PEC."
  example="PEC rejeitada em março não pode ser reapresentada até fevereiro seguinte."
  connections={[{ id: 'lm', label: 'Limites materiais', relation: 'difere de' }]}
  sources={['CF/88, art. 60, § 2º e § 5º']}
  reviewCount={3} onReview={startCards}
  returnTo="questão Q 0412" onReturn={backToQuestion} />
```

- Mastery copy states evidence ("2 erros nas últimas 5"), not judgement.
