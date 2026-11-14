Linear progress bar with a text label and numeric value — use for session progress, edital coverage, topic mastery.

```jsx
<ProgressBar value={0.2} label="Questão" valueText="4 de 20" />
<ProgressBar value={0.68} label="Direito Constitucional" tone="correct" />
<ProgressBar value={0.4} size="sm" showValue={false} label="Progresso" />
```

- Always keeps the numeric `valueText` visible unless the same number appears elsewhere.
