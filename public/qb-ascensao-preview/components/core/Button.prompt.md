Action button for Quebrando a Banca — gold primary for the one main action per view, bronze-outline secondary, gold-text ghost, crimson for ceremonial/destructive.

```jsx
<Button variant="primary" iconRight="arrow-right">Confirmar resposta</Button>
<Button variant="secondary" icon="bookmark">Marcar para revisão</Button>
<Button variant="ghost" size="sm">Pular</Button>
<Button variant="crimson" size="lg">Iniciar a ascensão</Button>
<Button loading>Salvando…</Button>
```

- One `primary` per screen region. Labels are verbs in the infinitive ("Confirmar", "Revisar"), sentence case.
- `size`: sm 36 · md 44 (default, meets touch target) · lg 52.
- `loading` swaps the left icon for a spinner and sets `aria-busy`.
