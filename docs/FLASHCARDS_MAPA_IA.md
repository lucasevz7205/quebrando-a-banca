# Flashcards: origem no mapa e correção de resposta com IA

## Escopo

A implementação reaproveita **Estudo > Flashcards** e **Estudo > Mapas mentais**; não cria ferramenta nova nem modifica o histórico SRS.

### Referência a um nó do mapa

Um cartão continua dentro do documento `revisao` do tópico. Para registrar origem explícita, inclua no cartão:

- `mapaNoId`: identificador único do nó definido em `revisao.mapa.ramos[].id` ou em um descendente `f[].id`; **ou**
- `mapaPath`: caminho do nó como `0.1.2`, seguindo a ordem dos ramos/descendentes. O ID é preferível porque não depende da ordem.

O botão exibido **após revelar a resposta** tem três estados:

- **Ver origem no mapa mental:** ligação explícita existente e válida.
- **Ver sugestão no mapa (não validada):** sem origem explícita, uma correspondência lexical inequívoca com três ou mais termos. É uma hipótese, não procedência comprovada.
- **Abrir mapa do capítulo:** não existe correspondência confiável com um nó, mas o tópico tem mapa.

Quando não existe mapa, o cartão informa **Sem mapa mental cadastrado para este cartão**. A volta pelo botão **Voltar ao flashcard** conserva a sessão e as avaliações SRS.

### Correção com IA

Após escrever a resposta e revelar o gabarito, o estudante pode clicar **Corrigir com IA**. A função de servidor:

1. Autentica o login Base44 e resolve o próprio `StudyAccount`. Para o administrador, usa o banco original, sem transferir dados entre contas.
2. Resolve o identificador do cartão e **lê a pergunta e o gabarito diretamente do banco da conta**. O navegador envia apenas o ID e a resposta escrita.
3. Aplica limite de **8 chamadas por usuário a cada dia UTC**, intervalo mínimo de **20 s** e controle de concorrência no processo. O registro `FlashcardAIUsage` tem acesso direto restrito a administradores.
4. Chama a integração **Core.InvokeLLM do Base44**, usando os créditos do aplicativo, não créditos da assinatura Claude do estudante.
5. Apresenta `lembrei`, `parcial` ou `não lembrei`, acertos, omissões, erros e comentário como **sugestão**. Somente o estudante escolhe Novamente/Difícil/Bom/Fácil; não altera SRS sem sua escolha.

Apenas **um cartão por chamada** é enviado ao modelo. Não há envio do banco completo de questões, dos históricos, nem da identidade do candidato no prompt. A correção pode falhar por indisponibilidade/créditos da integração, e a autocorreção manual continua disponível.

### Validação e limites

- 46 testes automatizados e compilação aprovados na implementação inicial.
- Os testes **não substituem** um teste manual autenticado do serviço Core.InvokeLLM e da experiência mobile.
- Cartões históricos sem `mapaNoId`/`mapaPath` não são rotulados como tendo origem exata.
- Sem banco de dados de revisão de cada nó auditado, não se deve alegar cobertura semântica de 100% apenas pelo vínculo do capítulo.
- Em ambientes serverless com mais de um processo, a proteção de chamadas simultâneas é local ao processo; o contador diário é persistido, mas seu incremento não é transação atômica entre processos.
