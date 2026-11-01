// Grades opcionais de associação baseadas nos registros já coletáveis do caso.
// O exercício organiza referências documentais; não aponta culpado nem cria fatos canônicos.
export const GRID_ID = "grid-records" as const;
export const GRID_PLACE_ID = "grid-places" as const;
export const GRID_PERIOD_ID = "grid-periods" as const;
export const GRID_LEVEL_IDS = [GRID_ID, GRID_PLACE_ID, GRID_PERIOD_ID] as const;
export type GridLevelId = (typeof GRID_LEVEL_IDS)[number];

export const GRID_PEOPLE = ["Scott", "Henry", "Charles", "Dorothy"] as const;
export const GRID_RECORDS = [
  { id: "police-report", label: "Arquivo do xerife" },
  { id: "funds-investigation", label: "Relatório de fundos" },
  { id: "charles-secret", label: "Carta da família" },
  { id: "dorothy-photo", label: "Diário" },
] as const;

export type GridRow = { id: string; label: string };
export type GridOption = { id: string; label: string };
export type GridLevel = {
  id: GridLevelId;
  title: string;
  description: string;
  rows: readonly GridRow[];
  columns: readonly GridOption[];
  clues: readonly string[];
  solution: Readonly<Record<string, string>>;
};

export const GRID_LEVELS: readonly GridLevel[] = [
  {
    id: GRID_ID,
    title: "Nível 1 · Pessoa e registro",
    description:
      "Associe cada pessoa ao registro correspondente às pistas. Para este exercício, use cada pessoa e registro uma vez; a grade não é uma lista exaustiva de todas as menções nos documentos.",
    rows: GRID_PEOPLE.map((person) => ({ id: person, label: person })),
    columns: GRID_RECORDS,
    clues: [
      "Henry não está ligado a uma carta pessoal nem ao arquivo do xerife.",
      "Dorothy escreveu o diário.",
      "Charles não está associado ao arquivo do xerife.",
      "Cada pessoa e cada registro são usados exatamente uma vez nesta grade.",
    ],
    solution: {
      Scott: "police-report",
      Henry: "funds-investigation",
      Charles: "charles-secret",
      Dorothy: "dorothy-photo",
    },
  },
  {
    id: GRID_PLACE_ID,
    title: "Nível 2 · Registro e local",
    description:
      "Relacione cada registro ao local de investigação onde ele é apresentado no jogo. Alguns registros compartilham local.",
    rows: GRID_RECORDS,
    columns: [
      { id: "archive", label: "Arquivo do xerife" },
      { id: "hospital", label: "Hospital comunitário" },
      { id: "mansion", label: "Mansão Roberts" },
      { id: "church", label: "Igreja Trinity" },
    ],
    clues: [
      "O relatório policial é consultado no arquivo do xerife.",
      "O relatório sobre fundos é apresentado no hospital comunitário.",
      "A carta da família e o diário de Dorothy são encontrados na mansão Roberts.",
      "Nenhum dos quatro registros desta grade é apresentado na Igreja Trinity.",
    ],
    solution: {
      "police-report": "archive",
      "funds-investigation": "hospital",
      "charles-secret": "mansion",
      "dorothy-photo": "mansion",
    },
  },
  {
    id: GRID_PERIOD_ID,
    title: "Nível 3 · Registro e período",
    description:
      "Use a data do documento ou o período explicitamente narrado. Para a carta familiar, classifique o contexto relatado, não uma data de autoria que a imagem não confirma.",
    rows: GRID_RECORDS,
    columns: [
      { id: "1970s", label: "1970–1979" },
      { id: "1990-1994", label: "1990–1994" },
      { id: "1995-1996", label: "1995–1996" },
      { id: "unknown", label: "Não informado" },
    ],
    clues: [
      "O relatório do xerife é datado de 6 de agosto de 1995.",
      "O relatório sobre fundos é datado de 17 de fevereiro de 1993.",
      "A carta familiar relata a chegada da autora a Painscreek em julho de 1975.",
      "A entrada do diário sobre a fotografia emprestada é de 13 de fevereiro de 1995.",
    ],
    solution: {
      "police-report": "1995-1996",
      "funds-investigation": "1990-1994",
      "charles-secret": "1970s",
      "dorothy-photo": "1995-1996",
    },
  },
] as const;

export const GRID_CLUES = GRID_LEVELS[0]!.clues;
export const GRID_SOLUTION = GRID_LEVELS[0]!.solution;
export type Mark = "" | "x" | "o";
export const nextMark = (mark: Mark): Mark => (mark === "" ? "x" : mark === "x" ? "o" : "");

export function checkGrid(marks: Record<string, Mark>, levelId: GridLevelId = GRID_ID) {
  const level = GRID_LEVELS.find((candidate) => candidate.id === levelId);
  if (!level) return false;
  return level.rows.every((row) =>
    level.columns.every((column) => {
      const isConfirmed = marks[`${row.id}|${column.id}`] === "o";
      return isConfirmed === (level.solution[row.id] === column.id);
    }),
  );
}
