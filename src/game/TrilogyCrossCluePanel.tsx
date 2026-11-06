import { useMemo, useState } from "react";
import {
  TRILOGY_BOOK_LABELS,
  TRILOGY_CROSS_CLUES,
  checkTrilogyCrossClues,
  type TrilogyBookId,
} from "./trilogyCrossClues";

type TrilogyCrossCluePanelProps = {
  currentBook: TrilogyBookId;
};

export function TrilogyCrossCluePanel({ currentBook }: TrilogyCrossCluePanelProps) {
  const [matches, setMatches] = useState<Record<string, TrilogyBookId | "">>({});
  const [checked, setChecked] = useState(false);
  const solved = useMemo(() => checkTrilogyCrossClues(matches), [matches]);
  const relatedClues = TRILOGY_CROSS_CLUES.filter((clue) => clue.books.includes(currentBook));

  function updateMatch(id: string, value: TrilogyBookId | "") {
    setMatches((current) => ({ ...current, [id]: value }));
    setChecked(false);
  }

  function checkAnswers() {
    setChecked(true);
  }

  return (
    <section
      className="mt-5 border border-primary/30 bg-primary/5 p-4 sm:p-5"
      aria-label="Pistas cruzadas da trilogia"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            Arquivo paralelo · dedução Murdle
          </p>
          <h2 className="mt-1 font-display text-2xl">Conexões entre os três livros</h2>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
            Relacione cada pista ao arquivo de origem. É uma camada opcional: errar aqui não
            bloqueia nem altera a conclusão do caso atual.
          </p>
        </div>
        <span className="border border-primary/30 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
          {relatedClues.length} pistas disponíveis
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {relatedClues.map((clue) => {
          const selected = matches[clue.id] ?? "";
          const wrong = checked && selected !== clue.answer;
          const right = checked && selected === clue.answer;
          return (
            <article
              key={clue.id}
              className={`border p-3 ${right ? "border-emerald-500/60 bg-emerald-950/20" : wrong ? "border-rose-500/60 bg-rose-950/20" : "border-border/70 bg-background/40"}`}
            >
              <p className="font-display text-lg">{clue.label}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{clue.clue}</p>
              <p className="mt-2 border-l-2 border-primary/50 pl-2 text-[11px] italic text-primary/90">
                {clue.connection}
              </p>
              <label className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Arquivo relacionado
                <select
                  aria-label={`Arquivo relacionado: ${clue.label}`}
                  value={selected}
                  onChange={(event) =>
                    updateMatch(clue.id, event.target.value as TrilogyBookId | "")
                  }
                  className="mt-1 block min-h-10 w-full border border-border bg-background px-2 py-2 text-xs normal-case tracking-normal text-foreground"
                >
                  <option value="">Selecione um arquivo</option>
                  {clue.books.map((book) => (
                    <option key={book} value={book}>
                      {TRILOGY_BOOK_LABELS[book]}
                    </option>
                  ))}
                </select>
              </label>
              {right && (
                <p className="mt-2 text-xs text-emerald-300">Conexão sustentada pelo arquivo.</p>
              )}
              {wrong && (
                <p className="mt-2 text-xs text-rose-300">
                  Essa relação não fecha com a cronologia.
                </p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={checkAnswers}
          className="border border-primary bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
        >
          Conferir conexões
        </button>
        {checked && (
          <p className={`text-xs ${solved ? "text-emerald-300" : "text-amber-200"}`}>
            {solved
              ? "Todas as conexões foram resolvidas."
              : "Algumas conexões ainda precisam ser revistas."}
          </p>
        )}
      </div>
    </section>
  );
}
