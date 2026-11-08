# Área Fiscal · Suplementos TI · PDFs 3, 6 e 7 · 08/11/2026

## Identidade e isolamento

Estes são **módulos suplementares**, não tarefas oficiais numeradas das trilhas 00–03. Foram inscritos exclusivamente na conta de estudo da Área Fiscal `6af069aa28e43e39f27bd73c`, via `StudyDocument` e `StudyDocumentPart`. A coleção legada da Câmara (`ClaudeDocument`) e as coleções de respostas do usuário não foram alteradas. Não foi criado histórico de tentativas, respostas ou avaliações SRS.

Os módulos estão sob as chaves `fiscal-sup-qualidade`, `fiscal-sup-modelagem-logica` e `fiscal-sup-normalizacao`, com `trilha: SUP`, ordem 1001–1003. A numeração oficial 1–75 permanece intacta. Eles poderão ser associados às futuras tarefas oficiais depois de recebidos os roteiros, mantendo as questões e os IDs existentes sem duplicação.

## Conteúdo e proveniência

| ID do módulo | Fonte | Recorte estudado | Questões C/E autorais | Cartões | Ramos + folhas do mapa |
|---|---|---|---:|---:|---:|
| `fiscal-sup-qualidade` | `3. Qualidade de Dados.pdf` | pp. 3–24: adequação ao uso, dimensões, DMBOK, profiling, matching, deduplicação, enriquecimento, métricas | 24 | 24 | 5 + 24 |
| `fiscal-sup-modelagem-logica` | `6. Análise de Informações - Modelage.pdf` | pp. 57–95: relações, tuplas, atributos, domínio, grau, chaves e mapeamentos 1:1/1:N/N:M | 24 | 24 | 4 + 24 |
| `fiscal-sup-normalizacao` | `7. Análise de Informações - Normaliz.pdf` | pp. 3–64: dependências, 1FN, 2FN, 3FN, FNBC, 4FN, 5FN | 27 | 27 | 7 + 27 |
| **Total** | | | **75** | **75** | **16 + 75 = 91** |

Cada questão traz `id`, `cap`, `capNome`, `gabarito`, `comentario`, `origem` autoral, `ref` com número de página, `assuntoId`, `topico` e `mapaNoId`. Cada flashcard aponta para um nó existente e referencia exatamente uma questão do próprio assunto; cada nó-folha relaciona a questão correspondente. Não há reprodução integral das questões de provas incluídas nas apostilas, nem divulgação dos PDFs no app.

**Arquivos de origem do lote:** `scripts/fiscal/sup-qualidade-dados.seed.json`, `scripts/fiscal/sup-modelagem-logica.seed.json`, `scripts/fiscal/sup-normalizacao.seed.json`. A auditoria reproduzível está em `tests/fiscal-supl-ti-integrity.test.mjs`.

## Aplicação no armazenamento e checagem

- Foram adicionados 75 documentos físicos na coleção `questoes`, 3 em `edital`, 3 em `materiais` e 3 em `revisao` (com dez fragmentos `StudyDocumentPart`).
- A consulta autenticada à Área Fiscal retornou **591 questões únicas**: 516 anteriores intactas e 75 novas.
- `edital` e `revisao` agora apresentam **78 documentos distintos** cada: 75 anteriores e 3 suplementos.
- A hidratação de cada `revisao` pela junção ordenada dos fragmentos foi comprovada, com respectivamente 24/24, 24/24 e 27/27 vínculos válidos cartão → nó.
- A suíte específica e as verificações dos lotes anteriores produziram 16/16 testes aprovados no recorte inicial.
- Os totais derivados dos inventários anteriores, sujeitos à recontagem global completa, são 682 flashcards (607 + 75), 876 nós (785 + 91) e 574 vínculos explícitos (499 + 75). As **21/75 tarefas oficiais** anteriormente ampliadas continuam no mesmo status. Os 3 suplementos são adicionais, não transformam o denominador das trilhas oficiais.

## Situação editorial

**Cobertura estrutural e vínculos técnicos conferidos; homologação pedagógica pendente.** A revisão pedagógica deve checar a precisão conceitual de cada gabarito, a página da fonte, a sutileza e a ausência de ambiguidade do enunciado, e a adequação à cobrança CEBRASPE. Não confundir rótulo de incidência em apostila com estimativa estatística a partir de amostra oficial de provas.

Futura importação das trilhas 04+ requer vincular módulos ao plano oficial por assunto, não simplesmente renomear ou duplicar exercícios.
