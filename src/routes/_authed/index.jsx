import { createFileRoute, redirect } from "@tanstack/react-router";

// A abertura do aplicativo entra diretamente no ambiente de estudo.
export const Route = createFileRoute("/_authed/")({
  beforeLoad: () => { throw redirect({ to: "/estudar", replace: true }); },
  head: () => ({ meta: [{ title: "Quebrando a Banca · Ambiente de estudo" }] }),
});
