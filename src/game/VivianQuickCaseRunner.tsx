import { useState } from "react";
import { Check, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluateQuickCase, QUICK_CASE_POINTS, type QuickCase } from "./vivianQuickCases";

type Props = {
  quickCase: QuickCase;
  found: readonly string[];
  completed: boolean;
  onComplete: (id: string) => void;
};

export function VivianQuickCaseRunner({ quickCase, found, completed, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");

  const checkCase = () => {
    const result = evaluateQuickCase(quickCase.id, answers, found);
    if (result === "supported") {
      onComplete(quickCase.id);
      setFeedback("");
    } else {
      setFeedback(
        result === "locked"
          ? "Este caso ainda está bloqueado pelos registros necessários."
          : "Revise as fontes e tente novamente. Nenhum ponto é perdido; a pontuação principal não muda.",
      );
    }
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
          {quickCase.steps.map((step) => (
            <p key={step.id}>
              <strong>{step.question}</strong> {step.explanation}
            </p>
          ))}
          <p className="flex items-center gap-2 text-primary">
            <Check size={15} /> Caso concluído: +{QUICK_CASE_POINTS} pontos no arquivo. A pontuação
            principal não muda.
          </p>
        </div>
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
