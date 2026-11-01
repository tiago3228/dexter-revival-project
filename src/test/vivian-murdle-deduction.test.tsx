import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianMurdleDeduction } from "@/game/VivianMurdleDeduction";

describe("minigame de dedução estilo Murdle", () => {
  afterEach(cleanup);

  it("apresenta as duas grades e só conclui a combinação completa", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleDeduction onSolved={onSolved} />);

    expect(screen.getByRole("region", { name: "Minigame de dedução Murdle" })).toBeInTheDocument();
    expect(screen.getByText("Scott não estava na mansão.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scott e Cabana" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scott e Fotografia" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Conferir dedução" }));
    expect(onSolved).not.toHaveBeenCalled();

    const correctPairs = [
      "Scott e Cabana",
      "Scott e Fotografia",
      "Trisha e Mansão",
      "Trisha e Carta",
      "Dorothy e Hospital",
      "Dorothy e Código",
    ];
    for (const label of correctPairs) {
      const button = screen.getByRole("button", { name: label });
      fireEvent.click(button);
      fireEvent.click(button);
    }

    fireEvent.click(screen.getByRole("button", { name: "Conferir dedução" }));
    expect(onSolved).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Dedução completa");
  });
});
