import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianMurdleCipherDecoder } from "@/game/VivianMurdleCipherDecoder";

describe("minigame do decodificador Murdle", () => {
  afterEach(cleanup);

  it("rejeita a chave incorreta e decifra as três mensagens em sequência", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleCipherDecoder onSolved={onSolved} />);

    expect(
      screen.getByRole("region", { name: "Minigame do decodificador Murdle" }),
    ).toBeInTheDocument();
    expect(screen.getByText("D ILWD SDVVD SHOR ODJR")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chave 1" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Resposta do bilhete" }), {
      target: { value: "LAGO" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Decifrar bilhete" }));
    expect(onSolved).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("chave ou a palavra");

    const solveStage = (shift: string, answer: string) => {
      fireEvent.click(screen.getByRole("button", { name: `Chave ${shift}` }));
      fireEvent.change(screen.getByRole("textbox", { name: "Resposta do bilhete" }), {
        target: { value: answer },
      });
      fireEvent.click(screen.getByRole("button", { name: "Decifrar bilhete" }));
    };

    solveStage("3", "LAGO");
    expect(screen.getByText("F HFWYF KNHF ST FWVZNAT")).toBeInTheDocument();
    solveStage("5", "ARQUIVO");
    expect(screen.getByText("C HQVQ UGIWG RCTC Q JQURKVCN")).toBeInTheDocument();
    solveStage("2", "HOSPITAL");

    expect(onSolved).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Conferido")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Código completo");
  });

  it("respeita um puzzle previamente concluído", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleCipherDecoder solved onSolved={onSolved} />);

    expect(screen.getByText("Conferido")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Decifrar bilhete" })).not.toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();
  });
});
