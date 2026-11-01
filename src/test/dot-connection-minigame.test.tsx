import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DotConnectionMinigame } from "@/game/DotConnectionMinigame";
import {
  createDotLevelBasePath,
  createSnakePath,
  DOT_LEVELS,
  isSolvedDotLevelPath,
  isSolvedDotPath,
  isValidDotPath,
} from "@/game/dotConnectionPuzzle";

function clickPoint(point: number) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`Bolinha ${point + 1}(?: |$)`) }));
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

describe("minigame Conexão de Pontos", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("define três trajetos-base válidos, distintos e com objetivos próprios", () => {
    expect(DOT_LEVELS.map(({ size }) => size)).toEqual([4, 5, 6]);
    expect(DOT_LEVELS.map(({ checkpoints }) => checkpoints.length)).toEqual([2, 3, 4]);
    expect(DOT_LEVELS.map(({ pattern }) => pattern)).toEqual([
      "Serpentina horizontal",
      "Espiral horária",
      "Espiral anti-horária reversa",
    ]);

    const paths = DOT_LEVELS.map((level) => createDotLevelBasePath(level));
    for (const [index, level] of DOT_LEVELS.entries()) {
      const solution = paths[index]!;
      expect(solution).toHaveLength(level.size * level.size);
      expect(new Set(solution).size).toBe(level.size * level.size);
      expect(isValidDotPath(solution, level.size)).toBe(true);
      expect(isSolvedDotPath(solution, level.size)).toBe(true);
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
    expect(new Set(paths.map((path) => path.join(","))).size).toBe(3);
    expect(paths[0]).toEqual(createSnakePath(4));
    expect(paths[1]).not.toEqual(createSnakePath(5));
    expect(paths[2]).not.toEqual(createSnakePath(6));
    expect(DOT_LEVELS.map(({ start, end }) => [start, end])).toEqual([
      [0, 12],
      [0, 12],
      [20, 0],
    ]);
  });

  it("rejeita caminhos que saltam, repetem ou deixam pontos sem ligar", () => {
    expect(isValidDotPath([0, 1, 5], 4)).toBe(true);
    expect(isValidDotPath([0, 2], 4)).toBe(false);
    expect(isValidDotPath([0, 1, 0], 4)).toBe(false);
    expect(isSolvedDotPath([0, 1, 5], 4)).toBe(false);
    expect(isSolvedDotLevelPath([0, 1, 5], DOT_LEVELS[0]!)).toBe(false);
  });

  it("rejeita início incorreto, checkpoint fora de ordem e fim antecipado com mensagens claras", () => {
    startGame();
    clickPoint(1);
    expect(screen.getByRole("status")).toHaveTextContent("Início incorreto");
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

  it("mostra os marcadores do objetivo e desfazer/limpar preservam o fluxo", () => {
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

  it("resolve o padrão base e libera os níveis em sequência", () => {
    startGame();
    expectProgress("Pontos: 0/16");
    for (const point of createDotLevelBasePath(DOT_LEVELS[0]!)) clickPoint(point);

    expect(screen.getByRole("status")).toHaveTextContent(
      "16 pontos, início e fim corretos e 2 checkpoints na ordem",
    );
    expect(screen.getByRole("group", { name: "Grade de 4 por 4 bolinhas" })).toHaveClass(
      "dot-connection-victory-board",
    );
    expect(screen.getByRole("button", { name: /Continuar para Médio/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Médio/ }));
    expectProgress("Nível 2/3 · Espiral horária · Pontos: 0/25");
  });
});
