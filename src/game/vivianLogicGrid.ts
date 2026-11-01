// Murdle-style logic grid: pairs people with the records that already name them.
// It interprets existing sources only and never establishes a culprit.
export const GRID_ID = "grid-records";
export const GRID_PEOPLE = ["Scott", "Henry", "Charles", "Dorothy"] as const;
export const GRID_RECORDS = [
  { id: "police-report", label: "Arquivo do xerife" },
  { id: "funds-investigation", label: "Relatório de fundos" },
  { id: "charles-secret", label: "Carta da família" },
  { id: "dorothy-photo", label: "Diário" },
] as const;
export const GRID_CLUES = [
  "Henry não está ligado a nenhuma carta pessoal nem ao arquivo do xerife.",
  "O diário pertence a quem o escreveu.",
  "Charles não aparece no arquivo do xerife.",
  "Cada pessoa liga-se a exatamente um registro.",
] as const;
export const GRID_SOLUTION: Record<string, string> = {
  Scott: "police-report",
  Henry: "funds-investigation",
  Charles: "charles-secret",
  Dorothy: "dorothy-photo",
};
export type Mark = "" | "x" | "o";
export const nextMark = (m: Mark): Mark => (m === "" ? "x" : m === "x" ? "o" : "");
export function checkGrid(marks: Record<string, Mark>) {
  return GRID_PEOPLE.every((p) =>
    GRID_RECORDS.every((r) => (marks[`${p}|${r.id}`] === "o") === (GRID_SOLUTION[p] === r.id)),
  );
}
