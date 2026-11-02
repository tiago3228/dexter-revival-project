import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianMurdleCipherDecoder } from "@/game/VivianMurdleCipherDecoder";
import { recordMinigameProgress } from "@/game/minigameProgress";

vi.mock("@/game/minigameProgress", () => ({ recordMinigameProgress: vi.fn() }));

describe("minigame do decodificador Murdle", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("rejeita a chave incorreta e decifra os três bilhetes básicos em sequência", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleCipherDecoder onSolved={onSolved} />);

    expect(
      screen.getByRole("region", { name: "Minigame do decodificador Murdle" }),
    ).toBeInTheDocument();
    expect(screen.getByText("D ILWD SDVVD SHOR ODJR")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Chave do anel" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Resposta do bilhete" }), {
      target: { value: "LAGO" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Decifrar bilhete" }));
    expect(onSolved).not.toHaveBeenCalled();
    expect(recordMinigameProgress).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("chave ou a resposta");

    const solveStage = (shift: string, answer: string) => {
      fireEvent.change(screen.getByRole("combobox", { name: "Chave do anel" }), {
        target: { value: shift },
      });
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

    expect(onSolved).toHaveBeenCalledWith(1);
    expect(recordMinigameProgress).toHaveBeenCalledWith("detective-ring", "level-1");
    expect(screen.getByText("Conferido")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Avançar para a cifra avançada" }),
    ).toBeInTheDocument();
  });

  it("libera o nível avançado e exige chaves dinâmicas e frases completas", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleCipherDecoder completedLevel={1} onSolved={onSolved} />);

    fireEvent.click(screen.getByRole("button", { name: /Nível 2 · Cifra avançada/ }));
    expect(screen.getByText("H MPAH MVP LZJVUKPKH UV SHNV")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Chave dinâmica do anel" })).toBeInTheDocument();

    const solveStage = (shift: string, answer: string) => {
      fireEvent.change(screen.getByRole("combobox", { name: "Chave dinâmica do anel" }), {
        target: { value: shift },
      });
      fireEvent.change(screen.getByRole("textbox", { name: "Frase completa do bilhete" }), {
        target: { value: answer },
      });
      fireEvent.click(screen.getByRole("button", { name: "Decifrar bilhete" }));
    };

    solveStage("7", "A FITA FOI ESCONDIDA NO LAGO");
    expect(screen.getByText("L NLCEL OPGP GZWELC LZ LCBFTGZ")).toBeInTheDocument();
    solveStage("11", "A CARTA DEVE VOLTAR AO ARQUIVO");
    expect(screen.getByText("E JSXSKVEJME WIKYI TEVE S LSWTMXEP")).toBeInTheDocument();
    solveStage("4", "A FOTOGRAFIA SEGUE PARA O HOSPITAL");

    expect(onSolved).toHaveBeenCalledWith(2);
    expect(recordMinigameProgress).toHaveBeenCalledWith("detective-ring", "level-2");
    expect(screen.getByRole("status")).toHaveTextContent("Código completo");
  });

  it("respeita um puzzle previamente concluído no nível avançado", () => {
    const onSolved = vi.fn();
    render(<VivianMurdleCipherDecoder completedLevel={2} onSolved={onSolved} />);

    expect(screen.getByText("Conferido")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Decifrar bilhete" })).not.toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();
    expect(recordMinigameProgress).not.toHaveBeenCalled();
  });
});
