import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

function seedCompleteInvestigation(reportSubmitted = false) {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 3,
      found: ALL_CLUES,
      solvedRiddles: [],
      visited: ["archive", "mansion", "hospital", "church", "lake"],
      links: [],
      activePlace: "archive",
      phase: "explore",
      timelineOrder: ["letter-1973", "funds-1993", "vivian-1995", "hospital-1996"],
      reportSubmitted,
      chosenConclusion: "",
      mistakes: 0,
      usedHints: [],
    }),
  );
}

describe("investigation riddles", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("offers a collapsed dossier with relationships, dates and codes for consultation", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);

    const summary = screen.getByText("Dossiê de apoio · relações, cronologia e códigos");
    const dossier = summary.closest("details");
    expect(dossier).not.toBeNull();
    expect(dossier).not.toHaveAttribute("open");

    fireEvent.click(summary);

    expect(dossier).toHaveTextContent("Sofia Miller");
    expect(dossier).toHaveTextContent("19–20/07/1995");
    expect(dossier).toHaveTextContent("Código 0318");
  });

  it("keeps the complete dossier locked until the case is submitted and M99 is entered", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Dossiê completo" }));

    const gate = screen.getByRole("dialog", { name: "Dossiê completo" });
    fireEvent.change(screen.getByRole("textbox", { name: "Senha final do dossiê" }), {
      target: { value: "M99" },
    });
    fireEvent.submit(
      screen.getByRole("textbox", { name: "Senha final do dossiê" }).closest("form")!,
    );
    expect(gate).toHaveTextContent("Resolva o caso");
    expect(
      screen.queryByRole("heading", { name: "Dossiê completo de Painscreek" }),
    ).not.toBeInTheDocument();

    cleanup();
    window.localStorage.clear();
    seedCompleteInvestigation(true);
    render(<VivianInvestigationGame onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Dossiê completo" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Senha final do dossiê" }), {
      target: { value: "senha-incorreta" },
    });
    fireEvent.submit(
      screen.getByRole("textbox", { name: "Senha final do dossiê" }).closest("form")!,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Senha incorreta");

    fireEvent.change(screen.getByRole("textbox", { name: "Senha final do dossiê" }), {
      target: { value: "m99" },
    });
    fireEvent.submit(
      screen.getByRole("textbox", { name: "Senha final do dossiê" }).closest("form")!,
    );
    expect(
      screen.getByRole("heading", { name: "Dossiê completo de Painscreek" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fita secreta procurada por Magdalene/)).toBeInTheDocument();
  });

  it("rejects a wrong answer and unlocks all nine riddle clues with correct answers", () => {
    seedCompleteInvestigation();
    render(<VivianInvestigationGame onBack={() => {}} />);

    const archiveAnswer = screen.getByRole("textbox", {
      name: "Resposta para A voz por trás da negativa",
    });
    fireEvent.change(archiveAnswer, { target: { value: "Vivian" } });
    fireEvent.submit(archiveAnswer.closest("form")!);
    expect(screen.getByRole("status")).toHaveTextContent("Resposta incorreta");

    const riddles = [
      {
        place: null,
        title: "A voz por trás da negativa",
        answer: "SCOTT BROOKS",
        clue: "scott-denial",
      },
      {
        place: "Arquivo do xerife",
        title: "O nome no relatório",
        answer: "Scott",
        clue: "police-report",
      },
      {
        place: "Hospital Comunitário",
        title: "O valor fora do balanço",
        answer: "160 mil dólares",
        clue: "funds-investigation",
      },
      {
        place: "Hospital Comunitário",
        title: "A assinatura clínica",
        answer: "Henry Johnson",
        clue: "vivian-medical",
      },
      {
        place: "Mansão Roberts",
        title: "Quatro algarismos para Sofia",
        answer: "03/18",
        clue: "code-0318",
      },
      {
        place: "Mansão Roberts",
        title: "O nome que desapareceu",
        answer: "Sofia",
        clue: "charles-secret",
      },
      {
        place: "Mansão Roberts",
        title: "O objeto emprestado",
        answer: "fotografia",
        clue: "dorothy-photo",
      },
      {
        place: "Trinity Church",
        title: "O nome no envelope",
        answer: "Daniel",
        clue: "daniel-letter",
      },
      {
        place: "Lago Cherry Creek",
        title: "Quem repousava no carro?",
        answer: "Henry Johnson",
        clue: "henry-death",
      },
    ];

    for (const riddle of riddles) {
      if (riddle.place) {
        fireEvent.click(screen.getByRole("button", { name: new RegExp(riddle.place) }));
      }
      const answer = screen.getByRole("textbox", {
        name: `Resposta para ${riddle.title}`,
      });
      fireEvent.change(answer, { target: { value: riddle.answer } });
      fireEvent.submit(answer.closest("form")!);
      expect(screen.getByRole("status"), riddle.title).toHaveTextContent("Enigma resolvido");
    }

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
    expect(saved.version).toBe(3);
    expect(saved.solvedRiddles).toEqual([
      "archive-identity",
      "archive-police",
      "hospital-amount",
      "hospital-vivian",
      "mansion-code",
      "mansion-secret",
      "mansion-photo",
      "church-recipient",
      "lake-doctor",
    ]);
    expect(saved.found).toEqual(expect.arrayContaining(ALL_CLUES));
  });
});
