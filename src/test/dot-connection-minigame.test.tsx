import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DotConnectionMinigame } from "@/game/DotConnectionMinigame";
import { MINIGAME_PROGRESS_EVENT, MINIGAME_PROGRESS_STORAGE_KEY } from "@/game/minigameProgress";
import {
  createDotLevelBasePath,
  createSnakePath,
  DOT_LEVELS,
  isSolvedDotLevelPath,
  isSolvedDotPath,
  isValidDotPath,
} from "@/game/dotConnectionPuzzle";

const { playVictory } = vi.hoisted(() => ({ playVictory: vi.fn() }));
vi.mock("@/game/minigameVictoryEffects", () => ({
  playMinigameVictorySound: playVictory,
}));

function clickPoint(point: number) {
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(`Bolinha ${point + 1}(?: |$| —)`) }),
  );
}

function startGame() {
  render(<DotConnectionMinigame />);
  fireEvent.click(screen.getByRole("button", { name: /Conexão de Pontos/ }));
  fireEvent.click(screen.getByRole("button", { name: "Iniciar desafio" }));
}

function expectProgress(text: string) {
  expect(
    screen.getByText((_, element) =>
      Boolean(
        element?.classList.contains("font-mono") &&
        element.textContent?.replace(/\s+/g, " ").includes(text),
      ),
    ),
  ).toBeInTheDocument();
}

function solveLevel(levelIndex: number) {
  for (const point of createDotLevelBasePath(DOT_LEVELS[levelIndex]!)) clickPoint(point);
}

describe("minigame Conexão de Pontos", () => {
  beforeEach(() => {
    window.localStorage.clear();
    playVictory.mockClear();
    window.localStorage.removeItem(MINIGAME_PROGRESS_STORAGE_KEY);
  });
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("define quatro trajetos-base válidos, distintos e com objetivos próprios", () => {
    expect(DOT_LEVELS.map(({ size }) => size)).toEqual([4, 5, 6, 7]);
    expect(DOT_LEVELS.map(({ checkpoints }) => checkpoints.length)).toEqual([2, 3, 4, 5]);
    expect(DOT_LEVELS.map(({ pattern }) => pattern)).toEqual([
      "Serpentina horizontal",
      "Espiral horária",
      "Espiral anti-horária reversa",
      "Labirinto de recuos",
    ]);

    const paths = DOT_LEVELS.map((level) => createDotLevelBasePath(level));
    for (const [index, level] of DOT_LEVELS.entries()) {
      const solution = paths[index]!;
      expect(solution).toHaveLength(level.size * level.size);
      expect(new Set(solution).size).toBe(level.size * level.size);
      expect(isValidDotPath(solution, level.size, level.blockedEdges)).toBe(true);
      expect(isSolvedDotPath(solution, level.size, level.blockedEdges)).toBe(true);
      expect(isSolvedDotLevelPath(solution, level)).toBe(true);
      expect(solution[0]).toBe(level.start);
      expect(solution.at(-1)).toBe(level.end);
      expect(level.checkpoints.every((point) => solution.includes(point))).toBe(true);
      expect(level.checkpoints.map((point) => solution.indexOf(point))).toEqual(
        [...level.checkpoints]
          .map((point) => solution.indexOf(point))
          .sort((first, second) => first - second),
      );
    }
    expect(new Set(paths.map((path) => path.join(","))).size).toBe(4);
    expect(paths[0]).toEqual(createSnakePath(4));
    expect(paths[1]).not.toEqual(createSnakePath(5));
    expect(paths[2]).not.toEqual(createSnakePath(6));
    expect(paths[3]).not.toEqual(createSnakePath(7));
    expect(DOT_LEVELS.map(({ start, end }) => [start, end])).toEqual([
      [0, 12],
      [0, 12],
      [20, 0],
      [0, 28],
    ]);
    expect(DOT_LEVELS[3]!.blockedEdges).toHaveLength(11);
  });

  it("rejeita saltos, paredes, pontos repetidos e caminhos incompletos", () => {
    const advanced = DOT_LEVELS[3]!;
    expect(isValidDotPath([0, 1, 5], 4)).toBe(true);
    expect(isValidDotPath([0, 2], 4)).toBe(false);
    expect(isValidDotPath([0, 1, 0], 4)).toBe(false);
    expect(isSolvedDotPath([0, 1, 5], 4)).toBe(false);
    expect(isSolvedDotLevelPath([0, 1, 5], DOT_LEVELS[0]!)).toBe(false);
    expect(isValidDotPath([0, 7], advanced.size, advanced.blockedEdges)).toBe(false);
    expect(isSolvedDotLevelPath(advanced.basePath, advanced)).toBe(true);
  });

  it("rejeita início incorreto, checkpoint fora de ordem e fim antecipado com mensagens claras", () => {
    startGame();
    clickPoint(1);
    expect(screen.getByRole("status")).toHaveTextContent("Início incorreto");
    expect(
      JSON.parse(window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY) ?? "{}")?.completed?.[
        "dot-connection"
      ] ?? [],
    ).toEqual([]);
    expectProgress("Pontos: 0/16");

    clickPoint(0);
    for (const point of [1, 2, 3, 7, 11]) clickPoint(point);
    clickPoint(10);
    expect(screen.getByRole("status")).toHaveTextContent("Checkpoint fora de ordem");
    expectProgress("Checkpoints: 0/2");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    for (const point of [0, 1, 2, 3, 7, 6, 5, 9, 10, 11, 15, 14, 13]) clickPoint(point);
    clickPoint(12);
    expect(screen.getByRole("status")).toHaveTextContent("Fim antecipado");
    expectProgress("Pontos: 13/16");
  });

  it("rejeita uma tentativa de terminar em ponto incorreto", () => {
    startGame();
    for (const point of createDotLevelBasePath(DOT_LEVELS[0]!).slice(0, -1)) clickPoint(point);
    clickPoint(0);
    expect(screen.getByRole("status")).toHaveTextContent("Ponto final incorreto");
    expectProgress("Pontos: 15/16");
    expect(screen.queryByRole("button", { name: /Continuar para Médio/ })).not.toBeInTheDocument();
  });

  it("mostra marcadores de objetivo e desfazer/limpar preservam o fluxo", () => {
    startGame();
    expect(screen.getByRole("button", { name: "Bolinha 1 — Início" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bolinha 7 — Checkpoint 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bolinha 13 — Fim" })).toBeInTheDocument();

    clickPoint(0);
    clickPoint(1);
    fireEvent.click(screen.getByRole("button", { name: "Desfazer" }));
    expectProgress("Pontos: 1/16");
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expectProgress("Pontos: 0/16");
  });

  it("bloqueia uma passagem do labirinto avançado na interação", () => {
    window.localStorage.setItem("dexter-dot-connection-unlocked-v1", "3");
    startGame();
    expect(screen.getByRole("group", { name: "Grade de 7 por 7 bolinhas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bolinha 1 — Início" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bolinha 4 — Checkpoint 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bolinha 29 — Fim" })).toBeInTheDocument();
    clickPoint(0);
    clickPoint(7);
    expect(screen.getByRole("status")).toHaveTextContent("Trecho bloqueado por uma parede");
    expectProgress("Pontos: 1/49");
  });

  it("desbloqueia em sequência até o avançado e celebra a conclusão com som e trajeto animado", () => {
    render(<DotConnectionMinigame />);
    fireEvent.click(screen.getByRole("button", { name: /Conexão de Pontos/ }));
    expect(screen.getByRole("button", { name: /Avançado · Labirinto/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Iniciar desafio" }));

    expectProgress("Pontos: 0/16");
    solveLevel(0);
    expect(screen.getByRole("status")).toHaveTextContent(
      "16 pontos, início e fim corretos e 2 checkpoints na ordem",
    );
    expect(screen.getByRole("group", { name: "Grade de 4 por 4 bolinhas" })).toHaveClass(
      "dot-connection-victory-board",
    );
    expect(screen.getByRole("button", { name: /Continuar para Médio/ })).toBeInTheDocument();
    expect(playVictory).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Médio/ }));
    expectProgress("Nível 2/4 · Espiral horária · Pontos: 0/25");

    solveLevel(1);
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Difícil/ }));
    expectProgress("Nível 3/4 · Espiral anti-horária reversa · Pontos: 0/36");

    solveLevel(2);
    expect(window.localStorage.getItem("dexter-dot-connection-unlocked-v1")).toBe("3");
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Avançado/ }));
    expectProgress("Nível 4/4 · Labirinto de recuos · Pontos: 0/49");
    solveLevel(3);

    expect(screen.getByRole("status")).toHaveTextContent("49 pontos");
    expect(screen.getByRole("group", { name: "Grade de 7 por 7 bolinhas" })).toHaveClass(
      "dot-connection-victory-board",
    );
    expect(document.querySelectorAll(".dot-connection-reveal-line")).toHaveLength(48);
    expect(screen.getByText(/Todas as quatro dificuldades foram concluídas/)).toBeInTheDocument();
    expect(playVictory).toHaveBeenCalledTimes(4);
    const progress = JSON.parse(window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY)!);
    expect(progress.completed["dot-connection"]).toEqual([
      "level-1",
      "level-2",
      "level-3",
      "level-4",
    ]);
    expect(progress.completed["dot-connection"]).toHaveLength(4);
    expect(MINIGAME_PROGRESS_EVENT).toBe("dexter-minigame-progress");
  }, 30_000);
});
