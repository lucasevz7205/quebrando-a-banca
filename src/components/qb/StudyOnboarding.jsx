import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitStudyRequest } from "@/lib/study-account";

export default function StudyOnboarding({ pending, logout }) {
  const router = useRouter();
  const submitRequest = useServerFn(submitStudyRequest);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = pending ?? submitted;

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err?.message || "Não foi possível concluir a operação. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    if (busy) return;
    run(async () => {
      const result = await submitRequest({ data: { examName, ...(examDate ? { examDate } : {}) } });
      if (result.status === "cooldown") {
        setError("Aguarde um minuto entre solicitações e tente novamente.");
        return;
      }
      if (result.pending) setSubmitted(result.pending);
      await router.invalidate();
    });
  }

  function refresh() {
    run(async () => {
      await router.invalidate();
      setSubmitted(null);
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-10">
      <section className="space-y-5 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Quebrando a Banca</p>
        <h1 className="text-2xl font-semibold">{request ? "Solicitação em análise" : "Solicite seu acesso"}</h1>
        {request ? (
          <div className="space-y-4" role="status">
            <div>
              <p className="font-medium">{request.examName}</p>
              {request.examDate && <p>Prova em {request.examDate.split("-").reverse().join("/")}</p>}
            </div>
            <p>O administrador vai preparar seus materiais e liberar seu ambiente de estudo.</p>
            <Button type="button" onClick={refresh} disabled={busy}>Verificar liberação</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p>Informe o concurso para que o administrador prepare seu ambiente de estudo.</p>
            <div className="space-y-2">
              <Label htmlFor="study-exam">Concurso</Label>
              <Input id="study-exam" required minLength={3} maxLength={160} value={examName}
                onChange={event => setExamName(event.target.value)} disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="study-date">Data da prova (opcional)</Label>
              <Input id="study-date" type="date" value={examDate}
                onChange={event => setExamDate(event.target.value)} disabled={busy} />
            </div>
            <Button type="submit" disabled={busy || examName.trim().length < 3}>
              {busy ? "Enviando…" : "Solicitar acesso"}
            </Button>
          </form>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button variant="ghost" type="button" onClick={() => logout()}>Sair da conta</Button>
      </section>
    </main>
  );
}
