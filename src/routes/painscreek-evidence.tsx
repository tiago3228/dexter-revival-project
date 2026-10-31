import { createFileRoute } from "@tanstack/react-router";
import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";

export const Route = createFileRoute("/painscreek-evidence")({
  head: () => ({
    meta: [
      { title: "Catálogo de evidências — Painscreek | Dexter — The Game" },
      { property: "og:title", content: "Catálogo de evidências — Painscreek | Dexter — The Game" },
      { property: "og:description", content: "Examine as fontes e ressalvas documentais da investigação de Painscreek." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content:
          "Consulta documental das evidências de Painscreek, com busca, filtros de revisão e fontes.",
      },
    ],
  }),
  component: PainscreekEvidenceExplorer,
});
