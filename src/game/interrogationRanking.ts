export type InterrogationRanking = {
  attempts: number;
  score: number;
  rank: string;
};

export function getInterrogationRanking(
  correctAnswers: number,
  wrongAnswers: number,
): InterrogationRanking {
  const validCorrect = Number.isFinite(correctAnswers)
    ? Math.min(3, Math.max(0, Math.floor(correctAnswers)))
    : 0;
  const validWrong = Number.isFinite(wrongAnswers) ? Math.max(0, Math.floor(wrongAnswers)) : 0;
  const attempts = validCorrect + validWrong;
  const score = attempts === 0 ? 0 : Math.round((validCorrect / attempts) * 100);
  const rank =
    attempts === 0
      ? "Aguardando interrogatórios"
      : validCorrect === 3 && score === 100
        ? "Mestre do interrogatório"
        : validCorrect >= 2 && score >= 75
          ? "Interrogador perspicaz"
          : validCorrect >= 1 && score >= 50
            ? "Detetive atento"
            : "Depoimentos inconclusivos";

  return { attempts, score, rank };
}
