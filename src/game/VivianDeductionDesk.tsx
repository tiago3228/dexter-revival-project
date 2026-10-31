import { useState } from "react";
import { Check, FileSearch, NotebookPen, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIVIAN_DEDUCTIONS, evaluateVivianDeduction } from "./vivianDeductions";

type Source = { id: string; title: string; source: string; summary: string; caution: string; audioSrc: string };

export function VivianDeductionDesk({ sources, selected, solved, notes, onSolve, onNotes }: {
  sources: Source[];
  selected: string[];
  solved: string[];
  notes: string;
  onSolve: (id: string) => void;
  onNotes: (text: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const found = sources.map((source) => source.id);
  const available = VIVIAN_DEDUCTIONS.filter((item) => item.sources.every((id) => found.includes(id)));
  const active = available.find((item) => item.id === activeId) ?? available[0];
  const comparison = sources.filter((source) => selected.includes(source.id));

  return (
    <section className="mt-5 space-y-6 border-y border-border py-6 text-foreground" aria-label="Mesa de dedução">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl"><Scale size={22} /> Mesa de dedução</h2>
        <span className="font-mono text-xs text-muted-foreground">Exercícios opcionais · {solved.length}/{VIVIAN_DEDUCTIONS.length}</span>
      </div>
      {comparison.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Fontes lado a lado">
          {comparison.map((source) => (
            <article key={source.id} className="min-w-0 border-l-2 border-primary bg-card p-4 text-card-foreground">
              <h3 className="font-display text-xl">{source.title}</h3>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{source.source}</p>
              <p className="mt-3 text-sm leading-relaxed">{source.summary}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{source.caution}</p>
              <audio className="mt-3 h-9 w-full" controls preload="none" src={source.audioSrc} aria-label={`Ouvir fonte comparada: ${source.title}`} />
            </article>
          ))}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="space-y-2" aria-label="Deduções disponíveis">
          {available.map((item) => (
            <Button key={item.id} variant={active?.id === item.id ? "secondary" : "ghost"} className="h-auto min-h-11 w-full justify-start whitespace-normal text-left" onClick={() => { setActiveId(item.id); setFeedback(""); }}>
              {solved.includes(item.id) ? <Check /> : <FileSearch />} {item.title}
            </Button>
          ))}
          {available.length === 0 && <p className="text-sm text-muted-foreground">Nenhum par de fontes disponível para análise ainda.</p>}
        </nav>
        {active && (
          <div className="min-w-0" key={active.id}>
            <h3 className="font-display text-2xl">{active.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{active.question}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {active.sources.map((id) => <span key={id} className="border-b border-border pb-1">{sources.find((source) => source.id === id)?.title}</span>)}
            </div>
            {solved.includes(active.id) ? (
              <p className="mt-4 border-l-2 border-primary pl-4 text-sm leading-relaxed">{active.insight}</p>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={(event) => {
                event.preventDefault();
                const result = evaluateVivianDeduction(active.id, answers[active.id] ?? "", found);
                if (result === "supported") { onSolve(active.id); setFeedback(""); }
                else setFeedback("Esta leitura extrapola o que as fontes sustentam. Compare os registros novamente; sua pontuação foi mantida.");
              }}>
                {active.options.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-start gap-3 border-b border-border py-3 text-sm leading-relaxed">
                    <input type="radio" name={`deduction-${active.id}`} value={option.id} checked={answers[active.id] === option.id} onChange={() => { setAnswers((current) => ({ ...current, [active.id]: option.id })); setFeedback(""); }} className="mt-1 shrink-0 accent-primary" />
                    {option.label}
                  </label>
                ))}
                <Button type="submit" variant="outline" disabled={!answers[active.id]}><Scale /> Sustentar dedução</Button>
                {feedback && <p role="status" className="text-sm leading-relaxed text-muted-foreground">{feedback}</p>}
              </form>
            )}
          </div>
        )}
      </div>
      <label className="block border-t border-border pt-4">
        <span className="flex items-center gap-2 font-display text-xl"><NotebookPen size={19} /> Minhas hipóteses · não verificadas</span>
        <textarea value={notes} onChange={(event) => onNotes(event.target.value)} maxLength={4000} rows={4} aria-label="Minhas hipóteses" className="mt-3 w-full resize-y border border-input bg-background p-3 text-sm leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </label>
    </section>
  );
}