import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianMurdleWitnessRoute } from "@/game/VivianMurdleWitnessRoute";

describe("puzzle de rota dos depoimentos", () => {
  afterEach(cleanup);

  it("rejeita a grade incompleta, conclui o nível 1 e libera o nível 2", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleWitnessRoute onSolved={onSolved} />);

    expect(
      screen.getByRole("region", { name: "Minigame de rota dos depoimentos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Scott não foi ouvido na igreja.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nível 2/ })).toBeDisabled();

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
    expect(onSolved).toHaveBeenCalledWith(1);
    expect(screen.getByRole("status")).toHaveTextContent("Nível 1 concluído");
  });

  it("resolve o nível 2 com as novas pistas e conexões", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleWitnessRoute completedLevel={1} onSolved={onSolved} />);

    fireEvent.click(screen.getByRole("button", { name: /Nível 2/ }));
    expect(
      screen.getByText("Scott não aparece no hospital nem associado à fotografia."),
    ).toBeInTheDocument();

    const correctPairs = [
      "Scott e Lago",
      "Scott e Fita",
      "Dorothy e Arquivo",
      "Dorothy e Recibo",
      "Wanda e Igreja",
      "Wanda e Carta",
      "Mary e Hospital",
      "Mary e Fotografia",
    ];
    for (const label of correctPairs) {
      const button = screen.getByRole("button", { name: label });
      fireEvent.click(button);
      fireEvent.click(button);
    }

    fireEvent.click(screen.getByRole("button", { name: "Conferir rota" }));
    expect(onSolved).toHaveBeenCalledWith(2);
    expect(screen.getByRole("status")).toHaveTextContent("Nível 2 concluído");
    expect(screen.getByText("Conferido")).toBeInTheDocument();
  });

  it("respeita o estado previamente concluído no nível 2", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleWitnessRoute completedLevel={2} onSolved={onSolved} />);

    expect(screen.getByText("Conferido")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nível 2/ })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Conferir rota" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar grade" })).toBeDisabled();
  });
});
