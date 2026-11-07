# Regras para escrever perguntas de recuperação (cartões, flashcards, pré-teste e perguntas de fim de explicação)

**Criado em 30/10/2026, a pedido do Lucas.** Vale para todos os chats do projeto e complementa `claude/Metodo_de_Estudo.md` (seções 2.1, 2.4 e 8).

**Onde se aplica:** cartões da aba "Revisão ativa" dos mapas mentais, cartões gravados em `revisao/` no Controle de Estudo, **flashcards de qualquer formato (inclusive baralhos Anki exportados)**, perguntas de pré-teste, perguntas de recuperação no fim das explicações e **enunciados de itens C/E gravados em `questoes/`**.

**Por que existe:** no chat de Direito Administrativo, cartões vagos ("Cite três tipos de pessoa que a banca costuma excluir", "Classifique: (a)... (b)...") levaram a chute ou a resposta em branco. Pergunta vaga não ativa a memória certa. O efeito do teste depende de recuperar a informação-alvo: se a pergunta não aponta para ela, não há recuperação, só adivinhação.

## As regras

1. **Uma resposta definida.** Cada pergunta tem uma resposta que o estudante consegue conferir sem ambiguidade: um número, um prazo, um artigo, sim ou não, um nome, uma lista curta e fechada. Evite "explique", "comente", "fale sobre".
2. **A pista está no enunciado.** Diga a matéria e o recorte. Se é para classificar, liste as opções na própria pergunta. Ruim: "Classifique: (a)...". Bom: "Em qual artigo (9º enriquecimento ilícito, 10 lesão ao erário, 11 princípios) se encaixa cada conduta? (a)...".
3. **Lacunas no lugar de "cite".** Ruim: "Cite os prazos das sanções". Bom: "Suspensão dos direitos políticos: no art. 9º são ___ anos; no art. 10, ___ anos; no art. 11 há suspensão?".
4. **Um conceito por cartão.** Pergunta com "e", "também" ou três partes independentes vira dois ou três cartões.
5. **Nada de metalinguagem sem explicação.** Não use "o que a banca costuma excluir", "a pegadinha clássica", "o caso da aula" sem dizer qual é o contexto. Se a pergunta depende de um exemplo, escreva o exemplo.
6. **Termos e siglas definidos.** Não pressuponha que o estudante saiba o nome de uma classificação que ainda não foi apresentada; dê o termo, a sigla com as iniciais ou a definição na pergunta.
7. **Pergunta "quantos?" informa quantos.** Se a resposta é uma lista, diga o tamanho dela ("Quais são as DUAS travas...", "Cite os TRÊS legitimados...").
8. **Teste do leitor frio.** Antes de publicar, releia cada pergunta como se não tivesse visto o mapa: alguém que estudou o conteúdo sabe exatamente o que responder? Se houver duas leituras possíveis, reescreva.
9. **Citação sempre entre aspas, e o contexto antes da assertiva** (regra do Lucas, 31/10/2026). Toda palavra, expressão, trecho, proposição ou reescrita proposta que o item cita vai entre aspas curvas: “protelatórias”, “O prazo terminou, mas, por cautela, o relator não apresentou o parecer.”. Aspas dentro de um trecho citado viram aspas simples (‘ ’). Quando o item depende de um texto, tabela ou proposição, o enunciado começa pelo contexto e só depois traz a assertiva, nestes formatos (a página mostra cada parte em bloco separado):
   - `Texto de apoio: “trecho do texto” Assertiva: ...`
   - `Dados da tabela: ... Assertiva: ...`
   - `Considere a proposição R: “...” Assertiva: ...`
   - `Situação hipotética: ... Assertiva: ...`
   Nunca deixe o contexto entre colchetes no fim do enunciado.
10. **Item Errado: o comentário traz a versão certa, por extenso** (aprovado pelo Lucas, 05/11/2026). Todo item com gabarito E tem, no comentário, a assertiva corrigida escrita inteira ("Versão correta: “...”"), não só a indicação do erro. Motivo: ler uma afirmação falsa pode fixá-la; o feedback com a versão certa elimina esse efeito (Butler e Roediger, 2008) e permite ao Lucas conferir a correção que ele escreveu antes do gabarito (Uner, Tekin e Roediger, 2022).
11. **Pares de contraste para erros de interferência** (aprovado pelo Lucas, 05/11/2026). Quando um item tiver origem de erro "interferência" (confundi com outra regra), o chat da matéria cria um par de itens no mesmo capítulo e um cartão de contraste:
   - um item Certo que nomeia a regra e a vizinha explicitamente: “A competência para X é privativa (e não exclusiva) da União”;
   - um item Errado que troca as duas;
   - um cartão "Qual a diferença entre A e B? (UMA frase para cada)".
   Afirmações com a alternativa concorrente explícita ensinam as duas regras ao mesmo tempo (Brabec, Pan, Bjork e Bjork, 2021). Interferência era a origem mais marcada em 05/11/2026 (45 de 116 itens).

**Flashcards (frente e verso):** a frente segue as regras 1 a 9; o verso traz só a resposta curta, mais o dispositivo legal ou a fonte. Nada de verso com parágrafo explicativo: a explicação fica no mapa ou no comentário do item.

Itens C/E seguem a mesma lógica: cada item testa uma regra, não admite duas leituras razoáveis, e o comentário aponta o trecho exato que o torna certo ou errado.
