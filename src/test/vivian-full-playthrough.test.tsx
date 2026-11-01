import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VivianInvestigationGame } from "@/game/VivianInvestigationGame";

function enterPlace(name: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
  const dialog = screen.queryByRole("dialog");
  if (dialog?.textContent?.includes("Entrada de investigação")) {
    fireEvent.click(within(dialog).getByRole("button", { name: "Ver sala primeiro" }));
  }
}

function readClue(title: string) {
  const card = screen.getByRole("heading", { name: title }).closest("article");
  expect(card).not.toBeNull();
  fireEvent.click(within(card as HTMLElement).getByRole("button", { name: /Abrir arquivo/ }));
  expect(screen.getByRole("dialog")).toHaveTextContent(title);
  fireEvent.click(screen.getByRole("button", { name: "Registrar evidência no caderno" }));
}

function solveRiddle(title: string, answer: string) {
  const card = screen.getByRole("heading", { name: title }).closest("article");
  expect(card).not.toBeNull();
  if (within(card as HTMLElement).queryByRole("button", { name: "Digitar" })) {
    fireEvent.click(within(card as HTMLElement).getByRole("button", { name: "Digitar" }));
  }
  const input = within(card as HTMLElement).getByRole("textbox", {
    name: `Resposta para ${title}`,
  });
  fireEvent.change(input, { target: { value: answer } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByRole("status")).toHaveTextContent("Enigma resolvido");
}

function solveLock(title: string, code: string) {
  const card = screen.getByRole("heading", { name: title }).closest("article");
  expect(card).not.toBeNull();
  const input = within(card as HTMLElement).getByRole("textbox", {
    name: `Código para ${title}`,
  });
  fireEvent.change(input, { target: { value: code } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByRole("status")).toHaveTextContent("Fechadura aberta");
}

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("partida integral do Capítulo 06", () => {
  it("começa sem save, conclui a investigação e só então libera a narrativa e o dossiê M99", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Dossiê completo bloqueado até concluir o caso" }),
    ).toBeDisabled();

    enterPlace("Arquivo do xerife");
    readClue("Relatório policial sobre Vivian");
    readClue("Scott nega ter matado Vivian");
    readClue("Fechamento do Hospital Comunitário");
    solveRiddle("A voz por trás da negativa", "Scott");
    solveRiddle("A natureza do documento", "relatório policial");

    enterPlace("Hospital Comunitário");
    readClue("Carta sobre fornecimento ao hospital");
    readClue("Investigação sobre fundos da Roberts Relief");
    readClue("Relatório médico de Vivian");
    solveRiddle("O valor fora do balanço", "160 mil dólares");
    solveRiddle("A assinatura clínica", "Henry Johnson");
    solveLock("Armário de Katherine", "1964");

    enterPlace("Mansão Roberts");
    readClue("Carta sobre os segredos da família");
    readClue("Fotografia emprestada");
    readClue("Código 0318");
    solveRiddle("Quatro algarismos para Sofia", "03/18");
    solveRiddle("O nome que desapareceu", "Sofia");
    solveRiddle("O objeto emprestado", "fotografia");
    solveLock("Gaveta do estudo", "5194");
    solveLock("Cofre da galeria", "611975");

    enterPlace("Trinity Church");
    readClue("Carta endereçada a Daniel");
    solveRiddle("O nome no envelope", "Daniel");

    enterPlace("Lago Cherry Creek");
    readClue("Morte do Dr. Henry Johnson");
    solveRiddle("Quem repousava no carro?", "Henry Johnson");

    fireEvent.click(screen.getByRole("button", { name: "Quadro de evidências" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Relatório policial sobre Vivian/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Scott nega ter matado Vivian/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cruzar as duas selecionadas" }));
    expect(screen.getByRole("heading", { name: "Suspeita e negativa" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /Carta sobre os segredos da família/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Relatório médico de Vivian/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cruzar as duas selecionadas" }));
    expect(
      screen.getByRole("heading", { name: "Saúde de Vivian e relação com Charles" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cronologia" }));
    fireEvent.click(screen.getByRole("button", { name: "Verificar cronologia" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cronologia coerente");
    fireEvent.click(screen.getByRole("button", { name: "Relatório" }));
    expect(
      screen.getByRole("heading", { name: "Acusação final · Capítulo 06" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Quem matou Vivian Roberts?" }), {
      target: { value: "matthew-brooks" },
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: "Qual arma foi usada para matar Vivian?" }),
      {
        target: { value: "axe" },
      },
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Qual a motivação do crime?" }), {
      target: { value: "revenge-for-sofia" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar as três respostas" }));
    expect(
      screen.getByText(/As três respostas estão corretas\. O capítulo foi concluído/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir revelação" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Dossiê completo" })).toBeEnabled();
    expect(
      JSON.parse(window.localStorage.getItem("vivian-playable-investigation-v1")!).caseCompleted,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Abrir revelação" }));
    expect(screen.getByRole("dialog", { name: "O Caso Vivian Roberts" })).toBeInTheDocument();
    expect(screen.getByText(/Matthew Brooks matou Vivian Roberts/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar revelação final" }));

    fireEvent.click(screen.getByRole("button", { name: "Dossiê completo" }));
    expect(screen.getByRole("dialog", { name: "Dossiê completo" })).toBeInTheDocument();
    expect(screen.getByText(/Senha do dossiê pós-jogo liberada/)).toHaveTextContent("M99");
    for (let index = 0; index < 12; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 1 para cima" }));
    }
    for (let index = 0; index < 9; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 2 para cima" }));
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 3 para cima" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Abrir dossiê" }));
    expect(
      screen.getByRole("heading", { name: "Dossiê completo de Painscreek" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fita secreta procurada por Magdalene/)).toBeInTheDocument();
  }, 60000);
});
