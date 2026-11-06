import { describe, expect, it } from "vitest";
import {
  THRESHOLD_CLAIMS,
  THRESHOLD_INTERVIEWS,
  THRESHOLD_RECORDS,
  THRESHOLD_STAGES,
  THRESHOLD_VERDICTS,
  checkThresholdStageClaims,
  getThresholdActionCounts,
  getThresholdScore,
  type ThresholdClaimAnswers,
} from "@/game/thresholdCase";

describe("Caso 09 · Threshold", () => {
  it("mantém a cronologia em quatro etapas progressivas", () => {
    expect(THRESHOLD_STAGES.map((stage) => stage.id)).toEqual([
      "program",
      "marlon",
      "spread",
      "final",
    ]);
    expect(
      THRESHOLD_RECORDS.every((record) =>
        THRESHOLD_STAGES.some((stage) => stage.id === record.stage),
      ),
    ).toBe(true);
    expect(
      THRESHOLD_INTERVIEWS.every((interview) =>
        THRESHOLD_STAGES.some((stage) => stage.id === interview.stage),
      ),
    ).toBe(true);
  });

  it("classifica todas as afirmações pela natureza da fonte, sem promover hipótese a fato", () => {
    const answers: ThresholdClaimAnswers = {};
    for (const claim of THRESHOLD_CLAIMS) answers[claim.id] = claim.correctClass;

    for (const stage of THRESHOLD_STAGES) {
      expect(checkThresholdStageClaims(stage.id, answers)).toBe(true);
    }
    const flowerClaim = THRESHOLD_CLAIMS.find((claim) => claim.id === "flower-hypothesis")!;
    expect(flowerClaim.correctClass).toBe("hypothesis");
    expect(checkThresholdStageClaims("spread", { ...answers, [flowerClaim.id]: "witness" })).toBe(
      false,
    );
  });

  it("preserva as lacunas canônicas sobre o Registro 217, o exame de Iara e o encerramento da ameaça", () => {
    expect(THRESHOLD_RECORDS.find((record) => record.id === "folder-217")?.text).toMatch(
      /não mostra seu conteúdo/i,
    );
    expect(THRESHOLD_RECORDS.find((record) => record.id === "ira-test")?.text).toMatch(
      /nem declara que Iara está imune ou infectada/i,
    );
    expect(THRESHOLD_RECORDS.find((record) => record.id === "coin-217")?.text).toMatch(
      /não confirma.*pasta/i,
    );
    expect(THRESHOLD_VERDICTS.find((verdict) => verdict.correct)?.title).toMatch(
      /continuam sem prova/i,
    );
  });

  it("atribui 100 pontos e 100% de precisão a uma conclusão perfeita", () => {
    const score = getThresholdScore({
      recordsOpened: THRESHOLD_RECORDS.length,
      interviewsOpened: THRESHOLD_INTERVIEWS.length,
      claimsCorrect: THRESHOLD_CLAIMS.length,
      stagesCompleted: THRESHOLD_STAGES.length,
      verdictCorrect: true,
      mistakes: 0,
      hints: 0,
    });
    const actions = getThresholdActionCounts({
      recordsOpened: THRESHOLD_RECORDS.length,
      interviewsOpened: THRESHOLD_INTERVIEWS.length,
      claimsCorrect: THRESHOLD_CLAIMS.length,
      stagesCompleted: THRESHOLD_STAGES.length,
      verdictCorrect: true,
    });

    expect(score).toBe(100);
    expect(actions.correctActions).toBe(actions.totalActions);
  });

  it("limita a pontuação a 100 e penaliza erros e dicas", () => {
    const perfect = {
      recordsOpened: THRESHOLD_RECORDS.length,
      interviewsOpened: THRESHOLD_INTERVIEWS.length,
      claimsCorrect: THRESHOLD_CLAIMS.length,
      stagesCompleted: THRESHOLD_STAGES.length,
      verdictCorrect: true,
    };
    expect(getThresholdScore({ ...perfect, mistakes: 2, hints: 1 })).toBe(87);
    expect(getThresholdScore({ ...perfect, mistakes: -10, hints: -4 })).toBe(100);
    expect(
      getThresholdScore({
        ...perfect,
        recordsOpened: 999,
        interviewsOpened: 999,
        claimsCorrect: 999,
        stagesCompleted: 999,
        mistakes: 0,
        hints: 0,
      }),
    ).toBe(100);
  });
});
