import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VivianMapQuickChallenges } from "@/game/VivianMapQuickChallenges";
import { VIVIAN_QUICK_CASES } from "@/game/vivianQuickCases";

const SAVE_KEY = "vivian-playable-investigation-v1";

describe("desafios rápidos no mapa de transição", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("bloqueia o depoimento até o relatório estar no save", () => {
    render(<VivianMapQuickChallenges />);
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));

    expect(screen.getByText(/Encontre o Arquivo do xerife/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /O que foi possível ouvir na floresta/ }),
    ).toBeDisabled();
  });

  it("salva o desafio de depoimentos sem sobrescrever o progresso do caso", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 6,
        found: ["police-report", "scott-denial"],
        readClues: ["police-report"],
        mistakes: 3,
        completedQuickCases: ["funds-report"],
        investigationNotes: "Conferir a distância descrita no relatório.",
      }),
    );
    render(<VivianMapQuickChallenges />);
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Relato B/ }));
    fireEvent.click(screen.getByRole("button", { name: "Conferir depoimentos" }));

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.version).toBe(6);
    expect(saved.found).toEqual(["police-report", "scott-denial"]);
    expect(saved.readClues).toEqual(["police-report"]);
    expect(saved.mistakes).toBe(3);
    expect(saved.investigationNotes).toBe("Conferir a distância descrita no relatório.");
    expect(saved.completedQuickCases).toEqual(["funds-report", "witness-one-liar"]);
  });

  it("desbloqueia e salva o caso do carro submerso com a notícia da p. 85", () => {
    const lakeCase = VIVIAN_QUICK_CASES.find((quickCase) => quickCase.id === "lake-car");
    expect(lakeCase).toBeDefined();
    if (!lakeCase) throw new Error("Lake car quick case is missing");

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 6,
        found: ["henry-death"],
        completedQuickCases: [],
        mistakes: 2,
        investigationNotes: "Localizar registro oficial sobre a causa da morte.",
      }),
    );
    render(<VivianMapQuickChallenges />);
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));
    fireEvent.click(screen.getByRole("button", { name: /O carro submerso de Cherry Creek/ }));

    const challenge = screen.getByRole("article", { name: lakeCase.title });
    expect(within(challenge).getByText(/PDF p\. 85/)).toBeInTheDocument();
    expect(within(challenge).getByText(/dez e quinze dias/)).toBeInTheDocument();
    for (const step of lakeCase.steps) {
      const correctOption = step.options.find((option) => option.id === step.answer)!;
      fireEvent.click(within(challenge).getByRole("radio", { name: correctOption.label }));
    }
    fireEvent.click(within(challenge).getByRole("button", { name: "Conferir caso" }));

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.completedQuickCases).toEqual(["lake-car"]);
    expect(saved.mistakes).toBe(2);
    expect(saved.investigationNotes).toBe("Localizar registro oficial sobre a causa da morte.");
  });
});
