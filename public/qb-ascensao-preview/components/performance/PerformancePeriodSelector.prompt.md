Date control for Desempenho. Pair it with `SelectField` for matéria and assunto inside a `Panel`. Keep one state object per analysis tab so filters stay independent.

```jsx
<PerformancePeriodSelector mode="day" value={{ date: '2026-11-14' }} min="2026-11-01" max="2026-11-14" today="2026-11-14" onChange={v => setDate(v.date)} />
<PerformancePeriodSelector mode="range" value={{ from: '2026-11-08', to: '2026-11-14' }} min="2026-11-01" max="2026-11-14"
  presets={[{ id: '7', label: '7 dias', from: '2026-11-08', to: '2026-11-14' }]} onChange={setRange} />
```
