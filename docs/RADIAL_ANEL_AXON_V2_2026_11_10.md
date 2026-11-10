# Segunda versão do menu radial — anel vivo AXON
Data: 10/11/2026 · Projeto Quebrando a Banca

## Restaurabilidade
A versão radial **anterior, já aprovada pelo usuário**, foi preservada ANTES de qualquer modificação no checkpoint:
`6af309871a6e1d5c0cedea80`
Commit original: `eec619ca57e0a497e8a3f79c2eb7bfdb21ac176b`.
Se o resultado desta tentativa não agradar, restaurar o checkpoint anterior pelo controle de versões do Base44; não é necessário reconstruir manualmente o dashboard.

## Objetivo
Abandonar cartões arredondados posicionados fora de um anel e transformar o **próprio anel de luz derivado do vídeo de fundo** no menu de navegação. Os seis destinos existentes devem estar incorporados em suas faixas, usando animação e interação baseadas no AXON já implantado no mapa mental 3D.

## Alterações
1. **Anel único:** `radial-dashboard.js` organiza os rótulos dos módulos na circunferência de raio proporcional de 37%, e cada setor corresponde a um arco SVG entre os módulos. A geometria deixa de usar raios radiais que saem do centro para cartões soltos. Um anel contínuo contém as seis áreas.
2. **Textura e paleta do vídeo:** `radial-annulus.css` incorpora `/claude-export/ambient-poster.jpg` em máscara circular, com uma camada de gradiente de luz nas cores extraídas do fotograma (ciano, azul-elétrico, violeta, magenta e tons alaranjados concentrados na obra original). O conteúdo do ringue se integra visualmente ao vídeo global, que permanece por trás de toda a interface.
3. **Nós integrados:** os módulos são botões HTML semânticos e transparentes dentro da banda luminosa, com texto branco e pequenos sinais luminosos. Não há cartões quadrados ou retangulares ao redor. O núcleo central continua servindo de identidade visual ou botão para voltar ao menu principal, conforme o nível de navegação.
4. **Setores clicáveis:** além do título, o arco inteiro do setor SVG recebe cliques/taps e redireciona ao mesmo destino, ampliando a área de toque. Os textos permanecem acessíveis por tabulação.
5. **AXON efetivo:** `radial-axon-flow.js` reutiliza os mecanismos matemáticos do `axon-reveal.js` existente: sementes determinísticas, campos de partículas, `ease(t)=t*t*(3-2*t)`, curvaturas `curl`, turbulência e convergência para o centro. Seu canvas leve de 132 filamentos percorre a faixa circular a até ~30 quadros por segundo. A seleção usa uma transição AXON de 410 partículas durante ~810 ms, com convergência do setor selecionado ao núcleo, antes de abrir a nova tela.
6. **Foco e teclado:** passar o mouse sobre um setor destaca somente seu trecho do anel. A navegação por setas direcionais circula entre as seis opções sem girar os textos. Tecla Enter ativa o botão; Escape retorna ao hub na tela de subárea. O botão de voltar e a barra superior continuam disponíveis.
7. **Modo estático:** a animação contínua do anel é desativada juntamente com a escolha `Fundo: estático`. A imagem congelada mantém o anel visível. Em `prefers-reduced-motion: reduce`, tanto a animação contínua quanto a transição de partículas são eliminadas.
8. **Desempenho e ciclo de vida:** um único canvas 2D para os filamentos, sem contexto WebGL extra, `IntersectionObserver`, `ResizeObserver`, pausa quando a aba fica oculta e cleanup no momento da troca de tela. As atualizações do banco não reiniciam o menu radial enquanto o usuário estiver nele.
9. **Responsividade:** a disposição em anel de seis ou cinco módulos continua em mobile; descrições secundárias somem na tela pequena, preservando os nomes das áreas.

## Itens preservados
- O menu principal, os submenus das seis áreas e todos os caminhos reais (Hoje, Edital, Treinar, Estudo, Simulado, Desempenho).
- A redução automática para cinco módulos em contas que não exibem Simulado.
- A barra de navegação superior e botão de retorno em telas internas.
- O vídeo ambiental global com opção de imagem estática ou reprodução.
- Todos os mapas 3D, questões, flashcards, notas, simulados, relatórios, estatísticas, contas e dados do usuário.
- Nenhuma mudança de armazenamento ou de solicitações de IA.

## Arquivos
- `public/claude-export/radial-dashboard.js`
- `public/claude-export/radial-annulus.css` (novo)
- `public/claude-export/radial-axon-flow.js` (novo)
- `src/components/qb/study-shell.html`
- `tests/radial-dashboard.test.mjs`
- `tests/radial-annulus-axon.test.mjs` (novo)
- `tests/radial-ring-flow-runtime.test.mjs` (novo)

## Verificação
Testes de renderização da geometria circular, equivalência dos destinos, hover/seleção por setor completo, resposta por teclado, lazy motion, movimento reduzido, proteção da imagem estática, cleanup e seleção AXON; suíte completa e build de produção devem ser aprovados antes do deploy. A conferência visual deve ser feita na versão publicada em navegador de computador e smartphone.
