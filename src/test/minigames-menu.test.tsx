import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CircuitPanelMinigame,
  getEnergized,
  getMasks,
  isSolved,
  LEVELS,
  rotateMask,
} from "@/game/CircuitPanelMinigame";
import { MinigamesMenu } from "@/game/MinigamesMenu";

describe("menu de minigames", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("apresenta os minigames globais e os exercícios que também vivem dentro do caso", () => {
    render(<MinigamesMenu />);

    expect(screen.getByRole("region", { name: "Menu de minigames" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mini Game de Bandeiras" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Painel Elétrico" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Conexão de Pontos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Código do Lacre" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grade de Dedução" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dossiê de relações" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A rota da fita" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O anel do detetive" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Depoimentos e casos curtos" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Murdle de Painscreek" })).toHaveLength(2);
    expect(screen.getAllByRole("heading", { name: "Cadeia de Evidência" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Mini Game de Bandeiras/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Painel Elétrico/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Conexão de Pontos/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Código do Lacre/ })).toBeInTheDocument();
  });

  it("mantém um caminho-base válido e reversível para qualquer embaralhamento", () => {
    const rotations = [0, 1, 2, 3, 1, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3];
    const inverseRotations = rotations.map((rotation) => (4 - rotation) % 4);

    expect(isSolved(getMasks(Array.from({ length: 16 }, () => 0)))).toBe(true);
    const scrambled = getMasks(rotations);
    const restored = scrambled.map((mask, index) => rotateMask(mask, inverseRotations[index]!));
    expect(isSolved(restored)).toBe(true);
  });

  it("usa três redes distintas e cada solução alimenta todos os alvos sem cobrir a grade", () => {
    expect(LEVELS.map(({ layout }) => layout)).toEqual(["horizontal", "vertical", "spiral"]);
    expect(new Set(LEVELS.map(({ layout }) => layout)).size).toBe(3);
    expect(LEVELS.map(({ size }) => size)).toEqual([4, 5, 6]);
    expect(LEVELS.map(({ targetIndices }) => targetIndices.length)).toEqual([3, 3, 4]);
    expect(new Set(LEVELS.map(({ sourceIndex }) => sourceIndex)).size).toBe(3);
    expect(new Set(LEVELS.map(({ targetIndices }) => targetIndices.join(","))).size).toBe(3);

    const signatures = LEVELS.map(({ solution }) =>
      solution.map(({ north, east, south, west }) => `${+north}${+east}${+south}${+west}`).join(""),
    );
    expect(new Set(signatures).size).toBe(3);
    expect(LEVELS.map(({ sourceIndex }) => sourceIndex)).toEqual([0, 2, 5]);

    for (const [levelIndex, level] of LEVELS.entries()) {
      const { size, solution, sourceIndex, targetIndices } = level;
      expect(solution).toHaveLength(size * size);
      expect(
        isSolved(getMasks(Array(size * size).fill(0), solution), sourceIndex, targetIndices),
      ).toBe(true);
      const energized = getEnergized(solution, sourceIndex);
      expect(targetIndices.every((target) => energized.has(target))).toBe(true);
      expect(energized.size).toBeLessThan(size * size);

      let connectorCount = 0;
      const degrees = solution.map((mask, index) => {
        const row = Math.floor(index / size);
        const column = index % size;
        let degree = 0;
        const neighbors = [
          { direction: "north" as const, row: row - 1, column },
          { direction: "east" as const, row, column: column + 1 },
          { direction: "south" as const, row: row + 1, column },
          { direction: "west" as const, row, column: column - 1 },
        ];
        for (const { direction, row: nextRow, column: nextColumn } of neighbors) {
          if (!mask[direction]) continue;
          connectorCount += 1;
          degree += 1;
          expect(nextRow).toBeGreaterThanOrEqual(0);
          expect(nextRow).toBeLessThan(size);
          expect(nextColumn).toBeGreaterThanOrEqual(0);
          expect(nextColumn).toBeLessThan(size);
          const nextIndex = nextRow * size + nextColumn;
          const opposite = {
            north: "south",
            east: "west",
            south: "north",
            west: "east",
          } as const;
          expect(solution[nextIndex]![opposite[direction]]).toBe(true);
        }
        return degree;
      });
      expect(connectorCount).toBeGreaterThan(0);
      expect(degrees.some((degree) => degree === 0)).toBe(true);
      if (levelIndex > 0) expect(degrees.some((degree) => degree === 3)).toBe(true);
    }
  });

  it("não vence se um alvo ficar isolado, nem se houver conector incompatível ou para fora", () => {
    const level = LEVELS[0]!;
    const solved = level.solution.map((mask) => ({ ...mask }));
    expect(isSolved(solved, level.sourceIndex, level.targetIndices)).toBe(true);

    const missingTarget = solved.map((mask) => ({ ...mask }));
    missingTarget[5]!.west = false;
    missingTarget[6]!.east = false;
    expect(isSolved(missingTarget, level.sourceIndex, level.targetIndices)).toBe(false);

    const incompatible = solved.map((mask) => ({ ...mask }));
    incompatible[4]!.east = true;
    expect(isSolved(incompatible, level.sourceIndex, level.targetIndices)).toBe(false);

    const openOutside = solved.map((mask) => ({ ...mask }));
    openOutside[0]!.north = true;
    expect(isSolved(openOutside, level.sourceIndex, level.targetIndices)).toBe(false);
  });

  it("abre o painel, inicia a análise e gira conectores com feedback de movimentos", () => {
    render(<CircuitPanelMinigame />);

    fireEvent.click(screen.getByRole("button", { name: /Painel Elétrico/ }));
    expect(screen.getByRole("dialog", { name: "Mini Game — Painel Elétrico" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Analisar painel" }));

    const connectors = screen.getAllByRole("button", { name: /Girar (fonte|alvo|peça)/ });
    expect(connectors).toHaveLength(16);
    expect(screen.getByText("Giros: 0")).toBeInTheDocument();

    fireEvent.click(connectors[0]!);
    expect(screen.getByText("Giros: 1")).toBeInTheDocument();
  });
});
