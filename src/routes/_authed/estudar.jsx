import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { observeMindMap } from "@/components/qb/mind-map/observe";
import { observeStudyMotion } from "@/components/qb/motion/study-motion";
import StudyOnboarding from "@/components/qb/StudyOnboarding";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { accessStudyAccount, getStudyAccount, getStudyPreview, listStudyPreview } from "@/lib/study-account";
import { listDocuments, writeDocument } from "@/lib/study-documents";
import { correctFlashcardWithAI } from "@/lib/flashcard-ai";

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
  validateSearch: search => ({
    conta: typeof search.conta === "string" && search.conta.length <= 100 ? search.conta : undefined,
  }),
  loaderDeps: ({ search }) => ({ conta: search.conta }),
  loader: ({ context, deps }) => {
    if (!deps.conta) return getStudyAccount();
    if (context.user?.role !== "admin") throw redirect({ to: "/estudar", search: {}, replace: true });
    return getStudyPreview({ data: { accountId: deps.conta } });
  },
  component: Estudar,
});

function Estudar() {
  const account = Route.useLoaderData();
  return <StudyScreen key={account?.id || "principal"} account={account} />;
}

function StudyScreen({ account }) {
  const { user, logout } = useAuth();
  const legacy = user?.role === "admin" && account?.legacy;
  const preview = user?.role === "admin" && account?.preview === true;
  const accountId = preview || (user?.id && user.id === account?.userId) ? account.id : null;
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [frameVersion, setFrameVersion] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function receive(event) {
      const frameOrigin = preview ? "null" : window.location.origin;
      if (event.origin !== frameOrigin || event.source !== frameRef.current?.contentWindow) return;
      const replyOrigin = preview ? "*" : frameOrigin;
      const msg = event.data;
      if (!msg || msg.flag !== FLAG || !msg.id) return;
      const frame = frameRef.current?.contentWindow;
      if (!frame) return;
      try {
        if (!user?.id || (!legacy && !accountId)) throw new Error("Ambiente de estudo indisponível.");
        let result;
        if (preview && msg.action === "write") {
          frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: false, error: "Visualização somente leitura." }, replyOrigin);
          return;
        }
        if (msg.action === "logout" && !preview) {
          logout();
          return;
        }
        if (msg.action === "account") result = legacy ? { legacy: true } : { name: account.name, date: account.date, preview };
        else if (msg.action === "assistantLLM" && legacy) result = await askAssistantLLM(msg.args || {});
        else if (msg.action === "correctFlashcard" && !preview) result = await correctFlashcardWithAI({data:msg.args||{}});
        else if (msg.action === "list" || msg.action === "write") {
          if (legacy) result = await (msg.action === "list" ? listDocuments : writeDocument)(legacyStorage, msg.args || {});
          else if (preview) result = await listStudyPreview({ data: { accountId, args: msg.args || {} } });
          else result = await accessStudyAccount({ data: { action: msg.action, accountId, args: msg.args || {} } });
        } else throw new Error("Ação indisponível para esta conta.");
        frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: true, value: result }, replyOrigin);
      } catch (err) {
        frame.postMessage({ flag: FLAG, responseTo: msg.id, ok: false, error: err?.message || "Erro de leitura." }, replyOrigin);
        if (msg.action !== "assistantLLM" && msg.action !== "correctFlashcard") setError(err?.message || "Erro de conexão com os dados.");
      }
    }
    window.addEventListener("message", receive);
    setReady(true);
    return () => window.removeEventListener("message", receive);
  }, [user?.id, legacy, preview, accountId, account?.name, account?.date, logout]);

  useEffect(() => {
    if (!ready || preview || !frameRef.current) return;
    const stopMotion = observeStudyMotion(frameRef.current);
    const stopMap = observeMindMap(frameRef.current);
    return () => { stopMap(); stopMotion(); };
  }, [ready, preview, accountId, frameVersion]);

  if (!legacy && !accountId) {
    return <StudyOnboarding key={user?.id} pending={account?.pending} logout={logout} />;
  }

  return (
    <main aria-label="Quebrando a Banca · Ambiente de estudo"
      style={{ width: "100%", minHeight: "100dvh", background: "#F3F6F5" }}>
      {preview && (
        <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-2 text-sm text-slate-900">
          <span><strong>{account.name}</strong> · Visualização administrativa · Somente leitura</span>
          <Link to="/contas" className="font-medium underline">Voltar a Contas</Link>
        </header>
      )}
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
            setFrameVersion(version => version + 1);
          }} style={{ marginLeft: 10, textDecoration: "underline" }}>Recarregar</button>
        </div>
      )}
      {ready ? (
        // The authenticated loader provides the shell for the current account.
        <iframe key={`${accountId || user?.id}:${frameVersion}`} ref={frameRef}
          title="Quebrando a Banca: Hoje, Edital, Treinar, Estudo, Simulado e Desempenho"
          srcDoc={account.markup}
          sandbox={preview ? "allow-scripts allow-popups allow-popups-to-escape-sandbox" : undefined}
          style={{
            display: "block", width: "100%", height: preview ? "calc(100dvh - 3.5rem)" : "100dvh",
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
