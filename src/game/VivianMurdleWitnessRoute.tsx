import { useState } from "react";
import { Check, FileQuestion, Grid3X3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mark = "" | "x" | "o";
type PairKey = `${string}|${string}`;
type Level = {
  id: "intro" | "advanced";
  label: string;
  description: string;
  witnesses: readonly string[];
  locations: readonly string[];
  objects: readonly string[];
  clues: readonly string[];
  solution: Record<string, { location: string; object: string }>;
};

type Props = {
  completedLevel?: number;
  onSolved: (level: number) => void;
};

const LEVELS: readonly Level[] = [
  {
    id: "intro",
    label: "Nível 1 · Rota básica",
    description: "3 pessoas · 3 locais · 3 objetos",
    witnesses: ["Scott", "Dorothy", "Wanda"],
    locations: ["Arquivo", "Igreja", "Cais"],
    objects: ["Fita", "Carta", "Recibo"],
    clues: [
      "Scott não foi ouvido na igreja.",
      "A carta foi registrada na igreja.",
      "Dorothy não aparece associada ao cais.",
      "O recibo não veio da igreja.",
      "Wanda não estava com o recibo.",
    ],
    solution: {
      Scott: { location: "Cais", object: "Fita" },
      Dorothy: { location: "Arquivo", object: "Recibo" },
      Wanda: { location: "Igreja", object: "Carta" },
    },
  },
  {
    id: "advanced",
    label: "Nível 2 · Rota cruzada",
    description: "4 pessoas · 4 locais · 4 objetos",
    witnesses: ["Scott", "Dorothy", "Wanda", "Mary"],
    locations: ["Arquivo", "Hospital", "Igreja", "Lago"],
    objects: ["Fita", "Carta", "Recibo", "Fotografia"],
    clues: [
      "Scott não aparece no hospital nem associado à fotografia.",
      "Dorothy não foi ouvida na igreja.",
      "Wanda foi ouvida na igreja e seu registro é uma carta.",
      "Mary foi ouvida no hospital.",
      "A fotografia não veio do lago.",
      "O recibo não pertence ao hospital.",
      "O registro do lago é a fita procurada.",
    ],
    solution: {
      Scott: { location: "Lago", object: "Fita" },
      Dorothy: { location: "Arquivo", object: "Recibo" },
      Wanda: { location: "Igreja", object: "Carta" },
      Mary: { location: "Hospital", object: "Fotografia" },
    },
  },
];

function nextMark(mark: Mark): Mark {
  return mark === "" ? "x" : mark === "x" ? "o" : "";
}

function isCorrect(level: Level, marks: Record<PairKey, Mark>) {
  return level.witnesses.every(
    (witness) =>
      marks[`${witness}|${level.solution[witness]!.location}`] === "o" &&
      marks[`${witness}|${level.solution[witness]!.object}`] === "o",
  );
}

function RelationGrid({
  witnesses,
  title,
  columns,
  marks,
  onMark,
}: {
  witnesses: readonly string[];
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
          {witnesses.map((witness) => (
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

export function VivianMurdleWitnessRoute({ completedLevel = 0, onSolved }: Props) {
  const [activeLevel, setActiveLevel] = useState(Math.min(completedLevel, LEVELS.length - 1));
  const [marks, setMarks] = useState<Record<PairKey, Mark>>({});
  const [feedback, setFeedback] = useState("");
  const [completedThisLevel, setCompletedThisLevel] = useState<number | null>(null);
  const level = LEVELS[activeLevel]!;
  const levelComplete = completedLevel > activeLevel || completedThisLevel === activeLevel;

  const selectLevel = (index: number) => {
    if (index > completedLevel) return;
    setActiveLevel(index);
    setMarks({});
    setFeedback("");
    setCompletedThisLevel(null);
  };

  const mark = (left: string, right: string) => {
    if (levelComplete) return;
    const key = `${left}|${right}` as PairKey;
    setMarks((current) => ({ ...current, [key]: nextMark(current[key] ?? "") }));
    setFeedback("");
  };

  const reset = () => {
    if (levelComplete) return;
    setMarks({});
    setFeedback("");
  };

  const check = () => {
    if (isCorrect(level, marks)) {
      setCompletedThisLevel(activeLevel);
      setFeedback(
        `Nível ${activeLevel + 1} concluído. A grade organiza hipóteses e não confirma autoria, localização ou conteúdo das fontes.`,
      );
      onSolved(activeLevel + 1);
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
        {levelComplete ? (
          <span className="flex items-center gap-1 font-mono text-xs text-emerald-200">
            <Check size={15} /> Conferido
          </span>
        ) : (
          <span className="font-mono text-xs text-[#a9a092]">Hipóteses</span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2" aria-label="Níveis da rota da fita">
        {LEVELS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            disabled={index > completedLevel}
            onClick={() => selectLevel(index)}
            className={`min-h-14 border p-3 text-left font-mono text-[10px] transition ${
              index === activeLevel
                ? "border-[#e1c18d] bg-[#c4a779]/15 text-[#ead8b8]"
                : index < completedLevel
                  ? "border-emerald-800/70 text-emerald-200"
                  : "cursor-not-allowed border-[#4b4031] text-[#665b4b]"
            }`}
          >
            <strong className="block">
              {index < completedLevel ? "✓ " : ""}
              {item.label}
            </strong>
            <span className="mt-1 block opacity-75">{item.description}</span>
          </button>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-[#a9a092]">
        Nível atual: <strong className="text-[#ead8b8]">{level.label}</strong>. O nível 2 só é
        liberado depois da resolução completa do nível 1.
      </p>
      <ol className="grid gap-2 text-xs leading-relaxed text-[#d5c9b5] md:grid-cols-2">
        {level.clues.map((clue) => (
          <li key={clue} className="border-l border-[#79664c] pl-3">
            {clue}
          </li>
        ))}
      </ol>
      <div className="grid gap-4 lg:grid-cols-2">
        <RelationGrid
          witnesses={level.witnesses}
          title="Pessoa × local"
          columns={level.locations}
          marks={marks}
          onMark={mark}
        />
        <RelationGrid
          witnesses={level.witnesses}
          title="Pessoa × objeto"
          columns={level.objects}
          marks={marks}
          onMark={mark}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!levelComplete && (
          <Button type="button" variant="outline" onClick={check}>
            <FileQuestion /> Conferir rota
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={reset} disabled={levelComplete}>
          <RotateCcw /> Limpar grade
        </Button>
        {levelComplete && activeLevel < LEVELS.length - 1 && (
          <Button type="button" onClick={() => selectLevel(activeLevel + 1)}>
            Avançar para o nível 2
          </Button>
        )}
      </div>
      {feedback && (
        <p
          className={`text-sm leading-relaxed ${levelComplete ? "text-emerald-200" : "text-[#d5c9b5]"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
