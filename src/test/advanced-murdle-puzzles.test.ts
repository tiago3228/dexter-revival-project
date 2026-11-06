import { describe, expect, it } from "vitest";

import {
  SPARROW_ADVANCED_SEQUENCE,
  THRESHOLD_CONTRADICTION_ROWS,
  checkSparrowAdvancedSequence,
  checkThresholdContradictions,
} from "@/game/advancedMurdlePuzzles";

describe("enigmas Murdle avançados da trilogia", () => {
  it("exige a cadeia cronológica correta de Sparrow Hollow", () => {
    const solution = SPARROW_ADVANCED_SEQUENCE.map((item) => item.id);
    expect(checkSparrowAdvancedSequence(solution)).toBe(true);
    expect(checkSparrowAdvancedSequence([...solution].reverse())).toBe(false);
  });

  it("exige separar observação, hipótese e lacuna em Threshold", () => {
    const solution = Object.fromEntries(
      THRESHOLD_CONTRADICTION_ROWS.map((row) => [row.id, row.answer]),
    );
    expect(checkThresholdContradictions(solution)).toBe(true);
    expect(
      checkThresholdContradictions({
        ...solution,
        [THRESHOLD_CONTRADICTION_ROWS[0]!.id]: "localização comprovada",
      }),
    ).toBe(false);
  });
});
