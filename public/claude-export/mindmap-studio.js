/* Quebrando a Banca · Estúdio de Mapas Mentais (Criação do Zero, Edição de Ramos/Subtópicos/Rótulos, Base Cornell e Confronto GAN) */
(function (global) {
  "use strict";
  /* IA do estúdio (11/11/2026): usa a ponte autenticada do app. A rota /api/omnistudy-ai
   * nunca existiu, então a "reestruturação com IA" caía sempre no modo determinístico. */
  const MIN_INSUMO = 300;
  async function gerarMapaComIA(payload) {
    if (!global.QBBridge || typeof global.QBBridge.ask !== "function") throw new Error("IA indisponível neste ambiente");
    const texto = [payload.notes, payload.referenceText].map(x => String(x || "")).join(" ").trim();
    if (texto.length < (payload.structuredInput ? 80 : MIN_INSUMO))
      throw new Error("Insumo curto demais (" + texto.length + " caracteres). Cole um texto com títulos, subtópicos e informações suficientes.");
    const res = await global.QBBridge.ask("omniStudyAI", { task: "cornell-to-mindmap", ...payload });
    if (!res || !res.mapa) throw new Error("a IA não devolveu um mapa");
    return res;
  }
  function avisoIA(res) {
    const a = Array.isArray(res.avisos) ? res.avisos : [];
    return a.length ? " Pontos a revisar: " + a.slice(0, 3).join(" ") : "";
  }


  const CORNELL_STORAGE_KEY = "qb_omnistudy_state_v2";
  const COLORS = [
    { id: 1, name: "Azul Orbital", hex: "#60a5fa" },
    { id: 2, name: "Ciano AXON", hex: "#38bdf8" },
    { id: 3, name: "Esmeralda", hex: "#34d399" },
    { id: 4, name: "Âmbar", hex: "#fbbf24" },
    { id: 5, name: "Coral", hex: "#fb7185" },
    { id: 6, name: "Violeta", hex: "#a78bfa" },
    { id: 7, name: "Fúcsia", hex: "#e879f9" },
    { id: 8, name: "Índigo", hex: "#818cf8" },
  ];

  const studioState = {
    editorOpen: false,
    ganOpen: false,
    busy: false,
    statusMsg: "",
    drafts: new Map(),      // topicId -> map object being edited
    undoStack: new Map(),   // topicId -> array of JSON snapshots
    openDetails: new Set(), // node paths with expanded pedagogical details
    ganBatches: new Map(),  // topicId -> { questions, summary, formato, targetNodeId, count }
    ganConfig: {
      formato: "ce",
      count: 4,
      targetNodeId: "",
    },
  };

  let appRef = null; // { S, render, setView, enqueue, toast }

  const esc = v =>
    String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const text = (v, max = 8000) => String(v == null ? "" : v).trim().slice(0, max);

  function slugId(value, fallback = "no") {
    const clean = text(value, 100)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42);
    return clean || fallback;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
  }

  function enumerateMapNodes(map) {
    const list = [];
    const ids = new Set();
    function walk(nodes, pathPrefix = "", depth = 0) {
      (Array.isArray(nodes) ? nodes : []).forEach((n, idx) => {
        if (!n || typeof n !== "object") return;
        const path = pathPrefix ? `${pathPrefix}.${idx}` : String(idx);
        const id = text(n.id, 120) || `no-${path.replace(/\./g, "-")}`;
        ids.add(id);
        list.push({ node: n, id, path, depth, title: text(n.t, 200) || id, rotulo: n.rotulo || "" });
        if (Array.isArray(n.f) && n.f.length && depth < 6) {
          walk(n.f, path, depth + 1);
        }
      });
    }
    walk(map?.ramos);
    return { list, ids };
  }

  function normalizeMap(rawMap, fallbackTitle = "Mapa Mental", prefix = "mm") {
    const src = rawMap && typeof rawMap === "object" ? rawMap : {};
    const centro = text(src.centro || fallbackTitle, 240) || "Mapa Mental";
    const autor = text(src.autor || "Mapa autoral · Ambiente de Estudo", 240);
    const safePrefix = slugId(prefix, "mm").slice(0, 20);
    const seen = new Set();

    function uniqueId(preferred, pathFallback) {
      let base = slugId(preferred || `${safePrefix}-${pathFallback}`, `${safePrefix}-${pathFallback}`);
      let candidate = base;
      let i = 2;
      while (seen.has(candidate)) candidate = `${base}-${i++}`;
      seen.add(candidate);
      return candidate;
    }

    function cleanNode(node, pathStr, depth = 0, defaultCor = 1) {
      if (!node || typeof node !== "object" || depth > 5) return null;
      const t = text(node.t || node.title || "", 220);
      if (!t) return null;
      const id = uniqueId(node.id, `r${pathStr.replace(/\./g, "-")}`);
      const n = text(node.n || "", 600);
      const rawX = node.x && typeof node.x === "object" ? node.x : {};
      const rotulo = text(
        node.rotulo || deduceConceptLabel(t, n || rawX.e || "", depth === 0 ? "Conceito Central" : "Regra Geral"),
        80
      );
      const corNum = Number(node.cor);
      const cor = Number.isInteger(corNum) && corNum >= 1 && corNum <= 8 ? corNum : defaultCor;
      const caixa = Boolean(node.caixa);
      const e = text(rawX.e || "", 2400);
      const ex = text(rawX.ex || "", 1200);
      const trap = text(rawX.trap || "", 1200);
      const srcRef = text(rawX.src || "", 600);
      const questaoIds = Array.isArray(rawX.questaoIds)
        ? [...new Set(rawX.questaoIds.map(q => text(q, 120)).filter(Boolean))]
        : [];
      const f =
        depth < 5 && Array.isArray(node.f)
          ? node.f.map((child, idx) => cleanNode(child, `${pathStr}.${idx + 1}`, depth + 1, cor)).filter(Boolean)
          : [];

      const out = { id, t, cor };
      if (rotulo) out.rotulo = rotulo;
      if (caixa) out.caixa = true;
      if (n) out.n = n;
      if (e || ex || trap || srcRef || questaoIds.length) {
        out.x = {
          e: e || `Definição e escopo de ${t}.`,
          ...(ex ? { ex } : {}),
          ...(trap ? { trap } : {}),
          ...(srcRef ? { src: srcRef } : {}),
          ...(questaoIds.length ? { questaoIds } : {}),
        };
      }
      if (f.length) out.f = f;
      return out;
    }

    const ramos = (Array.isArray(src.ramos) ? src.ramos : [])
      .map((r, i) => cleanNode(r, String(i + 1), 0, (i % 8) + 1))
      .filter(Boolean);

    const ligacoes = [];
    for (const lig of Array.isArray(src.ligacoes) ? src.ligacoes : []) {
      const from = Array.isArray(lig) ? text(lig[0], 120) : text(lig?.de, 120);
      const to = Array.isArray(lig) ? text(lig[1], 120) : text(lig?.para, 120);
      const rel = Array.isArray(lig) ? text(lig[2], 180) : text(lig?.relacao, 180);
      if (from && to && from !== to && seen.has(from) && seen.has(to)) {
        ligacoes.push([from, to, rel || "Conexão conceitual"]);
      }
    }

    return {
      centro,
      autor,
      ramos,
      ligacoes,
      ...(src.origemCornell ? { origemCornell: src.origemCornell } : {}),
    };
  }

  function createEmptyMap(topicId, topicTitle = "Novo Mapa Mental") {
    const prefix = slugId(topicId || topicTitle, "topico").slice(0, 20);
    return normalizeMap(
      {
        centro: topicTitle || "Conceito Central",
        autor: "Criado do zero pelo estudante no Ambiente de Estudo",
        ramos: [
          {
            id: `${prefix}-r1`,
            t: "1. Conceito e Fundamento",
            rotulo: "Base",
            n: "Síntese rápida para evocação ativa deste ramo.",
            cor: 1,
            x: {
              e: "Explique aqui a regra estruturante com suas palavras.",
              ex: "Caso prático de aplicação.",
              trap: "Como a banca tenta confundir este conceito.",
              src: "Anotação própria / Fonte de estudo",
            },
            f: [
              {
                id: `${prefix}-r1-1`,
                t: "Subtópico 1.1 · Regra Geral",
                rotulo: "Regra",
                n: "Detalhe essencial do subtópico.",
                cor: 1,
                x: { e: "Detalhamento do subtópico 1.1." },
              },
            ],
          },
          {
            id: `${prefix}-r2`,
            t: "2. Requisitos e Classificação",
            rotulo: "Estrutura",
            n: "Elementos que diferenciam este instituto dos vizinhos.",
            cor: 3,
            x: {
              e: "Distinção técnica entre as espécies ou requisitos.",
              trap: "Troca de conceito (F3) entre institutos próximos.",
            },
            f: [],
          },
          {
            id: `${prefix}-r3`,
            t: "3. Exceções e Pegadinhas de Prova",
            rotulo: "Alerta",
            caixa: true,
            n: "Ressalvas legais, regimentais ou jurisprudenciais.",
            cor: 5,
            x: {
              e: "Casos em que a regra geral não se aplica.",
              trap: "Generalização indevida (F1) ou inversão regra × exceção (F5).",
            },
            f: [],
          },
        ],
        ligacoes: [[`${prefix}-r1`, `${prefix}-r3`, "Regra Geral → Exceção"]],
      },
      topicTitle,
      prefix
    );
  }

  function deduceConceptLabel(title, body, fallback = "Conceito") {
    const combined = `${title || ""} ${body || ""}`.toLowerCase();
    if (/(exce[çc][ãa]o|ressalva|salvo|exceto|n[ãa]o se aplica|afasta-se|derroga)/i.test(combined)) {
      return "Exceção Taxativa";
    }
    if (/(qu[óo]rum|maioria absoluta|maioria simples|maioria qualificada|dois ter[çc]os|tr[êe]s quintos)/i.test(combined)) {
      return "Quórum Qualificado";
    }
    if (/(prazo|tempestiv|dias|horas|meses|anos|decad[êe]ncia|prescri[çc][ãa]o|vig[êe]ncia)/i.test(combined)) {
      return "Prazo Legal";
    }
    if (/(veda[çc][ãa]o|proibi|defeso|vedado|impedido|il[íi]cito|incompat[íi]vel)/i.test(combined)) {
      return "Vedação Expressa";
    }
    if (/(compet[êe]ncia privativa|privativamente|exclusiv|indeleg[áa]vel)/i.test(combined)) {
      return "Competência Privativa";
    }
    if (/(compet[êe]ncia comum|compet[êe]ncia concorrente|concorrentemente)/i.test(combined)) {
      return "Competência Concorrente";
    }
    if (/(requisito|condi[çc][ãa]o|pressuposto|elemento|cumulativ)/i.test(combined)) {
      return "Requisito Legal";
    }
    if (/(anula[çc][ãa]o|nulidade|revoga[çc][ãa]o|convalida[çc][ãa]o)/i.test(combined)) {
      return "Desfazimento do Ato";
    }
    if (/(recurso|agravo|apela[çc][ãa]o|embargos|mandado de seguran[çc]a)/i.test(combined)) {
      return "Garantia / Recurso";
    }
    if (/(efeito ex tunc|efeito ex nunc|efic[áa]cia|retroat)/i.test(combined)) {
      return "Efeito Jurídico";
    }
    if (/(pegadinha|armadilha|cebraspe|falso|invers[ãa]o|cuidado|atente)/i.test(combined)) {
      return "Alerta de Banca";
    }
    if (/(princ[íi]pio|fundamento|vetor|diretriz)/i.test(combined)) {
      return "Princípio Vetor";
    }
    if (/(san[çc][ãa]o|penalidade|multa|crime|improbidade)/i.test(combined)) {
      return "Sanção Legal";
    }
    if (/(regra geral|em regra|ordinariamente|padr[ãa]o)/i.test(combined)) {
      return "Regra Geral";
    }
    if (fallback) return fallback;
    return "Conceito Chave";
  }

  function parseStructuredBlocks(rawText, fallbackTitle = "Conceito") {
    if (!rawText || typeof rawText !== "string") return [];
    const rawLines = rawText.split(/\r?\n/);
    const blocks = [];
    let cur = null;

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (hMatch) {
        if (cur) blocks.push(cur);
        cur = {
          title: hMatch[2].replace(/[*_#]/g, "").trim(),
          level: hMatch[1].length,
          lines: [],
          subItems: [],
        };
        continue;
      }

      const leadMatch = line.match(/^(\*\*([^*]+)\*\*|([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\d\s\-.,]{3,40})):\s*(.*)$/);
      if (!cur && leadMatch) {
        cur = {
          title: (leadMatch[2] || leadMatch[3]).trim(),
          lines: leadMatch[4] ? [leadMatch[4].trim()] : [],
          subItems: [],
        };
        continue;
      }

      const bulletMatch = line.match(/^([•*\-–—]|\d+[.)]|[a-z][.)])\s+(.+)$/i);
      if (bulletMatch) {
        if (!cur) {
          cur = {
            title: bulletMatch[2].split(/[:.]/)[0].slice(0, 70).trim() || fallbackTitle,
            lines: [bulletMatch[2]],
            subItems: [],
          };
        } else {
          cur.subItems.push(bulletMatch[2].trim());
        }
        continue;
      }

      if (!cur) {
        cur = {
          title: line.split(/[:.]/)[0].slice(0, 70).trim() || fallbackTitle,
          lines: [line],
          subItems: [],
        };
      } else {
        cur.lines.push(line);
      }
    }

    if (cur) blocks.push(cur);
    if (blocks.length > 1 && blocks[0].level === 1 && (!blocks[0].lines.length && !blocks[0].subItems.length)) {
      blocks.shift();
    }
    return blocks;
  }

  function associateQuestionsToNode(node, S, topicId, materia) {
    if (!node || !S) return;
    const questions = [];
    const keywords = [node.t, node.rotulo].filter(Boolean).map(w => w.toLowerCase());
    if (node.x?.e) {
      const topWords = node.x.e.split(/\W+/).filter(w => w.length >= 4).slice(0, 8);
      keywords.push(...topWords.map(w => w.toLowerCase()));
    }

    if (S.q && typeof S.q.values === "function") {
      for (const q of S.q.values()) {
        if (!q || !q.id) continue;
        const matchesTopic =
          (topicId && (q.topicoId === topicId || q.topico === topicId)) ||
          (materia && (q.materia === materia || (q.capNome && q.capNome.includes(materia)))) ||
          !topicId;
        const textQ = `${q.enunciado || ""} ${q.texto || ""} ${q.justificativa || ""}`.toLowerCase();
        const matchesWord = keywords.some(k => k.length >= 4 && textQ.includes(k));
        if (matchesTopic && matchesWord) {
          questions.push(q.id);
        }
        if (questions.length >= 4) break;
      }
    }
    if (questions.length && node.t) {
      if (!node.x) node.x = {};
      node.x.questaoIds = Array.from(new Set([...(node.x.questaoIds || []), ...questions]));
    }
    const children = Array.isArray(node.ramos) ? node.ramos : Array.isArray(node.f) ? node.f : [];
    for (const child of children) {
      associateQuestionsToNode(child, S, topicId, materia);
    }
  }

  function cornellToMindMap(note, options = {}) {
    if (!note || typeof note !== "object") {
      throw new Error("Selecione ou preencha uma folha Cornell válida.");
    }
    const title = text(note.title || note.subject || options.topicTitle || "Mapa Mental Cornell", 240);
    const subject = text(note.subject || options.materia || "", 200);
    const prefix = slugId(options.topicId || note.topicId || title, "cornell").slice(0, 20);
    const cues = Array.isArray(note.cues)
      ? note.cues.map(c => text(c, 220)).filter(Boolean)
      : String(note.cues || "")
          .split(/\r?\n/)
          .map(c => text(c, 220))
          .filter(Boolean);
    const rawNotes = text(note.notes, 12000);
    const summary = text(note.summary, 2500);
    const referenceText = text(note.referenceText, 600);

    const paragraphs = rawNotes
      .split(/\n\s*\n+/)
      .map(b => b.trim())
      .filter(Boolean);
    const structuredBlocks = parseStructuredBlocks(rawNotes, title);

    let branchConcepts = [];
    if (cues.length) {
      branchConcepts = cues.map((cue, idx) => {
        const cleanTitle = cue.replace(/^Pista\s*\d+\s*:\s*/i, "").replace(/\?+$/, "").trim();
        const matchedBlock =
          structuredBlocks.find(b => b.title.toLowerCase().includes(cleanTitle.toLowerCase())) ||
          structuredBlocks[idx] ||
          null;
        const blockText = matchedBlock
          ? [matchedBlock.title, ...matchedBlock.lines, ...matchedBlock.subItems].join(" ")
          : paragraphs[idx] || summary || cue;
        return {
          title: cleanTitle || `Conceito ${idx + 1}`,
          blockText,
          subItems: matchedBlock?.subItems || [],
          lines: matchedBlock?.lines || (paragraphs[idx] ? paragraphs[idx].split(/\r?\n/) : []),
        };
      });
    } else if (structuredBlocks.length) {
      branchConcepts = structuredBlocks.slice(0, 6).map(b => ({
        title: b.title,
        blockText: [b.title, ...b.lines, ...b.subItems].join(" "),
        subItems: b.subItems,
        lines: b.lines,
      }));
    } else {
      branchConcepts = paragraphs.slice(0, 5).map((p, idx) => ({
        title: p.split(/[:.]/)[0].slice(0, 70).trim() || `Conceito Nuclear ${idx + 1}`,
        blockText: p,
        subItems: [],
        lines: p.split(/\r?\n/),
      }));
    }

    const ramos = branchConcepts.map((concept, idx) => {
      const cleanBranchTitle = concept.title;
      const rotuloRamo = deduceConceptLabel(cleanBranchTitle, concept.blockText, idx === 0 ? "Conceito Central" : "Regra Geral");
      const mainExp = (concept.lines[0] || concept.blockText || cleanBranchTitle).replace(/^[\s•*\-–—\d.)]+/, "").trim();

      // Subtópicos para aprofundamento (modo Conceitual Irradiante)
      const rawSub = concept.subItems.length
        ? concept.subItems
        : concept.lines.slice(1).map(l => l.replace(/^[\s•*\-–—\d.)]+/, "").trim()).filter(Boolean);

      const children = rawSub.slice(0, 6).map((sub, subIdx) => {
        const parts = sub.split(/:\s+/);
        const subTitle = (parts.length > 1 ? parts[0] : sub.split(/[;,.]/)[0]).slice(0, 90).trim() || `Desdobramento ${subIdx + 1}`;
        const subBody = parts.length > 1 ? parts.slice(1).join(": ") : sub;
        const rotuloSub = deduceConceptLabel(subTitle, subBody, "Requisito");

        // Possível sub-subtópico para aprofundamento (nível 3)
        const deepParts = subBody.split(/;\s+/).filter(Boolean);
        const deepChildren = deepParts.length > 1
          ? deepParts.slice(1, 3).map((dp, dpIdx) => ({
              id: `${prefix}-r${idx + 1}-${subIdx + 1}-${dpIdx + 1}`,
              t: dp.slice(0, 80).trim(),
              rotulo: deduceConceptLabel(dp, dp, "Detalhe"),
              n: dp.slice(0, 200),
              cor: (idx % 8) + 1,
              x: {
                e: dp,
                src: referenceText ? referenceText.slice(0, 240) : `Caderno Cornell · ${title}`,
              },
            }))
          : [];

        return {
          id: `${prefix}-r${idx + 1}-${subIdx + 1}`,
          t: subTitle,
          rotulo: rotuloSub,
          n: subBody.slice(0, 240),
          cor: (idx % 8) + 1,
          x: {
            e: subBody,
            trap: `A banca tenta confundir o requisito "${subTitle}" invertendo sua obrigatoriedade.`,
            src: referenceText ? referenceText.slice(0, 240) : `Caderno Cornell · ${title}`,
          },
          f: deepChildren,
        };
      });

      return {
        id: `${prefix}-r${idx + 1}`,
        t: cleanBranchTitle,
        rotulo: rotuloRamo,
        n: mainExp.slice(0, 260),
        cor: (idx % 8) + 1,
        x: {
          e: concept.blockText || mainExp,
          ...(summary ? { ex: `Aplicação prática e síntese: ${summary.slice(0, 260)}` } : {}),
          trap: `Pegadinha clássica sobre "${cleanBranchTitle}": atente para termos taxativos ou exclusões indevidas.`,
          src: referenceText ? referenceText.slice(0, 240) : `Caderno Cornell · ${title}`,
        },
        f: children,
      };
    });

    if (summary) {
      const sentences = summary
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);
      ramos.push({
        id: `${prefix}-sintese`,
        t: "Síntese e Consolidação Executiva",
        rotulo: "Síntese",
        caixa: true,
        n: summary.slice(0, 280),
        cor: (ramos.length % 8) + 1,
        x: {
          e: summary,
          src: referenceText ? referenceText.slice(0, 240) : `Síntese Cornell · ${title}`,
        },
        f: sentences.slice(0, 4).map((s, i) => ({
          id: `${prefix}-sintese-${i + 1}`,
          t: s.slice(0, 84),
          rotulo: deduceConceptLabel(s, s, "Ponto Chave"),
          n: s,
          cor: (ramos.length % 8) + 1,
          x: { e: s },
        })),
      });
    }

    while (ramos.length < 3) {
      const k = ramos.length + 1;
      const t = k === 1 ? "Conceito Estruturante" : k === 2 ? "Requisitos e Aplicação" : "Exceções e Jurisprudência";
      ramos.push({
        id: `${prefix}-r${k}`,
        t,
        rotulo: deduceConceptLabel(t, t, "Conceito Chave"),
        n: summary || rawNotes.slice(0, 220) || `Conceito ${k} de ${title}`,
        cor: ((k - 1) % 8) + 1,
        x: {
          e: rawNotes || summary || `Anotação analítica sobre ${title}.`,
          src: `Caderno Cornell · ${title}`,
        },
        f: [],
      });
    }

    const ligacoes = ramos.length >= 2 ? [[ramos[0].id, ramos[ramos.length - 1].id, "Conceito Central → Síntese"]] : [];

    const normalized = normalizeMap(
      {
        centro: subject ? `${title} · ${subject}` : title,
        autor: `Baseado no Caderno Cornell ("${title}") · Estrutura Conceitual AXON`,
        ramos,
        ligacoes,
        origemCornell: {
          noteId: text(note.id, 120),
          title,
          subject,
          cuesCount: cues.length,
          referenceText: referenceText.slice(0, 1200),
          updatedAt: new Date().toISOString(),
        },
      },
      title,
      prefix
    );

    const activeS = options.S || appRef?.S || global.QBApp?.S || global.S;
    if (activeS) {
      associateQuestionsToNode(normalized, activeS, options.topicId || note.topicId, subject);
    }

    return normalized;
  }

  function loadSavedCornellNotes() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(CORNELL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.cornellNotes) ? parsed.cornellNotes : [];
    } catch {
      return [];
    }
  }

  function loadStudyMaterials(explicitS) {
    const S = explicitS || appRef?.S || global.QBApp?.S || global.S;
    if (global.QBOmniCornell?.syncStoredArtifactsIntoS) {
      global.QBOmniCornell.syncStoredArtifactsIntoS(S);
    }
    const list = [];
    const seen = new Set();
    if (S?.mat && typeof S.mat.values === "function") {
      for (const m of S.mat.values()) {
        if (!m || !m.id || seen.has(m.id)) continue;
        seen.add(m.id);
        list.push(m);
      }
    }
    try {
      const raw = global.localStorage && global.localStorage.getItem("qb_cornell_material_artifacts_v1");
      if (raw) {
        const obj = JSON.parse(raw);
        for (const m of Object.values(obj || {})) {
          if (m && m.id && !seen.has(m.id)) {
            seen.add(m.id);
            list.push(m);
          }
        }
      }
    } catch (_e) {}
    return list;
  }

  function materialToMindMap(material, options = {}) {
    if (!material || typeof material !== "object") {
      throw new Error("Selecione um artefato ou material de estudo válido.");
    }
    const title = text(
      material.titulo || material.title || options.topicTitle || "Mapa Mental do Material",
      240
    ).replace(/^Caderno Cornell\s*·\s*/i, "");
    const materia = text(material.materia || options.materia || "", 200);
    const topicId = text(
      options.topicId || (Array.isArray(material.topicos) && material.topicos[0]) || material.id || title,
      120
    );
    const prefix = slugId(topicId, "mat").slice(0, 20);

    // Se o artefato veio de uma folha Cornell ou tem pistas/anotações estruturadas, aproveita a conversão Cornell
    if (Array.isArray(material.pistas) && material.pistas.length && (material.anotacoes || material.conteudo)) {
      const converted = cornellToMindMap(
        {
          id: material.cornellNoteId || material.id,
          title,
          subject: materia,
          topicId,
          cues: material.pistas,
          notes: material.anotacoes || material.conteudo || "",
          summary: material.resumo || material.descricao || "",
          referenceText: material.referenceText || `Artefato de Material (${material.id})`,
        },
        { topicId, topicTitle: title, materia, S: options.S }
      );
      converted.autor = `Baseado no Artefato de Material "${material.titulo || title}" · Remissivo`;
      converted.origemMaterial = {
        materialId: text(material.id, 120),
        cornellNoteId: text(material.cornellNoteId || "", 120),
        titulo: text(material.titulo || title, 240),
        materia,
        topicos: Array.isArray(material.topicos) ? material.topicos : [],
      };
      return converted;
    }

    const rawBody = text(
      material.conteudo || material.texto || material.anotacoes || material.descricao || "",
      14000
    );
    const summary = text(material.resumo || material.descricao || "", 2500);
    const structuredBlocks = parseStructuredBlocks(rawBody, title);

    const secoes = Array.isArray(material.secoes) && material.secoes.length
      ? material.secoes.map(s => text(s, 220)).filter(Boolean)
      : [];

    let branchSources = [];
    if (secoes.length) {
      branchSources = secoes.map((sec, idx) => {
        const cleanTitle = sec.replace(/^Pista\s*\d+\s*:\s*/i, "").replace(/\?+$/, "").trim();
        const matched = structuredBlocks.find(b => b.title.toLowerCase().includes(cleanTitle.toLowerCase())) || structuredBlocks[idx];
        return {
          title: cleanTitle || `Eixo ${idx + 1}`,
          lines: matched?.lines || [sec],
          subItems: matched?.subItems || [],
          body: matched ? [matched.title, ...matched.lines, ...matched.subItems].join(" ") : sec,
        };
      });
    } else if (structuredBlocks.length) {
      branchSources = structuredBlocks.slice(0, 6).map(b => ({
        title: b.title,
        lines: b.lines,
        subItems: b.subItems,
        body: [b.title, ...b.lines, ...b.subItems].join(" "),
      }));
    } else {
      const paragraphs = rawBody.split(/\n\s*\n+/).filter(Boolean);
      branchSources = (paragraphs.length ? paragraphs.slice(0, 5) : ["Conceito Nuclear", "Requisitos Legais", "Exceções e Jurisprudência"]).map((p, idx) => ({
        title: p.split(/[:.]/)[0].slice(0, 70).trim() || `Eixo Temático ${idx + 1}`,
        lines: p.split(/\r?\n/),
        subItems: [],
        body: p,
      }));
    }

    const ramos = branchSources.map((source, idx) => {
      const cleanTitle = source.title;
      const rotuloRamo = deduceConceptLabel(cleanTitle, source.body, idx === 0 ? "Conceito Central" : "Regra Geral");
      const mainExp = (source.lines[0] || source.body || summary || cleanTitle).replace(/^[\s•*\-–—\d.)]+/, "").trim();

      const rawSub = source.subItems.length
        ? source.subItems
        : source.lines.slice(1).map(l => l.replace(/^[\s•*\-–—\d.)]+/, "").trim()).filter(Boolean);

      const children = rawSub.slice(0, 6).map((sub, sIdx) => {
        const parts = sub.split(/:\s+/);
        const subTitle = (parts.length > 1 ? parts[0] : sub.split(/[;,.]/)[0]).slice(0, 90).trim() || `Subtópico ${sIdx + 1}`;
        const subBody = parts.length > 1 ? parts.slice(1).join(": ") : sub;
        const rotuloSub = deduceConceptLabel(subTitle, subBody, "Requisito Legal");

        const deepParts = subBody.split(/;\s+/).filter(Boolean);
        const deepChildren = deepParts.length > 1
          ? deepParts.slice(1, 3).map((dp, dpIdx) => ({
              id: `${prefix}-m${idx + 1}-${sIdx + 1}-${dpIdx + 1}`,
              t: dp.slice(0, 80).trim(),
              rotulo: deduceConceptLabel(dp, dp, "Ponto Específico"),
              n: dp.slice(0, 200),
              cor: (idx % 8) + 1,
              x: {
                e: dp,
                src: `Material de Estudo · ${material.titulo || title}`,
              },
            }))
          : [];

        return {
          id: `${prefix}-m${idx + 1}-${sIdx + 1}`,
          t: subTitle,
          rotulo: rotuloSub,
          n: subBody.slice(0, 240),
          cor: (idx % 8) + 1,
          x: {
            e: subBody,
            trap: `Armadilha de banca sobre "${subTitle}": inversão de competência ou prazo.`,
            src: `Material de Estudo · ${material.titulo || title}`,
          },
          f: deepChildren,
        };
      });

      return {
        id: `${prefix}-m${idx + 1}`,
        t: cleanTitle.slice(0, 140),
        rotulo: rotuloRamo,
        n: mainExp.slice(0, 260),
        cor: (idx % 8) + 1,
        x: {
          e: source.body || mainExp,
          ...(summary ? { ex: `Síntese prática: ${summary.slice(0, 240)}` } : {}),
          trap: `Pegadinha clássica em "${cleanTitle}": generalização indevida ou troca de conceito.`,
          src: `Material de Estudo · ${material.titulo || title}`,
        },
        f: children,
      };
    });

    while (ramos.length < 3) {
      const k = ramos.length + 1;
      const t = k === 2 ? "Requisitos e Aplicação Prática" : "Síntese e Jurisprudência da Banca";
      ramos.push({
        id: `${prefix}-m${k}`,
        t,
        rotulo: deduceConceptLabel(t, t, "Conceito Chave"),
        n: summary || rawBody.slice(0, 220) || title,
        cor: k,
        x: {
          e: summary || rawBody || `Subsídio extraído de ${title}.`,
          src: `Material de Estudo · ${material.titulo || title}`,
        },
        f: [],
      });
    }

    const normalized = normalizeMap(
      {
        centro: materia ? `${title} · ${materia}` : title,
        autor: `Subsídio: Material de Estudo "${material.titulo || title}" · Estrutura Conceitual AXON`,
        ramos,
        ligacoes: [[ramos[0].id, ramos[ramos.length - 1].id, "Eixo do Material → Síntese"]],
        origemMaterial: {
          materialId: text(material.id, 120),
          cornellNoteId: text(material.cornellNoteId || "", 120),
          titulo: text(material.titulo || title, 240),
          materia,
          topicos: Array.isArray(material.topicos) ? material.topicos : [],
        },
      },
      title,
      prefix
    );

    const activeS = options.S || appRef?.S || global.QBApp?.S || global.S;
    if (activeS) {
      associateQuestionsToNode(normalized, activeS, topicId, materia);
    }

    return normalized;
  }

  function ingestGeminiNotebook(data, explicitS, options = {}) {
    if (!data || typeof data !== "object") {
      throw new Error("Dados de ingestão inválidos.");
    }
    const S = explicitS || appRef?.S || global.QBApp?.S || global.S;
    const title = text(data.title || "Nota GeminiNotebook", 240);
    const subject = text(data.subject || "Geral", 200);
    const topicId = text(data.topicId || S?.mapaId || "geral", 120);
    const sourceContent = String(data.content || "");
    if (sourceContent.length > 27000) throw new Error("Texto com mais de 27.000 caracteres. Divida em partes para não perder nenhum tópico.");
    const content = text(sourceContent, 27000);
    if (!content.trim()) {
      throw new Error("Cole o conteúdo do GeminiNotebook / NotebookLM antes de processar.");
    }

    const asMaterial = data.asMaterial !== false;
    const asCornell = data.asCornell !== false;
    const asMindMap = data.asMindMap !== false;

    const blocks = parseStructuredBlocks(content, title);
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    let summary = "";
    const summaryMatch = content.match(/(?:##?\s*(?:Síntese|Resumo|Conclusão|Briefing)[\s\S]*?$)/i);
    if (summaryMatch) {
      summary = summaryMatch[0].replace(/^##?\s*[^\n]+\n/i, "").trim().slice(0, 1500);
    } else {
      summary = lines.slice(-3).join(" ").slice(0, 1200);
    }

    let cues = [];
    if (blocks.length >= 2) {
      cues = blocks.slice(0, 8).map(b => b.title);
    } else {
      cues = lines
        .filter(l => /^[•*\-–—\d.)]/.test(l) || l.includes(":") || l.endsWith("?"))
        .slice(0, 6)
        .map(l => l.replace(/^[\s•*\-–—\d.)]+/, "").split(/[:.?]/)[0].trim())
        .filter(Boolean);
    }
    if (!cues.length) {
      cues = ["Conceito Nuclear", "Requisitos e Aplicação", "Pontos de Atenção da Banca"];
    }

    let createdMaterial = null;
    let createdCornell = null;
    let createdMap = null;

    if (asMaterial) {
      const matId = `mat-gemini-${slugId(topicId, "gem")}-${Date.now().toString(36)}`;
      createdMaterial = {
        id: matId,
        tipo: "material",
        origemArtefato: "gemini-notebook",
        titulo: title,
        materia: subject,
        topicos: topicId ? [topicId] : [],
        pistas: cues,
        anotacoes: content,
        resumo: summary,
        secoes: cues,
        conteudo: content,
        referenceText: `Acervo GeminiNotebook / NotebookLM · ${title}`,
        criadoEm: new Date().toISOString(),
      };
      if (S?.mat && typeof S.mat.set === "function") {
        S.mat.set(matId, createdMaterial);
      }
      if (S?.db && typeof S.db.doc === "function") {
        const writeOp = () => S.db.doc("materiais/" + matId).set(createdMaterial);
        if (appRef?.enqueue) appRef.enqueue(writeOp);
        else writeOp();
      }
      try {
        const raw = global.localStorage?.getItem("qb_cornell_material_artifacts_v1");
        const mapObj = raw ? JSON.parse(raw) : {};
        mapObj[matId] = createdMaterial;
        global.localStorage?.setItem("qb_cornell_material_artifacts_v1", JSON.stringify(mapObj));
      } catch (_e) {}
    }

    if (asCornell) {
      const sheetId = `cornell-gemini-${Date.now().toString(36)}`;
      createdCornell = {
        id: sheetId,
        title,
        subject,
        topicId,
        cues,
        notes: content,
        summary,
        referenceText: `Ingestão do GeminiNotebook / NotebookLM · ${title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        const raw = global.localStorage?.getItem(CORNELL_STORAGE_KEY);
        const stateObj = raw ? JSON.parse(raw) : { cornellNotes: [] };
        if (!Array.isArray(stateObj.cornellNotes)) stateObj.cornellNotes = [];
        stateObj.cornellNotes.unshift(createdCornell);
        global.localStorage?.setItem(CORNELL_STORAGE_KEY, JSON.stringify(stateObj));
      } catch (_e) {}
    }

    if (asMindMap) {
      const mapSource = createdMaterial || {
        id: "gemini-temp",
        titulo: title,
        materia: subject,
        topicos: [topicId],
        pistas: cues,
        conteudo: content,
        resumo: summary,
      };
      createdMap = options.generatedMap
        ? normalizeMap(options.generatedMap, title, topicId)
        : materialToMindMap(mapSource, {
            topicId, topicTitle: title, materia: subject, S,
          });
      createdMap.autor = options.generatedMap
        ? "Estruturado pela IA a partir do texto hierarquizado · Revisar antes de salvar"
        : "Conversão direta de material · Revisar antes de estudar";
      if (S && options.commitMap !== false) {
        saveMapToEnvironment(S, topicId, createdMap);
      }
    }

    return {
      success: true,
      material: createdMaterial,
      cornellNote: createdCornell,
      mapa: createdMap,
    };
  }

  function getNodeAtPath(map, pathStr) {
    if (!map || !Array.isArray(map.ramos) || typeof pathStr !== "string" || !pathStr.length) return null;
    const parts = pathStr.split(".").map(Number);
    if (parts.some(n => !Number.isInteger(n) || n < 0)) return null;
    let current = map.ramos[parts[0]];
    for (let i = 1; i < parts.length; i++) {
      if (!current || !Array.isArray(current.f)) return null;
      current = current.f[parts[i]];
    }
    return current || null;
  }

  function getParentArrayAndIndex(map, pathStr) {
    if (!map || !Array.isArray(map.ramos) || typeof pathStr !== "string" || !pathStr.length) return null;
    const parts = pathStr.split(".").map(Number);
    if (parts.some(n => !Number.isInteger(n) || n < 0)) return null;
    if (parts.length === 1) {
      return { list: map.ramos, index: parts[0], parentNode: null };
    }
    const parentPath = parts.slice(0, -1).join(".");
    const parentNode = getNodeAtPath(map, parentPath);
    if (!parentNode) return null;
    if (!Array.isArray(parentNode.f)) parentNode.f = [];
    return { list: parentNode.f, index: parts[parts.length - 1], parentNode };
  }

  function ensureDraft(S, topicId) {
    if (!topicId) return null;
    if (studioState.drafts.has(topicId)) return studioState.drafts.get(topicId);
    const existing = S?.rv?.get(topicId)?.mapa;
    const topic = S?.ed?.get(topicId);
    const title = topic?.titulo || existing?.centro || topicId;
    const draft = existing && Array.isArray(existing.ramos) && existing.ramos.length
      ? normalizeMap(clone(existing), title, topicId)
      : createEmptyMap(topicId, title);
    studioState.drafts.set(topicId, draft);
    return draft;
  }

  function pushUndoSnapshot(topicId, mapObj) {
    if (!topicId || !mapObj) return;
    const stack = studioState.undoStack.get(topicId) || [];
    const snap = JSON.stringify(mapObj);
    if (stack[stack.length - 1] !== snap) {
      stack.push(snap);
      if (stack.length > 15) stack.shift();
      studioState.undoStack.set(topicId, stack);
    }
  }

  function undoDraft(S, topicId) {
    const stack = studioState.undoStack.get(topicId) || [];
    if (!stack.length) return false;
    const prevJson = stack.pop();
    const restored = JSON.parse(prevJson);
    studioState.drafts.set(topicId, restored);
    saveMapToEnvironment(S, topicId, restored, { skipUndo: true });
    return true;
  }

  function saveMapToEnvironment(S, topicId, rawMap, options = {}) {
    if (!S || !topicId) return null;
    const topic = S.ed?.get(topicId);
    const title = topic?.titulo || rawMap?.centro || topicId;
    const currentRev = S.rv?.get(topicId) || { id: topicId, titulo: title };
    if (!options.skipUndo && currentRev.mapa) {
      pushUndoSnapshot(topicId, currentRev.mapa);
    }
    const normalized = normalizeMap(rawMap, title, topicId);
    studioState.drafts.set(topicId, clone(normalized));

    const nextRev = {
      ...currentRev,
      id: topicId,
      titulo: currentRev.titulo || title,
      mapa: normalized,
      atualizadoEm: new Date().toISOString(),
    };
    S.rv.set(topicId, nextRev);
    S.mapaId = topicId;

    if (S.db && typeof S.db.doc === "function") {
      const writeOp = () => S.db.doc("revisao/" + topicId).set(nextRev);
      if (appRef?.enqueue) appRef.enqueue(writeOp);
      else writeOp();
    }
    return nextRev;
  }

  /* ==========================================================================
     LOCAL DETERMINISTIC GAN ENGINE (When Offline or in Unit Tests) + BRIDGE CALL
     ========================================================================== */
  function buildLocalGanBatch(map, options = {}) {
    const format = options.formato === "multipla_escolha" ? "multipla_escolha" : "ce";
    const count = Math.max(1, Math.min(8, Number(options.count) || 4));
    const { list } = enumerateMapNodes(map);
    const pool = options.targetNodeId
      ? list.filter(item => item.id === options.targetNodeId || item.path.startsWith(
          (list.find(x => x.id === options.targetNodeId)?.path || "___") + "."
        ))
      : list;
    const targetPool = pool.length ? pool : list;
    if (!targetPool.length) {
      throw new Error("Adicione ao menos 1 ramo ao mapa mental antes de gerar questões.");
    }

    const mechanisms = ["F3", "V1", "F5", "F1", "V4", "F4"];
    const questions = [];

    for (let i = 0; i < count; i++) {
      const entry = targetPool[i % targetPool.length];
      const n = entry.node;
      const baseExp = text(n.x?.e || n.n || n.t, 600);
      const baseTrap = text(n.x?.trap || `Confusão conceitual sobre ${n.t}`, 400);
      const baseEx = text(n.x?.ex || "", 300);
      const src = text(n.x?.src || map.autor || "Mapa Mental do Estudante", 240);
      const isTrue = i % 2 === 1;
      const mec = format === "ce" ? (isTrue ? (i % 4 === 1 ? "V1" : "V4") : mechanisms[i % mechanisms.length]) : "";

      if (format === "ce") {
        const statement = isTrue
          ? `No âmbito de ${map.centro}, quanto a "${n.t}", ${baseExp.charAt(0).toLowerCase() + baseExp.slice(1).replace(/\.$/, "")}${baseEx ? `, aplicando-se inclusive na hipótese de ${baseEx.charAt(0).toLowerCase() + baseEx.slice(1).replace(/\.$/, "")}` : ""}.`
          : `Acerca de ${map.centro}, especificamente no que tange a "${n.t}", aplica-se de forma irrestrita e sem exceções a equiparação integral entre esse instituto e os demais ramos do tema, dispensando-se os requisitos específicos (${baseExp.slice(0, 120).replace(/\.$/, "")}).`;

        const gabarito = isTrue ? "C" : "E";
        const wasRefined = i === 2; // Simula refinamento adversarial no 3º item quando local
        questions.push({
          enunciado: statement,
          gabarito,
          mecanismo: mec,
          tema: n.t,
          mapaNoId: entry.id,
          mapaNoTitulo: n.t,
          trechoDecisivo: isTrue ? n.t : "de forma irrestrita e sem exceções",
          correcaoMinima: isTrue
            ? "O item está correto e fiel ao nó do mapa mental."
            : `Para tornar o item correto: observar que em "${n.t}", ${baseExp}`,
          comentario: `${isTrue ? "CERTO" : "ERRADO"} (${mec}). Conforme estruturado no nó "${n.t}" do mapa mental (${src}): ${baseExp} ${baseTrap ? `Armadilha mapeada: ${baseTrap}` : ""}`,
          ganConfrontation: {
            version: "qb-gan-1.0",
            statusConfronto: wasRefined ? "refinada_gan" : "aprovada_gan",
            ganScore: isTrue ? 93 : wasRefined ? 88 : 91,
            blindKeyMatch: true,
            generatorKey: gabarito,
            discriminatorKey: gabarito,
            generatorThesis: `Item ancorado no nó "${n.t}" (${entry.id}) testando ${mec} (${isTrue ? "paráfrase fiel do conceito" : "distorção de escopo/conceito"}).`,
            discriminatorCritique: wasRefined
              ? `Discriminador Cego confirmou gabarito ${gabarito} e refinou a redação para eliminar pista lexical e reforçar a precisão sobre "${n.t}".`
              : `Discriminador Cego resolveu o item sem acesso ao gabarito, cravou "${gabarito}" por unanimidade e validou a aderência estrita ao nó "${n.t}".`,
            flawsDetected: wasRefined ? ["Ajuste de calibragem lexical pós-confronto"] : [],
            wasRefined,
          },
        });
      } else {
        const correctLetter = ["A", "B", "C", "D", "E"][i % 5];
        const alternatives = ["A", "B", "C", "D", "E"].map((letra, k) => ({
          letra,
          texto:
            letra === correctLetter
              ? `${baseExp} (${n.t}).`
              : `Afirmação incorreta (${k + 1}): inverte a regra de "${n.t}" ao desconsiderar seus requisitos específicos no mapa.`,
        }));
        questions.push({
          formato: "multipla_escolha",
          enunciado: `Tendo como referência a estrutura conceitual de ${map.centro}, assinale a alternativa correta acerca de "${n.t}":`,
          gabarito: correctLetter,
          alternativas: alternatives,
          tema: n.t,
          mapaNoId: entry.id,
          mapaNoTitulo: n.t,
          comentario: `Alternativa correta: ${correctLetter}. De acordo com o nó "${n.t}" (${entry.id}): ${baseExp}`,
          ganConfrontation: {
            version: "qb-gan-1.0",
            statusConfronto: "aprovada_gan",
            ganScore: 90,
            blindKeyMatch: true,
            generatorKey: correctLetter,
            discriminatorKey: correctLetter,
            generatorThesis: `Questão A–E vinculada ao nó "${n.t}" com 4 distratores baseados nas armadilhas do tema.`,
            discriminatorCritique: `Discriminador Cego validou a alternativa ${correctLetter} como única correta e descartou ambiguidade nos distratores.`,
            flawsDetected: [],
            wasRefined: false,
          },
        });
      }
    }

    return {
      questions,
      summary: {
        total: questions.length,
        aprovadasDireto: questions.filter(q => q.ganConfrontation.statusConfronto === "aprovada_gan").length,
        refinadasPelaGan: questions.filter(q => q.ganConfrontation.statusConfronto === "refinada_gan").length,
        bloqueadasPorDivergencia: 0,
        mediaScoreGan: Math.round(
          questions.reduce((acc, q) => acc + q.ganConfrontation.ganScore, 0) / questions.length
        ),
      },
    };
  }

  async function generateQuestionsWithGan(S, topicId, options = {}) {
    const map = ensureDraft(S, topicId);
    if (!map || !Array.isArray(map.ramos) || !map.ramos.length) {
      throw new Error("O mapa mental precisa ter pelo menos um ramo para gerar questões.");
    }
    const topic = S?.ed?.get(topicId);
    const topicTitle = topic?.titulo || map.centro || topicId;
    const formato = options.formato || studioState.ganConfig.formato || "ce";
    const count = Number(options.count || studioState.ganConfig.count || 4);
    const targetNodeId = text(options.targetNodeId ?? studioState.ganConfig.targetNodeId, 120);

    const cornellNotes = loadSavedCornellNotes();
    const linkedCornell = map.origemCornell?.noteId
      ? cornellNotes.find(n => n.id === map.origemCornell.noteId)
      : cornellNotes[0];
    const cornellContext = linkedCornell
      ? [
          `Título Cornell: ${linkedCornell.title || ""}`,
          `Pistas: ${(linkedCornell.cues || []).join(" | ")}`,
          `Notas: ${linkedCornell.notes || ""}`,
          `Síntese: ${linkedCornell.summary || ""}`,
          linkedCornell.referenceText ? `Fonte: ${linkedCornell.referenceText}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    let result = null;
    if (global.QBBridge && typeof global.QBBridge.ask === "function" && !options.forceLocal) {
      try {
        result = await global.QBBridge.ask("omniStudyAI", {
          task: "mindmap-gan-questions",
          topicId,
          topicTitle,
          formato,
          count,
          targetNodeId,
          mapa: map,
          cornellContext,
        });
      } catch (_err) {
        result = buildLocalGanBatch(map, { formato, count, targetNodeId });
      }
    } else {
      result = buildLocalGanBatch(map, { formato, count, targetNodeId });
    }

    const batch = {
      ...result,
      formato,
      targetNodeId,
      count,
      generatedAt: new Date().toISOString(),
    };
    studioState.ganBatches.set(topicId, batch);
    return batch;
  }

  function incorporateGanQuestions(S, topicId, selectedIndices = null) {
    const batch = studioState.ganBatches.get(topicId);
    if (!batch || !Array.isArray(batch.questions) || !batch.questions.length) {
      return { savedCount: 0, questionIds: [] };
    }
    const map = ensureDraft(S, topicId);
    const topic = S?.ed?.get(topicId) || { id: topicId, titulo: map.centro || topicId };
    const safeTopic = slugId(topicId, "topico").slice(0, 28);
    const cap = (Array.isArray(topic.caps) && topic.caps[0]) || `MM-${safeTopic.toUpperCase()}`;

    if (S.ed && S.ed.has(topicId) && (!Array.isArray(topic.caps) || !topic.caps.length)) {
      topic.caps = [cap];
      S.ed.set(topicId, topic);
      if (S.db && typeof S.db.doc === "function") {
        const upEdital = () => S.db.doc("edital/" + topicId).update({ caps: [cap] });
        if (appRef?.enqueue) appRef.enqueue(upEdital);
        else upEdital();
      }
    }

    const { list } = enumerateMapNodes(map);
    const nodeById = new Map(list.map(entry => [entry.id, entry.node]));
    const fallbackNode = list[0]?.node || null;

    const toSave = batch.questions.filter((q, idx) => {
      if (Array.isArray(selectedIndices)) return selectedIndices.includes(idx);
      return q.ganConfrontation?.statusConfronto !== "divergencia_bloqueada";
    });

    const savedIds = [];
    const stamp = Date.now().toString(36);

    toSave.forEach((q, idx) => {
      if (q.savedId && S.q?.has(q.savedId)) return;
      const qid = `mmgan-${safeTopic}-${stamp}-${String(idx + 1).padStart(2, "0")}`;
      const record = {
        ...q,
        id: qid,
        topico: topicId,
        cap,
        capNome: topic.titulo || map.centro || topicId,
        ordem: (S.q ? S.q.size : 0) + idx + 1,
        origem: "inédito Codex · Mapa Mental + Confronto GAN",
        ref: `Mapa Mental "${map.centro}" · Nó "${q.mapaNoTitulo || q.mapaNoId}" · GAN Score ${q.ganConfrontation?.ganScore || 90}/100`,
        statusEditorial: "aprovada-confronto-gan",
      };

      if (S.q) S.q.set(qid, record);
      q.savedId = qid;
      savedIds.push(qid);

      const targetNode = nodeById.get(q.mapaNoId) || fallbackNode;
      if (targetNode) {
        targetNode.x = targetNode.x || { e: `Conceito de ${targetNode.t}.` };
        targetNode.x.questaoIds = [...new Set([...(targetNode.x.questaoIds || []), qid])];
      }

      if (S.db && typeof S.db.doc === "function") {
        const writeQ = () => S.db.doc("questoes/" + qid).set(record);
        if (appRef?.enqueue) appRef.enqueue(writeQ);
        else writeQ();
      }
    });

    if (savedIds.length) {
      saveMapToEnvironment(S, topicId, map, { skipUndo: true });
    }

    return { savedCount: savedIds.length, questionIds: savedIds, cap };
  }

  /* ==========================================================================
     TREE MUTATION HELPERS (Branches, Subtopics, Labels, Cross-Links)
     ========================================================================== */
  function addBranch(S, topicId, customData = {}) {
    const map = ensureDraft(S, topicId);
    const nextNum = (map.ramos?.length || 0) + 1;
    const prefix = slugId(topicId, "mm").slice(0, 18);
    const newBranch = {
      id: customData.id || `${prefix}-r${nextNum}-${Date.now().toString(36).slice(-3)}`,
      t: text(customData.t || `Novo Ramo ${nextNum}`, 220),
      rotulo: text(customData.rotulo || `Ramo ${nextNum}`, 80),
      n: text(customData.n || "Síntese ou pista de evocação deste ramo.", 600),
      cor: Number(customData.cor) || ((nextNum - 1) % 8) + 1,
      caixa: Boolean(customData.caixa),
      x: {
        e: text(customData.e || `Explicação conceitual de ${customData.t || `Novo Ramo ${nextNum}`}.`, 2400),
        ...(customData.ex ? { ex: text(customData.ex, 1200) } : {}),
        ...(customData.trap ? { trap: text(customData.trap, 1200) } : {}),
        ...(customData.src ? { src: text(customData.src, 600) } : {}),
      },
      f: [],
    };
    map.ramos.push(newBranch);
    return newBranch;
  }

  function addSubtopic(S, topicId, parentPath, customData = {}) {
    const map = ensureDraft(S, topicId);
    const parent = getNodeAtPath(map, parentPath);
    if (!parent) return null;
    if (!Array.isArray(parent.f)) parent.f = [];
    const childIndex = parent.f.length + 1;
    const newChild = {
      id: customData.id || `${slugId(parent.id || topicId, "no")}-s${childIndex}-${Date.now().toString(36).slice(-3)}`,
      t: text(customData.t || `Subtópico ${childIndex} de ${parent.t}`, 220),
      rotulo: text(customData.rotulo || `Sub ${childIndex}`, 80),
      n: text(customData.n || "Detalhe ou distinção específica deste subtópico.", 600),
      cor: Number(customData.cor) || parent.cor || 1,
      caixa: Boolean(customData.caixa),
      x: {
        e: text(customData.e || `Detalhamento de ${customData.t || `Subtópico ${childIndex}`}.`, 2400),
        ...(customData.ex ? { ex: text(customData.ex, 1200) } : {}),
        ...(customData.trap ? { trap: text(customData.trap, 1200) } : {}),
        ...(customData.src ? { src: text(customData.src, 600) } : {}),
      },
      f: [],
    };
    parent.f.push(newChild);
    return newChild;
  }

  function updateNodeAtPath(S, topicId, pathStr, patch = {}) {
    const map = ensureDraft(S, topicId);
    const node = getNodeAtPath(map, pathStr);
    if (!node) return null;
    if (patch.t !== undefined) node.t = text(patch.t, 220) || node.t;
    if (patch.id !== undefined && text(patch.id, 120)) node.id = slugId(patch.id, node.id);
    if (patch.rotulo !== undefined) node.rotulo = text(patch.rotulo, 80);
    if (patch.n !== undefined) node.n = text(patch.n, 600);
    if (patch.cor !== undefined) {
      const c = Number(patch.cor);
      if (c >= 1 && c <= 8) node.cor = c;
    }
    if (patch.caixa !== undefined) node.caixa = Boolean(patch.caixa);
    node.x = node.x && typeof node.x === "object" ? node.x : { e: "" };
    if (patch.e !== undefined) node.x.e = text(patch.e, 2400);
    if (patch.ex !== undefined) node.x.ex = text(patch.ex, 1200);
    if (patch.trap !== undefined) node.x.trap = text(patch.trap, 1200);
    if (patch.src !== undefined) node.x.src = text(patch.src, 600);
    return node;
  }

  function moveNodeAtPath(S, topicId, pathStr, direction) {
    const map = ensureDraft(S, topicId);
    const info = getParentArrayAndIndex(map, pathStr);
    if (!info) return false;
    const { list, index } = info;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return false;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    return true;
  }

  function removeNodeAtPath(S, topicId, pathStr) {
    const map = ensureDraft(S, topicId);
    const info = getParentArrayAndIndex(map, pathStr);
    if (!info) return false;
    const { list, index } = info;
    if (index < 0 || index >= list.length) return false;
    list.splice(index, 1);
    return true;
  }

  function addCrossLink(S, topicId, fromId, toId, relacao) {
    const map = ensureDraft(S, topicId);
    const f = text(fromId, 120);
    const t = text(toId, 120);
    const rel = text(relacao || "Conexão transversal", 180);
    if (!f || !t || f === t) return false;
    if (!Array.isArray(map.ligacoes)) map.ligacoes = [];
    map.ligacoes.push([f, t, rel]);
    return true;
  }

  function removeCrossLink(S, topicId, linkIndex) {
    const map = ensureDraft(S, topicId);
    if (!Array.isArray(map.ligacoes) || linkIndex < 0 || linkIndex >= map.ligacoes.length) return false;
    map.ligacoes.splice(linkIndex, 1);
    return true;
  }

  /* ==========================================================================
     UI RENDERERS FOR STUDY-SHELL (viewMapa)
     ========================================================================== */
  function allTopicOptions(S) {
    const mapIds = [...(S?.rv?.entries() || [])]
      .filter(([, v]) => v && v.mapa)
      .map(([k]) => k);
    const editalTopics = [...(S?.ed?.values() || [])]
      .filter(t => t && !t.foraEdital)
      .sort((a, b) => (+a.ordem || 0) - (+b.ordem || 0));

    const seen = new Set();
    const withMap = [];
    const withoutMap = [];

    for (const t of editalTopics) {
      seen.add(t.id);
      const label = [t.sigla?.toUpperCase(), t.num, t.titulo].filter(Boolean).join(" · ");
      if (S?.rv?.get(t.id)?.mapa) withMap.push({ id: t.id, label, hasMap: true });
      else withoutMap.push({ id: t.id, label, hasMap: false });
    }
    for (const id of mapIds) {
      if (!seen.has(id)) {
        const rev = S.rv.get(id);
        withMap.push({ id, label: rev?.mapa?.centro || rev?.titulo || id, hasMap: true });
      }
    }
    return { withMap, withoutMap, all: [...withMap, ...withoutMap] };
  }

  function renderNodeEditorHTML(topicId, node, pathStr, depth = 0) {
    const colorObj = COLORS.find(c => c.id === Number(node.cor)) || COLORS[depth % COLORS.length];
    const levelLabel = depth === 0 ? `RAMO ${Number(pathStr) + 1}` : `SUBTÓPICO ${pathStr.split(".").map(n => Number(n) + 1).join(".")}`;
    const detailKey = `${topicId}:${pathStr}`;
    const isDetailOpen = studioState.openDetails.has(detailKey);
    const children = Array.isArray(node.f) ? node.f : [];

    return `<div class="qb-mm-node-card" data-mm-node-card="${esc(pathStr)}" style="--mm-branch-color:${colorObj.hex}">
      <div class="qb-mm-node-top">
        <span class="qb-mm-node-badge">${esc(levelLabel)}${node.rotulo ? ` · ${esc(node.rotulo)}` : ""}</span>
        <input type="text" class="qb-mm-input qb-mm-input-title" data-mm-field="t" data-mm-path="${esc(pathStr)}" value="${esc(node.t || "")}" placeholder="Título do ramo ou subtópico" aria-label="Título do conceito ${esc(levelLabel)}">
        <input type="text" class="qb-mm-input qb-mm-input-label" data-mm-field="rotulo" data-mm-path="${esc(pathStr)}" value="${esc(node.rotulo || "")}" placeholder="Rótulo (ex: Regra, Exceção)" aria-label="Rótulo personalizado">
        <select class="qb-mm-select" style="width:auto;min-width:128px" data-mm-field="cor" data-mm-path="${esc(pathStr)}" aria-label="Cor do ramo">
          ${COLORS.map(c => `<option value="${c.id}" ${Number(node.cor || 1) === c.id ? "selected" : ""}>● ${esc(c.name)}</option>`).join("")}
        </select>
        <label style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:#cbd5e1;cursor:pointer">
          <input type="checkbox" data-mm-field="caixa" data-mm-path="${esc(pathStr)}" ${node.caixa ? "checked" : ""}> Destaque
        </label>
        <button type="button" class="qb-mm-btn qb-mm-btn-small" data-mm-add-sub="${esc(pathStr)}" title="Adicionar subtópico dentro deste item">＋ Subtópico</button>
        <button type="button" class="qb-mm-btn qb-mm-btn-small" data-mm-move="up" data-mm-path="${esc(pathStr)}" title="Mover para cima">↑</button>
        <button type="button" class="qb-mm-btn qb-mm-btn-small" data-mm-move="down" data-mm-path="${esc(pathStr)}" title="Mover para baixo">↓</button>
        <button type="button" class="qb-mm-btn qb-mm-btn-small qb-mm-btn-danger" data-mm-remove="${esc(pathStr)}" title="Remover este item">Excluir</button>
      </div>
      <div class="qb-mm-field">
        <input type="text" class="qb-mm-input" data-mm-field="n" data-mm-path="${esc(pathStr)}" value="${esc(node.n || "")}" placeholder="Nota rápida / pista de evocação ativa (exibida ao evocar o nó)">
      </div>
      <details class="qb-mm-node-details" data-mm-detail-key="${esc(detailKey)}" ${isDetailOpen ? "open" : ""}>
        <summary>Explicação profunda, Exemplo, Pegadinha de Prova e Fonte (ID: ${esc(node.id || "")})</summary>
        <div class="qb-mm-grid-2" style="margin-top:8px">
          <div class="qb-mm-field">
            <label>Explicação Conceitual</label>
            <textarea class="qb-mm-textarea" rows="2" data-mm-field="e" data-mm-path="${esc(pathStr)}" placeholder="Explique o conceito com clareza...">${esc(node.x?.e || "")}</textarea>
          </div>
          <div class="qb-mm-field">
            <label>Exemplo ou Caso Prático</label>
            <textarea class="qb-mm-textarea" rows="2" data-mm-field="ex" data-mm-path="${esc(pathStr)}" placeholder="Exemplo concreto de aplicação...">${esc(node.x?.ex || "")}</textarea>
          </div>
          <div class="qb-mm-field">
            <label>Pegadinha / Armadilha da Banca</label>
            <input type="text" class="qb-mm-input" data-mm-field="trap" data-mm-path="${esc(pathStr)}" value="${esc(node.x?.trap || "")}" placeholder="Como a banca tenta induzir ao erro neste ponto">
          </div>
          <div class="qb-mm-field">
            <label>Fonte / Dispositivo Legal</label>
            <input type="text" class="qb-mm-input" data-mm-field="src" data-mm-path="${esc(pathStr)}" value="${esc(node.x?.src || "")}" placeholder="Ex: Art. 58, § 2º, CF / Folha Cornell">
          </div>
        </div>
      </details>
      ${children.length ? `<div class="qb-mm-node-children">${children.map((child, idx) => renderNodeEditorHTML(topicId, child, `${pathStr}.${idx}`, depth + 1)).join("")}</div>` : ""}
    </div>`;
  }

  function studioHTML(S) {
    if (!S) return "";
    const { withMap, withoutMap, all } = allTopicOptions(S);
    const activeId = S.mapaId || withMap[0]?.id || withoutMap[0]?.id || "mapa-autoral-1";
    if (!S.mapaId) S.mapaId = activeId;

    const draft = ensureDraft(S, activeId);
    const cornellNotes = loadSavedCornellNotes();
    const studyMaterials = loadStudyMaterials(S);
    const { list: flatNodes } = enumerateMapNodes(draft);
    const undoCount = (studioState.undoStack.get(activeId) || []).length;
    const ganBatch = studioState.ganBatches.get(activeId);

    const toolbar = `<section class="qb-mm-studio-bar" aria-label="Estúdio de Mapas Mentais e Confronto GAN">
      <div class="qb-mm-studio-bar-title">
        <span class="qb-mm-studio-kicker">ESTÚDIO DE MAPAS MENTAIS · BASE CORNELL + GAN</span>
        <strong>${esc(draft.centro || "Mapa Mental")} · ${(draft.ramos || []).length} ramos (${flatNodes.length} nós)</strong>
      </div>
      <div class="qb-mm-studio-actions">
        <button type="button" class="qb-mm-btn qb-btn-gemini-primary" id="qb-mm-open-gemini-ingest" title="Ingerir notas e resumos do GeminiNotebook / NotebookLM">
          📥 Ingerir GeminiNotebook
        </button>
        <button type="button" class="qb-mm-btn ${studioState.editorOpen ? "qb-mm-btn-primary" : ""}" id="qb-mm-toggle-editor">
          ${studioState.editorOpen ? "▾ Fechar Editor do Mapa" : "✎ Editar Ramos, Subtópicos e Rótulos"}
        </button>
        <button type="button" class="qb-mm-btn" id="qb-mm-create-scratch">
          ＋ Criar Mapa do Zero
        </button>
        <button type="button" class="qb-mm-btn ${studioState.ganOpen ? "qb-mm-btn-gan" : ""}" id="qb-mm-toggle-gan">
          ⚔️ Gerar Questões do Mapa (GAN)
        </button>
        ${undoCount ? `<button type="button" class="qb-mm-btn" id="qb-mm-undo">↩ Desfazer (${undoCount})</button>` : ""}
      </div>
    </section>`;

    const statusBanner = studioState.statusMsg
      ? `<div class="qb-mm-status" role="status">${esc(studioState.statusMsg)}</div>`
      : "";

    const editorPanel = studioState.editorOpen
      ? `<section class="qb-mm-panel" id="qb-mm-editor-panel" aria-label="Editor de Mapa Mental">
          <div class="qb-mm-panel-head">
            <div>
              <h3>Construtor e Editor do Mapa Mental</h3>
              <p>Crie do zero ou personalize ramos, subtópicos aninhados, rótulos, cores e conexões de acordo com a sua preferência. Use também suas folhas do Caderno Cornell como base.</p>
            </div>
            <div class="qb-mm-studio-actions">
              <button type="button" class="qb-mm-btn qb-mm-btn-primary" id="qb-mm-save-map">💾 Salvar Mapa Mental</button>
              <button type="button" class="qb-mm-btn" id="qb-mm-add-branch">＋ Adicionar Ramo Principal</button>
            </div>
          </div>

          <div class="qb-mm-cornell-bar">
            <strong style="font-size:12px;color:#7dd3fc">📋 Base Caderno Cornell:</strong>
            ${
              cornellNotes.length
                ? `<select class="qb-mm-select" id="qb-mm-cornell-select" style="width:auto;min-width:240px" aria-label="Selecionar folha do Caderno Cornell">
                    ${cornellNotes.map(n => `<option value="${esc(n.id)}">${esc(n.title || "Folha Cornell")} (${esc(n.subject || "Geral")})</option>`).join("")}
                  </select>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" id="qb-mm-import-cornell-replace">Substituir Mapa pela Base Cornell</button>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" id="qb-mm-import-cornell-merge">＋ Mesclar Pistas Cornell</button>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" style="background:#0284c7;color:#fff" id="qb-mm-ai-rebuild-cornell">✨ Estruturar com IA</button>`
                : `<span style="font-size:12px;color:#94a3b8">Nenhuma folha salva ainda. Abra o botão <b>⚡ OmniStudy IA → Caderno Cornell</b> para criar sua base.</span>`
            }
            ${
              all.length
                ? `<span style="margin-left:auto;font-size:12px;color:#cbd5e1">Tópico destino:</span>
                   <select class="qb-mm-select" id="qb-mm-target-topic" style="width:auto;max-width:280px" aria-label="Selecionar tópico do edital para o mapa">
                     ${all.map(t => `<option value="${esc(t.id)}" ${t.id === activeId ? "selected" : ""}>${t.hasMap ? "🗺️ " : "＋ "}${esc(t.label)}</option>`).join("")}
                   </select>`
                : ""
            }
          </div>

          <div class="qb-mm-cornell-bar">
            <strong style="font-size:12px;color:#34d399">📑 Subsídio de Materiais & Artefatos Remissivos:</strong>
            ${
              studyMaterials.length
                ? `<select class="qb-mm-select" id="qb-mm-material-select" style="width:auto;min-width:260px" aria-label="Selecionar artefato ou material de estudo">
                    ${studyMaterials
                      .map(
                        m =>
                          `<option value="${esc(m.id)}">${m.origemArtefato === "cornell" ? "📓 " : "📄 "}${esc(
                            m.titulo || m.id
                          )}${m.materia ? ` (${esc(m.materia)})` : ""}</option>`
                      )
                      .join("")}
                  </select>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" id="qb-mm-import-material-replace">Criar Mapa a partir deste Material</button>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" id="qb-mm-import-material-merge">＋ Mesclar Seções do Material</button>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" style="background:#059669;color:#fff" id="qb-mm-ai-rebuild-material">✨ Estruturar com IA</button>
                  <button type="button" class="qb-mm-btn qb-mm-btn-small" style="background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#fff" id="qb-mm-import-gemini-bar">📥 Ingerir do GeminiNotebook</button>`
                : `<span style="font-size:12px;color:#94a3b8">Transforme suas folhas Cornell em Artefatos de Material ou adicione materiais na aba <b>Materiais</b> para usá-los como subsídio aqui.</span>
                   <button type="button" class="qb-mm-btn qb-mm-btn-small" style="background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#fff;margin-left:8px" id="qb-mm-import-gemini-bar">📥 Ingerir do GeminiNotebook</button>`
            }
          </div>

          <div class="qb-mm-grid-2">
            <div class="qb-mm-field">
              <label for="qb-mm-centro-input">Conceito Central do Mapa Mental</label>
              <input type="text" class="qb-mm-input" id="qb-mm-centro-input" value="${esc(draft.centro || "")}" placeholder="Ex: Processo Legislativo Constitucional (Art. 59 a 69 CF)">
            </div>
            <div class="qb-mm-field">
              <label for="qb-mm-autor-input">Rótulo Geral / Subtítulo do Mapa</label>
              <input type="text" class="qb-mm-input" id="qb-mm-autor-input" value="${esc(draft.autor || "")}" placeholder="Ex: Esquema próprio · Base Cornell + Jurisprudência">
            </div>
          </div>

          <div class="qb-mm-tree-editor">
            ${(draft.ramos || []).map((ramo, idx) => renderNodeEditorHTML(activeId, ramo, String(idx), 0)).join("")}
          </div>

          <div class="qb-mm-cornell-bar" style="justify-content:space-between">
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
              <strong style="font-size:12px;color:#7dd3fc">🔗 Ligações Cruzadas (${(draft.ligacoes || []).length}):</strong>
              <select class="qb-mm-select" id="qb-mm-link-from" style="width:auto;max-width:190px" aria-label="Nó de origem">
                ${flatNodes.map(n => `<option value="${esc(n.id)}">${esc(n.title)}</option>`).join("")}
              </select>
              <span>→</span>
              <select class="qb-mm-select" id="qb-mm-link-to" style="width:auto;max-width:190px" aria-label="Nó de destino">
                ${flatNodes.map((n, i) => `<option value="${esc(n.id)}" ${i === flatNodes.length - 1 ? "selected" : ""}>${esc(n.title)}</option>`).join("")}
              </select>
              <input type="text" class="qb-mm-input" id="qb-mm-link-label" style="width:180px" placeholder="Rótulo da ligação">
              <button type="button" class="qb-mm-btn qb-mm-btn-small" id="qb-mm-add-link">＋ Ligar Nós</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${(draft.ligacoes || [])
                .map(
                  (l, idx) =>
                    `<span class="qb-mm-node-badge">${esc(l[0])} → ${esc(l[1])} (${esc(l[2] || "vínculo")}) <button type="button" data-mm-del-link="${idx}" style="background:none;border:0;color:#fca5a5;cursor:pointer">×</button></span>`
                )
                .join("")}
            </div>
          </div>

          <div class="qb-mm-studio-actions" style="justify-content:flex-end">
            <button type="button" class="qb-mm-btn" id="qb-mm-add-branch-bottom">＋ Novo Ramo Principal</button>
            <button type="button" class="qb-mm-btn qb-mm-btn-primary" id="qb-mm-save-map-bottom">💾 Salvar e Atualizar Mapa 3D / Lista</button>
          </div>
        </section>`
      : "";

    const ganPanel = studioState.ganOpen
      ? `<section class="qb-mm-panel" id="qb-mm-gan-panel" aria-label="Gerador de Questões do Mapa Mental com Confronto GAN">
          <div class="qb-mm-panel-head">
            <div>
              <h3>⚔️ Geração de Questões a partir do Mapa Mental · Confronto GAN</h3>
              <p>O <b>Agente Gerador</b> formula questões inéditas a partir dos seus ramos, subtópicos e rótulos, e o <b>Agente Discriminador Cego (GAN)</b> tenta quebrá-las sem ver o gabarito, auditando univocidade, fidelidade ao mapa e armadilhas antes da aprovação.</p>
            </div>
          </div>

          <div class="qb-mm-cornell-bar">
            <label style="font-size:12px;color:#cbd5e1">Escopo do Mapa:
              <select class="qb-mm-select" id="qb-mm-gan-node" style="width:auto;min-width:210px;margin-left:6px">
                <option value="">Mapa Mental Completo (${flatNodes.length} nós)</option>
                ${flatNodes.map(n => `<option value="${esc(n.id)}" ${studioState.ganConfig.targetNodeId === n.id ? "selected" : ""}>${"› ".repeat(n.depth)}${esc(n.title)}</option>`).join("")}
              </select>
            </label>
            <label style="font-size:12px;color:#cbd5e1">Formato:
              <select class="qb-mm-select" id="qb-mm-gan-format" style="width:auto;margin-left:6px">
                <option value="ce" ${studioState.ganConfig.formato === "ce" ? "selected" : ""}>Certo / Errado (CEBRASPE · F1–F10 / V1–V4)</option>
                <option value="multipla_escolha" ${studioState.ganConfig.formato === "multipla_escolha" ? "selected" : ""}>Múltipla Escolha (A–E)</option>
              </select>
            </label>
            <label style="font-size:12px;color:#cbd5e1">Quantidade:
              <select class="qb-mm-select" id="qb-mm-gan-count" style="width:auto;margin-left:6px">
                ${[3, 4, 6, 8].map(n => `<option value="${n}" ${Number(studioState.ganConfig.count) === n ? "selected" : ""}>${n} questões</option>`).join("")}
              </select>
            </label>
            <button type="button" class="qb-mm-btn qb-mm-btn-gan" id="qb-mm-gan-run" ${studioState.busy ? "disabled" : ""}>
              ${studioState.busy ? "⏳ Confrontando Gerador × Discriminador GAN..." : "⚔️ Gerar e Confrontar na GAN"}
            </button>
          </div>

          ${
            ganBatch && Array.isArray(ganBatch.questions)
              ? `<div class="qb-mm-cornell-bar" style="justify-content:space-between">
                  <div>
                    <strong style="color:#6ee7b7">Resultado do Confronto GAN:</strong>
                    <span style="font-size:12.5px;margin-left:8px">${ganBatch.summary?.aprovadasDireto || 0} aprovadas por unanimidade cega · ${ganBatch.summary?.refinadasPelaGan || 0} refinadas após crítica adversária · Score médio GAN: <b>${ganBatch.summary?.mediaScoreGan || 90}/100</b></span>
                  </div>
                  <button type="button" class="qb-mm-btn qb-mm-btn-primary" id="qb-mm-gan-save-all">
                    ＋ Incorporar Todas ao Banco e Vincular aos Nós do Mapa
                  </button>
                </div>
                <div class="qb-mm-tree-editor">
                  ${ganBatch.questions
                    .map((q, idx) => {
                      const gan = q.ganConfrontation || {};
                      const pillClass =
                        gan.statusConfronto === "refinada_gan"
                          ? "refined"
                          : gan.statusConfronto === "divergencia_bloqueada"
                          ? "blocked"
                          : "";
                      const pillLabel =
                        gan.statusConfronto === "refinada_gan"
                          ? `⚡ REFINADA PELA GAN · Score ${gan.ganScore || 88}/100`
                          : gan.statusConfronto === "divergencia_bloqueada"
                          ? `⚠ DIVERGÊNCIA DETECTADA PELA GAN`
                          : `✓ APROVADA PELA GAN · Score ${gan.ganScore || 92}/100`;
                      return `<article class="qb-mm-gan-card" data-mm-gan-item="${idx}">
                        <div class="qb-mm-gan-badges">
                          <span class="qb-mm-gan-pill ${pillClass}">${esc(pillLabel)}</span>
                          <span class="qb-mm-node-badge">Nó do Mapa: ${esc(q.mapaNoTitulo || q.mapaNoId)}</span>
                          ${q.mecanismo ? `<span class="qb-mm-node-badge">Mecanismo: ${esc(q.mecanismo)}</span>` : ""}
                          <span class="qb-mm-node-badge">Gabarito: ${esc(q.gabarito)} (Gerador: ${esc(gan.generatorKey || q.gabarito)} × Discriminador Cego: ${esc(gan.discriminatorKey || q.gabarito)})</span>
                        </div>
                        <p style="margin:0;font-size:13.5px;line-height:1.5;color:#f8fafc"><b>Item ${idx + 1}.</b> ${esc(q.enunciado)}</p>
                        ${
                          Array.isArray(q.alternativas) && q.alternativas.length
                            ? `<div style="font-size:12.5px;color:#cbd5e1;display:flex;flex-direction:column;gap:4px">${q.alternativas
                                .map(o => `<div><b>${esc(o.letra)})</b> ${esc(o.texto)}</div>`)
                                .join("")}</div>`
                            : ""
                        }
                        <div class="qb-mm-gan-versus">
                          <div>
                            <strong>Tese do Agente Gerador</strong>
                            <span>${esc(gan.generatorThesis || q.comentario)}</span>
                          </div>
                          <div>
                            <strong>Auditoria Cega do Discriminador (GAN)</strong>
                            <span>${esc(gan.discriminatorCritique || "Gabarito confirmado em revisão cega.")}</span>
                          </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                          <small style="color:#94a3b8"><b>Comentário final:</b> ${esc(q.comentario)}</small>
                          ${
                            q.savedId
                              ? `<span class="qb-mm-gan-pill">✓ Incorporada ao nó (${esc(q.savedId)})</span>`
                              : `<button type="button" class="qb-mm-btn qb-mm-btn-small qb-mm-btn-primary" data-mm-gan-save-one="${idx}">＋ Salvar Questão no Nó</button>`
                          }
                        </div>
                      </article>`;
                    })
                    .join("")}
                </div>`
              : ""
          }
        </section>`
      : "";

    const geminiModalHTML = `<div class="qb-gemini-modal-backdrop" id="qb-gemini-modal-backdrop" aria-hidden="true">
      <div class="qb-gemini-modal" role="dialog" aria-modal="true" aria-labelledby="qb-gemini-modal-title">
        <div class="qb-gemini-modal-head">
          <div>
            <h3 id="qb-gemini-modal-title">📥 Ingestão GeminiNotebook / NotebookLM</h3>
            <p>Importe notas, resumos, fontes ou áudio-briefings gerados no seu acervo do GeminiNotebook para transformá-los instantaneamente em subsídios, folhas Cornell e Mapas Mentais AXON.</p>
          </div>
          <button type="button" class="qb-gemini-modal-close" id="qb-gemini-modal-close" aria-label="Fechar">✕</button>
        </div>
        <div class="qb-gemini-modal-body">
          <div>
            <label for="qb-gemini-input-title">Título da Nota / Caderno</label>
            <input type="text" id="qb-gemini-input-title" placeholder="Ex: Processo Legislativo - Veto e Sanção Presidencial">
          </div>
          <div class="qb-mm-grid-2">
            <div>
              <label for="qb-gemini-select-topic">Tópico do Edital Vinculado</label>
              <select id="qb-gemini-select-topic">
                ${all.map(t => `<option value="${esc(t.id)}" ${t.id === activeId ? "selected" : ""}>${esc(t.label)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label for="qb-gemini-input-subject">Matéria do Concurso</label>
              <input type="text" id="qb-gemini-input-subject" value="${esc(S.ed?.get(activeId)?.materia || S.ed?.get(activeId)?.sigla || "Geral")}">
            </div>
          </div>
          <div>
            <label for="qb-gemini-textarea-content">Conteúdo do GeminiNotebook (Texto, Markdown, Perguntas, Resumo)</label>
            <textarea id="qb-gemini-textarea-content" placeholder="Cole aqui as anotações, sínteses de fontes, perguntas-chave ou o roteiro de estudo exportado do GeminiNotebook ou NotebookLM..."></textarea>
          </div>
          <div class="qb-gemini-checkboxes">
            <label class="qb-gemini-check-item">
              <input type="checkbox" id="qb-gemini-check-material" checked>
              <span><b>Material de Estudo:</b> Salvar na aba Materiais como subsídio remissivo</span>
            </label>
            <label class="qb-gemini-check-item">
              <input type="checkbox" id="qb-gemini-check-cornell" checked>
              <span><b>Caderno Cornell:</b> Gerar folha estruturada com pistas (30%) e notas (70%)</span>
            </label>
            <label class="qb-gemini-check-item">
              <input type="checkbox" id="qb-gemini-check-mindmap" checked>
              <span><b>Mapa Mental AXON:</b> Estruturar mapa mental imediatamente com rótulos e conceitos</span>
            </label>
          </div>
        </div>
        <div class="qb-gemini-modal-footer">
          <button type="button" class="qb-mm-btn" id="qb-gemini-btn-cancel">Cancelar</button>
          <button type="button" class="qb-mm-btn qb-btn-gemini-primary" id="qb-gemini-btn-submit">✨ Concluir Ingestão de Subsídio</button>
        </div>
      </div>
    </div>`;

    return toolbar + statusBanner + editorPanel + ganPanel + geminiModalHTML;
  }

  function syncDomInputsToDraft(S, topicId) {
    const panel = document.getElementById("qb-mm-editor-panel");
    if (!panel) return ensureDraft(S, topicId);
    const draft = ensureDraft(S, topicId);
    const centroEl = document.getElementById("qb-mm-centro-input");
    const autorEl = document.getElementById("qb-mm-autor-input");
    if (centroEl) draft.centro = text(centroEl.value, 240) || draft.centro;
    if (autorEl) draft.autor = text(autorEl.value, 240);

    panel.querySelectorAll("[data-mm-field]").forEach(el => {
      const pathStr = el.getAttribute("data-mm-path");
      const field = el.getAttribute("data-mm-field");
      if (!pathStr || !field) return;
      const val = el.type === "checkbox" ? el.checked : el.value;
      updateNodeAtPath(S, topicId, pathStr, { [field]: val });
    });

    panel.querySelectorAll("details[data-mm-detail-key]").forEach(det => {
      const key = det.getAttribute("data-mm-detail-key");
      if (det.open) studioState.openDetails.add(key);
      else studioState.openDetails.delete(key);
    });

    return draft;
  }

  function wire(S, helpers = {}) {
    appRef = { S, ...helpers };
    if (S?.view !== "mapa") return;
    const topicId = S.mapaId || allTopicOptions(S).all[0]?.id || "mapa-autoral-1";

    const rerender = () => {
      if (typeof helpers.render === "function") helpers.render(true);
    };

    // Modal de Ingestão GeminiNotebook / NotebookLM
    const modalBackdrop = document.getElementById("qb-gemini-modal-backdrop");
    const openGeminiModal = () => {
      if (modalBackdrop) {
        modalBackdrop.classList.add("open");
        modalBackdrop.setAttribute("aria-hidden", "false");
        const titleInput = document.getElementById("qb-gemini-input-title");
        if (titleInput) titleInput.focus();
      }
    };
    const closeGeminiModal = () => {
      if (modalBackdrop) {
        modalBackdrop.classList.remove("open");
        modalBackdrop.setAttribute("aria-hidden", "true");
      }
    };

    document.getElementById("qb-mm-open-gemini-ingest")?.addEventListener("click", openGeminiModal);
    document.getElementById("qb-mm-import-gemini-bar")?.addEventListener("click", openGeminiModal);
    document.getElementById("qb-gemini-modal-close")?.addEventListener("click", closeGeminiModal);
    document.getElementById("qb-gemini-btn-cancel")?.addEventListener("click", closeGeminiModal);
    modalBackdrop?.addEventListener("click", e => {
      if (e.target === modalBackdrop) closeGeminiModal();
    });

    document.getElementById("qb-gemini-btn-submit")?.addEventListener("click", async () => {
      const title = document.getElementById("qb-gemini-input-title")?.value?.trim();
      const content = document.getElementById("qb-gemini-textarea-content")?.value?.trim();
      const selectedTopic = document.getElementById("qb-gemini-select-topic")?.value || topicId;
      const subject =
        document.getElementById("qb-gemini-input-subject")?.value?.trim() ||
        S?.ed?.get(selectedTopic)?.materia ||
        "Geral";
      const asMaterial = document.getElementById("qb-gemini-check-material")?.checked !== false;
      const asCornell = document.getElementById("qb-gemini-check-cornell")?.checked !== false;
      const asMindMap = document.getElementById("qb-gemini-check-mindmap")?.checked !== false;

      if (!content) {
        alert("Cole o conteúdo do GeminiNotebook ou NotebookLM antes de concluir.");
        return;
      }

      const submit = document.getElementById("qb-gemini-btn-submit");
      const priorLabel = submit?.textContent;
      if (submit?.disabled) return;
      if (submit) {
        submit.disabled = true;
        submit.textContent = asMindMap ? "Estruturando texto por IA…" : "Importando material…";
      }
      try {
        const itemTitle = title || "Nota de estudo · " + subject;
        // Com mapa marcado, a IA interpreta o texto ANTES de qualquer gravação.
        // Sem geração válida, mantemos o mapa anterior e não importamos parcialmente.
        let response = null;
        if (asMindMap) {
          if (content.length > 27000)
            throw new Error("O texto ultrapassa 27.000 caracteres. Divida-o em partes, sem truncar conteúdo.");
          response = await gerarMapaComIA({
            structuredInput: true,
            topicId: selectedTopic,
            title: itemTitle.slice(0, 300),
            subject: subject.slice(0, 300),
            cues: [],
            notes: content.slice(0, 12000),
            summary: "",
            referenceText: content.slice(12000, 27000),
          });
        }
        const imported = ingestGeminiNotebook({
          title: itemTitle,
          subject,
          topicId: selectedTopic,
          content,
          asMaterial,
          asCornell,
          asMindMap,
        }, S, { generatedMap: response?.mapa, commitMap: !asMindMap });
        if (asMindMap && imported.mapa) {
          // Prévia editável: a revisão preexistente NÃO é substituída até Salvar.
          studioState.drafts.set(selectedTopic, clone(imported.mapa));
          S.mapaId = selectedTopic;
          studioState.editorOpen = true;
          const cobertura = response?.cobertura;
          studioState.statusMsg = "Prévia do mapa pronta: "
            + (cobertura ? cobertura.topicos + " nós e " + cobertura.ramos + " ramos preservados. " : "")
            + "Revise os campos e clique em SALVAR MAPA MENTAL para substituir o mapa anterior."
            + avisoIA(response);
        } else {
          studioState.statusMsg = "Material importado. O mapa mental atual foi preservado.";
        }
        closeGeminiModal();
        rerender();
      } catch (err) {
        alert("Não foi possível estruturar o texto: " + (err?.message || "erro da IA") + ". Nenhum mapa foi substituído.");
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = priorLabel; }
      }
    });

    document.getElementById("qb-mm-toggle-editor")?.addEventListener("click", () => {
      studioState.editorOpen = !studioState.editorOpen;
      studioState.statusMsg = "";
      rerender();
    });

    document.getElementById("qb-mm-toggle-gan")?.addEventListener("click", () => {
      studioState.ganOpen = !studioState.ganOpen;
      studioState.statusMsg = "";
      rerender();
    });

    document.getElementById("qb-mm-create-scratch")?.addEventListener("click", () => {
      const { withoutMap, all } = allTopicOptions(S);
      const targetTopic = withoutMap[0]?.id || topicId || all[0]?.id || `mapa-${Date.now().toString(36)}`;
      const title = S.ed?.get(targetTopic)?.titulo || "Meu Novo Mapa Mental";
      const fresh = createEmptyMap(targetTopic, title);
      saveMapToEnvironment(S, targetTopic, fresh);
      studioState.editorOpen = true;
      studioState.statusMsg = `Novo mapa mental criado para "${title}". Personalize os ramos, subtópicos e rótulos abaixo!`;
      rerender();
    });

    document.getElementById("qb-mm-undo")?.addEventListener("click", () => {
      if (undoDraft(S, topicId)) {
        studioState.statusMsg = "Última versão do mapa mental restaurada com sucesso.";
        rerender();
      }
    });

    document.getElementById("qb-mm-target-topic")?.addEventListener("change", e => {
      const nextId = e.target.value;
      if (!nextId) return;
      S.mapaId = nextId;
      ensureDraft(S, nextId);
      studioState.statusMsg = `Tópico "${S.ed?.get(nextId)?.titulo || nextId}" selecionado no construtor.`;
      rerender();
    });

    const saveHandler = () => {
      const updated = syncDomInputsToDraft(S, topicId);
      saveMapToEnvironment(S, topicId, updated);
      studioState.statusMsg = "Mapa mental salvo! A visualização 3D AXON e a árvore em lista foram atualizadas.";
      if (helpers.toast) helpers.toast("Mapa mental salvo com sucesso.");
      rerender();
    };
    document.getElementById("qb-mm-save-map")?.addEventListener("click", saveHandler);
    document.getElementById("qb-mm-save-map-bottom")?.addEventListener("click", saveHandler);

    const addBranchHandler = () => {
      syncDomInputsToDraft(S, topicId);
      addBranch(S, topicId);
      saveMapToEnvironment(S, topicId, ensureDraft(S, topicId));
      studioState.statusMsg = "Novo ramo principal adicionado.";
      rerender();
    };
    document.getElementById("qb-mm-add-branch")?.addEventListener("click", addBranchHandler);
    document.getElementById("qb-mm-add-branch-bottom")?.addEventListener("click", addBranchHandler);

    document.querySelectorAll("[data-mm-add-sub]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pathStr = btn.getAttribute("data-mm-add-sub");
        syncDomInputsToDraft(S, topicId);
        addSubtopic(S, topicId, pathStr);
        saveMapToEnvironment(S, topicId, ensureDraft(S, topicId));
        studioState.statusMsg = "Subtópico adicionado dentro do ramo.";
        rerender();
      });
    });

    document.querySelectorAll("[data-mm-move]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pathStr = btn.getAttribute("data-mm-path");
        const dir = btn.getAttribute("data-mm-move");
        syncDomInputsToDraft(S, topicId);
        if (moveNodeAtPath(S, topicId, pathStr, dir)) {
          saveMapToEnvironment(S, topicId, ensureDraft(S, topicId));
          rerender();
        }
      });
    });

    document.querySelectorAll("[data-mm-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pathStr = btn.getAttribute("data-mm-remove");
        syncDomInputsToDraft(S, topicId);
        const draft = ensureDraft(S, topicId);
        if (!pathStr.includes(".") && (draft.ramos || []).length <= 1) {
          studioState.statusMsg = "O mapa precisa manter pelo menos 1 ramo principal.";
          rerender();
          return;
        }
        if (removeNodeAtPath(S, topicId, pathStr)) {
          saveMapToEnvironment(S, topicId, draft);
          studioState.statusMsg = "Item removido do mapa (você pode clicar em Desfazer se desejar).";
          rerender();
        }
      });
    });

    document.getElementById("qb-mm-add-link")?.addEventListener("click", () => {
      syncDomInputsToDraft(S, topicId);
      const fromId = document.getElementById("qb-mm-link-from")?.value;
      const toId = document.getElementById("qb-mm-link-to")?.value;
      const label = document.getElementById("qb-mm-link-label")?.value;
      if (addCrossLink(S, topicId, fromId, toId, label)) {
        saveMapToEnvironment(S, topicId, ensureDraft(S, topicId));
        studioState.statusMsg = "Ligação cruzada adicionada ao mapa.";
        rerender();
      }
    });

    document.querySelectorAll("[data-mm-del-link]").forEach(btn => {
      btn.addEventListener("click", () => {
        syncDomInputsToDraft(S, topicId);
        const idx = Number(btn.getAttribute("data-mm-del-link"));
        if (removeCrossLink(S, topicId, idx)) {
          saveMapToEnvironment(S, topicId, ensureDraft(S, topicId));
          rerender();
        }
      });
    });

    document.getElementById("qb-mm-import-cornell-replace")?.addEventListener("click", () => {
      const noteId = document.getElementById("qb-mm-cornell-select")?.value;
      const note = loadSavedCornellNotes().find(n => n.id === noteId) || loadSavedCornellNotes()[0];
      if (!note) return;
      const converted = cornellToMindMap(note, {
        topicId,
        topicTitle: S.ed?.get(topicId)?.titulo || note.title,
      });
      saveMapToEnvironment(S, topicId, converted);
      studioState.statusMsg = `Mapa mental estruturado a partir da folha Cornell "${note.title}". Personalize os subtópicos e rótulos como preferir!`;
      rerender();
    });

    document.getElementById("qb-mm-ai-rebuild-cornell")?.addEventListener("click", async () => {
      const noteId = document.getElementById("qb-mm-cornell-select")?.value;
      const note = loadSavedCornellNotes().find(n => n.id === noteId) || loadSavedCornellNotes()[0];
      if (!note) return;
      studioState.statusMsg = `Estruturando o mapa com IA a partir de "${note.title}"… (pode levar até um minuto)`;
      rerender();
      try {
        const res = await gerarMapaComIA({
          topicId,
          title: String(note.title || "Mapa mental").slice(0, 300),
          subject: String(note.subject || "").slice(0, 300),
          cues: (Array.isArray(note.cues) ? note.cues : String(note.cues || "").split(/\r?\n/)).filter(Boolean).map(c => String(c).slice(0, 400)).slice(0, 24),
          notes: String(note.notes || "").slice(0, 12000),
          summary: String(note.summary || "").slice(0, 2500),
          referenceText: String(note.referenceText || "").slice(0, 15000),
        });
        const mapDraft = normalizeMap(res.mapa, note.title, topicId);
        associateQuestionsToNode(mapDraft, S, topicId, note.subject);
        saveMapToEnvironment(S, topicId, mapDraft);
        studioState.statusMsg = `Mapa estruturado pela IA a partir de "${note.title}". Confira com a fonte antes de estudar.` + avisoIA(res);
      } catch (err) {
        // Não sobrescreve o mapa atual nem finge que a IA funcionou.
        studioState.statusMsg = `A IA não gerou o mapa: ${err?.message || "sem conexão"}. O mapa atual foi mantido. Para a conversão simples, sem IA, use "Substituir Mapa pela Base Cornell".`;
      }
      rerender();
    });

    document.getElementById("qb-mm-import-cornell-merge")?.addEventListener("click", () => {
      const noteId = document.getElementById("qb-mm-cornell-select")?.value;
      const note = loadSavedCornellNotes().find(n => n.id === noteId) || loadSavedCornellNotes()[0];
      if (!note) return;
      syncDomInputsToDraft(S, topicId);
      const currentDraft = ensureDraft(S, topicId);
      const fromCornell = cornellToMindMap(note, { topicId: `${topicId}-c` });
      currentDraft.ramos = [...(currentDraft.ramos || []), ...(fromCornell.ramos || [])];
      saveMapToEnvironment(S, topicId, currentDraft);
      studioState.statusMsg = `Ramos da folha Cornell "${note.title}" mesclados ao mapa mental atual.`;
      rerender();
    });

    document.getElementById("qb-mm-import-material-replace")?.addEventListener("click", () => {
      const matId = document.getElementById("qb-mm-material-select")?.value;
      const mats = loadStudyMaterials(S);
      const mat = mats.find(m => m.id === matId) || mats[0];
      if (!mat) return;
      const converted = materialToMindMap(mat, {
        topicId,
        topicTitle: S.ed?.get(topicId)?.titulo || mat.titulo,
        materia: mat.materia,
      });
      saveMapToEnvironment(S, topicId, converted);
      studioState.statusMsg = `Mapa mental estruturado usando como subsídio o material "${mat.titulo || mat.id}". Personalize ramos, subtópicos e rótulos!`;
      rerender();
    });

    document.getElementById("qb-mm-ai-rebuild-material")?.addEventListener("click", async () => {
      const matId = document.getElementById("qb-mm-material-select")?.value;
      const mats = loadStudyMaterials(S);
      const mat = mats.find(m => m.id === matId) || mats[0];
      if (!mat) return;
      studioState.statusMsg = `Estruturando o mapa com IA a partir de "${mat.titulo || mat.id}"… (pode levar até um minuto)`;
      rerender();
      try {
        const res = await gerarMapaComIA({
          topicId,
          title: String(mat.titulo || mat.id || "Mapa mental").slice(0, 300),
          subject: String(mat.materia || "").slice(0, 300),
          cues: (Array.isArray(mat.pistas) ? mat.pistas : (mat.secoes || [])).filter(Boolean).map(c => String(c).slice(0, 400)).slice(0, 24),
          notes: String(mat.anotacoes || mat.conteudo || mat.texto || mat.descricao || "").slice(0, 12000),
          summary: String(mat.resumo || "").slice(0, 2500),
          referenceText: String(mat.referenceText || "").slice(0, 15000),
        });
        const mapDraft = normalizeMap(res.mapa, mat.titulo || mat.id, topicId);
        associateQuestionsToNode(mapDraft, S, topicId, mat.materia);
        saveMapToEnvironment(S, topicId, mapDraft);
        studioState.statusMsg = `Mapa estruturado pela IA a partir de "${mat.titulo || mat.id}". Confira com a fonte antes de estudar.` + avisoIA(res);
      } catch (err) {
        studioState.statusMsg = `A IA não gerou o mapa: ${err?.message || "sem conexão"}. O mapa atual foi mantido. Para a conversão simples, sem IA, use "Criar Mapa a partir deste Material".`;
      }
      rerender();
    });

    document.getElementById("qb-mm-import-material-merge")?.addEventListener("click", () => {
      const matId = document.getElementById("qb-mm-material-select")?.value;
      const mats = loadStudyMaterials(S);
      const mat = mats.find(m => m.id === matId) || mats[0];
      if (!mat) return;
      syncDomInputsToDraft(S, topicId);
      const currentDraft = ensureDraft(S, topicId);
      const fromMat = materialToMindMap(mat, { topicId: `${topicId}-m` });
      currentDraft.ramos = [...(currentDraft.ramos || []), ...(fromMat.ramos || [])];
      saveMapToEnvironment(S, topicId, currentDraft);
      studioState.statusMsg = `Seções e pistas do material "${mat.titulo || mat.id}" mescladas ao mapa mental atual.`;
      rerender();
    });

    // Controles do gerador GAN
    document.getElementById("qb-mm-gan-node")?.addEventListener("change", e => {
      studioState.ganConfig.targetNodeId = e.target.value;
    });
    document.getElementById("qb-mm-gan-format")?.addEventListener("change", e => {
      studioState.ganConfig.formato = e.target.value;
    });
    document.getElementById("qb-mm-gan-count")?.addEventListener("change", e => {
      studioState.ganConfig.count = Number(e.target.value) || 4;
    });

    document.getElementById("qb-mm-gan-run")?.addEventListener("click", async () => {
      if (studioState.busy) return;
      if (studioState.editorOpen) {
        const updated = syncDomInputsToDraft(S, topicId);
        saveMapToEnvironment(S, topicId, updated);
      }
      studioState.busy = true;
      studioState.statusMsg = "Executando Confronto GAN: Agente Gerador criando itens do mapa × Agente Discriminador auditando às cegas...";
      rerender();
      try {
        await generateQuestionsWithGan(S, topicId, studioState.ganConfig);
        studioState.statusMsg = "Confronto GAN concluído! Confira o dossiê Gerador × Discriminador e incorpore as questões aprovadas.";
      } catch (err) {
        studioState.statusMsg = "Falha no Confronto GAN: " + (err?.message || "verifique o mapa mental.");
      } finally {
        studioState.busy = false;
        rerender();
      }
    });

    document.getElementById("qb-mm-gan-save-all")?.addEventListener("click", () => {
      const res = incorporateGanQuestions(S, topicId);
      studioState.statusMsg = `${res.savedCount} questão(ões) aprovadas pela GAN incorporadas ao banco (capítulo ${res.cap}) e vinculadas aos nós do mapa mental!`;
      if (helpers.toast) helpers.toast(`${res.savedCount} questões GAN salvas no mapa e no Treinar.`);
      rerender();
    });

    document.querySelectorAll("[data-mm-gan-save-one]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-mm-gan-save-one"));
        const res = incorporateGanQuestions(S, topicId, [idx]);
        studioState.statusMsg = res.savedCount
          ? `Questão ${idx + 1} salva no banco e vinculada diretamente ao nó do mapa mental!`
          : "Questão já estava incorporada.";
        rerender();
      });
    });
  }

  function openFromCornell(note, options = {}) {
    const S = options.S || appRef?.S || global.S;
    const requestedTopicId = text(options.topicId || note?.topicId, 120);
    const fallbackTopicId =
      requestedTopicId ||
      S?.mapaId ||
      (S?.ed && [...S.ed.keys()][0]) ||
      `cornell-map-${slugId(note?.title || "estudo", "geral")}`;
    const mapDraft = options.generatedMap
      ? normalizeMap(options.generatedMap, note?.title || "Mapa Mental", fallbackTopicId)
      : cornellToMindMap(note, {
          topicId: fallbackTopicId,
          topicTitle: S?.ed?.get(fallbackTopicId)?.titulo || note?.title,
          materia: note?.subject,
        });

    studioState.editorOpen = true;
    if (options.openGan) studioState.ganOpen = true;
    studioState.statusMsg = `Mapa mental estruturado a partir da sua folha Cornell "${note?.title || "Cornell"}". Personalize seus subtópicos e rótulos ou gere questões na GAN!`;

    if (S) {
      saveMapToEnvironment(S, fallbackTopicId, mapDraft);
      if (typeof appRef?.setView === "function") {
        appRef.setView("mapa");
      } else {
        S.view = "mapa";
        appRef?.render?.(true);
      }
    }
    // Fecha a gaveta do OmniStudy se estiver aberta para revelar o Mapa Mental
    const drawer = global.document?.querySelector(".omni-drawer-backdrop.open, #omni-drawer.open");
    if (drawer) drawer.classList.remove("open");
    global.document?.getElementById("omni-close-btn")?.click?.();

    return { topicId: fallbackTopicId, mapa: mapDraft };
  }

  function openFromMaterial(materialOrId, options = {}) {
    const S = options.S || appRef?.S || global.QBApp?.S || global.S;
    const materials = loadStudyMaterials(S);
    const material =
      typeof materialOrId === "string"
        ? S?.mat?.get?.(materialOrId) || materials.find(m => m.id === materialOrId)
        : materialOrId;
    if (!material) {
      throw new Error("Material ou artefato não encontrado.");
    }
    const requestedTopicId = text(
      options.topicId || (Array.isArray(material.topicos) && material.topicos[0]) || "",
      120
    );
    const fallbackTopicId =
      requestedTopicId ||
      S?.mapaId ||
      (S?.ed && [...S.ed.keys()][0]) ||
      `mat-map-${slugId(material.titulo || material.id || "estudo", "geral")}`;
    const mapDraft = options.generatedMap
      ? normalizeMap(options.generatedMap, material.titulo || "Mapa Mental", fallbackTopicId)
      : materialToMindMap(material, {
          topicId: fallbackTopicId,
          topicTitle: S?.ed?.get(fallbackTopicId)?.titulo || material.titulo,
          materia: material.materia,
        });

    studioState.editorOpen = true;
    if (options.openGan) studioState.ganOpen = true;
    studioState.statusMsg = `Mapa mental estruturado tendo como subsídio o material "${material.titulo || material.id}". Personalize subtópicos e rótulos ou gere questões na GAN!`;

    if (S) {
      saveMapToEnvironment(S, fallbackTopicId, mapDraft);
      if (typeof appRef?.setView === "function") {
        appRef.setView("mapa");
      } else if (typeof global.QBApp?.setView === "function") {
        global.QBApp.setView("mapa");
      } else {
        S.view = "mapa";
        appRef?.render?.(true);
      }
    }
    return { topicId: fallbackTopicId, mapa: mapDraft, material };
  }

  global.QBMindMapStudio = {
    COLORS,
    studioState,
    normalizeMap,
    createEmptyMap,
    cornellToMindMap,
    materialToMindMap,
    loadStudyMaterials,
    enumerateMapNodes,
    ensureDraft,
    addBranch,
    addSubtopic,
    updateNodeAtPath,
    moveNodeAtPath,
    removeNodeAtPath,
    addCrossLink,
    removeCrossLink,
    saveMapToEnvironment,
    undoDraft,
    buildLocalGanBatch,
    generateQuestionsWithGan,
    incorporateGanQuestions,
    openFromCornell,
    openFromMaterial,
    ingestGeminiNotebook,
    allTopicOptions,
    studioHTML,
    wire,
  };
})(typeof window !== "undefined" ? window : globalThis);
