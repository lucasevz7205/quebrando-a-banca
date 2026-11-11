/* Vacinação cognitiva · fase 1 (11/11/2026)
 * Funções puras usadas por study-shell.html nos itens C/E:
 *  1. certeza justificada em itens com palavra de alcance;
 *  2. localização e classificação do erro ao marcar E (e reclassificação para chute);
 *  3. registro de posição e tempo na rodada.
 * Nada aqui grava no banco: o shell decide quando gravar. Todos os campos novos são opcionais. */
(function (root) {
  "use strict";
  const CERT_MIN = 8, CERT_MAX = 200;
  const DIA = 86400000;
  const FAIXAS = [[1, 10, "1–10"], [11, 20, "11–20"], [21, 30, "21–30"], [31, 40, "31–40"], [41, Infinity, "41+"]];

  /* 1. Certeza justificada */
  function precisaCerteza(o) {
    return !!o && o.conf === 3 && !!o.travas && !!o.ce && !o.rep;
  }
  function certezaPronta(txt) {
    return String(txt || "").trim().length >= CERT_MIN;
  }
  function limparCerteza(txt) {
    return String(txt || "").trim().slice(0, CERT_MAX);
  }

  /* 2. Localizar o erro: só a parte "Assertiva" fica clicável */
  const CTX = /^(Situação hipotética|Texto de apoio|Dados da tabela|Considere a proposição \S+):\s*([\s\S]*?)\s*Assertiva:\s*([\s\S]*)$/;
  function assertivaDe(enunciado) {
    const t = String(enunciado || "");
    const m = t.match(CTX);
    return m ? { rotulo: m[1], contexto: m[2], assertiva: m[3] } : { rotulo: null, contexto: "", assertiva: t };
  }
  function palavras(texto) {
    return String(texto || "").split(/\s+/).filter(Boolean);
  }
  /* toque 1 fixa o início; toque 2 fecha o trecho; toque 3 recomeça */
  function tocar(sel, i) {
    const s = Object.assign({ ini: null, fim: null, toques: 0, naoSei: false, mec: null }, sel || {});
    s.naoSei = false;
    if (s.toques % 2 === 0) { s.ini = i; s.fim = i; }
    else { const a = Math.min(s.ini, i), b = Math.max(s.ini, i); s.ini = a; s.fim = b; }
    s.toques++;
    return s;
  }
  function erroSel(sel, words) {
    const s = sel || {};
    const temTrecho = !s.naoSei && Number.isInteger(s.ini) && Number.isInteger(s.fim);
    return {
      trecho: temTrecho ? words.slice(s.ini, s.fim + 1).join(" ") : "",
      ini: temTrecho ? s.ini : null,
      fim: temTrecho ? s.fim : null,
      mec: /^F([1-9]|10)$/.test(s.mec || "") ? s.mec : null,
      naoSei: !!s.naoSei,
      localizou: s.naoSei ? false : null,
    };
  }
  /* acerto em item E sem localizar o erro conta como chute */
  function contaComoChute(o) {
    return !!o && o.gabarito === "E" && o.marcada === "E" && !!o.erroSel &&
      (o.erroSel.naoSei || o.erroSel.localizou === false);
  }
  /* mesma regra de conf===1 em registrar, aplicada só aos campos de agenda e caderno */
  function reclassificarChute(antes, now, d, agendar) {
    const p = antes || {};
    const ja = !!p.noCaderno;
    return {
      noCaderno: true,
      entrouEm: ja ? (p.entrouEm || now) : now,
      motivo: ja ? (p.motivo || "chute") : "chute",
      acertosSeguidos: 0,
      nivel: 0,
      proxRevisao: agendar(d, 0),
      calib: "sub",
    };
  }
  function histExtra(hist, extra) {
    const h = Array.isArray(hist) ? hist.map(x => Object.assign({}, x)) : [];
    if (h.length) Object.assign(h[h.length - 1], extra);
    return h;
  }

  /* 3. Posição e tempo na rodada */
  function posicao(rd, agora) {
    const t = typeof agora === "number" ? agora : Date.now();
    const ini = Date.parse(rd && rd.inicio) || t;
    const shown = rd && rd.learningShown && rd.learningShown.idx === rd.idx ? rd.learningShown.at : t;
    return {
      pos: ((rd && rd.idx) || 0) + 1,
      tSess: Math.max(0, Math.round((t - ini) / 1000)),
      tItem: Math.max(0, Math.round((t - shown) / 1000)),
    };
  }

  /* Métricas */
  const ehCE = it => it && (it.marcada === "C" || it.marcada === "E") && (it.gabarito === "C" || it.gabarito === "E");
  function certezaTrava(rodadas, ativadaEm, temTrava) {
    const at = Date.parse(ativadaEm || "");
    const o = { antes: { n: 0, ok: 0 }, depois: { n: 0, ok: 0 }, ativa: !isNaN(at) };
    if (isNaN(at)) return Object.assign(o, { insuf: true });
    for (const r of rodadas || []) {
      const t = Date.parse(r.inicio || "");
      if (isNaN(t)) continue;
      const lado = t >= at - 14 * DIA && t < at ? o.antes : t >= at && t < at + 14 * DIA ? o.depois : null;
      if (!lado) continue;
      for (const it of r.itens || []) {
        if (it.conf !== 3 || !ehCE(it) || !temTrava(it.qid)) continue;
        lado.n++; if (it.marcada === it.gabarito) lado.ok++;
      }
    }
    o.insuf = o.antes.n < 30 || o.depois.n < 30;
    return o;
  }
  function localizacao(rodadas, mecRegistrado) {
    const o = { eAcertados: 0, avaliados: 0, localizados: 0, mecN: 0, mecOk: 0, confusoes: [] };
    const conf = new Map();
    for (const r of rodadas || []) for (const it of r.itens || []) {
      const s = it.erroSel; if (!s) continue;
      if (it.gabarito === "E" && it.marcada === "E") {
        o.eAcertados++;
        if (s.localizou === true || s.localizou === false) { o.avaliados++; if (s.localizou) o.localizados++; }
      }
      const reg = mecRegistrado ? mecRegistrado(it.qid) : null;
      if (s.mec && reg && /^F/.test(reg) && it.gabarito === "E") {
        o.mecN++;
        if (s.mec === reg) o.mecOk++;
        else { const k = reg + "→" + s.mec; conf.set(k, (conf.get(k) || 0) + 1); }
      }
    }
    o.confusoes = [...conf].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([par, n]) => ({ par, n }));
    return o;
  }
  function porPosicao(rodadas) {
    const linhas = FAIXAS.map(([a, b, rot]) => ({ rot, a, b, aleat: { n: 0, ok: 0 }, fixa: { n: 0, ok: 0 } }));
    for (const r of rodadas || []) {
      if (typeof r.ordemAleatoria !== "boolean") continue;
      for (const it of r.itens || []) {
        if (!Number.isInteger(it.pos) || !ehCE(it)) continue;
        const l = linhas.find(x => it.pos >= x.a && it.pos <= x.b); if (!l) continue;
        const c = r.ordemAleatoria ? l.aleat : l.fixa;
        c.n++; if (it.marcada === it.gabarito) c.ok++;
      }
    }
    return linhas;
  }

  root.QBVacinacao = {
    CERT_MIN, CERT_MAX, FAIXAS,
    precisaCerteza, certezaPronta, limparCerteza,
    assertivaDe, palavras, tocar, erroSel, contaComoChute, reclassificarChute, histExtra,
    posicao, certezaTrava, localizacao, porPosicao,
  };
})(typeof window !== "undefined" ? window : globalThis);
