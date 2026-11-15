# Contratos de navegação, identificadores e remissões (v3)

Protótipo de interface. **Nada aqui está conectado à Base44**; `ui_kits/app/links.js` é um serviço de demonstração com a mesma assinatura esperada do serviço real.

## 1. Camadas
| Camada | Onde está no protótipo | Responsabilidade |
|---|---|---|
| Componente visual | `components/**` (TrainingRadial, StudyTopicPicker, GlobalToolbar…) | Renderiza, emite eventos com ids. Não navega, não grava. |
| Estado de interface | `ui_kits/app/App.jsx` (`trainSel`, `mapTopic`, `mapSel`, `returnTo`, `backTo`, `session`, `cards`, `ui`) | Seleção atual, origem e retorno. Volátil. |
| Identificadores pedagógicos | `QB_LINKS` em `links.js` | Vínculos questão↔nó, nó↔assunto, assunto↔mapa, assunto↔baralho. |
| Serviço de navegação | `QB_NAV.resolve(intent)` + `dispatch(intent, origin)` | Valida o destino **antes** de navegar. |
| Dados persistentes | Base44 (fora do protótipo) | Respostas, confiança, erros, progresso, SRS. Nunca alterados por navegação. |

## 2. Identificadores
| Id | Formato na demo | Observação |
|---|---|---|
| `subjectId` | `dc`, `da`… | Matéria. |
| `topicId` | `dc-2a`, `da-10.6` | Assunto do edital; chave de todas as remissões. |
| `mapId` | `mm-dc-2a` | Mapa mental de um assunto. |
| `nodeId` | `lf`, `pz`… | Nó hierárquico do mapa (ids existentes preservados). |
| `questionId` | `q412` | Questão CEBRASPE C/E. |
| `deckId` | `deck-dc-2a` | Baralho de revisão ativa. |
Todos os ids trafegam sem transformação. Usuário e projeto continuam sendo escopo do backend.

## 3. Intent e resolução
```ts
type Action = 'train' | 'mindmap' | 'review' | 'architect' | 'node-questions' | 'question'; // 'question' exige questionId (ver DESEMPENHO-V4.md)
interface Intent { action: Action; subjectId: string; topicId: string; nodeId?: string }
type Resolution =
  | { ok: true; view: 'questions' | 'flashcards' | 'map' | 'architect'; nodeId?: string; mapId?: string; questionIndex?: number; questionId?: string; note?: string }
  | { ok: false; reason: 'topic-not-found' | 'no-questions' | 'no-map' | 'node-not-found' | 'no-deck' | 'no-node-questions' | 'unknown-action' };
```
Regras: (1) id inexistente **nunca** é trocado pelo primeiro item; (2) `ok:false` abre o estado "Sem vínculo" com os ids, o motivo e retorno seguro à origem; (3) resolver não grava nada.

## 4. Eventos dos componentes
| Componente | Evento | Payload |
|---|---|---|
| TrainingRadial | `onChange` | `{ subjectId \| null, topicId \| null }` |
| TrainingRadial | `onAction` | `{ subjectId, topicId, action, nodeId? }` (também em `data-action`, `data-subject-id`, `data-topic-id`, `data-node-id`) |
| StudyTopicPicker | `onSelect` | `{ subjectId, topicId }` |
| GlobalToolbar | `onFocusMode` / `onBackground` / `onTheme` / `onTool` / `onCollapse` / `onArchitect` / `onSync` | `boolean` / `'dynamic'\|'static'` / `'dark'\|'contrast'` / `toolId` / — / — / — |
| QuestionCard (existente) | `conceptLink.onClick` | host chama `go('map', { node, returnTo })` |
| Flashcard (existente) | `onOpenOrigin` | host chama `go('map', { node, returnTo })` |
| ConceptPanel (existente) | `onReturn` | host restaura `returnTo.view` |

## 5. Remissões
| De → para | Chave | Na demo | Sem vínculo |
|---|---|---|---|
| Questão → nó exato do mapa | `question.node` → `nodeId` | Funciona (5 questões) | Tela do mapa mostra "Nó não encontrado" |
| Nó → questão relacionada | `nodeId` → questões com `node === nodeId` | Funciona; botão só aparece se houver questões | Texto "Nenhuma questão vinculada" |
| Flashcard → conceito de origem | `flashcard.node` | Funciona | idem questão |
| Assunto → revisão ativa | `topicId` → `deckId` | Só `dc-2a` | Estado "Sem vínculo" |
| Assunto → tutor contextualizado | `{ subjectId, topicId, origin }` | Funciona para qualquer assunto válido (abre O Arquiteto com contexto; respostas do tutor não são simuladas aqui) | `topic-not-found` |
| Assunto → mapa | `topicId` → `mapId` | Só `dc-2a` | Estado "Nenhum mapa vinculado" |
| Retorno à atividade | `returnTo { label, view }` / `backTo` | Sessão (índice, respostas, confiança), seleção radial e assunto do mapa ficam em estado do app e são restaurados | — |

## 6. Estado preservado ao navegar
`trainSel` (nível do radial), `session` (questão atual, respostas, confiança, marcações), `cards`, `mapTopic`/`mapSel`, `recentTopics` (somente sessão), preferências visuais (`bg`, `theme`, `focus` em localStorage). Selecionar assunto ou trocar de mapa não altera progresso.

## 7. Para a integração real (Codex)
- Substituir `QB_LINKS`/`QB_NAV.resolve` por consultas reais mantendo a assinatura.
- `pendingByTopic`, `counts` do seletor, `recents`/`favorites`/`pendingReviews`: fornecer só quando existirem dados; listas vazias ocultam a seção.
- Filtro real de questões por `subjectId` + `topicId` na sessão de treino.
