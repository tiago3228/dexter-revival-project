import { describe, expect, it } from "vitest";

import {
  applyCasePerformance,
  emptyAchievementProgress,
  type AchievementProgress,
} from "@/game/achievements";

const performance = {
  caseId: "ortega" as const,
  score: 94,
  hints: 0,
  mistakes: 0,
  correctConclusion: true,
};

describe("game achievements", () => {
  it("unlocks performance trophies and stores a completed chapter", () => {
    const progress = applyCasePerformance(emptyAchievementProgress(), performance);

    expect(progress.completedCases).toEqual(["ortega"]);
    expect(progress.bestScores.ortega).toBe(94);
    expect(progress.unlockedIds).toEqual(
      expect.arrayContaining([
        "first-case",
        "sharp-eye",
        "no-hints",
        "clean-run",
        "correct-verdict",
      ]),
    );
  });

  it("unlocks the interrogation trophy only for a perfect three-suspect run", () => {
    const perfect = applyCasePerformance(emptyAchievementProgress(), {
      ...performance,
      caseId: "painscreek",
      correctInterrogations: 3,
      interrogationMistakes: 0,
    });
    const imperfect = applyCasePerformance(emptyAchievementProgress(), {
      ...performance,
      caseId: "painscreek",
      correctInterrogations: 3,
      interrogationMistakes: 1,
    });

    expect(perfect.unlockedIds).toContain("master-interrogator");
    expect(imperfect.unlockedIds).not.toContain("master-interrogator");
  });

  it("unlocks the collection trophy only after all three chapters are completed", () => {
    let progress = emptyAchievementProgress();
    progress = applyCasePerformance(progress, performance);
    progress = applyCasePerformance(progress, { ...performance, caseId: "monroe" });
    expect(progress.unlockedIds).not.toContain("all-cases");
    progress = applyCasePerformance(progress, { ...performance, caseId: "painscreek" });

    expect(progress.completedCases).toHaveLength(3);
    expect(progress.unlockedIds).toContain("all-cases");
  });

  it("never lowers a chapter's stored best score", () => {
    const firstRun = applyCasePerformance(emptyAchievementProgress(), performance);
    const lowerRun = applyCasePerformance(firstRun, {
      ...performance,
      score: 70,
      hints: 2,
      mistakes: 3,
      correctConclusion: false,
    });
    const stored = lowerRun as AchievementProgress;

    expect(stored.bestScores.ortega).toBe(94);
    expect(stored.completedCases).toEqual(["ortega"]);
  });
});
