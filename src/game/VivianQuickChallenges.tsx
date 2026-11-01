import { useState } from "react";
import { Check, ChevronDown, Clock3, FileSearch, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  QUICK_CASE_IDS,
  VIVIAN_QUICK_CASES,
  WITNESS_CASE,
  WITNESS_CASE_ID,
  evaluateQuickCase,
  evaluateWitnessClaim,
} from "./vivianQuickCases";

type Props = {
  found: string[];
  completed: string[];
  onComplete: (id: string) => void;
};

export function VivianQuickChallenges({ found, completed, onComplete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedWitness, setSelectedWitness] = useState("");
  const [witnessFeedback, setWitnessFeedback] = useState("");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [caseFeedback, setCaseFeedback] = useState("");
  const witnessUnlocked = WITNESS_CASE.requiredRecords.every((id) => found.includes(id));
  const activeCase = VIVIAN_QUICK_CASES.find((item) => item.id === activeCaseId);
  const witnessSolved = completed.includes(WITNESS_CASE_ID);

  const completeWitness = () => {
    const result = evaluateWitnessClaim(selectedWitness, found);
    if (result === "supported") {
      onComplete(WITNESS_CASE_ID);
      setWitnessFeedback("");
    } else {
      setWitnessFeedback(
        result === "locked"
          ? "Encontre o arquivo necessário antes de conferir."
          : "Essa versão não é a incompatível. Volte ao relatório e confira o que as testemunhas puderam ouvir.",
      );
    }
  };

  const completeQuickCase = (caseId: string) => {
    const result = evaluateQuickCase(caseId, answers[caseId] ?? {}, found);
    if (result === "supported") {
      onComplete(caseId);
      setCaseFeedback("");
    } else {
      setCaseFeedback(
        result === "locked"
          ? "Este caso ainda está bloqueado pelos registros necessários."
          : "Ainda há uma resposta que extrapola ou contradiz as fontes. Revise as etapas; sua pontuação não muda.",
      );
    }
  };

  return (
    <section
      className="space-y-5 border border-border bg-card/30 p-4 sm:p-5"
      aria-label="Depoimentos e casos curtos"
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full flex-wrap items-center justify-between gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            Desafios opcionais · sem impacto na pontuação
          </span>
          <span className="mt-1 flex items-center gap-2 font-display text-xl">
            <FileSearch size={18} /> Entre um local e outro
          </span>
          <span className="mt-1 block max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Depoimentos e casos-relâmpago para pausas curtas durante a investigação. Não alteram a
            história, o relatório final nem os áudios.
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          {
            completed.filter((id) => QUICK_CASE_IDS.includes(id as (typeof QUICK_CASE_IDS)[number]))
              .length
          }
          /{QUICK_CASE_IDS.length} concluídos
          <ChevronDown
            size={17}
            className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
          />
        </span>
      </button>

      {expanded && (
        <div className="space-y-5 pt-2">
          <article className="border border-border p-4" aria-label={WITNESS_CASE.title}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-lg">{WITNESS_CASE.title}</h4>
              {witnessSolved ? (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <Check size={14} /> Conferido
                </span>
              ) : (
                <span className="font-mono text-[10px] text-muted-foreground">1–2 min</span>
              )}
            </div>
            {witnessSolved ? (
              <p className="mt-3 border-l-2 border-primary pl-3 text-sm leading-relaxed">
                {WITNESS_CASE.explanation}
              </p>
            ) : !witnessUnlocked ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Encontre o Arquivo do xerife para abrir esta conferência.
              </p>
            ) : (
              <>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {WITNESS_CASE.instructions}
                </p>
                <fieldset className="mt-3 space-y-2">
                  <legend className="text-sm">Qual versão contradiz o documento?</legend>
                  {WITNESS_CASE.statements.map((statement) => (
                    <label
                      key={statement.id}
                      className="flex cursor-pointer items-start gap-3 border-b border-border py-2 text-sm leading-relaxed"
                    >
                      <input
                        type="radio"
                        name="vivian-witness-claim"
                        value={statement.id}
                        checked={selectedWitness === statement.id}
                        onChange={() => {
                          setSelectedWitness(statement.id);
                          setWitnessFeedback("");
                        }}
                        className="mt-1 shrink-0 accent-primary"
                      />
                      <span>
                        <strong>{statement.speaker}:</strong> {statement.text}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <Button
                  type="button"
                  className="mt-3"
                  variant="outline"
                  disabled={!selectedWitness}
                  onClick={completeWitness}
                >
                  <Scale size={16} /> Conferir depoimentos
                </Button>
                {witnessFeedback && (
                  <p role="status" className="mt-2 text-sm text-destructive">
                    {witnessFeedback}
                  </p>
                )}
              </>
            )}
          </article>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-lg">Casos-relâmpago</h4>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
                <Clock3 size={13} /> cerca de 5 min cada
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Cada caso cruza dois pontos de leitura. Os desafios só abrem quando você encontra a
              fonte citada.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {VIVIAN_QUICK_CASES.map((quickCase) => {
                const isUnlocked = quickCase.requiredRecords.every((id) => found.includes(id));
                const isSolved = completed.includes(quickCase.id);
                return (
                  <Button
                    key={quickCase.id}
                    type="button"
                    variant={activeCaseId === quickCase.id ? "secondary" : "outline"}
                    disabled={!isUnlocked}
                    aria-expanded={activeCaseId === quickCase.id}
                    className="h-auto min-h-14 justify-between whitespace-normal p-3 text-left"
                    onClick={() => {
                      setActiveCaseId(activeCaseId === quickCase.id ? null : quickCase.id);
                      setCaseFeedback("");
                    }}
                  >
                    <span className="pr-2">
                      <span className="block text-sm">{quickCase.title}</span>
                      <span className="mt-1 block text-[10px] font-normal text-muted-foreground">
                        {isUnlocked
                          ? quickCase.summary
                          : "Registro necessário ainda não encontrado"}
                      </span>
                    </span>
                    {isSolved ? (
                      <Check size={17} className="shrink-0 text-primary" />
                    ) : (
                      <Clock3 size={16} className="shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>
            {activeCase && (
              <article
                className="mt-3 border border-primary/40 bg-background p-4"
                aria-label={activeCase.title}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-display text-lg">{activeCase.title}</h5>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    ~5 min
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {activeCase.summary}
                </p>
                {activeCase.sourceReference && (
                  <aside
                    className="mt-3 space-y-2 border-l-2 border-primary/70 bg-muted/30 p-3 text-sm leading-relaxed"
                    aria-label="Contexto documental do caso"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      Fonte de apoio · {activeCase.sourceReference}
                    </p>
                    {activeCase.briefing && <p>{activeCase.briefing}</p>}
                    {activeCase.objective && (
                      <p>
                        <strong>Desafio:</strong> {activeCase.objective}
                      </p>
                    )}
                  </aside>
                )}
                {completed.includes(activeCase.id) ? (
                  <div className="mt-3 space-y-2 border-l-2 border-primary pl-3 text-sm leading-relaxed">
                    {activeCase.steps.map((step) => (
                      <p key={step.id}>
                        <strong>{step.question}</strong> {step.explanation}
                      </p>
                    ))}
                    <p className="text-primary">Caso curto concluído. Nenhum ponto foi alterado.</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-4">
                    {activeCase.steps.map((step, index) => (
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
                              name={`${activeCase.id}-${step.id}`}
                              value={option.id}
                              checked={answers[activeCase.id]?.[step.id] === option.id}
                              onChange={() => {
                                setAnswers((current) => ({
                                  ...current,
                                  [activeCase.id!]: {
                                    ...(current[activeCase.id!] ?? {}),
                                    [step.id]: option.id,
                                  },
                                }));
                                setCaseFeedback("");
                              }}
                              className="mt-1 shrink-0 accent-primary"
                            />
                            {option.label}
                          </label>
                        ))}
                      </fieldset>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => completeQuickCase(activeCase.id)}
                    >
                      <Scale size={16} /> Conferir caso
                    </Button>
                    {caseFeedback && (
                      <p role="status" className="text-sm text-destructive">
                        {caseFeedback}
                      </p>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
