# Modelo de dados

Cada arquivo em `banco_de_dados/` é um array de documentos `{id, ...campos}` de uma coleção. Tipos inferidos em `banco_de_dados/_schema_inferido.json` (tipo de cada campo e em quantos documentos aparece). Versões internas dos documentos não foram exportadas.

| Coleção / entidade | Docs | Chave | Papel |
|---|---|---|---|
| `questoes` | 1812 | `id` | Banco de itens C/E (enunciado, gabarito, comentário, ref, cap, tema, origem, mecanismo...) |
| `respostas` | 964 | `id` | Estado do estudante por questão (id = id da questão). Histórico, confiança, nível, próxima revisão, caderno de erros |
| `rodadas` | 78 | `id` | Sessões de treino/revisão com itens marcados |
| `simulados` | 1 | `id` | Simulados entregues (objetivo/discursivo) |
| `cartoes_aval` | 327 | `id` | Avaliação de cada cartão de revisão ativa (id = `<revisao>@<índice>`), SRS |
| `revisao` | 55 | `id` | Por tópico: mapa mental (`mapa`), cartões (`cartoes`), itens detalhados, fontes |
| `edital` | 167 | `id` | Tópicos do edital (cargo 11) com `caps` ligados e status |
| `materiais` | 45 | `id` | Mapas, materiais e fontes ligados a tópicos |
| `pontos` | 12 | `id` | Pontos-chave por tópico |
| `textos` | 6 | `id` | Textos de apoio de itens (`questoes.textoId`) |
| `pegadinhas` | 186 | `id` | Armadilhas registradas por tópico, com `qids` |
| `analise` | 7 | `id` | Análises por prova Cebraspe 2026 (itens com mecanismo), CONTROLE, ranking, incidência |
| `config` | 3 | `id` | Configurações (simulado, Tutory, vigia de pegadinhas) |
| `diario` | 92 | `id` | Registro de sessões e próximo passo |

## Relacionamentos
- `respostas.id` = `respostas.qid` → `questoes.id` (1:1).
- `rodadas.itens[].qid` e `simulados.itens[].qid` → `questoes.id`.
- `questoes.cap` → `edital.caps[]` (N:N; o tópico liga capítulos).
- `questoes.textoId` → `textos.id`. `questoes.copiaDe` → `questoes.id` (cópias do simulado SIM-01, sinalizadas como duplicatas).
- `revisao.id` = `edital.id` (tópico). `cartoes_aval.id` = `<revisao.id>@<índice em revisao.cartoes>` (depende da ordem do array: não reordenar cartões na migração).
- `pontos.id`/`pontos.topico`, `pegadinhas.topico`, `materiais.topicos[]`, `diario.topicos[]` → `edital.id`. `pegadinhas.qids[]` → `questoes.id`.
- `analise/<prova>.itens[].item` (número na prova) e `analise/CONTROLE.itens[].item` (= `questoes.id`); `analise/ranking` é calculado a partir de CD26-NS-CG, CD26-PLF-CG, CD26-PLF-CE, CD26-TEC-CE e CONTROLE (461 itens válidos).
- Mecanismos `F1`–`F10`, `V1`–`V4`: legenda na constante `MEC` do código.

## Para o Base44
Uma entidade por coleção, preservando `id` como campo próprio (ex.: `legacy_id`) para manter as referências. Campos `list`/`dict` como JSON. `revisao.mapa` é uma árvore recursiva (`t, n, x{e,ex,trap,src}, f[], id, cor, tabela, caixa`), formato descrito em `recursos/regras_do_projeto/claude__Modelo_Mapa_Mental.md`.
