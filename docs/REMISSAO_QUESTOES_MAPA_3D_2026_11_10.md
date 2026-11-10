# Remissão de questões aos nós do mapa 3D
Data: 10/11/2026 · Quebrando a Banca

## Problema
Ao selecionar "Abrir mapa do tópico" numa questão, o aplicativo associava a questão apenas ao capítulo do edital. A navegação abria o capítulo ou rolava a página até um nó da lista, mas o mapa tridimensional não recebia o caminho do conceito. Em capítulos compartilhados, às vezes era escolhido o primeiro mapa cadastrado, não o mapa com a associação precisa da questão. O estudante se perdia numa malha conceitual grande.

## Correção
1. **Resolver de origem por ID:** `public/claude-export/map-remission.js` pesquisa o ID verdadeiro da questão nas associações editoriais e no resolvedor global da conta atual. A prioridade é: ID/caminho explícito ou editorial revisado, depois associação conceitual automática conservadora. Capítulos compartilhados são avaliados sem presumir que o primeiro deles contenha o conceito correto. O resolvedor verifica se o caminho do nó ainda existe e retorna `topicId`, `path`, `title`, `confidence`, `via` e `questionId`.
2. **Sem falsos vínculos:** se não existe nó comprovável, devolve `status:topic` e `path:null`. O aplicativo abre o mapa do capítulo com aviso explícito, em vez de inventar um subramo. Mapas ausentes retornam `unavailable`. A busca só consulta mapas carregados pela conta autenticada.
3. **Atalho correto:** botões das questões no treino, no Caderno de erros, nos flashcards derivados e nas listas de questões exibem "Localizar conceito no mapa" com o ID da questão. Não há duplicação das questões ou alteração do gabarito.
4. **Vínculo do flashcard:** cartões autorais usam a versão decorada do mapa (incluindo `mapaPath` atribuído pela associação editorial). Cartões derivados do banco mantêm o `questionId` e recebem a mesma remissão da questão original.
5. **Deep link no mapa 3D:** o estado `S.mapaFocus` carrega um `nonce`, a chave do mapa e o caminho do nó. O HTML propaga `data-map-focus-path`/`data-map-focus-nonce` ao visualizador; `observeMindMap` consome cada requisição uma vez, abre o 3D, revela a ancestralidade caso haja ramo recolhido, foca/centraliza a câmera e abre a explicação AXON do conceito.
6. **Deslocamento visual:** após montar a cena, a própria seção 3D é trazida à janela por `scrollIntoView`. Não basta selecionar um ponto que fica abaixo da dobra. Quando WebGL não está disponível, a lista encontra e destaca o mesmo `data-map-node` e rola até ele.
7. **Contexto da pergunta:** uma tarja identifica o conceito, mostra o caminho do capítulo até o subramo e informa se o vínculo é editorial ou uma associação automática que merece verificação. Dentro da explicação AXON, o enunciado da questão original aparece em destaque, **sem abrir automaticamente o gabarito**.
8. **Retorno seguro:** o botão "← Voltar à questão" preserva a sessão de treino e sua posição, ou retorna aos flashcards/Caderno de erros conforme a tela de origem. Trocas manuais de assunto limpam o deep link anterior.
9. **Sem custo extra:** não há chamada à IA, alteração de dados do estudante, atualização de documento remoto, novo crédito nem mixing entre conta Câmara e Área Fiscal.

## Testes
`tests/map-question-remission.test.mjs`: ligação exata nos 67 IDs de Coesão, desempate por evidência explícita em capítulos compartilhados, fallback honesto de capítulo, proteção contra caminhos inexistentes, origem de flashcards, amostragem de todos os 29 mapas estruturados da Câmara, restrição por conta, propagação ao visualizador 3D e retorno à sessão anterior.

Suíte geral e build de produção passaram antes da publicação. A validação visual manual num navegador real não foi executada.

## Arquivos
- Novo: `public/claude-export/map-remission.js`
- Novo: `public/claude-export/map-remission.css`
- Editado: `src/components/qb/study-shell.html`
- Editado: `src/components/qb/mind-map/observe.js`
- Novo: `tests/map-question-remission.test.mjs`

## Limitação factual
Os mapas não têm todos os IDs de questão atribuídos a subnós. Quando só existe relação de capítulo ou quando os conceitos são ambíguos, o sistema não pode afirmar que há um único nó correto. Essa pendência de curadoria é distinta do bug de navegação agora corrigido.
