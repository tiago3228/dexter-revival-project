export type PlayerRankingEntry = {
  name: string;
  score: number;
  casesCompleted: number;
  mistakes: number;
  hints: number;
  lastPlayedAt: number;
};

export type RankingPerformance = {
  score: number;
  mistakes: number;
  hints: number;
};

const RANKING_STORAGE_KEY = "dexter-player-ranking-v1";
const CURRENT_PLAYER_STORAGE_KEY = "dexter-current-investigator-v1";
const MAX_ENTRIES = 50;

export function normalizePlayerName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 24);
}

function validEntry(value: unknown): value is PlayerRankingEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<PlayerRankingEntry>;
  return (
    typeof entry.name === "string" &&
    entry.name.length > 0 &&
    typeof entry.score === "number" &&
    Number.isFinite(entry.score) &&
    typeof entry.casesCompleted === "number" &&
    Number.isFinite(entry.casesCompleted) &&
    typeof entry.mistakes === "number" &&
    Number.isFinite(entry.mistakes) &&
    typeof entry.hints === "number" &&
    Number.isFinite(entry.hints) &&
    typeof entry.lastPlayedAt === "number" &&
    Number.isFinite(entry.lastPlayedAt)
  );
}

export function emptyPlayerRanking(): PlayerRankingEntry[] {
  return [];
}

export function loadPlayerRanking(): PlayerRankingEntry[] {
  if (typeof window === "undefined") return emptyPlayerRanking();
  try {
    const saved = JSON.parse(window.localStorage.getItem(RANKING_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(saved)) return emptyPlayerRanking();
    return saved
      .filter(validEntry)
      .map((entry) => ({
        name: normalizePlayerName(entry.name),
        score: Math.max(0, Math.floor(entry.score)),
        casesCompleted: Math.max(0, Math.floor(entry.casesCompleted)),
        mistakes: Math.max(0, Math.floor(entry.mistakes)),
        hints: Math.max(0, Math.floor(entry.hints)),
        lastPlayedAt: Math.max(0, Math.floor(entry.lastPlayedAt)),
      }))
      .filter((entry) => entry.name.length > 0)
      .sort(compareRankingEntries)
      .slice(0, MAX_ENTRIES);
  } catch {
    return emptyPlayerRanking();
  }
}

export function setCurrentPlayerName(name: string): string {
  const normalized = normalizePlayerName(name);
  if (typeof window !== "undefined" && normalized) {
    try {
      window.localStorage.setItem(CURRENT_PLAYER_STORAGE_KEY, normalized);
    } catch {
      // O jogo continua funcionando mesmo sem armazenamento local.
    }
  }
  return normalized;
}

export function loadCurrentPlayerName(): string {
  if (typeof window === "undefined") return "";
  try {
    return normalizePlayerName(window.localStorage.getItem(CURRENT_PLAYER_STORAGE_KEY) ?? "");
  } catch {
    return "";
  }
}

export function compareRankingEntries(a: PlayerRankingEntry, b: PlayerRankingEntry): number {
  return (
    b.score - a.score ||
    a.mistakes - b.mistakes ||
    a.hints - b.hints ||
    b.lastPlayedAt - a.lastPlayedAt ||
    a.name.localeCompare(b.name, "pt-BR")
  );
}

export function recordPlayerPerformance(
  name: string,
  performance: RankingPerformance,
): PlayerRankingEntry[] {
  const normalized = normalizePlayerName(name);
  if (!normalized || typeof window === "undefined") return loadPlayerRanking();

  const safeScore = Number.isFinite(performance.score)
    ? Math.max(0, Math.floor(performance.score))
    : 0;
  const safeMistakes = Number.isFinite(performance.mistakes)
    ? Math.max(0, Math.floor(performance.mistakes))
    : 0;
  const safeHints = Number.isFinite(performance.hints)
    ? Math.max(0, Math.floor(performance.hints))
    : 0;
  const entries = loadPlayerRanking();
  const existingIndex = entries.findIndex(
    (entry) => entry.name.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"),
  );
  const previous = existingIndex >= 0 ? entries[existingIndex] : undefined;
  const nextEntry: PlayerRankingEntry = {
    name: previous?.name ?? normalized,
    score: (previous?.score ?? 0) + safeScore,
    casesCompleted: (previous?.casesCompleted ?? 0) + 1,
    mistakes: (previous?.mistakes ?? 0) + safeMistakes,
    hints: (previous?.hints ?? 0) + safeHints,
    lastPlayedAt: Date.now(),
  };
  const next = entries.filter((_, index) => index !== existingIndex);
  next.push(nextEntry);
  next.sort(compareRankingEntries);
  const ranking = next.slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(ranking));
  } catch {
    // O resultado da partida continua disponível mesmo sem persistência.
  }
  return ranking;
}
