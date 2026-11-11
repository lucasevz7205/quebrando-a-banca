# Mapa mental: 2,5D, toque como mapa e Evocar com o Omni

**Data:** 11/11/2026. **Autor:** Claude. **Para o Antigravity:** revisar no navegador e no celular antes do merge.

## Por quê
O 3D, por si só, não melhora a memória; o que fixa é tentar lembrar antes de ver (Blunt e Karpicke, 2014; método, seção 2.8). Antes desta mudança havia quatro problemas:
- a cena 3D não tinha "Evocar antes de ler";
- a profundidade era aleatória, ou seja, o lugar de cada conceito no espaço não significava nada;
- no celular, um dedo girava a cena;
- o duplo toque dependia de 350/370 ms.

## O que mudou

### 1. Evocar no 3D (prioridade 1)
- **`public/claude-export/map-evocar.js` e `.css`:** ao abrir um conceito, aparece "O que este conceito significa?" com um campo de texto. Você escreve de memória e depois escolhe uma de três opções:
  - **Corrigir com Omni**;
  - **Comparar com a explicação**;
  - **Não lembro**.
- **A explicação só aparece depois da tentativa.** Em seguida você marca Lembrei, Parcial ou Não lembrei.
- **Gravação:** a coleção nova `evocacoes`, com id `<topico>:<path>` e um campo `hist`. Só a página grava. `respostas` e `questoes` não são tocados.
- **`S.evocar` passa a ser `true` por padrão**, em todas as telas.

### 2. Omni corrige a evocação
- **Tarefa nova `evocar-corrigir`** em `src/lib/omnistudy-ai.js`. Ela usa só a explicação do nó como referência (`x.e`, `x.ex`, `x.trap`, `x.src`) e devolve:
  - `veredito`;
  - `acertou`;
  - `faltou`;
  - `erros[{trecho, problema, correcao}]`;
  - `pergunta`.
- **`normalizeEvocacao`** descarta qualquer `trecho` que não seja cópia literal da tentativa. A página destaca em vermelho o trecho errado dentro do texto que o estudante escreveu.
- **`evocacoes`** entrou na lista de coleções permitidas em `src/lib/study-documents.js`.

### 3. Toque e mouse como num mapa
- **Arrastar:** desloca, com um dedo ou com o botão esquerdo.
- **Pinça ou roda:** zoom.
- **Botão direito ou dois dedos:** inclinam a cena.
- **Inclinação:** máximo de 35° em qualquer direção, nunca de cabeça para baixo.
- **Botões novos:** "Vista de frente" e "Percorrer o mapa".
- **Selecionar e abrir** (`node-activation.js`):
  - um toque seleciona;
  - **tocar de novo no conceito já selecionado abre a evocação**, sem limite de tempo;
  - o duplo clique rápido continua valendo;
  - a constante `DOUBLE_CLICK_MS` é a mesma para tudo.

### 4. Layout 2,5D (`layout.js`)
- O plano XY guarda a estrutura do mapa.
- O Z vem só do diagnóstico (`STATUS_DEPTH`): o que precisa de reforço fica à frente e o forte fica atrás.
- Saem o seno e o espalhamento aleatório entre irmãos.

### 5. Percurso de evocação (`observe.js`)
- "Percorrer o mapa" abre os conceitos na ordem do mapa, pedindo a evocação de cada um.
- "Próximo conceito" só é liberado depois que você marca a autoavaliação.

### 6. Rótulos
- Quando o rótulo completo colide com outro, ele vira **iniciais** em vez de sumir. O nome completo fica no `aria-label`.
- As partículas decorativas do fundo da cena saíram.

## Testes
- `tests/mapa-evocar-2p5d.test.mjs`: 6 testes, todos passando.
- Testes antigos ajustados à nova interação:
  - `map-branches-doubleclick.test.mjs`: tocar de novo abre.
  - `map-navigation-usability.test.mjs`: novos botões do mouse e do toque, e o texto da barra.
- Suíte completa: as mesmas 13 falhas que já existiam no `main`, sem nenhuma nova.

## O que o Antigravity deve verificar (não dá para testar aqui)
1. Preview no **celular**:
   - arrastar com um dedo desloca e não gira;
   - a pinça faz zoom;
   - dois dedos inclinam, no máximo 35°;
   - tocar duas vezes devagar no mesmo conceito abre a evocação.
2. Preview no **computador**:
   - o botão esquerdo desloca e o direito inclina;
   - o duplo clique rápido abre;
   - o duplo clique não fica preso por causa do zoom automático de 370 ms.
3. Evocação:
   - escrever, "Corrigir com Omni" e conferir o trecho errado marcado na tentativa;
   - marcar a autoavaliação e confirmar o documento em `evocacoes`;
   - recarregar a página: o histórico continua.
4. "Percorrer o mapa": passar por 3 conceitos e chegar até "Percurso concluído".
5. Rótulos em iniciais legíveis num mapa denso, como o `pl-2-1`.
6. Contraste do painel nos temas escuro e Glass Iris.
