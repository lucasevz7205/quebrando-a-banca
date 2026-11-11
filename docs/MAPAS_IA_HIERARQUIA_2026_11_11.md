# Importação hierárquica de mapas mentais por IA (11/11/2026)

## Problema identificado
O modal de ingestão de texto de GeminiNotebook/NotebookLM criava mapas com `materialToMindMap` (parsing determinístico simplificado), mesmo com a caixa de mapa marcada. Esse conversor não preservava hierarquia profunda, limitava seções e inventava uma estrutura genérica. O outro caminho de IA (`cornell-to-mindmap`) usava um prompt que forçava de quatro a oito ramos e reescrevia toda a árvore quando a validação detectava poucos ramos. Havia ainda uma referência a `rawX` antes da inicialização no normalizador local, que podia causar `ReferenceError` ao processar nós sem `rotulo`.

## Solução
- `src/lib/mindmap-text-structure.js`: parser determinístico de Markdown e outlines com headings, subtítulos, numeração 1.1/1.1.1, marcadores indentados, campos simples e negritados. Distingue árvores de conceitos das informações que preenchem os campos `n`, `x.e`, `x.ex`, `x.trap` e `x.src`.
- Cada nó recebe ID estável exclusivo e conserva a ordem e a filiação. O usuário pode fornecer qualquer número coerente de ramos (até 32), sem obrigação artificial de criar quatro ou oito.
- `src/lib/omnistudy-ai.js`: a IA recebe nós já definidos, por grupos de até 24, e deve retornar apenas os campos do **mesmo ID**. A mesclagem ignora nós adicionais e possíveis tentativas de mudar títulos, ordem e hierarquia. Referências bibliográficas da IA são usadas apenas se o trecho existir literalmente no texto original. Conteúdos não fundamentados devem ficar vazios.
- Caso a entrada tenha hierarquia informada mas não reconhecida, a operação falha explicitamente e preserva o mapa. Não usa fallback genérico silencioso. Caso o texto exceda 27.000 caracteres ou 150 nós, solicita importação em partes, sem ocultar perda de dados.
- `public/claude-export/mindmap-studio.js`: o modal, agora descrito como importação de texto de Gemini/ChatGPT/Claude/NotebookLM, chama `QBBridge.ask("omniStudyAI",`...) **antes** de persistir as folhas e materiais. Ao obter mapa, apresenta uma **prévia editável** no Estúdio; o mapa anterior permanece até o estudante clicar em **Salvar Mapa Mental**. A opção sem mapa mantém a importação apenas de material e Cornell.
- Corrigida a inicialização `rawX` no normalizador de mapas local.
- `src/lib/mindmap-gan-ai.js`: aumenta teto de 16 para 32 filhos/ramos para evitar perda silenciosa da hierarquia moderadamente ampla.
- Cabeçalho e Service Worker alinham o script do Estúdio na versão `mindmap-studio.js?v=16`. Cache `qb-static-axon-v8` e remoção limitada ao prefixo próprio; não intercepta bundles compilados. Corrigidos também URLs desatualizados da área Omni no precache.
- `tests/mindmap-structured-import.test.mjs`: cobre numeração, nested bullets, campos Markdown em negrito, apenas um ou dois ramos, até 32 raízes, IDs, preservação do mapa anterior, bloqueio de perdas e segurança contra estrutura inventada pela IA.

## Como usar
1. Em **Estudo → Mapas Mentais**, abra **Importar texto de IA ou material hierarquizado**.
2. Informe o tópico do edital e cole o texto em Markdown ou outline. Marque **Mapa Mental AXON**.
3. Clique em **Concluir Ingestão de Subsídio**. A IA interpreta e preenche `rotulo`, `n`, `x.e`, `x.ex`, `x.trap`, `x.src` conforme a evidência do material.
4. Revise os níveis e os campos na prévia. Clique em **Salvar Mapa Mental** para gravar.

## Limites e verificação
As informações fornecidas por outras IAs não são automaticamente verdadeiras ou vigentes, sobretudo artigos legais e jurisprudência. O estudante deve conferir o conteúdo antes de estudar. A estrutura é preservada nos testes automatizados; a chamada real ao modelo remoto pode variar e consome créditos do Base44. Nenhuma conexão Gemini API foi necessária para colar texto gerado por Gemini.
