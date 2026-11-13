# Ordem ao Arquiteto: RF 2.1–2.8, revisão seletiva

Leia `reports/rf2-inventario-pendente.json` e `COMANDO ARQUITETO reforma RF2.md` (quando disponível). Os 160 itens do lote `src/data/rf-questoes-revisao-2026-11-10.json` têm protocolo cebraspe-2.0 e NÃO podem ser modificados. Os 139 cartões do snapshot não têm prova de autoria: NÃO assuma que todos estão errados nem que nenhum é do Arquiteto.

Primeiro confira a coleção ativa `revisao/rf-2-1` a `revisao/rf-2-8`, o campo `cartoes`, os metadados de autoria e as questões reais do banco, incluindo itens fora do arquivo editorial. Separe: protegidos, não protegidos, autoria incerta. Em caso de dúvida, preserve.

Para cada candidato não protegido, diagnostique defeito específico, recorte e fonte textual literal. Não invente fonte nem IDs de mapa. Proponha somente os itens que precisarem de correção, obedecendo ao protocolo do comando original. Preserve cada original; os novos devem ter IDs novos e `derivadoDe`, sem alterar `respostas`, `rodadas`, `cartoes_aval`, `edital.status` ou `edital.caps`. Não importe itens sem revisão humana. Sem fonte, registre pendência.

Como o inventário preliminar contém 139 cartões, PARAR antes de reescrever e entregar inventário para conferência do Lucas. Depois da conferência, gerar lotes de até 5 questões e cartões com revisão cega, saída `questoes_RF2.json`, `cartoes_RF2.json`, `relatorio_RF2.md`, sempre em modo proposta até aprovação.
