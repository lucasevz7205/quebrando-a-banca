# Arquitetura do Quebrando a Banca (estado em 07/11/2026)

## Origem
Página única publicada como artefato do claude.ai (versão 1794052457-12b5). Todo o app é **um arquivo HTML** (`codigo_fonte/original/index.html`, 222.646 bytes, 2.338 linhas): marcação, CSS e JavaScript puro. **Não há React, TypeScript, build, roteador nem dependências npm.** Os arquivos de `codigo_fonte/estilos/app.css`, `codigo_fonte/servicos/app.js` e `codigo_fonte/estilos/markup_shell.html` são **extrações literais** do original para facilitar a leitura e a adaptação; o original é a referência.

## Componentes do runtime
- **Estado global:** objeto `S` (mapas em memória de cada coleção, aba atual, rodada em andamento, filtros).
- **Renderização:** `render()` monta `main.innerHTML` a partir de funções `view*` (23 views: viewSetup, viewItem, viewFim, viewCaderno, viewEvolucao, viewHistorico, viewPainel, viewEdital, viewCmix, viewCartoes, viewRevisao, viewMapa, viewMecanismos, viewPegadinhas, viewPegadinhasTopicos, viewConteudo, viewPontos, viewMetodo, viewSimulado, viewSimObj, viewSimObjRes, viewSimDisc, viewSimDiscRes); `wire()` liga os eventos depois de cada render.
- **Navegação:** 6 abas (Hoje/painel, Edital, Treinar, Estudo, Simulado, Desempenho) + subabas (`PAI`, `SUBS`); rota em `location.hash` (`VIEWS`).
- **Persistência:** `window.claude.use('db')` (banco de documentos do artefato, API estilo Firestore: `collection().onSnapshot()`, `orderBy().limit()`, `doc(path).set/update`). Escrita serial em `enqueue()`.
- **IA:** `window.claude.use('sample')` (modelo do claude.ai na conta do usuário) para corrigir respostas escritas e explicar cartões. Sem chave de API.
- **Armazenamento local:** `localStorage` só para tema (`qb-tema`) e simulado em andamento (`simLS`).
- **Funções JS:** 151 funções nomeadas; constantes de regra: S, VIEWS, LETRA, CONF, PROVA, LIMITE, INT, ORIGENS, LIMITE_DIA, TRAVAS, PAI, SUBS, MESES, ST, ST_ORD, MTIPO, PROVAS, RETENCAO, RANK, NIVEIS, AVAL, AVAL_ANT, FIRME, NOVOS_DIA, _STOP, PG_TIPO, MEC, MEC_ORD, SIG_MAT, PG_ORIG, JUST_MIN, SIM_DEF, SIM_DISC, SIM_MAPA.

## Dependências externas
- Google Fonts: Archivo, IBM Plex Mono, Source Serif 4 (só aparência).
- Runtime do claude.ai: capacidades `db` (regra: `questoes` leitura view, escrita admin) e `sample`. **No Base44 essas duas precisam ser substituídas** (entidades do Base44 e um serviço de LLM próprio).

## Para o Base44 (React 19 + TanStack Start)
Mapeamento sugerido: cada `view*` vira uma rota/arquivo (`routes/hoje.jsx`, `routes/edital.jsx`, ...); `S` vira estado/queries; `subscribe()` vira queries às entidades; `enqueue()` vira mutações. As regras (funções puras como `proxDe`, `agendar`, `srsCalc`, `devidas`, `filaMix`, `jaErrou`, `teto`) podem ser copiadas quase sem mudança para `lib/regras.js`.
