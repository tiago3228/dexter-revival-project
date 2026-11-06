import { useEffect, useRef, useState } from "react";
import { CaseHeroImage } from "@/game/CaseHeroImage";
import { recordCaseCompletion } from "@/game/achievements";
import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "@/game/caseTimer";
import { TrilogyBookPurchaseButton } from "@/game/TrilogyBookPurchaseButton";
import { playTrilogySfx, startTrilogyAmbient } from "@/game/trilogyAudio";
import {
  SPARROW_HOLLOW_CLAIMS,
  SPARROW_HOLLOW_EVIDENCE_CLASSES,
  SPARROW_HOLLOW_INTERVIEWS,
  SPARROW_HOLLOW_RECORDS,
  SPARROW_HOLLOW_STAGES,
  SPARROW_HOLLOW_TIMELINE,
  SPARROW_HOLLOW_VERDICTS,
  checkSparrowHollowStageClaims,
  getSparrowHollowActionCounts,
  getSparrowHollowScore,
  type SparrowHollowClaimAnswers,
  type SparrowHollowEvidenceClass,
  type SparrowHollowStageId,
} from "@/game/sparrowHollowCase";

type SparrowHollowCaseProps = {
  onBack: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  musicVolume: number;
  onMusicVolumeChange: (volume: number) => void;
};

type CaseTab = "timeline" | "records" | "classification" | "interviews" | "verdict";

const tabs: { id: CaseTab; label: string }[] = [
  { id: "timeline", label: "Linha do tempo" },
  { id: "records", label: "Registros" },
  { id: "classification", label: "Classificar evidências" },
  { id: "interviews", label: "Depoimentos" },
  { id: "verdict", label: "Veredito" },
];

function getStageIndex(stage: SparrowHollowStageId) {
  return SPARROW_HOLLOW_STAGES.findIndex((item) => item.id === stage);
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border/70 bg-background/60 px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl text-primary">{value}</p>
    </div>
  );
}

export function SparrowHollowCase({
  onBack,
  soundOn,
  onToggleSound,
  musicVolume,
  onMusicVolumeChange,
}: SparrowHollowCaseProps) {
  const [tab, setTab] = useState<CaseTab>("timeline");
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<SparrowHollowClaimAnswers>({});
  const [openedRecords, setOpenedRecords] = useState<string[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<string[]>([]);
  const [openedInterviews, setOpenedInterviews] = useState<string[]>([]);
  const [expandedInterviews, setExpandedInterviews] = useState<string[]>([]);
  const [completedStages, setCompletedStages] = useState<SparrowHollowStageId[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalAccuracy, setFinalAccuracy] = useState<number | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    beginCaseTimer("sparrowhollow");
    return () => pauseCaseTimer("sparrowhollow");
  }, []);

  useEffect(() => startTrilogyAmbient(8, soundOn), [soundOn]);

  const currentStage = SPARROW_HOLLOW_STAGES[stageIndex] ?? SPARROW_HOLLOW_STAGES[0];
  const currentStageId = currentStage.id;
  const currentStageCompleted = completedStages.includes(currentStageId);
  const verdictUnlocked = completedStages.length === SPARROW_HOLLOW_STAGES.length;
  const currentRecords = SPARROW_HOLLOW_RECORDS.filter((record) => record.stage === currentStageId);
  const visibleRecords = SPARROW_HOLLOW_RECORDS.filter(
    (record) => getStageIndex(record.stage) <= stageIndex,
  );
  const visibleInterviews = SPARROW_HOLLOW_INTERVIEWS.filter(
    (interview) => getStageIndex(interview.stage) <= stageIndex,
  );
  const currentClaims = SPARROW_HOLLOW_CLAIMS.filter((claim) => claim.stage === currentStageId);
  const visibleTimeline = SPARROW_HOLLOW_TIMELINE.filter(
    (event) => getStageIndex(event.stage) <= stageIndex,
  );
  const stageRecordsReviewed = currentRecords.every((record) => openedRecords.includes(record.id));
  const allCurrentClaimsAnswered = currentClaims.every((claim) => Boolean(answers[claim.id]));

  function toggleRecord(recordId: string) {
    setOpenedRecords((current) => (current.includes(recordId) ? current : [...current, recordId]));
    setExpandedRecords((current) =>
      current.includes(recordId) ? current.filter((id) => id !== recordId) : [...current, recordId],
    );
  }

  function toggleInterview(interviewId: string) {
    setOpenedInterviews((current) =>
      current.includes(interviewId) ? current : [...current, interviewId],
    );
    setExpandedInterviews((current) =>
      current.includes(interviewId)
        ? current.filter((id) => id !== interviewId)
        : [...current, interviewId],
    );
  }

  function verifyStage() {
    if (!stageRecordsReviewed) {
      setFeedback("Leia todos os registros desta etapa antes de conferir as classificações.");
      setTab("records");
      return;
    }
    if (!allCurrentClaimsAnswered) {
      setFeedback("Classifique todas as afirmações desta etapa antes de continuar.");
      return;
    }
    if (!checkSparrowHollowStageClaims(currentStageId, answers)) {
      setMistakes((current) => current + 1);
      setFeedback(
        "A etapa ainda contém uma classificação incompatível com as fontes. Releia os registros e diferencie documento, testemunho, relato e hipótese.",
      );
      return;
    }
    playTrilogySfx("puzzle-solved", soundOn);
    setCompletedStages((current) =>
      current.includes(currentStageId) ? current : [...current, currentStageId],
    );
    setFeedback("Etapa conferida. As classificações estão de acordo com as fontes disponíveis.");
  }

  function advanceStage() {
    if (!currentStageCompleted) return;
    setFeedback("");
    setShowHint(false);
    if (stageIndex < SPARROW_HOLLOW_STAGES.length - 1) {
      setStageIndex((current) => current + 1);
      setTab("timeline");
      return;
    }
    setTab("verdict");
  }

  function finishCase() {
    if (!verdictUnlocked) {
      setFeedback("Conclua as quatro etapas do arquivo antes de apresentar o veredito.");
      return;
    }
    const verdict = SPARROW_HOLLOW_VERDICTS.find((item) => item.id === selectedVerdict);
    if (!verdict) {
      setFeedback("Selecione uma conclusão antes de fechar o dossiê.");
      return;
    }
    if (!verdict.correct) {
      setMistakes((current) => current + 1);
      setFeedback(verdict.explanation);
      return;
    }
    if (recordedRef.current) return;

    const score = getSparrowHollowScore({
      recordsOpened: openedRecords.length,
      interviewsOpened: openedInterviews.length,
      claimsCorrect: SPARROW_HOLLOW_CLAIMS.filter(
        (claim) => answers[claim.id] === claim.correctClass,
      ).length,
      stagesCompleted: completedStages.length,
      verdictCorrect: true,
      mistakes,
      hints,
    });
    const actions = getSparrowHollowActionCounts({
      recordsOpened: openedRecords.length,
      interviewsOpened: openedInterviews.length,
      claimsCorrect: SPARROW_HOLLOW_CLAIMS.filter(
        (claim) => answers[claim.id] === claim.correctClass,
      ).length,
      stagesCompleted: completedStages.length,
      verdictCorrect: true,
      mistakes,
    });
    const accuracy =
      actions.totalActions > 0
        ? Math.round((actions.correctActions / actions.totalActions) * 100)
        : 0;

    recordedRef.current = true;
    const elapsedSeconds = finishCaseTimer("sparrowhollow");
    recordCaseCompletion({
      caseId: "sparrowhollow",
      score,
      hints,
      mistakes,
      correctConclusion: true,
      elapsedSeconds,
      correctActions: actions.correctActions,
      totalActions: actions.totalActions,
    });
    setFinalScore(score);
    setFinalAccuracy(accuracy);
    setFinished(true);
    setFeedback("");
  }

  if (finished) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="border border-primary/50 bg-card/70 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:p-9">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Dossiê encerrado · Capítulo 08
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl">
            Sparrow Hollow · O verão de 1986
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">
            O arquivo sustenta que Marcus desapareceu depois de descer à pedreira e voltou no começo
            do quarto dia. Na noite do equinócio, os amigos e o xerife recuperaram Marcus e as seis
            crianças. A presença recuou, mas Denny não compreende o mecanismo; o relatório oficial
            reduz o ocorrido a baixa visibilidade e desorientação coletiva. O romance não declara
            que a ameaça foi destruída.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Stat label="Pontuação" value={finalScore ?? 0} />
            <Stat label="Precisão" value={`${finalAccuracy ?? 0}%`} />
            <Stat label="Erros" value={mistakes} />
          </div>
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            A leitura preserva as lacunas do manuscrito: não determina a causa do fechamento em
            1949, o destino de Rex, a identidade dos homens da expedição ou a natureza definitiva da
            presença.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBack}
              className="min-h-11 border border-primary px-5 py-3 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/10"
            >
              Voltar à seleção de capítulos
            </button>
            <TrilogyBookPurchaseButton chapter={8} soundOn={soundOn} />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-primary/30 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Capítulo 08 · Sparrow Hollow · 1986
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">O verão de 1986</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Um arquivo sobre a antiga pedreira. Separe registros, testemunhos e interpretações;
              avance apenas quando cada afirmação estiver sustentada pela fonte correta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TrilogyBookPurchaseButton chapter={8} compact soundOn={soundOn} />
            <button
              type="button"
              onClick={onBack}
              className="min-h-11 border border-border px-4 py-3 font-mono text-xs uppercase tracking-wider text-foreground transition hover:border-primary hover:text-primary"
            >
              ← Seleção de capítulos
            </button>
          </div>
        </div>
      </header>

      <CaseHeroImage
        src="/images/sparrow-hollow-cover.webp"
        alt="Capa do romance Sparrow Hollow, com a pedreira antiga, a cerca e bicicletas entre pinheiros."
        caption="Arquivo 08 · Sparrow Hollow · ilustração original do Livro 2"
        orientation="portrait"
      />

      <section className="mt-5 grid gap-4 border border-border/70 bg-card/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            Áudio do arquivo
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Usa a trilha compartilhada do jogo; os controles afetam a instância global de áudio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            aria-pressed={soundOn}
            onClick={onToggleSound}
            className="min-h-11 border border-primary/50 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10"
          >
            Música {soundOn ? "ligada" : "desligada"}
          </button>
          <label className="flex min-h-11 items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Volume {Math.round(musicVolume * 100)}%
            <input
              aria-label="Volume da música de Sparrow Hollow"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(musicVolume * 100)}
              onChange={(event) => onMusicVolumeChange(Number(event.currentTarget.value) / 100)}
              className="w-28 accent-primary"
            />
          </label>
        </div>
      </section>

      <section
        className="mt-5 border border-primary/30 bg-background/70 p-4 sm:p-5"
        aria-label="Progresso do arquivo"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Etapa {String(stageIndex + 1).padStart(2, "0")} de{" "}
            {String(SPARROW_HOLLOW_STAGES.length).padStart(2, "0")}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {completedStages.length} etapas conferidas · {openedRecords.length}/
            {SPARROW_HOLLOW_RECORDS.length} registros lidos
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden bg-muted"
          role="progressbar"
          aria-label="Progresso do dossiê"
          aria-valuemin={0}
          aria-valuemax={SPARROW_HOLLOW_STAGES.length}
          aria-valuenow={completedStages.length}
        >
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${(completedStages.length / SPARROW_HOLLOW_STAGES.length) * 100}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Stat
            label="Registros lidos"
            value={`${openedRecords.length}/${SPARROW_HOLLOW_RECORDS.length}`}
          />
          <Stat
            label="Depoimentos"
            value={`${openedInterviews.length}/${SPARROW_HOLLOW_INTERVIEWS.length}`}
          />
          <Stat
            label="Classificações"
            value={`${SPARROW_HOLLOW_CLAIMS.filter((claim) => answers[claim.id] === claim.correctClass).length}/${SPARROW_HOLLOW_CLAIMS.length}`}
          />
          <Stat label="Erros" value={mistakes} />
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <div className="border border-border/70 bg-card/30 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Etapa {currentStage.number} · {currentStage.period}
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">{currentStage.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {currentStage.brief}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowHint((visible) => !visible);
                if (!showHint) setHints((count) => count + 1);
              }}
              aria-expanded={showHint}
              className="min-h-11 border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              {showHint ? "Fechar orientação" : "Pedir orientação"}
            </button>
          </div>
          {showHint && (
            <p className="mt-4 border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-6 text-foreground">
              {currentStage.hint}
            </p>
          )}
          {feedback && (
            <p
              className="mt-4 border border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-6 text-foreground"
              role="status"
            >
              {feedback}
            </p>
          )}

          <nav
            className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4"
            aria-label="Seções do dossiê"
          >
            {tabs.map((item) => {
              const locked = item.id === "verdict" && !verdictUnlocked;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={tab === item.id}
                  disabled={locked}
                  onClick={() => {
                    setTab(item.id);
                    setFeedback("");
                  }}
                  className={`min-h-11 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition sm:px-4 ${
                    tab === item.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {locked ? "Veredito · bloqueado" : item.label}
                </button>
              );
            })}
          </nav>

          {tab === "timeline" && (
            <section className="mt-5" aria-label="Linha do tempo liberada">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Reconstrução progressiva
                  </p>
                  <h3 className="mt-1 font-display text-xl">Eventos acessíveis</h3>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Período atual · {currentStage.period}
                </p>
              </div>
              <ol className="space-y-3 border-l border-primary/40 pl-4">
                {visibleTimeline.map((event) => (
                  <li
                    key={event.id}
                    className="relative border border-border/70 bg-background/55 p-4"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.32rem] top-5 h-2 w-2 rounded-full bg-primary"
                    />
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      {event.when}
                    </p>
                    <h4 className="mt-1 font-display text-lg">{event.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.text}</p>
                    <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Fonte · {event.source}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-5 border border-border/70 bg-background/50 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Próximo passo
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Abra os registros desta etapa, classifique as afirmações e só então avance. As
                  etapas futuras permanecem ocultas para não antecipar o relato.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("records")}
                  className="mt-4 min-h-11 border border-primary/50 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10"
                >
                  Abrir registros desta etapa
                </button>
              </div>
            </section>
          )}

          {tab === "records" && (
            <section className="mt-5" aria-label="Registros do caso">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Arquivo de fontes
                  </p>
                  <h3 className="mt-1 font-display text-xl">Registros liberados</h3>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                  Etapa atual ·{" "}
                  {
                    openedRecords.filter((id) => currentRecords.some((record) => record.id === id))
                      .length
                  }
                  /{currentRecords.length}
                </p>
              </div>
              <div className="space-y-3">
                {visibleRecords.map((record) => {
                  const isExpanded = expandedRecords.includes(record.id);
                  const isReviewed = openedRecords.includes(record.id);
                  return (
                    <article key={record.id} className="border border-border/70 bg-background/50">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleRecord(record.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-primary/5"
                      >
                        <span>
                          <span className="block font-display text-lg">{record.title}</span>
                          <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            {record.source}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {isExpanded ? "Fechar" : isReviewed ? "Reler" : "Abrir registro"}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border/70 p-4 sm:p-5">
                          <p className="text-sm leading-7 text-foreground">{record.text}</p>
                          {record.imageSrc && (
                            <figure className="mt-4 overflow-hidden border border-border/70 bg-black/60">
                              <img
                                src={record.imageSrc}
                                alt={record.imageAlt ?? "Ilustração do romance Sparrow Hollow"}
                                loading="lazy"
                                decoding="async"
                                className="mx-auto max-h-[28rem] w-full object-contain"
                              />
                              {record.imageCaption && (
                                <figcaption className="border-t border-border/70 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                                  {record.imageCaption}
                                </figcaption>
                              )}
                            </figure>
                          )}
                          <p className="mt-4 border-l-2 border-primary/50 pl-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            Procedência · {record.source}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "classification" && (
            <section className="mt-5" aria-label="Classificação de evidências">
              <div className="mb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Quadro de procedência
                </p>
                <h3 className="mt-1 font-display text-xl">O que cada fonte permite afirmar?</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Classifique o tipo de sustentação, não se a história parece plausível. O caso
                  exige que documento, testemunho, relato de terceiros e hipótese permaneçam
                  separados.
                </p>
              </div>
              <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {SPARROW_HOLLOW_EVIDENCE_CLASSES.map((item) => (
                  <div key={item.id} className="border border-border/70 bg-background/50 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {currentClaims.map((claim, index) => (
                  <fieldset key={claim.id} className="border border-border/70 bg-background/50 p-4">
                    <legend className="max-w-full px-1 font-display text-base leading-6 sm:text-lg">
                      {String(index + 1).padStart(2, "0")} · {claim.statement}
                    </legend>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Fonte-base · {claim.source}
                    </p>
                    <label className="mt-4 block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Tipo de evidência
                      <select
                        aria-label={`Classificação: ${claim.statement}`}
                        value={answers[claim.id] ?? ""}
                        disabled={currentStageCompleted}
                        onChange={(event) => {
                          const selectedClass = event.currentTarget
                            .value as SparrowHollowEvidenceClass;
                          setAnswers((current) => ({
                            ...current,
                            [claim.id]: selectedClass,
                          }));
                          setFeedback("");
                        }}
                        className="mt-2 min-h-11 w-full border border-border bg-background px-3 font-sans text-sm text-foreground outline-none focus:border-primary sm:max-w-md"
                      >
                        <option value="" disabled>
                          Selecione uma classificação
                        </option>
                        {SPARROW_HOLLOW_EVIDENCE_CLASSES.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {currentStageCompleted && (
                      <p className="mt-3 border-l-2 border-primary/50 pl-3 text-xs leading-5 text-muted-foreground">
                        {claim.explanation}
                      </p>
                    )}
                  </fieldset>
                ))}
              </div>
              {!currentStageCompleted ? (
                <button
                  type="button"
                  onClick={verifyStage}
                  className="mt-5 min-h-11 border border-primary bg-primary/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/20"
                >
                  Conferir esta etapa
                </button>
              ) : (
                <div className="mt-5 border border-primary/40 bg-primary/5 p-4 sm:p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    Etapa conferida · {currentStage.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    As classificações estão alinhadas às fontes. A próxima parte do arquivo será
                    liberada sem misturar os acontecimentos.
                  </p>
                  <button
                    type="button"
                    onClick={advanceStage}
                    className="mt-4 min-h-11 border border-primary px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10"
                  >
                    {stageIndex === SPARROW_HOLLOW_STAGES.length - 1
                      ? "Abrir o veredito final"
                      : "Avançar para a próxima etapa"}
                  </button>
                </div>
              )}
            </section>
          )}

          {tab === "interviews" && (
            <section className="mt-5" aria-label="Depoimentos">
              <div className="mb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Conversas do arquivo
                </p>
                <h3 className="mt-1 font-display text-xl">Depoimentos disponíveis</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  As falas são apresentadas como sínteses do manuscrito, não como novas citações
                  literais.
                </p>
              </div>
              <div className="space-y-3">
                {visibleInterviews.map((interview) => {
                  const isExpanded = expandedInterviews.includes(interview.id);
                  const isReviewed = openedInterviews.includes(interview.id);
                  return (
                    <article
                      key={interview.id}
                      className="border border-border/70 bg-background/50"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleInterview(interview.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-primary/5"
                      >
                        <span>
                          <span className="block font-display text-lg">{interview.name}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {interview.question}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {isExpanded ? "Fechar" : isReviewed ? "Reler" : "Consultar"}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border/70 p-4 sm:p-5">
                          <p className="text-sm leading-7 text-foreground">{interview.answer}</p>
                          <p className="mt-3 border-l-2 border-primary/50 pl-3 text-xs leading-5 text-muted-foreground">
                            {interview.clue}
                          </p>
                          <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            Fonte · {interview.source}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "verdict" && verdictUnlocked && (
            <section className="mt-5" aria-label="Veredito final">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Conclusão · somente após quatro etapas
              </p>
              <h3 className="mt-1 font-display text-xl">
                Qual síntese respeita o que o arquivo prova?
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                O veredito distingue os acontecimentos narrados, a versão oficial e as lacunas que o
                próprio romance mantém abertas.
              </p>
              <div className="mt-5 space-y-3">
                {SPARROW_HOLLOW_VERDICTS.map((verdict) => (
                  <label
                    key={verdict.id}
                    className={`flex cursor-pointer gap-3 border p-4 transition ${
                      selectedVerdict === verdict.id
                        ? "border-primary bg-primary/10"
                        : "border-border/70 bg-background/50 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sparrow-hollow-verdict"
                      value={verdict.id}
                      checked={selectedVerdict === verdict.id}
                      onChange={() => {
                        setSelectedVerdict(verdict.id);
                        setFeedback("");
                      }}
                      className="mt-1 accent-primary"
                    />
                    <span className="text-sm leading-6">{verdict.title}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={finishCase}
                className="mt-5 min-h-11 border border-primary bg-primary/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/20"
              >
                Fechar dossiê e conferir conclusão
              </button>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="border border-border/70 bg-card/30 p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Quadro de investigação
            </p>
            <h2 className="mt-2 font-display text-xl">Estado do arquivo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Registros da etapa</dt>
                <dd className="font-mono text-primary">
                  {
                    openedRecords.filter((id) => currentRecords.some((record) => record.id === id))
                      .length
                  }
                  /{currentRecords.length}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Depoimentos consultados</dt>
                <dd className="font-mono text-primary">
                  {openedInterviews.length}/{SPARROW_HOLLOW_INTERVIEWS.length}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Afirmações corretas</dt>
                <dd className="font-mono text-primary">
                  {
                    SPARROW_HOLLOW_CLAIMS.filter(
                      (claim) => answers[claim.id] === claim.correctClass,
                    ).length
                  }
                  /{SPARROW_HOLLOW_CLAIMS.length}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Etapas concluídas</dt>
                <dd className="font-mono text-primary">
                  {completedStages.length}/{SPARROW_HOLLOW_STAGES.length}
                </dd>
              </div>
            </dl>
          </section>
          <section className="border border-border/70 bg-card/30 p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Nota de método
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O arquivo não transforma a teoria da “semente” em fato, não atribui a morte do homem
              do riacho à pedreira e não confunde a história da irmã de Boyle com o retorno de
              Marcus.
            </p>
          </section>
          <section className="border border-border/70 bg-card/30 p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Pontuação
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Registros, depoimentos, classificações, etapas e veredito compõem a nota. Erros e
              orientações reduzem pontos; uma execução sem erros pode alcançar 100% de precisão.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
