import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VivianMapQuickChallenges } from "@/game/VivianMapQuickChallenges";
import { VIVIAN_QUICK_CASES } from "@/game/vivianQuickCases";

const SAVE_KEY = "vivian-playable-investigation-v1";

function openCase(title: RegExp) {
  fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));
  fireEvent.click(screen.getByRole("button", { name: title }));
  return screen.getByRole("article", { name: title });
}

function solveGrid(
  challenge: HTMLElement,
  solution: Readonly<Record<string, { place: string; object: string }>>,
) {
  for (const [person, assignment] of Object.entries(solution)) {
    for (const column of [assignment.place, assignment.object]) {
      const cell = within(challenge).getByRole("button", { name: `${person} e ${column}` });
      fireEvent.click(cell);
      fireEvent.click(cell);
    }
  }
}

describe("casos Murdle de tabela lógica", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("mantém o caso do observatório bloqueado sem o relatório e conclui a tabela completa", () => {
    const logicCase = VIVIAN_QUICK_CASES.find((item) => item.id === "observatory-heist-grid");
    expect(logicCase?.logicGrid).toBeDefined();

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 11, found: [], completedQuickCases: [], mistakes: 2 }),
    );
    render(<VivianMapQuickChallenges />);
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));
    expect(screen.getByRole("button", { name: /O roubo no observatório/ })).toBeDisabled();

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 11,
        found: ["police-report"],
        completedQuickCases: [],
        mistakes: 2,
      }),
    );
    cleanup();
    render(<VivianMapQuickChallenges />);
    const challenge = openCase(/O roubo no observatório/);
    expect(within(challenge).getByText(/Pessoa × local/)).toBeInTheDocument();
    expect(within(challenge).getByText(/Mara não estava no píer/)).toBeInTheDocument();

    const logicGrid = logicCase!.logicGrid!;
    solveGrid(challenge, logicGrid.solution);
    fireEvent.click(within(challenge).getByRole("button", { name: "Conferir tabela" }));

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
    expect(saved.completedQuickCases).toEqual(["observatory-heist-grid"]);
    expect(saved.mistakes).toBe(2);
    expect(within(challenge).getByText(/A única combinação consistente/)).toBeInTheDocument();
  });

  it("resolve o caso do envelope com associações únicas de pessoa, local e objeto", () => {
    const logicCase = VIVIAN_QUICK_CASES.find((item) => item.id === "library-envelope-grid");
    expect(logicCase?.logicGrid).toBeDefined();
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 11,
        found: ["police-report", "charles-secret"],
        completedQuickCases: [],
        mistakes: 4,
      }),
    );
    render(<VivianMapQuickChallenges />);
    const challenge = openCase(/O envelope da biblioteca/);
    const logicGrid = logicCase!.logicGrid!;

    const firstPerson = logicGrid.people[0]!;
    const wrongCell = within(challenge).getByRole("button", {
      name: `${firstPerson} e ${logicGrid.places[1]}`,
    });
    fireEvent.click(wrongCell);
    fireEvent.click(within(challenge).getByRole("button", { name: "Conferir tabela" }));
    expect(within(challenge).getByRole("status")).toHaveTextContent("tabela ainda não fecha");
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}").completedQuickCases).toEqual(
      [],
    );

    solveGrid(challenge, logicGrid.solution);
    fireEvent.click(within(challenge).getByRole("button", { name: "Conferir tabela" }));
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}").completedQuickCases).toEqual([
      "library-envelope-grid",
    ]);
  });
});
