import { describe, expect, it } from "vitest";

import { clearCaseProgress, readCaseProgress, writeCaseProgress } from "@/game/caseProgress";
import {
  BLACK_PINE_DLC_PROGRESS_KEY,
  BLACK_PINE_DLC_SOLUTION,
  checkBlackPineDlcSolution,
} from "@/game/blackPineDlcCase";

describe("DLC A Moeda 217", () => {
  it("aceita somente a combinação sustentada pelas fontes", () => {
    expect(checkBlackPineDlcSolution(BLACK_PINE_DLC_SOLUTION)).toBe(true);
    expect(
      checkBlackPineDlcSolution({
        ...BLACK_PINE_DLC_SOLUTION,
        location: "station-locker",
      }),
    ).toBe(false);
  });

  it("salva e restaura o rascunho sem misturá-lo ao resultado final", () => {
    window.localStorage.clear();
    writeCaseProgress(BLACK_PINE_DLC_PROGRESS_KEY, {
      tab: "grid",
      openedRecords: ["token"],
      selection: { suspect: "", object: "token-217", location: "" },
      mistakes: 1,
      hints: 0,
      feedback: "",
      elapsedSeconds: 42,
    });

    expect(readCaseProgress(BLACK_PINE_DLC_PROGRESS_KEY)?.state).toMatchObject({
      tab: "grid",
      openedRecords: ["token"],
      elapsedSeconds: 42,
    });
    clearCaseProgress(BLACK_PINE_DLC_PROGRESS_KEY);
    expect(readCaseProgress(BLACK_PINE_DLC_PROGRESS_KEY)).toBeNull();
  });
});
