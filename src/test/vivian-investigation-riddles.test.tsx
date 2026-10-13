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

function seedCompleteInvestigation(
  reportSubmitted = false,
  solvedCodeLocks = ["katherine-cabinet", "study-drawer", "gallery-safe"],
) {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 3,
      found: ALL_CLUES,
      solvedRiddles: [],
      solvedCodeLocks,
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

  it("keeps riddle hints hidden until the player confirms the point penalty", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);

    const hintButton = screen.getAllByRole("button", { name: "Ver dica (-20 pontos)" })[0]!;
    fireEvent.click(hintButton);
    expect(screen.getByRole("alertdialog")).toHaveTextContent("20 pontos");
    fireEvent.click(screen.getByRole("button", { name: "Não, voltar" }));
    expect(screen.queryByText(/A resposta começa com S/)).not.toBeInTheDocument();

    fireEvent.click(hintButton);
    fireEvent.click(screen.getByRole("button", { name: "Sim, abrir dica" }));
    expect(screen.getAllByText(/A resposta começa com S/).length).toBeGreaterThan(0);
  });

  it("opens the complete dossier with the three-dial M99 combination after the report", () => {
    render(<VivianInvestigationGame onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Dossiê completo" }));
    for (let index = 0; index < 12; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 1 para cima" }));
    }
    for (let index = 0; index < 9; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 2 para cima" }));
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 3 para cima" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Abrir dossiê" }));
    expect(screen.getByRole("heading", { name: "Caso resolvido" })).toBeInTheDocument();

    cleanup();
    window.localStorage.clear();
    seedCompleteInvestigation(true);
    render(<VivianInvestigationGame onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Dossiê completo" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir dossiê" }));
    expect(screen.getByRole("alert")).toHaveTextContent("combinação está incorreta");

    for (let index = 0; index < 12; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 1 para cima" }));
    }
    for (let index = 0; index < 9; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 2 para cima" }));
      fireEvent.click(screen.getByRole("button", { name: "Girar disco 3 para cima" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Abrir dossiê" }));
    expect(screen.getByRole("heading", { name: "Caso resolvido" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dossiê completo de Painscreek" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fita secreta procurada por Magdalene/)).toBeInTheDocument();
  }, 15000);

  it("solves Resident Evil-style code locks before the final password is revealed", () => {
    seedCompleteInvestigation(false, []);
    render(<VivianInvestigationGame onBack={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /Hospital Comunitário/ }));
    const katherineCode = screen.getByRole("textbox", {
      name: "Código para Armário de Katherine",
    });
    fireEvent.change(katherineCode, { target: { value: "0000" } });
    fireEvent.submit(katherineCode.closest("form")!);
    expect(screen.getByRole("status")).toHaveTextContent("Código incorreto");
    fireEvent.change(katherineCode, { target: { value: "1964" } });
    fireEvent.submit(katherineCode.closest("form")!);

    fireEvent.click(screen.getByRole("button", { name: /Mansão Roberts/ }));
    const studyCode = screen.getByRole("textbox", { name: "Código para Gaveta do estudo" });
    fireEvent.change(studyCode, { target: { value: "5194" } });
    fireEvent.submit(studyCode.closest("form")!);
    const galleryCode = screen.getByRole("textbox", { name: "Código para Cofre da galeria" });
    fireEvent.change(galleryCode, { target: { value: "611975" } });
    fireEvent.submit(galleryCode.closest("form")!);

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
    expect(saved.solvedCodeLocks).toEqual(["katherine-cabinet", "study-drawer", "gallery-safe"]);
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
