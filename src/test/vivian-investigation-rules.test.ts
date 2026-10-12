import { describe, expect, it } from "vitest";

import {
  calculateInvestigationScore,
  MAX_SCORE,
  normalizeSavedIds,
} from "@/game/vivianInvestigationRules";

describe("Vivian investigation rules", () => {
  it("starts at 1,000 points and applies the 20/50/100-point hint costs", () => {
    expect(calculateInvestigationScore([])).toEqual({ penalty: 0, score: MAX_SCORE });
    expect(
      calculateInvestigationScore(["police-report:1", "scott-denial:2", "code-0318:3"]),
    ).toEqual({ penalty: 170, score: 830 });
  });

  it("charges a repeated hint only once, including duplicates restored from a save", () => {
    expect(
      calculateInvestigationScore(["police-report:2", "police-report:2", "police-report:2"]),
    ).toEqual({ penalty: 50, score: 950 });
  });

  it("does not let the score fall below zero", () => {
    const allHintLevels = Array.from({ length: 11 }, (_, index) => [
      `clue-${index}:1`,
      `clue-${index}:2`,
      `clue-${index}:3`,
    ]).flat();

    expect(calculateInvestigationScore(allHintLevels)).toEqual({ penalty: 1870, score: 0 });
  });

  it("ignores malformed hint keys", () => {
    expect(calculateInvestigationScore(["police-report:4", "unknown", "clue:"])).toEqual({
      penalty: 0,
      score: MAX_SCORE,
    });
  });

  it("filters invalid saved IDs and keeps only the first occurrence of each valid ID", () => {
    expect(
      normalizeSavedIds(["report", "report", "missing", 5, null], ["report", "letter"]),
    ).toEqual(["report"]);
  });
});
