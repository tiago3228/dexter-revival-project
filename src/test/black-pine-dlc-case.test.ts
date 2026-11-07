import { describe, expect, it } from "vitest";

import { BLACK_PINE_DLC_SOLUTION, checkBlackPineDlcSolution } from "@/game/blackPineDlcCase";

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
});
