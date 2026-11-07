import { describe, expect, it } from "vitest";

import { getUnlockedTrilogyBadges } from "@/game/trilogyAchievements";
import { emptyTrilogySave, type TrilogySaveData } from "@/game/trilogyProgress";

function completedSave(overrides: Partial<TrilogySaveData["chapters"]["blackpine"]> = {}) {
  const save = emptyTrilogySave();
  for (const caseId of ["blackpine", "sparrowhollow", "threshold"] as const) {
    save.chapters[caseId] = {
      ...save.chapters[caseId],
      completed: true,
      attempts: 1,
      bestScore: 95,
      lastScore: 95,
      bestElapsedSeconds: 240,
      lastElapsedSeconds: 240,
      bestBonus: 10,
      lastBonus: 10,
      bestMistakes: 0,
      lastMistakes: 0,
      bestHints: 0,
      lastHints: 0,
      ...overrides,
    };
  }
  return save;
}

describe("troféus da trilogia", () => {
  it("desbloqueia o troféu inicial e o de três arquivos progressivamente", () => {
    const save = emptyTrilogySave();
    save.chapters.blackpine.completed = true;
    expect(getUnlockedTrilogyBadges(save)).toEqual(["first-trilogy-file"]);

    const complete = completedSave();
    expect(getUnlockedTrilogyBadges(complete)).toEqual([
      "first-trilogy-file",
      "three-archives",
      "clean-trilogy",
      "no-hints-trilogy",
      "speed-trilogy",
      "elite-trilogy",
      "trilogy-master",
    ]);
  });

  it("não libera troféus de execução limpa quando há erros ou dicas salvos", () => {
    const save = completedSave({ bestMistakes: 1, bestHints: 1 });
    const unlocked = getUnlockedTrilogyBadges(save);
    expect(unlocked).toContain("three-archives");
    expect(unlocked).not.toContain("clean-trilogy");
    expect(unlocked).not.toContain("no-hints-trilogy");
    expect(unlocked).not.toContain("trilogy-master");
  });
});
