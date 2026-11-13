# Ordem ao Arquiteto: RF 2.1–2.8, revisão seletiva

Leia `reports/rf2-inventario-pendente.json` e `COMANDO ARQUITETO reforma RF2.md` (quando disponível). Os 160 itens do lote `src/data/rf-questoes-revisao-2026-11-10.json` têm protocolo cebraspe-2.0 e NÃO podem ser modificados. Os 139 cartões do snapshot não têm prova de autoria: NÃO assuma que todos estão errados nem que nenhum é do Arquiteto.

Primeiro confira a coleção ativa `revisao/rf-2-1` a `revisao/rf-2-8`, o campo `cartoes`, os metadados de autoria e as questões reais do banco, incluindo itens fora do arquivo editorial. Separe: protegidos, não protegidos, autoria incerta. Em caso de dúvida, preserve.

Para cada candidato não protegido, diagnostique defeito específico, recorte e fonte textual literal. Não invente fonte nem IDs de mapa. Proponha somente os itens que precisarem de correção, obedecendo ao protocolo do comando original. Preserve cada original; os novos devem ter IDs novos e `derivadoDe`, sem alterar `respostas`, `rodadas`, `cartoes_aval`, `edital.status` ou `edital.caps`. Não importe itens sem revisão humana. Sem fonte, registre pendência.

O usuário declarou ter auditado e aprovado o inventário de 139 cartões em 13/11/2026. A parada por quantidade superior a 60 está superada. PROSSIGA com a triagem dos itens não protegidos, identificação dos defeitos e conferência das fontes, em lotes de até 5 itens, gerando propostas com revisão cega e saídas `questoes_RF2.json`, `cartoes_RF2.json`, `relatorio_RF2.md`. Não altere o banco ativo automaticamente: a aprovação do inventário não comprova autoria, correção factual nem validação de fontes. Preserve todos os originais e o histórico.
