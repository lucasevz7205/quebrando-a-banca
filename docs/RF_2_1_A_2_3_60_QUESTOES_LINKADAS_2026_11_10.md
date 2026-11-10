# Reconhecimento de Fala: 60 questões disponíveis em 2.1–2.3

**Data:** 10 de novembro de 2026  
**Escopo EXCLUSIVO:** `rf-2-1`, `rf-2-2`, `rf-2-3`.  
**Pausa exigida:** não integrar `rf-2-4` até `rf-2-8` sem nova autorização.

## Objetivo
Disponibilizar imediatamente ao estudante as 60 questões C/E já existentes no Laboratório e ligar seu uso às seções do edital, Treinar, Revisão por questão, Flashcards e nós conceituais dos mapas 3D, evitando duplicatas.

## Dados do Base44

### ClaudeDocument/questoes
Foram criados **60 documentos independentes**, 20 por tópico:
- 2.1: 20 registros `RF-2.1-Rxx`, capítulo `RF-2.1`;
- 2.2: 20 registros `RF-2.2-Rxx`, capítulo `RF-2.2`;
- 2.3: 20 registros `RF-2.3-Rxx`, capítulo `RF-2.3`.

Cada documento foi reproduzido do original `src/data/rf-questoes-revisao-2026-11-10.json` e recebeu:
- `faseTreino: "rascunho-pedagogico"`;
- `avisoEditorial: "Questão inédita de prática; gabarito e fonte ainda aguardam conferência humana; não é item oficial do CEBRASPE."`;
- `statusEditorial: "aguardando-revisao-humana"` **sem alteração**;
- `topico`, `cap`, `mapaNoId`, `enunciado`, `gabarito`, `comentario`, `fonte` e demais metadados preservados.

Os registros não foram importados como questões oficiais validadas pelo laboratório e a revisão editorial segue pendente. O usuário autorizou explicitamente disponibilização para treino, sem confundir essa autorização com homologação do gabarito.

### ClaudeDocument/edital
Atualizados SOMENTE os campos `caps` de três documentos (demais campos preservados):
- `rf-2-1`: `["RF-2.1"]`;
- `rf-2-2`: `["RF-2.2"]`;
- `rf-2-3`: `["RF-2.3"]`.

O índice de associação existente `QBQuestionLinks` considera esses capítulos, e o decorador `QBEditorialCoverage` verifica os `mapaNoId` explícitos para remissão exata. Nenhum recurso foi duplicado.

A leitura de retorno do banco confirmou **60 questões, 20/20/20**, status pendente e capítulos associados. `rf-2-4` permanece com `caps: []`; nada foi alterado nos tópicos 2.4–2.8.

### Backup de dados
Os documentos originais do edital (antes da atualização) foram preservados em:
`scripts/rf-reformulacao/edital-2.1-2.3-backup-antes-link-2026-11-10.json`.

**IMPORTANTE:** checkpoints Base44 versionam o código e NÃO revertam automaticamente gravações das entidades. Para restaurar os três documentos do edital, comparar estados antes e depois e usar os `payload_json` originais deste backup; para desfazer a disponibilização das questões, reconciliação de IDs é necessária e deve preservar respostas já geradas. Não remover questões que tenham histórico de estudo.

## Interface e correção
- `src/components/qb/study-shell.html`: exibe aviso de **gabarito provisório** na configuração da rodada e na questão aberta.
- `public/claude-export/question-links.js`: o flashcard derivado usa "Gabarito proposto, ainda sem revisão humana", não "Gabarito oficial".
- `public/claude-export/rf-study-drafts.css`: estilo acessível e discreto para esse aviso.
- Continua possível julgar C/E, salvar resposta, confiança, repescagem, Caderno de erros, revisão espaçada, abrir a questão no mapa 3D e voltar à questão. O histórico usa os mesmos IDs originais.

## Validação
`tests/rf-2-1-2-3-linked-study.test.mjs`: assegura 60 IDs exclusivos, 20 por tópico, capítulos corretos, 60 remissões 3D por ID de nó, conteúdo de treino e alerta de gabarito provisório.  
Suíte completa **191 PASS, 0 FAIL**. `npm run build` com exit code 0.

Inspeção visual interativa em navegador real ainda não foi realizada. Nenhuma fonte primária foi reaberta para verificar os 60 gabaritos. Todas as questões continuam pendentes de revisão humana. A integração dos tópicos seguintes está explicitamente suspensa.
