import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DotConnectionMinigame } from "@/game/DotConnectionMinigame";
import {
  createSnakePath,
  DOT_LEVELS,
  isSolvedDotPath,
  isValidDotPath,
} from "@/game/dotConnectionPuzzle";

describe("minigame Conexão de Pontos", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("fornece três grades progressivas com uma solução simples sem repetição", () => {
    expect(DOT_LEVELS.map(({ size }) => size)).toEqual([4, 5, 6]);
    for (const level of DOT_LEVELS) {
      const solution = createSnakePath(level.size);
      expect(isValidDotPath(solution, level.size)).toBe(true);
      expect(isSolvedDotPath(solution, level.size)).toBe(true);
      expect(new Set(solution).size).toBe(level.size * level.size);
    }
  });

  it("rejeita caminhos que saltam, repetem ou deixam pontos sem ligar", () => {
    expect(isValidDotPath([0, 1, 5], 4)).toBe(true);
    expect(isValidDotPath([0, 2], 4)).toBe(false);
    expect(isValidDotPath([0, 1, 0], 4)).toBe(false);
    expect(isSolvedDotPath([0, 1, 5], 4)).toBe(false);
  });

  it("liga cada bolinha uma vez e libera os níveis em sequência", () => {
    render(<DotConnectionMinigame />);
    fireEvent.click(screen.getByRole("button", { name: /Conexão de Pontos/ }));
    expect(
      screen.getByRole("dialog", { name: "Mini Game — Conexão de Pontos" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Iniciar desafio" }));

    expect(screen.getByText("Nível 1/3 · Pontos: 0/16")).toBeInTheDocument();
    const easyPath = createSnakePath(4);
    for (const point of easyPath) {
      fireEvent.click(screen.getByRole("button", { name: `Bolinha ${point + 1}` }));
    }

    expect(screen.getByRole("status")).toHaveTextContent("16 bolinhas foram conectadas uma vez");
    expect(screen.getByRole("group", { name: "Grade de 4 por 4 bolinhas" })).toHaveClass(
      "dot-connection-victory-board",
    );
    expect(screen.getByRole("button", { name: /Continuar para Médio/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Médio/ }));
    expect(screen.getByText("Nível 2/3 · Pontos: 0/25")).toBeInTheDocument();
  });

  it("impede saltos e retornos a pontos já usados no tabuleiro", () => {
    render(<DotConnectionMinigame />);
    fireEvent.click(screen.getByRole("button", { name: /Conexão de Pontos/ }));
    fireEvent.click(screen.getByRole("button", { name: "Iniciar desafio" }));
    fireEvent.click(screen.getByRole("button", { name: "Bolinha 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Bolinha 3" }));
    expect(screen.getByRole("status")).toHaveTextContent("Conecte uma bolinha vizinha");
    expect(screen.getByText("Nível 1/3 · Pontos: 1/16")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bolinha 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Bolinha 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Bolinha 1" }));
    expect(screen.getByRole("status")).toHaveTextContent("Essa bolinha já foi usada");
    expect(screen.getByText("Nível 1/3 · Pontos: 3/16")).toBeInTheDocument();
  });
});
