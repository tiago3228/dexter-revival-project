import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SealCodeMinigame } from "../game/SealCodeMinigame";
import { MINIGAME_PROGRESS_STORAGE_KEY } from "../game/minigameProgress";
import {
  generateSecretCode,
  getCodeFeedback,
  isValidCode,
  MAX_ATTEMPTS,
  SEAL_SYMBOLS,
  type SealSymbolId,
} from "../game/sealCodePuzzle";

const secret: SealSymbolId[] = ["blood", "slide", "flask", "glove"];

function findDistinctGuesses(excluded: readonly SealSymbolId[], count: number): SealSymbolId[][] {
  const guesses: SealSymbolId[][] = [];
  const visit = (prefix: SealSymbolId[], remaining: SealSymbolId[]) => {
    if (guesses.length >= count) return;
    if (prefix.length === 4) {
      if (prefix.some((symbol, index) => symbol !== excluded[index])) guesses.push(prefix);
      return;
    }
    for (let index = 0; index < remaining.length; index += 1) {
      visit(
        [...prefix, remaining[index]!],
        remaining.filter((_, itemIndex) => itemIndex !== index),
      );
      if (guesses.length >= count) return;
    }
  };
  visit([], [...SEAL_SYMBOLS.map(({ id }) => id)]);
  return guesses;
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("lógica do Código do Lacre", () => {
  it("gera códigos de quatro símbolos válidos, distintos e sem repetição", () => {
    const code = generateSecretCode(() => 0.37);
    expect(code).toHaveLength(4);
    expect(isValidCode(code)).toBe(true);
    expect(new Set(code).size).toBe(4);
    expect(code.every((id) => SEAL_SYMBOLS.some((symbol) => symbol.id === id))).toBe(true);
  });

  it("separa acertos de posição dos símbolos certos em posição errada", () => {
    expect(getCodeFeedback(secret, ["blood", "flask", "badge", "glove"])).toEqual({
      correctPosition: 2,
      correctSymbol: 1,
    });
    expect(getCodeFeedback(secret, secret)).toEqual({ correctPosition: 4, correctSymbol: 0 });
    expect(getCodeFeedback(secret, ["knife", "badge", "slide", "flask"])).toEqual({
      correctPosition: 0,
      correctSymbol: 2,
    });
  });

  it("rejeita códigos incompletos, duplicados ou com símbolos desconhecidos", () => {
    expect(isValidCode(["blood", "slide", "flask"])).toBe(false);
    expect(isValidCode(["blood", "blood", "flask", "glove"])).toBe(false);
    expect(isValidCode(["blood", "slide", "flask", "inexistente"])).toBe(false);
    expect(() =>
      getCodeFeedback(secret, ["blood", "blood", "flask", "glove"] as SealSymbolId[]),
    ).toThrow(RangeError);
  });
});

describe("interação do minigame Código do Lacre", () => {
  it("abre o diálogo acessível, aceita um palpite e anuncia a vitória", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const winningCode = generateSecretCode(() => 0);
    render(<SealCodeMinigame />);

    fireEvent.click(screen.getByRole("button", { name: "Código do Lacre" }));
    const dialog = screen.getByRole("dialog", { name: "Mini Game — Código do Lacre" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/até oito tentativas/i)).toBeInTheDocument();

    for (const id of winningCode) {
      const symbol = SEAL_SYMBOLS.find((item) => item.id === id)!;
      fireEvent.click(within(dialog).getByRole("button", { name: symbol.label }));
    }
    fireEvent.click(within(dialog).getByRole("button", { name: "Submeter palpite" }));

    expect(within(dialog).getByRole("status")).toHaveTextContent("Lacre aberto");
    expect(within(dialog).getByRole("status")).toHaveClass("seal-code-victory-notice");
    expect(
      JSON.parse(window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY)!).completed[
        "seal-code"
      ],
    ).toEqual(["solved"]);
    expect(within(dialog).getByText("Tentativas: 1/8")).toBeInTheDocument();
    expect(
      within(dialog).getByText("4 na posição certa · 0 na posição errada"),
    ).toBeInTheDocument();
  });

  it("limita a oito palpites, revela a solução e permite iniciar outra rodada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const winningCode = generateSecretCode(() => 0);
    const losingGuesses = findDistinctGuesses(winningCode, MAX_ATTEMPTS);
    expect(losingGuesses).toHaveLength(MAX_ATTEMPTS);

    render(<SealCodeMinigame />);
    fireEvent.click(screen.getByRole("button", { name: "Código do Lacre" }));
    const dialog = screen.getByRole("dialog", { name: "Mini Game — Código do Lacre" });

    for (const guess of losingGuesses) {
      for (const id of guess) {
        const symbol = SEAL_SYMBOLS.find((item) => item.id === id)!;
        fireEvent.click(within(dialog).getByRole("button", { name: symbol.label }));
      }
      fireEvent.click(within(dialog).getByRole("button", { name: "Submeter palpite" }));
    }

    expect(
      within(dialog).getByText(`Tentativas: ${MAX_ATTEMPTS}/${MAX_ATTEMPTS}`),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Tentativas esgotadas/)).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY) ?? "null")?.completed?.[
        "seal-code"
      ] ?? [],
    ).toEqual([]);
    expect(within(dialog).getByLabelText("Código secreto revelado")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Tentar de novo" }));
    expect(within(dialog).getByText("Tentativas: 0/8")).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Código secreto revelado")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Submeter palpite" })).toBeDisabled();
  });

  it("impede repetir símbolo em posições diferentes e só permite enviar quatro símbolos únicos", () => {
    render(<SealCodeMinigame />);
    fireEvent.click(screen.getByRole("button", { name: "Código do Lacre" }));
    const dialog = screen.getByRole("dialog", { name: "Mini Game — Código do Lacre" });
    const bloodButton = within(dialog).getByRole("button", { name: "Gota de sangue" });
    fireEvent.click(bloodButton);

    expect(
      within(dialog).getByRole("button", { name: "Posição 1, Gota de sangue" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Gota de sangue" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Submeter palpite" })).toBeDisabled();
  });
});
