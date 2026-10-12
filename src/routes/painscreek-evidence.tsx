import { createFileRoute } from "@tanstack/react-router";
import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";

export const Route = createFileRoute("/painscreek-evidence")({
  head: () => ({
    meta: [
      { title: "Catálogo de evidências — Painscreek | Dexter — The Game" },
      {
        name: "description",
        content:
          "Consulta documental das evidências de Painscreek, com busca, filtros de revisão e fontes.",
      },
    ],
  }),
  component: PainscreekEvidenceExplorer,
});
