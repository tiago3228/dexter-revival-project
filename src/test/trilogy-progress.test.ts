import { describe, expect, it } from "vitest";

import { emptyAchievementProgress } from "@/game/achievements";
import { formatTrilogyTime, getTrilogyProgress } from "@/game/trilogyProgress";

describe("placar da trilogia", () => {
  it("formata tempos curtos e longos para o placar", () => {
    expect(formatTrilogyTime(125)).toBe("2min 05s");
    expect(formatTrilogyTime(3665)).toBe("1h 01min");
    expect(formatTrilogyTime(null)).toBe("—");
  });

  it("consolida pontuação e tempo somente após os três capítulos", () => {
    const progress = emptyAchievementProgress();
    progress.completedCases = ["blackpine", "sparrowhollow", "threshold"];
    progress.bestScores = { blackpine: 91, sparrowhollow: 88, threshold: 95 };
    progress.caseStats = {
      blackpine: {
        attempts: 1,
        lastElapsedSeconds: 300,
        bestElapsedSeconds: 300,
        lastCorrectActions: 10,
        lastTotalActions: 10,
      },
      sparrowhollow: {
        attempts: 1,
        lastElapsedSeconds: 420,
        bestElapsedSeconds: 420,
        lastCorrectActions: 10,
        lastTotalActions: 12,
      },
      threshold: {
        attempts: 1,
        lastElapsedSeconds: 510,
        bestElapsedSeconds: 510,
        lastCorrectActions: 12,
        lastTotalActions: 12,
      },
    };

    expect(getTrilogyProgress(progress)).toMatchObject({
      completed: 3,
      completionPercent: 100,
      totalScore: 274,
      averageScore: 91,
      totalBestTime: 1230,
      rank: "ARQUIVISTA DA TRILOGIA",
    });
  });

  it("não inventa tempo total antes de concluir todos os capítulos", () => {
    const progress = emptyAchievementProgress();
    progress.completedCases = ["blackpine"];
    progress.bestScores = { blackpine: 80 };
    progress.caseStats = {
      blackpine: {
        attempts: 1,
        lastElapsedSeconds: 240,
        bestElapsedSeconds: 240,
        lastCorrectActions: 8,
        lastTotalActions: 10,
      },
    };

    expect(getTrilogyProgress(progress)).toMatchObject({
      completed: 1,
      completionPercent: 33,
      totalBestTime: null,
      rank: "INVESTIGADOR EM PROGRESSO",
    });
  });
});
