import { useMemo, useState } from "react";
import { CheckCircle2, CircuitBoard, RotateCw, X, Zap } from "lucide-react";

type Direction = "north" | "east" | "south" | "west";
type Mask = Record<Direction, boolean>;
type Layout = "horizontal" | "vertical" | "spiral";

const DEFAULT_SIZE = 4;
const CIRCUIT_SAVE_KEY = "dexter-circuit-panel-completed-v1";
const CIRCUIT_LEVEL_KEY = "dexter-circuit-panel-level-v1";
const DIRECTIONS: readonly Direction[] = ["north", "east", "south", "west"];
const DELTAS: Record<Direction, readonly [number, number]> = {
  north: [-1, 0],
  east: [0, 1],
  south: [1, 0],
  west: [0, -1],
};
const OPPOSITE: Record<Direction, Direction> = {
  north: "south",
  east: "west",
  south: "north",
  west: "east",
};

type Edge = readonly [number, number];

function createMasksFromEdges(size: number, edges: readonly Edge[]): Mask[] {
  const masks = Array.from({ length: size * size }, () => ({
    north: false,
    east: false,
    south: false,
    west: false,
  }));
  for (const [from, to] of edges) {
    const fromRow = Math.floor(from / size);
    const fromColumn = from % size;
    const toRow = Math.floor(to / size);
    const toColumn = to % size;
    const direction = DIRECTIONS.find(
      (candidate) =>
        fromRow + DELTAS[candidate][0] === toRow && fromColumn + DELTAS[candidate][1] === toColumn,
    );
    if (!direction) throw new Error(`A conexão ${from}–${to} não é entre células adjacentes.`);
    masks[from]![direction] = true;
    masks[to]![OPPOSITE[direction]] = true;
  }
  return masks;
}

type LevelId = "easy" | "medium" | "complex";
type Level = {
  id: LevelId;
  label: string;
  description: string;
  size: number;
  layout: Layout;
  sourceIndex: number;
  targetIndices: readonly number[];
  solution: readonly Mask[];
};

export const LEVELS: readonly Level[] = [
  {
    id: "easy",
    label: "Fácil · 4×4",
    description: "Ramificação curta · 3 alvos",
    size: 4,
    layout: "horizontal",
    sourceIndex: 0,
    targetIndices: [5, 7, 10],
    solution: createMasksFromEdges(4, [
      [0, 1],
      [1, 2],
      [2, 6],
      [6, 5],
      [6, 7],
      [6, 10],
    ]),
  },
  {
    id: "medium",
    label: "Médio · 5×5",
    description: "Tronco vertical com dois ramos · 3 alvos",
    size: 5,
    layout: "vertical",
    sourceIndex: 2,
    targetIndices: [12, 20, 24],
    solution: createMasksFromEdges(5, [
      [2, 7],
      [7, 12],
      [12, 17],
      [17, 18],
      [18, 19],
      [19, 24],
      [17, 22],
      [22, 21],
      [21, 20],
    ]),
  },
  {
    id: "complex",
    label: "Complexo · 6×6",
    description: "Ramificações em cotovelo · 4 alvos",
    size: 6,
    layout: "spiral",
    sourceIndex: 5,
    targetIndices: [0, 21, 23, 34],
    solution: createMasksFromEdges(6, [
      [5, 4],
      [4, 3],
      [3, 2],
      [2, 1],
      [1, 0],
      [3, 9],
      [9, 15],
      [15, 21],
      [15, 16],
      [16, 22],
      [22, 28],
      [28, 34],
      [9, 10],
      [10, 11],
      [11, 17],
      [17, 23],
    ]),
  },
];

export const SOLUTION: readonly Mask[] = LEVELS[0]!.solution;

export function rotateMask(mask: Mask, turns: number): Mask {
  let current = mask;
  for (let turn = 0; turn < turns % 4; turn += 1) {
    current = {
      north: current.west,
      east: current.north,
      south: current.east,
      west: current.south,
    };
  }
  return current;
}

export function getMasks(
  rotations: readonly number[],
  solution: readonly Mask[] = SOLUTION,
): Mask[] {
  return solution.map((mask, index) => rotateMask(mask, rotations[index] ?? 0));
}

export function getEnergized(masks: readonly Mask[], sourceIndex = 0): Set<number> {
  const size = Math.sqrt(masks.length);
  const energized = new Set<number>([sourceIndex]);
  const queue = [sourceIndex];
  while (queue.length) {
    const index = queue.shift()!;
    const row = Math.floor(index / size);
    const column = index % size;
    for (const direction of DIRECTIONS) {
      if (!masks[index]?.[direction]) continue;
      const [rowDelta, columnDelta] = DELTAS[direction];
      const nextRow = row + rowDelta;
      const nextColumn = column + columnDelta;
      if (nextRow < 0 || nextRow >= size || nextColumn < 0 || nextColumn >= size) continue;
      const nextIndex = nextRow * size + nextColumn;
      if (!masks[nextIndex]?.[OPPOSITE[direction]]) continue;
      if (!energized.has(nextIndex)) {
        energized.add(nextIndex);
        queue.push(nextIndex);
      }
    }
  }
  return energized;
}

export function isSolved(
  masks: readonly Mask[],
  sourceIndex = LEVELS[0]!.sourceIndex,
  targetIndices: readonly number[] = LEVELS[0]!.targetIndices,
): boolean {
  const size = Math.sqrt(masks.length);
  if (!Number.isInteger(size) || sourceIndex < 0 || sourceIndex >= masks.length) return false;
  for (let index = 0; index < masks.length; index += 1) {
    const row = Math.floor(index / size);
    const column = index % size;
    for (const direction of DIRECTIONS) {
      if (!masks[index]?.[direction]) continue;
      const [rowDelta, columnDelta] = DELTAS[direction];
      const nextRow = row + rowDelta;
      const nextColumn = column + columnDelta;
      if (nextRow < 0 || nextRow >= size || nextColumn < 0 || nextColumn >= size) return false;
      const nextIndex = nextRow * size + nextColumn;
      if (!masks[nextIndex]?.[OPPOSITE[direction]]) return false;
    }
  }
  const energized = getEnergized(masks, sourceIndex);
  return targetIndices.length > 0 && targetIndices.every((target) => energized.has(target));
}

function createPuzzle(
  solution: readonly Mask[],
  sourceIndex: number,
  targetIndices: readonly number[],
): number[] {
  let rotations: number[] = [];
  do {
    rotations = solution.map(() => Math.floor(Math.random() * 4));
  } while (isSolved(getMasks(rotations, solution), sourceIndex, targetIndices));
  return rotations;
}

function playTone(type: "rotate" | "success") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = type === "success" ? "sine" : "square";
    oscillator.frequency.setValueAtTime(type === "success" ? 392 : 220, now);
    oscillator.frequency.exponentialRampToValueAtTime(type === "success" ? 880 : 260, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "success" ? 0.16 : 0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "success" ? 0.55 : 0.13));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + (type === "success" ? 0.55 : 0.13));
    oscillator.addEventListener("ended", () => void context.close(), { once: true });
    void context.resume();
  } catch {
    // O som é apenas feedback; não pode impedir o puzzle.
  }
}

function TileShape({
  mask,
  energized,
  isSource,
  isTarget,
}: {
  mask: Mask;
  energized: boolean;
  isSource: boolean;
  isTarget: boolean;
}) {
  const stroke = energized ? "#f9f4dd" : "#82694a";
  const glow = energized ? "drop-shadow(0 0 5px rgba(255,244,190,.95))" : "none";
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ filter: glow }}
      aria-hidden="true"
    >
      {isSource && (
        <circle cx="50" cy="50" r="16" fill="#57c6de" stroke="#d5fbff" strokeWidth="4" />
      )}
      {isTarget && (
        <>
          <circle cx="50" cy="50" r="15" fill={energized ? "#ffbf43" : "#b95419"} />
          <circle cx="50" cy="50" r="10" fill={energized ? "#fff2a8" : "#f28a32"} />
        </>
      )}
      {!isSource && !isTarget && (
        <circle cx="50" cy="50" r="9" fill={energized ? "#fff5c4" : "#5e4938"} />
      )}
      {mask.north && <path d="M50 50V7" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {mask.east && <path d="M50 50H93" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {mask.south && <path d="M50 50V93" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {mask.west && <path d="M50 50H7" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {!isSource && !isTarget && (
        <circle cx="50" cy="50" r="5" fill={energized ? "#fffbe4" : "#382c25"} />
      )}
    </svg>
  );
}

type CircuitPanelMinigameProps = {
  embedded?: boolean;
  onSolved?: () => void;
  onExit?: () => void;
};

export function CircuitPanelMinigame({
  embedded = false,
  onSolved,
  onExit,
}: CircuitPanelMinigameProps = {}) {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [completedLevelIndex, setCompletedLevelIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Math.min(LEVELS.length - 1, Number(window.localStorage.getItem(CIRCUIT_LEVEL_KEY)) || 0);
  });
  const [levelIndex, setLevelIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Math.min(LEVELS.length - 1, Number(window.localStorage.getItem(CIRCUIT_LEVEL_KEY)) || 0);
  });
  const level = LEVELS[levelIndex] ?? LEVELS[0]!;
  const [rotations, setRotations] = useState<number[]>(() =>
    createPuzzle(level.solution, level.sourceIndex, level.targetIndices),
  );
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [completedBefore, setCompletedBefore] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(CIRCUIT_SAVE_KEY) === "true";
  });
  const masks = useMemo(() => getMasks(rotations, level.solution), [level.solution, rotations]);
  const energized = useMemo(
    () => getEnergized(masks, level.sourceIndex),
    [level.sourceIndex, masks],
  );
  const litTargetCount = level.targetIndices.filter((index) => energized.has(index)).length;

  const start = () => {
    setRotations(createPuzzle(level.solution, level.sourceIndex, level.targetIndices));
    setMoves(0);
    setSolved(false);
    setStarted(true);
  };

  const close = () => {
    setOpen(false);
    setStarted(false);
    onExit?.();
  };

  const rotateTile = (index: number) => {
    if (solved) return;
    const nextRotations = rotations.map((rotation, tileIndex) =>
      tileIndex === index ? (rotation + 1) % 4 : rotation,
    );
    const nextMasks = getMasks(nextRotations, level.solution);
    const nextSolved = isSolved(nextMasks, level.sourceIndex, level.targetIndices);
    setRotations(nextRotations);
    setMoves((value) => value + 1);
    playTone(nextSolved ? "success" : "rotate");
    if (nextSolved) {
      setSolved(true);
      setCompletedLevelIndex((current) => {
        const next = Math.max(current, levelIndex);
        window.localStorage.setItem(CIRCUIT_LEVEL_KEY, String(next));
        return next;
      });
      if (levelIndex === LEVELS.length - 1) {
        setCompletedBefore(true);
        window.localStorage.setItem(CIRCUIT_SAVE_KEY, "true");
        onSolved?.();
      }
    }
  };

  const nextLevel = () => {
    if (levelIndex >= LEVELS.length - 1) return;
    const nextIndex = levelIndex + 1;
    setLevelIndex(nextIndex);
    setRotations(
      createPuzzle(
        LEVELS[nextIndex]!.solution,
        LEVELS[nextIndex]!.sourceIndex,
        LEVELS[nextIndex]!.targetIndices,
      ),
    );
    setMoves(0);
    setSolved(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border border-amber-300/70 bg-amber-300/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-300 hover:text-[#17120d]"
        aria-haspopup="dialog"
      >
        <CircuitBoard size={16} aria-hidden="true" />
        {embedded ? "Abrir painel elétrico" : "Painel Elétrico"}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mini Game — Painel Elétrico"
        >
          <section className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto border border-[#9b8660] bg-[#161412] text-[#ede7d8] shadow-[0_0_70px_rgba(220,183,108,.15)]">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 min-h-10 min-w-10 border border-[#8d7854] p-2 text-[#e8cf99] transition hover:bg-[#d3a74e]/15"
              aria-label="Fechar Mini Game — Painel Elétrico"
            >
              <X size={18} />
            </button>
            <div className="border-b border-[#5f503b] bg-[#211c17] px-5 py-5 sm:px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d8b76f]">
                Mini Game · Sistema auxiliar
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">Painel Elétrico</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#b9ae9b]">
                Gire os módulos para conduzir energia da fonte até todas as esferas-alvo laranja.
                Não é necessário energizar cada peça da grade.
              </p>
            </div>
            <div className="p-5 sm:p-8">
              {!started ? (
                <div className="border border-[#6e5a3f] bg-[#201b16] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="border border-[#d3a74e]/60 bg-[#d3a74e]/10 p-2 text-[#f2cf7c]">
                      <Zap size={21} />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl">
                        Inserir fusível · Painel {levelIndex + 1}/3
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#b9ae9b]">
                        A rede está interrompida. Gire os conectores em 90° para levar energia da
                        fonte até todos os alvos laranja.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Níveis do painel">
                    {LEVELS.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={index > completedLevelIndex}
                        onClick={() => {
                          setLevelIndex(index);
                          setRotations(
                            createPuzzle(item.solution, item.sourceIndex, item.targetIndices),
                          );
                        }}
                        className={`min-h-16 border p-3 text-left font-mono text-[10px] transition ${index === levelIndex ? "border-[#e1c078] bg-[#d3a74e]/15 text-[#f1d58e]" : index < levelIndex ? "border-emerald-800/70 text-emerald-200" : "cursor-not-allowed border-[#4b4031] text-[#665b4b]"}`}
                      >
                        <strong className="block">
                          {index < levelIndex ? "✓ " : ""}
                          {item.label}
                        </strong>
                        <span className="mt-1 block opacity-75">{item.description}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#9f917b]">
                    Os três painéis são progressivos. Complete o painel atual para liberar o
                    seguinte.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f826d]">
                      {completedBefore
                        ? "Registro anterior: desafio completo"
                        : "Sem cronômetro · sem pontuação"}
                    </span>
                    <button
                      type="button"
                      onClick={start}
                      className="min-h-11 border-2 border-[#e1c078] bg-[#d3a74e]/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#f1d58e] transition hover:bg-[#d3a74e]/20"
                    >
                      Analisar painel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border border-[#5f503b] bg-[#201b16] px-4 py-3">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#d3ba82]">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${solved ? "bg-[#f8e7a7] shadow-[0_0_12px_#fff4b0]" : "bg-[#8a6b37]"}`}
                      />
                      Painel {levelIndex + 1}/3 · Alvos alimentados: {litTargetCount}/
                      {level.targetIndices.length}
                    </div>
                    <span className="font-mono text-xs text-[#9c8e79]">Giros: {moves}</span>
                  </div>
                  <div className="mt-4 border border-[#5d4b35] bg-[#30271e] p-3 shadow-inner sm:p-5">
                    <div
                      className="mb-4 grid gap-2 px-3"
                      style={{
                        gridTemplateColumns: `repeat(${level.targetIndices.length}, minmax(0, 1fr))`,
                      }}
                      aria-label={`Alvos alimentados: ${litTargetCount} de ${level.targetIndices.length}`}
                    >
                      {level.targetIndices.map((targetIndex) => (
                        <span
                          key={targetIndex}
                          className={`h-2.5 rounded-full border border-[#8c7958] transition ${energized.has(targetIndex) ? "bg-[#ffbd4a] shadow-[0_0_12px_#ffbd4a]" : "bg-[#4b3c2b]"}`}
                        />
                      ))}
                    </div>
                    <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-wider text-[#aa9d89]">
                      Fonte azul · alvos laranja · alcance {litTargetCount}/
                      {level.targetIndices.length}
                    </p>
                    <div
                      className="grid aspect-square gap-1.5 border-4 border-[#554536] bg-[#191612] p-1.5 sm:gap-2 sm:p-2"
                      style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }}
                    >
                      {masks.map((mask, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => rotateTile(index)}
                          disabled={solved}
                          aria-label={`Girar ${index === level.sourceIndex ? "fonte" : level.targetIndices.includes(index) ? `alvo ${level.targetIndices.indexOf(index) + 1}` : "peça"} ${index + 1}. ${energized.has(index) ? "Energizado" : "Sem energia"}`}
                          className={`relative aspect-square overflow-hidden rounded-[22%] border transition focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff0b0] ${index === level.sourceIndex ? "border-cyan-200 bg-cyan-950/60" : level.targetIndices.includes(index) ? "border-orange-400 bg-orange-950/40" : energized.has(index) ? "border-[#d8c18a] bg-[#756044]/35" : "border-[#624f39] bg-[#3a3026]"} ${solved ? "cursor-default" : "hover:border-[#e1c078] hover:bg-[#51412f]"}`}
                        >
                          <TileShape
                            mask={mask}
                            energized={energized.has(index)}
                            isSource={index === level.sourceIndex}
                            isTarget={level.targetIndices.includes(index)}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#97876c]">
                      Clique ou pressione Enter para girar · sentido horário
                    </p>
                  </div>
                  {solved ? (
                    <div
                      className="mt-4 flex items-start gap-3 border border-[#d8bd6e] bg-[#d8bd6e]/10 p-4 text-[#f2d991]"
                      role="status"
                    >
                      <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                      <div className="min-w-0">
                        <strong className="font-display text-xl">Circuito completo</strong>
                        <p className="mt-1 text-sm leading-relaxed text-[#d7c9a8]">
                          Todos os {level.targetIndices.length} alvos estão alimentados.{" "}
                          {levelIndex < LEVELS.length - 1
                            ? "O próximo painel foi liberado."
                            : "O sistema auxiliar foi restaurado por completo."}
                        </p>
                        {levelIndex < LEVELS.length - 1 && (
                          <button
                            type="button"
                            onClick={nextLevel}
                            className="mt-4 min-h-10 border border-[#e1c078] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#f1d58e] hover:bg-[#d3a74e]/15"
                          >
                            Continuar para {LEVELS[levelIndex + 1]!.label} →
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-[#aa9d89]">
                        A fonte está na posição {level.sourceIndex + 1}. Alvos apagados são esferas
                        laranja; conectores abertos ou incompatíveis não conduzem energia.
                      </p>
                      <button
                        type="button"
                        onClick={start}
                        className="inline-flex min-h-10 items-center gap-2 border border-[#8d7854] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#e8cf99] hover:bg-[#d3a74e]/10"
                      >
                        <RotateCw size={14} /> Reiniciar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
