import { describe, expect, it } from "vitest";
import { compareRankingEntries, normalizePlayerName } from "@/game/playerRanking";

describe("player ranking", () => {
  it("normalizes investigator names", () => {
    expect(normalizePlayerName("  Morgan   Silva  ")).toBe("Morgan Silva");
    expect(normalizePlayerName("a".repeat(30))).toHaveLength(24);
  });

  it("puts higher scores first and uses errors and hints as tie breakers", () => {
    const clean = {
      name: "A",
      score: 100,
      casesCompleted: 1,
      mistakes: 0,
      hints: 0,
      lastPlayedAt: 1,
    };
    const errors = {
      name: "B",
      score: 100,
      casesCompleted: 1,
      mistakes: 2,
      hints: 0,
      lastPlayedAt: 2,
    };
    const lower = {
      name: "C",
      score: 90,
      casesCompleted: 1,
      mistakes: 0,
      hints: 0,
      lastPlayedAt: 3,
    };
    expect([errors, lower, clean].sort(compareRankingEntries).map((entry) => entry.name)).toEqual([
      "A",
      "B",
      "C",
    ]);
  });
});
