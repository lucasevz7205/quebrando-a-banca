# Contas de estudo

## Arquitetura acordada em 8/11/2026

Uma única plataforma Base44 para todos os candidatos; cada login vê somente o conteúdo do seu concurso.

- Compartilhado: código, interface, algoritmos, mecanismo de questões, flashcards e mapas.
- Privado por login: edital, questões, materiais, mapas, flashcards, pegadinhas, respostas, Caderno de Erros, agenda, rodadas e eventos de aprendizagem.
- O login administrador continua no banco legado da Câmara. Cada outro login com papel de usuário comum precisa de um StudyAccount ativo, e os dados são isolados por study_account_id.
- As entidades StudyDocument e StudyDocumentPart restringem leitura e gravação diretas a administradores no Base44. As contas comuns só acessam esses dados pelo servidor autenticado, que valida o ID do usuário.

## Painel para configurar outro candidato

Um administrador entra em **Contas e concursos** pelo menu lateral do laboratório, em /contas. O procedimento é:

1. Cadastre primeiro o novo login no painel de usuários do Base44 como usuário comum (papel user) e copie o ID exato. Não transfira a senha nem dados pessoais do administrador.
2. Crie o vínculo entre esse ID e o nome do novo concurso, com a data da prova se conhecida. Ele começa desativado e vazio.
3. Importe os arquivos JSON por coleção: edital, questoes, revisao (mapas e flashcards), materiais, pontos, pegadinhas, analise e textos.
4. Ative somente depois de importar edital e questões. O usuário então pode entrar no mesmo site e acessar /estudar com suas credenciais.
5. Antes de liberar o novo ambiente, valide com dois logins diferentes que cada um vê apenas seu próprio material, histórico e respostas.

A importação **não copia respostas, históricos nem o Caderno de Erros** de outras contas. IDs existentes são mantidos sem sobrescrita. Para importar novos conteúdos, desative temporariamente o vínculo de destino. Um usuário pode ter mais de um concurso cadastrado, mas no máximo um ativo por vez, preservando os demais históricos.

Os arquivos JSON podem ser vetores de documentos com campo id, objetos com records/documents ou objetos indexados por ID. A primeira versão do mecanismo aceita julgamentos **Certo/Errado**; provas de múltipla escolha precisarão de um formato de questão específico antes da importação.

Validação técnica: 30 testes automatizados e compilação aprovados. Não equivale ainda a um teste real entre dois logins autenticados.


## Cadastrar um concurso para um login

1. No painel do Base44, confirme que o usuário já existe com papel `user` e copie seu identificador. Crie um `StudyAccount` com `user_id`, `exam_name`, `active: false` e, se conhecida, `exam_date` no formato `AAAA-MM-DD`.
2. Prepare o material em lote. Em `StudyDocument`, use o ID retornado do vínculo em `study_account_id`, o nome da coleção em `collection`, a chave original em `legacy_id`, o documento serializado em `payload_json` e uma origem em `source`. Para o conjunto mínimo, use `edital` (matérias e tópicos), `questoes` (itens C/E) e `pegadinhas` (tópicos e questões vinculadas). `analise` é opcional e fornece as classificações e a frequência por mecanismo. Preserve as referências entre os documentos do mesmo concurso.
3. Para documentos grandes no formato do exportador, mantenha a referência `{"_claudeParts":N}` no documento principal. Coloque os fragmentos em `StudyDocumentPart` com o mesmo `study_account_id`, `collection` e `legacy_id`, além de `part` começando em zero e `payload_chunk`. Valide os pares coleção/ID antes de ativar.
4. Ative o vínculo e confira o edital, a sessão de treino e as pegadinhas usando o login autorizado. Mantenha somente um vínculo ativo por usuário. Para trocar o concurso ou o usuário, crie um novo vínculo e desative o anterior. Isso conserva o histórico separado.

O simulador, o laboratório e a IA da preparação original ficam no ambiente legado. As contas novas usam o formato de exercício C/E da interface existente.
