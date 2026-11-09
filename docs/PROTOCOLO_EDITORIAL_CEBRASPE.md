# Protocolo editorial CEBRASPE — Quebrando a Banca
Versão 2.0 · 09/11/2026 · Segunda pesquisa e implementação no laboratório
Responsável: assistente do projeto, por solicitação de Lucas.

## Status e limites
Este é um protocolo de elaboração, recuperação de referências e revisão; não é treinamento dos pesos do modelo, certificação da banca ou medição de equivalência psicométrica. Sua adoção em chats depende da leitura deste arquivo. O laboratório agora possui geração assistida de rascunhos por fonte fornecida, revisão cega por IA e validação da importação dos itens identificados com ce braspe-2.0 (identificador técnico: cebraspe-2.0). Não houve importação de provas nem alteração de questões/progresso nesta implementação. Nenhuma incidência foi estimada nesta pesquisa.

Amostra consultada: dois cadernos oficiais CEBRASPE da Câmara (conhecimentos gerais e específicos, edital 2025), justificativas oficiais FUB 2025 e caderno FGV Câmara 2023 Técnica Legislativa, tarde, tipo 1, acompanhado de gabarito definitivo. A leitura de formatos não homologa os gabaritos CEBRASPE: os definitivos dos dois cadernos da Câmara ainda precisam ser associados item a item antes de constituírem corpus de calibração. Exemplos de falsificação abaixo são classificação editorial, não taxonomia oficial das bancas. Não extrapolar para toda banca ou área fiscal a partir desta amostra.

## 1. Objetivo
Produzir itens inéditos C/E que testem conhecimento e aplicação: conceito correto, contexto suficiente, relação pertinente e julgamento demonstrável. CEBRASPE é referência principal. Da FGV aproveitar situações concretas, conflitos de aplicação e proximidade entre conceitos, sem importar alternativas A–E ou dependência da comparação entre alternativas.

Identificar autoria como “Inédita — Quebrando a Banca, formato C/E, inspirada no estilo CEBRASPE”. Referência FGV é influência editorial, nunca prova original CEBRASPE. Não vender semelhança como autenticidade nem garantir previsão de cobrança.

## 2. O que a pesquisa sustenta
- Câmara/CEBRASPE, conhecimentos gerais: o comando delimita o julgamento; em Português aparecem reescrita, relação entre correção e sentido, inferência e função sintática. O trecho-base e as instruções pertencem ao item, não são acessórios [S1].
- Câmara/CEBRASPE, específicos: comandos especificam CF, jurisprudência, regimento e normas; convivem definições diretas, relações conceituais, condições, números, aplicações e contextos compartilhados. Logo, não gerar somente frases com uma palavra trocada [S2].
- FUB/CEBRASPE: imprecisão, interpretações concorrentes e norma cancelada aparecem entre razões de anulação; há mudanças por generalização conceitual e definição técnica incompleta. Ambiguidade é defeito a evitar, não dificuldade desejável [S3].
- Câmara/FGV: no início do caderno, hipóteses regimentais combinam atores, quantidade, período e consequência, com alternativas próximas. A adaptação C/E deve reconstruir uma proposição autossuficiente, não copiar uma alternativa isolada [S4–S5].

Essas observações são qualitativas. Não fornecem percentual de mecanismos, distribuição de dificuldade ou proporção C/E.

## 3. Decomposição obrigatória
Para cada questão de referência ou inédita registrar:
1. **Conceito:** qual regra ou distinção é necessária?
2. **Contexto:** ator, objeto, tempo, domínio, fonte/versão e premissas relevantes.
3. **Relação:** identidade, inclusão, condição necessária/suficiente, causalidade, finalidade, contraste, sequência ou competência.
4. **Operação cognitiva:** recordar, distinguir, aplicar, inferir, calcular ou avaliar transformação.
5. **Ponto decisivo:** trecho e regra que determinam o julgamento.
6. **Falsificação ou confirmação:** transformação específica; em item correto, explicar por que uma leitura precipitada poderia rejeitá-lo.
7. **Evidência:** fonte recuperável, localização, data/versão, status do gabarito.
8. **Diagnóstico pedagógico:** pergunta preventiva, correção mínima e habilidade a revisar.

Não confundir mecanismo presente no enunciado com causa psicológica do erro do aluno. Só a resposta C/E não prova distração, desconhecimento ou excesso de confiança.

## 4. Taxonomia existente preservada
Reutilizar F1–F10 e V1–V4 de public/claude-export/strategies.js; os nomes descritivos abaixo são operacionais, sem renumerar registros.

| Código | Operação editorial | Pergunta preventiva |
|---|---|---|
| F1 | Ampliar indevidamente o universo, absolutizar | A regra cobre todas essas hipóteses? |
| F2 | Restringir indevidamente, alegar exclusividade | Existem outras hipóteses admitidas? |
| F3 | Trocar conceitos, categorias, atores ou competências | A propriedade pertence a este conceito/ator? |
| F4 | Alterar número, prazo, quórum, modalidade verbal ou condição | Qual é o valor, denominador ou requisito exato? |
| F5 | Trocar regra e exceção | A hipótese concreta ativa a exceção? |
| F6 | Criar nexo inválido entre proposições | A segunda afirmação realmente decorre da primeira? |
| F7 | Extrapolar a fonte ou inferir sem suporte | A conclusão é autorizada pelas premissas? |
| F8 | Deslocar vigência, versão ou entendimento exigido | Qual regra vale no recorte temporal? |
| F9 | Compor uma assertiva com parte falsa | Cada componente e a ligação entre eles se sustentam? |
| F10 | Reescrever alterando sentido ou correção exigida | Qual dimensão o comando exige preservar? |
| V1 | Paráfrase verdadeira | Mudou a expressão ou a proposição? |
| V2 | Recorte verdadeiro não exaustivo | O texto só exemplifica ou pretende excluir os demais? |
| V3 | Regra efetivamente absoluta | Há contraexemplo válido nesse domínio? |
| V4 | Exceção verdadeira pouco intuitiva | A fonte contempla expressamente a situação? |

F9 descreve a composição: usar como secundário quando F3/F4/etc. explicam a alteração principal. Não inflar incidência contando o mesmo item várias vezes como se fossem itens distintos. Itens corretos diretos podem ter mecanismo nulo; não inventar pegadinha em todo item. “Sempre” não implica erro e “pode” não implica acerto. Omissão de detalhe só falsifica quando compromete a afirmação no alcance declarado.

## 5. Processo de criação
1. Fixar matéria > assunto > tópico/subtópico e cargo-alvo; localizar a parte do edital, sem criar vínculos fictícios.
2. Recuperar fontes primárias pertinentes e exemplos oficiais com gabarito definitivo. Fonte indisponível ou divergência não resolvida: manter rascunho e explicar a pendência.
3. Formular primeiro uma proposição verdadeira, com âmbito e fundamento verificáveis.
4. Escolher operação cognitiva e tipo: definição, discriminação, aplicação contextual, relação, inferência ou cálculo/reescrita.
5. Para um item E, fazer preferencialmente uma alteração decisiva plausível. Evitar vários erros grosseiros que se denunciam. Em itens compostos mais avançados, explicitar todos os pontos no comentário.
6. Para um item C, preservar condições suficientes de validade. Variar paráfrases, aplicações e exceções sem produzir redação estranha só para enganar.
7. Escrever situação nova e conclusão autossuficiente; trocar apenas nomes ou números de uma prova não basta para originalidade.
8. Redigir comentário separado: gabarito, trecho decisivo, fundamento, explicação do mecanismo, correção mínima e pergunta preventiva.
9. Fazer revisão sem consultar o gabarito pretendido: derivar resposta da fonte e procurar um contraexemplo e uma leitura alternativa razoável.
10. Conferir escopo, atualização, duplicidade textual e conceitual e ausência de pistas de resposta. Só então liberar para estudo.

O revisor pode ser outra rodada de análise do mesmo modelo, mas isso não equivale a revisão humana independente. Persistindo dúvida, bloquear a publicação do item. Não declarar “validado” porque duas gerações concordaram.

## 6. Dificuldade e equilíbrio
Dificuldade planejada depende de distância entre conceitos, quantidade de etapas e integração de condições, não de frases longas ou vocabulário obscuro. Distinguir dificuldade planejada de dificuldade observada no desempenho.

Um lote deve diversificar operações e temas sem sequência previsível C/E. Não impor “metade certa” como característica da banca nem criar estatística sem corpus. Em treino direcionado, pode-se superamostrar a fraqueza do aluno, identificando isso como seleção pedagógica, não incidência de prova.

Texto-base compartilhado deve acompanhar todos os itens dependentes; itens irmãos não devem revelar respostas entre si. Em Português, avaliar gramática e sentido conforme o comando efetivo; nem toda tarefa exige ambos. Em TI, fixar protocolo, versão e configuração quando isso alterar a resposta. Em Direito, delimitar norma, vigência e orientação jurisprudencial; conferir fonte primária na ocasião da geração.

## 7. Amostra original para verificar o método
Exemplos didáticos de lógica com premissas inventadas e completas; não são questões oficiais nem medição de fidelidade.

**Contexto A:** Em um laboratório fictício, um relatório é liberado se, e somente se, receber duas assinaturas digitais válidas. Nenhuma outra condição é exigida.
- A1. O recebimento das duas assinaturas válidas é condição suficiente para a liberação do relatório. **C**. A regra declara suficiência e necessidade.
- A2. Mesmo recebidas as duas assinaturas válidas, é indispensável uma autorização adicional para liberar o relatório. **E — F4**. Introduz requisito incompatível com a premissa. Correção: dispensar a autorização adicional.
- A3. Se o relatório foi liberado, então recebeu as duas assinaturas válidas. **C**. A condição também é necessária.

**Contexto B:** Uma auditoria examinou 40 processos de um universo de 200; dos examinados, 30 estavam regulares. Nada foi informado sobre a seleção da amostra.
- B1. Entre os processos examinados, 75% estavam regulares. **C**. Denominador 40.
- B2. A auditoria demonstrou que 75% de todos os processos do universo estavam regulares. **E — F7**. Transfere resultado amostral para todo o universo sem suporte.
- B3. Foram encontrados ao menos 30 processos regulares no universo auditável. **C — V2**. A afirmação parcial não afirma a situação dos demais.

**Contexto C:** Um texto original declara que a ampliação do prazo ocorreu depois da consulta, mas não informa a causa da decisão.
- C1. A consulta precedeu a ampliação do prazo. **C — V1**.
- C2. A consulta determinou a ampliação do prazo. **E — F6**. Converte sequência temporal em causalidade.

Os pares são demonstrações para o elaborador; separar ou espaçar no treino para que um item não entregue o outro. A qualidade de conteúdo especializado ainda depende da fonte daquele assunto.

## 8. Registro de autoria e interoperabilidade
Modelo conceitual de metadados (não migração do banco):
- identidade: id, versão, origem inédita/oficial/adaptada, autor, data;
- classificação: materiaId, assuntoId, topicoId, subtopicoId, cargoIds, editalIds;
- conteúdo: comando, contexto, enunciado, gabarito C/E;
- explicação: fundamento, localização da fonte, trecho decisivo, correção mínima;
- análise: operação cognitiva, mecanismo principal, secundários, dificuldade planejada;
- evidência: URLs, prova/caderno/item quando oficial, gabarito definitivo/preliminar/anulado/pendente, data de consulta e vigência;
- controle: status rascunho/revisão/aprovado, revisor, versão do protocolo;
- ligação: IDs reais de nós do mapa, questões-fonte, flashcards e conceitos.
Não inventar IDs, cargos ou fontes. Manter dados editoriais separados das respostas e métricas individuais. Questão inédita não deve entrar no numerador de incidência histórica de prova.

## 9. Como medir aproximação de modo honesto
Antes de alegar alta fidelidade:
- Montar corpus estratificado por banca, matéria, cargo e ano, conferindo prova, número e definitivo. Deduplicar conhecimentos comuns entre cargos e versões de caderno.
- Separar por prova/ano os exemplos usados na elaboração e os reservados para avaliação. Paráfrases do mesmo item não podem atravessar a separação.
- Fazer dupla classificação de uma amostra e resolver divergências de mecanismos, guardando a incerteza.
- Avaliar às cegas fonte/gabarito, univocidade, aderência ao edital, plausibilidade, operação cognitiva e naturalidade. Gabarito incorreto ou ambiguidade razoável são veto, mesmo com boa nota estética.
- Registrar erros factuais, itens ambíguos, duplicidades e concordância entre revisores. Publicar números somente após contagem auditável.
- Distinguir incidência de assunto entre provas (provas que cobraram / provas elegíveis analisadas) de participação entre itens (itens do assunto / itens elegíveis analisados). Mostrar n, período e cargo; em multirrótulos, explicar soma acima de 100%.
- Comparar desempenho em inéditas e oficiais inéditas para o estudante, com cautela sobre amostras pequenas e exposição prévia. O acerto de Lucas não mede sozinho a qualidade geral de uma questão.

## 10. Prompt reutilizável
Leia este protocolo e as regras pedagógicas atuais do projeto. Elabore itens inéditos exclusivamente C/E para o recorte solicitado. Use CEBRASPE como referência e, se útil, contextualização inspirada na FGV. Recupere fontes verificáveis; não invente fonte, gabarito oficial ou frequência. Para cada item, construa conceito, contexto, relação, operação e ponto decisivo. Varie corretos e errados sem pistas lexicais ou sequência previsível. Em E, indique mecanismo principal da taxonomia existente e correção mínima; em C, justifique a validade no domínio. Faça revisão por contraexemplo e interpretação alternativa. Retenha em rascunho qualquer item sem fundamento ou com ambiguidade. Entregue enunciados separados do gabarito/comentários e metadados exportáveis, com rótulo de autoria inédita. Não altere histórico, contas, questões existentes ou métricas. Não alegue treinamento interno do modelo ou equivalência validada com a banca.

## Fontes consultadas
[S1] CEBRASPE, Câmara, edital 2025, conhecimentos gerais, comandos e itens de Português:
https://cdn.cebraspe.org.br/concursos/cd_25_ns/arquivos/E61A04B682ABA7AF746F702D22B1516C4A4BC005855CE5CFFF5D2280F3E790CE.pdf

[S2] CEBRASPE, Câmara, edital 2025, conhecimentos específicos, itens 91–180:
https://cdn.cebraspe.org.br/concursos/cd_25_ns/arquivos/0F0D35E9168F758645B7D40A60AD61E49410BD36B49373E3FE0F5991D582D045.pdf

[S3] CEBRASPE, FUB 2025, justificativas de alterações:
https://cdn.cebraspe.org.br/concursos/FUB_25/arquivos/FUB_25_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf

[S4] FGV, Câmara 2023, Técnica Legislativa, tarde, tipo 1, especialmente estrutura dos itens 1–2:
https://conhecimento.fgv.br/sites/default/files/concursos/cns301-analista-legislativo-tecnica-legislativacns301-tipo-1_0.pdf

[S5] FGV, gabarito definitivo correspondente:
https://conhecimento.fgv.br/sites/default/files/concursos/camara-dos-deputados-gabaritos-definitivos-para-publicacao-edital-3-tarde.pdf

Índice oficial FGV:
https://conhecimento.fgv.br/concursos/cdeputados23/3

Consulta: 09/11/2026. Preservar a distinção entre ano do edital e data de aplicação. Este documento não reproduz cadernos nem substitui a verificação das normas e dos gabaritos.
