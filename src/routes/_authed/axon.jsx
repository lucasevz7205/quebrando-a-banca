import { createFileRoute } from "@tanstack/react-router";
import MotionLab from "@/components/qb/motion/MotionLab";

export const Route = createFileRoute("/_authed/axon")({
  head: () => ({ meta: [
    { title: "Quebrando a Banca · Modo AXON" },
    { name: "description", content: "Um acesso visual ao Laboratório de Questões do Quebrando a Banca." },
  ] }),
  component: MotionLab,
});
