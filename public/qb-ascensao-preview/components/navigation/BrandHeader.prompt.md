Top app bar matching the brand-sheet "dashboard superior": sword+ribbon art, title lockup, nav, search/bell/stats/profile. `compact` = 56px bar for study sessions.

```jsx
<BrandHeader
  items={[{id:'inicio',label:'Início',icon:'house'},{id:'mapa',label:'Mapas',icon:'network'},{id:'questoes',label:'Questões',icon:'list-checks'}]}
  activeId="inicio" notifications={1} user={{name:'Lucas', initials:'LM'}} onNavigate={setView} />

<BrandHeader variant="compact" onExit={leave}>
  <StudySessionHeader … embedded />
</BrandHeader>
```

- Responsive by container width: ≥1100 full; 900–1100 icon-only nav; 760–900 drops the sword art; <760 nav collapses to a menu button.
- Use `floating={false}` for a flush full-width bar.
