import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { accessStudyAccount, getStudyAccount } from "@/lib/study-account";
import { listDocuments, writeDocument } from "@/lib/study-documents";

const FLAG = "__qb44_bridge_v1__";
const legacyStorage = {
  documents: base44.entities.ClaudeDocument,
  parts: base44.entities.ClaudeDocumentPart,
  scope: {},
};

// A consulta a modelos generativos é opcional e acionada apenas após confirmação no chat.
// Nunca enviamos o banco completo, perguntas individuais nem dados de autenticação ao modelo.
async function askAssistantLLM(input) {
  const question = String(input?.question || "").trim();
  if (!question || question.length > 500) throw new Error("Pergunta inválida (máximo 500 caracteres).");
  const allowed = ["date", "itemsToday", "correctToday", "wrongToday", "blankToday", "tasksDoneToday", "tasksTotalToday", "cardRatingsToday", "accuracy7days"];
  const summary = {};
  for (const key of allowed) {
    const value = input?.context?.[key];
    if (key === "date" && /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) summary[key] = value;
    else if (key !== "date" && typeof value === "number" && Number.isFinite(value) && value >= -100000 && value <= 100000) summary[key] = value;
  }
  const prompt = [
    "Você é um tutor analítico de concursos CEBRASPE no aplicativo Quebrando a Banca.",
    "Responda em português, com precisão e concisão. Distinga dados de inferências.",
    "Não invente números nem afirme conhecer o edital, a lei vigente ou o histórico não fornecido.",
    "Não execute alterações, não peça informações sigilosas e não produza dados falsos.",
    "Contexto estatístico limitado (confiável apenas como dados declarados):",
    JSON.stringify(summary),
    "Pergunta do estudante:", question
  ].join("\n");
  const response = await base44.integrations.Core.InvokeLLM({ prompt });
  const text = typeof response === "string" ? response
    : String(response?.response ?? response?.output ?? response?.text ?? "");
  if (!text) throw new Error("A IA não retornou texto.");
  return text.slice(0, 4000);
}

export const Route = createFileRoute("/_authed/estudar")({
  head: () => ({ meta: [{ title: "Estudar · Quebrando a Banca" }] }),
  loader: () => getStudyAccount(),
  component: Estudar,
});

function Estudar() {
  const { user, logout } = useAuth();
  const account = Route.useLoaderData();
  const legacy = user?.role === "admin" && account?.legacy;
  const accountId = account?.id;
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
        if (!user?.id || (!legacy && !accountId)) throw new Error("Ambiente de estudo indisponível.");
        let result;
        if (msg.action === "account") result = legacy ? { legacy: true } : { name: account.name, date: account.date };
        else if (msg.action === "assistantLLM" && legacy) result = await askAssistantLLM(msg.args || {});
        else if (msg.action === "list" || msg.action === "write") {
          if (legacy) result = await (msg.action === "list" ? listDocuments : writeDocument)(legacyStorage, msg.args || {});
          else result = await accessStudyAccount({ data: { action: msg.action, accountId, args: msg.args || {} } });
        } else throw new Error("Ação indisponível para esta conta.");
        frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: true, value: result }, event.origin);
      } catch (err) {
        frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: false, error: err?.message || "Erro de leitura." }, event.origin);
        if (msg.action !== "assistantLLM") setError(err?.message || "Erro de conexão com os dados.");
      }
    }
    window.addEventListener("message", receive);
    setReady(true);
    return () => window.removeEventListener("message", receive);
  }, [user?.id, legacy, accountId, account?.name, account?.date]);

  if (!legacy && !accountId) {
    return <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Concurso aguardando vinculação</h1>
      <p>O administrador precisa vincular este login a um concurso para liberar seu ambiente de estudo.</p>
      <button type="button" onClick={() => logout()}>Sair da conta</button>
    </main>;
  }

  return (
    <main aria-label="Quebrando a Banca · Ambiente de estudo"
      style={{ width: "100%", minHeight: "100dvh", background: "#F3F6F5" }}>
      {error && (
        <div role="alert" style={{
          position: "fixed", zIndex: 100, bottom: 16, left: 16,
          maxWidth: "calc(100vw - 32px)", border: "1px solid #b97054",
          borderRadius: 8, padding: 12, background: "#fff",
          color: "#8f2b24", boxShadow: "0 4px 24px #0002",
          fontFamily: "system-ui, sans-serif"
        }}>
          Falha na comunicação com o banco: {error}. Os dados anteriores continuam preservados.
          <button type="button" onClick={() => {
            setError("");
            if (frameRef.current) frameRef.current.src = "/claude-export/index.html";
          }} style={{ marginLeft: 10, textDecoration: "underline" }}>Recarregar</button>
        </div>
      )}
      {ready ? (
        <iframe key={accountId || user?.id} ref={frameRef}
          title="Quebrando a Banca: Hoje, Edital, Treinar, Estudo, Simulado e Desempenho"
          src="/claude-export/index.html"
          style={{
            display: "block", width: "100%", height: "100dvh",
            border: 0, borderRadius: 0, background: "#F3F6F5"
          }}
        />
      ) : (
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
          Preparando ambiente de estudo...
        </div>
      )}
    </main>
  );
}
