/* Quebrando a Banca · Construtor de Mapas Mentais (Base Cornell) + Confronto GAN de Questões
 * Converte folhas Cornell em árvores de mapas mentais editáveis, normaliza ramos/subtópicos/rótulos
 * e executa o portão determinístico pós-confronto entre Agente Gerador e Agente Discriminador Cego (GAN).
 */
import { enumerateNodes, WRONG, RIGHT } from "./editorial-engine.js";

const asText = (v, max = 12000) => String(v == null ? "" : v).trim().slice(0, max);

export function deduceConceptLabel(title = "", body = "", fallback = "Conceito") {
  const combined = `${title} ${body}`.toLowerCase();
  if (/exce[çc]|salvo|ressalv|exceto|sem preju[íi]zo|ressalva/i.test(combined)) return "Exceção Taxativa";
  if (/veda[çc]|proibi|imposs[íi]vel|n[ãa]o cabe|inadmiss[íi]vel|defeso|vedado/i.test(combined)) return "Vedação Expressa";
  if (/qu[óo]rum|maioria\s+absoluta|maioria\s+simples|dois\s+turnos|3\/5|vota[çc]/i.test(combined)) {
    if (/absoluta/i.test(combined)) return "Maioria Absoluta";
    if (/3\/5/i.test(combined)) return "Quórum 3/5";
    return "Quórum e Rito";
  }
  if (/prazo|dias|sess[õo]es|temp|prorroga|improrro/i.test(combined)) {
    const m = combined.match(/\b(\d+)\s*(dias|sess[õo]es|horas|meses)\b/i);
    return m ? `Prazo: ${m[1]} ${m[2]}` : "Prazo Legal";
  }
  if (/compet[êe]ncia|atribui|privativ|exclusiv|iniciativa|quem/i.test(combined)) {
    if (/privativ/i.test(combined)) return "Competência Privativa";
    if (/exclusiv/i.test(combined)) return "Competência Exclusiva";
    return "Competência";
  }
  if (/requisito|condi[çc]|element|pressupost|validade/i.test(combined)) return "Requisito Vinculado";
  if (/anula[çc]|revoga[çc]|extin[çc]|invalida|cass/i.test(combined)) {
    if (/anula/i.test(combined)) return "Anulação (Ilegalidade)";
    if (/revoga/i.test(combined)) return "Revogação (Mérito)";
    return "Extinção / Invalidação";
  }
  if (/recurso|plen[áa]rio|controle|judicial|mandado/i.test(combined)) return "Recurso e Controle";
  if (/efeito|consequ[êe]n|ex tunc|ex nunc|efic[áa]cia|retroat/i.test(combined)) {
    if (/ex tunc|retroat/i.test(combined)) return "Efeito Ex Tunc";
    if (/ex nunc/i.test(combined)) return "Efeito Ex Nunc";
    return "Eficácia e Efeitos";
  }
  if (/princ[íi]pio|matriz|fundament|norma/i.test(combined)) return "Princípio Matriz";
  if (/regra|geral|ordin[áa]r/i.test(combined)) return "Regra Geral";
  if (/s[íi]ntese|resumo|conclus|executiv/i.test(combined)) return "Síntese";
  if (/exemplo|caso|hip[óo]tese|pr[áa]tic/i.test(combined)) return "Caso Prático";
  if (/pegadinha|armadilha|alerta|cuidado|aten[çc]|banca/i.test(combined)) return "Alerta de Prova";
  return fallback;
}

export function slugifyNodeId(value, fallback = "no") {
  const clean = asText(value, 120)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return clean || fallback;
}

export function normalizeMindMapTree(rawMap, fallbackTitle = "Mapa Mental", prefix = "mm") {
  const src = rawMap && typeof rawMap === "object" ? rawMap : {};
  const centro = asText(src.centro || fallbackTitle, 240) || "Mapa Mental";
  const autor = asText(src.autor || "Criado e personalizado no Ambiente de Estudo", 240);
  const safePrefix = slugifyNodeId(prefix, "mm").slice(0, 24);
  const seenIds = new Set();

  function uniqueId(preferred, pathFallback) {
    let base = slugifyNodeId(preferred || pathFallback, pathFallback);
    if (!base.startsWith(safePrefix + "-") && !preferred) {
      base = `${safePrefix}-${base}`;
    }
    let candidate = base;
    let counter = 2;
    while (seenIds.has(candidate)) {
      candidate = `${base}-${counter++}`;
    }
    seenIds.add(candidate);
    return candidate;
  }

  function cleanNode(node, pathStr, depth = 0, branchColor = 1) {
    if (!node || typeof node !== "object" || depth > 5) return null;
    const t = asText(node.t || node.title || node.rotulo || "", 220);
    if (!t) return null;
    const id = uniqueId(node.id, `r${pathStr.replace(/\./g, "-")}`);
    const n = asText(node.n || node.nota || "", 600);
    const corNum = Number(node.cor);
    const cor = Number.isInteger(corNum) && corNum >= 1 && corNum <= 8 ? corNum : branchColor;
    const caixa = Boolean(node.caixa);
    const rawX = node.x && typeof node.x === "object" ? node.x : {};
    const rotulo = asText(
      node.rotulo || node.tag || node.badge || deduceConceptLabel(t, n || rawX.e || "", ""),
      120
    );
    const e = asText(rawX.e || node.explicacao || "", 2400);
    const ex = asText(rawX.ex || node.exemplo || "", 1200);
    const trap = asText(rawX.trap || node.pegadinha || "", 1200);
    const srcRef = asText(rawX.src || node.fonte || "", 600);
    const questaoIds = Array.isArray(rawX.questaoIds)
      ? [...new Set(rawX.questaoIds.map(q => asText(q, 120)).filter(Boolean))]
      : [];

    const hasX = Boolean(e || ex || trap || srcRef || questaoIds.length);
    const childrenRaw = Array.isArray(node.f) ? node.f : Array.isArray(node.subtopicos) ? node.subtopicos : [];
    const f = depth < 5
      ? childrenRaw
          .slice(0, 32)
          .map((child, idx) => cleanNode(child, `${pathStr}.${idx + 1}`, depth + 1, cor))
          .filter(Boolean)
      : [];

    const out = { id, t, cor };
    if (rotulo) out.rotulo = rotulo;
    if (caixa) out.caixa = true;
    if (n) out.n = n;
    if (hasX) {
      out.x = {
        e: e || `Conceito estruturante de ${t}.`,
        ...(ex ? { ex } : {}),
        ...(trap ? { trap } : {}),
        ...(srcRef ? { src: srcRef } : {}),
        ...(questaoIds.length ? { questaoIds } : {}),
      };
    }
    if (f.length) out.f = f;
    return out;
  }

  const rawRamos = Array.isArray(src.ramos) ? src.ramos : [];
  const ramos = rawRamos
    .slice(0, 32)
    .map((ramo, idx) => cleanNode(ramo, String(idx + 1), 0, (idx % 8) + 1))
    .filter(Boolean);

  const rawLigacoes = Array.isArray(src.ligacoes) ? src.ligacoes : [];
  const ligacoes = [];
  for (const lig of rawLigacoes.slice(0, 24)) {
    const from = Array.isArray(lig) ? asText(lig[0], 120) : asText(lig?.de || lig?.from, 120);
    const to = Array.isArray(lig) ? asText(lig[1], 120) : asText(lig?.para || lig?.to, 120);
    const rel = Array.isArray(lig) ? asText(lig[2], 180) : asText(lig?.relacao || lig?.label, 180);
    if (from && to && from !== to && seenIds.has(from) && seenIds.has(to)) {
      ligacoes.push([from, to, rel || "Relação conceitual"]);
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

export function cornellToMindMapStructure(note, options = {}) {
  if (!note || typeof note !== "object") {
    throw new Error("Folha Cornell inválida para conversão em mapa mental.");
  }
  const title = asText(note.title || note.subject || options.topicTitle || "Mapa Mental Cornell", 240);
  const subject = asText(note.subject || options.materia || "", 200);
  const prefix = slugifyNodeId(options.topicId || title || "cornell", "cornell").slice(0, 20);
  const cues = Array.isArray(note.cues)
    ? note.cues.map(c => asText(c, 220)).filter(Boolean)
    : String(note.cues || "")
        .split(/\r?\n/)
        .map(c => asText(c, 220))
        .filter(Boolean);
  const rawNotes = asText(note.notes, 12000);
  const summary = asText(note.summary, 2500);
  const referenceText = asText(note.referenceText, 600);

  // Divide as anotações em blocos ou linhas para parear com as pistas Cornell
  const paragraphs = rawNotes
    .split(/\n\s*\n+/)
    .map(b => b.trim())
    .filter(Boolean);
  const lines = rawNotes
    .split(/\r?\n/)
    .map(l => l.replace(/^[\s•*\-–—\d.)]+/, "").trim())
    .filter(Boolean);

  const sourceBlocks = paragraphs.length >= cues.length && cues.length > 0 ? paragraphs : lines;
  const ramos = [];

  const branchTitles = cues.length
    ? cues
    : lines.slice(0, Math.min(6, Math.max(3, lines.length))).map((l, idx) => l.slice(0, 72) || `Ramo ${idx + 1}`);

  branchTitles.forEach((cue, idx) => {
    const block = sourceBlocks[idx] || lines[idx] || summary || cue;
    const subLines = block
      .split(/\r?\n|;\s+/)
      .map(s => s.replace(/^[\s•*\-–—\d.)]+/, "").trim())
      .filter(Boolean);

    const mainExplanation = subLines[0] || block || cue;
    const branchLabel = deduceConceptLabel(cue, mainExplanation, `Conceito ${idx + 1}`);
    const children = subLines.slice(1, 8).map((sub, subIdx) => {
      const colonParts = sub.split(/:\s+/);
      const subTitle = colonParts.length > 1 ? colonParts[0].slice(0, 90) : sub.slice(0, 80);
      const subDesc = colonParts.length > 1 ? colonParts.slice(1).join(": ") : sub;
      const subLabel = colonParts.length > 1 && colonParts[0].length <= 25
        ? colonParts[0].replace(/^[•*\-–—\d.)\s]+/, "").trim()
        : deduceConceptLabel(subTitle, subDesc, "Subtópico");
      return {
        id: `${prefix}-r${idx + 1}-${subIdx + 1}`,
        t: subTitle,
        rotulo: subLabel,
        n: subDesc.slice(0, 220),
        cor: (idx % 8) + 1,
        x: {
          e: subDesc,
          ...(referenceText ? { src: referenceText.slice(0, 240) } : { src: `Caderno Cornell · ${title}` }),
        },
      };
    });

    ramos.push({
      id: `${prefix}-r${idx + 1}`,
      t: cue.replace(/\?+$/, "").trim() || `Conceito ${idx + 1}`,
      rotulo: branchLabel,
      n: mainExplanation.slice(0, 260),
      cor: (idx % 8) + 1,
      x: {
        e: mainExplanation,
        ...(summary ? { ex: `Síntese aplicada: ${summary.slice(0, 300)}` } : {}),
        trap: `Atenção às distinções e condições de "${cue.slice(0, 80)}".`,
        src: referenceText ? referenceText.slice(0, 240) : `Caderno Cornell · ${title}`,
      },
      f: children,
    });
  });

  if (summary && ramos.length < 12) {
    const synthesisParts = summary
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    ramos.push({
      id: `${prefix}-sintese`,
      t: "Síntese e Pontos-Chave (Cornell)",
      rotulo: "Síntese",
      n: summary.slice(0, 280),
      cor: ((ramos.length) % 8) + 1,
      caixa: true,
      x: {
        e: summary,
        trap: `Atenção: sínteses de rodapé não substituem a verificação dos requisitos e exceções específicas de cada instituto.`,
        src: referenceText ? referenceText.slice(0, 240) : `Síntese Cornell · ${title}`,
      },
      f: synthesisParts.slice(0, 5).map((part, i) => ({
        id: `${prefix}-sintese-${i + 1}`,
        t: part.slice(0, 84),
        rotulo: deduceConceptLabel(part, part, "Conclusão"),
        n: part,
        cor: ((ramos.length) % 8) + 1,
        x: {
          e: part,
          src: `Síntese Cornell · ${title}`,
        },
      })),
    });
  }

  // Garante no mínimo 3 ramos para o layout 3D AXON e auditoria
  while (ramos.length < 3) {
    const nIdx = ramos.length + 1;
    ramos.push({
      id: `${prefix}-r${nIdx}`,
      t: nIdx === 1 ? "Conceito Fundamental" : nIdx === 2 ? "Regra e Aplicação" : "Exceções e Pegadinhas",
      n: summary || rawNotes.slice(0, 240) || ` Tópico ${nIdx} de ${title}`,
      cor: ((nIdx - 1) % 8) + 1,
      x: {
        e: rawNotes || summary || `Desenvolva os subtópicos de ${title}.`,
        src: referenceText ? referenceText.slice(0, 240) : `Caderno Cornell · ${title}`,
      },
      f: [],
    });
  }

  const ligacoes = [];
  if (ramos.length >= 2) {
    ligacoes.push([ramos[0].id, ramos[ramos.length - 1].id, "Eixo estrutural → Síntese"]);
  }

  return normalizeMindMapTree(
    {
      centro: subject ? `${title} (${subject})` : title,
      autor: `Baseado na folha Cornell "${title}" · Personalizável pelo estudante`,
      ramos,
      ligacoes,
      origemCornell: {
        noteId: asText(note.id, 120),
        title,
        subject,
        updatedAt: new Date().toISOString(),
      },
    },
    title,
    prefix
  );
}

export function normalizeGanConfrontation(generatorItems, discriminatorItems, map, options = {}) {
  const format = options.formato === "multipla_escolha" ? "multipla_escolha" : "ce";
  const { nodes, ids } = enumerateNodes(map || {});
  const fallbackNodeId = nodes[0]?.id || "r1";
  const nodeTitleById = new Map(nodes.map(n => [n.id, asText(n.node?.t, 160) || n.id]));

  const genList = Array.isArray(generatorItems) ? generatorItems : [];
  if (!genList.length) {
    throw new Error("O Agente Gerador não produziu questões válidas a partir do mapa mental.");
  }

  const discList = Array.isArray(discriminatorItems) ? discriminatorItems : [];
  const discByIndex = new Map();
  discList.forEach((d, idx) => {
    const key = Number.isInteger(Number(d?.index)) ? Number(d.index) : idx;
    discByIndex.set(key, d);
  });

  const seenStatements = new Set();
  const questions = [];

  genList.slice(0, 10).forEach((rawQ, idx) => {
    const disc = discByIndex.get(idx) || discList[idx] || {};
    const requestedNodeId = asText(rawQ?.mapaNoId, 120);
    const mapaNoId = ids.has(requestedNodeId) ? requestedNodeId : fallbackNodeId;
    const nodeTitle = nodeTitleById.get(mapaNoId) || "Conceito do Mapa";

    const genStatement = asText(rawQ?.enunciado, 1600);
    const genKey = asText(rawQ?.gabarito, 10).toUpperCase();
    const genCommentary = asText(rawQ?.comentario || rawQ?.justificativa, 2400);
    const genMechanism = asText(rawQ?.mecanismo, 12).toUpperCase();
    const genThesis = asText(rawQ?.teseGerador || rawQ?.comentario, 800);

    const discKey = asText(disc?.gabaritoDiscriminador || disc?.gabaritoCalculado, 16).toUpperCase();
    const discVerdict = asText(disc?.veredicto || "APROVADA", 30).toUpperCase();
    const discCritique = asText(
      disc?.criticaAdversaria || disc?.parecer || "Item auditado em revisão cega pelo Discriminador GAN.",
      1200
    );
    const rawScore = Number(disc?.scoreRealismo ?? disc?.score ?? 85);
    const ganScore = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 85;

    const validKeys = format === "multipla_escolha" ? ["A", "B", "C", "D", "E"] : ["C", "E"];
    const blindKeyMatch = validKeys.includes(genKey) && genKey === discKey;

    let finalStatement = genStatement;
    let finalKey = validKeys.includes(genKey) ? genKey : format === "multipla_escolha" ? "A" : "C";
    let finalCommentary = genCommentary;
    let finalAlternatives = Array.isArray(rawQ?.alternativas) ? rawQ.alternativas : [];
    let statusConfronto = "aprovada_gan";

    const refined = disc?.itemRefinado && typeof disc.itemRefinado === "object" ? disc.itemRefinado : null;
    const hasValidRefined =
      refined &&
      asText(refined.enunciado, 1600).length >= 25 &&
      validKeys.includes(asText(refined.gabarito, 10).toUpperCase());

    if (!blindKeyMatch || discVerdict === "REFINAR" || discVerdict === "REJEITADA" || ganScore < 65) {
      if (hasValidRefined) {
        finalStatement = asText(refined.enunciado, 1600);
        finalKey = asText(refined.gabarito, 10).toUpperCase();
        finalCommentary = asText(refined.comentario || genCommentary, 2400);
        if (format === "multipla_escolha" && Array.isArray(refined.alternativas) && refined.alternativas.length === 5) {
          finalAlternatives = refined.alternativas;
        }
        statusConfronto = "refinada_gan";
      } else if (!blindKeyMatch || discVerdict === "REJEITADA") {
        statusConfronto = "divergencia_bloqueada";
      }
    }

    if (finalStatement.length < 20 || seenStatements.has(finalStatement.toLowerCase())) {
      return;
    }
    seenStatements.add(finalStatement.toLowerCase());

    let mecanismo = genMechanism;
    if (format === "ce") {
      if (finalKey === "E" && !WRONG.includes(mecanismo)) mecanismo = "F3";
      if (finalKey === "C" && !RIGHT.includes(mecanismo)) mecanismo = "V1";
    } else {
      mecanismo = "";
    }

    const record = {
      enunciado: finalStatement,
      gabarito: finalKey,
      comentario:
        finalCommentary ||
        `Gabarito ${finalKey}. Vinculado ao nó "${nodeTitle}" do mapa mental (Confronto GAN: ${discCritique}).`,
      tema: asText(rawQ?.tema || nodeTitle, 200),
      mapaNoId,
      mapaNoTitulo: nodeTitle,
      ...(mecanismo ? { mecanismo } : {}),
      trechoDecisivo: asText(rawQ?.trechoDecisivo, 240),
      correcaoMinima: asText(rawQ?.correcaoMinima, 400),
      ganConfrontation: {
        version: "qb-gan-1.0",
        statusConfronto,
        ganScore: statusConfronto === "refinada_gan" ? Math.max(ganScore, 78) : ganScore,
        blindKeyMatch,
        generatorKey: genKey,
        discriminatorKey: discKey || genKey,
        generatorThesis: genThesis || `Item formulado sobre "${nodeTitle}" (${mecanismo || format}).`,
        discriminatorCritique: discCritique,
        flawsDetected: Array.isArray(disc?.falhasDetectadas)
          ? disc.falhasDetectadas.map(f => asText(f, 120)).filter(Boolean)
          : [],
        wasRefined: statusConfronto === "refinada_gan",
      },
    };

    if (format === "multipla_escolha") {
      const normalizedOpts = (Array.isArray(finalAlternatives) ? finalAlternatives : []).slice(0, 5).map((o, k) => ({
        letra: String.fromCharCode(65 + k),
        texto: asText(o?.texto || o, 600),
      }));
      if (normalizedOpts.length !== 5 || normalizedOpts.some(o => o.texto.length < 2)) {
        return;
      }
      record.alternativas = normalizedOpts;
      record.formato = "multipla_escolha";
    }

    questions.push(record);
  });

  if (!questions.length) {
    throw new Error("Nenhuma questão superou a validação estrutural da GAN.");
  }

  const summary = {
    total: questions.length,
    aprovadasDireto: questions.filter(q => q.ganConfrontation.statusConfronto === "aprovada_gan").length,
    refinadasPelaGan: questions.filter(q => q.ganConfrontation.statusConfronto === "refinada_gan").length,
    bloqueadasPorDivergencia: questions.filter(q => q.ganConfrontation.statusConfronto === "divergencia_bloqueada").length,
    mediaScoreGan: Math.round(
      questions.reduce((acc, q) => acc + (q.ganConfrontation.ganScore || 0), 0) / questions.length
    ),
  };

  return { questions, summary };
}
