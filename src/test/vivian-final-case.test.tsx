import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VivianFinalReveal } from "@/game/VivianFinalReveal";
import {
  getVivianVerdictReadiness,
  isCorrectVivianAccusation,
  VIVIAN_FINAL_REQUIREMENTS,
} from "@/game/vivianFinalCase";
import { VivianInvestigationGame } from "@/game/VivianInvestigationGame";

const SAVE_KEY = "vivian-playable-investigation-v1";
const completeProgress = {
  found: [...VIVIAN_FINAL_REQUIREMENTS.clues],
  links: [...VIVIAN_FINAL_REQUIREMENTS.links],
  solvedCodeLocks: [...VIVIAN_FINAL_REQUIREMENTS.locks],
  timelineOrder: [...VIVIAN_FINAL_REQUIREMENTS.timeline],
};

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("finalização do Capítulo 06", () => {
  it("bloqueia o veredito se faltar qualquer requisito investigativo", () => {
    expect(getVivianVerdictReadiness(completeProgress).ready).toBe(true);
    expect(
      getVivianVerdictReadiness({ ...completeProgress, found: completeProgress.found.slice(1) })
        .ready,
    ).toBe(false);
    expect(
      getVivianVerdictReadiness({
        ...completeProgress,
        timelineOrder: [...completeProgress.timelineOrder].reverse(),
      }).ready,
    ).toBe(false);
  });

  it("só aceita personagem, arma e motivação corretos", () => {
    expect(
      isCorrectVivianAccusation({
        suspect: "matthew-brooks",
        weapon: "axe",
        motive: "revenge-for-sofia",
      }),
    ).toBe(true);
    expect(
      isCorrectVivianAccusation({
        suspect: "scott-brooks",
        weapon: "axe",
        motive: "revenge-for-sofia",
      }),
    ).toBe(false);
    expect(
      isCorrectVivianAccusation({
        suspect: "matthew-brooks",
        weapon: "knife",
        motive: "revenge-for-sofia",
      }),
    ).toBe(false);
    expect(
      isCorrectVivianAccusation({
        suspect: "matthew-brooks",
        weapon: "axe",
        motive: "silence-witness",
      }),
    ).toBe(false);
  });

  it("mantém o arquivo final bloqueado sem conclusão e abre a narrativa quando liberado", () => {
    const { rerender } = render(<VivianFinalReveal unlocked={false} />);
    const lockedButton = screen.getByRole("button", { name: /Bloqueado até concluir o caso/ });
    expect(lockedButton).toBeDisabled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<VivianFinalReveal unlocked />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir revelação" }));
    expect(screen.getByRole("dialog", { name: "O Caso Vivian Roberts" })).toBeInTheDocument();
    expect(screen.getByText(/Matthew Brooks matou Vivian Roberts/)).toBeInTheDocument();
  });

  it("registra vitória persistente apenas após os requisitos e as três respostas corretas", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 7,
        ...completeProgress,
        phase: "report",
        chosenConclusion: "family",
        mistakes: 0,
        usedHints: [],
      }),
    );
    render(<VivianInvestigationGame onBack={() => {}} />);
    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    expect(screen.queryByText("Registrar conclusão provisória")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Quem matou Vivian Roberts?" }), {
      target: { value: "matthew-brooks" },
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: "Qual arma foi usada para matar Vivian?" }),
      { target: { value: "axe" } },
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Qual a motivação do crime?" }), {
      target: { value: "revenge-for-sofia" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar as três respostas" }));
    expect(
      screen.getByText(/As três respostas estão corretas\. O capítulo foi concluído/),
    ).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}").caseCompleted).toBe(true);
    expect(screen.getByRole("button", { name: "Abrir revelação" })).toBeEnabled();
  });

  it("não conclui o capítulo com uma acusação incorreta e aplica penalidade", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 7,
        ...completeProgress,
        phase: "report",
        chosenConclusion: "family",
        mistakes: 0,
        usedHints: [],
      }),
    );
    render(<VivianInvestigationGame onBack={() => {}} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Quem matou Vivian Roberts?" }), {
      target: { value: "scott-brooks" },
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: "Qual arma foi usada para matar Vivian?" }),
      { target: { value: "axe" } },
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Qual a motivação do crime?" }), {
      target: { value: "revenge-for-sofia" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar as três respostas" }));
    expect(screen.getByRole("button", { name: /Bloqueado até concluir o caso/ })).toBeDisabled();
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}").caseCompleted).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}").mistakes).toBe(1);
  });
});
