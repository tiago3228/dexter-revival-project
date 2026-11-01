import { Award, ClipboardCheck, Percent } from "lucide-react";
import { getQuickCaseStats, QUICK_CASE_POINTS } from "./vivianQuickCases";

type Props = {
  completed: readonly string[];
  className?: string;
};

export function VivianQuickCaseStats({ completed, className = "" }: Props) {
  const stats = getQuickCaseStats(completed);

  return (
    <section
      aria-label="Estatísticas dos casos curtos"
      className={`border border-primary/35 bg-[#171516] p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            Desempenho · arquivo suplementar
          </p>
          <h3 className="mt-1 font-display text-xl">Estatísticas dos casos curtos</h3>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {QUICK_CASE_POINTS} pts por caso concluído
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="border border-border bg-background/50 p-3">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <ClipboardCheck size={14} className="text-primary" /> Conclusão
          </p>
          <p className="mt-2 font-display text-2xl" aria-label="Casos concluídos">
            {stats.completedCount}/{stats.totalCases}
          </p>
          <p className="text-xs text-muted-foreground">casos de cinco minutos</p>
        </div>
        <div className="border border-border bg-background/50 p-3">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Award size={14} className="text-primary" /> Pontuação rápida
          </p>
          <p className="mt-2 font-display text-2xl" aria-label="Pontuação dos casos curtos">
            {stats.score}/{stats.maxScore}
          </p>
          <p className="text-xs text-muted-foreground">pontos possíveis no arquivo</p>
        </div>
        <div className="border border-border bg-background/50 p-3">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Percent size={14} className="text-primary" /> Progresso
          </p>
          <p className="mt-2 font-display text-2xl">{stats.completionPercent}%</p>
          <div
            className="mt-2 h-2 overflow-hidden bg-muted"
            role="progressbar"
            aria-label="Progresso dos casos curtos"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.completionPercent}
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${stats.completionPercent}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        A pontuação é independente: cada caso resolvido vale {QUICK_CASE_POINTS} pontos, sem
        penalidade por tentativa. Ela não altera a pontuação principal nem o desfecho da
        investigação.
      </p>
    </section>
  );
}
