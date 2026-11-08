# Continuidade pedagógica: F0 / P1 e preparação segura de P2–P3

**Projeto:** Quebrando a Banca · Base44 `6aef9673577cba58a2c91a3c`
**Data:** 8 de novembro de 2026
**Base:** `01-dossie-make-it-stick.md`, `02-matriz-implementacao.md` e `03-comando-work.md`, fornecidos pelo usuário.
**Escopo desta rodada:** avançar com validação e correções incrementais, sem implementar nem liberar variantes inéditas.

## Implementações verificadas

- P1: integração no fluxo C/E, estado registrado antes da exibição do comentário, confiança categórica (1 chute, 2 dúvida, 3 certeza), quatro estados pedagógicos.
- P1, revisão: separação exploratória entre resposta padrão e pergunta reflexiva foi alterada de alocação **por capítulo** para **por tentativa**, evitando que a disciplina determine integralmente o braço de comparação. Metadados registram `allocation: piloto-p1-por-tentativa-v1` e `feedback`, e a interface utiliza esse mesmo valor.
- P1, painel: indicadores separados para acertos/erros com dúvida/certeza, tamanho da amostra, acompanhamento de 7–10 dias e aviso de insuficiência e ausência de atribuição causal.
- P1, interface: estilos revisados no arquivo `public/claude-export/learning.css` para se harmonizar com os demais módulos e responder a telas estreitas.
- Integridade: atividade aberta agora exige conclusão antes de começar outra, evitando desaparecer sem registrar conclusão.
- P2, proteção: uma atividade de evocação sem correção validada não comprova domínio e não habilita transferência. A liberação requer acerto verificável em questão de origem vinculada, fonte presente, contexto alterado, variante reservada e revisão editorial.
- P4, proteção: respostas livres sem avaliação objetiva não são usadas como referência de retenção/transferência.
- P6: revisão adaptativa permanece em **simulação**, sem alteração da agenda de revisão efetiva.
- Dados antigos e gabaritos não foram modificados.

## Conteúdo-piloto consultado no Base44 (leitura)

| Conceito | Questões de origem presentes | Atividades cadastradas | Variante reservada |
| --- | --- | --- | --- |
| DNS × DHCP | `ti2-40`, `ti2-41` | duelo, evocação, pré-teste, variante | `reviewed:false` |
| TCP × UDP | `ti2-35`, `ti2-36` | duelo, evocação, pré-teste, variante | `reviewed:false` |
| Simplex × half-duplex × full-duplex | `ti2-17`, `ti2-18` | duelo, evocação, pré-teste, variante | `reviewed:false` |

As 12 atividades estavam cadastradas em `ClaudeDocument/ aprendizagem_conteudos` (ambiente legado da Câmara) e os seis itens de origem foram confirmados. Nenhum evento de `aprendizagem` foi encontrado nas consultas efetuadas antes desta rodada. Não expor antecipadamente as variantes ao estudante, nem aprovar automaticamente sua correção.

## Testes e limitações

- Conjunto `tests/learning*.mjs`: **20 testes automatizados aprovados** após as alterações.
- `npm run build`: compilação finalizada com código 0.
- Testes exercitam lógica do módulo e isolamento de gravação em stubs. **Não equivalem a teste visual em navegador autenticado nem demonstram ganho de aprendizagem.**
- Ainda falta conferir a navegação no dispositivo real, envio persistente na conta autorizada, comportamento de tela estreita e acompanhamento do piloto P1 depois de 7–10 dias.
- A comparação P1 permanece exploratória; alocação pseudoaleatória por tentativa não garante independência, cegamento nem equilíbrio entre conceitos. Exibir o resultado como **inconclusivo** até critérios pré-definidos e análise de comparabilidade.

## Próxima execução recomendada

1. **Validar no iPhone e no navegador autenticado** os estados P1 e a persistência de eventos em `aprendizagem`.
2. Registrar dados reais de maneira natural durante o treino, sem criar respostas sintéticas na conta.
3. Após janela de retenção, conferir tamanho e cobertura das duas condições de P1.
4. Solicitar revisão editorial independente dos três itens P2 sem apresentar previamente seus gabaritos ao estudante.
5. Após validação, executar P2 e P3 em escopo pequeno, mantendo P4 como métrica e P6 apenas em simulação.
6. Retomar P5, P7 e P8 conforme o sequenciamento da matriz científica.

## Critério de segurança

Preservar registros, histórico de tentativas, gabaritos, configurações, calendário e modo offline futuro; não criar usuários nem preencher resultados artificiais. Pilotos inéditos não devem ser liberados sem aprovação humana.
