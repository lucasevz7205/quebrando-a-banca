Per-topic accuracy heat map for the edital. Pair with HeatmapLegend; clicking a cell should open + highlight the topic in EditalTree.

```jsx
<HeatmapGrid subjects={edital.subjects} selectedTopicId={sel} onSelect={(s, t) => { setSel(t); setTab('lista'); }} />
<HeatmapLegend />
```

- Bands: 1 solid ember (<60) · 2 ember outline (60–74) · 3 gold outline (75–84) · 4 patina outline (85–89) · 5 solid patina (≥90) · dashed = sem respostas.
- `heatTier(correct, wrong)` is exported — reuse it so every screen classifies identically.
