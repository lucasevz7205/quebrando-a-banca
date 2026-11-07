import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import Layout from "@/components/qb/Layout";
export const Route=createFileRoute("/_authed")({ssr:false,beforeLoad:requireSignedIn,errorComponent:AuthGateError,component:()=> <Layout><Outlet /></Layout>});
