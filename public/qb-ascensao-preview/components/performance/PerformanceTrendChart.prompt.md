"Evolução da precisão" chart (gold line, discreet markers, tooltip with data, acertos, erros, total válido, percentual). Pass every bucket of the period, with zeros for days without answers — the chart leaves them without a point. Pass `previous` only when the earlier period has records.

```jsx
<PerformanceTrendChart subtitle="08/11 a 14/11 · todas as matérias" granularity="day" onGranularity={setG}
  granularities={[{ id: 'day', label: 'Diário' }, { id: 'week', label: 'Semanal' }, { id: 'month', label: 'Mensal' }]}
  data={[{ key: '2026-11-13', label: '13/11', correct: 135, wrong: 24 }, { key: '2026-11-14', label: '14/11', correct: 205, wrong: 42, blank: 1 }]}
  previous={null} previousNote="Sem registros no período anterior." />
```
