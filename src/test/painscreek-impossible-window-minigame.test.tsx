import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PainscreekImpossibleWindowMinigame } from "@/game/PainscreekImpossibleWindowMinigame";

afterEach(() => cleanup());

function answer(label: string) {
  fireEvent.click(screen.getByLabelText(label));
  fireEvent.click(screen.getByRole("button", { name: "Conferir etapa" }));
}

const chronologyAnswer =
  "Não. P-015 já noticia em 07/06/1995 que Andrew foi encontrado morto; a anotação de 19/06 não apaga esse registro.";
const carefulConclusion =
  "Há tensão se 19/06 for lido como data do evento, mas os documentos não esclarecem a que se refere a anotação; não determinam a causa nem identificam culpado, mentira ou falsificação.";

describe("Janela impossível — Andrew", () => {
  it("resolve as duas etapas e chama onSolved uma única vez até reiniciar", () => {
    const onSolved = vi.fn();
    render(<PainscreekImpossibleWindowMinigame onSolved={onSolved} />);

    expect(screen.getByRole("heading", { name: "Janela impossível — Andrew" })).toBeInTheDocument();
    answer(chronologyAnswer);
    expect(
      screen.getByText(/P-015 registra a descoberta em notícia de 07\/06/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Etapa 2 de 2/)).toBeInTheDocument();

    answer(carefulConclusion);
    expect(screen.getByRole("status")).toHaveTextContent("Exercício concluído");
    expect(onSolved).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Conferir etapa" })).not.toBeInTheDocument();
    expect(screen.getByText(/P-015, notícia de 07\/06\/1995, p\. 87/)).toBeInTheDocument();
  });

  it("rejeita a leitura literal de que Andrew só foi encontrado em 19/06", () => {
    render(<PainscreekImpossibleWindowMinigame />);

    answer("Sim. Andrew só foi encontrado morto em 19/06/1995.");

    expect(screen.getByRole("status")).toHaveTextContent(/P-015, p\. 87/);
    expect(screen.getByText(/Etapa 1 de 2/)).toBeInTheDocument();
    expect(screen.queryByText(/Etapa 2 de 2/)).not.toBeInTheDocument();
  });

  it.each([
    "Alguém mentiu ou falsificou um dos documentos.",
    "O incêndio foi homicídio, e um culpado pode ser identificado por essa divergência.",
  ])("rejeita inferência não sustentada: %s", (unsupportedAnswer) => {
    render(<PainscreekImpossibleWindowMinigame />);
    answer(chronologyAnswer);

    answer(unsupportedAnswer);

    expect(screen.getByRole("status")).toHaveTextContent(
      /não basta para escolher entre explicações/,
    );
    expect(screen.getByText(/Etapa 2 de 2/)).toBeInTheDocument();
  });

  it("reinicia a etapa, seleção e feedback para permitir nova solução", () => {
    const onSolved = vi.fn();
    render(<PainscreekImpossibleWindowMinigame onSolved={onSolved} />);
    answer("Sim. A data da anotação prova que a notícia de 07/06 está errada.");
    expect(screen.getByRole("status")).toHaveTextContent(/P-015, p\. 87/);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.getByText(/Etapa 1 de 2/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    answer(chronologyAnswer);
    answer(carefulConclusion);
    expect(onSolved).toHaveBeenCalledTimes(1);
  });
});
