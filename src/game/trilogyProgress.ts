import type { AchievementProgress, CaseId } from "./achievements";

export const TRILOGY_CASE_IDS = ["blackpine", "sparrowhollow", "threshold"] as const;
export type TrilogyCaseId = (typeof TRILOGY_CASE_IDS)[number];

export const TRILOGY_CASE_LABELS: Record<TrilogyCaseId, string> = {
  blackpine: "Capítulo 07 · Black Pine",
  sparrowhollow: "Capítulo 08 · Sparrow Hollow",
  threshold: "Capítulo 09 · Threshold",
};

export function formatTrilogyTime(seconds: number | null | undefined) {
  if (!Number.isFinite(seconds) || !seconds || seconds < 0) return "—";
  const safeSeconds = Math.floor(seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}min`
    : `${minutes}min ${String(remainder).padStart(2, "0")}s`;
}

export function getTrilogyProgress(progress: AchievementProgress) {
  const completed = TRILOGY_CASE_IDS.filter((caseId) =>
    progress.completedCases.includes(caseId),
  ).length;
  const scores = TRILOGY_CASE_IDS.map((caseId) => progress.bestScores[caseId]).filter(
    (score): score is number => typeof score === "number",
  );
  const bestTimes = TRILOGY_CASE_IDS.map(
    (caseId) => progress.caseStats[caseId]?.bestElapsedSeconds,
  ).filter((time): time is number => typeof time === "number" && time > 0);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const totalBestTime = bestTimes.reduce((sum, time) => sum + time, 0);
  const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;
  const rank =
    completed === 3 && averageScore >= 90
      ? "ARQUIVISTA DA TRILOGIA"
      : completed === 3
        ? "DETETIVE DA TRILOGIA"
        : completed > 0
          ? "INVESTIGADOR EM PROGRESSO"
          : "ARQUIVO ABERTO";

  return {
    completed,
    totalScore,
    averageScore,
    totalBestTime: bestTimes.length === 3 ? totalBestTime : null,
    rank,
    completionPercent: Math.round((completed / TRILOGY_CASE_IDS.length) * 100),
  };
}

export function getTrilogyCaseStat(progress: AchievementProgress, caseId: TrilogyCaseId) {
  return {
    score: progress.bestScores[caseId] ?? null,
    bestTime: progress.caseStats[caseId]?.bestElapsedSeconds ?? null,
    completed: progress.completedCases.includes(caseId as CaseId),
  };
}
