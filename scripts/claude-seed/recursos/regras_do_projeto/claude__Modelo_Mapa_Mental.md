# Modelo de mapa mental (padrão do Lucas, 04/11/2026)

Referência: o mapa "Modelo End-to-End" que o Lucas fez (RF 1.2), gravado em `revisao/rf-1-2` do Quebrando a banca. Os chats seguem **este documento**; não precisam abrir o PDF original.

## Pacote completo do tópico (regra do Lucas, 04/11/2026)
Quando o Lucas pedir resumo/mapa e revisão ativa de um assunto, entregue sempre as **três partes**, todas no Controle:
1. **Mapa** (`revisao/<id>.mapa`) com explicação `x` em **todos os nós** — abre pelo atalho "Mapa mental".
2. **Revisão ativa** (`revisao/<id>.cartoes`) — abre pelo atalho "Revisão ativa".
3. **Questões no Treinar:** um capítulo de itens C/E do assunto com **no mínimo 20 itens** (regra do Lucas, 04/11/2026; cerca de metade C e metade E), em `questoes` com o `cap` do tópico, e o código acrescentado em `caps` de `edital/<id>` — abre pelo atalho "Treinar". Itens seguem `claude/Regras_de_Perguntas.md` e levam `"origem": "inédito Claude"` quando criados por você. Se o tópico já tiver capítulo com menos de 20 itens, complete até 20, sem repetir o que já existe.

## Onde o mapa fica
O mapa é o campo `mapa` do documento `revisao/<id do tópico>` (o mesmo documento que guarda `itens` e `cartoes`). O Quebrando a banca o desenha em Estudo → mapa (atalho "Mapa mental" no Edital): nó central, ramos coloridos, rótulos curtos com etiqueta, "Evocar antes de ler" (esconde as etiquetas), abrir e fechar ramos, tabela, caixa e ligações cruzadas. **Ao tocar em qualquer nó marcado com ⓘ, abre-se a explicação dele.** Não publique artefato HTML separado.

## Formato
- **Nó central:** o nome do assunto ("Modelo End-to-End").
- **Ramos (5 a 8):** um por grande bloco do tópico, na ordem da aula. Ex.: Definições · CTC · Transdutor · Codificador-decodificador com atenção · Wav2vec 2.0 · Whisper · Vantagens e limites.
- **Rótulo do nó (`t`): 2 a 8 palavras**, frase nominal ou afirmação curta. Nada de parágrafo.
- **Etiqueta (`n`):** o detalhe que prova ou exemplifica o rótulo, em uma linha. Ex.: rótulo "Não é ausência de pré-processamento" + etiqueta "Whisper ainda calcula o log-Mel". É o que fica escondido no modo Evocar.
- **Explicação (`x`) — obrigatória em TODOS os nós, inclusive as folhas** (regras do Lucas, 04/11/2026). Rótulo e etiqueta são palavras-chave; a explicação diz o que a palavra-chave quer dizer e liga o item ao conceito. Teste: alguém que nunca viu o termo entende, só com o `x`, o que ele significa? Exemplo do que **não** pode acontecer: a folha "Verificação" com a etiqueta "um para um" sem dizer que é comparar a voz só com a amostra de quem a pessoa diz ser e responder sim ou não.
  - **Em ramos e sub-ramos:** `e` com 2 a 4 frases sobre o bloco inteiro (o que é, por que importa, como as partes se ligam), mais `ex` e `trap` quando houver.
  - **Em folhas:** `e` com 1 ou 2 frases sucintas que **decodificam cada termo técnico do rótulo e da etiqueta** (siglas, jargões, números, expressões como "um para muitos", "quase tempo real", "pesos abertos"). Sem repetir a etiqueta com outras palavras: explique.
  - `ex` (opcional): um exemplo concreto, de preferência do Parlamento ou da prova.
  - `trap` (opcional): a pegadinha que a banca arma com aquele nó.
  - `src`: a fonte (aula/etapa, página), ao menos nos ramos.
- **Profundidade:** até 5 níveis. Ramo com mais de 3 ou 4 conceitos vira microtópicos (regra da granularidade).
- **Tabela (`tabela`):** para listas paralelas que se comparam (vantagens × limites × defesas). Formato `[[categoria, [itens]]]`. A tabela também leva `x`.
- **Caixa (`caixa: true`):** agrupa peças que funcionam juntas (as 3 redes do transdutor).
- **Ligação cruzada (`ligacoes`):** quando um conceito de um ramo é resolvido em outro (Alinhamento → CTC). Formato `[id_origem, id_destino, "frase curta"]`, com `id` nos dois nós.
- **Cor (`cor`, 1 a 8):** uma por ramo, na ordem; ramos que tratam da mesma família podem repetir a cor.

## Estrutura de ideias (o que o modelo faz bem)
1. **Definir pelas marcas:** "As 3 marcas" com 3 filhos curtos.
2. **Contrastar o que se confunde:** "Treino conjunto ≠ Sem rótulos"; "Diferenças com o modelo híbrido".
3. **Mitos:** o que o conceito **não** é, cada um com a etiqueta que desmente ("Não dispensa busca" → "Ainda faz busca em feixe").
4. **Cadeias de causa → consequência:** "Independência condicional → Supõe saídas independentes → Consequências → Sem modelo de linguagem interno".
5. **Números que a banca cobra na etiqueta:** "1 segundo ≈ 100 quadros e talvez 15 letras"; "700.000 h"; "10 minutos transcritos".
6. **Fechar com vantagens, limites e defesas** em tabela.
7. **Mesma ordem para itens paralelos:** em cada família, entrada → como funciona → saída → consequências.

## Esquema de dados
```json
{
  "mapa": {
    "centro": "Modelo End-to-End",
    "ramos": [
      {"t": "Definições", "cor": 1,
       "x": {"e": "Bloco que diz o que é um modelo end-to-end e o que ele não é. O E2E troca a cadeia de peças separadas do sistema híbrido por uma única rede que vai do áudio ao texto.",
             "ex": "Whisper e wav2vec 2.0 com CTC são E2E; o DNN-HMM não é.",
             "trap": "Chamar de E2E um sistema que ainda mantém léxico treinado à parte.",
             "src": "Etapa 03 · 1.2, p. 39"},
       "f": [
        {"t": "Mitos", "x": {"e": "Três afirmações que parecem decorrer do E2E, mas são falsas…", "src": "Etapa 03 · 1.2"}, "f": [
          {"t": "Não é ausência de pré-processamento", "n": "Whisper ainda calcula o log-Mel",
           "x": {"e": "Mesmo sendo E2E, o modelo pode transformar o som antes da rede. O log-Mel é um espectrograma (imagem das frequências ao longo do tempo) que o Whisper calcula antes de tudo."}}
        ]}
      ]},
      {"t": "Vantagens e limites", "cor": 3, "x": {"e": "…", "src": "…"}, "tabela": [["Vantagens", ["Simplicidade", "Otimização conjunta"]], ["Limites", ["Fome de dados"]]]}
    ],
    "ligacoes": []
  }
}
```
Campos de cada nó: `t` (rótulo, obrigatório), `n` (etiqueta), `x` (explicação, obrigatória: `e`, `ex`, `trap`, `src`), `f` (filhos), `id`, `cor` (só nos ramos), `tabela`, `caixa`.

## Revisão ativa (cartões) — regra do Lucas, 04/11/2026
Todo mapa vem com `cartoes` (lista de `{tema, q, a: [respostas], src}`, seguindo `claude/Regras_de_Perguntas.md`). Na página, a revisão ativa abre em tela própria, no estilo do mapa: os temas (`tema`) viram ramos coloridos que abrem e fecham. Cada cartão mostra a pergunta e um espaço para o Lucas **escrever a resposta de memória** (nas lacunas, o que vai em cada uma, na ordem). Ele toca em "Ver resposta", compara a resposta certa com a que escreveu e **só depois marca Lembrei, Parcial ou Não lembrei** (regra do Lucas, 05/11/2026, que substitui a de 04/11). A marcação e a resposta escrita ficam salvas (coleção `cartoes_aval`, só a página escreve). Por isso:
- agrupe os cartões em 4 a 8 temas, com nomes curtos (viram os ramos);
- a pergunta tem de permitir que ele escreva a resposta e confira se lembrou: resposta definida, curta e conferível (lista com tamanho dito, lacunas, números);
- a resposta (`a`) vem em itens curtos, um por linha, para ele conferir item a item;
- não escreva cartões cuja resposta seja um parágrafo de explicação: a explicação vai no `x` do nó.

## Junto com o mapa
- Mantenha `itens` (folhas detalhadas: regra, exemplos, pegadinha, fonte) e `cartoes` (revisão ativa) no mesmo documento.
- Grave com `update` e `if_version`, sem apagar `itens` e `cartoes` existentes.
- O que o Claude acrescentar além da aula vai marcado como incremento nos `itens`; o mapa e as explicações ficam fiéis à fonte.
- Antes de gravar, confira: **todo nó, inclusive folha, tem `x` que decodifica os termos?** Todo cartão tem resposta curta e conferível? O tópico tem capítulo de questões, com **no mínimo 20 itens**, ligado em `caps`?
