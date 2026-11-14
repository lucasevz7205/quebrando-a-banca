The base card surface — navy-raised fill, bronze hairline border, 18px radius, deep navy shadow.

```jsx
<Panel>…</Panel>
<Panel variant="sunken" padding={16}>…</Panel>
<Panel variant="glass">over a scene</Panel>
<Panel variant="ornate">milestone / achievement</Panel>
<Panel interactive onClick={open}>clickable card</Panel>
```

- `glass` only over imagery (blur + 72% navy) — keep text ≥ 4.5:1.
- `ornate` (gold border + soft top light) is reserved for milestones, not every card.
