Study priorities derived from recorded evidence only. Each item needs a verifiable `reason` and one action. Pluralise labels in the host ("1 tópico", "2 tópicos").

```jsx
<PerformancePriorityPanel basis="Base: 08/11 a 14/11 · todas as matérias" onAction={item => run(item.action)}
  items={[{ id: 'rec-da-10.1', kind: 'Erros recorrentes', tone: 'incorrect', title: 'DA 10.1 — Licitações públicas', reason: '9 erros em 3 dias do período · 14 de 23 válidas corretas', action: { label: 'Abrir assunto', icon: 'chevrons-down' } },
    { id: 'late', kind: 'Pendências vencidas', tone: 'attention', title: '1 tarefa vencida', reason: 'Planejada até 14/11 e não concluída', action: { label: 'Reorganizar planejamento', icon: 'calendar-clock' } }]} />
```
