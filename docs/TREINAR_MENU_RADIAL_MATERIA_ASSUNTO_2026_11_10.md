# Treinar radial por matéria e assunto — Quebrando a Banca
Data: 10 de novembro de 2026

## Objetivo
Transformar o antigo selector por listas/accordions na tela inicial de **Treinar** em um menu AXON radial hierárquico. O primeiro círculo permite escolher a matéria, o segundo mostra os assuntos do edital com questões disponíveis, e a seleção do assunto abre os filtros para iniciar uma rodada real de CEBRASPE. O **núcleo central** apresenta um gráfico em barra de acertos, erros e brancos, calculado pelo histórico autenticado do estudante. A navegação principal do aplicativo, o fundo animado/estático e os demais módulos permanecem.

## Fluxo da experiência
1. **Treinar:** primeiro círculo do treino agrupa as questões por matéria registrada no edital, incluindo o grupo "Outros capítulos" para itens cuja origem não esteja classificada, sem inventar uma disciplina.
2. **Matéria:** ao selecionar o setor luminoso ou seu rótulo, o AXON transita para um segundo círculo de assuntos. Não há mais o painel completo de capítulos como primeira tela.
3. **Assunto:** ao selecionar um assunto, a interface apresenta os filtros *Questões novas*, *Todas as questões* e *Somente erros*, além de *Embaralhar a ordem* e *Começar rodada*. O treino reutiliza os IDs originais e o mecanismo existente `novaRodada`, inclusive para assuntos que contenham vários capítulos.
4. **Voltar:** da configuração específica volta para o círculo de assuntos; do círculo de assuntos volta para o de matérias. As abas superiores e o botão de Menu principal continuam disponíveis.
5. **Acessos antigos:** uma opção secundária permite usar o treinamento clássico por capítulo. A ação *Treinar* que vem do Edital continua podendo abrir diretamente esse configurador, sem quebrar fluxos existentes. O próprio Treinar radial possui atalhos para **Revisões vencidas** e **Caderno de erros**.

## Desempenho central
- Cada questão é contabilizada **uma única vez** por conjunto, mesmo que referenciada por mais de um assunto.
- Base de cálculo: última resposta registrada (`ultimaMarcada`, com histórico como fallback) de cada questão que pertence ao conjunto selecionado.
- **Acertos**: C/E correspondente ao gabarito.
- **Erros**: C/E diferente do gabarito.
- **Brancos**: última resposta registrada B.
- Questões **não respondidas** não entram no denominador do percentual; permanecem no total de disponíveis.
- Segmentos com cor ciano (acertos), rosa-violeta (erros) e cinza (brancos), mantendo o contorno e a textura cromática AXON.
- O índice central é reativo ao **hover** e ao **foco pelo teclado** de cada matéria ou assunto. Sem foco, ele exibe o agregado do nível atual.
- A taxa mostrada é `acertos / respondidas`; a barra mostra a distribuição `acertos + erros + brancos = respondidas`. Não é nota líquida nem taxa de retenção histórica.

## Escalabilidade e acessibilidade
- Paginação de no máximo **seis setores por volta**, preservando a leitura de títulos e a área de toque em desktop e mobile.
- Barra de seleção rápida para assuntos quando há muitos tópicos.
- Não exibe páginas com assuntos que não têm nenhuma questão associada no índice; informa quantos assuntos do edital não estão disponíveis para treino. Esses assuntos permanecem no Edital.
- Materiais sem questões não são atribuídos a um conjunto inventado de itens.
- Botões HTML reais e setores SVG amplos, navegação pelas setas, Escape para voltar ao círculo de matérias, teclado e leitor de tela.
- Reaproveita `QBAxonRingFlow.mount` e a máscara `ambient-poster.jpg`, respeitando fundo estático, pausa em aba oculta e `prefers-reduced-motion`.
- Canvas/observadores são descarregados em toda troca de tela; não são criados novos contextos WebGL.

## Compatibilidade e integridade
- O estado `S.round` continua soberano: uma rodada em andamento ou sua tela de resultado não é substituída pelo radial.
- A passagem de `setView('treinar')` a partir do portal ou das abas inicia o círculo de matérias, exceto durante rodada ativa.
- Os filtros são os mesmos `S.modo` e `S.shuffle` do treino clássico, e `novaRodada('MIX', nomeDoAssunto, modo, IDs)` preserva correção, confiança, notas, caderno, repescagem e histórico.
- Os dados continuam na mesma conta autenticada e no banco original. O componente radial não escreve dados, não cria questões ou respostas e não consome créditos de IA.
- A indexação por tópico respeita o `QBQuestionLinks.byTopic` existente, acrescida das referências diretas `q.topico`, sem inferir relação conceitual por mera similaridade textual.

## Arquivos
- Novo: `public/claude-export/training-radial.js`
- Novo: `public/claude-export/training-radial.css`
- Atualizado: `src/components/qb/study-shell.html`
- Novo: `tests/training-radial.test.mjs`

## Verificação
Foram aprovados **165 testes** na suíte completa com **0 falhas**, e o `npm run build` terminou sem erros. Os testes cobrem cálculo com respostas em branco e pendentes, agregações sem duplicação, contas com capítulos não classificados, paginação do círculo de matérias e assuntos, acessibilidade, escaping de HTML, hover atualizando o centro, ligação à rodada e preservação do treino clássico.

Validação visual manual em computadores e celulares reais ainda não realizada.

## Restauração
Checkpoint anterior à alteração: `6af34150570532dc37a6ba10`. Se a experiência nova não agradar, a versão anterior do Treinar pode ser restaurada sem reconstruir o aplicativo.
