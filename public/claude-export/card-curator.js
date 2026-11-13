/* Reformulação de cartões de revisão ativa (12/11/2026).
 * Para cartões de revisao/<topico>.cartoes[i]: o estudante aponta o problema, o Omni
 * propõe a reescrita seguindo claude/Regras_de_Perguntas.md e ancorada no material do
 * tópico, o estudante edita e salva. O índice do cartão nunca muda (cartoes_aval usa
 * "<topico>@<i>"); se o Omni dividir o cartão, os novos entram no fim da lista.
 * O texto original fica guardado em "original".
 */
(function (global) {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PROBLEMAS = {
    pergunta_vaga: "Pergunta vaga ou com mais de uma resposta",
    resposta_errada: "Resposta errada ou desatualizada",
    mais_de_um_conceito: "Mistura mais de um conceito",
    resposta_longa: "Resposta longa demais para conferir",
    falta_contexto: "Falta contexto ou termo não definido",
    outro: "Outro",
  };
  const st = new Map(); // chave do cartão → {aberto, fase, issue, obs, res, erro}

  function alvo(S, k) {
    const m = /^(.+)@(\d+)$/.exec(String(k || ""));
    if (!m) return null;
    const rv = S && S.rv && S.rv.get(m[1]);
    const i = Number(m[2]);
    const card = rv && Array.isArray(rv.cartoes) ? rv.cartoes[i] : null;
    return card ? { topico: m[1], i, rv, card } : null;
  }
  const get = k => { if (!st.has(k)) st.set(k, { aberto: false, fase: "form", issue: "pergunta_vaga", obs: "", res: null, erro: "" }); return st.get(k); };

  function cardEditor(prefix, c) {
    return '<label class="ps">Pergunta</label><textarea data-cc-q="' + prefix + '" rows="3">' + esc(c.q) + "</textarea>" +
      '<label class="ps">Resposta (um item por linha)</label><textarea data-cc-a="' + prefix + '" rows="3">' + esc((c.a || []).join("\n")) + "</textarea>" +
      '<label class="ps">Tema · Fonte</label><div class="row"><input data-cc-tema="' + prefix + '" value="' + esc(c.tema || "") + '" placeholder="tema">' +
      '<input data-cc-src="' + prefix + '" value="' + esc(c.src || "") + '" placeholder="fonte"></div>';
  }

  function box(S, k) {
    const t = alvo(S, k);
    if (!t) return "";
    const s = get(k);
    if (!s.aberto) return '<button class="lnk" data-cc-abrir="' + esc(k) + '">Reformular cartão</button>';
    let h = '<div class="m-det qb-cc" data-cc="' + esc(k) + '" style="margin:0">';
    h += '<p><b>Reformular cartão</b> <span class="ps">· o original fica guardado</span></p>';
    if (s.fase === "form" || s.fase === "run" || s.fase === "erro") {
      h += '<label class="ps">O que está ruim?</label><select data-cc-issue>' +
        Object.entries(PROBLEMAS).map(([v, l]) => '<option value="' + v + '"' + (s.issue === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select>";
      h += '<label class="ps">Observação (opcional)</label><textarea data-cc-obs rows="2" placeholder="Ex.: a pergunta não diz se é prazo em dias ou sessões">' + esc(s.obs) + "</textarea>";
      if (s.erro) h += '<p class="ps" style="color:var(--errado)">' + esc(s.erro) + "</p>";
      h += '<div class="row"><button class="btn small" data-cc-pedir ' + (s.fase === "run" ? "disabled" : "") + ">" + (s.fase === "run" ? "O Arquiteto reformulando…" : "Pedir reformulação ao Arquiteto") + "</button>" +
        '<button class="btn ghost small" data-cc-manual>Editar eu mesmo</button><button class="btn ghost small" data-cc-fechar>Cancelar</button></div>';
    } else {
      const r = s.res;
      if (r.parecer) h += '<p class="ps"><b>Parecer:</b> ' + esc(r.parecer) + "</p>";
      if ((r.problemas || []).length) h += '<ul class="exl">' + r.problemas.map(p => "<li>" + esc(p) + "</li>").join("") + "</ul>";
      h += cardEditor("0", r.cartoes[0]);
      r.cartoes.slice(1).forEach((c, j) => { h += '<p class="ps" style="margin-top:8px"><b>Cartão novo ' + (j + 1) + "</b> (entra no fim do tópico)</p>" + cardEditor(String(j + 1), c); });
      h += '<div class="row" style="margin-top:6px"><button class="btn small" data-cc-salvar>Salvar</button><button class="btn ghost small" data-cc-fechar>Cancelar</button></div>';
      h += '<p class="ps">Confira com a fonte antes de salvar. Sua avaliação deste cartão continua no histórico.</p>';
    }
    return h + "</div>";
  }

  function lerEditor(root, prefix) {
    const v = sel => (root.querySelector(sel + '="' + prefix + '"]') || {}).value || "";
    return {
      q: v("[data-cc-q").trim(),
      a: v("[data-cc-a").split(/\r?\n/).map(x => x.trim()).filter(Boolean),
      tema: v("[data-cc-tema").trim(),
      src: v("[data-cc-src").trim(),
    };
  }

  /* hooks: {S, rerender, ask(payload), salvarRevisao(topico, doc), referencia(topico), toast} */
  function wire(container, hooks) {
    const S = hooks.S;
    container.querySelectorAll("[data-cc-abrir]").forEach(b => b.addEventListener("click", () => {
      get(b.dataset.ccAbrir).aberto = true; hooks.rerender();
    }));
    container.querySelectorAll("[data-cc]").forEach(root => {
      const k = root.dataset.cc, s = get(k), t = alvo(S, k);
      if (!t) return;
      root.querySelector("[data-cc-issue]")?.addEventListener("change", e => { s.issue = e.target.value; });
      root.querySelector("[data-cc-obs]")?.addEventListener("input", e => { s.obs = e.target.value; });
      root.querySelectorAll("[data-cc-fechar]").forEach(b => b.addEventListener("click", () => { st.delete(k); hooks.rerender(); }));
      root.querySelector("[data-cc-manual]")?.addEventListener("click", () => {
        s.res = { parecer: "", problemas: [], cartoes: [{ tema: t.card.tema || "", q: t.card.q || "", a: t.card.a || [], src: t.card.src || "" }] };
        s.fase = "ok"; hooks.rerender();
      });
      root.querySelector("[data-cc-pedir]")?.addEventListener("click", async () => {
        s.fase = "run"; s.erro = ""; hooks.rerender();
        try {
          const res = await hooks.ask({
            task: "curate-card",
            topico: (t.rv.mapa && t.rv.mapa.centro) || t.rv.topico || t.topico,
            card: { tema: String(t.card.tema || ""), q: String(t.card.q || ""), a: (t.card.a || []).map(String), src: String(t.card.src || "") },
            issueType: s.issue,
            userObservation: s.obs,
            referencia: hooks.referencia ? hooks.referencia(t.topico) : undefined,
          });
          if (!res || !Array.isArray(res.cartoes) || !res.cartoes.length) throw new Error("O Arquiteto não devolveu um cartão");
          s.res = res; s.fase = "ok";
        } catch (err) {
          s.fase = "erro";
          s.erro = "Reformulação indisponível agora (" + (err && err.message || "sem conexão") + "). Você pode usar \"Editar eu mesmo\".";
        }
        hooks.rerender();
      });
      root.querySelector("[data-cc-salvar]")?.addEventListener("click", () => {
        const novos = s.res.cartoes.map((_, j) => lerEditor(root, String(j))).filter(c => c.q && c.a.length);
        if (!novos.length) { hooks.toast && hooks.toast("A pergunta e a resposta não podem ficar vazias."); return; }
        const cartoes = t.rv.cartoes.slice();
        const atual = cartoes[t.i];
        cartoes[t.i] = Object.assign({}, atual, novos[0], {
          original: atual.original || { tema: atual.tema || "", q: atual.q || "", a: atual.a || [], src: atual.src || "" },
          reformuladoEm: new Date().toISOString(),
          reformuladoPor: s.res.parecer ? "O Arquiteto + estudante" : "estudante",
        });
        novos.slice(1).forEach(c => cartoes.push(Object.assign({}, c, { derivadoDe: t.topico + "@" + t.i, criadoEm: new Date().toISOString() })));
        const doc = Object.assign({}, t.rv, { cartoes, atualizadoEm: new Date().toISOString() });
        delete doc.id;
        hooks.salvarRevisao(t.topico, doc);
        st.delete(k);
        hooks.toast && hooks.toast(novos.length > 1 ? "Cartão reformulado e " + (novos.length - 1) + " novo(s) criado(s)." : "Cartão reformulado.");
        hooks.rerender();
      });
    });
  }

  global.QBCardCurator = { box, wire, alvo, PROBLEMAS, _st: st };
})(typeof window !== "undefined" ? window : globalThis);
