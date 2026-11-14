Icon-only button (44×44) for header tools, map controls and drawer close — always pass `label`.

```jsx
<IconButton icon="search" label="Buscar" />
<IconButton icon="bell" label="Notificações" count={1} />
<IconButton icon="focus" label="Modo foco" pressed={focus} onClick={toggle} variant="outline" />
<IconButton icon="zoom-in" label="Aproximar" variant="solid" size="sm" />
```

- Variants: `ghost` (default), `outline` (bronze hairline), `solid` (raised navy).
- `count` renders the ribbon-red notification pill from the brand header reference.
- `pressed` makes it a toggle (gold-bright when on).
