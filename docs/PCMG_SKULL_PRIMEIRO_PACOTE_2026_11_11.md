# PCMG · Primeiro pacote de estudo de Skull

**Data:** 11/11/2026  
**Conta de destino:** PCMG, cadastro ativo do candidato Skull.  
**Fonte recebida:** `PCMG - Copia.zip`, 24 PDFs (23 apostilas e Edital nº 04/2024 — Investigador de Polícia I).  
**Checkpoint de segurança anterior:** `6af431fba456525412d910e0`.

## Conteúdo autoral efetivamente publicado no banco

**6 assuntos**, cada um com 1 revisão, 1 mapa de 6 nós, 12 flashcards e 8 questões inéditas FGV de 5 alternativas. Totais: **6 revisões, 6 mapas, 36 nós enriquecidos, 72 flashcards e 48 questões**.

| Identificador | Conteúdo | Origem no ZIP | Páginas da apostila |
|---|---|---|---|
| `pcmg-cf-conceito` | Conceito, sentidos e eficácia da Constituição | Teoria da Constituição | 2–4, 9, 28–32 |
| `pcmg-cf-art1` | Fundamentos da República e exercício popular do poder | Princípios Fundamentais da Constituição, arts. 1º a 4º | 3–5, 10–13 |
| `pcmg-cf-art2` | Separação, independência, harmonia e funções dos Poderes | Princípios Fundamentais da Constituição | 28–35 |
| `pcmg-cf-art3` | Objetivos fundamentais e sua eficácia | Princípios Fundamentais da Constituição | 36–43 |
| `pcmg-cf-art4` | Princípios das relações internacionais | Princípios Fundamentais da Constituição | 44–48 |
| `pcmg-crim-intro` | Criminologia: conceito, método, objetos e controle social | Criminologia — Conceito, Método, Objeto e Finalidade | 2–3, 8–10 |

Fontes jurídicas complementares: texto atualizado da Constituição Federal, disponível no Senado Federal (`https://www25.senado.leg.br/web/atividade/legislacao/constituicao-federal`). O edital de 2024 orienta a taxonomia; a legislação deve ser revisitada para versões posteriores.

## Estrutura de importação

Cada assunto tem:
- 1 documento `StudyDocument/edital`, com `sigla`, `materia`, `ordem`, `num`, `caps` específicos e referência ao edital;
- 1 documento `StudyDocument/revisao`, com `resumo` original, `mapa.centro`, `mapa.ramos`, e `cartoes` vinculados a IDs dos nós;
- 8 documentos `StudyDocument/questoes`, cada um com 5 alternativas, gabarito, justificativa, ID do tópico, capítulo e `mapaNoId`;
- 1 documento `StudyDocument/materiais`, com referências à fonte (sem redistribuir PDF licenciado).

Fragmentação conforme a ponte Base44: 12 partes em `StudyDocumentPart`, reagrupadas por `_claudeParts`; todos os fragmentos foram verificados e parseados do banco de produção.

**Atenção editorial:** as 48 questões são originais de prática inspirada no formato FGV, **não** itens oficiais. Permanecem `statusEditorial: aguardando-revisao-humana`; os gabaritos são propostos, com aviso visível no Treinar. Nenhuma transcrição extensa de apostila, marca de licenciamento ou número de CPF foi copiada para as entidades. O material não recebeu auditoria substantiva humana.

## Auditoria e integridade

Novo módulo `src/lib/fgv-editorial.js`: auditoria de 5 alternativas A–E, gabarito dentro das opções, conteúdo, referência, IDs únicos, capítulo, assunto, nós e flashcards. Mantém o auditor CEBRASPE intacto, pois o edital PCMG usa FGV múltipla escolha.

Nova suíte `tests/pcmg-first-materials.test.mjs`: 6 tópicos, 48 perguntas com remissões exatas, 72 cartões, 36 nós, deduplicação, confidencialidade e detecção de falhas estruturais.

Conferência das entidades do Base44: **66 documentos**, **12 partes**, **0 partes ausentes**, **0 questões com alternativas/gabaritos inválidos**, **0 links quebrados**, **48 status pendentes**, login PCMG ativo. Nenhuma resposta ou histórico de outro concurso foi alterado.

Suíte geral: **223 testes PASS, 0 FAIL**, build e lint dos arquivos novos aprovados.

## Escopo pendente

O ZIP contém materiais adicionais de Português, Raciocínio Lógico, Informática, Lei Orgânica, Constitucional (art. 5º), Penal, Processo Penal, Direitos Humanos, Medicina Legal, Legislação Penal e temas complementares de Criminologia. Ainda não foram convertidos neste primeiro lote. A existência de apostila parcial não comprova cobertura integral do edital.

A navegação para a conta ativa é `/estudar`. Um navegador autenticado como Skull deve mostrar esses seis tópicos em Edital e permitir treino por assunto. Não houve sessão de QA visual autenticada; os testes confirmam a estrutura e os registros, não as interações finais no dispositivo.
