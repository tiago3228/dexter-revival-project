import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PainscreekEvidenceChainMinigame } from "@/game/PainscreekEvidenceChainMinigame";
import { PainscreekMurdleGrid } from "@/game/PainscreekMurdleGrid";

afterEach(() => cleanup());

describe("minigames de Painscreek", () => {
  it("resolve a grade Murdle apenas com as seis associações corretas", () => {
    const onSolved = vi.fn();
    render(<PainscreekMurdleGrid onSolved={onSolved} />);

    fireEvent.change(screen.getByLabelText("Fonte de Scott"), { target: { value: "Diário" } });
    fireEvent.change(screen.getByLabelText("Local de Scott"), { target: { value: "Mansão" } });
    fireEvent.change(screen.getByLabelText("Fonte de Henry"), {
      target: { value: "Relatório policial" },
    });
    fireEvent.change(screen.getByLabelText("Local de Henry"), { target: { value: "Lago" } });
    fireEvent.change(screen.getByLabelText("Fonte de Dorothy"), { target: { value: "Carta" } });
    fireEvent.change(screen.getByLabelText("Local de Dorothy"), { target: { value: "Hospital" } });

    fireEvent.click(screen.getByRole("button", { name: "Conferir grade" }));

    expect(screen.getByText(/Grade fechada/)).toBeInTheDocument();
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it("recusa uma cadeia incompleta ou com camadas trocadas", () => {
    const onSolved = vi.fn();
    render(<PainscreekEvidenceChainMinigame onSolved={onSolved} />);

    const selects = screen.getAllByRole("combobox");
    selects.forEach((select, index) => {
      fireEvent.change(select, {
        target: {
          value: [
            "observation-lake",
            "source-p008",
            "hypothesis-funds",
            "comparison-p007",
            "conclusion-open",
          ][index],
        },
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Conferir cadeia" }));

    expect(screen.getByText(/A cadeia não fecha/)).toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();
  });

  it("confere a sequência fonte, observação, hipótese, confronto e conclusão aberta", () => {
    const onSolved = vi.fn();
    render(<PainscreekEvidenceChainMinigame onSolved={onSolved} />);

    const values = [
      "source-p008",
      "observation-lake",
      "hypothesis-funds",
      "comparison-p007",
      "conclusion-open",
    ];
    screen.getAllByRole("combobox").forEach((select, index) => {
      fireEvent.change(select, { target: { value: values[index] } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Conferir cadeia" }));

    expect(screen.getByText(/Cadeia rastreável/)).toBeInTheDocument();
    expect(onSolved).toHaveBeenCalledTimes(1);
  });
});
