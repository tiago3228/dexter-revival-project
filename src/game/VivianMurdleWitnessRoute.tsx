import { useState } from "react";
import { Check, FileQuestion, Grid3X3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mark = "" | "x" | "o";
type PairKey = `${string}|${string}`;

type Props = {
  solved?: boolean;
  onSolved: () => void;
};

const WITNESSES = ["Scott", "Dorothy", "Wanda"] as const;
const LOCATIONS = ["Arquivo", "Igreja", "Cais"] as const;
const OBJECTS = ["Fita", "Carta", "Recibo"] as const;

const SOLUTION = {
  Scott: { location: "Cais", object: "Fita" },
  Dorothy: { location: "Arquivo", object: "Recibo" },
  Wanda: { location: "Igreja", object: "Carta" },
} as const;

const CLUES = [
  "Scott não foi ouvido na igreja.",
  "A carta foi registrada na igreja.",
  "Dorothy não aparece associada ao cais.",
  "O recibo não veio da igreja.",
  "Wanda não estava com o recibo.",
];

function nextMark(mark: Mark): Mark {
  return mark === "" ? "x" : mark === "x" ? "o" : "";
}

function isCorrect(marks: Record<PairKey, Mark>) {
  return WITNESSES.every(
    (witness) =>
      marks[`${witness}|${SOLUTION[witness].location}`] === "o" &&
      marks[`${witness}|${SOLUTION[witness].object}`] === "o",
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
      <table className="w-full min-w-[25rem] border-collapse text-xs">
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
          {WITNESSES.map((witness) => (
            <tr key={witness}>
              <th className="border border-[#4b4439] p-2 text-left font-normal text-[#ead8b8]">
                {witness}
              </th>
              {columns.map((column) => {
                const mark = marks[`${witness}|${column}`] ?? "";
                return (
                  <td key={column} className="border border-[#4b4439] p-0">
                    <button
                      type="button"
                      onClick={() => onMark(witness, column)}
                      aria-label={`${witness} e ${column}`}
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

export function VivianMurdleWitnessRoute({ solved = false, onSolved }: Props) {
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
      setFeedback(
        "Rota reconstruída. Este exercício organiza hipóteses e não confirma autoria, localização ou conteúdo das fontes.",
      );
      onSolved();
      return;
    }
    setFeedback(
      "A rota ainda não fecha. Use ● para confirmar uma associação, ✗ para eliminá-la e deixe vazios os pares que ainda não puder provar.",
    );
  };

  return (
    <section
      className="mt-6 space-y-4 border border-[#8f7955] bg-[#201d18] p-4 sm:p-5"
      aria-label="Minigame de rota dos depoimentos"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#e1c18d]">
            <Grid3X3 size={15} /> Exercício de lógica · rota dos depoimentos
          </p>
          <h3 className="mt-1 font-display text-2xl text-[#ead8b8]">A rota da fita</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
            Reconstrua onde cada pessoa foi ouvida e qual objeto aparece no registro. Marque ✗ para
            eliminar, ● para confirmar e deixe vazio o que ainda não sabe.
          </p>
        </div>
        {complete ? (
          <span className="flex items-center gap-1 font-mono text-xs text-emerald-200">
            <Check size={15} /> Conferido
          </span>
        ) : (
          <span className="font-mono text-xs text-[#a9a092]">Hipóteses</span>
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
        <RelationGrid title="Pessoa × local" columns={LOCATIONS} marks={marks} onMark={mark} />
        <RelationGrid title="Pessoa × objeto" columns={OBJECTS} marks={marks} onMark={mark} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!complete && (
          <Button type="button" variant="outline" onClick={check}>
            <FileQuestion /> Conferir rota
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
