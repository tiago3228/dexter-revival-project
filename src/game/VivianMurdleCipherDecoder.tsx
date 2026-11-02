import { useMemo, useState } from "react";
import { Check, KeyRound, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Stage = {
  title: string;
  source: string;
  message: string;
  shift: number;
  answer: string;
};

type Props = {
  solved?: boolean;
  onSolved: () => void;
};

const STAGES: readonly Stage[] = [
  {
    title: "O destino da fita",
    source: "Bilhete sem assinatura · margem do arquivo",
    message: "D ILWD  SDVVD  SHOR  ODJR",
    shift: 3,
    answer: "LAGO",
  },
  {
    title: "A testemunha da carta",
    source: "Recorte dobrado · bolso do dossiê",
    message: "F HFWYF  KNHF  ST  FWVZNAT",
    shift: 5,
    answer: "ARQUIVO",
  },
  {
    title: "A última indicação",
    source: "Etiqueta de evidência · caixa 06",
    message: "C HQVQ  UGIWG  RCTC  Q  JQURKVCN",
    shift: 2,
    answer: "HOSPITAL",
  },
];

function decode(message: string, shift: number) {
  return message.replace(/[A-Z]/g, (letter) => {
    const decoded = (letter.charCodeAt(0) - 65 - shift + 26) % 26;
    return String.fromCharCode(decoded + 65);
  });
}

export function VivianMurdleCipherDecoder({ solved = false, onSolved }: Props) {
  const [stageIndex, setStageIndex] = useState(0);
  const [shift, setShift] = useState(1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [complete, setComplete] = useState(solved);
  const stage = STAGES[stageIndex]!;
  const decoded = useMemo(() => decode(stage.message, shift), [stage.message, shift]);

  const submit = () => {
    if (shift !== stage.shift || answer.trim().toUpperCase() !== stage.answer) {
      setFeedback(
        "A chave ou a palavra ainda não confere. Gire o anel até a mensagem formar uma frase legível e responda com o local indicado.",
      );
      return;
    }
    if (stageIndex === STAGES.length - 1) {
      setComplete(true);
      setFeedback("Código completo. As três mensagens foram decifradas como exercício editorial.");
      onSolved();
      return;
    }
    setFeedback(`Mensagem ${stageIndex + 1} decifrada. A próxima anotação foi liberada.`);
    setStageIndex((current) => current + 1);
    setShift(1);
    setAnswer("");
  };

  const reset = () => {
    setStageIndex(0);
    setShift(1);
    setAnswer("");
    setFeedback("");
    setComplete(false);
  };

  return (
    <section
      className="mt-6 space-y-4 border border-[#8f7955] bg-[#201d18] p-4 sm:p-5"
      aria-label="Minigame do decodificador Murdle"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#e1c18d]">
            <KeyRound size={15} /> Exercício de código · estilo Murdle
          </p>
          <h3 className="mt-1 font-display text-2xl text-[#ead8b8]">O anel do detetive</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
            Use uma chave de deslocamento para decifrar três mensagens originais. A resposta de cada
            bilhete é um local; não trate o exercício como uma prova documental do caso.
          </p>
        </div>
        {complete ? (
          <span className="flex items-center gap-1 font-mono text-xs text-emerald-200">
            <Check size={15} /> Conferido
          </span>
        ) : (
          <span className="font-mono text-xs text-[#a9a092]">
            Mensagem {stageIndex + 1}/{STAGES.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Mensagens decifradas">
        {STAGES.map((item, index) => (
          <span
            key={item.title}
            className={`border px-3 py-2 font-mono text-[10px] ${
              index < stageIndex || complete
                ? "border-emerald-800/70 text-emerald-200"
                : index === stageIndex
                  ? "border-[#e1c18d] text-[#ead8b8]"
                  : "border-[#4b4031] text-[#665b4b]"
            }`}
          >
            {index < stageIndex || complete ? "✓ " : ""}Bilhete {index + 1}
          </span>
        ))}
      </div>

      {!complete && (
        <>
          <article className="border border-[#4b4439] bg-[#191714] p-4" aria-label={stage.title}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
              {stage.source}
            </p>
            <h4 className="mt-2 font-display text-xl text-[#ead8b8]">{stage.title}</h4>
            <p className="mt-3 break-words font-mono text-base tracking-[0.16em] text-[#e1c18d]">
              {stage.message}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#a9a092]">
              A chave é o número de casas que cada letra recua no alfabeto. Teste de 1 a 10.
            </p>
          </article>

          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
              Chave do anel
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Chaves de deslocamento">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Chave ${value}`}
                  aria-pressed={shift === value}
                  onClick={() => setShift(value)}
                  className={`h-10 w-10 border font-mono text-sm transition ${
                    shift === value
                      ? "border-[#e1c18d] bg-[#c4a779]/15 text-[#ead8b8]"
                      : "border-[#4b4439] text-[#a9a092] hover:border-[#c4a779]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="border-l border-[#79664c] pl-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
              Leitura atual
            </p>
            <p className="mt-1 font-mono text-sm leading-relaxed text-[#d5c9b5]" aria-live="polite">
              {decoded}
            </p>
          </div>

          <label className="block text-xs text-[#d5c9b5]">
            Qual local aparece na mensagem?
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-label="Resposta do bilhete"
              className="mt-2 block w-full border border-[#4b4439] bg-[#11110f] px-3 py-3 font-mono text-sm uppercase text-[#ead8b8] outline-none focus:border-[#c4a779]"
              placeholder="Digite o local"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={submit}>
              Decifrar bilhete
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              <RotateCcw /> Reiniciar código
            </Button>
          </div>
        </>
      )}

      {feedback && (
        <p
          role="status"
          className={`text-sm leading-relaxed ${complete ? "text-emerald-200" : "text-[#d5c9b5]"}`}
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
