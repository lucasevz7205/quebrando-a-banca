import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const FLAG = "__qb44_bridge_v1__";
const COLLECTIONS = new Set([
  "questoes", "respostas", "rodadas", "simulados", "cartoes_aval", "revisao",
  "edital", "materiais", "pontos", "textos", "pegadinhas", "analise", "config", "diario",
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

async function hydrated(collection, rows) {
  if (!rows.some(row => { try { return !!JSON.parse(row.payload_json)?._claudeParts; } catch { return false; } })) {
    return rows.map(row => ({ ...JSON.parse(row.payload_json), id: row.legacy_id }));
  }
  const fragments = await allRecords(base44.entities.ClaudeDocumentPart, { collection }, "part");
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

async function listDocuments({ collection, order, direction, limit }) {
  if (!COLLECTIONS.has(collection)) throw new Error("Coleção não permitida.");
  const rows = await allRecords(base44.entities.ClaudeDocument, { collection });
  let result = await hydrated(collection, rows);
  if (order) {
    result = result.sort((a, b) => {
      const va = a[order] ?? "", vb = b[order] ?? "";
      return (String(va).localeCompare(String(vb), "pt-BR", { numeric: true })) * (direction === "desc" ? -1 : 1);
    });
  }
  if (limit && Number.isInteger(limit) && limit > 0) result = result.slice(0, Math.min(limit, 10000));
  return result;
}

async function writeDocument({ path, operation, value }) {
  if (typeof path !== "string" || path.length > 300 || !["set", "update"].includes(operation)) {
    throw new Error("Operação inválida.");
  }
  const divider = path.indexOf("/");
  if (divider <= 0 || divider === path.length - 1) throw new Error("Caminho inválido.");
  const collection = path.slice(0, divider), legacy_id = path.slice(divider + 1);
  if (!COLLECTIONS.has(collection)) throw new Error("Coleção não permitida.");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Documento inválido.");

  const old = await base44.entities.ClaudeDocument.filter({ collection, legacy_id }, "created_date", 2, 0);
  if (old.length > 1) throw new Error("Identificador duplicado no Base44; gravação bloqueada.");
  if (operation === "update" && old.length === 0) throw new Error("Documento não encontrado.");
  let next = { ...value, id: legacy_id };
  if (operation === "update") {
    const [existing] = await hydrated(collection, old);
    next = { ...existing, ...value, id: legacy_id };
  }
  const encoded = JSON.stringify(next);
  if (encoded.length > 500000) throw new Error("O documento excede o limite seguro da ponte.");
  const partsNeeded = Math.ceil(encoded.length / CHUNK);
  let payload_json = encoded;
  if (partsNeeded > 1) {
    payload_json = JSON.stringify({ _claudeParts: partsNeeded });
    const oldParts = await allRecords(base44.entities.ClaudeDocumentPart, { collection, legacy_id }, "part");
    const byIndex = new Map(oldParts.map(p => [p.part, p]));
    for (let i = 0; i < partsNeeded; i++) {
      const payload_chunk = encoded.slice(i * CHUNK, (i + 1) * CHUNK);
      if (byIndex.has(i)) {
        await base44.entities.ClaudeDocumentPart.update(byIndex.get(i).id, { payload_chunk });
      } else {
        await base44.entities.ClaudeDocumentPart.create({ collection, legacy_id, part: i, payload_chunk });
      }
    }
  }
  if (old.length) {
    await base44.entities.ClaudeDocument.update(old[0].id, { payload_json });
  } else {
    await base44.entities.ClaudeDocument.create({ collection, legacy_id, payload_json, source: "claude-port-2026-11-07" });
  }
  return { ok: true, id: legacy_id };
}

export const Route = createFileRoute("/_authed/estudar")({
  head: () => ({ meta: [{ title: "Estudar · Quebrando a Banca" }] }),
  component: Estudar,
});

function Estudar() {
  const { user } = useAuth();
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function receive(event) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const msg = event.data;
      if (!msg || msg.flag !== FLAG || !msg.id) return;
      const frame = frameRef.current?.contentWindow;
      if (!frame) return;
      try {
        if (user?.role !== "admin") throw new Error("Somente o administrador pode acessar estes registros.");
        const result = msg.action === "list" ? await listDocuments(msg.args || {})
          : msg.action === "write" ? await writeDocument(msg.args || {})
          : (() => { throw new Error("Ação não permitida."); })();
        frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: true, value: result }, event.origin);
      } catch (err) {
        frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: false, error: err?.message || "Erro de leitura." }, event.origin);
        setError(err?.message || "Erro de conexão com os dados.");
      }
    }
    window.addEventListener("message", receive);
    setReady(true);
    return () => window.removeEventListener("message", receive);
  }, [user?.role]);

  if (user?.role !== "admin") return <section className="qb-card"><h1>Acesso restrito</h1><p>Este histórico de estudos é privativo do administrador.</p></section>;
  return (
    <section aria-label="Ambiente de estudo importado do Claude" style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Ambiente de estudo</h1>
          <p style={{ margin: "4px 0", opacity: 0.75, fontSize: 13 }}>Artefato Claude preservado · dados privados no Base44 · IA automática desativada</p>
        </div>
        <a href="/questoes" style={{ fontWeight: 600 }}>Voltar ao laboratório de questões</a>
      </div>
      {error && <div role="alert" style={{ border: "1px solid #b97054", borderRadius: 8, padding: 12, marginBottom: 12 }}>
        Falha na comunicação com o banco: {error}. Os dados anteriores continuam preservados.
        <button type="button" onClick={() => { setError(""); if (frameRef.current) frameRef.current.src = "/claude-export/index.html"; }} style={{ marginLeft: 10 }}>Recarregar</button>
      </div>}
      {ready ? <iframe
        ref={frameRef}
        title="Quebrando a Banca: treino, revisão, edital e simulado"
        src="/claude-export/index.html"
        style={{ display: "block", width: "100%", minHeight: "85vh", height: "calc(100vh - 140px)", border: "1px solid #d3ddda", borderRadius: 12, background: "#f3f6f5" }}
      /> : <p>Preparando ambiente de estudo...</p>}
    </section>
  );
}
