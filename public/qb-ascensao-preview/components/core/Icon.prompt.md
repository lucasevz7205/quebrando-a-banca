Lucide outline icon (stroke 1.75, currentColor) — the single icon set for all UI glyphs.

```jsx
<Icon name="search" />
<Icon name="circle-check" size={16} color="var(--state-correct)" />
<Icon name="network" size={24} label="Mapa mental" />
```

- Decorative by default (`aria-hidden`); pass `label` when the icon stands alone.
- Brand symbols (helmet, owl, board, citadel) are images via `AchievementEmblem`, never icons.
- Names available: see `ICON_NAMES` / `Icon.d.ts`.
