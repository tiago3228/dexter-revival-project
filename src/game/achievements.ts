export const CASE_IDS = ["ortega", "monroe", "painscreek", "mentalist", "winchester"] as const;
export type CaseId = (typeof CASE_IDS)[number];

export const ACHIEVEMENTS = [
  {
    id: "first-case",
    title: "Primeiro arquivo",
    description: "Conclua seu primeiro caso de investigação.",
    tier: "Bronze",
  },
  {
    id: "sharp-eye",
    title: "Olho clínico",
    description: "Finalize um caso com 90 pontos ou mais.",
    tier: "Prata",
  },
  {
    id: "no-hints",
    title: "Sem atalhos",
    description: "Conclua um caso sem solicitar dicas.",
    tier: "Prata",
  },
  {
    id: "clean-run",
    title: "Disciplina de laboratório",
    description: "Conclua um caso sem cometer erros.",
    tier: "Prata",
  },
  {
    id: "correct-verdict",
    title: "Conclusão sustentada",
    description: "Chegue ao veredicto correto em um caso.",
    tier: "Ouro",
  },
  {
    id: "master-interrogator",
    title: "Mestre dos depoimentos",
    description: "Acerte os três interrogatórios do Caso Painscreek sem errar.",
    tier: "Ouro",
  },
  {
    id: "red-john-profiler",
    title: "Leitura do Sorriso Escarlate",
    description: "Acerte as três confrontações do Caso Red John sem errar.",
    tier: "Ouro",
  },
  {
    id: "all-cases",
    title: "Arquivo completo",
    description: "Conclua os cinco capítulos disponíveis.",
    tier: "Ouro",
  },
  {
    id: "blood-slide-box",
    title: "Caixa de lâminas de sangue",
    description:
      "Conclua os cinco capítulos com 90 pontos ou mais em cada um e acerte sem erros os interrogatórios de Painscreek e Red John.",
    tier: "Lendário",
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

export type AchievementProgress = {
  unlockedIds: AchievementId[];
  completedCases: CaseId[];
  bestScores: Partial<Record<CaseId, number>>;
  caseStats: Partial<Record<CaseId, CaseStatistics>>;
};

export type CaseStatistics = {
  attempts: number;
  lastElapsedSeconds: number;
  bestElapsedSeconds: number;
  lastCorrectActions: number;
  lastTotalActions: number;
};

export type CasePerformance = {
  caseId: CaseId;
  score: number;
  hints: number;
  mistakes: number;
  correctConclusion: boolean;
  elapsedSeconds: number;
  correctActions: number;
  totalActions: number;
  correctInterrogations?: number;
  interrogationMistakes?: number;
};

const STORAGE_KEY = "dexter-investigator-achievements-v1";

export function emptyAchievementProgress(): AchievementProgress {
  return { unlockedIds: [], completedCases: [], bestScores: {}, caseStats: {} };
}

const isCaseId = (value: unknown): value is CaseId =>
  typeof value === "string" && CASE_IDS.includes(value as CaseId);

const isAchievementId = (value: unknown): value is AchievementId =>
  typeof value === "string" && ACHIEVEMENTS.some((achievement) => achievement.id === value);

export function loadAchievementProgress(): AchievementProgress {
  if (typeof window === "undefined") return emptyAchievementProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAchievementProgress();
    const saved = JSON.parse(raw) as Partial<AchievementProgress>;
    const bestScores: Partial<Record<CaseId, number>> = {};
    const caseStats: Partial<Record<CaseId, CaseStatistics>> = {};
    for (const caseId of CASE_IDS) {
      const score = saved.bestScores?.[caseId];
      if (typeof score === "number" && Number.isFinite(score)) {
        bestScores[caseId] = Math.min(100, Math.max(0, Math.floor(score)));
      }
      const stats = saved.caseStats?.[caseId];
      if (!stats || typeof stats !== "object") continue;
      const value = stats as Partial<CaseStatistics>;
      if (
        typeof value.attempts === "number" &&
        Number.isFinite(value.attempts) &&
        typeof value.lastElapsedSeconds === "number" &&
        Number.isFinite(value.lastElapsedSeconds) &&
        typeof value.bestElapsedSeconds === "number" &&
        Number.isFinite(value.bestElapsedSeconds) &&
        typeof value.lastCorrectActions === "number" &&
        Number.isFinite(value.lastCorrectActions) &&
        typeof value.lastTotalActions === "number" &&
        Number.isFinite(value.lastTotalActions)
      ) {
        const lastTotalActions = Math.max(0, Math.floor(value.lastTotalActions));
        caseStats[caseId] = {
          attempts: Math.max(0, Math.floor(value.attempts)),
          lastElapsedSeconds: Math.max(0, Math.floor(value.lastElapsedSeconds)),
          bestElapsedSeconds: Math.max(0, Math.floor(value.bestElapsedSeconds)),
          lastCorrectActions: Math.min(
            lastTotalActions,
            Math.max(0, Math.floor(value.lastCorrectActions)),
          ),
          lastTotalActions,
        };
      }
    }
    const unlockedIds = Array.isArray(saved.unlockedIds)
      ? [...new Set(saved.unlockedIds.filter(isAchievementId))]
      : [];
    const completedCases = Array.isArray(saved.completedCases)
      ? [...new Set(saved.completedCases.filter(isCaseId))]
      : [];
    const qualifiesForLegendary =
      CASE_IDS.every((caseId) => completedCases.includes(caseId)) &&
      CASE_IDS.every((caseId) => (bestScores[caseId] ?? 0) >= 90) &&
      unlockedIds.includes("master-interrogator") &&
      unlockedIds.includes("red-john-profiler");

    return {
      unlockedIds: qualifiesForLegendary
        ? unlockedIds
        : unlockedIds.filter((id) => id !== "blood-slide-box"),
      completedCases,
      bestScores,
      caseStats,
    };
  } catch {
    return emptyAchievementProgress();
  }
}

export function applyCasePerformance(
  progress: AchievementProgress,
  performance: CasePerformance,
): AchievementProgress {
  const score = Number.isFinite(performance.score)
    ? Math.min(100, Math.max(0, Math.floor(performance.score)))
    : 0;
  const hints = Number.isFinite(performance.hints) ? Math.max(0, Math.floor(performance.hints)) : 0;
  const mistakes = Number.isFinite(performance.mistakes)
    ? Math.max(0, Math.floor(performance.mistakes))
    : 0;
  const elapsedSeconds = Number.isFinite(performance.elapsedSeconds)
    ? Math.max(1, Math.floor(performance.elapsedSeconds))
    : 1;
  const correctActions = Number.isFinite(performance.correctActions)
    ? Math.max(0, Math.floor(performance.correctActions))
    : 0;
  const totalActions = Number.isFinite(performance.totalActions)
    ? Math.max(correctActions, Math.floor(performance.totalActions))
    : correctActions;
  const completedCases = [...new Set([...progress.completedCases, performance.caseId])];
  const bestScores = {
    ...progress.bestScores,
    [performance.caseId]: Math.max(progress.bestScores[performance.caseId] ?? -1, score),
  };
  const unlocked = new Set(progress.unlockedIds);
  unlocked.delete("blood-slide-box");
  const previousStats = progress.caseStats[performance.caseId];
  const caseStats = {
    ...progress.caseStats,
    [performance.caseId]: {
      attempts: (previousStats?.attempts ?? 0) + 1,
      lastElapsedSeconds: elapsedSeconds,
      bestElapsedSeconds: previousStats
        ? Math.min(previousStats.bestElapsedSeconds, elapsedSeconds)
        : elapsedSeconds,
      lastCorrectActions: correctActions,
      lastTotalActions: totalActions,
    },
  };

  unlocked.add("first-case");
  if (score >= 90) unlocked.add("sharp-eye");
  if (hints === 0) unlocked.add("no-hints");
  if (mistakes === 0) unlocked.add("clean-run");
  if (performance.correctConclusion) unlocked.add("correct-verdict");
  if (
    performance.caseId === "painscreek" &&
    performance.correctInterrogations === 3 &&
    performance.interrogationMistakes === 0
  ) {
    unlocked.add("master-interrogator");
  }
  if (
    performance.caseId === "mentalist" &&
    performance.correctInterrogations === 3 &&
    performance.interrogationMistakes === 0
  ) {
    unlocked.add("red-john-profiler");
  }
  const allCasesCompleted = CASE_IDS.every((caseId) => completedCases.includes(caseId));
  if (allCasesCompleted) unlocked.add("all-cases");
  const allEliteScores = CASE_IDS.every((caseId) => (bestScores[caseId] ?? 0) >= 90);
  if (
    allCasesCompleted &&
    allEliteScores &&
    unlocked.has("master-interrogator") &&
    unlocked.has("red-john-profiler")
  ) {
    unlocked.add("blood-slide-box");
  }

  return { unlockedIds: [...unlocked], completedCases, bestScores, caseStats };
}

export function recordCaseCompletion(performance: CasePerformance): AchievementProgress {
  const progress = applyCasePerformance(loadAchievementProgress(), performance);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Keep the current session functional when browser storage is unavailable.
    }
  }
  return progress;
}
