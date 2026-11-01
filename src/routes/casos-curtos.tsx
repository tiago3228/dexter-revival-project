import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Map } from "lucide-react";
import { VivianQuickCasesArchive } from "@/game/VivianQuickCasesArchive";

export const Route = createFileRoute("/casos-curtos")({
  head: () => ({
    meta: [
      { title: "Arquivo de casos curtos | Dexter — The Game" },
      {
        name: "description",
        content:
          "Selecione e resolva casos curtos de Painscreek, consulte os registros necessários e acompanhe seu progresso e pontuação.",
      },
    ],
  }),
  component: QuickCasesPage,
});

function QuickCasesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowLeft size={15} /> Menu principal
        </Link>
        <Link
          to="/mapas"
          className="inline-flex min-h-11 items-center gap-2 border border-primary/50 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary transition hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Map size={15} /> Mapa da investigação
        </Link>
      </nav>
      <VivianQuickCasesArchive />
    </main>
  );
}
