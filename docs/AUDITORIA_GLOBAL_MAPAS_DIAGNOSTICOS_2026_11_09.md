# Auditoria global dos mapas diagnósticos · 09/11/2026

## Escopo executado

A integração de desempenho por nó e por ligação hierárquica do mapa 3D, inicialmente validada em **Coesão Textual**, foi expandida para **todos os mapas existentes** que o ambiente de estudo disponibiliza ao usuário autenticado.

Foram encontrados **29 mapas estruturados** no snapshot local de uma conta pessoal da Câmara, dentro de **167 tópicos do edital** cadastrados. Os outros tópicos ainda não têm mapas existentes nesse snapshot; não foram inventadas árvores novas.

O ambiente da Área Fiscal é separado: foram encontrados **78 tópicos de estudo** (75 tarefas oficiais e três suplementos) e **591 questões**. As **16 sementes de conteúdo fiscal detalhado** presentes no projeto já possuem links explícitos por IDs, todos preservados e validados na suíte. Os demais registros fiscais, incluindo mapas simplificados e materiais em partes, usam o mesmo motor diagnóstico com evidências por conta autenticada, sem copiar dados entre as contas.

## Resultado da associação no acervo existente da Câmara

A tabela abaixo é um **retrato do snapshot de conteúdo incluído no repositório**, não uma nota fixa do usuário nem uma contagem em tempo real. Respostas, desempenho e cores continuam sendo consultados no banco da conta durante o uso do aplicativo.

| Mapa / tópico | Questões vinculadas / elegíveis ao assunto | Flashcards vinculados / existentes |
|---|---:|---:|
| cp-9 · Teoria do Estado | 32 / 48 | 24 / 38 |
| da-10-1 · Licitação pública | 27 / 48 | 10 / 16 |
| da-10-2 · Contratos administrativos | 6 / 30 | 9 / 13 |
| da-10-3 · Características contratuais | 11 / 26 | 4 / 10 |
| da-10-4 · Formalização e fiscalização de contratos | 5 / 30 | 3 / 8 |
| da-10-5 · Planejamento e fiscalização contratual | 7 / 20 | 4 / 6 |
| da-10-6 · Fiscalizador do contrato | 7 / 22 | 1 / 5 |
| da-10-7 · ETP e TR | 7 / 21 | 1 / 6 |
| da-8-4 · Valor público | 10 / 27 | 6 / 14 |
| dc-2e · Direitos políticos | 36 / 37 | 26 / 27 |
| dc-2f · Partidos políticos | 15 / 21 | 14 / 16 |
| dc-7-3 · RICD: deputados | 24 / 33 | 21 / 24 |
| dc-7-4 · RICD: economia interna | 11 / 19 | 14 / 17 |
| jur-1 · Jurisprudência legislativa | 1 / 20 | 14 / 14 |
| lp-4-1 · Coesão Textual | **67 / 67** | **39 / 39** |
| pl-2-1 · RICD: comissões e proposições | 20 / 47 | 15 / 35 |
| rf-1-2 · ASR end-to-end | 8 / 20 | 10 / 23 |
| rf-1-4 · Diarização | 12 / 20 | 9 / 16 |
| rf-1-5 · Pontuação e capitalização | 11 / 20 | 5 / 12 |
| rf-1-6 · ASR em português brasileiro | 11 / 20 | 4 / 11 |
| rf-1-7 · Transcrição em tempo real | 18 / 20 | 8 / 13 |
| rf-1-8 · APIs e ferramentas ASR | 11 / 20 | 5 / 15 |
| ti-1-4 · OneDrive | 24 / 30 | 17 / 19 |
| ti-1 · Office 365 | 37 / 44 | 31 / 36 |
| ti-2 · Redes de computadores | 34 / 44 | 35 / 39 |
| ti-4-1 · Malware e backup | 20 / 23 | 3 / 18 |
| ti-4-2 · Programas de proteção | 16 / 21 | 9 / 9 |
| ti-4-3 · Phishing e pharming | 16 / 21 | 6 / 9 |
| ti-4 · Segurança e governança digital | 18 / 25 | 14 / 19 |
| **Total de associações tópico–item** | **522 / 844** | **361 / 527** |

**Pendências por falta de correspondência segura:** 322 vínculos tópico–questão e 166 vínculos tópico–flashcard. Os 844 vínculos elegíveis são *associações ao nível de mapa/tópico*, podendo conter questões reaproveitadas entre capítulos relacionados; **não são 844 questões distintas**.

## Metodologia e comportamento

1. Vínculos editoriais explícitos por `question.mapaNoId`, `node.x.questaoIds`, `card.mapaNoId` ou `card.mapaPath` têm prioridade e são preservados.
2. Coesão Textual mantém a associação individual previamente revisada, de 67 questões e 39 flashcards.
3. O resolvedor global `public/claude-export/map-global-links.js` faz associações conservadoras quando o **rótulo de conceito é exato e único**, quando o tópico aparece em seu título sem ambiguidade ou quando há citação textual distintiva e inequívoca do conceito. Não basta compartilhar capítulo, palavra vaga ou similaridade estatística.
4. Questões e cartões não vinculados permanecem pendentes; não se atribui seu desempenho a um subramo por aproximação.
5. O motor `QBMapMastery.build` soma IDs distintos por ramo e descendência, mantendo separadas as métricas de questões, histórico de erros e lembrança de flashcards.
6. O nó **central** recebe o resultado **geral do assunto no edital**, explicitamente identificado como agregado; os demais nós só recebem indicadores de suas próprias evidências, e cada ligação hierárquica recebe cor do subramo de destino.
7. A interface apresenta contagem de vínculos por mapa, de modo que a ausência de mapeamento fique visível.
8. O botão de treino de cada ramo usa exatamente os mesmos IDs associados visualmente ao ramo.
9. Nada foi escrito nas coleções de questões, respostas, avaliações, flashcards ou outros dados persistidos; o resolvedor roda na memória do navegador com os dados autorizados da conta ativa.

**Importante:** correspondência textual inequívoca é uma triagem conservadora, mas não equivale à homologação pedagógica individual de cada relação. Os vínculos pendentes requerem revisão editorial antes da atribuição de diagnóstico.

## Arquivos atualizados

- `public/claude-export/map-global-links.js`: resolvedor global sem gravação.
- `src/components/qb/study-shell.html`: aplicação do resolvedor a todos os mapas e rodadas de reforço; contagem de cobertura; metadados do centro.
- `src/components/qb/mind-map/layout.js`: desempenho agregado e rótulo no nó central.
- `public/claude-export/map-evidence.css`: apresentação da auditoria de cobertura.
- `tests/global-map-coverage.test.mjs`: testes de integração dos 29 mapas e das 16 bases fiscais completas.
- `tests/cohesion-evidence-map.test.mjs`: ajuste do teste para o resolvedor compartilhado.

## Situação

**Integração transversal implementada para mapas existentes**, mas **vinculação conceitual não concluída integralmente**: 322 correspondências de questões e 166 de cartões da Câmara permanecem pendentes, além das tarefas do edital ainda sem mapa próprio. Prioridade editorial futura: contratos administrativos, jurisprudência legislativa e RICD, onde há maiores lacunas entre conteúdo e nós existentes.
