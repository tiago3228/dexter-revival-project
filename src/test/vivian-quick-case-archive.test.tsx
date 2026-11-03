import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { VivianQuickCaseStats } from "@/game/VivianQuickCaseStats";
import { VivianQuickCasesArchive } from "@/game/VivianQuickCasesArchive";
import { VIVIAN_QUICK_CASES } from "@/game/vivianQuickCases";

const SAVE_KEY = "vivian-playable-investigation-v1";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("arquivo policial dos casos curtos", () => {
  it("conta apenas casos de cinco minutos e não duplica pontos nem inclui depoimentos", () => {
    render(
      <VivianQuickCaseStats
        completed={["lake-car", "lake-car", "witness-one-liar", "unknown-case"]}
      />,
    );

    expect(screen.getByText("1/9")).toBeInTheDocument();
    expect(screen.getByText("100/900")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progresso dos casos curtos" })).toHaveAttribute(
      "aria-valuenow",
      "11",
    );
    expect(screen.getByText(/não altera a pontuação principal/)).toBeInTheDocument();
  });

  it("mostra os arquivos bloqueados e informa qual registro ainda falta", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 6, found: ["scott-denial"], completedQuickCases: [] }),
    );
    render(<VivianQuickCasesArchive />);

    const forestCard = screen.getByRole("button", { name: /O que foi possível ouvir na floresta/ });
    expect(forestCard).toBeDisabled();
    expect(
      within(forestCard).getByText(/REGISTRO PENDENTE · Arquivo do xerife/),
    ).toBeInTheDocument();
  });

  it("executa o caso selecionado, soma 100 pontos e preserva os demais dados do save", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 6,
        found: ["police-report"],
        completedQuickCases: ["funds-report"],
        mistakes: 3,
        score: 420,
      }),
    );
    const forestCase = VIVIAN_QUICK_CASES.find((quickCase) => quickCase.id === "forest-witnesses");
    expect(forestCase).toBeDefined();
    if (!forestCase) throw new Error("Forest quick case is missing");

    render(<VivianQuickCasesArchive />);
    fireEvent.click(screen.getByRole("button", { name: /O que foi possível ouvir na floresta/ }));
    const runner = screen.getByRole("article", { name: forestCase.title });

    for (const step of forestCase.steps) {
      const correctOption = step.options.find((option) => option.id === step.answer)!;
      fireEvent.click(within(runner).getByRole("radio", { name: correctOption.label }));
    }
    fireEvent.click(within(runner).getByRole("button", { name: "Conferir caso" }));

    const stats = screen.getByLabelText("Estatísticas dos casos curtos");
    expect(within(stats).getByText("2/9")).toBeInTheDocument();
    expect(within(stats).getByText("200/900")).toBeInTheDocument();
    expect(within(runner).getByText(/\+100 pontos no arquivo/)).toBeInTheDocument();

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.completedQuickCases).toEqual(["funds-report", "forest-witnesses"]);
    expect(saved.mistakes).toBe(3);
    expect(saved.score).toBe(420);
    expect(saved.found).toEqual(["police-report"]);
  });
});
