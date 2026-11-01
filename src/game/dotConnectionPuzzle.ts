export type DotLevel = {
  id: "easy" | "medium" | "hard";
  label: string;
  description: string;
  size: number;
  pattern: string;
  start: number;
  end: number;
  checkpoints: readonly number[];
  basePath: readonly number[];
};

function createClockwiseSpiralPath(size: number): number[] {
  const path: number[] = [];
  let top = 0;
  let bottom = size - 1;
  let left = 0;
  let right = size - 1;

  while (top <= bottom && left <= right) {
    for (let column = left; column <= right; column += 1) path.push(top * size + column);
    top += 1;
    for (let row = top; row <= bottom; row += 1) path.push(row * size + right);
    right -= 1;
    if (top <= bottom) {
      for (let column = right; column >= left; column -= 1) path.push(bottom * size + column);
      bottom -= 1;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row -= 1) path.push(row * size + left);
      left += 1;
    }
  }
  return path;
}

function createHorizontalSnakePath(size: number): number[] {
  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = row % 2 === 0 ? index % size : size - 1 - (index % size);
    return row * size + column;
  });
}

const easyPath = createHorizontalSnakePath(4);
const mediumPath = createClockwiseSpiralPath(5);
const hardPath = createClockwiseSpiralPath(6).reverse();

export const DOT_LEVELS: readonly DotLevel[] = [
  {
    id: "easy",
    label: "Fácil · Serpentina 4×4",
    description: "16 pontos · 2 checkpoints em zigue-zague",
    size: 4,
    pattern: "Serpentina horizontal",
    start: 0,
    end: 12,
    checkpoints: [6, 10],
    basePath: easyPath,
  },
  {
    id: "medium",
    label: "Médio · Espiral 5×5",
    description: "25 pontos · 3 checkpoints rumo ao centro",
    size: 5,
    pattern: "Espiral horária",
    start: 0,
    end: 12,
    checkpoints: [9, 20, 18],
    basePath: mediumPath,
  },
  {
    id: "hard",
    label: "Difícil · Espiral reversa 6×6",
    description: "36 pontos · 4 checkpoints em rota inversa",
    size: 6,
    pattern: "Espiral anti-horária reversa",
    start: 20,
    end: 0,
    checkpoints: [26, 6, 35, 4],
    basePath: hardPath,
  },
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

export function isSolvedDotLevelPath(path: readonly number[], level: DotLevel): boolean {
  return (
    isSolvedDotPath(path, level.size) &&
    path[0] === level.start &&
    path[path.length - 1] === level.end &&
    level.checkpoints.every((checkpoint) => path.includes(checkpoint)) &&
    level.checkpoints.every(
      (checkpoint, index) => path.indexOf(checkpoint) < path.indexOf(level.end),
    ) &&
    level.checkpoints.every(
      (checkpoint, index) =>
        index === 0 || path.indexOf(level.checkpoints[index - 1]!) < path.indexOf(checkpoint),
    )
  );
}

/** Returns the ready-to-play reference solution configured for a level. */
export function createDotLevelBasePath(level: DotLevel): number[] {
  return [...level.basePath];
}

/** Retained as a generic helper for callers that need a horizontal serpentine path. */
export function createSnakePath(size: number): number[] {
  return createHorizontalSnakePath(size);
}
