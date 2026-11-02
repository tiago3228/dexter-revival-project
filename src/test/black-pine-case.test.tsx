import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BlackPineCase } from "@/game/BlackPineCase";
import {
  BLACK_PINE_ARTIFACTS,
  BLACK_PINE_ARTIFACT_SOLUTION,
  BLACK_PINE_LOCATION_SOLUTION,
  BLACK_PINE_LOCATIONS,
  BLACK_PINE_PEOPLE,
  checkBlackPineGrid,
  checkBlackPineArtifactGrid,
} from "@/game/blackPineCase";

const { recordCaseCompletion, finishCaseTimer } = vi.hoisted(() => ({
  recordCaseCompletion: vi.fn(),
  finishCaseTimer: vi.fn(() => 42),
}));

vi.mock("@/game/achievements", () => ({ recordCaseCompletion }));
vi.mock("@/game/caseTimer", () => ({
  beginCaseTimer: vi.fn(),
  pauseCaseTimer: vi.fn(),
  finishCaseTimer,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function completeGrid() {
  for (const person of BLACK_PINE_PEOPLE) {
    for (const location of BLACK_PINE_LOCATIONS) {
      const button = screen.getByRole("button", {
        name: `${person.name} e ${location.label}`,
      });
      const shouldConfirm = BLACK_PINE_LOCATION_SOLUTION[person.id] === location.id;
      fireEvent.click(button);
      if (shouldConfirm) fireEvent.click(button);
    }
  }
  for (const person of BLACK_PINE_PEOPLE) {
    for (const artifact of BLACK_PINE_ARTIFACTS) {
      const button = screen.getByRole("button", {
        name: `${person.name} e ${artifact.label}`,
      });
      const shouldConfirm = BLACK_PINE_ARTIFACT_SOLUTION[person.id] === artifact.id;
      fireEvent.click(button);
      if (shouldConfirm) fireEvent.click(button);
    }
  }
}

describe("Caso 01 · Black Pine", () => {
  it("confere a solução da grade com relações exclusivas", () => {
    const marks: Record<string, "x" | "o"> = {};
    for (const person of BLACK_PINE_PEOPLE) {
      for (const location of BLACK_PINE_LOCATIONS) {
        marks[`${person.id}|${location.id}`] =
          BLACK_PINE_LOCATION_SOLUTION[person.id] === location.id ? "o" : "x";
      }
    }
    expect(checkBlackPineGrid(marks)).toBe(true);
    const artifactMarks: Record<string, "x" | "o"> = {};
    for (const person of BLACK_PINE_PEOPLE) {
      for (const artifact of BLACK_PINE_ARTIFACTS) {
        artifactMarks[`${person.id}|${artifact.id}`] =
          BLACK_PINE_ARTIFACT_SOLUTION[person.id] === artifact.id ? "o" : "x";
      }
    }
    expect(checkBlackPineArtifactGrid(artifactMarks)).toBe(true);
  });

  it("não encerra o dossiê com um veredicto sem grade conferida", () => {
    render(<BlackPineCase onBack={vi.fn()} soundOn onToggleSound={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Veredicto" }));
    fireEvent.click(screen.getByRole("button", { name: /Whitmore saiu voluntariamente/ }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar dossiê e conferir conclusão" }));
    expect(screen.getByRole("status")).toHaveTextContent("As duas grades ainda têm relações");
    expect(recordCaseCompletion).not.toHaveBeenCalled();
  });

  it("registra a conclusão correta após grade e veredicto sustentados", () => {
    render(<BlackPineCase onBack={vi.fn()} soundOn onToggleSound={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Grade de dedução" }));
    completeGrid();
    fireEvent.click(screen.getByRole("button", { name: "Veredicto" }));
    fireEvent.click(screen.getByRole("button", { name: /Whitmore saiu voluntariamente/ }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar dossiê e conferir conclusão" }));

    expect(recordCaseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId: "blackpine",
        correctConclusion: true,
        elapsedSeconds: 42,
      }),
    );
    expect(screen.getByText("Conclusão sustentada")).toBeInTheDocument();
  }, 15000);
});
