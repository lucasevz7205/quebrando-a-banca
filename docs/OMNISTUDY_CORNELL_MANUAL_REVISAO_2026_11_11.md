# OmniStudy AI 2.1 — Caderno Cornell: escrita manual, geração e revisão assistida

**Data:** 11/11/2026  
**Ambiente:** Quebrando a Banca, `/estudar`, OmniStudy IA → Caderno Cornell IA.

## Implementação entregue

O módulo existente apenas recebia um texto e gerava uma folha que o aluno visualizava. A atualização adicionou um editor completo e uma revisão supervisionada, preservando as folhas antigas no armazenamento local do OmniStudy (chave `qb_omnistudy_state_v2`).

**Editor manual**
- `Nova folha manual` cria registro local sem IA nem créditos.
- Campos editáveis: título, matéria/assunto, pistas/perguntas (uma por linha), notas centrais, síntese final e fonte de referência opcional.
- Edição por digitação persistida automaticamente em `localStorage`; a prévia Cornell mantém divisão de aproximadamente 30%/70% com rodapé e botão de ocultar notas para recuperação ativa.
- Ao alterar uma folha, um parecer de IA anterior é invalidado para impedir aplicação sobre conteúdo alterado.
- Folhas antigas (inclusive as do formato antigo) são exibidas e editáveis. Nenhuma exclusão automática.

**Geração por IA**
- Entrada de assunto + texto-base fornecido pelo estudante; envio ao `summarize-cornell` já existente.
- A resposta cria nova folha com perguntas, notas, síntese e ações de revisão; sem substituir notas antigas.
- Sem conexão real, informa que a geração não está disponível, sem apresentar fallback genérico como IA autenticada.

**Revisão/correção IA com fonte opcional**
- `review-cornell` (nova tarefa de servidor autenticado `src/lib/omnistudy-ai.js`) recebe folha editável e texto de fonte opcional.
- Resposta estruturada contém veredicto, problemas identificados por área e versão sugerida da folha, mas **não grava sugestões automaticamente**.
- Com texto-fonte de ao menos 80 caracteres, avalia também possíveis inconsistências contra a fonte fornecida e só mostra excertos que existam literalmente nela. **Não certifica autenticidade de fonte, vigência da legislação nem prova que o gabarito foi juridicamente homologado.**
- Sem fonte, sempre apresenta `revisao_preliminar` e aviso de que não houve verificação factual independente.
- Aluno pode inspecionar texto sugerido, aplicar, descartar ou desfazer a última aplicação. Revisões concorrentes são descartadas quando a folha muda enquanto a IA responde.
- Se a IA falhar, os dados originais permanecem, com erro explícito; não há simulação offline de checagem factual.

## Arquivos alterados/adicionados

- `src/lib/cornell-review.js`: normalização de retornos e conferência de trechos literais.
- `src/lib/omnistudy-ai.js`: nova tarefa `review-cornell` com `requireUser`, schema Zod limitado e prompt de revisão.
- `public/claude-export/omnistudy-cornell.js`: editor completo, persistência manual, fluxo de revisão aprovada.
- `public/claude-export/omnistudy-cornell.css`: experiência responsiva.
- `public/claude-export/omnistudy-ai.js`: delegação do Cornell ao editor e erro explícito sem backend de IA.
- `src/components/qb/study-shell.html`: scripts/CSS do Cornell com versão de cache nova.
- `public/sw.js`: atualização de cache estático para v3, sem incluir conteúdo privado no Cache Storage.
- `tests/omnistudy-cornell-editor.test.mjs`: cobertura de criação, edição, parecer com/sem fonte, aceitação e undo, integração UI e evento simulado.
- `tests/omnistudy-header.test.mjs`, `tests/published-pwa-update.test.mjs` e `tests/axon-shell-and-pwa.test.mjs`: expectativa de versão atualizada.

## Notas de segurança e limitações

- O conteúdo **é salvo neste navegador**, no armazenamento local já adotado pelo OmniStudy. Não foi implementada sincronização desse caderno entre dispositivos nem com outro login nesta alteração.
- A revisão IA **consome créditos da integração Base44 somente quando o aluno clica**. Digitar/editar folha não faz chamadas de IA.
- O texto-fonte é fornecido pelo aluno; a IA não navega de forma autônoma em legislação atualizada e não homologa fatos. 
- Não houve modificação em entidades `StudyAccount`, questões do Skull ou históricos de treino.
- Testes automatizados e compilação validam o fluxo de código; ainda não há QA visual autenticado em dispositivo.
