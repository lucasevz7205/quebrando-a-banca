# Arquitetura de subagentes (Claude Code)

**Data:** 12/11/2026. **Versão do Claude Code verificada:** 2.1.322.
**Objetivo:** gastar menos tokens no total e usar menos os modelos caros, sem perder qualidade nem funcionalidades.

## Papéis

| Agente | Modelo | Ferramentas | Quando usar | Relatório |
|---|---|---|---|---|
| Principal (sessão) | o da sessão | todas | Planejar, decidir a arquitetura, especificar a tarefa, integrar, validar e fazer o PR | — |
| `code-scout` | Haiku | Glob, Grep, Read | Localizar código quando a busca exige varrer vários arquivos ou padrões | ≤ 200 palavras |
| `bug-investigator` | Sonnet | Glob, Grep, Read, Bash | Achar a causa raiz de um bug ou teste falhando, sem editar | ≤ 300 palavras |
| `implementer` | Sonnet | + Edit, Write | Implementar uma tarefa já especificada e validar | ≤ 300 palavras |
| `test-writer` | Sonnet | + Edit, Write (só em `tests/`) | Escrever testes `node:test` para uma mudança ou para reproduzir um bug | ≤ 200 palavras |
| `architect-reviewer` | Opus | Glob, Grep, Read, Bash | Segunda opinião em mudança de alto risco: dados do estudante, agenda, segurança, refatoração ampla | ≤ 300 palavras |

As definições ficam em `.claude/agents/*.md`, no formato oficial: frontmatter com `name`, `description`, `tools` e `model` (`haiku`, `sonnet` ou `opus`).

## Regras de economia

1. **Não delegar o que cabe numa operação.** Um Grep, uma troca de `?v=`, uma linha de código ou rodar um teste: o principal faz direto. Cada subagente começa do zero e relê contexto, então só compensa quando poupa leitura no principal.
2. **Delegar com o mínimo necessário.** A tarefa enviada traz:
   - os arquivos, com caminho e, se possível, as linhas;
   - o requisito e os critérios de aceitação;
   - o comando de teste.
   
   Não mande o histórico da conversa.
3. **Escolher o modelo mais barato que resolve:**
   - Haiku para localizar;
   - Sonnet para entender e mudar código;
   - Opus só quando um erro custaria caro, como migração de dados, regra de agenda ou segurança.
4. **Sem releitura.** O principal guarda as conclusões do `code-scout` e do `bug-investigator` e não relê os mesmos arquivos. Os agentes leem por trecho (Grep e offset/limit), nunca o `study-shell.html` inteiro.
5. **Testes sem IA.** `scripts/check.sh` (ou `npm run check`) confere a sintaxe dos JS alterados, roda `node --test` e separa as falhas reais das falhas de ambiente (pacote não instalado). O resultado é lido como está; nenhum agente "interpreta" uma saída que já diz passou ou falhou.
6. **Sem dois agentes no mesmo arquivo.** Tarefas paralelas que tocam arquivos diferentes podem rodar juntas. Se tocarem o mesmo arquivo, rodam em sequência ou cada uma numa worktree própria (`isolation: "worktree"`), e o principal integra.
7. **Validação final é do principal:**
   - `scripts/check.sh` sem falhas reais;
   - revisão do diff;
   - PR com descrição.
   
   O `architect-reviewer` entra só nas mudanças de alto risco.

## Fluxos típicos

- **Bug:** o principal lê o sintoma → `bug-investigator` (Sonnet) acha a causa → o principal decide → `implementer` (Sonnet) corrige com teste → `scripts/check.sh` → PR.
- **Função pequena:** o principal faz direto e roda `scripts/check.sh`.
- **Função média:** `code-scout` (Haiku) mapeia os pontos → o principal especifica → `implementer` → `scripts/check.sh` → PR.
- **Mudança de risco:** a função média + `architect-reviewer` (Opus) antes do PR.

## Compatibilidade verificada

- O frontmatter dos 5 agentes foi validado como YAML, só com campos aceitos e modelo em `haiku|sonnet|opus`.
- `scripts/check.sh` rodou neste ambiente: sintaxe ok em 65 arquivos; 241 testes passaram; 10 falhas, todas de ambiente (`postcss` e `zod` não instalados aqui), nenhuma real.
- Os agentes passam a aparecer em `/agents` ao abrir uma sessão nova do Claude Code no repositório.
