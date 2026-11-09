import { afterEach, describe, expect, it } from "vitest";
import { clearCaseProgress, readCaseProgress, writeCaseProgress } from "@/game/caseProgress";

const KEY = "test-case-progress";
const state = { stage: 2, opened: ["record-1"] };

afterEach(() => {
  window.localStorage.clear();
});

describe("caseProgress", () => {
  it("salva, lê e limpa o estado de uma investigação", () => {
    writeCaseProgress(KEY, { stage: 2, opened: ["record-1"] });

    expect(readCaseProgress<typeof state>(KEY)?.state).toEqual(state);

    clearCaseProgress(KEY);
    expect(readCaseProgress(KEY)).toBeNull();
  });

  it("ignora registros com versão inválida", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ version: 99, state: { stage: 1 } }));
    expect(readCaseProgress(KEY)).toBeNull();
  });
});
