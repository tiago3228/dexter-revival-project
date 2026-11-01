import { useMemo, useState } from "react";
import { CheckCircle2, CircuitBoard, RotateCw, X, Zap } from "lucide-react";

type Direction = "north" | "east" | "south" | "west";
type Mask = Record<Direction, boolean>;

const SIZE = 4;
const CIRCUIT_SAVE_KEY = "dexter-circuit-panel-completed-v1";
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

export const SOLUTION: readonly Mask[] = [
  { north: false, east: true, south: false, west: false },
  { north: false, east: true, south: false, west: true },
  { north: false, east: true, south: false, west: true },
  { north: false, east: false, south: true, west: true },
  { north: false, east: true, south: true, west: false },
  { north: false, east: true, south: false, west: true },
  { north: false, east: true, south: false, west: true },
  { north: true, east: false, south: false, west: true },
  { north: true, east: true, south: false, west: false },
  { north: false, east: true, south: false, west: true },
  { north: false, east: true, south: false, west: true },
  { north: false, east: false, south: true, west: true },
  { north: false, east: true, south: false, west: false },
  { north: false, east: true, south: false, west: true },
  { north: false, east: true, south: false, west: true },
  { north: true, east: false, south: false, west: true },
];

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

export function getMasks(rotations: readonly number[]): Mask[] {
  return SOLUTION.map((mask, index) => rotateMask(mask, rotations[index] ?? 0));
}

function getEnergized(masks: readonly Mask[]): Set<number> {
  const energized = new Set<number>([0]);
  const queue = [0];
  while (queue.length) {
    const index = queue.shift()!;
    const row = Math.floor(index / SIZE);
    const column = index % SIZE;
    for (const direction of DIRECTIONS) {
      if (!masks[index]?.[direction]) continue;
      const [rowDelta, columnDelta] = DELTAS[direction];
      const nextRow = row + rowDelta;
      const nextColumn = column + columnDelta;
      if (nextRow < 0 || nextRow >= SIZE || nextColumn < 0 || nextColumn >= SIZE) continue;
      const nextIndex = nextRow * SIZE + nextColumn;
      if (!masks[nextIndex]?.[OPPOSITE[direction]]) continue;
      if (!energized.has(nextIndex)) {
        energized.add(nextIndex);
        queue.push(nextIndex);
      }
    }
  }
  return energized;
}

export function isSolved(masks: readonly Mask[]): boolean {
  for (let index = 0; index < masks.length; index += 1) {
    const row = Math.floor(index / SIZE);
    const column = index % SIZE;
    for (const direction of DIRECTIONS) {
      if (!masks[index]?.[direction]) continue;
      const [rowDelta, columnDelta] = DELTAS[direction];
      const nextRow = row + rowDelta;
      const nextColumn = column + columnDelta;
      if (nextRow < 0 || nextRow >= SIZE || nextColumn < 0 || nextColumn >= SIZE) return false;
      const nextIndex = nextRow * SIZE + nextColumn;
      if (!masks[nextIndex]?.[OPPOSITE[direction]]) return false;
    }
  }
  return getEnergized(masks).size === masks.length;
}

function createPuzzle(): number[] {
  let rotations: number[] = [];
  do {
    rotations = SOLUTION.map(() => Math.floor(Math.random() * 4));
  } while (isSolved(getMasks(rotations)));
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

function TileShape({ mask, energized }: { mask: Mask; energized: boolean }) {
  const stroke = energized ? "#f9f4dd" : "#82694a";
  const glow = energized ? "drop-shadow(0 0 5px rgba(255,244,190,.95))" : "none";
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ filter: glow }}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="9" fill={energized ? "#fff5c4" : "#5e4938"} />
      {mask.north && <path d="M50 50V7" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {mask.east && <path d="M50 50H93" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {mask.south && <path d="M50 50V93" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      {mask.west && <path d="M50 50H7" stroke={stroke} strokeWidth="13" strokeLinecap="round" />}
      <circle cx="50" cy="50" r="5" fill={energized ? "#fffbe4" : "#382c25"} />
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
  const [rotations, setRotations] = useState<number[]>(() => createPuzzle());
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [completedBefore, setCompletedBefore] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(CIRCUIT_SAVE_KEY) === "true";
  });
  const masks = useMemo(() => getMasks(rotations), [rotations]);
  const energized = useMemo(() => getEnergized(masks), [masks]);
  const litCount = energized.size;

  const start = () => {
    setRotations(createPuzzle());
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
    const nextMasks = getMasks(nextRotations);
    const nextSolved = isSolved(nextMasks);
    setRotations(nextRotations);
    setMoves((value) => value + 1);
    playTone(nextSolved ? "success" : "rotate");
    if (nextSolved) {
      setSolved(true);
      setCompletedBefore(true);
      window.localStorage.setItem(CIRCUIT_SAVE_KEY, "true");
      onSolved?.();
    }
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
                Gire os módulos até formar um circuito contínuo. Quando toda a grade receber
                energia, o painel estará restaurado.
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
                      <h3 className="font-display text-2xl">Inserir fusível</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#b9ae9b]">
                        A rede está interrompida. Analise a matriz de conectores e gire cada peça em
                        90° até acender todos os nós.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f826d]">
                      {completedBefore
                        ? "Registro anterior: painel restaurado"
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
                      Energia: {litCount}/{SIZE * SIZE} nós
                    </div>
                    <span className="font-mono text-xs text-[#9c8e79]">Giros: {moves}</span>
                  </div>
                  <div className="mt-4 border border-[#5d4b35] bg-[#30271e] p-3 shadow-inner sm:p-5">
                    <div
                      className="mb-4 grid grid-cols-6 gap-2 px-3"
                      aria-label="Indicadores de energia"
                    >
                      {Array.from({ length: 6 }, (_, index) => (
                        <span
                          key={index}
                          className={`h-2.5 rounded-full border border-[#8c7958] transition ${index < Math.ceil((litCount / 16) * 6) ? "bg-[#fff0b0] shadow-[0_0_12px_#fff0b0]" : "bg-[#4b3c2b]"}`}
                        />
                      ))}
                    </div>
                    <div className="grid aspect-square grid-cols-4 gap-1.5 border-4 border-[#554536] bg-[#191612] p-1.5 sm:gap-2 sm:p-2">
                      {masks.map((mask, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => rotateTile(index)}
                          disabled={solved}
                          aria-label={`Girar conector ${index + 1}. ${energized.has(index) ? "Energizado" : "Sem energia"}`}
                          className={`relative aspect-square overflow-hidden rounded-[22%] border transition focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff0b0] ${energized.has(index) ? "border-[#d8c18a] bg-[#756044]/35" : "border-[#624f39] bg-[#3a3026]"} ${solved ? "cursor-default" : "hover:border-[#e1c078] hover:bg-[#51412f]"}`}
                        >
                          <TileShape mask={mask} energized={energized.has(index)} />
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
                      <div>
                        <strong className="font-display text-xl">Circuito completo</strong>
                        <p className="mt-1 text-sm leading-relaxed text-[#d7c9a8]">
                          Todos os nós estão energizados. O sistema auxiliar foi restaurado; você
                          pode voltar ao menu e seguir para a próxima etapa.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-[#aa9d89]">
                        A fonte começa no canto superior esquerdo. Conexões incompatíveis não
                        conduzem energia.
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
