import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CircuitPanelMinigame } from "@/game/CircuitPanelMinigame";
import { MinigamesMenu } from "@/game/MinigamesMenu";

describe("menu de minigames", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("apresenta os dois minigames no mesmo menu", () => {
    render(<MinigamesMenu />);

    expect(screen.getByRole("region", { name: "Menu de minigames" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mini Game de Bandeiras" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Painel Elétrico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mini Game de Bandeiras/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Painel Elétrico/ })).toBeInTheDocument();
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
