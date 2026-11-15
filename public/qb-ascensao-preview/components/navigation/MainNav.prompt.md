Primary module navigation — framed gold pill bar with all destinations; use once per app screen, under the GlobalToolbar.

```jsx
<MainNav activeId="plan" activeQuick="hoje" onNavigate={(id, quick) => go(id, quick)}
  leading={<BrandLogo variant="mark" size={30} />}
  items={[
    { id: 'home', label: 'Menu principal', icon: 'house' },
    { id: 'plan', label: 'Planejamento', icon: 'calendar-days', quick: { id: 'hoje', label: 'Hoje' } },
    { id: 'edital', label: 'Edital', icon: 'scroll-text' },
    { id: 'train', label: 'Treinar', icon: 'target', count: 50 },
    { id: 'study', label: 'Estudo', icon: 'book-open' },
    { id: 'simulado', label: 'Simulado', icon: 'graduation-cap' },
    { id: 'perf', label: 'Desempenho', icon: 'chart-column' },
  ]} />
```

- "Hoje" is a quick view of Planejamento, not a separate page.
- `compact` = Topo compacto; `collapsed` = Recolher (slim bar with section name + Menu).
- O Arquiteto is NOT a nav item — it is global (GlobalToolbar + ArchitectLauncher).
