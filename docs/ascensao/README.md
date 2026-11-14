# PR1 — Quebrando a Banca: A Ascensão

**Objetivo:** adicionar uma prévia visual isolada do Design System exportado pelo Claude Design.
**Origem:** `Quebrando a Banca Design System.zip` fornecido pelo proprietário em 14/11/2026.
**Repositório identificado:** `lucasevz7205/quebrando-a-banca`, commit congelado `addec00b2e880e6ba85c48709285c84a26beb5dc`.

## O que o pacote faz
- Acrescenta arquivos **somente** em `public/qb-ascensao-preview/` e este documento `docs/ascensao/README.md`.
- Disponibiliza um UI kit navegável em `/qb-ascensao-preview/ui_kits/app/index.html` após publicar uma branch de teste.
- Não altera `src/`, CSS carregado pelo app, roteamento, banco de dados, serviços, SRS, questões, flashcards, contas ou tutores reais.
- Todas as respostas da prévia são **demonstrativas**. Nunca usar como evidência de integração real.
- Não inclui fontes `.woff2`: foram excluídas intencionalmente. A interface pode usar fontes substitutas.

## Uso com GitHub e Antigravity
1. Em GitHub, crie uma branch nova a partir de `main`, por exemplo `design/ascensao-preview`.
2. Extraia o conteúdo do ZIP **na raiz do clone da branch**, preservando as pastas `public/` e `docs/`.
3. Faça commit apenas nessa branch e abra um **Draft Pull Request**.
4. Execute `npm run build` e os testes do repositório; verifique a prévia em desktop e mobile.
5. **Não mescle** a PR antes da inspeção de qualidade e de um backup independente dos registros de produção.

## O que não fazer
- Não usar a prévia como novo `/estudar`.
- Não adicionar loaders da Base44 nem dados de usuário ao UI kit.
- Não importar globalmente `styles.css`: seus seletores `:root`, `body`, `button` afetariam o aplicativo legado.
- Não trocar IDs de questões/nós, nem gravar dados a partir do protótipo.
- Não publicar diretamente na Base44 sem testes de ponta a ponta.

## Próximas PRs
- **PR2:** adaptar tokens para `.qb-ascensao` e componentes React controlados, com feature flag administrativa.
- **PR3:** substituir a camada visual de Dashboard, Mapas, Treinar e Flashcards por módulo, reaproveitando os serviços existentes.
- **PR4:** testes em contas secundárias e ativação progressiva após validação de histórico, SRS, remissões e tutor Omni.

## Dependência do protótipo
`ui_kits/app/index.html` carrega React/Babel via unpkg (CDN). A prévia exige rede; não deve ser tomada como prova de funcionamento offline.
