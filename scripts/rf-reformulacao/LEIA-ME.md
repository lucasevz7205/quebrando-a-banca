# RF 2.1 a 2.8 — 10/11/2026

Referência pedagógica: revisões cp-2 e cp-9 já presentes no banco.
Escopo: 8 revisões, 139 nós enriquecidos e 139 flashcards (59 anteriores preservados na mesma posição; 80 acrescentados).
Questões: 160 inéditas C/E (20 por assunto), aguardando revisão humana. Nenhuma questão foi inserida na coleção de treino nem nenhuma resposta foi criada. Área de conferência no Laboratório de Questões.
As referências das apostilas foram preservadas; os PDFs originais não foram reabertos nesta rodada. Explicações, exemplos e perguntas novos são incrementos pedagógicos.
Conferência complementar: LC 95, arts. 10 e 11, texto atualizado da Câmara; documentação de listas de frases da Microsoft; avaliação WER no curso Hugging Face. Essas consultas não equivalem à revisão integral das apostilas.

## Arquivos
- antes-2026-11-10.json: registros originais, partes e documentos hidratados, incluindo referências CP.
- depois-2026-11-10.json: revisão final exata dos oito documentos.
- unidades-2026-11-10.json: 80 unidades editoriais que fundamentam as ampliações.
- ../../src/data/rf-questoes-revisao-2026-11-10.json: lote de questões (caminho a partir de scripts/rf-reformulacao: usar a raiz src/data).
- validar.mjs: confere nós, ligações, preservação de cartões e quantidades.

## Armazenamento e restauração
O checkpoint de código não reverte sozinho o banco.
Os documentos finais usam marcadores _claudeParts e partes de 7000 caracteres, conforme a ponte do app.
Para restaurar, confira antes se não houve edições posteriores. Restaure payload_chunk dos registros originais de partes e payload_json/source dos oito pais ClaudeDocument/revisao a partir de antes-2026-11-10.json. Não toque em edital, respostas, rodadas, cartoes_aval ou contas. Para pais originalmente inline, restaurar seu payload_json basta; partes excedentes são ignoradas. Para pais originalmente fragmentados, coloque primeiro o conteúdo original hidratado inline (todos cabem), restaure suas partes e só então retorne o marcador original. Isso evita expor fragmentos misturados.
Checkpoint anterior: 6af34f15312d0038007f8f4f.

## Verificação
Leitura de retorno do banco: os 8 documentos recompostos coincidem integralmente com depois-2026-11-10.json.
Os 8 registros do edital permanecem idênticos. IDs de todos os nós e perguntas/respostas dos 59 cartões anteriores foram preservados.
Questões têm gabarito comentado, correção integral dos itens E e vínculos por mapaNoId. Não foi registrada aprovação humana.
