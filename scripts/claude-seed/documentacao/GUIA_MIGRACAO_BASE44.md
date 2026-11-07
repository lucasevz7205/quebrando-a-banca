# Guia de migração para o Base44

1. **Entidades:** criar uma por coleção (`MODELO_DE_DADOS.md`), com `legacy_id` (texto, único) e os campos de `_schema_inferido.json`. Listas e objetos como JSON.
2. **Importação:** carregar cada `banco_de_dados/<colecao>.json` (array) na entidade, preservando `legacy_id`. Ordem: edital, textos, questoes, revisao, materiais, pontos, pegadinhas, analise, config, depois respostas, rodadas, simulados, cartoes_aval, diario.
3. **Validação:** comparar contagens com `manifest.json`; checar que todo `respostas.qid`, `rodadas.itens[].qid`, `pegadinhas.qids[]` e `questoes.textoId` encontram destino; checar que `cartoes_aval` `<topico>@<i>` aponta para um cartão existente.
4. **Serviços a reimplementar:** (a) camada de dados no lugar de `window.claude.use('db')` (`subscribe`, `enqueue`, `S.db.doc().set/update`); (b) LLM no lugar de `window.claude.use('sample')` (`corrigirIA`, `explicarIA`; ambos esperam JSON); (c) `localStorage` pode continuar.
5. **Interface:** copiar o CSS (`estilos/app.css`) inteiro (tokens de cor em `:root`, tema escuro) e reproduzir cada `view*` como rota. A marcação base das abas está em `estilos/markup_shell.html`.
6. **Regras:** portar as funções puras sem alterar valores (`REGRAS_DE_NEGOCIO.md`).
7. **Permissões:** no original, `questoes` é só leitura para quem não é dono; o resto é do dono.
