Schedule autonomy controls. The screen computes the preview; this component renders actions, preview list, apply/cancel and undo.

```jsx
<RescheduleActions dayLabel="sáb 14/11" quantity={q} onQuantity={setQ} counts={{ late: 4, day: 9, week: 31 }}
  preview={preview} onPreview={a => setPreview(compute(a))} onConfirm={apply} onCancel={() => setPreview(null)}
  lastApplied={undoMsg} onUndo={undo} onEdit={openEditor} />
```
