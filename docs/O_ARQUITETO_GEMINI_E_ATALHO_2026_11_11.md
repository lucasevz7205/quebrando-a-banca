# O Arquiteto — identidade, atalho universal e integração opcional Google Gemini

Data: 11/11/2026. Aplicativo: Quebrando a Banca, https://quebrando-a-banca-a2c91a3c.base44.app/estudar.

## Identidade e navegação

- O nome público do antigo **OmniStudy** é **O Arquiteto**. Os identificadores de código `QBOmniStudy`, a chave `qb_omnistudy_state_v2` e os dados existentes permanecem para garantir compatibilidade com as folhas Cornell e conversas salvas.
- O launcher **no canto inferior direito** utiliza o botão `#qb-chat-launch` e abre `#qb-architect-menu` com seis opções concretas:
  - Conversar com O Arquiteto → aba Tutor Socrático;
  - Caderno Cornell → edição, geração, revisão e aprovação;
  - Laboratório Feynman;
  - Flashcards e scanner;
  - Pomodoro e áudio;
  - Desempenho e revisões → preserva o assistente local de estatísticas da versão anterior.
- O menu flutuante não fica mais exclusivo do administrador: foi habilitado também aos candidatos com área de estudos ativa (inclusive PCMG/Skull). A visualização administrativa somente leitura permanece excluída.
- O atalho de teclado Alt+O continua abrindo o estúdio e o botão adicional de acesso do cabeçalho agora recebe o nome O Arquiteto.
- O assistente local mantém comandos de desempenho, dificuldades, planejamento e revisões com dados da própria conta. Consultas generativas abertas pelo assistente local agora chamam a mesma função de IA do Arquiteto, após confirmação explícita.

## Gemini — integração por API preparada, sem credencial atual

- Backend novo: `src/lib/architect-gemini.js`. Cliente para `generateContent` via HTTPS, modelo `gemini-3.5-flash`, respostas JSON quando solicitadas, tempo limite, tratamento explícito de quota/credencial/modelo; a chave é enviada apenas no header `x-goog-api-key` a partir do segredo de servidor.
- `src/lib/omnistudy-ai.js` mantém autenticação de usuário por `requireUser`, aceita `provider:base44|gemini` nas seis tarefas e encaminha ao serviço correto. Cada requisição é acionada explicitamente; não há fallback silencioso entre provedores.
- O status autenticado `getArchitectAIStatus` revela apenas `geminiConfigured` e o nome do modelo, nunca o conteúdo do segredo.
- `src/routes/_authed/estudar.jsx` expõe ação de ponte `architectProviderStatus`; o cliente usa-a para habilitar o botão Gemini apenas se a chave estiver configurada.
- Seleção visível no painel do Arquiteto: **Base44**, padrão já funcional, ou **Google Gemini**. Sem chave, mostra `Google Gemini · não conectado` desabilitado, com orientação para configurar `GEMINI_API_KEY`.
- **Situação verificada:** nenhuma chave Gemini encontrada em Secrets do Base44 na inspeção desta alteração. Logo, a integração está implementada, porém **a conexão real ainda depende da configuração pelo administrador**. Não afirmar que houve chamada autenticada real ao Google sem chave.
- A assinatura Google AI Pro / Gemini Pro e as cotas do AI Studio não equivalem automaticamente às cotas da API de desenvolvimento. A chave e eventuais custos da API são gerenciados no Google AI Studio/Google Cloud. Referências: https://ai.google.dev/gemini-api/docs/google-ai-plans?hl=pt-br e https://ai.google.dev/gemini-api/docs/api-key?hl=pt-br.
- **Configuração futura necessária:** criar chave autorizada de API em https://aistudio.google.com/api-keys, adicionar como segredo `GEMINI_API_KEY` nas configurações do aplicativo Base44, recarregar o app; após isso a interface poderá habilitar Gemini. Nunca colar ou guardar a credencial em arquivos `public/`, conversas ou componentes cliente.

## Compatibilidade

- Conteúdo Cornell, cartões e histórico do Arquiteto no armazenamento local do navegador são mantidos no formato antigo.
- Nenhuma entidade `StudyDocument`, questão, resposta, registro de aluno ou projeto de concurso foi modificada.
- O Service Worker recebe versão de cache nova para publicar scripts e CSS no endereço estável do PWA; a origem e o `start_url=/estudar` permanecem invariáveis.
- Testes incluem adapter Gemini com requisição simulada (sem chave real), proteção do segredo, cota excedida, menu flutuante com seis opções, abertura de abas, retenção do assistente local e seletor de provedor.

O teste automatizado não substitui a conferência visual autenticada em dispositivo ou uma chamada ao Gemini após a chave ser configurada.
