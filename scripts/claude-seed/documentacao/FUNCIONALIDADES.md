# Funcionalidades

## Implementadas (no código e com dados)
- Hoje: anéis de meta, revisões do dia, cartões do dia, memória por intervalo, constância (calendário e nível), linha do tempo até a prova, mapa de calor por tópico.
- Edital: tópicos por prova/matéria, status automático ou fixado, ligação com Tutory, atalhos para mapa, revisão ativa, treino e pegadinhas.
- Treinar: rodadas por capítulo (novos, todos, caderno), revisão espaçada intercalada, confiança, justificativa, correção "Como ficaria certo?", repescagem, caderno de erros agrupado por matéria e assunto.
- Estudo: revisão ativa (cartões por tema, sessão intercalada, SRS), mapa mental interativo (evocar antes de ler, explicações, tabelas, ligações), pegadinhas (por mecanismo e por tópico, treino), conteúdo/pontos-chave.
- Simulado: objetivo e discursivo, com resultado e classificação de erros.
- Desempenho: evolução, calibração, agenda, histórico de rodadas, método.
- Tema claro/escuro/automático.

## Parcialmente implementadas
- Correção por IA da resposta escrita e "Explicar com IA" nos cartões: código pronto, dependem do runtime `sample` do claude.ai e **não foram testados com a conta real**.
- "Ver no mapa mental" a partir do cartão: escolhe o nó por palavras em comum (heurística).
- "Ver explicação" do cartão: depende de um campo `ex` que nenhum cartão tem ainda.

## Apenas planejadas (citadas nos documentos, sem código na página)
- Coleção `discursivas` (registro de correções de discursiva): descrita em `Discursiva_Metodo.md`; a página não a lê nem grava.
- Ver `PENDENCIAS.md`.
