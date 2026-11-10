# Reconhecimento de Fala: integração concluída de 2.4 até 2.8

**Data:** 10 de novembro de 2026  
**Escopo autorizado:** tópicos `rf-2-4` a `rf-2-8`.  
**Proteção anterior:** checkpoint `6af366cf621cb46b3a1be841`.

## Resultado no banco
Gravadas **100 questões originais já elaboradas** em `ClaudeDocument/questoes`, no total de 20 por tópico:
- `rf-2-4`: `RF-2.4`, 20 questões;
- `rf-2-5`: `RF-2.5`, 20 questões;
- `rf-2-6`: `RF-2.6`, 20 questões;
- `rf-2-7`: `RF-2.7`, 20 questões;
- `rf-2-8`: `RF-2.8`, 20 questões.

Cada registro preserva ID, enunciado, justificativa, comentário, gabarito, `topico` e `mapaNoId` originais, acrescidos de `faseTreino: "rascunho-pedagogico"` e aviso de questão autoral cujo gabarito ainda requer revisão humana. O estado `aguardando-revisao-humana` não foi alterado.

Nos cinco documentos de `ClaudeDocument/edital`, foram acrescentados somente os capítulos:
- `rf-2-4.caps=["RF-2.4"]`;
- `rf-2-5.caps=["RF-2.5"]`;
- `rf-2-6.caps=["RF-2.6"]`;
- `rf-2-7.caps=["RF-2.7"]`;
- `rf-2-8.caps=["RF-2.8"]`.

Os `caps` de 2.1 a 2.3 permaneceram intactos. Antes das mudanças, não existiam no banco questões destes cinco tópicos, evitando duplicação.

## Backup
Originais dos cinco documentos do edital em:
`scripts/rf-reformulacao/edital-2.4-2.8-backup-antes-link-2026-11-10.json`.

**Atenção:** o checkpoint Base44 só versiona o código. Não reverte automaticamente o banco. Qualquer restauração de dados deve considerar respostas já registradas para preservar histórico.

## Verificação do retorno
A consulta à entidade `ClaudeDocument` confirmou:
- **160 questões** dos tópicos 2.1 a 2.8;
- exatamente **20 por tópico**;
- **160 vínculos** `mapaNoId`;
- todas com status `aguardando-revisao-humana`;
- os oito tópicos de edital com os capítulos corretos.

Os testes de integração `tests/rf-2-4-2-8-linked-study.test.mjs` confirmam as **100 remissões ao nó exato**, sem aproximação por conteúdo, e avisos de gabarito provisório nos cartões derivados. O treino permanece usando o mesmo histórico por ID, a correção C/E e a revisão espaçada.

A suíte geral passou com **195 testes e zero falhas**, e a compilação de produção terminou com sucesso.

Nenhum PDF original foi reaberto nesta rodada para certificar os gabaritos. Estes continuam provisórios e requerem revisão editorial humana. Não foram geradas novas questões nem realizados consumos de créditos de IA.
