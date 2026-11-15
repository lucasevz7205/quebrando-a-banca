Explicit confirmation for destructive or final actions.

```jsx
<ConfirmDialog open={ask} tone="danger" title="Limpar histórico deste assunto?" description="Remove as 6 mensagens de DA 10.6. Outros assuntos não são afetados."
  confirmLabel="Limpar histórico" onConfirm={clear} onCancel={() => setAsk(false)} />
```
