import { describe, expect, it } from "vitest";
import {
  BLACK_PINE_ARTIFACTS,
  BLACK_PINE_ARTIFACT_SOLUTION,
  BLACK_PINE_COIN_MESSAGE,
  BLACK_PINE_INTERVIEWS,
  BLACK_PINE_LOCATION_SOLUTION,
  BLACK_PINE_LOCATIONS,
  BLACK_PINE_PEOPLE,
  BLACK_PINE_RECORDS,
  BLACK_PINE_TIMELINE,
  getBlackPineActionCounts,
} from "@/game/blackPineCase";

describe("Caso Black Pine — cronologia e estatísticas", () => {
  it("separa o quarto 17 de Ethan do quarto não numerado de Whitmore", () => {
    const ethanRoom = BLACK_PINE_RECORDS.find((record) => record.id === "ethan-room-17");
    const whitmoreRoom = BLACK_PINE_RECORDS.find((record) => record.id === "whitmore-room");

    expect(ethanRoom?.title).toContain("Ethan");
    expect(ethanRoom?.text).toContain("não deve ser confundido");
    expect(whitmoreRoom?.title).toContain("número não informado");
    expect(BLACK_PINE_TIMELINE[0].id).toBe("ethan-room-17");
    expect(BLACK_PINE_TIMELINE[1].id).toBe("whitmore-room");
  });

  it("mantém a mensagem das moedas com treze letras", () => {
    expect(BLACK_PINE_COIN_MESSAGE).toBe("WHITMORE SABIA");
    expect(BLACK_PINE_COIN_MESSAGE.replace(/\s/g, "")).toHaveLength(13);
  });

  it("registra vínculos de lugar sem exigir exclusividade entre pessoas", () => {
    const stationLinks = Object.values(BLACK_PINE_LOCATION_SOLUTION).filter((locations) =>
      locations.includes("station"),
    );

    expect(stationLinks.length).toBeGreaterThan(1);
    expect(BLACK_PINE_PEOPLE).toHaveLength(5);
    expect(BLACK_PINE_LOCATIONS).toHaveLength(5);
  });

  it("alcança 100% de precisão quando todas as ações concluídas são corretas", () => {
    const counts = getBlackPineActionCounts({
      recordsReviewed: BLACK_PINE_RECORDS.length,
      interviewsOpened: BLACK_PINE_INTERVIEWS.length,
      locationGridSolved: true,
      artifactGridSolved: true,
      correctVerdict: true,
      mistakes: 0,
    });
    const accuracy = Math.round((counts.correctActions / counts.totalActions) * 100);

    expect(counts.correctActions).toBe(counts.totalActions);
    expect(accuracy).toBe(100);
  });

  it("contabiliza tentativas incorretas no denominador da precisão", () => {
    const flawless = getBlackPineActionCounts({
      recordsReviewed: 0,
      interviewsOpened: 0,
      locationGridSolved: true,
      artifactGridSolved: true,
      correctVerdict: true,
      mistakes: 0,
    });
    const withMistakes = getBlackPineActionCounts({
      recordsReviewed: 0,
      interviewsOpened: 0,
      locationGridSolved: true,
      artifactGridSolved: true,
      correctVerdict: true,
      mistakes: 2,
    });

    expect(withMistakes.correctActions).toBe(flawless.correctActions);
    expect(withMistakes.totalActions).toBe(flawless.totalActions + 2);
  });

  it("mantém a atribuição de artefatos documentada", () => {
    expect(BLACK_PINE_ARTIFACT_SOLUTION.eleanor).toBe("coin-3");
    expect(BLACK_PINE_ARTIFACT_SOLUTION.margaret).toBe("coin-1");
    expect(BLACK_PINE_ARTIFACTS).toHaveLength(5);
  });
});
