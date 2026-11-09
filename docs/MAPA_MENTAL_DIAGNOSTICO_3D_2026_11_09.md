# Mapa mental diagnóstico · integração com Three.js e desempenho no edital
Data: 2026-11-09
Projeto: Quebrando a Banca (Base44)
Estado: módulo de diagnóstico de aprendizagem implementado; integração visual específica do renderizador Three.js em evolução por outro fluxo de trabalho.

## Objetivo
Cada ramo e subramo do mapa mental deve indicar, **a partir de dados reais da conta autenticada**, como o estudante responde às questões explicitamente ligadas àquele conceito. O diagnóstico também apresenta o resultado geral do mesmo assunto no edital. O usuário pode abrir a lista de questões, revisar individualmente e iniciar uma rodada contendo somente os IDs associados ao ramo, sem duplicação.

## Implementação existente
- Motor puro, sem operações de gravação: `public/claude-export/map-mastery.js`.
- Apresentação dark navy/púrpura: `public/claude-export/map-mastery.css`.
- Testes com casos sintéticos, lotes reais de fontes e integração: `tests/map-mastery.test.mjs`.
- `src/components/qb/study-shell.html` carrega o motor e o estilo; em `viewMapa()` constrói `diagnostico`, mostra um resumo do edital e badges individuais por nó, com detalhes por subárvore, botão de questões e atalho ao edital.
- A função `mapa3D(m,t,lig,diagnostico)` acrescenta metadados ao `data-graph` **sem modificar o posicionamento da câmera, a geometria ou a implementação da cena**. Compatibilidade com o novo renderizador Three.js será finalizada nesse próprio fluxo do 3D.

## API do motor
```js
const d = window.QBMapMastery.build({
  topicId: S.mapaId,
  map: S.rv.get(S.mapaId).mapa,
  cards: S.rv.get(S.mapaId).cartoes || [],
  questions: S.q,       // Map<questionId, question> da conta ativa
  responses: S.r,       // Map<questionId, response> da conta ativa
  topic: S.ed.get(S.mapaId)
});
const node = d.byPath.get("0.1.2");
const result = node.stat;
const detailHTML = window.QBMapMastery.detail(d,"0.1.2");
const badgeHTML = window.QBMapMastery.badge(node);
```

As propriedades `result` incluem: `total`, `respondidas`, `acertos`, `erros`, `brancos`, `naoRespondidas`, `caderno`, `historicoErro`, `retidasEntreAcertos`, `percentual`, `cobertura`, `retencao`, `status` e `label`. `node.direct` contém os IDs ligados diretamente; `node.all` contém os IDs únicos do nó e descendentes.

`d.edital` contém o resumo do assunto por capítulos do edital (e não os nós). `d.unlinked` lista questões do assunto sem correspondência de nó confirmada. Mesmo que o resultado geral do edital seja bom, um ramo sem IDs exatos deve continuar sem evidência.

## Regras de vinculação e deduplicação
1. `node.x.questaoIds` é vínculo editorial exato com questões existentes.
2. `question.mapaNoId` somente vincula se for ID único no mapa e a questão pertencer ao tópico/capítulo, evitando colisões entre mapas.
3. `card.mapaNoId` + `card.questaoIds` pode complementar a associação exata.
4. Ancestrais agregam todos os IDs da descendência por conjunto, sem contagem duplicada.
5. Não relacionar por semelhança textual e não converter vínculo de *capítulo* em correspondência *exata de nó*.
6. Excluir das taxas itens com `foraNivel` e `SIM*`, como faz o controle de estudo. Itens nunca respondidos não entram no denominador do percentual de acertos; sua cobertura é exibida separadamente.

## Status
- **Não avaliado:** nenhuma resposta C/E registrada; não equivale a zero domínio.
- **Amostra pequena:** de 1 a 4 questões respondidas; percentual, se exibido, deve ser acompanhado da ressalva e **nunca** ser classificado como forte.
- **Precisa de reforço:** 5 ou mais respostas e acerto recente abaixo de 70%; ou ao menos dois erros recentes e itens no caderno.
- **Em desenvolvimento:** 5+ respostas, desempenho intermediário.
- **Bom acerto; confirmar retenção:** ao menos 85% de acerto, mas sem cumprir todos os critérios de retenção/cobertura.
- **Forte, com retenção:** mínimo 5 respondidas, acerto recente ≥85%, cobertura do ramo ≥80%, retenção confirmada em ao menos 60% das respondidas e nenhum item no caderno.

Estes são **limiares operacionais configuráveis** de acompanhamento pedagógico, não notas padronizadas ou comprovação estatística de domínio. A taxa de acerto é calculada sobre a última resposta válida C/E a cada questão, não sobre o total de tentativas. Indicadores de erro histórico e caderno são independentes.

## Contrato para Three.js
O `data-graph` existente agora expõe em cada nó (sem publicar respostas brutas): `path`, `id`, `parent`, `title`, `branch`, `status`, `statusLabel`, `percentual`, `questoes`, `respondidas` e `retidas`. O renderizador deve usar as cores em tons azul/púrpura da identidade visual, diferenciadas por valor/contraste e texto acessível.

- `forte`: azul-esverdeado suave; `bom-sem-retencao`: azul; `em-desenvolvimento`: lilás; `deficiente`: rosa-púrpura; `amostra-insuficiente`: azul pálido; `sem-evidencia`: cinza-azulado.
- Ao passar o mouse ou selecionar nó 3D, mostrar **acertos/respondidas**, total ligado, retenções e status, jamais apenas um percentual sem tamanho amostral.
- No clique, abrir detalhe com lista das questões únicas relacionadas e acesso à rodada de reforço. Reutilizar o caminho `path` para focar a versão em lista quando necessário.
- Não recalcular score dentro do Three.js; ler o resultado único de `QBMapMastery`.
- Usar `three.js` apenas na camada visual: não mudar `StudyDocument`, resultados SRS, chaves, IDs ou dados da conta.
- Em ausência do renderer WebGL, manter perfeitamente funcional a lista 2D com as mesmas métricas.

## Observações de isolamento
O motor recebe somente `S.q`, `S.r`, `S.rv` e `S.ed` da conta atualmente autenticada. Não usa `ClaudeDocument`, não busca dados de outra conta e não altera respostas, avaliações, tentativas ou agendamentos. A execução de treino cria tentativas novas **somente quando o usuário responde** por meio do fluxo convencional do aplicativo.

**Validação:** testes automatizados e build são exigidos antes de checkpoint/deploy. O trabalho simultâneo sobre a cena Three.js não deve ser substituído ou apagado por mudanças no diagnóstico.
