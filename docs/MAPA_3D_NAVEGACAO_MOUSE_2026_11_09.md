# Mapa mental 3D: navegação espacial e mouse
**Data:** 09/11/2026
**Projeto:** Quebrando a Banca

## Objetivo
Corrigir a densidade visual, a dificuldade de escolher ramos e a navegação imprevisível pelo mouse no mapa 3D, sem modificar o conteúdo dos mapas, histórico das questões, flashcards, diagnósticos de desempenho ou as contas separadas da Câmara e Área Fiscal.

## Alterações
1. **Espaçamento real dos nódulos.** Em `src/components/qb/mind-map/layout.js`, os ramos principais começam em raio **4,7** (antes 2,8) e o incremento entre níveis passa de **1,62** para **3,35 mais uma progressão leve**. Grupos de irmãos também ganham afastamento no eixo Z, evitando que ramos densos compartilhem a mesma projeção. Posição, caminho e título de cada nó continuam determinísticos.
2. **Visão geral inteligente.** Em `scene.js`, o botão centralizar e o enquadramento inicial consideram **somente os nós atualmente visíveis**. Os filhos recolhidos não obrigam a câmera a ficar tão distante. Ao abrir um ramo, a câmera focaliza a área correspondente; expandir/recolher todos recalcula o enquadramento.
3. **Zoom pela roda/trackpad focado no cursor.** `mouse-navigation.js` normaliza os deltas da roda, limita saltos de dispositivos e calcula escala gradual. `scene.js` projeta a posição do cursor num plano de navegação e compensa a translação da câmera e do alvo para que o ponto sob o cursor fique estável. O painel AXON continua com sua própria rolagem.
4. **Gestos do mouse explícitos.** Arrastar com o botão esquerdo **gira** a cena; arrastar com o direito **desloca lateral/verticalmente**; a roda **aproxima/afasta**; um toque/clique escolhe o nó; dois cliques/toques abrem a explicação AXON. Pinça continua para dispositivos de toque.
5. **Seleção com tolerância.** `Raycaster` consulta as esferas reais; quando a esfera é pequena demais, um segundo teste em coordenadas projetadas escolhe o nó visível próximo do cursor dentro de um limite estreito. Arrastar não gera clique falso. A escolha funciona mesmo após compactação das instâncias por fechamento dos ramos.
6. **Duplo clique preservado.** O clique inicial seleciona imediatamente; o zoom para esse nó começa somente após 370 ms, caso não aconteça o segundo clique. Isso impede que a esfera ou o rótulo escape durante a janela do duplo clique. Qualquer giro, zoom, abertura de painel ou seleção diferente cancela o foco pendente.
7. **Rótulos com prioridades.** `resolveLabelPositions` evita sobreposição de etiquetas, prioriza seleção e seus ancestrais e esconde somente rótulos conflitantes, nunca as esferas/arestas. As cores diagnósticas existentes são preservadas.
8. **Atalhos de ramos principais.** Uma barra rolável horizontal mostra os ramos raiz, com cor diagnóstica e destaque do ramo atual; clicar num atalho foca o ramo sem abrir AXON.
9. **Área e botões maiores.** `map-navigation.css` amplia o palco 3D, os alvos do mouse e os controles de câmera, preservando responsividade e o estilo azul-marinho e roxo.

## Arquivos
- `src/components/qb/mind-map/layout.js`
- `src/components/qb/mind-map/mouse-navigation.js`
- `src/components/qb/mind-map/scene.js`
- `src/components/qb/mind-map/observe.js`
- `src/components/qb/mind-map/node-activation.js`
- `src/components/qb/study-shell.html`
- `public/claude-export/map-navigation.css`
- `tests/map-navigation-usability.test.mjs`
- `tests/map-branches-doubleclick.test.mjs`

## Verificação
A suíte cobre os 29 mapas estruturados da Câmara, incluindo distância mínima entre conceitos ligados, normalização da roda, seleção por proximidade, anticolisão de rótulos, preservação das cores e funcionamento do duplo clique. O teste automatizado não substitui a avaliação de usabilidade em um navegador real, especialmente com touchpad ou resolução pequena.
