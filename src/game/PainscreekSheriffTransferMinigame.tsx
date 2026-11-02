import { useState } from "react";
import { Check, FileSearch, RotateCcw } from "lucide-react";

type Props = { onSolved?: () => void };
type Field = "reportBy" | "effectiveDate" | "destination" | "reason";
type Selection = Record<Field, string>;

const INITIAL: Selection = { reportBy: "", effectiveDate: "", destination: "", reason: "" };
const FIELDS: readonly { id: Field; label: string; prompt: string }[] = [
  { id: "reportBy", label: "01 · Apresentação", prompt: "Até quando deveria apresentar-se?" },
  {
    id: "effectiveDate",
    label: "02 · Vigência",
    prompt: "A partir de quando valeria a redesignação?",
  },
  { id: "destination", label: "03 · Destino", prompt: "Para onde foi redesignado?" },
  {
    id: "reason",
    label: "04 · Limite da conclusão",
    prompt: "O que a carta permite concluir sobre o motivo?",
  },
];
const OPTIONS: Record<Field, readonly { value: string; label: string }[]> = {
  reportBy: [
    { value: "1998-05-12", label: "Antes de 12/05/1998" },
    { value: "1998-05-14", label: "Antes de 14/05/1998" },
    { value: "1998-05-12-inclusive", label: "Até 12/05/1998, inclusive" },
  ],
  effectiveDate: [
    { value: "1998-05-14", label: "A partir de 14/05/1998" },
    { value: "1998-05-12", label: "A partir de 12/05/1998" },
    { value: "1998-05-14-inclusive", label: "Até 14/05/1998" },
  ],
  destination: [
    { value: "grand-county", label: "Grand County" },
    { value: "painscreek", label: "Painscreek" },
    { value: "unknown", label: "Destino não indicado" },
  ],
  reason: [
    {
      value: "population-context",
      label:
        "A carta cita o declínio populacional do distrito como contexto para redistribuir mão de obra; não comprova punição nem ligação com Vivian.",
    },
    { value: "punishment", label: "A transferência foi uma punição ligada ao caso de Vivian." },
    { value: "unexplained", label: "A carta não apresenta contexto algum para a transferência." },
  ],
};
const ANSWER: Selection = {
  reportBy: "1998-05-12",
  effectiveDate: "1998-05-14",
  destination: "grand-county",
  reason: "population-context",
};

export function PainscreekSheriffTransferMinigame({ onSolved }: Props) {
  const [selection, setSelection] = useState<Selection>(INITIAL);
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);

  const update = (field: Field, value: string) => {
    if (solved) return;
    setSelection((current) => ({ ...current, [field]: value }));
    setFeedback("");
  };
  const check = () => {
    if (Object.values(selection).some((value) => !value)) {
      setFeedback("Preencha os quatro campos antes de validar a ficha.");
      return;
    }
    if (selection.reason === "punishment") {
      setFeedback(
        "Inferência não sustentada: a carta não afirma punição nem relaciona a transferência a Vivian. Revise a conclusão.",
      );
      return;
    }
    if (FIELDS.some(({ id }) => selection[id] !== ANSWER[id])) {
      setFeedback(
        "A ficha não confere com a fonte. Releia cada dado e preserve o limite do que a carta documenta.",
      );
      return;
    }
    setSolved(true);
    setFeedback(
      "Ficha conferida. A carta registra o contexto populacional e a realocação; não estabelece punição nem relação com Vivian.",
    );
    onSolved?.();
  };
  const reset = () => {
    setSelection(INITIAL);
    setFeedback("");
    setSolved(false);
  };

  return (
    <section
      className="border border-[#52626a] bg-[#151a1c] p-4"
      aria-label="Ficha de despacho do xerife"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9fd1d5]">
            Arquivo administrativo · Painscreek
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-display text-2xl text-[#d8eeee]">
            <FileSearch size={19} aria-hidden="true" /> Despacho do xerife
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#abc0c2]">
            Organize os dados cronológicos e separe o que a carta diz do que ela não permite
            concluir.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 border border-[#668087] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#c5e4e4] hover:bg-[#9fd1d5]/10"
        >
          <RotateCcw size={14} aria-hidden="true" /> Reiniciar
        </button>
      </header>
      <div className="mt-4 border-l-2 border-[#9fd1d5] bg-[#1c2426] p-3 text-sm leading-relaxed text-[#c5d6d7]">
        <p>
          <strong>Referência:</strong> P-017 · p. 89 · carta do Departamento do Xerife.
        </p>
        <p className="mt-1">
          <strong>Nota editorial:</strong> a página apresenta sobreposição visual de texto em inglês
          e português; esta ficha considera somente as linhas legíveis na transcrição. Atividade
          editorial, não canônica.
        </p>
      </div>
      <fieldset className="mt-4 space-y-3" disabled={solved}>
        <legend className="sr-only">Dados para montar a ficha de despacho</legend>
        {FIELDS.map(({ id, label, prompt }) => (
          <label key={id} className="block border border-[#39494d] bg-[#1c2426] p-3">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#9fd1d5]">
              {label}
            </span>
            <span className="mt-1 block text-sm text-[#d8eeee]">{prompt}</span>
            <select
              aria-label={prompt}
              value={selection[id]}
              onChange={(event) => update(id, event.target.value)}
              className="mt-2 min-h-11 w-full border border-[#526a70] bg-[#111719] px-3 py-2 text-sm text-[#d8eeee]"
            >
              <option value="">Selecione uma resposta</option>
              {OPTIONS[id].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={check}
        disabled={solved}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border-2 border-[#9fd1d5] bg-[#9fd1d5]/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#d8eeee] hover:bg-[#9fd1d5]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {solved ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <FileSearch size={16} aria-hidden="true" />
        )}
        {solved ? "Ficha validada" : "Validar ficha"}
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
