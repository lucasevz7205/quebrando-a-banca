Tabs for sub-views of a module (Planejamento: Hoje/Semana/Ciclos · Desempenho: Diária/Histórica/Método · Edital: Lista/Mapa de calor/Radial).

```jsx
<Tabs label="Visualização do planejamento" value={tab} onChange={setTab}
  items={[{ id: 'hoje', label: 'Hoje', icon: 'calendar' }, { id: 'semana', label: 'Semana', icon: 'calendar-days' }, { id: 'ciclos', label: 'Ciclos', icon: 'repeat' }]} />
<Tabs variant="underline" … />
```

- ←/→ move selection. Scrolls horizontally on small screens.
