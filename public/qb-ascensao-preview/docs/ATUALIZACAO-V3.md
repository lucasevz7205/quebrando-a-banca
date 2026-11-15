# Atualização v3 — Treinar radial, barra superior e seletor de assuntos

Evolução do protótipo existente; nenhum design system novo, nenhuma tela removida. Contratos em `docs/CONTRATOS-NAVEGACAO.md`.

## O que mudou
1. **Treinar** — `TrainingRadial` é o seletor principal: Matérias → Assuntos → 4 ações (Treinar, Mapa Mental, Revisão Ativa, O Arquiteto). Anel de acertos só com respostas válidas; selo de pendências vem do planejamento. Trilha clicável, botão de retorno no centro, Esc sobe um nível, alternância Radial/Lista e lista automática em telas estreitas. Cartões de rodada sugerida, pendências e armadilhas foram mantidos na lateral; a lista de menor acerto agora posiciona o radial no assunto ("Ver ações").
2. **Barra superior** — removido "Topo: amplo". "Sincronizado" virou indicador de estado. Fundo e Tema foram para o menu **Preferências** (itens de rádio). Novo **Modo foco** (remove cenário, oculta a marca por extenso e compacta a navegação). Preferências persistem localmente.
3. **Estudo › Mapas mentais** — o DS só tinha `SelectField` (select nativo) e `SearchField`; nenhum atendia. Criado `StudyTopicPicker`: busca por matéria/código/título, grupos por matéria, títulos completos, contagem de mapas real, ↑↓/Enter/Esc, foco de volta ao gatilho, folha inferior no celular. "Recentes" aparece após a primeira seleção (mecanismo de sessão); Favoritos e Revisões pendentes existem como props e ficam ocultos sem dados.
4. **Remissões** — todas as ações passam por `QB_NAV.resolve`. Corrigido o fallback silencioso do mapa (id inexistente abria o primeiro nó). Novo estado "Sem vínculo" com ids, motivo e retorno seguro. Nó → questões relacionadas no mapa. Sessões voltam para a tela de origem.

## Catálogo
**Novos:** TrainingRadial (`navigation/`), StudyTopicPicker (`study/`).
**Alterado:** GlobalToolbar (props `density/onDensity` removidas; `focusMode/onFocusMode` adicionadas).
**Reutilizados sem alteração:** PageHeader, Panel, Button, Badge, Icon, EmptyState, Tabs, MainNav, BrandLogo, MindMapCanvas, ConceptPanel, QuestionCard, FeedbackDrawer, AnswerActionBar, StudySessionHeader, Flashcard, ArchitectStudio/Launcher, ToastStack. SubjectRadial e RadialNavigation seguem em uso no Edital e no Menu principal.

## Funciona na demonstração
- Radial completo com dados fictícios do edital (9 matérias, todos os assuntos, paginação).
- Para **DC 2a**: Treinar (5 questões), Mapa Mental (nó raiz), Revisão Ativa (5 cartões). O Arquiteto abre com contexto para qualquer assunto.
- Demais assuntos: Treinar / Mapa / Revisão levam ao estado "Sem vínculo" (não há conteúdo de demonstração) — nenhum outro assunto é aberto.
- Seletor de assuntos, Modo foco, Preferências, menus por teclado, retorno preservando sessão e seleção.

## Depende da integração real
- Banco de questões filtrado por `subjectId`+`topicId`; mapas e baralhos por assunto; contagens reais.
- Pendências por assunto, favoritos e revisões pendentes (SRS).
- Títulos dos assuntos ausentes nos arquivos (continuam como "Título não disponível nos arquivos").
- Estado real de sincronização (`ok/syncing/offline`).
- Respostas de O Arquiteto (serviço real; o protótipo apenas passa o contexto).

## Acessibilidade
Foco visível em todos os controles novos; alvos de 44 px (chips com área de toque estendida); alternativa linear ao radial; `aria-pressed`, `menuitemradio`, `combobox/listbox`; movimento reduzido herdado de `tokens/base.css`; layouts em flex-wrap sem rolagem horizontal.
