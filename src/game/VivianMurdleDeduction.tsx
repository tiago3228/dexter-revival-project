import { useState } from "react";
import { Check, FileQuestion, Grid3X3, LockKeyhole, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMinigameProgress } from "./minigameProgress";

type Mark = "" | "x" | "o";
type PairKey = `${string}|${string}`;

type Props = {
  solved?: boolean;
  onSolved: () => void;
};

const PEOPLE = ["Scott", "Trisha", "Dorothy"] as const;
const PLACES = ["Cabana", "Mansão", "Hospital"] as const;
const OBJECTS = ["Fotografia", "Carta", "Código"] as const;
const SOLUTION = {
  Scott: { place: "Cabana", object: "Fotografia" },
  Trisha: { place: "Mansão", object: "Carta" },
  Dorothy: { place: "Hospital", object: "Código" },
} as const;
const CLUES = [
  "Scott não estava na mansão.",
  "A fotografia não foi registrada no hospital.",
  "Trisha não aparece associada à fotografia.",
  "Dorothy aparece no local ligado ao código.",
  "A carta não pertence ao registro da cabana.",
];

function nextMark(mark: Mark): Mark {
  return mark === "" ? "x" : mark === "x" ? "o" : "";
}

function checkPair(marks: Record<PairKey, Mark>, left: string, right: string) {
  return marks[`${left}|${right}`] === "o";
}

function isCorrect(marks: Record<PairKey, Mark>) {
  return PEOPLE.every(
    (person) =>
      checkPair(marks, person, SOLUTION[person].place) &&
      checkPair(marks, person, SOLUTION[person].object),
  );
}

function RelationGrid({
  title,
  columns,
  marks,
  onMark,
}: {
  title: string;
  columns: readonly string[];
  marks: Record<PairKey, Mark>;
  onMark: (left: string, right: string) => void;
}) {
  return (
    <div className="overflow-x-auto border border-[#4b4439] bg-[#191714] p-3">
      <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e1c18d]">
        {title}
      </h4>
      <table className="w-full min-w-[28rem] border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left font-normal text-[#a9a092]">Pessoa</th>
            {columns.map((column) => (
              <th key={column} className="p-2 font-mono font-normal text-[#a9a092]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PEOPLE.map((person) => (
            <tr key={person}>
              <th className="border border-[#4b4439] p-2 text-left font-normal text-[#ead8b8]">
                {person}
              </th>
              {columns.map((column) => {
                const mark = marks[`${person}|${column}`] ?? "";
                return (
                  <td key={column} className="border border-[#4b4439] p-0">
                    <button
                      type="button"
                      onClick={() => onMark(person, column)}
                      aria-label={`${person} e ${column}`}
                      aria-pressed={mark === "o"}
                      className="h-11 w-full min-w-16 text-lg text-[#ead8b8] transition hover:bg-[#c4a779]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c4a779]"
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

export function VivianMurdleDeduction({ solved = false, onSolved }: Props) {
  const [marks, setMarks] = useState<Record<PairKey, Mark>>({});
  const [feedback, setFeedback] = useState("");
  const [complete, setComplete] = useState(solved);

  const mark = (left: string, right: string) => {
    if (complete) return;
    const key = `${left}|${right}` as PairKey;
    setMarks((current) => ({ ...current, [key]: nextMark(current[key] ?? "") }));
    setFeedback("");
  };

  const reset = () => {
    setMarks({});
    setFeedback("");
    setComplete(false);
  };

  const check = () => {
    if (isCorrect(marks)) {
      setComplete(true);
      recordMinigameProgress("relations-dossier", "solved");
      setFeedback(
        "Dedução completa. A grade organiza hipóteses e não confirma autoria, localização ou conteúdo das fontes.",
      );
      onSolved();
    } else {
      setFeedback(
        "A combinação ainda não fecha. Use ● para uma associação e ✗ para descartá-la; revise as pistas antes de conferir.",
      );
    }
  };

  return (
    <section
      className="mt-6 space-y-4 border border-[#8f7955] bg-[#201d18] p-4 sm:p-5"
      aria-label="Minigame de dedução Murdle"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#e1c18d]">
            <Grid3X3 size={15} /> Exercício de lógica · estilo Murdle
          </p>
          <h3 className="mt-1 font-display text-2xl text-[#ead8b8]">Dossiê de relações</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
            Cruze as pistas para descobrir a associação de cada pessoa com um local e um objeto.
            Marque ✗ para eliminar, ● para confirmar e deixe vazio o que ainda não sabe.
          </p>
        </div>
        {complete ? (
          <span className="flex items-center gap-1 font-mono text-xs text-emerald-200">
            <Check size={15} /> Conferido
          </span>
        ) : (
          <span className="flex items-center gap-1 font-mono text-xs text-[#a9a092]">
            <LockKeyhole size={14} /> Hipóteses
          </span>
        )}
      </div>
      <ol className="grid gap-2 text-xs leading-relaxed text-[#d5c9b5] md:grid-cols-2">
        {CLUES.map((clue) => (
          <li key={clue} className="border-l border-[#79664c] pl-3">
            {clue}
          </li>
        ))}
      </ol>
      <div className="grid gap-4 lg:grid-cols-2">
        <RelationGrid title="Pessoa × local" columns={PLACES} marks={marks} onMark={mark} />
        <RelationGrid title="Pessoa × objeto" columns={OBJECTS} marks={marks} onMark={mark} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!complete && (
          <Button type="button" variant="outline" onClick={check}>
            <FileQuestion /> Conferir dedução
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={reset} disabled={complete}>
          <RotateCcw /> Limpar grade
        </Button>
      </div>
      {feedback && (
        <p
          className={`text-sm leading-relaxed ${complete ? "text-emerald-200" : "text-[#d5c9b5]"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
