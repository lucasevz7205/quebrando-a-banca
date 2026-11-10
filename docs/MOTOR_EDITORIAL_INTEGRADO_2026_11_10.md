# Motor editorial integrado — Quebrando a Banca

**Data:** 10/11/2026  
**Protocolo:** `qb-editorial-3.0` para mapa, revisão e flashcards, com **`cebraspe-3.0` opt-in** para questões ligadas a um nó.  
**Estado:** código implementado, testes aprovados; conteúdo já existente preservado.

## 1. Ponto de partida verificado

- `src/data/rf-questoes-revisao-2026-11-10.json`: **160 questões inéditas**, exatamente 20 em cada tópico `rf-2-1` a `rf-2-8`, 80 C e 80 E, 160 IDs exclusivos, 160 relações a nós reais dos mapas.
- `scripts/rf-reformulacao/depois-2026-11-10.json`: **8 revisões, 139 nós, 139 flashcards**, com as explicações `x.e`, exemplos `x.ex`, armadilhas `x.trap`, fontes `x.src`.
- Todos os 160 itens permanecem `statusEditorial: aguardando-revisao-humana`. **Nenhuma questão foi inserida ou republicada no treino**, nem foi feita nova chamada de IA.
- Salvo antes da edição: **checkpoint `6af35e2525e6d923fced4cee`**.

## 2. Motor reutilizável `src/lib/editorial-engine.js`

### Identidade e conexões
- Os quatro produtos compartilham `topicId`; cada cartão e questão possui `mapaNoId` específico e real.
- `enumerateNodes(map)` percorre árvore e encontra caminhos e IDs duplicados.
- `auditEditorialBundle(revision, questions)` impede ou sinaliza:
  - revisão sem ID ou título e mapa ausente;
  - nós sem ID, título, explicação, exemplo, armadilha ou referência;
  - flashcard sem pergunta-resposta, fonte ou vínculo real;
  - itens sem gabarito C/E, F/V incompatível, conceito-contexto-relação, correção mínima, pergunta preventiva, evidência literal, trecho decisivo ou ID de nó;
  - duplicidades de IDs, enunciados, perguntas, fórmulas repetitivas e baixa diversidade cognitiva;
  - derivação de fonte secundária, ausência de revisão cega independente e falta de parecer humano;
  - equilíbrio 50/50 no lote como **alerta editorial**, jamais regra oficial da banca.
- `auditEditorialCollection` agrega a análise por assunto.
- `canPublish` só pode ser verdadeiro depois de ausência de bloqueios, fontes explicitamente conferidas, revisão cega sem pendência e quatro confirmações humanas. A mera presença de uma citação **não prova a autenticidade nem a atualização**.

### Criação / aperfeiçoamento
- `buildEditorialPrompts` constrói **cinco instruções de trabalho** a partir de um trecho de fonte verificável:
  1. revisão conceitual contextualizada, com distinções, limites e aplicações;
  2. mapa mental AXON profundo, ramificações com IDs estáveis, explicação, exemplo, armadilha e fonte;
  3. flashcards de recuperação ativa vinculados aos IDs;
  4. até 20 questões inéditas por assunto, em lotes de até cinco, C/E, conceito-contexto-relação, taxonomia F1–F10 e V1–V4, revisão cega e correção mínima;
  5. parecer de auditoria de fontes, gabaritos, ambiguidade, lacunas, duplicidades e remissões.
- Um prompt é instrução e **não gera nem aprova conteúdo sozinho**. Sem fonte suficiente o criador deve declarar lacuna, não completar o lote por invenção.

## 3. Integração nativa à interface

- **`src/components/qb/EditorialQualityStudio.jsx`** dentro de **Laboratório de Questões** (`/questoes`):
  - auditoria integral das oito unidades;
  - indicadores e alertas agrupados por categoria;
  - exportação do parecer em JSON;
  - construção/copiar/exportar instruções editoriais para os quatro produtos e sua auditoria;
  - fonte, localização e trecho de origem obrigatórios; sem consulta automática a links;
  - nenhum clique nesse painel dispara IA, cobra créditos, grava registros ou publica questões.
- **`src/components/qb/editorial-quality.css`** mantém um painel independente, responsivo e acessível.

## 4. Geração futura de questões integrada ao protocolo estrito

- A interface existente de **Criação de questões · C/E** aceita opcionalmente o par `topicoId + mapaNoId`.
- `src/lib/question-authoring.js`: valida a presença simultânea dos IDs e impede que a IA mude arbitrariamente o nó solicitado. Mantém geração de 1–20 itens em lotes de cinco e revisão cega.
- `src/lib/question-authoring-server.js`: se houver par tópico/nó, os novos rascunhos passam a usar **`cebraspe-3.0`** e mantêm seus IDs; sem par, o modo `cebraspe-2.0` permanece compatível.
- `src/lib/question-editorial-gate.js`: importação do 3.0 requer, além das verificações estruturais anteriores, revisão independente com gabarito concordante e `revisaoHumana` contendo `responsavel`, `data`, `parecer`, `fonteConferida=true`, `gabaritoConferido=true`, `univocidadeConferida=true`, `remissaoConferida=true`. Referência apenas a “revisão pedagógica” não comprova fonte primária.
- O protocolo **2.0 dos 160 rascunhos antigos não foi convertido retroativamente**; a importação legada mantém as regras existentes. Esta decisão preserva o histórico editorial e evita bloqueios retrospectivos artificiais.
- A confirmação de `mapaNoId` no formulário é declaração **não** verificação automática de existência no banco: o profissional responsável deve conferir a remissão ao mapa verdadeiro antes da aprovação.

## 5. Resultados da auditoria da amostra

- **0 bloqueios estruturais, 496 avisos editoriais** nos oito assuntos; os avisos são sobretudo individualizados por questão e podem se repetir por assunto (fonte secundária, ausência de revisão cega, revisão humana pendente).
- **Nenhum dos 160 itens fica automaticamente aprovado.** Não é evidência de correção dos 160 gabaritos ou de leitura integral dos PDFs originais.
- Qualidade e proximidade com CEBRASPE exigem corpus oficial, gabaritos confirmados, análise cega e comparação empírica; o protocolo não altera os pesos de um modelo nem certifica psicometria.
- Referências editoriais internas: `docs/PROTOCOLO_EDITORIAL_CEBRASPE.md`, incluindo fontes originais dos cadernos Câmara 2025 e página institucional do CEBRASPE.

## 6. Garantias de integridade e testes

- Novo: `tests/editorial-engine.test.mjs`, cobre amostra completa, nós/cartões/questões, ligação por ID, F/V, evidências, duplicatas, prompts, qualidade do conteúdo, revisão humana e compatibilidade retroativa.
- Suíte geral: **187 testes aprovados**, build de produção **aprovado**.
- `npx eslint` nos arquivos de código novos/modificados passou; o comando `npm run lint` do repositório integral reporta débitos preexistentes em outros arquivos, não solucionados neste escopo.
- A inspeção visual em navegador real e os testes com conta autenticada continuam recomendados após a publicação.
