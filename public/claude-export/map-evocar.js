/* Evocar antes de ler no mapa 3D, com correção do Omni (11/11/2026).
 * Fluxo por conceito: escrever de memória → (opcional) Omni corrige e aponta o
 * trecho errado → ver a explicação → marcar Lembrei / Parcial / Não lembrei.
 * Só a página grava, na coleção "evocacoes"; nada em respostas ou questões.
 */
(function (global) {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const AVAL = { s: "Lembrei", p: "Parcial", n: "Não lembrei" };
  const VER = { lembrei: ["c", "Lembrou"], parcial: ["b", "Parcial"], nao: ["e", "Não lembrou"] };
  const state = new Map(); // chave topico:path → {resp, fase, ia, erroIA, aval}

  const chave = (topic, path) => topic + ":" + path;
  const docId = key => key.replace(/[^A-Za-z0-9_\-.~:@+]/g, "_");
  function get(key) {
    if (!state.has(key)) state.set(key, { resp: "", fase: "escrever", ia: null, erroIA: "", aval: null });
    return state.get(key);
  }

  /* destaca na tentativa os trechos que o Omni apontou como errados */
  function marcarErros(texto, erros) {
    let html = esc(texto);
    for (const e of erros || []) {
      if (!e.trecho) continue;
      const alvo = esc(e.trecho);
      const i = html.indexOf(alvo);
      if (i >= 0) html = html.slice(0, i) + '<mark class="qb-evo-erro">' + alvo + "</mark>" + html.slice(i + alvo.length);
    }
    return html;
  }

  function iaHTML(st) {
    if (st.fase === "corrigindo") return '<p class="qb-evo-status" role="status">Omni corrigindo a sua evocação…</p>';
    if (st.erroIA) return '<p class="qb-evo-status qb-evo-falha" role="status">' + esc(st.erroIA) + "</p>";
    const r = st.ia;
    if (!r) return "";
    const v = VER[r.veredito] || VER.parcial;
    const li = (t, xs) => xs.length ? "<p><b>" + t + "</b></p><ul>" + xs.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "";
    const erros = r.erros.length
      ? "<p><b>Onde está o erro</b></p><ul>" + r.erros.map(e =>
          "<li>" + (e.trecho ? "“" + esc(e.trecho) + "”: " : "") + esc(e.problema) +
          (e.correcao ? '<br><span class="qb-evo-certo">Correto: ' + esc(e.correcao) + "</span>" : "") + "</li>").join("") + "</ul>"
      : "";
    return '<div class="qb-evo-ia"><p><span class="pill ' + v[0] + '">Omni: ' + v[1] + "</span></p>" +
      '<p class="qb-evo-sua"><b>Sua evocação:</b> ' + marcarErros(st.resp, r.erros) + "</p>" +
      erros + li("Faltou", r.faltou) + li("Acertou", r.acertou) +
      (r.pergunta ? '<p class="qb-evo-pergunta"><b>Recupere:</b> ' + esc(r.pergunta) + "</p>" : "") +
      '<p class="qb-evo-nota">Correção de IA a partir da explicação do mapa; a decisão de marcar é sua.</p></div>';
  }

  /* ctx: {topic, path, title, label, detailHTML, tour:{i,n}|null, iaDisponivel} */
  function render(ctx) {
    const key = chave(ctx.topic, ctx.path), st = get(key);
    const head = '<p class="qb-evo-kicker">Evocar antes de ler</p><h3 class="qb-evo-titulo">' + esc(ctx.title) + "</h3>";
    const tour = ctx.tour ? '<p class="qb-evo-tour">Percurso do mapa · conceito ' + ctx.tour.i + " de " + ctx.tour.n + "</p>" : "";
    if (st.fase === "escrever" || st.fase === "corrigindo") {
      return '<section class="qb-evo" data-evo="' + esc(key) + '">' + tour + head +
        '<label class="qb-evo-label" for="qb-evo-resp">O que este conceito significa? Escreva de memória a regra, um exemplo e a pegadinha, se lembrar.</label>' +
        '<textarea id="qb-evo-resp" class="qb-evo-resp" data-evo-resp maxlength="2000" rows="4" placeholder="Sem olhar: escreva o que você lembra…">' + esc(st.resp) + "</textarea>" +
        '<div class="qb-evo-acoes">' +
        (ctx.iaDisponivel ? '<button type="button" class="btn small" data-evo-ia ' + (st.fase === "corrigindo" ? "disabled" : "") + ">Corrigir com Omni</button>" : "") +
        '<button type="button" class="btn ghost small" data-evo-ver>Comparar com a explicação</button>' +
        '<button type="button" class="btn ghost small" data-evo-nao>Não lembro</button></div>' +
        iaHTML(st) + "</section>";
    }
    const avalBtns = Object.entries(AVAL).map(([v, t]) =>
      '<button type="button" class="chip" data-evo-aval="' + v + '" aria-pressed="' + (st.aval === v) + '">' + t + "</button>").join("");
    return '<section class="qb-evo qb-evo-aberta" data-evo="' + esc(key) + '">' + tour + head +
      (st.resp && !st.ia ? '<p class="qb-evo-sua"><b>Sua evocação:</b> ' + esc(st.resp) + "</p>" : "") +
      iaHTML(st) +
      '<div class="qb-evo-explicacao">' + (ctx.detailHTML || "") + "</div>" +
      '<div class="qb-evo-avaliar"><span>Compare e marque:</span><div class="chips">' + avalBtns + "</div></div>" +
      (ctx.tour ? '<button type="button" class="btn small" data-evo-proximo ' + (st.aval ? "" : "disabled") + ">" +
        (ctx.tour.i < ctx.tour.n ? "Próximo conceito" : "Encerrar percurso") + "</button>" : "") +
      "</section>";
  }

  /* hooks: {ask(payload)→Promise, salvar(doc), rerender(), proximo(), node:{rotulo,etiqueta,explicacao,exemplo,pegadinha,fonte,topico}} */
  function wire(container, ctx, hooks) {
    const key = chave(ctx.topic, ctx.path), st = get(key);
    const box = container.querySelector('[data-evo="' + CSS.escape(key) + '"]');
    if (!box) return;
    const area = box.querySelector("[data-evo-resp]");
    area?.addEventListener("input", () => { st.resp = area.value; });
    box.querySelector("[data-evo-ia]")?.addEventListener("click", async () => {
      st.resp = (area?.value || "").trim();
      if (st.resp.length < 3) { st.erroIA = "Escreva ao menos uma frase antes de pedir a correção."; hooks.rerender(); return; }
      st.fase = "corrigindo"; st.erroIA = ""; hooks.rerender();
      try {
        st.ia = await hooks.ask({ task: "evocar-corrigir", ...hooks.node, tentativa: st.resp });
        st.fase = "revelado";
      } catch (err) {
        st.fase = "escrever";
        st.erroIA = "Omni indisponível agora (" + (err?.message || "sem conexão") + "). Compare você mesmo com a explicação.";
      }
      hooks.rerender();
    });
    box.querySelector("[data-evo-ver]")?.addEventListener("click", () => {
      st.resp = (area?.value || "").trim(); st.fase = "revelado"; hooks.rerender();
    });
    box.querySelector("[data-evo-nao]")?.addEventListener("click", () => {
      st.resp = ""; st.fase = "revelado"; st.aval = "n"; registrar(ctx, st, hooks); hooks.rerender();
    });
    box.querySelectorAll("[data-evo-aval]").forEach(b => b.addEventListener("click", () => {
      st.aval = b.dataset.evoAval; registrar(ctx, st, hooks); hooks.rerender();
    }));
    box.querySelector("[data-evo-proximo]")?.addEventListener("click", () => {
      state.delete(key); hooks.proximo();
    });
  }

  function registrar(ctx, st, hooks) {
    const key = chave(ctx.topic, ctx.path), prev = hooks.anterior?.(docId(key)) || null;
    const hist = (prev?.hist || []).concat([Object.assign(
      { v: st.aval, em: new Date().toISOString() },
      st.resp ? { resp: st.resp.slice(0, 1000) } : {},
      st.ia ? { ia: st.ia.veredito, errosIA: st.ia.erros.length } : {})]).slice(-20);
    hooks.salvar(docId(key), { topico: ctx.topic, path: ctx.path, titulo: ctx.title, ult: st.aval, hist, atualizadoEm: new Date().toISOString() });
  }

  function reset(topic, path) { state.delete(chave(topic, path)); }
  global.QBMapEvocar = { render, wire, reset, marcarErros, AVAL, _state: state };
})(typeof window !== "undefined" ? window : globalThis);
