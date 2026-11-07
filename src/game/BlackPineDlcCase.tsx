import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BLACK_PINE_DLC_LOCATIONS,
  BLACK_PINE_DLC_OBJECTS,
  BLACK_PINE_DLC_RECORDS,
  BLACK_PINE_DLC_SOLUTION,
  BLACK_PINE_DLC_SUSPECTS,
  checkBlackPineDlcSolution,
  type BlackPineDlcSelection,
} from "./blackPineDlcCase";

type Props = { onBack: () => void };
type Tab = "records" | "grid" | "verdict";
type DlcSave = { completed: boolean; attempts: number; bestScore: number; bestTime: number };
const DLC_SAVE_KEY = "dexter-blackpine-dlc-moeda-217-v1";

function loadDlcSave(): DlcSave {
  if (typeof window === "undefined")
    return { completed: false, attempts: 0, bestScore: 0, bestTime: 0 };
  try {
    const raw = JSON.parse(
      window.localStorage.getItem(DLC_SAVE_KEY) ?? "null",
    ) as Partial<DlcSave> | null;
    return {
      completed: raw?.completed === true,
      attempts: typeof raw?.attempts === "number" ? Math.max(0, Math.floor(raw.attempts)) : 0,
      bestScore:
        typeof raw?.bestScore === "number"
          ? Math.max(0, Math.min(100, Math.floor(raw.bestScore)))
          : 0,
      bestTime: typeof raw?.bestTime === "number" ? Math.max(0, Math.floor(raw.bestTime)) : 0,
    };
  } catch {
    return { completed: false, attempts: 0, bestScore: 0, bestTime: 0 };
  }
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function BlackPineDlcCase({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>("records");
  const [openedRecords, setOpenedRecords] = useState<string[]>([]);
  const [selection, setSelection] = useState<BlackPineDlcSelection>({
    suspect: "",
    object: "",
    location: "",
  });
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  const allRecordsOpened = openedRecords.length === BLACK_PINE_DLC_RECORDS.length;
  const baseScore = useMemo(
    () => Math.max(0, 70 + (allRecordsOpened ? 15 : 0) - mistakes * 8 - hints * 4),
    [allRecordsOpened, hints, mistakes],
  );

  const openRecord = (id: string) => {
    setOpenedRecords((current) => (current.includes(id) ? current : [...current, id]));
    setFeedback("");
  };

  const revealHint = () => {
    setHints((value) => value + 1);
    setFeedback(
      "A marca da oficina aparece na moeda e no livro de chaves. Compare o horário da retirada com a fotografia do cais.",
    );
  };

  const submitVerdict = () => {
    if (!allRecordsOpened) {
      setFeedback(
        "Você ainda não examinou todas as fontes. Um veredicto sem o registro de rádio deixaria uma contradição aberta.",
      );
      setMistakes((value) => value + 1);
      setTab("records");
      return;
    }
    if (!checkBlackPineDlcSolution(selection)) {
      setFeedback(
        "A combinação não fecha a rota da moeda 217. Releia horários, assinatura e destino do sinal.",
      );
      setMistakes((value) => value + 1);
      return;
    }
    const elapsed = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
    const score = Math.min(
      100,
      Math.max(0, baseScore + (elapsed <= 300 ? 10 : elapsed <= 600 ? 5 : 0)),
    );
    const previous = loadDlcSave();
    const next = {
      completed: true,
      attempts: previous.attempts + 1,
      bestScore: Math.max(previous.bestScore, score),
      bestTime: previous.bestTime > 0 ? Math.min(previous.bestTime, elapsed) : elapsed,
    };
    try {
      window.localStorage.setItem(DLC_SAVE_KEY, JSON.stringify(next));
    } catch {
      // O DLC continua jogável mesmo quando o storage está bloqueado.
    }
    setFinalScore(score);
    setFinalTime(elapsed);
    setFinished(true);
  };

  if (finished) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
        <div className="mx-auto max-w-4xl border border-slate-400/70 bg-card/60 p-6 shadow-2xl sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-300">
            DLC encerrado · Black Pine
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl">A Moeda 217</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Mara Voss usou a moeda como marcador para abrir o armário e conduzir o sinal até o cais
            norte. O registro prova a rota da noite, mas não revela quem esperava do outro lado da
            linha.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Pontuação" value={`${finalScore}/100`} />
            <Stat label="Tempo" value={formatTime(finalTime)} />
            <Stat label="Erros" value={String(mistakes)} />
          </div>
          <p className="mt-6 border-l-2 border-slate-300 px-4 text-sm leading-6 text-muted-foreground">
            A expansão encerra uma pista, não a transforma em prova sobre o destino de Whitmore. O
            arquivo continua deliberadamente incompleto.
          </p>
          <Button type="button" className="mt-8" onClick={onBack}>
            Voltar ao arquivo
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl border border-slate-500/70 bg-card/50 p-5 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-300">
              Expansão · Capítulo 10
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">A Moeda 217</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Uma pista esquecida na estação de Black Pine reaparece anos depois. Separe o que o
              objeto prova do que ele apenas sugere.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onBack}>
            Sair do DLC
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Seções do DLC">
          {(["records", "grid", "verdict"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
              className={`min-h-11 border px-4 py-2 font-mono text-xs uppercase tracking-wider ${tab === item ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}
            >
              {item === "records" ? "Fontes" : item === "grid" ? "Grade" : "Veredicto"}
            </button>
          ))}
        </div>

        {tab === "records" && (
          <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="Fontes do DLC">
            {BLACK_PINE_DLC_RECORDS.map((record) => {
              const opened = openedRecords.includes(record.id);
              return (
                <article
                  key={record.id}
                  className={`border p-5 ${opened ? "border-primary/60 bg-primary/5" : "border-border bg-background/40"}`}
                >
                  <h2 className="font-display text-2xl">{record.title}</h2>
                  {opened ? (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{record.text}</p>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Fonte ainda lacrada no arquivo.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => openRecord(record.id)}
                    className="mt-5 font-mono text-xs uppercase tracking-wider text-primary hover:underline"
                  >
                    {opened ? "Fonte examinada" : "Examinar fonte"}
                  </button>
                </article>
              );
            })}
          </section>
        )}

        {tab === "grid" && (
          <section
            className="mt-6 border border-border bg-background/40 p-5"
            aria-label="Grade de dedução do DLC"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Três relações a confirmar
            </p>
            <h2 className="mt-2 font-display text-2xl">Quem usou o quê e onde?</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Choice
                label="Pessoa"
                value={selection.suspect}
                options={BLACK_PINE_DLC_SUSPECTS}
                onChange={(value) => setSelection((current) => ({ ...current, suspect: value }))}
              />
              <Choice
                label="Objeto"
                value={selection.object}
                options={BLACK_PINE_DLC_OBJECTS}
                onChange={(value) => setSelection((current) => ({ ...current, object: value }))}
              />
              <Choice
                label="Local"
                value={selection.location}
                options={BLACK_PINE_DLC_LOCATIONS}
                onChange={(value) => setSelection((current) => ({ ...current, location: value }))}
              />
            </div>
            <button
              type="button"
              onClick={revealHint}
              className="mt-6 font-mono text-xs text-primary hover:underline"
            >
              Solicitar dica (+1)
            </button>
          </section>
        )}

        {tab === "verdict" && (
          <section
            className="mt-6 border border-primary/40 bg-primary/5 p-5"
            aria-label="Veredicto do DLC"
          >
            <h2 className="font-display text-2xl">Fechar o dossiê?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A solução exige todas as fontes examinadas e uma combinação completa na grade.
            </p>
            {feedback && (
              <p className="mt-4 border-l-2 border-amber-300 px-3 py-2 text-sm text-amber-100">
                {feedback}
              </p>
            )}
            <Button type="button" className="mt-6" onClick={submitVerdict}>
              Conferir solução
            </Button>
          </section>
        )}
      </div>
    </main>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-11 w-full border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground"
      >
        <option value="">Selecione…</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}
