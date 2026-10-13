import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { VivianInvestigationGame } from "@/game/VivianInvestigationGame";

const SAVE_KEY = "vivian-playable-investigation-v1";
const ALL_CLUES = [
  "police-report",
  "scott-denial",
  "hospital-closure",
  "hospital-contract",
  "henry-death",
  "funds-investigation",
  "vivian-medical",
  "charles-secret",
  "dorothy-photo",
  "daniel-letter",
  "code-0318",
];
const CURRENT_TIMELINE_ORDER = ["letter-1973", "funds-1993", "vivian-1995", "hospital-1996"];

function seedSave(overrides: Record<string, unknown> = {}) {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 2,
      found: ALL_CLUES,
      visited: ["archive", "mansion", "hospital", "church", "lake"],
      links: [],
      activePlace: "archive",
      phase: "explore",
      timelineOrder: CURRENT_TIMELINE_ORDER,
      reportSubmitted: false,
      chosenConclusion: "",
      mistakes: 0,
      usedHints: [],
      ...overrides,
    }),
  );
}

function getClueCard(title: string) {
  const article = screen.getByRole("heading", { name: title }).closest("article");
  expect(article).not.toBeNull();
  return article as HTMLElement;
}

function expectCatalogLink(title: string, evidenceId: string, sourcePage: number) {
  const card = getClueCard(title);
  const details = card.querySelector("details");
  expect(details).not.toBeNull();
  const summary = details?.querySelector("summary");
  expect(summary).toHaveTextContent(evidenceId);
  expect(summary).toHaveTextContent("Conferida visualmente");

  fireEvent.click(summary!);

  expect(details).toHaveAttribute("open");
  const originLabel = within(card).getByText(/Origem desta pista/);
  expect(originLabel.parentElement).toHaveTextContent(`PDF p. ${sourcePage}`);
  expect(within(card).getByText(/cotejo da fonte/)).toBeInTheDocument();
}

describe("Vivian catalog integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("shows optional catalogue details only for exact pages with visually checked records", () => {
    seedSave();
    render(<VivianInvestigationGame onBack={() => {}} />);

    expectCatalogLink("Relatório policial sobre Vivian", "P-010", 90);
    expectCatalogLink("Scott nega ter matado Vivian", "P-016", 88);
    expectCatalogLink("Fechamento do Hospital Comunitário", "P-013", 84);

    fireEvent.click(screen.getByRole("button", { name: /Hospital Comunitário/ }));
    expectCatalogLink("Investigação sobre fundos da Roberts Relief", "P-007", 97);
    expectCatalogLink("Relatório médico de Vivian", "P-020", 94);

    fireEvent.click(screen.getByRole("button", { name: /Lago Cherry Creek/ }));
    expectCatalogLink("Morte do Dr. Henry Johnson", "P-008", 85);

    fireEvent.click(screen.getByRole("button", { name: /Mansão Roberts/ }));
    expectCatalogLink("Código 0318", "P-003", 102);
    expect(getClueCard("Carta sobre os segredos da família").querySelector("details")).toBeNull();
    expect(getClueCard("Fotografia emprestada").querySelector("details")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Trinity Church/ }));
    expect(getClueCard("Carta endereçada a Daniel").querySelector("details")).toBeNull();
  });

  it("uses the visually checked 1996 hospital date in the game and the default timeline", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);

    const hospitalCard = getClueCard("Fechamento do Hospital Comunitário");
    fireEvent.click(within(hospitalCard).getByRole("button", { name: "Examinar e coletar" }));
    expect(hospitalCard).toHaveTextContent("1996");
    expect(hospitalCard).not.toHaveTextContent("1956");

    fireEvent.click(screen.getByRole("button", { name: "Cronologia" }));
    fireEvent.click(screen.getByRole("button", { name: /Verificar cronologia/ }));

    expect(screen.getByRole("status")).toHaveTextContent("Cronologia coerente.");
  });

  it("migrates the former hospital timeline ID without dropping the event", () => {
    seedSave({
      found: [],
      phase: "timeline",
      timelineOrder: ["hospital-1956", "letter-1973", "funds-1993", "vivian-1995"],
    });
    render(<VivianInvestigationGame onBack={() => {}} />);

    expect(screen.getByText("Fechamento do Hospital Comunitário (1996)")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Mover/ })).toHaveLength(8);
  });
});
