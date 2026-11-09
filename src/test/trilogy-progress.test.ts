import { describe, expect, it } from "vitest";

import { emptyAchievementProgress } from "@/game/achievements";
import {
  applyTrilogyPerformanceBonus,
  formatTrilogyTime,
  getTrilogyPerformanceBonus,
  getTrilogyProgress,
  loadTrilogySave,
  recordTrilogyPerformance,
} from "@/game/trilogyProgress";

describe("placar da trilogia", () => {
  it("salva tentativas, bônus e melhores resultados no localStorage", () => {
    window.localStorage.clear();
    recordTrilogyPerformance({
      caseId: "blackpine",
      score: 96,
      hints: 0,
      mistakes: 0,
      correctConclusion: true,
      elapsedSeconds: 240,
      correctActions: 10,
      totalActions: 10,
    });
    recordTrilogyPerformance({
      caseId: "blackpine",
      score: 80,
      hints: 1,
      mistakes: 2,
      correctConclusion: true,
      elapsedSeconds: 700,
      correctActions: 8,
      totalActions: 10,
    });

    const saved = loadTrilogySave();
    expect(saved.version).toBe(1);
    expect(saved.chapters.blackpine).toMatchObject({
      completed: true,
      attempts: 2,
      lastScore: 80,
      bestScore: 96,
      lastElapsedSeconds: 700,
      bestElapsedSeconds: 240,
      lastBonus: 1,
      bestBonus: 10,
      totalMistakes: 2,
      totalHints: 1,
    });
    expect(saved.updatedAt).toEqual(expect.any(String));
  });

  it("descarta versões inválidas e retorna um save vazio", () => {
    window.localStorage.setItem("dexter-trilogy-progress-v1", JSON.stringify({ version: 99 }));
    const saved = loadTrilogySave();
    expect(saved.chapters.blackpine.completed).toBe(false);
    expect(saved.chapters.threshold.attempts).toBe(0);
  });

  it("concede bônus por rapidez e ausência de erros", () => {
    expect(getTrilogyPerformanceBonus(240, 0)).toEqual({
      speedBonus: 5,
      errorFreeBonus: 5,
      totalBonus: 10,
    });
    expect(getTrilogyPerformanceBonus(720, 2).totalBonus).toBe(1);
    expect(applyTrilogyPerformanceBonus(94, 240, 0).score).toBe(100);
  });

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
