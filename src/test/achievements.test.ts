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
  elapsedSeconds: 245,
  correctActions: 10,
  totalActions: 12,
};

describe("game achievements", () => {
  it("unlocks performance trophies and stores a completed chapter", () => {
    const progress = applyCasePerformance(emptyAchievementProgress(), performance);

    expect(progress.completedCases).toEqual(["ortega"]);
    expect(progress.bestScores.ortega).toBe(94);
    expect(progress.caseStats.ortega).toEqual({
      attempts: 1,
      lastElapsedSeconds: 245,
      bestElapsedSeconds: 245,
      lastCorrectActions: 10,
      lastTotalActions: 12,
    });
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

  it("unlocks the collection trophy only after all four chapters are completed", () => {
    let progress = emptyAchievementProgress();
    progress = applyCasePerformance(progress, performance);
    progress = applyCasePerformance(progress, { ...performance, caseId: "monroe" });
    expect(progress.unlockedIds).not.toContain("all-cases");
    progress = applyCasePerformance(progress, { ...performance, caseId: "painscreek" });
    expect(progress.unlockedIds).not.toContain("all-cases");
    progress = applyCasePerformance(progress, { ...performance, caseId: "mentalist" });

    expect(progress.completedCases).toHaveLength(4);
    expect(progress.unlockedIds).toContain("all-cases");
  });

  it("reserves the legendary blood-slide box for elite scores in every chapter and perfect interviews", () => {
    let progress = emptyAchievementProgress();
    progress = applyCasePerformance(progress, { ...performance, score: 95 });
    progress = applyCasePerformance(progress, { ...performance, caseId: "monroe", score: 92 });
    progress = applyCasePerformance(progress, {
      ...performance,
      caseId: "painscreek",
      score: 91,
      correctInterrogations: 3,
      interrogationMistakes: 0,
    });
    progress = applyCasePerformance(progress, {
      ...performance,
      caseId: "mentalist",
      score: 90,
    });

    expect(progress.unlockedIds).toContain("blood-slide-box");

    const incomplete = applyCasePerformance(emptyAchievementProgress(), {
      ...performance,
      caseId: "painscreek",
      correctInterrogations: 3,
      interrogationMistakes: 0,
    });
    expect(incomplete.unlockedIds).not.toContain("blood-slide-box");
  });

  it("never lowers a chapter's stored best score", () => {
    const firstRun = applyCasePerformance(emptyAchievementProgress(), performance);
    const lowerRun = applyCasePerformance(firstRun, {
      ...performance,
      score: 70,
      hints: 2,
      mistakes: 3,
      elapsedSeconds: 900,
      correctConclusion: false,
    });
    const stored = lowerRun as AchievementProgress;

    expect(stored.bestScores.ortega).toBe(94);
    expect(stored.completedCases).toEqual(["ortega"]);
    expect(stored.caseStats.ortega?.attempts).toBe(2);
    expect(stored.caseStats.ortega?.bestElapsedSeconds).toBe(245);
    expect(stored.caseStats.ortega?.lastElapsedSeconds).toBe(900);
  });
});
