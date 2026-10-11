import { describe, expect, it } from "vitest";

import { getInterrogationRanking } from "@/game/interrogationRanking";

describe("interrogation ranking", () => {
  it("does not rank a case before any interrogation attempt", () => {
    expect(getInterrogationRanking(0, 0)).toEqual({
      attempts: 0,
      score: 0,
      rank: "Aguardando interrogatórios",
    });
  });

  it("awards the top rank for all three correct choices without errors", () => {
    expect(getInterrogationRanking(3, 0)).toEqual({
      attempts: 3,
      score: 100,
      rank: "Mestre do interrogatório",
    });
  });

  it("uses correct and incorrect choices to calculate a partial score and rank", () => {
    expect(getInterrogationRanking(2, 1)).toEqual({
      attempts: 3,
      score: 67,
      rank: "Detetive atento",
    });
  });

  it("marks an interview record as inconclusive when errors dominate", () => {
    expect(getInterrogationRanking(1, 3)).toEqual({
      attempts: 4,
      score: 25,
      rank: "Depoimentos inconclusivos",
    });
  });
});
