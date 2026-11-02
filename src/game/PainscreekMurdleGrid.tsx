import { useState } from "react";
import { Check, Grid3X3, RotateCcw } from "lucide-react";
import { recordMinigameProgress } from "./minigameProgress";

const PEOPLE = ["Scott", "Henry", "Dorothy"] as const;
const SOURCES = ["Relatório policial", "Diário", "Carta"] as const;
const PLACES = ["Lago", "Hospital", "Mansão"] as const;

type Row = (typeof PEOPLE)[number];
type Pair = `${Row}|${string}`;

type Props = {
  onSolved?: () => void;
};

const SOLUTION: Record<Row, { source: (typeof SOURCES)[number]; place: (typeof PLACES)[number] }> =
  {
    Scott: { source: "Diário", place: "Mansão" },
    Henry: { source: "Relatório policial", place: "Lago" },
    Dorothy: { source: "Carta", place: "Hospital" },
  };

const CLUES = [
  "O relatório policial registra a descoberta no lago.",
  "Scott aparece associado ao diário, não ao relatório policial.",
  "A carta foi consultada no hospital.",
  "Dorothy não aparece ligada ao lago.",
  "A fotografia emprestada por Scott pertence à linha documental do diário.",
];

function isCorrect(marks: Record<Pair, boolean>) {
  return PEOPLE.every(
    (person) =>
      marks[`${person}|source|${SOLUTION[person].source}` as Pair] === true &&
      marks[`${person}|place|${SOLUTION[person].place}` as Pair] === true,
  );
}

export function PainscreekMurdleGrid({ onSolved }: Props) {
  const [answers, setAnswers] = useState<Record<Row, { source: string; place: string }>>({
    Scott: { source: "", place: "" },
    Henry: { source: "", place: "" },
    Dorothy: { source: "", place: "" },
  });
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);

  const update = (person: Row, field: "source" | "place", value: string) => {
    if (solved) return;
    setAnswers((current) => ({
      ...current,
      [person]: { ...current[person], [field]: value },
    }));
    setFeedback("");
  };

  const check = () => {
    const marks = Object.entries(answers).reduce<Record<Pair, boolean>>(
      (result, [person, answer]) => {
        result[`${person}|source|${answer.source}` as Pair] = Boolean(answer.source);
        result[`${person}|place|${answer.place}` as Pair] = Boolean(answer.place);
        return result;
      },
      {},
    );
    if (isCorrect(marks)) {
      setSolved(true);
      setFeedback(
        "Grade fechada. As associações organizam o exercício; não transformam uma fonte em prova definitiva.",
      );
      recordMinigameProgress("painscreek-murdle-grid", "solved");
      onSolved?.();
    } else {
      setFeedback(
        "A grade ainda não fecha. Use as pistas para revisar as duas relações de cada pessoa.",
      );
    }
  };

  const reset = () => {
    setAnswers({
      Scott: { source: "", place: "" },
      Henry: { source: "", place: "" },
      Dorothy: { source: "", place: "" },
    });
    setFeedback("");
    setSolved(false);
  };

  return (
    <section className="border border-[#6b624f] bg-[#191714] p-4" aria-label="Murdle de Painscreek">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#d8bd7d]">
            Grade lógica · exercício editorial
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-display text-2xl text-[#ead8b8]">
            <Grid3X3 size={19} aria-hidden="true" /> Murdle de Painscreek
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#bdb5a8]">
            Associe cada pessoa a uma fonte e a um local. A grade usa relações documentais como
            exercício de dedução, não como veredito canônico.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-9 items-center gap-2 border border-[#847456] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/10"
        >
          <RotateCcw size={14} aria-hidden="true" /> Reiniciar
        </button>
      </div>

      <ul className="mt-4 space-y-1 border-l-2 border-[#8f7955] pl-4 text-xs leading-relaxed text-[#c7bba8]">
        {CLUES.map((clue) => (
          <li key={clue}>{clue}</li>
        ))}
      </ul>

      <div className="mt-5 overflow-x-auto border border-[#4b4439] bg-[#11100e] p-2">
        <table className="w-full min-w-[38rem] border-collapse text-xs">
          <caption className="sr-only">Grade de associações de Painscreek</caption>
          <thead>
            <tr>
              <th className="p-2 text-left font-normal text-[#a9a092]">Pessoa</th>
              <th className="p-2 text-left font-mono font-normal text-[#a9a092]">Fonte</th>
              <th className="p-2 text-left font-mono font-normal text-[#a9a092]">Local</th>
            </tr>
          </thead>
          <tbody>
            {PEOPLE.map((person) => (
              <tr key={person}>
                <th className="border border-[#4b4439] p-2 text-left font-normal text-[#ead8b8]">
                  {person}
                </th>
                <td className="border border-[#4b4439] p-2">
                  <label className="sr-only" htmlFor={`painscreek-source-${person}`}>
                    Fonte de {person}
                  </label>
                  <select
                    id={`painscreek-source-${person}`}
                    value={answers[person].source}
                    onChange={(event) => update(person, "source", event.target.value)}
                    disabled={solved}
                    className="min-h-10 w-full border border-[#665a45] bg-[#1d1a15] px-2 py-2 text-[#ead8b8]"
                  >
                    <option value="">Escolha a fonte</option>
                    {SOURCES.map((source) => (
                      <option key={source}>{source}</option>
                    ))}
                  </select>
                </td>
                <td className="border border-[#4b4439] p-2">
                  <label className="sr-only" htmlFor={`painscreek-place-${person}`}>
                    Local de {person}
                  </label>
                  <select
                    id={`painscreek-place-${person}`}
                    value={answers[person].place}
                    onChange={(event) => update(person, "place", event.target.value)}
                    disabled={solved}
                    className="min-h-10 w-full border border-[#665a45] bg-[#1d1a15] px-2 py-2 text-[#ead8b8]"
                  >
                    <option value="">Escolha o local</option>
                    {PLACES.map((place) => (
                      <option key={place}>{place}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={check}
        disabled={solved || Object.values(answers).some(({ source, place }) => !source || !place)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border-2 border-[#d8bd7d] bg-[#d8bd7d]/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#ead8b8] hover:bg-[#d8bd7d]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {solved ? <Check size={16} aria-hidden="true" /> : <Grid3X3 size={16} aria-hidden="true" />}
        {solved ? "Grade conferida" : "Conferir grade"}
      </button>
      {feedback && (
        <p
          className="mt-3 border border-[#6b624f] bg-[#211f1b] p-3 text-sm text-[#ead8b8]"
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
