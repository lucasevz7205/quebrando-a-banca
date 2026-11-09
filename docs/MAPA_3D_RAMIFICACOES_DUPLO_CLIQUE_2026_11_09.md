# Interação de ramificações e abertura de conceitos no mapa 3D
Data: 2026-11-09
Aplicativo: Quebrando a Banca

## Solicitação
Permitir abrir e fechar ramificações da árvore 3D, mantendo o diagnóstico por cores, e abrir a explicação AXON apenas com dois cliques/toques no conceito ou por ação explícita "Expandir conceito".

## Interação implantada
- **Um clique ou um toque no nó**: seleciona o conceito e revela suas ligações de navegação próximas, sem abrir a definição.
- **Duplo clique ou duplo toque no mesmo nó**: abre o painel AXON de definição e questões por transição de partículas. Intervalo máximo entre toques: 350 ms.
- **Botão +/− ao lado do rótulo do conceito**: abre ou recolhe somente os seus descendentes. A árvore permanece na mesma organização espacial.
- **Abrir ramo / Fechar ramo**: controla o nó atualmente selecionado, inclusive nos casos em que o usuário selecionou um conceito pelo campo de seleção.
- **Expandir todos / Recolher todos**: exibe toda a árvore ou apenas o centro e os ramos principais, respectivamente.
- **Expandir conceito**: atalho acessível que abre AXON também para usuários de teclado ou tecnologia assistiva.
- **Seleção pelo campo de conceito**: não abre a definição automaticamente.
- **Dentro do AXON**, os caminhos de navegação podem mudar o conceito e a explicação; Fechar ou Esc retorna à cena.

## Implementação
- `src/components/qb/mind-map/branch-visibility.js`: controle de expansão por caminhos da árvore, com `Set` de nós abertos, cálculo de visibilidade, `toggle/open/close/openAll/collapseAll/reveal` e snapshot para preservar estado da visualização.
- `src/components/qb/mind-map/node-activation.js`: reconhecimento independente de clique simples e duplo clique/toque; cliques rápidos em *nós diferentes* não contam como duplo clique. A ativação pelo teclado não presume abertura da explicação.
- `src/components/qb/mind-map/scene.js`: filtra as instâncias 3D, rótulos e geometria das conexões de acordo com os mesmos nós visíveis. Remapeia corretamente `Raycaster.instanceId` para a posição original do nó após recolher ramificações, preservando a cor diagnóstica e IDs.
- `src/components/qb/mind-map/observe.js`: coordena a seleção e o AXON, atualiza controles de expansão, relembra os ramos abertos após remount do mesmo tópico, e preserva as ações da lista e do campo de seleção.
- `src/components/qb/study-shell.html`: nova barra de controles e instruções de clique/dobro clique.
- `public/claude-export/map-branches.css`: botões e estados acessíveis com paleta azul-marinho e roxo, responsivos a toque e teclado.
- `tests/map-branches-doubleclick.test.mjs`: comportamento de árvore, seleção/dobro clique, recuperação de estado, regressões sobre os 29 mapas da Câmara e contratos da visualização.

## Garantias
Os registros de questões, respostas, gabaritos, revisões de flashcards e cores reais de desempenho não são alterados. As mudanças se limitam à **apresentação e navegação** dos nós do mapa 3D. O aplicativo preserva o ambiente pessoal da Câmara separado do ambiente da Área Fiscal.

A visualização em lista não muda; WebGL2 indisponível continua fazendo fallback para a lista, sem simular diagnóstico inexistente.
