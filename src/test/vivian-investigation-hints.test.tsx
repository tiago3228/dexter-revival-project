import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { VivianInvestigationGame } from "@/game/VivianInvestigationGame";

describe("Vivian investigation hints", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  const renderGame = () => render(<VivianInvestigationGame onBack={() => {}} />);

  it.each([
    { level: 1, cost: 20 },
    { level: 2, cost: 50 },
    { level: 3, cost: 100 },
  ])(
    "warns about the $cost-point penalty for level $level before opening it",
    ({ level, cost }) => {
      renderGame();

      fireEvent.click(screen.getAllByRole("button", { name: `Dica ${level} (-${cost})` })[0]!);

      const dialog = screen.getByRole("alertdialog", { name: "Deseja continuar?" });
      expect(dialog).toHaveTextContent("último recurso");
      expect(dialog).toHaveTextContent(`-${cost} pontos`);
      expect(screen.getByText("0 dicas usadas · -0 pts")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /não, voltar/i }));

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(screen.getByText("0 dicas usadas · -0 pts")).toBeInTheDocument();
    },
  );

  it("applies the penalty only after confirmation and disables the used hint", () => {
    renderGame();

    fireEvent.click(screen.getAllByRole("button", { name: "Dica 1 (-20)" })[0]!);
    fireEvent.click(screen.getByRole("button", { name: /sim, abrir dica/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText("1 dicas usadas · -20 pts")).toBeInTheDocument();
    expect(screen.getByText("980", { exact: true })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Dica 1 usada" })[0]).toBeDisabled();
  });
});
