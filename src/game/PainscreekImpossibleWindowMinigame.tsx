import { useState } from "react";
import { Check, FileSearch, RotateCcw } from "lucide-react";

type Props = {
  onSolved?: () => void;
};

type AnswerId =
  | "literal-19"
  | "news-7"
  | "unknown-date"
  | "funeral-certain"
  | "someone-lied"
  | "fire-homicide"
  | "news-proves-cause";

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
    title: "A data da descoberta",
    question:
      "P-034 tem uma anotação datada de 19/06/1995 sobre a morte e o funeral de Andrew. É sustentável ler isso como prova de que Andrew só foi encontrado morto em 19/06?",
    answers: [
      {
        id: "literal-19",
        label: "Sim. Andrew só foi encontrado morto em 19/06/1995.",
      },
      {
        id: "news-7",
        label:
          "Não. P-015 já noticia em 07/06/1995 que Andrew foi encontrado morto; a anotação de 19/06 não apaga esse registro.",
      },
      {
        id: "unknown-date",
        label: "Sim. A data da anotação prova que a notícia de 07/06 está errada.",
      },
    ],
    correct: "news-7",
    error:
      "P-015, p. 87, é uma notícia datada de 07/06/1995 e já relata que Andrew foi encontrado morto. Portanto, a leitura de que isso só ocorreu em 19/06 não se sustenta; ainda não sabemos a que se refere exatamente a data de P-034.",
    success:
      "P-015 registra a descoberta em notícia de 07/06. Isso elimina a leitura literal de uma descoberta apenas em 19/06, sem resolver o sentido da data em P-034.",
  },
  {
    title: "O que a tensão permite concluir",
    question:
      "Considerando P-015 e P-034, qual é a conclusão mais segura diante da diferença entre os registros?",
    answers: [
      {
        id: "funeral-certain",
        label: "19/06 é definitivamente a data do funeral, e não pode indicar outra coisa.",
      },
      {
        id: "someone-lied",
        label: "Alguém mentiu ou falsificou um dos documentos.",
      },
      {
        id: "fire-homicide",
        label: "O incêndio foi homicídio, e um culpado pode ser identificado por essa divergência.",
      },
      {
        id: "news-proves-cause",
        label: "A notícia prova a causa da morte porque relata o incêndio.",
      },
      {
        id: "unknown-date",
        label:
          "Há tensão se 19/06 for lido como data do evento, mas os documentos não esclarecem a que se refere a anotação; não determinam a causa nem identificam culpado, mentira ou falsificação.",
      },
    ],
    correct: "unknown-date",
    error:
      "A divergência documental não basta para escolher entre explicações. P-034 não tem autoria identificada com segurança; P-015 diz que a causa não havia sido determinada e que homicídio não fora identificado naquele momento.",
    success:
      "Conclusão limitada: a data de P-034 permanece ambígua. Os registros não determinam a causa da morte nem provam culpado, mentira ou falsificação.",
  },
];

export function PainscreekImpossibleWindowMinigame({ onSolved }: Props) {
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
      aria-label="Exercício editorial sobre a cronologia de Andrew Reed"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9fd1d5]">
            Leitura de fonte · Painscreek
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-display text-2xl text-[#d8eeee]">
            <FileSearch size={19} aria-hidden="true" />
            <span>Janela impossível — Andrew</span>
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#abc0c2]">
            Compare os registros sem preencher lacunas com suspeitas. Este é um exercício editorial
            de leitura documental, não uma alteração do cânone nem uma solução definitiva do caso.
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
            P-015 registra que Andrew foi encontrado morto em notícia de 07/06/1995. A anotação de
            19/06 em P-034 cria uma tensão se tomada como data do evento, mas não esclarece a que se
            refere. Nenhuma das fontes determina a causa ou identifica culpado, falsidade ou
            mentira.
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
                    name={`andrew-window-step-${stepIndex}`}
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

      <div className="mt-4 space-y-1 border-t border-[#39494d] pt-3 font-mono text-[10px] uppercase tracking-wider text-[#9caeb0]">
        <p>Exercício editorial · não altera o cânone.</p>
        <p>
          Fonte: P-015, notícia de 07/06/1995, p. 87; P-034, anotação de 19/06/1995, pp. 115–116.
        </p>
        <p>
          Limite epistemológico: a data de P-034 e sua referência permanecem sem resolução; causa e
          autoria da anotação também não são estabelecidas com segurança. Não há conclusão
          documentada sobre causa da morte, culpado, mentira ou falsificação.
        </p>
      </div>
    </section>
  );
}
