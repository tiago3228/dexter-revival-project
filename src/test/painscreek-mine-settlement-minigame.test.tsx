import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PainscreekMineSettlementMinigame } from "@/game/PainscreekMineSettlementMinigame";
import * as minigameProgress from "@/game/minigameProgress";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function answer(label: string) {
  fireEvent.click(screen.getByLabelText(label));
  fireEvent.click(screen.getByRole("button", { name: "Conferir etapa" }));
}

describe("Fechamento de contas: a mina", () => {
  it("resolve as três etapas e chama onSolved uma única vez até reiniciar", () => {
    const onSolved = vi.fn();
    const recordProgress = vi.spyOn(minigameProgress, "recordMinigameProgress");
    render(<PainscreekMineSettlementMinigame onSolved={onSolved} />);

    expect(
      screen.getByRole("heading", { name: "Fechamento de contas: a mina" }),
    ).toBeInTheDocument();
    answer("19 trabalhadores (6 + 13)");
    expect(screen.getByText(/6 \+ 13 = 19/)).toBeInTheDocument();

    answer("US$ 120.000 (US$ 96.000 + US$ 24.000)");
    expect(screen.getByText(/US\$ 96\.000 \+ US\$ 24\.000 = US\$ 120\.000/)).toBeInTheDocument();

    answer("Informa somente um total agregado; não especifica a distribuição entre as famílias.");
    expect(screen.getByRole("status")).toHaveTextContent("Exercício concluído");
    expect(onSolved).toHaveBeenCalledTimes(1);
    expect(recordProgress).toHaveBeenCalledWith("mine-settlement", "solved");
    expect(screen.queryByRole("button", { name: "Conferir etapa" })).not.toBeInTheDocument();
  });

  it("rejeita a alternativa que presume divisão igual sem apoio no texto", () => {
    const onSolved = vi.fn();
    const recordProgress = vi.spyOn(minigameProgress, "recordMinigameProgress");
    render(<PainscreekMineSettlementMinigame onSolved={onSolved} />);
    answer("19 trabalhadores (6 + 13)");
    answer("US$ 120.000 (US$ 96.000 + US$ 24.000)");

    fireEvent.click(screen.getByLabelText("Cada família recebeu US$ 20.000, em partes iguais."));
    fireEvent.click(screen.getByRole("button", { name: "Conferir etapa" }));

    expect(screen.getByRole("status")).toHaveTextContent(/não descreve valores individuais/);
    expect(onSolved).not.toHaveBeenCalled();
    expect(recordProgress).not.toHaveBeenCalled();
    expect(screen.getByText(/Etapa 3 de 3/)).toBeInTheDocument();
  });

  it("mantém a etapa aberta após contagem ou soma incorreta e avança quando corrigida", () => {
    render(<PainscreekMineSettlementMinigame />);

    answer("13 trabalhadores; esse é o total informado");
    expect(screen.getByRole("status")).toHaveTextContent(/Revise os dois grupos/);
    expect(screen.getByText(/Etapa 1 de 3/)).toBeInTheDocument();
    answer("19 trabalhadores (6 + 13)");
    expect(screen.getByText(/Etapa 2 de 3/)).toBeInTheDocument();

    answer("US$ 24.000; usando apenas a contribuição");
    expect(screen.getByRole("status")).toHaveTextContent(/Compare o total agregado/);
    expect(screen.getByText(/Etapa 2 de 3/)).toBeInTheDocument();
    answer("US$ 120.000 (US$ 96.000 + US$ 24.000)");
    expect(screen.getByText(/Etapa 3 de 3/)).toBeInTheDocument();
  });

  it("reinicia etapas, seleção e feedback para permitir uma nova solução", () => {
    const onSolved = vi.fn();
    render(<PainscreekMineSettlementMinigame onSolved={onSolved} />);
    answer("6 trabalhadores; as demais pessoas ficam fora da soma");
    expect(screen.getByRole("status")).toHaveTextContent(/Revise os dois grupos/);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.getByText(/Etapa 1 de 3/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    answer("19 trabalhadores (6 + 13)");
    answer("US$ 120.000 (US$ 96.000 + US$ 24.000)");
    answer("Informa somente um total agregado; não especifica a distribuição entre as famílias.");
    expect(onSolved).toHaveBeenCalledTimes(1);
  });
});
