import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PainscreekSheriffTransferMinigame } from "@/game/PainscreekSheriffTransferMinigame";

afterEach(() => cleanup());

const answers = {
  "Até quando deveria apresentar-se?": "1998-05-12",
  "A partir de quando valeria a redesignação?": "1998-05-14",
  "Para onde foi redesignado?": "grand-county",
  "O que a carta permite concluir sobre o motivo?": "population-context",
};

function choose(label: string, value: string) {
  fireEvent.change(screen.getByRole("combobox", { name: label }), { target: { value } });
}

function fillCorrectFacts() {
  Object.entries(answers).forEach(([label, value]) => choose(label, value));
}

describe("Despacho do xerife", () => {
  it("aceita os fatos documentados e chama onSolved uma vez até reiniciar", () => {
    const onSolved = vi.fn();
    render(<PainscreekSheriffTransferMinigame onSolved={onSolved} />);
    fillCorrectFacts();

    fireEvent.click(screen.getByRole("button", { name: "Validar ficha" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      /não estabelece punição nem relação com Vivian/i,
    );
    expect(onSolved).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Ficha validada" }));
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it("rejeita uma inferência de punição sem apoio documental", () => {
    render(<PainscreekSheriffTransferMinigame />);
    fillCorrectFacts();
    choose("O que a carta permite concluir sobre o motivo?", "punishment");

    fireEvent.click(screen.getByRole("button", { name: "Validar ficha" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      /não afirma punição nem relaciona a transferência a Vivian/i,
    );
  });

  it.each([
    { label: "Até quando deveria apresentar-se?", value: "1998-05-14" },
    { label: "A partir de quando valeria a redesignação?", value: "1998-05-12" },
    { label: "Para onde foi redesignado?", value: "painscreek" },
    { label: "O que a carta permite concluir sobre o motivo?", value: "unexplained" },
  ])("rejeita dado incompatível no campo: $label", ({ label, value }) => {
    render(<PainscreekSheriffTransferMinigame />);
    fillCorrectFacts();
    choose(label, value);

    fireEvent.click(screen.getByRole("button", { name: "Validar ficha" }));
    expect(screen.getByRole("status")).toHaveTextContent(/A ficha não confere com a fonte/);
  });

  it("não valida a ficha enquanto houver campos sem resposta", () => {
    render(<PainscreekSheriffTransferMinigame />);
    choose("Até quando deveria apresentar-se?", answers["Até quando deveria apresentar-se?"]);
    choose(
      "A partir de quando valeria a redesignação?",
      answers["A partir de quando valeria a redesignação?"],
    );
    choose(
      "O que a carta permite concluir sobre o motivo?",
      answers["O que a carta permite concluir sobre o motivo?"],
    );

    fireEvent.click(screen.getByRole("button", { name: "Validar ficha" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Preencha os quatro campos/);
  });

  it("limpa a ficha e permite resolvê-la novamente após reiniciar", () => {
    const onSolved = vi.fn();
    render(<PainscreekSheriffTransferMinigame onSolved={onSolved} />);
    fillCorrectFacts();
    fireEvent.click(screen.getByRole("button", { name: "Validar ficha" }));
    expect(onSolved).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Até quando deveria apresentar-se?" })).toHaveValue(
      "",
    );
    fillCorrectFacts();
    fireEvent.click(screen.getByRole("button", { name: "Validar ficha" }));
    expect(onSolved).toHaveBeenCalledTimes(2);
  });
});
