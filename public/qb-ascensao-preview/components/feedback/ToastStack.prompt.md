Notifications for applied actions, sync and errors. Pair "Desfazer" with reschedules.

```jsx
<ToastStack toasts={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
// push: { id: Date.now(), tone: 'success', title: '3 tarefas movidas para hoje', action: { label: 'Desfazer', onClick: undo } }
```
