import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VivianLogicGrid } from "@/game/VivianLogicGrid";
import { VivianInvestigationGame } from "@/game/VivianInvestigationGame";
import {
  GRID_LEVELS,
  GRID_PERIOD_ID,
  GRID_PLACE_ID,
  GRID_ID,
  checkGrid,
  type Mark,
} from "@/game/vivianLogicGrid";
import { VivianQuickChallenges } from "@/game/VivianQuickChallenges";
import {
  VIVIAN_QUICK_CASES,
  WITNESS_CASE,
  evaluateQuickCase,
  evaluateWitnessClaim,
} from "@/game/vivianQuickCases";

afterEach(() => cleanup());

const ALL_RECORDS = ["police-report", "funds-investigation", "charles-secret", "dorothy-photo"];
const SAVE_KEY = "vivian-playable-investigation-v1";
beforeEach(() => window.localStorage.clear());

function correctMarks(levelId: (typeof GRID_LEVELS)[number]["id"]): Record<string, Mark> {
  const level = GRID_LEVELS.find((item) => item.id === levelId)!;
  return Object.fromEntries(
    level.rows.flatMap((row) =>
      level.columns.map((column) => [
        `${row.id}|${column.id}`,
        level.solution[row.id] === column.id ? "o" : "x",
      ]),
    ),
  ) as Record<string, Mark>;
}

describe("progressão da Grade de dedução", () => {
  it("valida associações de registro, local e período, inclusive locais compartilhados", () => {
    expect(checkGrid(correctMarks(GRID_ID), GRID_ID)).toBe(true);
    expect(checkGrid(correctMarks(GRID_PLACE_ID), GRID_PLACE_ID)).toBe(true);
    expect(checkGrid(correctMarks(GRID_PERIOD_ID), GRID_PERIOD_ID)).toBe(true);
    expect(
      checkGrid({ ...correctMarks(GRID_PLACE_ID), "charles-secret|church": "o" }, GRID_PLACE_ID),
    ).toBe(false);
  });

  it("bloqueia novos níveis até completar os anteriores e libera o nível seguinte", () => {
    function Harness() {
      const [progress, setProgress] = useState<string[]>([]);
      return (
        <VivianLogicGrid
          found={ALL_RECORDS}
          solvedLevels={progress}
          onSolve={(id) => setProgress((current) => [...current, id])}
        />
      );
    }
    render(<Harness />);
    const grid = within(screen.getByRole("region", { name: "Grade de dedução" }));
    const level2 = grid.getByRole("button", { name: /Nível 2/ });
    const level3 = grid.getByRole("button", { name: /Nível 3/ });
    expect(level2).toBeDisabled();
    expect(level3).toBeDisabled();

    const fillLevel = (levelId: (typeof GRID_LEVELS)[number]["id"]) => {
      const level = GRID_LEVELS.find((item) => item.id === levelId)!;
      for (const row of level.rows) {
        for (const column of level.columns) {
          const cell = grid.getByRole("button", { name: `${row.label} e ${column.label}` });
          fireEvent.click(cell);
          if (level.solution[row.id] === column.id) fireEvent.click(cell);
        }
      }
      fireEvent.click(grid.getByRole("button", { name: "Conferir nível" }));
    };

    fillLevel(GRID_ID);
    expect(level2).toBeEnabled();
    fireEvent.click(level2);
    fillLevel(GRID_PLACE_ID);
    expect(level3).toBeEnabled();
    fireEvent.click(level3);
    fillLevel(GRID_PERIOD_ID);
    expect(grid.getByText(/Nível conferido/)).toBeInTheDocument();
  });
});

describe("depoimento incompatível e casos curtos", () => {
  it("só aponta a afirmação contradita quando o relatório do xerife foi encontrado", () => {
    expect(evaluateWitnessClaim("b", [])).toBe("locked");
    expect(evaluateWitnessClaim("a", ["police-report"])).toBe("unsupported");
    expect(evaluateWitnessClaim(WITNESS_CASE.answer, ["police-report"])).toBe("supported");
  });

  it.each(VIVIAN_QUICK_CASES)("$id exige todos os passos corretos e os documentos", (quickCase) => {
    const completeAnswers = Object.fromEntries(
      quickCase.steps.map((step) => [step.id, step.answer]),
    );
    expect(evaluateQuickCase(quickCase.id, completeAnswers, [])).toBe("locked");
    expect(
      evaluateQuickCase(
        quickCase.id,
        { ...completeAnswers, [quickCase.steps[0]!.id]: "wrong" },
        quickCase.requiredRecords,
      ),
    ).toBe("unsupported");
    expect(evaluateQuickCase(quickCase.id, completeAnswers, quickCase.requiredRecords)).toBe(
      "supported",
    );
  });

  it("só mostra resposta do depoimento após selecionar uma versão e preserva o enunciado simulado", () => {
    const onComplete = vi.fn();
    render(
      <VivianQuickChallenges found={["police-report"]} completed={[]} onComplete={onComplete} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));
    expect(screen.getByText(/não citações nem novos depoimentos canônicos/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Relato B/ }));
    fireEvent.click(screen.getByRole("button", { name: "Conferir depoimentos" }));
    expect(onComplete).toHaveBeenCalledWith(WITNESS_CASE.id);
  });

  it("migra save v5 preservando investigação e persiste microcaso sem alterar score", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 5,
        found: ALL_RECORDS,
        readClues: ["police-report"],
        mistakes: 2,
        usedHints: ["police-report:1"],
        deductions: ["witness-limits"],
        investigationNotes: "Conferir o relatório original.",
      }),
    );
    render(<VivianInvestigationGame onBack={() => {}} />);
    const desk = within(screen.getByRole("region", { name: "Mesa de dedução" }));
    fireEvent.click(desk.getByRole("button", { name: /Entre um local e outro/ }));
    fireEvent.click(desk.getByRole("radio", { name: /Relato B/ }));
    fireEvent.click(desk.getByRole("button", { name: "Conferir depoimentos" }));

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.version).toBe(6);
    expect(saved.found).toEqual(ALL_RECORDS);
    expect(saved.readClues).toEqual(["police-report"]);
    expect(saved.mistakes).toBe(2);
    expect(saved.usedHints).toEqual(["police-report:1"]);
    expect(saved.deductions).toEqual(["witness-limits"]);
    expect(saved.investigationNotes).toBe("Conferir o relatório original.");
    expect(saved.logicGrids).toEqual([]);
    expect(saved.completedQuickCases).toContain(WITNESS_CASE.id);
  });
});
