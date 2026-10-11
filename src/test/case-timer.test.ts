import { afterEach, describe, expect, it, vi } from "vitest";

import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "@/game/caseTimer";

function mockLocalStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("case timer", () => {
  it("accumulates active time across pauses and resumes", () => {
    vi.stubGlobal("window", { localStorage: mockLocalStorage() });

    beginCaseTimer("ortega", true, 1_000);
    pauseCaseTimer("ortega", 6_000);
    beginCaseTimer("ortega", false, 8_000);

    expect(finishCaseTimer("ortega", 18_000)).toBe(15);
  });

  it("starts a fresh attempt when explicitly restarted", () => {
    vi.stubGlobal("window", { localStorage: mockLocalStorage() });

    beginCaseTimer("monroe", true, 2_000);
    pauseCaseTimer("monroe", 7_000);
    beginCaseTimer("monroe", true, 9_000);

    expect(finishCaseTimer("monroe", 11_000)).toBe(2);
  });
});
