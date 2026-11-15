Indicator card of the Desempenho screen. Value in JetBrains Mono, formula always visible, comparison only with a valid base. Never render `0/0` or an estimated value: use `state="empty"` or `state="pending"`.

```jsx
<PerformanceMetricCard label="Taxa de acerto" icon="target" tone="correct" value="83%" detail="205 de 247 respostas válidas"
  formula="acertos ÷ (acertos + erros) · brancos fora" comparison={{ delta: 2, label: '+2 p.p. vs. 13/11' }} method="Itens em branco não entram no denominador." />
<PerformanceMetricCard label="Itens julgados" icon="list-checks" value={248} breakdown={[{ label: 'acertos', value: 205, tone: 'correct' }, { label: 'erros', value: 42, tone: 'incorrect' }, { label: 'em branco', value: 1 }]} />
<PerformanceMetricCard label="Tarefas concluídas" state="empty" stateText="Sem tarefas planejadas" />
<PerformanceMetricCard label="Calibração da confiança" state="pending" formula="Aguardando fórmula formal e registros de confiança." />
```
