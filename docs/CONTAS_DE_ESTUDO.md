# Contas de estudo

A conta administradora continua usando o ambiente original da Câmara. Os demais logins precisam de um vínculo ativo em `StudyAccount`. Cada vínculo carrega seu próprio edital, banco de questões, pegadinhas e progresso.

## Cadastrar um concurso para um login

1. No painel do Base44, confirme que o usuário já existe com papel `user` e copie seu identificador. Crie um `StudyAccount` com `user_id`, `exam_name`, `active: false` e, se conhecida, `exam_date` no formato `AAAA-MM-DD`.
2. Prepare o material em lote. Em `StudyDocument`, use o ID retornado do vínculo em `study_account_id`, o nome da coleção em `collection`, a chave original em `legacy_id`, o documento serializado em `payload_json` e uma origem em `source`. Para o conjunto mínimo, use `edital` (matérias e tópicos), `questoes` (itens C/E) e `pegadinhas` (tópicos e questões vinculadas). `analise` é opcional e fornece as classificações e a frequência por mecanismo. Preserve as referências entre os documentos do mesmo concurso.
3. Para documentos grandes no formato do exportador, mantenha a referência `{"_claudeParts":N}` no documento principal. Coloque os fragmentos em `StudyDocumentPart` com o mesmo `study_account_id`, `collection` e `legacy_id`, além de `part` começando em zero e `payload_chunk`. Valide os pares coleção/ID antes de ativar.
4. Ative o vínculo e confira o edital, a sessão de treino e as pegadinhas usando o login autorizado. Mantenha somente um vínculo ativo por usuário. Para trocar o concurso ou o usuário, crie um novo vínculo e desative o anterior. Isso conserva o histórico separado.

O simulador, o laboratório e a IA da preparação original ficam no ambiente legado. As contas novas usam o formato de exercício C/E da interface existente.
