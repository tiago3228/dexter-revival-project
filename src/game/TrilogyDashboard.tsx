import { getTrilogyBadgeSummary, TRILOGY_BADGES } from "./trilogyAchievements";
import {
  TRILOGY_CASE_IDS,
  TRILOGY_CASE_LABELS,
  formatTrilogyTime,
  getSavedTrilogyProgress,
  loadTrilogySave,
} from "./trilogyProgress";
import { loadBlackPineDlcSave } from "./blackPineDlcCase";

type TrilogyDashboardProps = {
  onClose: () => void;
};

export function TrilogyDashboard({ onClose }: TrilogyDashboardProps) {
  const save = loadTrilogySave();
  const summary = getSavedTrilogyProgress(save);
  const badgeSummary = getTrilogyBadgeSummary(save);
  const dlcSave = loadBlackPineDlcSave();
  const totalAttempts = TRILOGY_CASE_IDS.reduce(
    (total, caseId) => total + save.chapters[caseId].attempts,
    0,
  );
  const totalBonus = TRILOGY_CASE_IDS.reduce(
    (total, caseId) => total + save.chapters[caseId].bestBonus,
    0,
  );
  const completedDates = TRILOGY_CASE_IDS.map(
    (caseId) => save.chapters[caseId].lastCompletedAt,
  ).filter((date): date is string => Boolean(date));
  const lastActivity = completedDates.sort().at(-1);
  const totalMistakes = TRILOGY_CASE_IDS.reduce(
    (total, caseId) => total + save.chapters[caseId].totalMistakes,
    0,
  );
  const totalHints = TRILOGY_CASE_IDS.reduce(
    (total, caseId) => total + save.chapters[caseId].totalHints,
    0,
  );

  return (
    <section
      className="mt-6 border border-primary/60 bg-card/70 p-5 shadow-2xl sm:p-7"
      aria-label="Dashboard da trilogia"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-primary/30 pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Dashboard · trilogia Black Pine
          </p>
          <h2 className="mt-2 font-display text-3xl">Histórico completo do investigador</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Um registro local das suas tentativas, melhores resultados, bônus e conquistas nos três
            capítulos finais.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
        >
          Fechar dashboard
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        <DashboardStat label="Capítulos" value={`${summary.completed}/3`} />
        <DashboardStat label="Pontos" value={`${summary.totalScore}/300`} />
        <DashboardStat label="Média" value={`${summary.averageScore}/100`} />
        <DashboardStat label="Tentativas" value={String(totalAttempts)} />
        <DashboardStat label="Bônus acumulado" value={`+${totalBonus}`} />
        <DashboardStat label="Erros totais" value={String(totalMistakes)} />
        <DashboardStat label="Dicas totais" value={String(totalHints)} />
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {TRILOGY_CASE_IDS.map((caseId) => {
          const chapter = save.chapters[caseId];
          return (
            <article key={caseId} className="border border-border bg-background/50 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                {chapter.completed ? "Concluído" : "Ainda não concluído"}
              </p>
              <h3 className="mt-2 font-display text-xl">{TRILOGY_CASE_LABELS[caseId]}</h3>
              <dl className="mt-4 space-y-2 font-mono text-xs leading-relaxed">
                <DashboardRow label="Tentativas" value={String(chapter.attempts)} />
                <DashboardRow
                  label="Última pontuação"
                  value={chapter.completed ? `${chapter.lastScore}/100` : "—"}
                />
                <DashboardRow
                  label="Melhor pontuação"
                  value={chapter.completed ? `${chapter.bestScore}/100` : "—"}
                />
                <DashboardRow
                  label="Último tempo"
                  value={formatTrilogyTime(chapter.lastElapsedSeconds)}
                />
                <DashboardRow
                  label="Melhor tempo"
                  value={formatTrilogyTime(chapter.bestElapsedSeconds)}
                />
                <DashboardRow label="Melhor bônus" value={`+${chapter.bestBonus}`} />
                <DashboardRow
                  label="Melhores erros/dicas"
                  value={`${chapter.bestMistakes}/${chapter.bestHints}`}
                />
              </dl>
            </article>
          );
        })}
      </div>

      <section
        className="mt-7 border border-slate-400/60 bg-slate-950/40 p-4 sm:p-5"
        aria-label="Progresso da expansão DLC"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
              Expansão independente · DLC
            </p>
            <h3 className="mt-1 font-display text-2xl">Capítulo 10 · A Moeda 217</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Estatísticas separadas. A expansão não altera a contagem, a pontuação ou as conquistas
              da trilogia principal.
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-slate-300">
            {dlcSave.completed ? "Concluído" : "Ainda não concluído"}
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <DashboardStat label="Tentativas" value={String(dlcSave.attempts)} />
          <DashboardStat
            label="Melhor pontuação"
            value={dlcSave.completed ? `${dlcSave.bestScore}/100` : "—"}
          />
          <DashboardStat label="Melhor tempo" value={formatTrilogyTime(dlcSave.bestTime)} />
          <DashboardStat label="Status" value={dlcSave.completed ? "100%" : "Em aberto"} />
          <DashboardStat label="Contagem principal" value="Não altera" />
        </div>
      </section>

      <div className="mt-7 border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Troféus da trilogia
            </p>
            <h3 className="mt-1 font-display text-2xl">
              {badgeSummary.unlocked}/{badgeSummary.total} desbloqueados
            </h3>
          </div>
          <div className="text-right font-mono text-xs text-muted-foreground">
            <p>Classificação: {summary.rank}</p>
            <p className="mt-1">
              Última atividade: {lastActivity ? formatDate(lastActivity) : "nenhuma"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRILOGY_BADGES.map((badge) => {
            const unlocked = badgeSummary.unlockedIds.includes(badge.id);
            return (
              <article
                key={badge.id}
                className={`border p-4 transition ${unlocked ? "border-amber-300/70 bg-amber-950/20" : "border-border bg-background/40 opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {unlocked ? "◆" : "◇"}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {badge.tier}
                  </span>
                </div>
                <h4 className="mt-3 font-display text-xl">{badge.title}</h4>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{badge.description}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-primary">
                  {unlocked ? "Desbloqueado" : "Bloqueado"}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DashboardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl text-primary">{value}</p>
    </div>
  );
}

function DashboardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 pb-1 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-primary">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(value),
    );
  } catch {
    return "data registrada";
  }
}
