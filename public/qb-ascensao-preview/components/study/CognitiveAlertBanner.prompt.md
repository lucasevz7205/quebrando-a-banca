Gentle in-session banner for fatigue, attention or trap warnings — factual, never diagnostic, always dismissible.

```jsx
<CognitiveAlertBanner tone="fatigue" title="52 minutos sem pausa"
  actions={<><Button size="sm">Pausar 5 min</Button><Button size="sm" variant="ghost">Continuar</Button></>}
  onDismiss={close}>
  Uma pausa curta ajuda a manter a precisão nas próximas questões.
</CognitiveAlertBanner>
<CognitiveAlertBanner tone="trap" title="Palavras absolutas no enunciado">"Sempre", "somente" e "vedado" costumam inverter o gabarito.</CognitiveAlertBanner>
```

- Icon + uppercase tone label + text — never color alone.
- Copy states observable facts (time, streak of errors); don't claim the system "detected tiredness".
