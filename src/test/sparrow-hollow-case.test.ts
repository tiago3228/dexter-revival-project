import { describe, expect, it } from "vitest";
import {
  SPARROW_HOLLOW_CLAIMS,
  SPARROW_HOLLOW_EVIDENCE_CLASSES,
  SPARROW_HOLLOW_INTERVIEWS,
  SPARROW_HOLLOW_RECORDS,
  SPARROW_HOLLOW_STAGES,
  SPARROW_HOLLOW_TIMELINE,
  SPARROW_HOLLOW_VERDICTS,
  checkSparrowHollowStageClaims,
  getSparrowHollowActionCounts,
  getSparrowHollowScore,
  type SparrowHollowClaimAnswers,
} from "@/game/sparrowHollowCase";

describe("Caso 08 · Sparrow Hollow — cânone e progressão", () => {
  it("mantém a investigação em quatro etapas e não libera o clímax na abertura", () => {
    expect(SPARROW_HOLLOW_STAGES).toHaveLength(4);
    expect(SPARROW_HOLLOW_STAGES[0].id).toBe("archive");
    expect(SPARROW_HOLLOW_TIMELINE.filter((event) => event.stage === "archive")).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Seis crianças na pedreira" })]),
    );
    expect(SPARROW_HOLLOW_TIMELINE.find((event) => event.id === "equinox")?.stage).toBe("equinox");
  });

  it("separa o retorno de Marcus no quarto dia do relato de três dias sobre a irmã de Boyle", () => {
    const returnRecord = SPARROW_HOLLOW_RECORDS.find((record) => record.id === "marcus-return");
    const boyleRecord = SPARROW_HOLLOW_RECORDS.find((record) => record.id === "boyle-three-days");

    expect(returnRecord?.title).toContain("quarto dia");
    expect(returnRecord?.text).toContain("começo do quarto dia");
    expect(boyleRecord?.text).toContain("passou três dias longe");
    expect(boyleRecord?.text).toContain("1962");
    expect(boyleRecord?.text).toContain("não é a cronologia");
  });

  it("não apresenta Vostok como fato textual nem transforma a hipótese da semente em prova", () => {
    const caseText = [
      ...SPARROW_HOLLOW_RECORDS.map((record) => record.text),
      ...SPARROW_HOLLOW_CLAIMS.map((claim) => claim.statement),
      ...SPARROW_HOLLOW_VERDICTS.map((verdict) => verdict.title),
    ].join(" ");
    const seedClaim = SPARROW_HOLLOW_CLAIMS.find((claim) => claim.id === "seed-interpretation");

    expect(caseText.toLowerCase()).not.toContain("vostok");
    expect(seedClaim?.correctClass).toBe("hypothesis");
    expect(SPARROW_HOLLOW_EVIDENCE_CLASSES.map((item) => item.id)).toContain("unsupported");
  });

  it("aceita somente a classificação correta de todas as afirmações da etapa", () => {
    const archiveClaims = SPARROW_HOLLOW_CLAIMS.filter((claim) => claim.stage === "archive");
    const correctAnswers = Object.fromEntries(
      archiveClaims.map((claim) => [claim.id, claim.correctClass]),
    ) as SparrowHollowClaimAnswers;

    expect(checkSparrowHollowStageClaims("archive", correctAnswers)).toBe(true);
    expect(
      checkSparrowHollowStageClaims("archive", {
        ...correctAnswers,
        "collapse-certain": "witness",
      }),
    ).toBe(false);
  });

  it("alcança 100 pontos e 100% de precisão quando todas as ações estão corretas", () => {
    const score = getSparrowHollowScore({
      recordsOpened: SPARROW_HOLLOW_RECORDS.length,
      interviewsOpened: SPARROW_HOLLOW_INTERVIEWS.length,
      claimsCorrect: SPARROW_HOLLOW_CLAIMS.length,
      stagesCompleted: SPARROW_HOLLOW_STAGES.length,
      verdictCorrect: true,
      mistakes: 0,
      hints: 0,
    });
    const actions = getSparrowHollowActionCounts({
      recordsOpened: SPARROW_HOLLOW_RECORDS.length,
      interviewsOpened: SPARROW_HOLLOW_INTERVIEWS.length,
      claimsCorrect: SPARROW_HOLLOW_CLAIMS.length,
      stagesCompleted: SPARROW_HOLLOW_STAGES.length,
      verdictCorrect: true,
      mistakes: 0,
    });

    expect(score).toBe(100);
    expect(actions.correctActions).toBe(actions.totalActions);
    expect(Math.round((actions.correctActions / actions.totalActions) * 100)).toBe(100);
  });

  it("contabiliza erros na precisão e reduz a pontuação por erro ou orientação", () => {
    const flawless = getSparrowHollowActionCounts({
      recordsOpened: 2,
      interviewsOpened: 1,
      claimsCorrect: 3,
      stagesCompleted: 1,
      verdictCorrect: false,
      mistakes: 0,
    });
    const withMistakes = getSparrowHollowActionCounts({
      recordsOpened: 2,
      interviewsOpened: 1,
      claimsCorrect: 3,
      stagesCompleted: 1,
      verdictCorrect: false,
      mistakes: 2,
    });
    const cleanScore = getSparrowHollowScore({
      recordsOpened: SPARROW_HOLLOW_RECORDS.length,
      interviewsOpened: SPARROW_HOLLOW_INTERVIEWS.length,
      claimsCorrect: SPARROW_HOLLOW_CLAIMS.length,
      stagesCompleted: SPARROW_HOLLOW_STAGES.length,
      verdictCorrect: true,
      mistakes: 0,
      hints: 0,
    });

    expect(withMistakes.correctActions).toBe(flawless.correctActions);
    expect(withMistakes.totalActions).toBe(flawless.totalActions + 2);
    expect(
      getSparrowHollowScore({
        recordsOpened: SPARROW_HOLLOW_RECORDS.length,
        interviewsOpened: SPARROW_HOLLOW_INTERVIEWS.length,
        claimsCorrect: SPARROW_HOLLOW_CLAIMS.length,
        stagesCompleted: SPARROW_HOLLOW_STAGES.length,
        verdictCorrect: true,
        mistakes: 1,
        hints: 0,
      }),
    ).toBeLessThan(cleanScore);
    expect(
      getSparrowHollowScore({
        recordsOpened: SPARROW_HOLLOW_RECORDS.length,
        interviewsOpened: SPARROW_HOLLOW_INTERVIEWS.length,
        claimsCorrect: SPARROW_HOLLOW_CLAIMS.length,
        stagesCompleted: SPARROW_HOLLOW_STAGES.length,
        verdictCorrect: true,
        mistakes: 0,
        hints: 1,
      }),
    ).toBeLessThan(cleanScore);
  });
});
