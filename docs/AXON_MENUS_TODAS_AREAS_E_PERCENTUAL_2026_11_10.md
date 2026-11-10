# Unificação dos percentuais e navegação AXON para as áreas do sistema
**Data:** 10 de novembro de 2026
**Aplicativo:** Quebrando a Banca
**Checkpoint de segurança anterior:** `6af34bda3e04652105d7c397`

## Problema do percentual
O Treinar radial estava exibindo **acerto na última tentativa**, enquanto **Desempenho → Histórico → Cobertura do banco** usa **acertos consolidados**: questão que já foi errada ou deixada em branco uma vez não volta a ser classificada como acerto consolidado por uma tentativa correta posterior. Além disso, os conjuntos incluíam capítulos `SIM-...` e questões `foraNivel` que devem ficar fora do diagnóstico.

A barra central e o Histórico passaram a usar a mesma fonte `QBTrainingRadial.summary`:
- Incluir só questões reais do banco carregado na conta, exceto capítulos `SIM*` e itens `foraNivel`.
- Contar cada ID uma vez por universo de questões, mesmo quando referenciado por vários assuntos.
- Resposta registrada: `tentativas > 0`.
- Acerto consolidado: `ultimaMarcada === gabarito` **e** `!jaErrou(r)`, sendo `jaErrou(r)=(r.erros>0)||(r.brancos>0)||(r.hist||[]).some(h=>!h.ok)`.
- Em branco: último julgamento B. Os demais itens respondidos não consolidados contam como erros/itens sem consolidação.
- Percentual: `acertos consolidados / respondidas * 100`. A barra divide respondidas em acertos, erros e brancos.
- Sem resposta: fora do denominador, mas ainda incluída no total/cobertura.
- Agrupamento por matéria: capítulo atribuído a seu primeiro tópico, pela menor `ordem` do edital, sem somar a mesma questão em duas matérias.
- Assunto: recorte pelos capítulos efetivamente declarados no tópico do edital.
- **Análise diária**: mantém sua métrica diferente, `C/(C+E)` por tentativa no dia. Isso é precisão diária, não domínio consolidado. Ambas agora são identificadas para evitar comparação indevida.

A tabela de cobertura do **Histórico** foi harmonizada com a mesma fonte compartilhada, inclusive quanto à exclusão de `foraNivel`, mantendo seu layout e demais painéis intactos.

## Menus radializados
Foi criado um componente genérico `QBAreaRadial` com:
- mesmo anel de vidro, fotograma extraído do MP4, paleta e fluxo de filamentos AXON;
- seleção por rótulo ou setor SVG, movimento e convergência de partículas;
- navegação por mouse, toque, setas e Escape;
- paginação com no máximo seis opções por anel e seletor de acesso direto nos assuntos;
- botão **Abrir tela completa**, que retorna à interface original sem perder dados;
- uso do mesmo `QBAxonRingFlow` do Treinar, sem criar um novo contexto WebGL;
- preservação da opção fundo estático e preferência por movimento reduzido.

### Hoje
Menu radial para Planejamento, Revisões vencidas, Flashcards, Treinar, Análise diária e Edital. Tarefas/calendário são abertos na tela `viewPainel` existente e a revisão é iniciada usando `startRevisao()`.

### Edital
Menu por **matéria → assunto → ficha do edital**. A seleção do assunto abre diretamente `viewEdital` com `S.fMat`, `S.abertos` e rolagem/foco no ID `tp-<topicId>`. O mapa de calor, status, percentual, links de materiais, questões e botões de atualização continuam intactos.

### Estudo
Primeira órbita seleciona Mapas 3D, Flashcards, Pegadinhas, Materiais, Aprendizagem ou Revisar hoje. Para as quatro primeiras, a navegação é por **ferramenta → matéria → assunto**:
- Mapa 3D: `S.mapaId` de assunto com mapa cadastrado;
- Flashcards: `S.cartId` de assunto com cartões ou questões vinculadas;
- Pegadinhas: `S.pgModo='top'`, filtro `S.fPgMat`, expansão `pgt:<topicId>` e rolagem para `pg-<topicId>`;
- Materiais: abertura do grupo `ct:<matéria>` e rolagem ao artigo de material contendo o ID do assunto;
- Aprendizagem: módulo real `viewAprendizagem`; revisão: `viewCartoes`.

### Desempenho
Órbita de Análise diária, Histórico, Por matéria, Método e Caderno de erros. O recorte **Por matéria** leva a outro anel com desempenho consolidado por disciplina e abre o histórico original com `S.fEvo`. A Análise diária permanece separada e sem mudança de cálculo.

### Simulado
Órbita com Objetiva, Discursiva, Composição e Histórico. Selecionar Objetiva/Discursiva abre a tela original e desloca até seu botão de início. **Não inicia automaticamente o cronômetro**, nem cria/entrega uma prova. Simulados ativos e telas de correção continuam usando a interface original e não são interrompidos pelo radial.

### Treinar
Seu radial de **matéria → assunto → configurações → questões** continua como antes, agora mostrando os percentuais consistentes com o Histórico. Revisões, Caderno de erros, treino clássico, links e sessões mantidos.

## Fluxos preservados
A barra superior abre as novas entradas radiais. Porém, links diretos de questões, remissões de mapa, botões de outros painéis, URLs antigas (`#mapa`, `#edital`, `#cartoes`), agenda e configurações **continuam abrindo diretamente a tela de destino**, sem serem sequestrados pelo menu de apresentação.

Nenhuma questão, resposta, revisão, simulado, documento, nota, usuário, ID ou consulta de IA foi modificado por essa atualização visual.

## Arquivos
- `public/claude-export/training-radial.js` — percentual consolidado e agrupamento;
- `public/claude-export/area-radial.js` (novo) — núcleo visual e controles compartilhados;
- `public/claude-export/area-radial.css` (novo) — estilos, responsividade e cores;
- `src/components/qb/study-shell.html` — roteamento das cinco áreas e sincronização da tabela de Histórico;
- `tests/training-radial.test.mjs` — testes de regressão adaptados;
- `tests/area-radial-percentage.test.mjs` (novo) — paridade matemática e integração dos menus.

## Limitações verificáveis
Os testes automatizados verificam o código, os destinos, o cálculo e as relações do banco de amostra; **não substituem teste visual e interação em Safari iOS, Chrome e desktop**. Certos assuntos ainda não possuem material, mapa ou perguntas: esses setores são omitidos do filtro correspondente, sem criar vínculos artificiais.
