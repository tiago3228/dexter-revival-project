import { useState } from "react";
import { Check, Grid3X3, RotateCcw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  evaluateQuickCase,
  QUICK_CASE_POINTS,
  type LogicGrid,
  type QuickCase,
} from "./vivianQuickCases";

type Props = {
  quickCase: QuickCase;
  found: readonly string[];
  completed: boolean;
  onComplete: (id: string) => void;
};

type Mark = "" | "x" | "o";
type PairKey = `${string}|${string}`;

function nextMark(mark: Mark): Mark {
  return mark === "" ? "x" : mark === "x" ? "o" : "";
}

function LogicRelationGrid({
  title,
  people,
  columns,
  marks,
  onMark,
}: {
  title: string;
  people: readonly string[];
  columns: readonly string[];
  marks: Record<PairKey, Mark>;
  onMark: (person: string, column: string) => void;
}) {
  return (
    <div className="overflow-x-auto border border-border bg-muted/10 p-3">
      <h4 className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <Grid3X3 size={14} /> {title}
      </h4>
      <table className="w-full min-w-[25rem] border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-border p-2 text-left font-normal text-muted-foreground">
              Pessoa
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className="border border-border p-2 font-mono font-normal text-muted-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person}>
              <th className="border border-border p-2 text-left font-normal">{person}</th>
              {columns.map((column) => {
                const mark = marks[`${person}|${column}`] ?? "";
                return (
                  <td key={column} className="border border-border p-0">
                    <button
                      type="button"
                      aria-label={`${person} e ${column}`}
                      aria-pressed={mark === "o"}
                      onClick={() => onMark(person, column)}
                      className="h-11 w-full min-w-20 text-lg transition hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
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
  );
}

function LogicGridPuzzle({
  logicGrid,
  marks,
  onMark,
}: {
  logicGrid: LogicGrid;
  marks: Record<PairKey, Mark>;
  onMark: (person: string, column: string) => void;
}) {
  return (
    <section className="mt-3 space-y-3" aria-label="Tabela lógica">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Clique em cada célula para alternar entre vazio, ✗ eliminado e ● confirmado. Uma associação
        confirmada elimina as demais por dedução.
      </p>
      <ol className="grid gap-2 text-xs leading-relaxed text-muted-foreground md:grid-cols-2">
        {logicGrid.clues.map((clue) => (
          <li key={clue} className="border-l-2 border-primary/60 pl-3">
            {clue}
          </li>
        ))}
      </ol>
      <div className="grid gap-4 xl:grid-cols-2">
        <LogicRelationGrid
          title="Pessoa × local"
          people={logicGrid.people}
          columns={logicGrid.places}
          marks={marks}
          onMark={onMark}
        />
        <LogicRelationGrid
          title="Pessoa × objeto"
          people={logicGrid.people}
          columns={logicGrid.objects}
          marks={marks}
          onMark={onMark}
        />
      </div>
    </section>
  );
}

export function VivianQuickCaseRunner({ quickCase, found, completed, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marks, setMarks] = useState<Record<PairKey, Mark>>({});
  const [feedback, setFeedback] = useState("");
  const logicGrid = quickCase.logicGrid;

  const markGrid = (person: string, column: string) => {
    const key = `${person}|${column}` as PairKey;
    setMarks((current) => ({ ...current, [key]: nextMark(current[key] ?? "") }));
    setFeedback("");
  };

  const checkCase = () => {
    const result = evaluateQuickCase(quickCase.id, logicGrid ? marks : answers, found);
    if (result === "supported") {
      onComplete(quickCase.id);
      setFeedback("");
    } else {
      setFeedback(
        result === "locked"
          ? "Este caso ainda está bloqueado pelos registros necessários."
          : logicGrid
            ? "A tabela ainda não fecha. Cada pessoa deve ter exatamente um local e um objeto confirmados; revise as exclusões."
            : "Revise as fontes e tente novamente. Nenhum ponto é perdido; a pontuação principal não muda.",
      );
    }
  };

  const resetGrid = () => {
    setMarks({});
    setFeedback("");
  };

  return (
    <article
      className="mt-3 border border-primary/40 bg-background p-4"
      aria-label={quickCase.title}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg">{quickCase.title}</h3>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">~5 min</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{quickCase.summary}</p>
      {quickCase.sourceReference && (
        <aside
          className="mt-3 space-y-2 border-l-2 border-primary/70 bg-muted/30 p-3 text-sm leading-relaxed"
          aria-label="Contexto documental do caso"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
            Fonte de apoio · {quickCase.sourceReference}
          </p>
          {quickCase.briefing && <p>{quickCase.briefing}</p>}
          {quickCase.objective && (
            <p>
              <strong>Desafio:</strong> {quickCase.objective}
            </p>
          )}
        </aside>
      )}
      {quickCase.audioSources && (
        <section
          className="mt-3 space-y-3 border border-border bg-muted/20 p-3"
          aria-label="Resumos em áudio das fontes"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Comparação em áudio
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              São resumos narrados das fontes, não gravações originais de interrogatório.
            </p>
          </div>
          {quickCase.audioSources.map((audioSource) => (
            <div key={audioSource.id} className="space-y-1 border-t border-border pt-3">
              <p className="text-sm">{audioSource.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{audioSource.reference}</p>
              <audio
                className="h-9 w-full"
                controls
                preload="none"
                src={audioSource.audioSrc}
                aria-label={`Ouvir resumo narrado: ${audioSource.title}`}
              />
            </div>
          ))}
        </section>
      )}
      {completed ? (
        <div className="mt-3 space-y-2 border-l-2 border-primary pl-3 text-sm leading-relaxed">
          {logicGrid ? (
            <p>{logicGrid.explanation}</p>
          ) : (
            quickCase.steps.map((step) => (
              <p key={step.id}>
                <strong>{step.question}</strong> {step.explanation}
              </p>
            ))
          )}
          <p className="flex items-center gap-2 text-primary">
            <Check size={15} /> Caso concluído: +{QUICK_CASE_POINTS} pontos no arquivo. A pontuação
            principal não muda.
          </p>
        </div>
      ) : logicGrid ? (
        <>
          <LogicGridPuzzle logicGrid={logicGrid} marks={marks} onMark={markGrid} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={checkCase}>
              <Scale size={16} /> Conferir tabela
            </Button>
            <Button type="button" variant="ghost" onClick={resetGrid}>
              <RotateCcw size={16} /> Limpar tabela
            </Button>
          </div>
          {feedback && (
            <p role="status" className="mt-2 text-sm text-destructive">
              {feedback}
            </p>
          )}
        </>
      ) : (
        <div className="mt-3 space-y-4">
          {quickCase.steps.map((step, index) => (
            <fieldset key={step.id} className="space-y-2">
              <legend className="text-sm">
                <strong>{index + 1}.</strong> {step.question}
              </legend>
              {step.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-start gap-3 py-1 text-sm leading-relaxed"
                >
                  <input
                    type="radio"
                    name={`${quickCase.id}-${step.id}`}
                    value={option.id}
                    checked={answers[step.id] === option.id}
                    onChange={() => {
                      setAnswers((current) => ({ ...current, [step.id]: option.id }));
                      setFeedback("");
                    }}
                    className="mt-1 shrink-0 accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
          ))}
          <Button type="button" variant="outline" onClick={checkCase}>
            <Scale size={16} /> Conferir caso
          </Button>
          {feedback && (
            <p role="status" className="text-sm text-destructive">
              {feedback}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
