# Quebrando a Banca — aplicação do conceito visual Glass Iris

**Data:** 10/11/2026
**Escopo:** Reestilização visual do ambiente de estudo e do assistente, preservando o motor pedagógico e o backend Base44.

## Interpretação do prompt externo

O prompt fornecido descrevia um **dashboard de chat de finanças** com uma esfera de vidro iluminada, superfícies de alto contraste, tipografia Inter Tight, botões em azul e violeta, cartões de ação, rastro de luz superior e adaptação responsiva.

A aplicação de destino **não é uma tela única de chat**. É um workspace funcional de concursos com abas Hoje, Edital, Treinar, Estudo, Simulado e Desempenho, mapas mentais 3D, questões, histórico de respostas, revisões e um assistente local/LLM. Portanto, o objetivo foi **aproveitar a linguagem visual**, não substituir a estrutura funcional por um mockup de aplicativo financeiro.

## Elementos efetivamente reaproveitados

1. **Base cromática:** `#0E0E10` ao redor da interface, cartões `#19191F`, textos claros e secundários em cinza azulado; gradientes `#2F6BFF → #5A4CF5`.
2. **Iluminação:** luz azul radiante no topo central, lobo violeta à direita e ciano difuso à esquerda, aplicada em cabeçalhos, páginas hero e assistente.
3. **Globo de vidro:** esfera puramente CSS com refração, contorno, núcleo conic-gradient e pulso suave, integrada ao cabeçalho do workspace; uma versão mini acompanha o assistente.
4. **Tipografia:** `Inter Tight` 400/500/600/700/800, com fallbacks anteriores. Mantém `Source Serif 4` para texto longo de questões e `IBM Plex Mono` em dados numerados.
5. **Superfícies translúcidas:** barras e elementos utilitários com vidro azul-escuro, bordas finas, realces internos e sombra moderada.
6. **Navegação segmentada:** abas existentes retrabalhadas com seleção em gradiente azul/violeta e contraste adequado, sem criar uma barra lateral de 48px que reduziria a área de leitura.
7. **Composer do chat:** input de borda em gradiente azul-indigo-violeta e botão Enviar com gradiente.
8. **Ações rápidas do chat:** 4 cartões de estudo (desempenho, pontos fracos, tarefas e revisões) em grade 2 colunas, empilhados em telefones.
9. **Entrada e movimento:** cabeçalho, navegação e abertura de chat com animação discreta; o orbe tem pulso lento. Com `prefers-reduced-motion`, a animação é desativada, mantendo o visual estático.
10. **Modo escuro inicial:** novo usuário sem preferência em `localStorage.qb-tema` inicia no tema escuro. Preferências `light` ou `auto` gravadas continuam respeitadas, e o seletor de temas continua disponível.
11. **Preenchimento:** fundo do wrapper e do iframe ajustado para não produzir faixas claras durante a montagem do tema.

## Decisões de produto e de segurança

- **Não foram incluídos** “Good Morning, Jason”, “Smart Budget Plan”, “AI Agents Running 17”, conta fictícia, métricas ou histórico financeiro inventado.
- **Não foi usado vídeo de terceiros ou CDN de 4 segundos.** A animação CSS evita dependência externa, custo de download e consumo de memória em sessões de estudo prolongadas.
- **Não foi criada uma tela única** que sacrificaria o fluxo de treino e revisão, nem adotada escala proporcional rígida a um artboard de 1440×1008 que tornaria provas longas ilegíveis em celulares.
- **Vermelho/verde/âmbar continuam reservados para informações semânticas** de erro, acerto e atenção. O desejo de eliminar cores quentes foi aplicado aos acentos **decorativos**, não às respostas e diagnósticos.
- O assistente continua local por padrão; o botão **Consultar IA (usa créditos)** continua solicitando confirmação explícita antes de gastar créditos. Nenhuma consulta à IA é iniciada pela alteração visual.
- Nenhum documento, entidade, questão, resposta, nota, cálculo ou vínculo de mapa é alterado.

## Arquivos

- `public/claude-export/glass-iris.css`: tokens, iluminação, esfera, cartões, navegação, assistente e responsividade.
- `public/claude-export/assistant.js`: marcação semântica da esfera e dos quatro cartões acionáveis, preservando as quatro perguntas e os eventos existentes.
- `src/components/qb/study-shell.html`: fonte Inter Tight, CSS compartilhado e tema escuro para novos usuários sem preferência.
- `src/routes/_authed/estudar.jsx`: fundo do iframe e wrapper que evita o flash de fundo claro.
- `tests/glass-iris-theme.test.mjs`: sintaxe CSS, preservação de opções de tema, semântica de notas, quatro ações, confirmação de IA, responsividade e manutenção das abas.

## Verificação automatizada

Suite `node --test tests/*.test.mjs` e build de produção `npm run build` aprovados antes de publicar. A validação automatizada verifica contratos de integração; ainda é recomendável inspecionar visualmente o efeito do orbe e a densidade do chat em um navegador real e em mobile.
