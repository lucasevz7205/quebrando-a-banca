/* Quebrando a Banca · composição determinística do simulado objetivo (regra de 22/11/2026).
 * Só entram itens de tópicos já vistos; dentro de cada matéria, a cota de cada tópico é
 * proporcional a 1 + incidência da banca (itens reais ligados ao tópico). Sem IA e sem
 * Math.random: a semente é a data, então a prévia e o início do simulado dão a mesma prova.
 * O que faltar vira plano de geração por tópico (itens "inédito Claude"), nunca item inventado aqui.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.QBSimComposicao = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const REGRA_DESDE = "2026-11-15";

  function semente(texto) {
    let h = 1779033703 ^ texto.length;
    for (let i = 0; i < texto.length; i++) { h = Math.imul(h ^ texto.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function prng(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  /* Maior resto (Hamilton): reparte `total` inteiros em proporção aos pesos; desempate por id. */
  function repartir(total, itens) {
    const soma = itens.reduce((s, x) => s + x.w, 0);
    const out = new Map(itens.map(x => [x.id, 0]));
    if (!itens.length || total <= 0 || soma <= 0) return out;
    const rest = [];
    let dado = 0;
    for (const x of itens) {
      const ideal = total * x.w / soma, base = Math.floor(ideal);
      out.set(x.id, base); dado += base; rest.push({ id: x.id, r: ideal - base });
    }
    rest.sort((a, b) => b.r - a.r || cmp(a.id, b.id));
    for (let i = 0; dado < total; i++, dado++) out.set(rest[i % rest.length].id, out.get(rest[i % rest.length].id) + 1);
    return out;
  }

  /* Dentro do tópico: itens ainda não usados em simulados primeiro, reais da banca antes dos autorais,
   * depois embaralhamento determinístico pela semente. */
  function ordenarPool(pool, usados, real, rnd) {
    return pool.map(q => ({ q, k: (usados.has(q.id) ? 2 : 0) + (real(q) ? 0 : 1) + rnd() * 0.5 }))
      .sort((a, b) => a.k - b.k || cmp(a.q.id, b.q.id)).map(x => x.q);
  }

  /* ctx: { blueprint:{blocos:[{prova,mats:[[sigla,nome,n]]}]}, topicos:[{id,sigla,titulo,foraEdital}],
   *        questoes:[q], topicoDe:q=>id|null, visto:t=>bool, real:q=>bool, elegivel:q=>bool,
   *        usados:Set(qid), semente:string } */
  function compor(ctx) {
    const rnd = prng(semente(String(ctx.semente || "")));
    const usados = ctx.usados || new Set();
    const porTopico = new Map();
    for (const q of ctx.questoes) {
      const t = ctx.topicoDe(q);
      if (!t) continue;
      if (!porTopico.has(t)) porTopico.set(t, { reais: 0, pool: [] });
      const b = porTopico.get(t);
      if (ctx.real(q)) b.reais++;
      if (ctx.elegivel(q)) b.pool.push(q);
    }
    const itens = [], faltas = [], resumo = [];
    for (const bloco of ctx.blueprint.blocos) for (const [sigla, nome, n] of bloco.mats) {
      const vistos = ctx.topicos.filter(t => t.sigla === sigla && !t.foraEdital && ctx.visto(t))
        .sort((a, b) => cmp(a.id, b.id));
      const info = vistos.map(t => {
        const b = porTopico.get(t.id) || { reais: 0, pool: [] };
        return { id: t.id, titulo: t.titulo || t.id, w: 1 + b.reais, reais: b.reais, pool: ordenarPool(b.pool, usados, ctx.real, rnd) };
      });
      const alvo = repartir(n, info);                       // cota ideal por incidência
      const dado = new Map(info.map(x => [x.id, Math.min(alvo.get(x.id), x.pool.length)]));
      let sobra = n - [...dado.values()].reduce((a, b) => a + b, 0);
      /* o que um tópico não tem é completado por outros tópicos vistos da mesma matéria, ainda por peso */
      while (sobra > 0) {
        const livres = info.filter(x => x.pool.length > dado.get(x.id));
        if (!livres.length) break;
        const r = repartir(sobra, livres);
        let moveu = 0;
        for (const x of livres) {
          const add = Math.min(r.get(x.id), x.pool.length - dado.get(x.id));
          dado.set(x.id, dado.get(x.id) + add); moveu += add;
        }
        if (!moveu) break;
        sobra -= moveu;
      }
      const escolhidos = [];
      for (const x of info) for (const q of x.pool.slice(0, dado.get(x.id))) escolhidos.push(q);
      /* itens do mesmo texto-base ficam juntos */
      const ord = [], vis = new Map();
      for (const q of escolhidos) { const k = q.textoId || ("_" + q.id); if (!vis.has(k)) { vis.set(k, []); ord.push(k); } vis.get(k).push(q); }
      for (const k of ord) for (const q of vis.get(k).sort((a, b) => cmp(a.id, b.id))) itens.push({ qid: q.id, prova: bloco.prova, mat: sigla, marcada: null });
      /* falta: plano de geração por tópico, na proporção do peso (nunca gera sem tópico visto) */
      let planoTopico = [];
      if (sobra > 0 && info.length) {
        const g = repartir(sobra, info);
        planoTopico = info.filter(x => g.get(x.id) > 0).map(x => ({ topico: x.id, titulo: x.titulo, gerar: g.get(x.id) }));
      }
      if (sobra > 0) faltas.push({ s: sigla, nome, pedido: n, tem: n - sobra, semTopicoVisto: !info.length, plano: planoTopico });
      resumo.push({ s: sigla, nome, pedido: n, topicosVistos: info.length,
        porTopico: info.map(x => ({ topico: x.id, titulo: x.titulo, incidencia: x.reais, peso: x.w, cota: alvo.get(x.id), usados: dado.get(x.id) })) });
    }
    return { itens, falta: faltas, resumo };
  }
  function exportar(S, sim, fmt) {
    if (!sim) return;
    if (sim.data === "2026-11-15") {
      const a = document.createElement("a");
      a.href = `/exports/simulado-2026-11-15.${fmt === "pdf" ? "pdf" : "json"}`;
      a.download = `simulado-2026-11-15.${fmt === "pdf" ? "pdf" : "json"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const itens = (sim.itens || []).map((it, idx) => {
      const q = S?.q?.get?.(it.qid) || {};
      const gab = q.gabarito || it.gab;
      const marcada = it.marcada || "B";
      const emBranco = !it.marcada || it.marcada === "B";
      return {
        numero: idx + 1,
        ...it,
        marcada,
        gabarito: gab,
        resultado: emBranco ? "branco" : marcada === gab ? "acerto" : "erro",
        questao: { id: q.id || it.qid, cap: q.cap, topico: q.topico, tema: q.tema, enunciado: q.enunciado, comentario: q.comentario, ref: q.ref }
      };
    });
    const payload = { exportado_em: new Date().toISOString(), simulado: sim, itens_detalhados: itens };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u;
    a.download = `simulado-${sim.data || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }

  return { REGRA_DESDE, semente, prng, repartir, compor, exportar };
});
