import { useMemo, useState } from "react";
import { Check, KeyRound, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Stage = {
  title: string;
  source: string;
  message: string;
  shift: number;
  answer: string;
  answerLabel: string;
};

type Props = {
  completedLevel?: number;
  solved?: boolean;
  onSolved: (level: number) => void;
};

const BASIC_STAGES: readonly Stage[] = [
  {
    title: "O destino da fita",
    source: "Bilhete sem assinatura · margem do arquivo",
    message: "D ILWD  SDVVD  SHOR  ODJR",
    shift: 3,
    answer: "LAGO",
    answerLabel: "Qual local aparece na mensagem?",
  },
  {
    title: "A testemunha da carta",
    source: "Recorte dobrado · bolso do dossiê",
    message: "F HFWYF  KNHF  ST  FWVZNAT",
    shift: 5,
    answer: "ARQUIVO",
    answerLabel: "Qual local aparece na mensagem?",
  },
  {
    title: "A última indicação",
    source: "Etiqueta de evidência · caixa 06",
    message: "C HQVQ  UGIWG  RCTC  Q  JQURKVCN",
    shift: 2,
    answer: "HOSPITAL",
    answerLabel: "Qual local aparece na mensagem?",
  },
];

const ADVANCED_STAGES: readonly Stage[] = [
  {
    title: "A fita escondida",
    source: "Folha de transferência · nível avançado",
    message: "H MPAH MVP LZJVUKPKH UV SHNV",
    shift: 7,
    answer: "A FITA FOI ESCONDIDA NO LAGO",
    answerLabel: "Transcreva a frase completa decifrada",
  },
  {
    title: "A carta devolvida",
    source: "Envelope sem remetente · nível avançado",
    message: "L NLCEL OPGP GZWELC LZ LCBFTGZ",
    shift: 11,
    answer: "A CARTA DEVE VOLTAR AO ARQUIVO",
    answerLabel: "Transcreva a frase completa decifrada",
  },
  {
    title: "A fotografia encaminhada",
    source: "Etiqueta de caixa · nível avançado",
    message: "E JSXSKVEJME WIKYI TEVE S LSWTMXEP",
    shift: 4,
    answer: "A FOTOGRAFIA SEGUE PARA O HOSPITAL",
    answerLabel: "Transcreva a frase completa decifrada",
  },
];

const LEVELS = [
  { label: "Nível 1 · Anotações", description: "3 locais · chaves curtas", stages: BASIC_STAGES },
  {
    label: "Nível 2 · Cifra avançada",
    description: "3 frases completas · chaves dinâmicas",
    stages: ADVANCED_STAGES,
  },
] as const;

function decode(message: string, shift: number) {
  return message.replace(/[A-Z]/g, (letter) => {
    const decoded = (letter.charCodeAt(0) - 65 - shift + 26) % 26;
    return String.fromCharCode(decoded + 65);
  });
}

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function VivianMurdleCipherDecoder({ completedLevel, solved = false, onSolved }: Props) {
  const initialCompletedLevel = completedLevel ?? (solved ? 1 : 0);
  const [activeLevel, setActiveLevel] = useState(
    Math.min(initialCompletedLevel, LEVELS.length - 1),
  );
  const [stageIndex, setStageIndex] = useState(0);
  const [shift, setShift] = useState(1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [completedThisLevel, setCompletedThisLevel] = useState<number | null>(null);
  const stages = LEVELS[Math.min(activeLevel, LEVELS.length - 1)]!.stages;
  const stage = stages[stageIndex]!;
  const levelComplete = initialCompletedLevel > activeLevel || completedThisLevel === activeLevel;
  const decoded = useMemo(() => decode(stage.message, shift), [stage.message, shift]);

  const selectLevel = (level: number) => {
    if (level > initialCompletedLevel) return;
    setActiveLevel(level);
    setStageIndex(0);
    setShift(1);
    setAnswer("");
    setFeedback("");
    setCompletedThisLevel(null);
  };

  const submit = () => {
    if (shift !== stage.shift || normalizeAnswer(answer) !== stage.answer) {
      setFeedback(
        "A chave ou a resposta ainda não confere. Ajuste o deslocamento e leia a mensagem completa antes de tentar novamente.",
      );
      return;
    }
    if (stageIndex < stages.length - 1) {
      setFeedback(`Bilhete ${stageIndex + 1} decifrado. A próxima anotação foi liberada.`);
      setStageIndex((current) => current + 1);
      setShift(1);
      setAnswer("");
      return;
    }
    setCompletedThisLevel(activeLevel);
    setFeedback(
      activeLevel === 0
        ? "Nível básico concluído. A cifra avançada foi liberada."
        : "Código completo. As seis mensagens foram decifradas como exercício editorial.",
    );
    onSolved(activeLevel + 1);
  };

  const reset = () => {
    setStageIndex(0);
    setShift(1);
    setAnswer("");
    setFeedback("");
    setCompletedThisLevel(null);
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
            Use uma chave de deslocamento para decifrar mensagens originais. O nível avançado troca
            a chave em cada bilhete e exige a transcrição de frases completas.
          </p>
        </div>
        {levelComplete ? (
          <span className="flex items-center gap-1 font-mono text-xs text-emerald-200">
            <Check size={15} /> Conferido
          </span>
        ) : (
          <span className="font-mono text-xs text-[#a9a092]">
            Bilhete {stageIndex + 1}/{stages.length}
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2" aria-label="Níveis do anel do detetive">
        {LEVELS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            disabled={index > initialCompletedLevel}
            onClick={() => selectLevel(index)}
            className={`min-h-14 border p-3 text-left font-mono text-[10px] transition ${
              index === activeLevel
                ? "border-[#e1c18d] bg-[#c4a779]/15 text-[#ead8b8]"
                : index < initialCompletedLevel
                  ? "border-emerald-800/70 text-emerald-200"
                  : "cursor-not-allowed border-[#4b4031] text-[#665b4b]"
            }`}
          >
            <strong className="block">
              {index < initialCompletedLevel ? "✓ " : ""}
              {item.label}
            </strong>
            <span className="mt-1 block opacity-75">{item.description}</span>
          </button>
        ))}
      </div>

      {!levelComplete && (
        <>
          <div className="flex flex-wrap gap-2" aria-label="Bilhetes do nível atual">
            {stages.map((item, index) => (
              <span
                key={item.title}
                className={`border px-3 py-2 font-mono text-[10px] ${
                  index < stageIndex
                    ? "border-emerald-800/70 text-emerald-200"
                    : index === stageIndex
                      ? "border-[#e1c18d] text-[#ead8b8]"
                      : "border-[#4b4031] text-[#665b4b]"
                }`}
              >
                {index < stageIndex ? "✓ " : ""}Bilhete {index + 1}
              </span>
            ))}
          </div>

          <article className="border border-[#4b4439] bg-[#191714] p-4" aria-label={stage.title}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
              {stage.source}
            </p>
            <h4 className="mt-2 font-display text-xl text-[#ead8b8]">{stage.title}</h4>
            <p className="mt-3 break-words font-mono text-base tracking-[0.16em] text-[#e1c18d]">
              {stage.message}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#a9a092]">
              {activeLevel === 0
                ? "A chave recua cada letra no alfabeto. Teste de 1 a 10."
                : "A chave muda neste bilhete. Use o seletor de 1 a 25 e transcreva a frase completa."}
            </p>
          </article>

          <div className="space-y-2">
            <label
              htmlFor="cipher-shift"
              className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]"
            >
              {activeLevel === 0 ? "Chave do anel" : "Chave dinâmica do anel"}
            </label>
            <select
              id="cipher-shift"
              aria-label={activeLevel === 0 ? "Chave do anel" : "Chave dinâmica do anel"}
              value={shift}
              onChange={(event) => setShift(Number(event.target.value))}
              className="block border border-[#4b4439] bg-[#11110f] px-3 py-3 font-mono text-sm text-[#ead8b8] outline-none focus:border-[#c4a779]"
            >
              {Array.from({ length: activeLevel === 0 ? 10 : 25 }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    Deslocamento {value}
                  </option>
                ),
              )}
            </select>
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
            {stage.answerLabel}
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-label={activeLevel === 0 ? "Resposta do bilhete" : "Frase completa do bilhete"}
              className="mt-2 block w-full border border-[#4b4439] bg-[#11110f] px-3 py-3 font-mono text-sm uppercase text-[#ead8b8] outline-none focus:border-[#c4a779]"
              placeholder={activeLevel === 0 ? "Digite o local" : "Digite a frase completa"}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={submit}>
              Decifrar bilhete
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              <RotateCcw /> Reiniciar nível
            </Button>
          </div>
        </>
      )}

      {levelComplete && activeLevel === 0 && (
        <Button type="button" onClick={() => selectLevel(1)}>
          Avançar para a cifra avançada
        </Button>
      )}

      {feedback && (
        <p
          role="status"
          className={`text-sm leading-relaxed ${levelComplete ? "text-emerald-200" : "text-[#d5c9b5]"}`}
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
