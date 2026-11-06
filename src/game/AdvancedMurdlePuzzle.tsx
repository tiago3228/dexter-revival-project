import { useState } from "react";
import {
  SPARROW_ADVANCED_SEQUENCE,
  THRESHOLD_CONTRADICTION_ROWS,
  checkSparrowAdvancedSequence,
  checkThresholdContradictions,
  type SparrowAdvancedSequenceId,
} from "./advancedMurdlePuzzles";

type AdvancedMurdlePuzzleProps = {
  chapter: "sparrow" | "threshold";
};

export function AdvancedMurdlePuzzle({ chapter }: AdvancedMurdlePuzzleProps) {
  return chapter === "sparrow" ? <SparrowSequencePuzzle /> : <ThresholdContradictionPuzzle />;
}

function SparrowSequencePuzzle() {
  const [sequence, setSequence] = useState<SparrowAdvancedSequenceId[]>([]);
  const [checked, setChecked] = useState(false);
  const remaining = SPARROW_ADVANCED_SEQUENCE.filter((item) => !sequence.includes(item.id));
  const solved = checkSparrowAdvancedSequence(sequence);

  function choose(id: SparrowAdvancedSequenceId) {
    setSequence((current) => [...current, id]);
    setChecked(false);
  }

  function undo() {
    setSequence((current) => current.slice(0, -1));
    setChecked(false);
  }

  return (
    <section
      className="mt-5 border border-indigo-400/30 bg-indigo-950/10 p-4 sm:p-5"
      aria-label="Enigma avançado de sequência de Sparrow Hollow"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-indigo-300">
        Enigma avançado · cadeia cronológica
      </p>
      <h2 className="mt-1 font-display text-2xl">Reconstrua a cadeia sem pular evidências</h2>
      <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
        Selecione os cartões na ordem em que o arquivo permite sustentá-los. A dificuldade está em
        separar o retorno de Marcus do relato antigo dos três dias.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-2 sm:grid-cols-2">
          {remaining.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => choose(item.id)}
              className="border border-border bg-background/50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-950/30"
            >
              <span className="block font-mono text-[10px] uppercase tracking-wider text-indigo-300">
                Próximo cartão
              </span>
              <span className="mt-1 block font-display text-lg">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {item.detail}
              </span>
            </button>
          ))}
        </div>
        <div className="border border-border bg-background/50 p-3 lg:min-w-64">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sua sequência
          </p>
          <ol className="mt-2 space-y-2">
            {sequence.map((id, index) => {
              const item = SPARROW_ADVANCED_SEQUENCE.find((candidate) => candidate.id === id);
              return (
                <li key={id} className="flex gap-2 text-xs">
                  <span className="font-mono text-indigo-300">{index + 1}.</span>
                  <span>{item?.label}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={sequence.length === 0}
              className="border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground disabled:opacity-40"
            >
              Desfazer
            </button>
            <button
              type="button"
              onClick={() => setChecked(true)}
              disabled={sequence.length !== SPARROW_ADVANCED_SEQUENCE.length}
              className="border border-indigo-300 bg-indigo-300 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-indigo-950 disabled:opacity-40"
            >
              Conferir
            </button>
          </div>
        </div>
      </div>
      {checked && (
        <p className={`mt-3 text-xs ${solved ? "text-emerald-300" : "text-amber-200"}`}>
          {solved
            ? "Cadeia correta: você preservou a cronologia sem transformar hipótese em fato."
            : "A ordem ainda mistura épocas ou salta uma evidência. Releia os períodos dos cartões."}
        </p>
      )}
    </section>
  );
}

function ThresholdContradictionPuzzle() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const solved = checkThresholdContradictions(answers);

  return (
    <section
      className="mt-5 border border-amber-400/30 bg-amber-950/10 p-4 sm:p-5"
      aria-label="Matriz avançada de contradições de Threshold"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300">
        Enigma avançado · matriz de contradições
      </p>
      <h2 className="mt-1 font-display text-2xl">O que a evidência realmente permite dizer?</h2>
      <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
        Para cada registro, escolha a conclusão mais forte que ainda permanece honesta. Como em uma
        grade Murdle, uma única associação exagerada quebra a matriz inteira.
      </p>
      <div className="mt-4 grid gap-3">
        {THRESHOLD_CONTRADICTION_ROWS.map((row) => {
          const selected = answers[row.id] ?? "";
          const right = checked && selected === row.answer;
          const wrong = checked && selected !== row.answer;
          return (
            <div
              key={row.id}
              className={`grid gap-3 border p-3 md:grid-cols-[1fr_20rem] md:items-center ${right ? "border-emerald-500/60 bg-emerald-950/20" : wrong ? "border-rose-500/60 bg-rose-950/20" : "border-border bg-background/40"}`}
            >
              <div>
                <p className="font-display text-lg">{row.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{row.evidence}</p>
              </div>
              <select
                aria-label={`Conclusão permitida: ${row.label}`}
                value={selected}
                onChange={(event) => {
                  setAnswers((current) => ({ ...current, [row.id]: event.target.value }));
                  setChecked(false);
                }}
                className="min-h-10 border border-border bg-background px-2 py-2 text-xs text-foreground"
              >
                <option value="">Selecione a conclusão</option>
                {row.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="border border-amber-300 bg-amber-300 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-amber-950"
        >
          Conferir matriz
        </button>
        {checked && (
          <p className={`text-xs ${solved ? "text-emerald-300" : "text-amber-200"}`}>
            {solved
              ? "Matriz resolvida: observação, hipótese e lacuna permanecem separadas."
              : "A matriz contém uma conclusão forte demais ou uma classificação incompleta."}
          </p>
        )}
      </div>
    </section>
  );
}
