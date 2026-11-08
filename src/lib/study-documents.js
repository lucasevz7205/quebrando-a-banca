const COLLECTIONS = new Set([
  "questoes", "respostas", "rodadas", "simulados", "cartoes_aval", "revisao",
  "edital", "materiais", "pontos", "textos", "pegadinhas", "analise", "config", "diario", "planejamento",
]);
const PAGE_SIZE = 500;
const CHUNK = 7000;

async function allRecords(entity, filter, order = "created_date") {
  const records = [];
  for (let skip = 0; skip < 50000; skip += PAGE_SIZE) {
    const page = await entity.filter(filter, order, PAGE_SIZE, skip);
    records.push(...page);
    if (page.length < PAGE_SIZE) return records;
  }
  throw new Error("Limite de paginação excedido.");
}

async function hydrated({ parts, scope }, collection, rows) {
  if (!rows.some(row => { try { return !!JSON.parse(row.payload_json)?._claudeParts; } catch { return false; } })) {
    return rows.map(row => ({ ...JSON.parse(row.payload_json), id: row.legacy_id }));
  }
  const fragments = await allRecords(parts, { ...scope, collection }, "part");
  const byID = new Map();
  for (const part of fragments) {
    if (!byID.has(part.legacy_id)) byID.set(part.legacy_id, []);
    byID.get(part.legacy_id).push(part);
  }
  return rows.map(row => {
    const value = JSON.parse(row.payload_json);
    if (!value._claudeParts) return { ...value, id: row.legacy_id };
    const pieces = (byID.get(row.legacy_id) || []).sort((a, b) => a.part - b.part).slice(0, value._claudeParts);
    if (pieces.length !== value._claudeParts || pieces.some((piece, i) => piece.part !== i)) {
      throw new Error(`Documento incompleto: ${collection}/${row.legacy_id}`);
    }
    return { ...JSON.parse(pieces.map(p => p.payload_chunk).join("")), id: row.legacy_id };
  });
}

export async function listDocuments(storage, { collection, order, direction, limit }) {
  const { documents, scope } = storage;
  if (!COLLECTIONS.has(collection)) throw new Error("Coleção não permitida.");
  const rows = await allRecords(documents, { ...scope, collection });
  let result = await hydrated(storage, collection, rows);
  if (order) {
    result = result.sort((a, b) => {
      const va = a[order] ?? "", vb = b[order] ?? "";
      return (String(va).localeCompare(String(vb), "pt-BR", { numeric: true })) * (direction === "desc" ? -1 : 1);
    });
  }
  if (limit && Number.isInteger(limit) && limit > 0) result = result.slice(0, Math.min(limit, 10000));
  return result;
}

export async function writeDocument(storage, { path, operation, value }) {
  const { documents, parts, scope } = storage;
  if (typeof path !== "string" || path.length > 300 || !["set", "update"].includes(operation)) {
    throw new Error("Operação inválida.");
  }
  const divider = path.indexOf("/");
  if (divider <= 0 || divider === path.length - 1) throw new Error("Caminho inválido.");
  const collection = path.slice(0, divider), legacy_id = path.slice(divider + 1);
  if (!COLLECTIONS.has(collection)) throw new Error("Coleção não permitida.");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Documento inválido.");

  const old = await documents.filter({ ...scope, collection, legacy_id }, "created_date", 2, 0);
  if (old.length > 1) throw new Error("Identificador duplicado no Base44; gravação bloqueada.");
  if (operation === "update" && old.length === 0) throw new Error("Documento não encontrado.");
  let next = { ...value, id: legacy_id };
  if (operation === "update") {
    const [existing] = await hydrated(storage, collection, old);
    next = { ...existing, ...value, id: legacy_id };
  }
  const encoded = JSON.stringify(next);
  if (encoded.length > 500000) throw new Error("O documento excede o limite seguro da ponte.");
  const partsNeeded = Math.ceil(encoded.length / CHUNK);
  let payload_json = encoded;
  if (partsNeeded > 1) {
    payload_json = JSON.stringify({ _claudeParts: partsNeeded });
    const oldParts = await allRecords(parts, { ...scope, collection, legacy_id }, "part");
    const byIndex = new Map(oldParts.map(p => [p.part, p]));
    for (let i = 0; i < partsNeeded; i++) {
      const payload_chunk = encoded.slice(i * CHUNK, (i + 1) * CHUNK);
      if (byIndex.has(i)) {
        await parts.update(byIndex.get(i).id, { payload_chunk });
      } else {
        await parts.create({ ...scope, collection, legacy_id, part: i, payload_chunk });
      }
    }
  }
  if (old.length) {
    await documents.update(old[0].id, { payload_json });
  } else {
    await documents.create({ ...scope, collection, legacy_id, payload_json, source: scope.study_account_id ? "study-account" : "claude-port-2026-11-07" });
  }
  return { ok: true, id: legacy_id };
}
