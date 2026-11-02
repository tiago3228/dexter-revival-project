import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MinigameProgressDashboard } from "../game/MinigameProgressDashboard";
import {
  MINIGAME_CATALOG,
  MINIGAME_PROGRESS_EVENT,
  MINIGAME_PROGRESS_STORAGE_KEY,
  markMinigameStarted,
  readMinigameProgress,
  recordMinigameProgress,
} from "../game/minigameProgress";
import { QUICK_CASE_IDS } from "../game/vivianQuickCases";

const investigationKey = "vivian-playable-investigation-v1";
const knownKeys = [
  MINIGAME_PROGRESS_STORAGE_KEY,
  investigationKey,
  "dexter-circuit-panel-completed-v1",
  "dexter-circuit-panel-level-v1",
  "dexter-dot-connection-completed-v1",
];

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => cleanup());

describe("minigame progress registry", () => {
  it("catalogs exactly the 14 stable IDs", () => {
    expect(MINIGAME_CATALOG.map(({ id }) => id)).toEqual([
      "flag-game",
      "circuit-panel",
      "dot-connection",
      "seal-code",
      "deduction-grid",
      "relations-dossier",
      "witness-route",
      "detective-ring",
      "quick-challenges",
      "painscreek-murdle-grid",
      "evidence-chain",
      "mine-settlement",
      "sheriff-transfer",
      "impossible-window",
    ]);
  });

  it("persists completions, deduplicates, validates IDs and unit IDs", () => {
    recordMinigameProgress("flag-game", "played");
    recordMinigameProgress("flag-game", "played");
    expect(recordMinigameProgress("flag-game", "bogus").completed["flag-game"]).toEqual(["played"]);
    recordMinigameProgress("circuit-panel", "level-2");
    const corrupted = JSON.parse(localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY)!);
    corrupted.completed["flag-game"].push("invalid");
    corrupted.completed["intruder"] = ["x"];
    corrupted.started = ["flag-game", "flag-game", "intruder"];
    localStorage.setItem(MINIGAME_PROGRESS_STORAGE_KEY, JSON.stringify(corrupted));
    const state = readMinigameProgress();
    expect(state.completed["flag-game"]).toEqual(["played"]);
    expect(state.completed["circuit-panel"]).toEqual(["level-2"]);
    expect(state.started).toEqual(["flag-game"]);
  });

  it("conservatively merges circuit, dot and quick case legacy without rewriting investigation save", () => {
    localStorage.setItem("dexter-circuit-panel-level-v1", "1");
    localStorage.setItem("dexter-dot-connection-completed-v1", "true");
    const investigationSave = {
      found: ["police-report"],
      completedQuickCases: [QUICK_CASE_IDS[0], "invalid-case"],
      other: "preserved",
    };
    localStorage.setItem(investigationKey, JSON.stringify(investigationSave));
    const state = readMinigameProgress();
    expect(state.completed["circuit-panel"]).toEqual(["level-1", "level-2"]);
    expect(state.completed["dot-connection"]).toEqual(["level-1", "level-2", "level-3", "level-4"]);
    expect(state.completed["quick-challenges"]).toEqual([QUICK_CASE_IDS[0]]);
    expect(JSON.parse(localStorage.getItem(investigationKey)!)).toEqual(investigationSave);
    localStorage.setItem("dexter-circuit-panel-level-v1", "0");
    expect(readMinigameProgress().completed["circuit-panel"]).toEqual([]);
    localStorage.setItem("dexter-circuit-panel-completed-v1", "true");
    expect(readMinigameProgress().completed["circuit-panel"]).toHaveLength(3);
  });

  it("dispatches the custom progress event for writes", () => {
    const listener = vi.fn();
    window.addEventListener(MINIGAME_PROGRESS_EVENT, listener);
    markMinigameStarted("seal-code");
    recordMinigameProgress("seal-code", "solved");
    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener(MINIGAME_PROGRESS_EVENT, listener);
  });
});

describe("MinigameProgressDashboard", () => {
  it("shows 14 cards, status summary, and truthful continuous activity wording", () => {
    markMinigameStarted("circuit-panel");
    recordMinigameProgress("flag-game", "played");
    render(<MinigameProgressDashboard />);
    expect(screen.getByRole("region", { name: "Progresso dos minigames" })).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(14);
    expect(screen.getByText("Mini Game de Bandeiras").closest("li")).toHaveTextContent(
      "Atividade registrada",
    );
    expect(screen.getByText("Mini Game de Bandeiras").closest("li")).not.toHaveTextContent(
      "Concluído",
    );
    expect(screen.getByText("1 completos · 1 em andamento · 12 não iniciados")).toBeInTheDocument();
  });

  it("updates when progress and investigation events arrive", () => {
    render(<MinigameProgressDashboard />);
    expect(screen.getAllByText("0 de 1 unidades").length).toBeGreaterThan(0);
    localStorage.setItem(
      MINIGAME_PROGRESS_STORAGE_KEY,
      JSON.stringify({ completed: { "seal-code": ["solved"] }, started: [] }),
    );
    fireEvent(window, new Event(MINIGAME_PROGRESS_EVENT));
    expect(screen.getAllByText("1 de 1 unidades").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Concluído").length).toBeGreaterThan(0);
    localStorage.setItem(
      investigationKey,
      JSON.stringify({ completedQuickCases: [QUICK_CASE_IDS[0]] }),
    );
    fireEvent(window, new Event("vivian-investigation-progress"));
    expect(screen.getByText(`1 de ${QUICK_CASE_IDS.length} unidades`)).toBeInTheDocument();
  });
});
