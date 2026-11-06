import { describe, expect, it } from "vitest";

import {
  TRILOGY_CROSS_CLUES,
  checkTrilogyCrossClues,
  checkTrilogySignals,
} from "@/game/trilogyCrossClues";

describe("pistas cruzadas da trilogia", () => {
  it("mantém pelo menos seis relações novas entre os arquivos", () => {
    expect(TRILOGY_CROSS_CLUES).toHaveLength(6);
    expect(new Set(TRILOGY_CROSS_CLUES.map((clue) => clue.id)).size).toBe(6);
  });

  it("aceita somente o mapa completo de conexões correto", () => {
    const solved = Object.fromEntries(TRILOGY_CROSS_CLUES.map((clue) => [clue.id, clue.answer]));
    expect(checkTrilogyCrossClues(solved)).toBe(true);
    expect(checkTrilogyCrossClues({ ...solved, [TRILOGY_CROSS_CLUES[0]!.id]: "blackpine" })).toBe(
      false,
    );
  });

  it("preserva os três sinais-base dos livros", () => {
    expect(
      checkTrilogySignals({
        vostok: "sparrow",
        "ash-creek": "threshold",
        "seventeen-coins": "blackpine",
      }),
    ).toBe(true);
  });
});
