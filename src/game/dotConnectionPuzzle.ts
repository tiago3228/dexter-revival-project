export type DotLevel = {
  id: "easy" | "medium" | "hard";
  label: string;
  description: string;
  size: number;
};

export const DOT_LEVELS: readonly DotLevel[] = [
  { id: "easy", label: "Fácil · 4×4", description: "16 bolinhas · introdução", size: 4 },
  { id: "medium", label: "Médio · 5×5", description: "25 bolinhas · mais conexões", size: 5 },
  { id: "hard", label: "Difícil · 6×6", description: "36 bolinhas · grade extensa", size: 6 },
];

export const DOT_UNLOCK_KEY = "dexter-dot-connection-unlocked-v1";
export const DOT_COMPLETE_KEY = "dexter-dot-connection-completed-v1";

export function areDotsAdjacent(first: number, second: number, size: number): boolean {
  const firstRow = Math.floor(first / size);
  const firstColumn = first % size;
  const secondRow = Math.floor(second / size);
  const secondColumn = second % size;
  return Math.abs(firstRow - secondRow) + Math.abs(firstColumn - secondColumn) === 1;
}

export function isValidDotPath(path: readonly number[], size: number): boolean {
  if (!Number.isInteger(size) || size < 1) return false;
  const pointCount = size * size;
  if (path.length > pointCount) return false;

  const visited = new Set<number>();
  for (let index = 0; index < path.length; index += 1) {
    const point = path[index]!;
    if (!Number.isInteger(point) || point < 0 || point >= pointCount || visited.has(point)) {
      return false;
    }
    if (index > 0 && !areDotsAdjacent(path[index - 1]!, point, size)) return false;
    visited.add(point);
  }
  return true;
}

export function isSolvedDotPath(path: readonly number[], size: number): boolean {
  return path.length === size * size && isValidDotPath(path, size);
}

export function createSnakePath(size: number): number[] {
  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = row % 2 === 0 ? index % size : size - 1 - (index % size);
    return row * size + column;
  });
}
