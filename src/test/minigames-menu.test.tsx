import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CircuitPanelMinigame,
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

  it("apresenta os quatro minigames no mesmo menu", () => {
    render(<MinigamesMenu />);

    expect(screen.getByRole("region", { name: "Menu de minigames" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mini Game de Bandeiras" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Painel Elétrico" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Conexão de Pontos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Código do Lacre" })).toBeInTheDocument();
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
    for (const level of LEVELS) {
      expect(
        isSolved(
          getMasks(
            Array.from({ length: level.size * level.size }, () => 0),
            level.solution,
          ),
        ),
      ).toBe(true);
    }
  });

  it("abre o painel, inicia a análise e gira conectores com feedback de movimentos", () => {
    render(<CircuitPanelMinigame />);

    fireEvent.click(screen.getByRole("button", { name: /Painel Elétrico/ }));
    expect(screen.getByRole("dialog", { name: "Mini Game — Painel Elétrico" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Analisar painel" }));

    const connectors = screen.getAllByRole("button", { name: /Girar conector/ });
    expect(connectors).toHaveLength(16);
    expect(screen.getByText("Giros: 0")).toBeInTheDocument();

    fireEvent.click(connectors[0]!);
    expect(screen.getByText("Giros: 1")).toBeInTheDocument();
  });
});
