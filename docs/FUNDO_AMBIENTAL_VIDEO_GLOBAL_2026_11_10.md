# Fundo ambiental de vídeo — Quebrando a Banca
**Atualização:** 10/11/2026

## Pedido
Aplicar o vídeo MP4 fornecido pelo usuário **atrás da interface inteira**, não somente atrás do cabeçalho, e permitir alternância entre **fundo estático e fundo em movimento**.

## Solução implementada
- Fonte do usuário: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_170109_f96e01a5-b0db-4274-b24d-8d97e99ec928.mp4`.
- Verificação: CDN pública retorna HTTP 200, `content-type: video/mp4`, tamanho **58.068.520 bytes**, suporta byte ranges.
- Uma camada `#qb-ambient-background` foi inserida **antes da árvore de componentes .wrap**, ocupa o viewport inteiro com `position:fixed; inset:0; z-index:0` e `pointer-events:none`.
- A UI ocupa `z-index:1` e permanece totalmente interativa. Sob o tema escuro, superfícies ganham transparência moderada e overlays escuros para manter o texto legível. O tema claro mantém uma película clara de alto contraste.
- A faixa/canvas animado anteriormente exclusivo do cabeçalho é desligada para não competir com o novo fundo.
- A camada de vídeo usa `object-fit:cover`, com película escura fixa, áudio mutado, `playsinline` e loop. Ao carregar os primeiros quadros, o vídeo entra suavemente sobre o poster.
- **Poster extraído do próprio vídeo:** `public/claude-export/ambient-poster.jpg`, JPEG real do segundo 1, ~79 KB. O poster cobre toda a tela no modo estático, sem baixar o MP4.
- Carregamento **sob demanda**: a URL do MP4 fica apenas no atributo `data-qb-video-src`; o script só atribui `video.src` e chama `load()/play()` quando há intenção real de reprodução. O modo estático antes da primeira reprodução não faz sequer a requisição do MP4.
- O novo botão `Fundo: animado` / `Fundo: estático` fica no cabeçalho, independente do seletor de tema. Seu estado `aria-pressed` acompanha a reprodução.
- Preferência armazenada apenas em `localStorage["qb-ambient-background-mode"]`. Quando nenhuma preferência existe, usa movimento, exceto sob `prefers-reduced-motion` ou `navigator.connection.saveData`, quando usa estático. O usuário pode ativar movimento mesmo com economia de dados, mas não quando a preferência de acessibilidade solicita reduzir movimento.
- Ao mudar de animado para estático, o vídeo pausa e mantém seu quadro; ao recarregar em modo estático, mostra o poster leve.
- Pausa automaticamente quando a aba está oculta. Em caso de falha da reprodução, o poster continua visível e o controle indica indisponibilidade.
- Itens repetidos de estudo (questões, tópicos, listagens) mantêm superfície mais opaca e dispensam desfoque por item para evitar carga excessiva de GPU.

## Segurança funcional
Nenhuma entidade, registro de questão, resposta, nota, flashcard, atividade, métrica, vínculo de mapa ou chamada de IA é alterada. O único estado persistido é o modo do fundo no navegador. O vídeo não possui áudio, controles de reprodução próprios nem recebe clique.

## Arquivos
- `src/components/qb/study-shell.html`: DOM de fundo full-screen, botão de alternância e carregamento do CSS/JS.
- `public/claude-export/ambient-background.css`: camada global e contraste da UI.
- `public/claude-export/ambient-background.js`: controle de movimento, economia de dados, acessibilidade, preferência e lazy-load.
- `public/claude-export/ambient-poster.jpg`: frame do vídeo para o fundo estático.
- `src/components/qb/motion/study-motion.js`: desativa a animação antiga do cabeçalho quando há vídeo global.
- `tests/ambient-background.test.mjs`: testes de integração, estados do controle, preferência, carregamento lazy, contraste, pausa e fallback.

## Verificação
Testes automatizados e build de produção concluídos antes do deploy. Ainda é necessário testar visualmente em navegador real, especialmente Safari iOS, monitor 16:9 e celular em retrato, porque o vídeo cobre o viewport e pode ser recortado conforme a proporção da tela.
