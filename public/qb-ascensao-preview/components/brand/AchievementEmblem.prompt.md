Milestone emblem using the four brand symbols (Soldado, Sábio, Estrategista, Ascensão) — always with the explicit rule that unlocks it.

```jsx
<AchievementEmblem variant="soldado" state="earned" rule="7 dias seguidos com sessão concluída" />
<AchievementEmblem variant="sabio" state="in-progress" progress={0.6} rule="Revisar 200 flashcards" />
<AchievementEmblem variant="estrategista" state="locked" rule="Concluir 1 simulado completo" />
```

- Symbols map to virtues: Soldado = disciplina/ação, Sábio = conhecimento, Estrategista = visão/decisão, Ascensão = união das virtudes.
- Secondary reinforcement only: show next to, never instead of, accuracy/coverage numbers.
- State is spoken via text ("Conquistado", "Bloqueado", "60% concluído"), plus lock/check glyphs.
