import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dexter: Turno da Noite — Protótipo do Remaster" },
      { name: "description", content: "Investigue o caso Ortega na delegacia de Miami: sete puzzles lógicos, nenhum marcador na tela." },
      { property: "og:title", content: "Dexter: Turno da Noite" },
      { property: "og:description", content: "Protótipo jogável de investigação noir com sete puzzles encadeados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Game,
});
