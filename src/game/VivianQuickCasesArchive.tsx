import { useEffect, useState } from "react";
import { Check, Clock3, FileSearch, LockKeyhole, FolderOpen } from "lucide-react";
import { VivianQuickCaseRunner } from "./VivianQuickCaseRunner";
import { VivianQuickCaseStats } from "./VivianQuickCaseStats";
import {
  readQuickChallengeProgress,
  saveQuickCaseCompletion,
  type QuickChallengeProgress,
} from "./vivianQuickCaseProgress";
import { VIVIAN_QUICK_CASES } from "./vivianQuickCases";

const RECORD_LABELS: Record<string, string> = {
  "police-report": "Arquivo do xerife",
  "henry-death": "Notícia sobre Henry Johnson",
  "scott-denial": "Versão de Scott",
  "funds-investigation": "Relatório de fundos",
  "charles-secret": "Carta da família",
  "dorothy-photo": "Entrada de Dorothy",
};

export function VivianQuickCasesArchive() {
  const [progress, setProgress] = useState<QuickChallengeProgress>(() =>
    readQuickChallengeProgress(),
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const selectedCase = VIVIAN_QUICK_CASES.find((quickCase) => quickCase.id === selectedCaseId);

  useEffect(() => {
    const refreshProgress = () => setProgress(readQuickChallengeProgress());
    refreshProgress();
    window.addEventListener("storage", refreshProgress);
    window.addEventListener("vivian-investigation-progress", refreshProgress);
    return () => {
      window.removeEventListener("storage", refreshProgress);
      window.removeEventListener("vivian-investigation-progress", refreshProgress);
    };
  }, []);

  const completeCase = (id: string) => {
    const completed = saveQuickCaseCompletion(id);
    setProgress((current) => ({ ...current, completed }));
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <header className="relative overflow-hidden border-y-2 border-primary/70 bg-[#151313] px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-4 top-4 rotate-12 border-2 border-primary/35 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-primary/40 sm:right-8 sm:top-7 sm:text-xs">
          Arquivo suplementar
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary sm:text-xs">
          Departamento de investigação · Painscreek
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold sm:text-5xl">
          Arquivo de casos curtos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Selecione um dossiê de aproximadamente cinco minutos. Casos bloqueados indicam qual
          registro precisa ser encontrado; casos concluídos podem ser revisitados.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <FolderOpen size={14} className="text-primary" /> {VIVIAN_QUICK_CASES.length} dossiês
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} className="text-primary" /> cerca de 5 min cada
          </span>
          <span className="inline-flex items-center gap-2">
            <FileSearch size={14} className="text-primary" /> exige evidência encontrada
          </span>
        </div>
      </header>

      <VivianQuickCaseStats completed={progress.completed} className="mt-5" />

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section aria-label="Índice de casos" className="space-y-3">
          <div className="flex items-end justify-between border-b border-border pb-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Índice de arquivos
              </p>
              <h2 className="mt-1 font-display text-2xl">Selecione um caso</h2>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {VIVIAN_QUICK_CASES.length.toString().padStart(2, "0")} REGISTROS
            </span>
          </div>

          {VIVIAN_QUICK_CASES.map((quickCase, index) => {
            const isSolved = progress.completed.includes(quickCase.id);
            const isUnlocked = quickCase.requiredRecords.every((id) => progress.found.includes(id));
            const canOpen = isUnlocked || isSolved;
            const missingRecords = quickCase.requiredRecords
              .filter((id) => !progress.found.includes(id))
              .map((id) => RECORD_LABELS[id] ?? id.replaceAll("-", " "));
            const isSelected = selectedCaseId === quickCase.id;

            return (
              <button
                key={quickCase.id}
                type="button"
                disabled={!canOpen}
                aria-pressed={isSelected}
                onClick={() => setSelectedCaseId(quickCase.id)}
                className={`w-full border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : canOpen
                      ? "border-border bg-card/40 hover:border-primary/60 hover:bg-card"
                      : "cursor-not-allowed border-border/60 bg-background/30 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      PAINSCREEK · ARQUIVO {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 font-display text-lg leading-snug">{quickCase.title}</h3>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${
                      isSolved
                        ? "border-primary/60 text-primary"
                        : canOpen
                          ? "border-border text-muted-foreground"
                          : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {isSolved ? (
                      <Check size={12} />
                    ) : canOpen ? (
                      <Clock3 size={12} />
                    ) : (
                      <LockKeyhole size={12} />
                    )}
                    {isSolved ? "Concluído" : canOpen ? "Disponível" : "Bloqueado"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {quickCase.summary}
                </p>
                {quickCase.sourceReference && (
                  <p className="mt-3 border-t border-border pt-2 font-mono text-[9px] leading-relaxed text-muted-foreground">
                    FONTE · {quickCase.sourceReference}
                  </p>
                )}
                {!canOpen && (
                  <p className="mt-2 text-[10px] leading-relaxed text-primary/90">
                    REGISTRO PENDENTE · {missingRecords.join(" · ")}
                  </p>
                )}
                {isSolved && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-primary">
                    Pontuação creditada · 100 pts
                  </p>
                )}
              </button>
            );
          })}
        </section>

        <section
          aria-label="Detalhes do caso selecionado"
          className="min-h-64 border border-border bg-[#141313] p-4 sm:p-5"
        >
          {selectedCase ? (
            <VivianQuickCaseRunner
              key={selectedCase.id}
              quickCase={selectedCase}
              found={progress.found}
              completed={progress.completed.includes(selectedCase.id)}
              onComplete={completeCase}
            />
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center border border-dashed border-border px-5 py-8 text-center">
              <FileSearch size={28} className="text-primary" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Aguardando seleção
              </p>
              <h2 className="mt-2 font-display text-xl">Abra um dossiê</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Escolha um caso disponível no índice. Encontre os registros indicados durante a
                investigação para liberar os arquivos bloqueados.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
