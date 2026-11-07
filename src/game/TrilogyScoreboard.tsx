import type { AchievementProgress } from "./achievements";
import {
  TRILOGY_CASE_IDS,
  TRILOGY_CASE_LABELS,
  formatTrilogyTime,
  getTrilogyCaseStat,
  getTrilogyProgress,
} from "./trilogyProgress";

type TrilogyScoreboardProps = {
  progress: AchievementProgress;
};

export function TrilogyScoreboard({ progress }: TrilogyScoreboardProps) {
  const summary = getTrilogyProgress(progress);

  return (
    <section
      className="mt-8 border border-primary/40 bg-primary/5 p-5 sm:p-6"
      aria-label="Placar da trilogia"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Placar da trilogia
          </p>
          <h2 className="mt-2 font-display text-2xl">Pontuação e tempo de investigação</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            O placar usa a melhor pontuação e o melhor tempo registrado em cada capítulo. O tempo
            consolidado só aparece quando os três arquivos tiverem sido concluídos.
          </p>
        </div>
        <div className="border border-primary/40 px-3 py-2 text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Classificação
          </p>
          <p className="mt-1 font-mono text-xs text-primary">{summary.rank}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ScoreStat
          label="Progresso"
          value={`${summary.completed}/3 · ${summary.completionPercent}%`}
        />
        <ScoreStat label="Pontos acumulados" value={`${summary.totalScore}/300`} />
        <ScoreStat label="Melhor tempo total" value={formatTrilogyTime(summary.totalBestTime)} />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-mono">Arquivo</th>
              <th className="px-3 py-2 font-mono">Melhor pontuação</th>
              <th className="px-3 py-2 font-mono">Melhor tempo</th>
              <th className="px-3 py-2 font-mono">Estado</th>
            </tr>
          </thead>
          <tbody>
            {TRILOGY_CASE_IDS.map((caseId) => {
              const stat = getTrilogyCaseStat(progress, caseId);
              return (
                <tr key={caseId} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-display text-base">
                    {TRILOGY_CASE_LABELS[caseId]}
                  </td>
                  <td className="px-3 py-3 font-mono text-primary">
                    {stat.score === null ? "—" : `${stat.score}/100`}
                  </td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">
                    {formatTrilogyTime(stat.bestTime)}
                  </td>
                  <td className="px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {stat.completed ? "Concluído" : "Disponível"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ScoreStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/70 bg-background/50 px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl text-primary">{value}</p>
    </div>
  );
}
