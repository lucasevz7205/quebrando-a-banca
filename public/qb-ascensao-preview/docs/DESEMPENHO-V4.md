# Atualização v4 — Desempenho

Refinamento da tela existente; nenhum design system novo. Protótipo de interface: **nada está conectado à Base44** e todos os números são demonstrativos (identificados na tela).

## 1. Estrutura da tela
Cabeçalho (título, período analisado, abas) → Filtros → 6 indicadores → Evolução + Prioridades → (histórica: período atual × anterior, séries separadas) → Desempenho por matéria e assunto → Questões do período.
A área analítica usa a superfície `--canvas` sem cenário; a ambientação aparece só na faixa do cabeçalho.

## 2. Camadas
| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Apresentação | `components/performance/*` | Renderiza props, emite eventos. Não calcula escopo, não navega, não grava. |
| Filtros e estado de interface | `ui_kits/app/PerformanceScreen.jsx` | `daily` e `hist` (um objeto por aba, independentes); expansão e ordenação ficam no explorer. |
| Métricas calculadas | `ui_kits/app/perf.js` → `QB_PERF_CALC` | Funções puras sobre o log de respostas. |
| Remissões | `ui_kits/app/links.js` → `QB_NAV.resolve` + `dispatch` | Valida destino antes de navegar. |
| Dados | `data-performance.js` (demo) → Base44 (real) | Log de respostas, tarefas, avaliações de cartões. |

## 3. Contrato de dados (entrada esperada da Base44)
```ts
type Scope = { from: string; to: string; subjectId: string | 'all'; topicId: string | 'all' }; // datas ISO
interface AnswerAggregate { date: string; subjectId: string; topicId: string; correct: number; wrong: number; blank: number } // QB_PERF.log
interface AnswerRecord { questionId: string; date: string; subjectId: string; topicId: string; nodeId?: string; given: 'C' | 'E' | null; result: 'correct' | 'wrong' | 'blank'; confidence: number | null } // QB_PERF.answers
```
`PerformanceService` (hoje `QB_PERF_CALC`): `rows(scope)`, `sum(rows)` → `{ correct, wrong, blank, valid, n, accuracy|null, net }`, `series(scope, 'day'|'week'|'month')`, `previousScope(scope)` → `Scope | null`, `tree(scope)` → `PerformanceNode[]`, `tasks(scope)`, `flashcards(scope)` → `number | null`, `answers(scope)`, `priorities(scope)`.

## 4. Fórmulas
- Itens julgados = acertos + erros + brancos. Não realizadas ficam fora de tudo.
- Taxa de acerto = acertos ÷ (acertos + erros). Denominador zero → estado "Sem respostas válidas".
- Nota líquida (regra CEBRASPE selecionada) = acertos − erros; branco = 0.
- Calibração da confiança = **sem valor** até haver fórmula formal e registros de `confidence`.
- Comparação = período imediatamente anterior de mesma duração (diária: dia anterior com respostas). Sem base → não aparece.
- Prioridades (`RULES`): erros recorrentes ≥ 5 erros em ≥ 2 dias no tópico; baixa precisão < 60% com ≥ 20 válidas; tarefas `late`; revisões `pending` do dia. Sem registros → sem prioridade.

## 5. Eventos e destinos
| Origem | Evento / payload | Destino |
|---|---|---|
| SubjectPerformanceExplorer | `onAction({ action: 'train'\|'mindmap'\|'review'\|'architect', subjectId, topicId, nodeId? })` | `dispatch(intent, 'performance')` → sessão, mapa, baralho ou O Arquiteto; retorno volta ao Desempenho. Só aparecem ações com `resolve(...).ok`. |
| PerformancePriorityPanel | `onAction(item)` com `item.action.intent` | `dispatch` (Treinar erros) |
| | `item.action.open = { subjectId, topicId }` | Expande e foca o tópico no explorer (Abrir assunto) |
| | `item.action.go = ['plan', 'semana' \| 'hoje']` | Planejamento |
| Questões do período | `{ action: 'question', subjectId, topicId, questionId }` (novo em `resolve`) | Sessão de questões na questão exata; id inexistente → "Sem vínculo" (`question-not-found`) |
| PerformanceMetricCard (Tarefas) | `action.onClick` | `go('plan', 'hoje' \| 'semana')` |
| PerformancePeriodSelector | `onChange({ date } \| { from, to })` | Estado do filtro |
| PerformanceTrendChart | `onGranularity(id)` | Estado do filtro |

## 6. Catálogo
**Novos (`components/performance/`):** PerformanceMetricCard, PerformancePeriodSelector, PerformanceTrendChart, SubjectPerformanceExplorer, PerformancePriorityPanel (+ classes `.qb-perf-*` em `components/modules.css`).
**Reutilizados:** Panel, Badge, Button, Icon, ProgressBar, EmptyState, SelectField, Tabs, PageHeader, `.qb-seg`, `.qb-table`, `.qb-input`. StatCard e LineChart seguem nas outras telas.
**Alterados no kit:** `PerformanceScreen.jsx` (reescrita), `Shell.jsx` (prop `plain`), `App.jsx` (passa `dispatch`), `links.js` (ação `question`), `index.html`.

## 7. Acessibilidade e responsivo
Abas, segmentados e linhas do explorer por teclado (← → expandem/recolhem; ↑ ↓ Home End percorrem). Gráfico focável (← → Home End Esc), leitura por `aria-live`, resumo textual e tabela de dados. Foco com `--ring-focus`. Em telas estreitas: indicadores em 1–2 colunas, gráfico reduz rótulos, linhas do explorer empilham barra, contagens e selo.

## 8. Depende da Base44
- Log real de respostas por data/matéria/assunto e registros individuais (questão, resposta, resultado, confiança).
- Avaliações de flashcards por data e assunto (a demo só tem o dia atual).
- Fórmula e dados da calibração da confiança.
- Enunciados de todas as questões respondidas (a demo tem 5, do assunto DC 2a) e mapas/baralhos por assunto.
- Títulos de assuntos ausentes nos arquivos; regra de pontuação por perfil de prova.
- Subtópicos (nós de mapa) com estatística própria: o contrato aceita `nodeId`, mas a demo não tem respostas por nó.
