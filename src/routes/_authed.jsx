import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import Layout from "@/components/qb/Layout";

// O ambiente original do Claude é o produto principal.
// O layout do laboratório aplica-se apenas às ferramentas auxiliares.
function ProtectedLayout() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/estudar" || path === "/axon") return <Outlet />;
  return <Layout><Outlet /></Layout>;
}

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: async (args) => {
    const auth = await requireSignedIn(args);
    const path = args.location.pathname.replace(/\/+$/, "") || "/";
    if (auth.user.role !== "admin" && path !== "/" && path !== "/estudar") {
      throw redirect({ to: "/estudar", replace: true });
    }
    return auth;
  },
  errorComponent: AuthGateError,
  component: ProtectedLayout,
});
