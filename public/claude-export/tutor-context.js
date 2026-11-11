/* Contexto pedagógico do Tutor Omni (11/11/2026).
 * Monta, a partir do estado da página (window.S), um resumo curto dos dados do estudante
 * para o tutor começar pelos pontos fracos reais: erros com certeza, interferência,
 * caderno de erros, revisões vencidas e calibração dos últimos 14 dias.
 * Só lê o estado: não grava nada e não altera respostas.
 */
(function (global) {
  "use strict";
  const PROVA_PADRAO = "2027-01-17";
  const pad = n => String(n).padStart(2, "0");
  const dia = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const difDias = (a, b) => {
    const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5);
  };
  const corta = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const prefixo = cap => String(cap || "").split("-")[0].toUpperCase();
  const foraCalc = q => !q || /^SIM/i.test(String(q.cap || "")) || !!q.foraNivel;
  const jaErrou = r => (r.erros || 0) > 0 || (r.brancos || 0) > 0 || (r.hist || []).some(h => !h.ok);

  function fase(dias) {
    if (dias == null) return "sem data de prova";
    if (dias > 60) return "cobertura do edital com recuperação";
    if (dias > 20) return "intercalação entre matérias e provas reais";
    return "só revisão, simulados e caderno de erros";
  }

  /* filtro do recorte: aceita sigla ("DC"), código de capítulo ("DC-2.2") ou nome da matéria */
  function noRecorte(q, recorte) {
    if (!recorte) return true;
    const r = String(recorte).toUpperCase();
    const cap = String(q.cap || "").toUpperCase();
    if (cap && (r === cap || r.startsWith(cap) || cap.startsWith(r))) return true;
    if (r.length <= 4 && prefixo(cap) === r) return true;
    if (r === "RF" && /^\d/.test(cap)) return true;            /* capítulos de RF usam "1.1", "1.4"… */
    if (r.length <= 4 && cap === "BANCA-" + r) return true;    /* itens de prova real da matéria */
    const nome = String(q.capNome || "").toUpperCase();
    return !!nome && r.length > 4 && nome.includes(r);
  }

  function build(S, opts) {
    opts = opts || {};
    const hoje = opts.today || dia(new Date());
    const prova = opts.prova || PROVA_PADRAO;
    const dias = prova ? difDias(hoje, prova) : null;
    const q = (S && S.q) || new Map(), r = (S && S.r) || new Map();
    const recorte = opts.recorte || "";
    const desde14 = (() => { const [y, m, d] = hoje.split("-").map(Number); return dia(new Date(y, m - 1, d - 14)); })();

    let respondidas = 0, comErro = 0, noCaderno = 0, vencidas = 0;
    let cert14 = 0, certOk14 = 0;
    const origens = {};
    const porCap = new Map();
    const fracos = [];

    for (const resp of r.values()) {
      const item = q.get(resp.qid || resp.id);
      if (!item || foraCalc(item) || !resp.tentativas) continue;
      respondidas++;
      const errou = jaErrou(resp);
      if (errou) comErro++;
      if (resp.noCaderno) noCaderno++;
      if (resp.proxRevisao && resp.proxRevisao <= hoje) vencidas++;
      if (resp.origem) origens[resp.origem] = (origens[resp.origem] || 0) + 1;
      for (const h of resp.hist || []) {
        const em = String(h.em || "").slice(0, 10);
        if (em >= desde14 && h.c === 3) { cert14++; if (h.ok) certOk14++; }
      }
      const c = porCap.get(item.cap) || { cap: item.cap, nome: item.capNome || "", n: 0, erros: 0 };
      c.n++; if (errou) c.erros++;
      porCap.set(item.cap, c);
      if (!noRecorte(item, recorte)) continue;
      const errosCerteza = (resp.hist || []).filter(h => !h.ok && h.c === 3).length + (resp.calib === "excesso" ? 1 : 0);
      const peso = (errosCerteza ? 4 : 0) + (resp.origem === "interferencia" ? 3 : 0) + (resp.noCaderno ? 2 : 0) + (errou ? 1 : 0);
      if (peso > 0) fracos.push({ item, resp, peso, errosCerteza });
    }

    fracos.sort((a, b) => b.peso - a.peso || String(a.item.id).localeCompare(String(b.item.id)));
    const capsFracos = [...porCap.values()].filter(c => c.n >= 5)
      .map(c => ({ ...c, pct: Math.round(100 * (c.n - c.erros) / c.n) }))
      .sort((a, b) => a.pct - b.pct).slice(0, 6);

    return {
      hoje, prova, diasAteProva: dias, fase: fase(dias),
      recorte: recorte || null,
      totais: { respondidas, comErro, noCaderno, revisoesVencidas: vencidas },
      calibracao14d: cert14 >= 10
        ? { certeza: cert14, acertoComCerteza: Math.round(100 * certOk14 / cert14), meta: 90 }
        : { certeza: cert14, aviso: "menos de 10 respostas com certeza nos últimos 14 dias" },
      origensDosErros: origens,
      capitulosMaisFracos: capsFracos.map(c => `${c.cap} (${corta(c.nome, 60)}): ${c.pct}% em ${c.n}`),
      itensPrioritarios: fracos.slice(0, opts.limite || 8).map(({ item, resp, errosCerteza }) => ({
        id: item.id,
        cap: item.cap,
        tema: corta(item.tema, 80),
        enunciado: corta(item.enunciado, 260),
        gabarito: item.gabarito,
        origemItem: corta(item.origem, 60),
        errosComCerteza: errosCerteza,
        origemDoErro: resp.origem || null,
        noCaderno: !!resp.noCaderno,
        nota: corta(resp.nota, 160) || undefined,
      })),
    };
  }

  /* recorte padrão a partir do assunto mostrado no OmniStudy ("Direito Constitucional", "DC-2.2"…) */
  const SIGLAS = { "LÍNGUA PORTUGUESA": "LP", "LÍNGUA INGLESA": "LI", "DIREITO ADMINISTRATIVO": "DA", "ADMINISTRAÇÃO PÚBLICA": "AP",
    "DIREITO CONSTITUCIONAL": "DC", "TECNOLOGIA DA INFORMAÇÃO": "TI", "LINGUÍSTICA": "LG", "RECONHECIMENTO DE FALA": "RF",
    "PROCESSO LEGISLATIVO": "PL", "CIÊNCIA POLÍTICA": "CP", "JURISPRUDÊNCIA": "JUR" };
  function recorteDe(subject) {
    const s = String(subject || "").toUpperCase();
    const cod = s.match(/\b([A-Z]{2,3})-\d+(?:\.\d+)?\b/);
    if (cod) return cod[0];
    for (const [nome, sig] of Object.entries(SIGLAS)) if (s.includes(nome)) return sig;
    return "";
  }

  global.QBTutorContext = { build, recorteDe };
})(typeof window !== "undefined" ? window : globalThis);
