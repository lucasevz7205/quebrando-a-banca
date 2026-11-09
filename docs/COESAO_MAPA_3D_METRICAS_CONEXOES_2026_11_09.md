# Coesão Textual: coloração das ligações pelo desempenho real
Data: 2026-11-09 | Projeto Quebrando a Banca | Piloto LP 4.1 · Câmara dos Deputados

## Origem verificada no banco autenticado
As informações abaixo são um retrato do banco **ClaudeDocument** da conta pessoal da Câmara, e não da Área Fiscal. A interface consulta esses registros em cada abertura; os números abaixo são documentação de auditoria, nunca configurações visuais fixas.

- Tópico do edital: `lp-4-1`, capítulo `LP-4.1`: coesão, referenciação, substituição, repetição e conectores.
- Mapa: `revisao/lp-4-1`, com 10 ramos principais, dezenas de subramos e 39 flashcards.
- Banco de questões: 67 itens `lp41-01` a `lp41-67`.
- Respostas: 50 respondidas, **50 acertos nas últimas marcações**, 17 ainda não respondidas.
- Registros de erros: 7 questões com erro histórico e 7 ainda no caderno. O sucesso recente não apaga erros passados.
- Flashcards: 22 avaliações; 15 lembrados (Bom/Fácil ou equivalente) e 7 com dificuldade ou necessidade de revisão.
- Nenhuma retenção certificada pelo campo `retidoEm` nas 50 questões, na data da inspeção. O diagnóstico de retenção pode também analisar a linha do tempo de revisões conforme algoritmo existente.

O arquivo `scripts/claude-seed/respostas.json` é um snapshot anterior que ainda apresentava 48/50 acertos, não a fonte atual. A aplicação **nunca** usa esse snapshot para colorir conceitos.

## Vínculos editoriais (sem mutação do banco)
`public/claude-export/cohesion-links.js` faz a correspondência editorial, item por item, entre as 67 questões, 39 cartões e caminhos de conceitos na árvore existente. A correspondência foi revisada pelos enunciados, não por similaridade automática de palavras. `decorate("lp-4-1", map, cards, questions)` cria apenas cópias em memória:
- `node.x.questaoIds` reúne os IDs correspondentes ao conceito;
- `card.mapaPath` vincula cada cartão ao nó exato;
- Os dados originais da conta e de outras disciplinas permanecem intocados.

`QBMapMastery.build` soma as questões por caminho e descendência com `Set` (sem duplicar IDs), calcula desempenho nas **últimas** respostas válidas, histórico de erros, cobertura e evidência de revisão; calcula a lembrança dos flashcards separadamente e considera ambas as fontes para o rótulo pedagógico.

## Regra visual adotada
`src/components/qb/mind-map/scene.js` produz geometria de arestas com cores por vértice (`Float32BufferAttribute`/ `vertexColors:true`). Em cada ligação pai-filho, a ponta próxima ao **filho** utiliza a cor do estado do filho; a ponta anterior é um tom mais escuro da mesma cor. Ligações cruzadas, quando houver, recebem as cores de seus dois extremos. Arestas sem dados do conceito de destino ficam neutras.

A paleta em `public/claude-export/map-evidence.css` respeita sobretons azul-marinho/roxo:
- `forte`: azul glaciar; `bom-sem-retencao`: azul claro;
- `em-desenvolvimento`: lilás; `deficiente`: violeta-rosado;
- `amostra-insuficiente`: cinza-azulado; `sem-evidencia`: cinza-ardósia.

**Nunca usar a porcentagem de acertos global como prova de força de todos os subramos**. O algoritmo de status existente exige tamanho amostral, cobertura, retenção e leva em conta o caderno e o desempenho em cartões. O usuário pode inspecionar o nó e abrir treino direcionado às questões vinculadas, sem modificar notas ou criar respostas por selecionar o mapa.

## Isolamento e manutenção
Nenhuma escrita em `ClaudeDocument`, `ClaudeDocumentPart`, `StudyDocument` ou histórico pessoal é realizada por essa melhoria. A coloração é calculada no navegador com as coleções carregadas do usuário autenticado. Novas respostas e avaliações serão refletidas no próximo render do mapa.

Verificação: `tests/cohesion-evidence-map.test.mjs` cobre 67 questões e 39 cartões, mapeamento válido, diferença entre snapshot e banco atual, preservação do original e uso de `vertexColors`. Validar também a suíte completa e o build da aplicação antes da publicação.
