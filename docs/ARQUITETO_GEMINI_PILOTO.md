# Piloto Gemini para O Arquiteto — Quebrando a Banca

## Escopo exato
Implementação opcional de provedor externo **somente para** `task: "tutor-chat"` no Tutor Omni/O Arquiteto.

- O código e as regras `TUTOR_RULES`/quatro modos (Socrático, Examinador CEBRASPE, Feynman simples, Desafio) são preservados.
- `QB_TUTOR_PROVIDER` ausente ou diferente de `gemini` => serviço original `Core.InvokeLLM`.
- `QB_TUTOR_PROVIDER=gemini` => API Gemini `generateContent`, via servidor e segredo `Arquiteto` (alternativamente `ARQUITETO` ou `GEMINI_API_KEY`).
- Erros, ausência da chave, quota e timeout da API Gemini **não** disparam `InvokeLLM` Base44 automaticamente.
- Outras tarefas do Omni (Feynman evaluate, curadoria, geração, Cornell, etc.) **continuam usando Base44** e podem consumir créditos de integração.
- Não altera entidades, schemas, respostas, progresso, remissões, material, UI ou usuários.

## Arquivos
- `src/lib/gemini-tutor.js`: adaptador para Gemini sem import de SDK ou segredos.
- `src/lib/omnistudy-ai.js`: escolha de provedor feita no servidor somente dentro de `tutor-chat`.
- `tests/gemini-tutor.test.mjs`: testes com fetch simulado (sem chamadas reais pagas).

## Segredos: configurar exclusivamente na Base44, nunca no HTML/repositório/chat
No painel do app, abrir configurações dos **segredos/variáveis de ambiente do backend**:
1. Criar uma chave Gemini no Google AI Studio (projeto de teste, acompanhar quotas e faturamento).
2. Configurar o segredo `Arquiteto` com o valor da chave no backend. A integração também reconhece `ARQUITETO` (quando o painel exigir nomes em maiúsculas) e `GEMINI_API_KEY` para compatibilidade.
3. Usar `QB_TUTOR_PROVIDER=gemini` **somente quando aprovado o início do teste**.
4. Opcional: `QB_GEMINI_MODEL=gemini-3.5-flash-lite` (padrão já configurado no código).
5. Para voltar imediatamente ao modelo Base44, alterar `QB_TUTOR_PROVIDER=base44` ou remover esse segredo.

Uma assinatura da interface Gemini/Google AI Studio não garante créditos gratuitos da API.

## Publicação e segurança
Esta mudança pode ser compilada e testada no sandbox sem atualizar o domínio publicado. Fazer deploy da versão com o código antes de ativar `QB_TUTOR_PROVIDER=gemini`.
A chave jamais vai para `VITE_*` nem para o navegador. A solicitação vai do servidor autenticado à API Google com `x-goog-api-key`.

**Privacidade:** cada mensagem ao tutor Gemini transmite para o Google o texto da conversa, o nome do assunto, o resumo de dificuldades do estudante e o conteúdo recuperado do tópico (mapa/itens/pontos-chave/cartões, quando disponível). Validar essa transferência e regras de privacidade antes de ativar para outros estudantes; não incluir identificadores pessoais ou documentos sigilosos.

**Gasto:** Gemini é serviço de cobrança/cota separada. Configure limites e alarmes no Google Cloud/AI Studio. A integração do Gemini reduz uso de Base44 somente para `tutor-chat`; outros recursos de IA permanecem cobrados pela Base44. Não existe fallback automático pagante no tutor.

## Checklist de homologação
- [x] Testes do adaptador 7/7 (mock; sem gastar créditos externos).
- [x] `npm run build` passou com `base44:runtime`.
- [ ] Confirmar que o segredo `Arquiteto` ou `ARQUITETO` está registrado no backend e disponível para o aplicativo correto.
- [ ] Publicar a alteração de código e só depois ativar `QB_TUTOR_PROVIDER=gemini`.
- [ ] Testar conversa real autenticada em cada um dos 4 modos e comparar com respostas anteriores.
- [ ] Confirmar no painel de uso da API Google que houve chamada e que não houve nova chamada `InvokeLLM` para `tutor-chat`.
- [ ] Medir custo, latência, qualidade, respostas baseadas em material e bloqueio de gabarito.
- [ ] Registrar aceite e orientar rollback.

## Estado da suíte geral
Em 2026-11-15, `node --test --test-reporter=tap tests/*.test.mjs` apresentou 358/360 testes passando. Duas falhas preexistentes fora do escopo desta integração, em `tests/ascensao-study.test.mjs` (BrandHeader) e `tests/question-curator.test.mjs` (versão do cache SW). Os arquivos correspondentes não foram modificados neste piloto. Evitar publicar alegando que a suíte inteira passou.

## Rollback
- Provedor: remover `QB_TUTOR_PROVIDER` ou definir `base44`, sem alterar dados.
- Código: restaurar o checkpoint anterior ao experimento: `6af9b5633d817f20ed8b352c` (commit `91c9943716fb5a0065a5a2b4497e23e202a6f2c9`), observando alterações de outros agentes antes de restaurar.
