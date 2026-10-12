export const HINT_COSTS = [20, 50, 100] as const;
export const MAX_SCORE = 1000;

export function normalizeSavedIds<T extends string>(
  candidate: unknown,
  allowed: readonly T[],
): T[] {
  if (!Array.isArray(candidate)) return [];

  const allowedSet = new Set<string>(allowed);
  const normalized = new Set<T>();
  for (const value of candidate) {
    if (typeof value === "string" && allowedSet.has(value)) {
      normalized.add(value as T);
    }
  }
  return [...normalized];
}

export function calculateInvestigationScore(usedHints: readonly string[]) {
  const uniqueHints = new Set(usedHints);
  const penalty = [...uniqueHints].reduce((total, key) => {
    const match = /:(1|2|3)$/.exec(key);
    if (!match) return total;

    const level = Number(match[1]);
    return total + (HINT_COSTS[level - 1] ?? 0);
  }, 0);

  return { penalty, score: Math.max(0, MAX_SCORE - penalty) };
}
