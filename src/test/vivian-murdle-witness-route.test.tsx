import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianMurdleWitnessRoute } from "@/game/VivianMurdleWitnessRoute";

describe("puzzle de rota dos depoimentos", () => {
  afterEach(cleanup);

  it("apresenta as pistas, rejeita a grade incompleta e conclui a rota correta", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleWitnessRoute onSolved={onSolved} />);

    expect(
      screen.getByRole("region", { name: "Minigame de rota dos depoimentos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Scott não foi ouvido na igreja.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Conferir rota" }));
    expect(onSolved).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("ainda não fecha");

    const correctPairs = [
      "Scott e Cais",
      "Scott e Fita",
      "Dorothy e Arquivo",
      "Dorothy e Recibo",
      "Wanda e Igreja",
      "Wanda e Carta",
    ];
    for (const label of correctPairs) {
      const button = screen.getByRole("button", { name: label });
      fireEvent.click(button);
      fireEvent.click(button);
    }

    fireEvent.click(screen.getByRole("button", { name: "Conferir rota" }));
    expect(onSolved).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Rota reconstruída");
    expect(screen.getByText("Conferido")).toBeInTheDocument();
  });

  it("respeita o estado previamente resolvido", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleWitnessRoute solved onSolved={onSolved} />);

    expect(screen.getByText("Conferido")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Conferir rota" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar grade" })).toBeDisabled();
  });
});
