import { TRILOGY_CASE_IDS, type TrilogySaveData, getSavedTrilogyProgress } from "./trilogyProgress";

export const TRILOGY_BADGES = [
  {
    id: "first-trilogy-file",
    title: "Primeiro elo",
    description: "Conclua qualquer capítulo da trilogia.",
    tier: "Bronze",
  },
  {
    id: "three-archives",
    title: "Mapa completo",
    description: "Conclua Black Pine, Sparrow Hollow e Threshold.",
    tier: "Ouro",
  },
  {
    id: "clean-trilogy",
    title: "Mãos limpas",
    description: "Tenha uma tentativa sem erros registrada em cada capítulo.",
    tier: "Ouro",
  },
  {
    id: "no-hints-trilogy",
    title: "Sem atalhos",
    description: "Conclua os três capítulos sem usar dicas em uma tentativa de cada.",
    tier: "Prata",
  },
  {
    id: "speed-trilogy",
    title: "Pista quente",
    description: "Registre um melhor tempo de até cinco minutos em cada capítulo.",
    tier: "Ouro",
  },
  {
    id: "elite-trilogy",
    title: "Arquivo de excelência",
    description: "Alcance pelo menos 90 pontos nos três capítulos.",
    tier: "Ouro",
  },
  {
    id: "trilogy-master",
    title: "Arquivista da trilogia",
    description: "Conclua a trilogia com 90+ em todos os capítulos, sem erros e sem dicas.",
    tier: "Lendário",
  },
] as const;

export type TrilogyBadgeId = (typeof TRILOGY_BADGES)[number]["id"];

export function getUnlockedTrilogyBadges(save: TrilogySaveData): TrilogyBadgeId[] {
  const completed = TRILOGY_CASE_IDS.every((caseId) => save.chapters[caseId].completed);
  const anyCompleted = TRILOGY_CASE_IDS.some((caseId) => save.chapters[caseId].completed);
  const clean =
    completed && TRILOGY_CASE_IDS.every((caseId) => save.chapters[caseId].bestMistakes === 0);
  const noHints =
    completed && TRILOGY_CASE_IDS.every((caseId) => save.chapters[caseId].bestHints === 0);
  const speed =
    completed &&
    TRILOGY_CASE_IDS.every((caseId) => {
      const time = save.chapters[caseId].bestElapsedSeconds;
      return time > 0 && time <= 300;
    });
  const elite =
    completed && TRILOGY_CASE_IDS.every((caseId) => save.chapters[caseId].bestScore >= 90);
  const unlocked: TrilogyBadgeId[] = [];
  if (anyCompleted) unlocked.push("first-trilogy-file");
  if (completed) unlocked.push("three-archives");
  if (clean) unlocked.push("clean-trilogy");
  if (noHints) unlocked.push("no-hints-trilogy");
  if (speed) unlocked.push("speed-trilogy");
  if (elite) unlocked.push("elite-trilogy");
  if (clean && noHints && elite) unlocked.push("trilogy-master");
  return unlocked;
}

export function getTrilogyBadgeSummary(save: TrilogySaveData) {
  const unlockedIds = getUnlockedTrilogyBadges(save);
  return {
    unlockedIds,
    unlocked: unlockedIds.length,
    total: TRILOGY_BADGES.length,
    progress: getSavedTrilogyProgress(save),
  };
}
