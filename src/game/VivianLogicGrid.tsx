import { useEffect, useMemo, useState } from "react";
import { Check, Grid3x3, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GRID_LEVELS,
  GRID_LEVEL_IDS,
  GRID_RECORDS,
  checkGrid,
  nextMark,
  type GridLevelId,
  type Mark,
} from "./vivianLogicGrid";

type Props = {
  found: string[];
  solvedLevels: string[];
  onSolve: (levelId: GridLevelId) => void;
};

function canOpenLevel(
  levelId: GridLevelId,
  missingRecords: number,
  completed: ReadonlySet<string>,
) {
  if (missingRecords > 0) return false;
  const index = GRID_LEVEL_IDS.indexOf(levelId);
  return index === 0 || (index > 0 && completed.has(GRID_LEVEL_IDS[index - 1]!));
}

export function VivianLogicGrid({ found, solvedLevels, onSolve }: Props) {
  const [activeLevelId, setActiveLevelId] = useState<GridLevelId>(GRID_LEVEL_IDS[0]);
  const [marksByLevel, setMarksByLevel] = useState<
    Partial<Record<GridLevelId, Record<string, Mark>>>
  >({});
  const [feedback, setFeedback] = useState("");
  const missingRecords = GRID_RECORDS.filter((record) => !found.includes(record.id)).length;
  const completed = useMemo(() => new Set(solvedLevels), [solvedLevels]);
  const activeLevel = GRID_LEVELS.find((level) => level.id === activeLevelId) ?? GRID_LEVELS[0]!;
  const marks = marksByLevel[activeLevel.id] ?? {};

  useEffect(() => {
    if (!canOpenLevel(activeLevelId, missingRecords, completed)) {
      const firstOpenLevel = GRID_LEVELS.find((level) =>
        canOpenLevel(level.id, missingRecords, completed),
      );
      if (firstOpenLevel) setActiveLevelId(firstOpenLevel.id);
    }
  }, [activeLevelId, missingRecords, completed]);

  const updateMark = (key: string, current: Mark) => {
    setFeedback("");
    setMarksByLevel((previous) => ({
      ...previous,
      [activeLevel.id]: { ...(previous[activeLevel.id] ?? {}), [key]: nextMark(current) },
    }));
  };

  return (
    <section className="space-y-4 border border-border p-4" aria-label="Grade de dedução">
      <h3 className="flex items-center gap-2 font-display text-xl">
        <Grid3x3 size={18} /> Grade de dedução
      </h3>
      {missingRecords > 0 ? (
        <p className="text-sm text-muted-foreground">
          Encontre mais {missingRecords} registro(s) para abrir a grade.
        </p>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2" aria-label="Níveis da grade">
            {GRID_LEVELS.map((level) => {
              const available = canOpenLevel(level.id, missingRecords, completed);
              const isSolved = completed.has(level.id);
              return (
                <Button
                  key={level.id}
                  type="button"
                  size="sm"
                  variant={activeLevel.id === level.id ? "secondary" : "outline"}
                  disabled={!available}
                  aria-current={activeLevel.id === level.id ? "step" : undefined}
                  onClick={() => {
                    setActiveLevelId(level.id);
                    setFeedback("");
                  }}
                >
                  {isSolved ? (
                    <Check size={15} />
                  ) : available ? (
                    <Grid3x3 size={15} />
                  ) : (
                    <LockKeyhole size={15} />
                  )}
                  {level.title}
                </Button>
              );
            })}
          </nav>
          <div>
            <h4 className="font-display text-lg">{activeLevel.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {activeLevel.description}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Clique numa casa: 1× marca ✗ (descartado), 2× marca ● (confirmado), 3× limpa. Marque as
            relações que não se aplicam e confirme a solução.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {activeLevel.clues.map((clue) => (
              <li key={clue}>{clue}</li>
            ))}
          </ol>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th scope="col" />
                  {activeLevel.columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className="min-w-24 p-2 font-mono font-normal text-muted-foreground"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeLevel.rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="max-w-44 pr-3 text-left font-normal">
                      {row.label}
                    </th>
                    {activeLevel.columns.map((column) => {
                      const key = `${row.id}|${column.id}`;
                      const mark = marks[key] ?? "";
                      return (
                        <td key={column.id} className="border border-border p-0">
                          <button
                            type="button"
                            disabled={completed.has(activeLevel.id)}
                            aria-label={`${row.label} e ${column.label}`}
                            aria-pressed={mark === "o"}
                            onClick={() => updateMark(key, mark)}
                            className="h-11 w-full min-w-11 text-lg hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default"
                          >
                            {mark === "x" ? "✗" : mark === "o" ? "●" : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {completed.has(activeLevel.id) ? (
            <p className="text-sm text-primary" role="status">
              Nível conferido. A grade organiza referências documentais e não estabelece culpa.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (checkGrid(marks, activeLevel.id)) {
                  onSolve(activeLevel.id);
                  setFeedback("");
                } else {
                  setFeedback("Ainda há uma relação incompatível com as pistas. Revise os ✗ e ●.");
                }
              }}
            >
              Conferir nível
            </Button>
          )}
          {feedback && (
            <p className="text-sm text-destructive" role="status">
              {feedback}
            </p>
          )}
        </>
      )}
    </section>
  );
}
