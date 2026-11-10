# Menu radial AXON — Navegação do Quebrando a Banca
Data: 10/11/2026

## Objetivo atendido
O usuário solicitou transformar o conteúdo inicial em um **dashboard circular/radial**, apoiado sobre o vídeo global já existente, com um núcleo principal e seis ramos (Hoje, Edital, Treinar, Estudo, Simulado, Desempenho). Ao escolher uma área, aparece um **segundo dashboard radial** com as funcionalidades da área, sem sobrepor o conteúdo original da página. A escolha de uma função abre sua interface de estudo real. O usuário pode retornar ao menu principal e continuar usando a barra superior como navegação direta.

## Arquitetura de navegação
- A inicialização sem hash e `#menu` abrem o hub radial, substituindo o antigo painel Hoje como landing page.
- `#menu/<area>` abre diretamente o hub radial da área, preservando a URL ao trocar de contexto.
- Os endereços anteriores `#painel`, `#edital`, `#treinar`, `#mapa`, `#cartoes`, `#analiseDia`, etc. continuam funcionando diretamente.
- As abas superiores mantêm **acesso direto** às telas existentes. Acrescentado `Menu principal` à esquerda dessas abas.
- Em qualquer tela funcional, o botão `← Menu principal` permite voltar ao radial. Dentro de um subdashboard radial, o núcleo central, o botão superior e a tecla Escape voltam ao hub.
- O radial é visual e funcional. As seis áreas e seus atalhos são mapeados a IDs reais da aplicação, sem novas páginas fictícias:
  - **Hoje:** Planejamento/Hoje, Revisões/Flashcards, Prática de hoje/Treinar, Meu progresso/Análise diária.
  - **Edital:** Edital, Mapas de conceitos, Pegadinhas, Materiais.
  - **Treinar:** Questões, Caderno de erros, Flashcards, Pegadinhas.
  - **Estudo:** Mapa mental 3D, Flashcards, Materiais, Aprendizagem, Pegadinhas.
  - **Simulado:** Painel/Resultados dos simulados (interface existente), Meu desempenho, Método.
  - **Desempenho:** Análise diária, Histórico, Caderno de erros, Método.
- **Contas específicas:** se a aplicação remove a aba Simulado por restrição da conta, o radial se adapta a cinco áreas. Não apresenta atalho indisponível.

## Estética e transições
- A camada global do vídeo permanece inalterada atrás do hub.
- Círculo central com núcleo luminoso azul/violeta, anéis concêntricos tracejados, linhas curvas de conexão e nós circulares distribuídos radialmente em posições determinísticas.
- Os nós são botões HTML semânticos, não alvos minúsculos de WebGL.
- Transição AXON de seleção: **175 partículas 2D** de curta duração, entre o clique e a nova tela. Sem abrir contexto WebGL adicional; a animação termina e limpa o canvas.
- Uma versão reduzida para telefones reorganiza tamanhos, mantém os nós em círculo e oculta subtítulos longos.
- `prefers-reduced-motion: reduce` remove animações, dando acesso instantâneo à próxima tela.
- O cabeçalho fica mais compacto apenas na tela do menu radial. O launcher de IA permanece independente do sistema de navegação.

## Arquivos
- `public/claude-export/radial-dashboard.js`: árvore estática de destinos e submenus, renderizador HTML seguro, 2D AXON de curta duração, interatividade por clique e Escape.
- `public/claude-export/radial-dashboard.css`: desenho circular, atmosfera de vidro, transições responsivas, foco acessível.
- `src/components/qb/study-shell.html`: tela padrão, hash, menu principal no cabeçalho, retorno a partir das telas, despacho para funcionalidades reais.
- `tests/radial-dashboard.test.mjs`: cobertura do hub principal, menus reais, filtros por conta, integração, clique/teclado, responsividade e preservação do vídeo.

## Preservação funcional
Nenhuma rotina de questões, correções, cronômetro, flashcards, simulados, módulos pedagógicos, armazenamento, documentos ou históricos foi alterada; apenas o ponto de entrada e a navegação. O menu não inventa contadores ou métricas.

## Verificação
Executar `node --test tests/*.test.mjs` e `npm run build` antes de publicar; realizar a publicação com checkpoint restaurável. Testes automatizados não substituem inspeção visual no navegador real e com diferentes tamanhos de tela.
