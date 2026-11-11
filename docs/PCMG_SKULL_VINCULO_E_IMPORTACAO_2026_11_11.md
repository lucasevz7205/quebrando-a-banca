# PCMG e perfil Skull — correção de acesso, importação e treino

**Data:** 11/11/2026
**Aplicativo:** Quebrando a Banca
**Checkpoint de segurança antes da mudança:** `6af4237f6dfd483a03c9a16d`.

## Diagnóstico confirmado nos dados

Um único login de candidato possuía três vínculos:
- `Projeto de Estudos · Skull`: inativo;
- `PCMG`: inativo, sem qualquer material de edital ou questões;
- `Polícia Civil MG`: solicitação pendente e duplicada, também vazia.

O login da PCMG **já era o mesmo do Skull**, mas o acesso estava inativo. A condição de ativação exigia edital e questões gravados, impedindo acesso. O módulo de importação também exigia desativar a conta para adicionar conteúdo, e o importador aceitava somente C/E.

A auditoria das entidades `StudyDocument`, `StudyDocumentPart`, `Question`, `ClaudeDocument` e da biblioteca de assets do aplicativo não encontrou nenhuma questão PCMG gravada para esse login. A busca nos arquivos do projeto e na Biblioteca de arquivos não localizou o lote correspondente. Portanto, **não é correto afirmar que as questões já foram recuperadas**.

## Operações efetivas de conta (sem transferir dados)
- O registro `PCMG` foi **ativado** com seu `user_id` de candidato original, que é também o usuário vinculado ao projeto Skull.
- A solicitação duplicada `Polícia Civil MG` foi encerrada com `access_pending=false`, sem exclusão.
- O projeto antigo `Projeto de Estudos · Skull` continua inativo e intacto, para evitar dois projetos ativos no mesmo login.
- A conta de Área Fiscal de outro candidato e o ambiente do administrador ficaram inalterados.

## Correções no código

1. `src/lib/study-provisioning.js`: função `canEnableStudyAccount` permite ativar explicitamente um ambiente vazio sem alterar o padrão que exige edital e questões para ativação normal. A validação de importação passa a aceitar C/E ou múltipla escolha A–E com 4 ou 5 alternativas completas e gabarito presente entre elas.
2. `src/lib/study-admin.js`: a ativação recebe `allowEmpty` (opcional, falso por padrão). Importações administrativas agora são **somente aditivas mesmo quando o projeto está ativo**, ignoram documentos já cadastrados e não transferem respostas ou histórico. Mantida verificação de candidato real e exclusividade de projeto ativo por login.
3. `src/routes/_authed/contas.jsx`: exibe se o projeto está sem conteúdo, opção explícita de habilitar acesso, atalho para importar no projeto certo, marca vínculo do mesmo login do Skull e permite escolher projetos já ativos como destino de importação.
4. `src/lib/study-import.js` (novo): aceita listas JSON, `{questoes: [...]}`, `{edital: [...]}`, `{records: [...]}` e dicionários por ID; valida duplicatas; gera IDs técnicos determinísticos quando faltam; preserva campos de origem, matéria e assunto; aceita alternativas A–E sem convertê-las em C/E. Arquivos PDF **não são convertidos automaticamente**.
5. `src/components/qb/study-shell.html`: modo de múltipla escolha com botões e teclado A–E; zero representa branco, que internamente usa `-` exclusivamente para questões de alternativas. B não é branco quando a questão é de múltipla escolha. Respostas continuam vinculadas por ID ao projeto do candidato, com mesma revisão e Caderno de erros. Modo C/E original mantido.
6. `public/claude-export/training-radial.js` e `question-links.js`: barras e cartões passam a reconhecer alternativas reais; pergunta MC exibe as opções e interpretação correta do gabarito.
7. `public/claude-export/pcmg-multiple-choice.css` (novo): alternativas em lista responsiva, foco visível e feedback de correção.

## Segurança dos dados
- Nenhuma questão foi inventada ou importada em lugar das questões ausentes.
- Nenhum dado de um estudante foi copiado para outro.
- Importar conteúdo existente utiliza IDs e escopo de `StudyAccount` exclusivos; não reescreve documentos anteriores.
- A fonte original, as alternativas e o gabarito permanecem aqueles enviados, sem conversão forçada.
- O acesso do login PCMG ao ambiente ativo foi regularizado; o Treinar continuará informando ausência de questões até o lote ser reenviado por `Contas e concursos → Importar materiais`.

## Verificação
- **212 testes aprovados e 0 falhas**.
- **Build de produção aprovado**.
- Conferência visual manual em navegador real ainda pendente.
