import type { AchievementProgress, CaseId, CasePerformance } from "./achievements";

export const TRILOGY_CASE_IDS = ["blackpine", "sparrowhollow", "threshold"] as const;
export type TrilogyCaseId = (typeof TRILOGY_CASE_IDS)[number];

export const TRILOGY_CASE_LABELS: Record<TrilogyCaseId, string> = {
  blackpine: "Capítulo 07 · Black Pine",
  sparrowhollow: "Capítulo 08 · Sparrow Hollow",
  threshold: "Capítulo 09 · Threshold",
};

const TRILOGY_SAVE_KEY = "dexter-trilogy-progress-v1";

export type TrilogyChapterSave = {
  completed: boolean;
  attempts: number;
  lastScore: number;
  bestScore: number;
  lastElapsedSeconds: number;
  bestElapsedSeconds: number;
  lastBonus: number;
  bestBonus: number;
  lastMistakes: number;
  bestMistakes: number;
  lastHints: number;
  bestHints: number;
  totalMistakes: number;
  totalHints: number;
  lastCompletedAt: string | null;
};

export type TrilogySaveData = {
  version: 1;
  updatedAt: string | null;
  chapters: Record<TrilogyCaseId, TrilogyChapterSave>;
};

function emptyChapterSave(): TrilogyChapterSave {
  return {
    completed: false,
    attempts: 0,
    lastScore: 0,
    bestScore: 0,
    lastElapsedSeconds: 0,
    bestElapsedSeconds: 0,
    lastBonus: 0,
    bestBonus: 0,
    lastMistakes: 0,
    bestMistakes: 0,
    lastHints: 0,
    bestHints: 0,
    totalMistakes: 0,
    totalHints: 0,
    lastCompletedAt: null,
  };
}

export function emptyTrilogySave(): TrilogySaveData {
  return {
    version: 1,
    updatedAt: null,
    chapters: {
      blackpine: emptyChapterSave(),
      sparrowhollow: emptyChapterSave(),
      threshold: emptyChapterSave(),
    },
  };
}

function isTrilogyCaseId(value: unknown): value is TrilogyCaseId {
  return typeof value === "string" && TRILOGY_CASE_IDS.includes(value as TrilogyCaseId);
}

function normalizeChapterSave(value: unknown): TrilogyChapterSave {
  const raw = value && typeof value === "object" ? (value as Partial<TrilogyChapterSave>) : {};
  const numberOrZero = (input: unknown) =>
    typeof input === "number" ? Math.max(0, Math.floor(input)) : 0;
  return {
    completed: raw.completed === true,
    attempts: numberOrZero(raw.attempts),
    lastScore: Math.min(100, numberOrZero(raw.lastScore)),
    bestScore: Math.min(100, numberOrZero(raw.bestScore)),
    lastElapsedSeconds: numberOrZero(raw.lastElapsedSeconds),
    bestElapsedSeconds: numberOrZero(raw.bestElapsedSeconds),
    lastBonus: numberOrZero(raw.lastBonus),
    bestBonus: numberOrZero(raw.bestBonus),
    lastMistakes: numberOrZero(raw.lastMistakes),
    bestMistakes: numberOrZero(raw.bestMistakes),
    lastHints: numberOrZero(raw.lastHints),
    bestHints: numberOrZero(raw.bestHints),
    totalMistakes: numberOrZero(raw.totalMistakes),
    totalHints: numberOrZero(raw.totalHints),
    lastCompletedAt: typeof raw.lastCompletedAt === "string" ? raw.lastCompletedAt : null,
  };
}

export function loadTrilogySave(): TrilogySaveData {
  const fallback = emptyTrilogySave();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = JSON.parse(
      window.localStorage.getItem(TRILOGY_SAVE_KEY) ?? "null",
    ) as Partial<TrilogySaveData> | null;
    if (!raw || raw.version !== 1 || !raw.chapters) return fallback;
    return {
      version: 1,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
      chapters: {
        blackpine: normalizeChapterSave(raw.chapters.blackpine),
        sparrowhollow: normalizeChapterSave(raw.chapters.sparrowhollow),
        threshold: normalizeChapterSave(raw.chapters.threshold),
      },
    };
  } catch {
    return fallback;
  }
}

export function recordTrilogyPerformance(performance: CasePerformance) {
  if (!isTrilogyCaseId(performance.caseId) || typeof window === "undefined") {
    return loadTrilogySave();
  }
  const current = loadTrilogySave();
  const previous = current.chapters[performance.caseId];
  const bonus = getTrilogyPerformanceBonus(performance.elapsedSeconds, performance.mistakes);
  const score = Math.min(100, Math.max(0, Math.floor(performance.score)));
  const elapsedSeconds = Math.max(0, Math.floor(performance.elapsedSeconds));
  const mistakes = Math.max(0, Math.floor(performance.mistakes));
  const hints = Math.max(0, Math.floor(performance.hints));
  const completedAt = new Date().toISOString();
  const next: TrilogySaveData = {
    ...current,
    updatedAt: completedAt,
    chapters: {
      ...current.chapters,
      [performance.caseId]: {
        completed: true,
        attempts: previous.attempts + 1,
        lastScore: score,
        bestScore: Math.max(previous.bestScore, score),
        lastElapsedSeconds: elapsedSeconds,
        bestElapsedSeconds:
          previous.bestElapsedSeconds > 0
            ? Math.min(previous.bestElapsedSeconds, elapsedSeconds)
            : elapsedSeconds,
        lastBonus: bonus.totalBonus,
        bestBonus: Math.max(previous.bestBonus, bonus.totalBonus),
        lastMistakes: mistakes,
        bestMistakes: previous.attempts > 0 ? Math.min(previous.bestMistakes, mistakes) : mistakes,
        lastHints: hints,
        bestHints: previous.attempts > 0 ? Math.min(previous.bestHints, hints) : hints,
        totalMistakes: previous.totalMistakes + mistakes,
        totalHints: previous.totalHints + hints,
        lastCompletedAt: completedAt,
      },
    },
  };
  try {
    window.localStorage.setItem(TRILOGY_SAVE_KEY, JSON.stringify(next));
  } catch {
    // O jogo continua funcional quando o navegador bloqueia o localStorage.
  }
  return next;
}

export function getSavedTrilogyProgress(save: TrilogySaveData) {
  const completed = TRILOGY_CASE_IDS.filter((caseId) => save.chapters[caseId].completed).length;
  const totalScore = TRILOGY_CASE_IDS.reduce(
    (sum, caseId) => sum + save.chapters[caseId].bestScore,
    0,
  );
  const averageScore = completed > 0 ? Math.round(totalScore / completed) : 0;
  const times = TRILOGY_CASE_IDS.map((caseId) => save.chapters[caseId].bestElapsedSeconds).filter(
    (time) => time > 0,
  );
  return {
    completed,
    totalScore,
    averageScore,
    totalBestTime:
      times.length === TRILOGY_CASE_IDS.length ? times.reduce((sum, time) => sum + time, 0) : null,
    completionPercent: Math.round((completed / TRILOGY_CASE_IDS.length) * 100),
    rank:
      completed === 3 && averageScore >= 90
        ? "ARQUIVISTA DA TRILOGIA"
        : completed === 3
          ? "DETETIVE DA TRILOGIA"
          : completed > 0
            ? "INVESTIGADOR EM PROGRESSO"
            : "ARQUIVO ABERTO",
  };
}

export type TrilogyPerformanceBonus = {
  speedBonus: number;
  errorFreeBonus: number;
  totalBonus: number;
};

export function getTrilogyPerformanceBonus(
  elapsedSeconds: number,
  mistakes: number,
): TrilogyPerformanceBonus {
  const seconds = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const normalizedMistakes = Number.isFinite(mistakes) ? Math.max(0, Math.floor(mistakes)) : 0;
  const speedBonus = seconds <= 300 ? 5 : seconds <= 600 ? 3 : seconds <= 900 ? 1 : 0;
  const errorFreeBonus = normalizedMistakes === 0 ? 5 : 0;
  return { speedBonus, errorFreeBonus, totalBonus: speedBonus + errorFreeBonus };
}

export function applyTrilogyPerformanceBonus(
  baseScore: number,
  elapsedSeconds: number,
  mistakes: number,
) {
  const safeBaseScore = Number.isFinite(baseScore) ? Math.max(0, Math.floor(baseScore)) : 0;
  const bonus = getTrilogyPerformanceBonus(elapsedSeconds, mistakes);
  return { score: Math.min(100, safeBaseScore + bonus.totalBonus), bonus };
}

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
