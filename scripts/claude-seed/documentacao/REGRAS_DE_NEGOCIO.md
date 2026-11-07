# Regras de negócio implementadas (no código)

**Datas:** prova `PROVA=2027-01-17`; `LIMITE=2027-01-10` (depois dele, tudo é revisão diária).

**Revisão espaçada de questões:** níveis `INT=[1,3,7,15,30]` dias; teto `teto(d)=max(1, floor(20% dos dias até a prova))`; erro, branco ou chute → 1 dia e caderno de erros; acerto com certeza sobe nível, com dúvida repete; acerto fora do caderno no mínimo 7 dias (certeza) ou 3 (dúvida) (`proxDe`). Limite diário `LIMITE_DIA=50` revisões, erros do caderno primeiro e depois os mais atrasados, intercalados por capítulo (`devidas`). Saída do caderno: dois acertos seguidos sem chute em dias diferentes. Repescagem no fim da rodada (não conta no placar).

**Erro persistente:** `jaErrou(r)` — uma questão errada ou em branco uma vez conta sempre como erro nos percentuais.

**Fora do cálculo:** capítulos `SIM-*` (cópias de erros do simulado) e itens com `foraNivel` saem dos percentuais; `foraNivel` também sai da revisão e do simulado (`foraQ`).

**Domínio:** status automático do tópico (em estudo, revisando com 80% feito, dominado com 85% de acerto e nada no caderno); "dominado" exige retenção de 7+ dias.

**Cartões de revisão ativa (SRS):** escrever a resposta → ver → comparar → marcar Novamente/Difícil/Bom/Fácil. Escada igual à das questões: Novamente → nível 0 (1 dia e volta na sessão); Difícil repete; Bom +1; Fácil +2; mesmo teto (`srsCalc`). Até `CART_REV_DIA=50` revisões/dia por prioridade (Novamente, nível mais baixo, mais atrasado) e `NOVOS_DIA=50` novos/dia. Sessão intercalada sem dois seguidos do mesmo tópico (`filaMix`). Cartão firme: intervalo ≥ 7 com Bom/Fácil. Marcas antigas: Lembrei=Bom, Parcial=Difícil.

**Calibração:** confiança 1/2/3 antes do gabarito; acerto com certeza dos últimos 14 dias com meta de 90%; regra de decisão Cebraspe (marcar só com acerto > 50%).

**Palavras de alcance:** regex `TRAVAS`, destacadas depois da resposta.

**Simulado:** objetivo (P1/P2) e discursivo; gabarito só na entrega; registra trocas de resposta e origem dos erros.

**Ranking de mecanismos:** incidência = itens com o mecanismo principal ÷ itens válidos da matéria (sem anulados e sem duplicatas) — `analise/ranking.metodo`.

**Proteção de dados do estudante:** o assistente não sobrescreve `respostas` nem o `status` do edital (diretriz do projeto).

Critérios e métodos completos (fontes científicas, regras de perguntas, mapa mental, discursiva): `recursos/regras_do_projeto/`.
