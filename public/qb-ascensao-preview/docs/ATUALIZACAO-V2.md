# Atualização v2 — cobertura funcional

## Alterações (resumo objetivo)
1. **Marca:** cabeçalho e logotipo agora usam só "Quebrando a Banca". "A Ascensão" saiu do `BrandHeader`, do `BrandLogo` (horizontal/wordmark) e da tela de boas-vindas (agora usa o logo Q-espada). Ficou guardado para a futura jornada de evolução (`BrandLogo subtitle`, arte `vertical`).
2. **Tutor → O Arquiteto:** o módulo virou um estúdio com 5 ferramentas (`ArchitectStudio`), acesso global compacto (`ArchitectLauncher` + chip na `GlobalToolbar`) e preserva o contexto de origem (questão, tarefa, tópico do edital). O antigo `TutorPanel` foi renomeado e ficou como painel compacto.
3. **Navegação:** `MainNav` com 7 destinos (Planejamento traz o atalho "Hoje" como visualização, não como página separada) e `GlobalToolbar` com sincronização, fundo cena/estático, topo amplo/compacto, tema escuro/alto contraste, Ferramentas e Recolher. Os controles secundários são chips pequenos fora da barra fixa.
4. **Edital:** árvore verticalizada (bloco → matéria → assunto → tópico), mapa de calor com 6 faixas, navegação radial em 2 passos com paginação, busca, filtros, "Evocar antes de ler" e ações contextuais por tópico.
5. **Planejamento:** abas Hoje/Semana/Ciclos, panorama do dia, calendário semanal com expansão, ajustes de rotina com prévia → aplicar/cancelar → desfazer, horas por dia e sequência do ciclo.
6. **Simulado:** preparação (composição oficial × estimada, banco insuficiente, regras de pontuação configuráveis, preparação de 5 min), execução (cronômetro, navegador, C/E/branco, marcação, confirmação), discursiva com limite configurável, resultado detalhado e histórico separado do treino.
7. **Desempenho:** Análise diária (data + Hoje), Análise histórica (período, agrupamento, matéria, treino × revisão × simulado, amostra) e Método.
8. **Tokens novos:** `tokens/data-viz.css` (faixas de calor, status de estudo, séries de gráfico). **CSS novo:** `components/modules.css`. **Ícones:** +45 Lucide.
9. **Dados demonstrativos coerentes:** `ui_kits/app/data-edital.js` + `metrics.js` (uma única definição de taxa de acertos, cobertura e nota líquida para todas as telas).

## Matriz referência → implementação
| Estrutura da referência | Tela (ui_kits/app) | Componente(s) |
|---|---|---|
| Janela "O Arquiteto · Estúdio de Aprendizagem Ativa" | modal global (todas as telas) | ArchitectStudio, Tabs |
| Abas Tutor Socrático / Lab Feynman / Caderno Cornell / Flashcards 3D & Scanner / Pomodoro & Áudio Alfa | idem | SocraticChat, FeynmanLab, CornellNotebook, ScannerFlashcards, PomodoroAudio |
| Matéria do concurso + Assunto/tópico (histórico catalogado) + Limpar histórico | Tutor Socrático | SocraticChat, SelectField, ConfirmDialog |
| Modo cognitivo: Socrático, Feynman, Banca Cebraspe, Arguição Oral | Tutor Socrático | SocraticChat (qb-seg) |
| Ações Testar retenção, Armadilhas da banca, Analogia Feynman, Arguição por voz; campo + Enviar | Tutor Socrático | SocraticChat (chips, estados vazio/processando/erro/voz indisponível) |
| Chip "O Arquiteto", Sincronizado, Fundo estático, Topo amplo, Tema escuro, pulso, Ferramentas, Recolher | cabeçalho (Shell) | GlobalToolbar, ArchitectLauncher |
| Barra ornamentada Menu principal · Hoje · Edital · Treinar (50) · Estudo · Simulado · Desempenho | cabeçalho (Shell) | MainNav (Hoje como atalho de Planejamento; badge = atrasadas reais) |
| "Edital verticalizado · Seu edital, em perspectiva" (hero alto) | Edital | PageHeader (compacto, sem hero) |
| Filtros Todas as matérias / Todos os status / Evocar antes de ler | Edital | SearchField, SelectField, qb-check |
| Mapa de calor · aproveitamento por tópico + legenda 6 faixas | Edital → Mapa de calor | HeatmapGrid, HeatmapCell, HeatmapLegend |
| Legenda Dominado / Revisando / Em estudo / Não iniciado | Edital → Lista | EditalTree, StatusTag (tokens separados) |
| "P1 · Conhecimentos básicos · 90 itens" | Edital (grupos por bloco), Simulado | EditalTree, CompositionTable |
| Radial "Edital · matérias" (assuntos · bloco, núcleo, paginação, Abrir tela completa) | Edital → Radial | SubjectRadial |
| Núcleo "Cobertura do edital 80% · acertos consolidados" (ambíguo) | Edital → Radial, Menu | SubjectRadial mostra **Taxa de acertos**, **Cobertura** e **Volume** separados |
| Análise diária / histórica / Método | Desempenho | Tabs, StatCard, LineChart, BarChart |
| Data + Hoje; Itens julgados, Taxa de acerto, Nota líquida, Certeza calibrada, Tarefas, Flashcards | Desempenho → Diária | StatCard (certeza calibrada = "Definição pendente") |
| Precisão diária (gráfico) + Prioridades "O que fazer agora" | Desempenho → Diária | LineChart (amostra pequena vazada), lista de prioridades com ações |
| Panorama do desempenho (247, 83%, 0/9) + Acertos nas rodadas (7 dias) | Planejamento (topo) | StatCard compact, BarChart |
| "Adapte a semana ao seu dia real" + Puxar / Distribuir / Trazer atrasados / Desafogar / Redistribuir + Quantidade | Planejamento | RescheduleActions (com prévia e desfazer) |
| Calendário DOM–SÁB com tarefas, "+5 tarefas", "75 revisões automáticas" | Planejamento → Semana | WeekCalendar, TaskCard (cadeado = revisão automática) |
| "Editar cronograma da trilha · Antecipar ou reagendar objetivos" | Planejamento | RescheduleActions → onEdit (abre a prévia de antecipação) |
| Simulado (180 itens, 300/180 min — citado no briefing) | Simulado | CompositionTable, QuestionNavigator, ExamTimer, ConfirmDialog |

**Correções de ambiguidade:** o "80% cobertura do edital" da referência era taxa de acertos; agora são métricas distintas com critério explícito. Totais da referência (ex.: 1755 de 2493, 1409/343) não foram copiados — todos os números vêm do mesmo conjunto demonstrativo.

## Funcional × simulado × integração futura
- **Funcional no protótipo:** navegação entre todos os módulos; abas; filtros/busca/expansão do edital; clique no mapa de calor e no radial abrindo e destacando o tópico; seleção de tarefas; ajustes de rotina com prévia, aplicação, cancelamento e desfazer (sem concluir/apagar/duplicar; revisões automáticas preservadas); configuração de horas e ciclo; simulado completo (timer, navegação, marcação, finalização com confirmação, resultado, histórico); discursiva com limite; filtros do desempenho; Pomodoro; controles globais (fundo, topo, tema, recolher, sincronização simulada).
- **Simulado (sem serviço real):** respostas do Arquiteto, feedback Feynman (regras de texto), pistas Cornell, Scanner (texto de exemplo), geração de cartões, áudio (sem som), sincronização, intervalos de revisão.
- **Depende de integração:** IA real e histórico persistente por tópico; reconhecimento de voz; OCR; SRS real; títulos oficiais completos do edital (só 8 títulos e 4 assuntos aparecem nas referências); definição de "certeza calibrada"; distribuição oficial de itens por matéria; banco de questões; dados reais do usuário (Base44 — não conectado).
