# Treino de discursiva — método (padrão Cebraspe)

Base: edital Câmara, itens 9.1 e 9.8.5 (cargo 11) e o modelo oficial do Cebraspe (prova discursiva e padrão de resposta definitivo do Policial Legislativo 2026, cdn.cebraspe.org.br/concursos/CD_26_PL). A seção 6 vem de fonte secundária (curso preparatório), marcada como tal.

## 1. Como a prova é (edital)
- P3 = 60 pontos: 2 questões de até 20 linhas (15 pontos cada) + 1 peça técnica de até 50 linhas (30 pontos). Aprovação: 30 pontos. Duração: 3 horas.
- Nota da questão: NQ = NC − 3 × NE ÷ TL. Nota da peça: NPT = NC − 6 × NE ÷ TL.
  - NC = nota de conteúdo; NE = número de erros (grafia, morfossintaxe, propriedade vocabular); TL = linhas escritas.
- Do NC, 0,70 ponto na questão (1,50 na peça) é de apresentação (legibilidade, margens, parágrafos) e estrutura (texto organizado). O resto se divide entre os aspectos do comando, cada um com valor declarado.
- Linhas além do limite são desconsideradas; fuga ao tema dá zero.
- Consequência da fórmula: o desconto por erro é dividido pelas linhas escritas. Texto curto pesa mais cada erro; na peça, cada erro vale o dobro.

## 2. Como o Cebraspe formula a questão (modelo de 2026)
1. Texto motivador curto (um caso, uma notícia), "considerando o texto apresentado como unicamente motivador".
2. "Redija um texto dissertativo a respeito de [tema]. Ao elaborar seu texto, aborde os seguintes aspectos:"
3. Três ou quatro aspectos numerados, cada um com [valor: x pontos]. Um tema por questão.

## 3. Como o Cebraspe corrige o conteúdo (padrão de resposta)
- Um texto-padrão com o conteúdo esperado e o que "também será aceito".
- Um quesito por aspecto, com conceitos: 0 (não abordou / totalmente equivocado), 1, 2, 3... conforme o número de elementos corretos, ou "superficial / parcial / correto e completo".
- O valor do quesito é proporcional ao conceito obtido.

## 4. Protocolo do treino (Claude como treinador)
1. **Proposta**: só sobre tópicos já estudados (conferir no Edital do Quebrando a banca: status ou Tutory em estudo ou além). Formato da seção 2, com padrão de resposta e quesitos fechados ANTES de o Lucas escrever. Peça técnica: gênero do cargo (nota técnica, parecer, relatório, redação final), com a estrutura do gênero como quesito.
2. **Execução**: escrita à mão, com tempo (questão ~40 min; peça ~80 min), em folha com 20/50 linhas numeradas. Sem consulta.
3. **Envio**: foto do texto definitivo.
4. **Correção**: Claude transcreve, aplica cada quesito com conceito e justificativa, conta NE pela seção 6 com a lista dos erros, conta TL e calcula NQ/NPT. Aponta o trecho que perdeu ponto e reescreve só esse trecho.
5. **Registro**: coleção `discursivas` do Quebrando a banca (proposta, padrão, quesitos, transcrição, notas, erros) e diário.
6. **Retorno ao estudo**: cada conceito errado vira item C/E ou cartão no tópico; erro de língua recorrente vira item de LP.
7. **Reescrita**: na semana seguinte, a mesma questão é refeita de memória para medir ganho.

## 5. Roteiro de resposta (para o Lucas)
- Parágrafo 1: responda diretamente ao aspecto 1 (sem introdução genérica).
- Um parágrafo por aspecto, na ordem do comando, com o termo técnico e a base (artigo, autor, conceito).
- Fecho curto só se sobrar linha; nunca deixe aspecto sem resposta por falta de espaço.
- Rascunho: liste os aspectos e, ao lado de cada um, 2 ou 3 palavras-chave; só então escreva.

## 6. O que conta como erro (NE) — fonte secundária (blog Flávia Rita, guia de microestrutura do Cespe); confirmar no edital
- **Grafia e acentuação**: fora do Acordo/VOLP; abreviações informais; acento diferencial (tem/têm); translineação errada. Erro de grafia repetido conta uma vez. Letra só é erro se ilegível.
- **Morfossintaxe** (inclui pontuação): concordância, regência, crase, colocação pronominal, vírgula entre sujeito e verbo, falta do par de vírgulas em intercalação, oração solta (período sem principal), "onde" sem lugar, "cujo" sem posse. Conta cada ocorrência (repetição literal conta uma vez).
- **Propriedade vocabular**: coloquialismo, parônimos (iminente/eminente), expressões trocadas (ao invés de/em vez de, à medida que/na medida em que), palavra repetida em excesso no parágrafo, diálogo com o leitor.
