Row of small chips for global, secondary controls — sits above MainNav, right-aligned.

```jsx
<GlobalToolbar sync={sync} onSync={retry} focusMode={focus} onFocusMode={setFocus}
  background={bg} onBackground={setBg} theme={theme} onTheme={setTheme}
  tools={[{ id: 'pomodoro', label: 'Pomodoro', icon: 'timer' }, { id: 'scanner', label: 'Scanner', icon: 'scan-line' }]}
  onTool={openTool} collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} onArchitect={openArchitect} />
```

- Sync is a status (icon + text), never a primary action; a retry chip appears only when offline.
- Fundo and Tema live inside Preferências (radio menu items). There is no "Topo" control — use Modo foco for a compact header.
- Only pass a handler when the behaviour exists; chips without handlers are not rendered. Menus: ↑/↓ move, Esc closes and restores focus.
- Theme "alto contraste" sets `data-qb-theme="contrast"` on a root (raises borders & muted text).
