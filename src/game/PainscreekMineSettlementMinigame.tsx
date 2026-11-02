import { useState } from "react";
import { Check, FileSearch, RotateCcw } from "lucide-react";

type Props = {
  onSolved?: () => void;
};

type AnswerId =
  | "workers-19"
  | "workers-6"
  | "workers-13"
  | "amount-120"
  | "amount-96"
  | "amount-24"
  | "aggregate-only"
  | "equal-share"
  | "not-reported";

type ExerciseStep = {
  title: string;
  question: string;
  answers: readonly { id: AnswerId; label: string }[];
  correct: AnswerId;
  error: string;
  success: string;
};

const STEPS: readonly ExerciseStep[] = [
  {
    title: "1 · Contagem",
    question:
      "A notícia menciona seis moradores e treze pessoas de outras cidades que morreram. Qual é o total?",
    answers: [
      { id: "workers-19", label: "19 trabalhadores (6 + 13)" },
      { id: "workers-6", label: "6 trabalhadores; as demais pessoas ficam fora da soma" },
      { id: "workers-13", label: "13 trabalhadores; esse é o total informado" },
    ],
    correct: "workers-19",
    error:
      "Revise os dois grupos mencionados: some seis moradores e treze pessoas de outras cidades.",
    success: "Contagem conferida: 6 + 13 = 19 pessoas.",
  },
  {
    title: "2 · Conferência dos valores",
    question:
      "O evento beneficente arrecadou US$ 96.000 e a Companhia Roberts contribuiu com US$ 24.000. Qual soma coincide com o total que o texto diz ter sido indenizado às seis famílias?",
    answers: [
      { id: "amount-120", label: "US$ 120.000 (US$ 96.000 + US$ 24.000)" },
      { id: "amount-96", label: "US$ 96.000; desconsiderando a contribuição" },
      { id: "amount-24", label: "US$ 24.000; usando apenas a contribuição" },
    ],
    correct: "amount-120",
    error:
      "Compare o total agregado informado para indenizações com a soma da arrecadação e da contribuição.",
    success:
      "Conferência aritmética: US$ 96.000 + US$ 24.000 = US$ 120.000, igual ao total relatado.",
  },
  {
    title: "3 · Limite da conclusão",
    question:
      "O texto informa US$ 120.000 indenizados às seis famílias. O que essa notícia permite concluir sobre a quantia de cada família?",
    answers: [
      {
        id: "aggregate-only",
        label:
          "Informa somente um total agregado; não especifica a distribuição entre as famílias.",
      },
      { id: "equal-share", label: "Cada família recebeu US$ 20.000, em partes iguais." },
      { id: "not-reported", label: "Não informa nenhum total de indenização." },
    ],
    correct: "aggregate-only",
    error:
      "A fonte dá um total para as seis famílias, mas não descreve valores individuais nem afirma que houve divisão igual.",
    success:
      "Leitura cuidadosa: a distribuição individual não é especificada; não se pode afirmar um rateio igual.",
  },
];

export function PainscreekMineSettlementMinigame({ onSolved }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState<AnswerId | "">("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);

  const step = STEPS[stepIndex]!;

  const checkStep = () => {
    if (solved || !selection) return;
    if (selection !== step.correct) {
      setFeedback(step.error);
      return;
    }

    setFeedback(step.success);
    if (stepIndex === STEPS.length - 1) {
      setSolved(true);
      onSolved?.();
      return;
    }

    setStepIndex((current) => current + 1);
    setSelection("");
  };

  const reset = () => {
    setStepIndex(0);
    setSelection("");
    setFeedback("");
    setSolved(false);
  };

  return (
    <section
      className="border border-[#52626a] bg-[#151a1c] p-4"
      aria-label="Conferência editorial da notícia da mina"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9fd1d5]">
            Leitura de fonte · Painscreek
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-display text-2xl text-[#d8eeee]">
            <FileSearch size={19} aria-hidden="true" /> Fechamento de contas: a mina
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#abc0c2]">
            Examine a contagem, confira os valores e separe o que a notícia afirma do que ela não
            permite inferir. Exercício editorial, não uma conclusão canônica sobre o caso.
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

      {solved ? (
        <div className="mt-5 border border-[#526a70] bg-[#1c2426] p-4" role="status">
          <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#bde7c8]">
            <Check size={16} aria-hidden="true" /> Exercício concluído
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#d8eeee]">
            A notícia registra US$ 120.000 no total para seis famílias, sem indicar quanto recebeu
            cada uma. Não atribua US$ 20.000 a cada família sem outra fonte.
          </p>
        </div>
      ) : (
        <div className="mt-5 border border-[#39494d] bg-[#1c2426] p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#9fd1d5]">
            Etapa {stepIndex + 1} de {STEPS.length} · {step.title}
          </p>
          <fieldset className="mt-2">
            <legend className="text-sm leading-relaxed text-[#d8eeee]">{step.question}</legend>
            <div className="mt-3 space-y-2">
              {step.answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex min-h-11 cursor-pointer items-start gap-3 border border-[#39494d] bg-[#111719] p-3 text-sm text-[#d8eeee] hover:border-[#668087]"
                >
                  <input
                    type="radio"
                    name={`mine-settlement-step-${stepIndex}`}
                    value={answer.id}
                    checked={selection === answer.id}
                    onChange={() => {
                      setSelection(answer.id);
                      setFeedback("");
                    }}
                    className="mt-0.5 accent-[#9fd1d5]"
                  />
                  <span>{answer.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            onClick={checkStep}
            disabled={!selection}
            className="mt-4 inline-flex min-h-11 items-center gap-2 border-2 border-[#9fd1d5] bg-[#9fd1d5]/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#d8eeee] hover:bg-[#9fd1d5]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={16} aria-hidden="true" /> Conferir etapa
          </button>
          {feedback && (
            <p
              className="mt-3 border border-[#526a70] bg-[#151a1c] p-3 text-sm text-[#d8eeee]"
              role="status"
            >
              {feedback}
            </p>
          )}
        </div>
      )}

      <p className="mt-4 border-t border-[#39494d] pt-3 font-mono text-[10px] uppercase tracking-wider text-[#9caeb0]">
        Referência: P-014 · p. 86
      </p>
    </section>
  );
}
