import { useState } from "react";
import { Check, FileSearch, RotateCcw } from "lucide-react";

type StepId = "evidence" | "observation" | "hypothesis" | "comparison" | "conclusion";

type Props = {
  onSolved?: () => void;
};

const STEPS: readonly { id: StepId; label: string; prompt: string }[] = [
  { id: "evidence", label: "1 · Evidência", prompt: "O que foi encontrado?" },
  { id: "observation", label: "2 · Observação", prompt: "O que é diretamente legível ou visível?" },
  { id: "hypothesis", label: "3 · Hipótese", prompt: "Que explicação provisória surge?" },
  {
    id: "comparison",
    label: "4 · Confronto",
    prompt: "Qual fonte independente deve ser comparada?",
  },
  {
    id: "conclusion",
    label: "5 · Conclusão",
    prompt: "O que pode ser afirmado sem fechar a lacuna?",
  },
];

const CARDS = [
  {
    id: "source-p008",
    step: "evidence" as const,
    title: "P-008 · Notícia sobre Henry",
    text: "Registro catalogado da descoberta de um corpo no carro submerso no Lago Cherry Creek.",
  },
  {
    id: "observation-lake",
    step: "observation" as const,
    title: "Observação limitada",
    text: "A fonte relata local e intervalo aproximado; não determina sozinha causa ou autoria.",
  },
  {
    id: "hypothesis-funds",
    step: "hypothesis" as const,
    title: "Hipótese provisória",
    text: "A morte pode estar conectada à linha financeira da família Roberts — ainda sem confirmação.",
  },
  {
    id: "comparison-p007",
    step: "comparison" as const,
    title: "P-007 · Relatório financeiro",
    text: "Fonte independente para confrontar a hipótese, sem transformar a acusação em prova.",
  },
  {
    id: "conclusion-open",
    step: "conclusion" as const,
    title: "Estado aberto",
    text: "Registrar a conexão como parcial e procurar evidência capaz de confirmar ou refutar.",
  },
] as const;

export function PainscreekEvidenceChainMinigame({ onSolved }: Props) {
  const [selection, setSelection] = useState<Record<StepId, string>>({
    evidence: "",
    observation: "",
    hypothesis: "",
    comparison: "",
    conclusion: "",
  });
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);

  const update = (step: StepId, cardId: string) => {
    if (solved) return;
    setSelection((current) => ({ ...current, [step]: cardId }));
    setFeedback("");
  };

  const check = () => {
    const complete = STEPS.every(({ id }) => selection[id]);
    const unique = new Set(Object.values(selection)).size === STEPS.length;
    const correct = STEPS.every(
      ({ id }) => CARDS.find((card) => card.id === selection[id])?.step === id,
    );
    if (complete && unique && correct) {
      setSolved(true);
      setFeedback(
        "Cadeia rastreável. A conclusão permanece aberta: a hipótese ganhou um caminho de verificação, não um veredito automático.",
      );
      onSolved?.();
    } else {
      setFeedback(
        "A cadeia não fecha. Cada cartão deve responder à pergunta da sua camada, sem reutilizar cartões.",
      );
    }
  };

  const reset = () => {
    setSelection({ evidence: "", observation: "", hypothesis: "", comparison: "", conclusion: "" });
    setFeedback("");
    setSolved(false);
  };

  return (
    <section className="border border-[#52626a] bg-[#151a1c] p-4" aria-label="Cadeia de evidência">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9fd1d5]">
            Rastreabilidade · Painscreek
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-display text-2xl text-[#d8eeee]">
            <FileSearch size={19} aria-hidden="true" /> Cadeia de Evidência
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#abc0c2]">
            Construa uma diligência completa: fonte, observação, hipótese, confronto e estado da
            conclusão. Uma hipótese só se fortalece quando também pode ser refutada.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-9 items-center gap-2 border border-[#668087] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#c5e4e4] hover:bg-[#9fd1d5]/10"
        >
          <RotateCcw size={14} aria-hidden="true" /> Reiniciar
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {STEPS.map((step) => (
          <label key={step.id} className="block border border-[#39494d] bg-[#1c2426] p-3">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#9fd1d5]">
              {step.label}
            </span>
            <span className="mt-1 block text-sm text-[#d8eeee]">{step.prompt}</span>
            <select
              aria-label={step.prompt}
              value={selection[step.id]}
              onChange={(event) => update(step.id, event.target.value)}
              disabled={solved}
              className="mt-2 min-h-11 w-full border border-[#526a70] bg-[#111719] px-3 py-2 text-sm text-[#d8eeee]"
            >
              <option value="">Escolha um cartão</option>
              {CARDS.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.title} — {card.text}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={check}
        disabled={solved || Object.values(selection).some((value) => !value)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border-2 border-[#9fd1d5] bg-[#9fd1d5]/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#d8eeee] hover:bg-[#9fd1d5]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {solved ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <FileSearch size={16} aria-hidden="true" />
        )}
        {solved ? "Cadeia conferida" : "Conferir cadeia"}
      </button>
      {feedback && (
        <p
          className="mt-3 border border-[#526a70] bg-[#1c2426] p-3 text-sm text-[#d8eeee]"
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
