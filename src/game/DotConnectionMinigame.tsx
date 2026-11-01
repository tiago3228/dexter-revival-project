import { useState } from "react";
import { CheckCircle2, CircleDot, RotateCcw, Route, Undo2, X } from "lucide-react";
import {
  areDotsAdjacent,
  DOT_COMPLETE_KEY,
  DOT_LEVELS,
  DOT_UNLOCK_KEY,
  isSolvedDotPath,
} from "./dotConnectionPuzzle";
import { playMinigameVictorySound } from "./minigameVictoryEffects";

function readUnlockedLevel(): number {
  if (typeof window === "undefined") return 0;
  try {
    const saved = Number(window.localStorage.getItem(DOT_UNLOCK_KEY));
    return Number.isInteger(saved) ? Math.max(0, Math.min(DOT_LEVELS.length - 1, saved)) : 0;
  } catch {
    return 0;
  }
}

function readCompleted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DOT_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

function pointPosition(point: number, size: number) {
  const row = Math.floor(point / size);
  const column = point % size;
  return {
    x: ((column + 0.5) / size) * 100,
    y: ((row + 0.5) / size) * 100,
  };
}

export function DotConnectionMinigame() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(readUnlockedLevel);
  const [levelIndex, setLevelIndex] = useState(readUnlockedLevel);
  const [path, setPath] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const [completedBefore, setCompletedBefore] = useState(readCompleted);
  const level = DOT_LEVELS[levelIndex] ?? DOT_LEVELS[0]!;
  const pointCount = level.size * level.size;

  const start = () => {
    setPath([]);
    setFeedback("");
    setSolved(false);
    setStarted(true);
  };

  const close = () => {
    setOpen(false);
    setStarted(false);
    setPath([]);
    setFeedback("");
  };

  const finishLevel = () => {
    playMinigameVictorySound();
    setSolved(true);
    setFeedback(
      `Caminho válido: as ${pointCount} bolinhas foram conectadas uma vez, sem cruzamentos.`,
    );
    const nextUnlockedLevel = Math.max(
      unlockedLevelIndex,
      Math.min(DOT_LEVELS.length - 1, levelIndex + 1),
    );
    setUnlockedLevelIndex(nextUnlockedLevel);
    try {
      window.localStorage.setItem(DOT_UNLOCK_KEY, String(nextUnlockedLevel));
    } catch {
      // O progresso em memória continua disponível se o armazenamento local estiver bloqueado.
    }
    if (levelIndex === DOT_LEVELS.length - 1) {
      setCompletedBefore(true);
      try {
        window.localStorage.setItem(DOT_COMPLETE_KEY, "true");
      } catch {
        // A conclusão visual não depende do armazenamento local.
      }
    }
  };

  const connectPoint = (point: number) => {
    if (solved) return;
    setFeedback("");
    if (path.length === 0) {
      setPath([point]);
      return;
    }

    const last = path[path.length - 1]!;
    if (point === last) return;
    if (path.length > 1 && point === path[path.length - 2]) {
      setPath((current) => current.slice(0, -1));
      return;
    }
    if (path.includes(point)) {
      setFeedback("Essa bolinha já foi usada. Cada ponto só pode aparecer uma vez no caminho.");
      return;
    }
    if (!areDotsAdjacent(last, point, level.size)) {
      setFeedback("Conecte uma bolinha vizinha na horizontal ou na vertical.");
      return;
    }

    const nextPath = [...path, point];
    setPath(nextPath);
    if (isSolvedDotPath(nextPath, level.size)) finishLevel();
  };

  const undo = () => {
    if (solved || path.length === 0) return;
    setPath((current) => current.slice(0, -1));
    setFeedback("");
  };

  const resetPath = () => {
    if (solved) return;
    setPath([]);
    setFeedback("");
  };

  const continueToNextLevel = () => {
    if (levelIndex >= DOT_LEVELS.length - 1) return;
    setLevelIndex((current) => current + 1);
    setPath([]);
    setFeedback("");
    setSolved(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border border-rose-300/70 bg-rose-300/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:bg-rose-300 hover:text-[#17120d]"
        aria-haspopup="dialog"
      >
        <Route size={16} aria-hidden="true" /> Conexão de Pontos
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mini Game — Conexão de Pontos"
        >
          <section className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto border border-[#9b686e] bg-[#161214] text-[#ede7e3] shadow-[0_0_70px_rgba(220,120,130,.14)]">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 min-h-10 min-w-10 border border-[#8d6266] p-2 text-[#e8c4c7] transition hover:bg-rose-300/15"
              aria-label="Fechar Mini Game — Conexão de Pontos"
            >
              <X size={18} />
            </button>
            <div className="border-b border-[#5f3b40] bg-[#211719] px-5 py-5 sm:px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d98a91]">
                Mini Game · Raciocínio espacial
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">Conexão de Pontos</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#b9a9aa]">
                Ligue todas as bolinhas em um único caminho. Cada bolinha só pode ser visitada uma
                vez e as linhas não podem se cruzar.
              </p>
            </div>
            <div className="p-5 sm:p-8">
              {!started ? (
                <div className="border border-[#6e4549] bg-[#201719] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="border border-rose-300/60 bg-rose-300/10 p-2 text-rose-200">
                      <CircleDot size={21} />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl">
                        Traçar rota · Nível {levelIndex + 1}/3
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#b9a9aa]">
                        Comece em qualquer ponto e avance apenas para uma bolinha vizinha na
                        horizontal ou vertical. Não repita pontos; conexões diagonais não são
                        permitidas.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Níveis de conexão">
                    {DOT_LEVELS.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={index > unlockedLevelIndex}
                        onClick={() => {
                          setLevelIndex(index);
                          setPath([]);
                          setFeedback("");
                        }}
                        className={`min-h-16 border p-3 text-left font-mono text-[10px] transition ${index === levelIndex ? "border-rose-300 bg-rose-300/15 text-rose-100" : index < unlockedLevelIndex ? "border-emerald-800/70 text-emerald-200" : "cursor-not-allowed border-[#4b4031] text-[#665b4b]"}`}
                      >
                        <strong className="block">
                          {index < unlockedLevelIndex ? "✓ " : ""}
                          {item.label}
                        </strong>
                        <span className="mt-1 block opacity-75">{item.description}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#a69093]">
                    Complete cada nível para liberar o próximo. Cada trecho liga pontos adjacentes,
                    então não há cruzamentos.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#9b8588]">
                      {completedBefore
                        ? "Registro anterior: desafio completo"
                        : "Sem cronômetro · sem pontuação"}
                    </span>
                    <button
                      type="button"
                      onClick={start}
                      className="min-h-11 border-2 border-rose-300 bg-rose-300/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-rose-100 transition hover:bg-rose-300/20"
                    >
                      Iniciar desafio
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border border-[#5f3b40] bg-[#201719] px-4 py-3">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#d9a0a5]">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${solved ? "bg-[#ffc4c9] shadow-[0_0_12px_#ffc4c9]" : "bg-[#8a4f58]"}`}
                      />
                      Nível {levelIndex + 1}/3 · Pontos: {path.length}/{pointCount}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={undo}
                        disabled={solved || path.length === 0}
                        className="inline-flex min-h-9 items-center gap-1 border border-[#8d6266] px-2 py-1 font-mono text-[10px] uppercase text-[#e8c4c7] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Undo2 size={14} /> Desfazer
                      </button>
                      <button
                        type="button"
                        onClick={resetPath}
                        disabled={solved || path.length === 0}
                        className="inline-flex min-h-9 items-center gap-1 border border-[#8d6266] px-2 py-1 font-mono text-[10px] uppercase text-[#e8c4c7] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw size={13} /> Limpar
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border border-[#5d3d42] bg-[#2a1e20] p-3 shadow-inner sm:p-5">
                    <div
                      className={`relative aspect-square border-2 border-[#554044] bg-[#191516] ${solved ? "dot-connection-victory-board" : ""}`}
                      role="group"
                      aria-label={`Grade de ${level.size} por ${level.size} bolinhas`}
                    >
                      <svg
                        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        {path.slice(1).map((point, index) => {
                          const from = pointPosition(path[index]!, level.size);
                          const to = pointPosition(point, level.size);
                          return (
                            <line
                              key={`${path[index]}-${point}`}
                              x1={from.x}
                              y1={from.y}
                              x2={to.x}
                              y2={to.y}
                              stroke={solved ? "#ffc4c9" : "#9b84d5"}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          );
                        })}
                      </svg>
                      <div
                        className="relative z-10 grid h-full w-full"
                        style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }}
                      >
                        {Array.from({ length: pointCount }, (_, index) => {
                          const pathPosition = path.indexOf(index);
                          const isFirst = pathPosition === 0;
                          const isLast = pathPosition === path.length - 1;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => connectPoint(index)}
                              disabled={solved}
                              aria-label={`Bolinha ${index + 1}`}
                              aria-pressed={pathPosition >= 0}
                              className="flex aspect-square min-h-0 min-w-0 items-center justify-center rounded-full focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#ffc4c9] disabled:cursor-default"
                            >
                              <span
                                className={`block h-[58%] w-[58%] rounded-full border shadow-[0_2px_5px_rgba(0,0,0,.45)] transition ${pathPosition >= 0 ? "border-[#f8c6ca] bg-[#e7aeb4] shadow-[0_0_14px_rgba(255,196,201,.55)]" : "border-[#d9d5d1] bg-[#f2f0ed] hover:border-rose-200 hover:bg-rose-100"} ${isFirst ? "ring-2 ring-[#b69be8] ring-offset-1 ring-offset-[#191516]" : ""} ${isLast && path.length > 1 ? "scale-110" : ""}`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#aa9296]">
                      Clique ou toque nos pontos · vizinhos na horizontal/vertical
                    </p>
                  </div>
                  {feedback && (
                    <p
                      className={`mt-4 text-sm leading-relaxed ${solved ? "text-emerald-200" : "text-[#e2c0c4]"}`}
                      role="status"
                    >
                      {solved && (
                        <CheckCircle2 className="mr-2 inline-block align-text-bottom" size={17} />
                      )}
                      {feedback}
                    </p>
                  )}
                  {solved ? (
                    <div className="dot-connection-victory-notice mt-4 border border-[#d8bd6e] bg-[#d8bd6e]/10 p-4 text-[#f2d991]">
                      <strong className="font-display text-xl">
                        {levelIndex === DOT_LEVELS.length - 1
                          ? "Desafio completo"
                          : "Nível concluído"}
                      </strong>
                      <p className="mt-1 text-sm leading-relaxed text-[#d7c9a8]">
                        {levelIndex < DOT_LEVELS.length - 1
                          ? "Todas as bolinhas foram ligadas sem repetições. O próximo nível foi liberado."
                          : "Todas as três dificuldades foram concluídas. Nenhum ponto ficou de fora."}
                      </p>
                      {levelIndex < DOT_LEVELS.length - 1 && (
                        <button
                          type="button"
                          onClick={continueToNextLevel}
                          className="mt-4 min-h-10 border border-rose-300 px-4 py-2 font-mono text-xs uppercase tracking-wider text-rose-100 hover:bg-rose-300/15"
                        >
                          Continuar para {DOT_LEVELS[levelIndex + 1]!.label} →
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#aa9d89]">
                      Comece em qualquer bolinha. Selecione a bolinha anterior para desfazer o
                      último trecho; pontos já usados não podem ser visitados de novo.
                    </p>
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
