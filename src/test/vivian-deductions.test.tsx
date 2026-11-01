import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { evaluateVivianDeduction, VIVIAN_DEDUCTIONS } from "@/game/vivianDeductions";
import { VivianInvestigationGame } from "@/game/VivianInvestigationGame";

const SAVE_KEY = "vivian-playable-investigation-v1";
beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("optional source-driven Vivian deductions", () => {
  it.each(VIVIAN_DEDUCTIONS)("requires both sources for $id", (item) => {
    expect(evaluateVivianDeduction(item.id, item.answer, item.sources.slice(0, 1))).toBe("locked");
    expect(evaluateVivianDeduction(item.id, item.answer, item.sources)).toBe("supported");
    for (const option of item.options.filter((option) => option.id !== item.answer)) {
      expect(evaluateVivianDeduction(item.id, option.id, item.sources)).toBe("unsupported");
    }
  });

  it("preserves existing progress and score while recording a deduction and a personal hypothesis", () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 5,
        found: ["police-report", "scott-denial"],
        readClues: ["police-report"],
        mistakes: 2,
        usedHints: ["police-report:1"],
      }),
    );
    render(<VivianInvestigationGame onBack={() => {}} />);
    const desk = within(screen.getByRole("region", { name: "Mesa de dedução" }));
    fireEvent.click(desk.getByRole("radio", { name: "Ouviram Scott confessar o crime." }));
    fireEvent.click(desk.getByRole("button", { name: "Sustentar dedução" }));
    let saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.mistakes).toBe(2);
    expect(saved.deductions).toEqual([]);
    fireEvent.click(
      desk.getByRole("radio", {
        name: "Ouviram uma discussão, mas não identificaram as palavras.",
      }),
    );
    fireEvent.click(desk.getByRole("button", { name: "Sustentar dedução" }));
    fireEvent.change(desk.getByRole("textbox", { name: "Minhas hipóteses" }), {
      target: { value: "Conferir a versão de Scott." },
    });
    saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.deductions).toEqual(["witness-limits"]);
    expect(saved.investigationNotes).toBe("Conferir a versão de Scott.");
    expect(saved.found).toEqual(["police-report", "scott-denial"]);
    expect(saved.readClues).toEqual(["police-report"]);
    expect(saved.usedHints).toEqual(["police-report:1"]);
    cleanup();
    render(<VivianInvestigationGame onBack={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Minhas hipóteses" })).toHaveValue(
      "Conferir a versão de Scott.",
    );
  });

  it("accepts a typed name through the existing riddle rules without removing the discs", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);
    const article = screen
      .getByRole("heading", { name: "A voz por trás da negativa" })
      .closest("article");
    if (!article) throw new Error("Riddle not found");
    const riddle = within(article);
    fireEvent.click(riddle.getByRole("button", { name: "Digitar" }));
    fireEvent.change(
      riddle.getByRole("textbox", { name: "Resposta para A voz por trás da negativa" }),
      { target: { value: "Scott" } },
    );
    fireEvent.click(riddle.getByRole("button", { name: "Verificar" }));
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.solvedRiddles).toEqual(["archive-identity"]);
    expect(saved.found).toEqual(["scott-denial"]);
    expect(saved.mistakes).toBe(0);
  });
});
import { checkGrid, GRID_SOLUTION } from "@/game/vivianLogicGrid";
describe("grade de dedução", () => {
  it("aceita só a solução correta", () => {
    const ok = Object.fromEntries(
      Object.entries(GRID_SOLUTION).map(([p, r]) => [`${p}|${r}`, "o" as const]),
    );
    expect(checkGrid(ok)).toBe(true);
    expect(checkGrid({ ...ok, "Scott|police-report": "x" })).toBe(false);
  });
});
