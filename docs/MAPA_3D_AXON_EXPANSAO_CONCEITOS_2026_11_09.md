# Transição AXON para conceitos no mapa mental 3D
Data: 2026-11-09
Projeto: Quebrando a Banca

## Problema corrigido
A seleção de um ramo/subramo movia a câmera Three.js para o nó escolhido, mas sua explicação era apresentada **abaixo** do palco 3D. Essa separação visual prejudicava a navegação e exigia rolagem da página.

## Solução
- `src/components/qb/study-shell.html`: a área `data-map-detail` foi transferida para dentro de `data-map-stage`, em `data-map-concept`. O painel agora reúne título do conceito, definições, notas, exemplos, flashcards e diagnóstico conectado às questões. A área possui fechar por botão/backdrop e navegação por breadcrumb.
- `src/components/qb/mind-map/axon-reveal.js`: motor de transição de curta duração por canvas 2D transparente, sobreposto à cena Three.js existente. O efeito emite partículas do ponto projetado do nó e as faz convergir ao perímetro do painel explicativo, com iluminação e decaimento. Não cria segundo contexto WebGL, para preservar desempenho e compatibilidade. A animação para após 860 ms.
- `public/claude-export/map-axon.css`: painel dark blue/purple que surge no mesmo palco, com rolagem **interna**, responsividade, contraste, estados de expansão e suporte a `prefers-reduced-motion`.
- `src/components/qb/mind-map/scene.js`: oferece `pointFor(path)` para localizar o nó no plano da tela antes do zoom. Preserva geometria, raycasting, órbita e dados de domínio.
- `src/components/qb/mind-map/observe.js`: coordena clique/seleção/zoom/partículas/revelação, mantendo modos lista e 3D, navegação por ancestrais, botão de expansão, fechamento por Esc e liberação de recursos ao desmontar.
- `tests/map-axon-transition.test.mjs`: testes de abertura animada, movimento reduzido, seleção rápida, degradação sem canvas 2D e contrato de integração.

## Fluxo de usuário
1. Clicar numa esfera ou rótulo de ramo/subramo; ou selecionar e acionar **Expandir conceito**.
2. A câmera mantém o foco no nó, e partículas se espalham do nó para a moldura do conceito; o painel aparece sobre a cena.
3. O conteúdo conceitual fica na mesma área visual com rolagem interna; os links da matéria, questões, flashcards e indicadores continuam funcionais.
4. Breadcrumb muda o conceito focalizado; **Voltar ao mapa** / Esc recolhem o painel.
5. **Em lista** conserva o funcionamento textual original. Se faltar suporte a WebGL2, o fallback para lista permanece; se apenas o canvas 2D faltar, o painel abre sem partículas.

## Limites e preservação
É uma **transição gráfica inspirada na linguagem visual AXON**, não uma cópia literal de seu shader GPGPU. O efeito preserva o contexto WebGL do Three.js e evita execução permanente de frames. Nenhuma alteração em StudyDocument, questões, gabaritos, histórico, contas de candidatos, dados de recuperação ou agendamento SRS.

## Validação
Exigir `node --test tests/*.test.mjs` e `npm run build` antes do ponto de restauração e publicação. Testar manualmente no navegador a abertura por clique e toque, fechamento e o uso da rolagem interna.
