Pill label for metadata and learning states; state tones always carry an icon + text (never color alone).

```jsx
<Badge tone="gold">CEBRASPE · 2024</Badge>
<Badge tone="correct">Acertou</Badge>
<Badge tone="incorrect">Errou</Badge>
<Badge tone="no-evidence">Sem evidência</Badge>
<Badge tone="attention">Pegadinha comum</Badge>
<Badge tone="neutral" icon="clock">12 min</Badge>
```

- `incorrect` uses the ember token, NOT the decorative ribbon red.
- `crimson` is for brand emphasis (e.g. "Novo"), not for errors.
