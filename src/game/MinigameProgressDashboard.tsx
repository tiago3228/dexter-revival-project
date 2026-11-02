import { useEffect, useState } from "react";
import {
  MINIGAME_CATALOG,
  MINIGAME_PROGRESS_EVENT,
  readMinigameProgress,
  type MinigameProgressState,
} from "./minigameProgress";

export function MinigameProgressDashboard() {
  const [progress, setProgress] = useState<MinigameProgressState>(() => readMinigameProgress());

  useEffect(() => {
    const refresh = () => setProgress(readMinigameProgress());
    window.addEventListener(MINIGAME_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("vivian-investigation-progress", refresh);
    refresh();
    return () => {
      window.removeEventListener(MINIGAME_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vivian-investigation-progress", refresh);
    };
  }, []);

  const counts = MINIGAME_CATALOG.map((game) => {
    const { id, unitIds } = game;
    const continuous = "continuous" in game && game.continuous;
    const complete = progress.completed[id].length;
    const done = continuous ? complete > 0 : complete === unitIds.length;
    const started = progress.started.includes(id) || complete > 0;
    return { id, complete, total: unitIds.length, done, started, continuous };
  });
  const completeCount = counts.filter((item) => item.done).length;
  const inProgressCount = counts.filter((item) => !item.done && item.started).length;
  const notStartedCount = counts.length - completeCount - inProgressCount;

  return (
    <section
      aria-label="Progresso dos minigames"
      className="border border-primary/40 bg-[#171516] p-4 sm:p-6"
    >
      <header className="mb-5 border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          Arquivo de progresso
        </p>
        <h2 className="mt-2 font-display text-2xl">Andamento dos minigames</h2>
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          {completeCount} completos · {inProgressCount} em andamento · {notStartedCount} não
          iniciados
        </p>
      </header>
      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {counts.map((item) => {
          const game = MINIGAME_CATALOG.find(({ id }) => id === item.id)!;
          const status = item.continuous
            ? item.complete > 0
              ? "Atividade registrada"
              : item.started
                ? "Em andamento"
                : "Não iniciado"
            : item.done
              ? "Concluído"
              : item.started
                ? "Em andamento"
                : "Não iniciado";
          const percentage = item.total ? Math.round((item.complete / item.total) * 100) : 0;
          return (
            <li key={item.id} className="border border-border bg-background/50 p-4">
              <h3 className="font-display text-lg">
                <a
                  className="underline decoration-primary/50 underline-offset-4 hover:text-primary"
                  href={`#minigame-${item.id}`}
                >
                  {game.title}
                </a>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.complete} de {item.total} unidades
              </p>
              <p className="mt-2 text-sm font-medium" data-status={status}>
                {status}
              </p>
              <progress
                className="mt-3 h-2 w-full accent-primary"
                value={item.complete}
                max={item.total}
                aria-label={`Progresso: ${game.title}`}
                aria-valuetext={`${item.complete} de ${item.total} unidades`}
              />
              <span className="sr-only">{percentage}% concluído</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
