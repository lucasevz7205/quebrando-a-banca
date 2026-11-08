# Backlog: Modo Academia / uso com internet instável

**Projeto:** Quebrando a Banca
**Registrado em:** 2026-11-08
**Status:** IDEIA GUARDADA. NÃO IMPLEMENTAR AGORA.
**Prioridade:** futura, após as melhorias em curso.

## Objetivo
Permitir que o usuário continue respondendo questões, revisando flashcards e cumprindo tarefas durante a academia, deslocamentos e outros locais com sinal ruim, sem perder respostas. Prioridade principal: SALVAR LOCALMENTE ANTES DE ENVIAR À NUVEM.

## Proposta para retomar futuramente

1. Fase 1, resiliência à conexão instável: gravar cada resposta, avaliação de flashcard e conclusão de tarefa em fila local persistente (IndexedDB). Exibir os estados "salvo neste aparelho", "sincronização pendente" e "sincronizado". Sincronizar ao retomar conexão ou abrir o aplicativo.
2. Fase 2, pacote de estudo offline: configurar PWA e service worker para os arquivos estáticos; permitir descarregar questões, gabaritos, explicações, revisões, flashcards e tarefas. Proposta inicial: pacote ajustável com até 200 questões e 50 cartões.
3. Fase 3, integridade: operações com identificadores únicos para reenvio idempotente, sem duplicar respostas; preservar histórico, cronologia e revisão espaçada. Resolver conflitos entre dados locais e Base44 sem sobrescrever respostas legítimas.
4. Fase 4, recuperação: comando "Sincronizar agora", indicador de operações pendentes e backup exportável das pendências.

## Cuidados e limites
- No iPhone, dados locais de websites podem ser removidos pelo sistema. Armazenamento offline não substitui backup na nuvem.
- A sincronização em segundo plano pode não funcionar no iOS. Sincronizar em primeiro plano ao reabrir e reconectar.
- Consultas a IA generativa continuarão exigindo internet.
- Garantir que o cache respeite a autenticação; nunca publicar coleções privadas do Base44.
- Tratar encerramentos inesperados, atualização do app, conflito entre dispositivos e falta de espaço local.
- Não alterar as coleções existentes, nem recriar ou descartar o histórico de respostas e flashcards.

## Critérios de aceitação futuros
- Após baixar conteúdo, responder 30 questões em modo avião, fechar e reabrir o aplicativo e manter todos os registros.
- Recuperar sinal e sincronizar sem duplicação ou desordem cronológica.
- Simular queda de rede durante a gravação, com reenvio seguro.
- Ver indicação explícita do estado da sincronização e opção manual.
- Testar em iPhone (Safari/PWA) e computador.

## Decisão
Somente registro da ideia no backlog. Não desenvolver sem pedido expresso do usuário.
