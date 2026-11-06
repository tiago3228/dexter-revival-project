import { useEffect, useRef, useState } from "react";
import { CaseHeroImage } from "@/game/CaseHeroImage";
import { recordCaseCompletion } from "@/game/achievements";
import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "@/game/caseTimer";
import { TrilogyBookPurchaseButton } from "@/game/TrilogyBookPurchaseButton";
import {
  THRESHOLD_CLAIMS,
  THRESHOLD_EVIDENCE_CLASSES,
  THRESHOLD_INTERVIEWS,
  THRESHOLD_RECORDS,
  THRESHOLD_STAGES,
  THRESHOLD_TIMELINE,
  THRESHOLD_VERDICTS,
  checkThresholdStageClaims,
  getThresholdActionCounts,
  getThresholdScore,
  type ThresholdClaimAnswers,
  type ThresholdEvidenceClass,
  type ThresholdStageId,
} from "@/game/thresholdCase";

type ThresholdCaseProps = {
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

function getStageIndex(stage: ThresholdStageId) {
  return THRESHOLD_STAGES.findIndex((item) => item.id === stage);
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

export function ThresholdCase({
  onBack,
  soundOn,
  onToggleSound,
  musicVolume,
  onMusicVolumeChange,
}: ThresholdCaseProps) {
  const [tab, setTab] = useState<CaseTab>("timeline");
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<ThresholdClaimAnswers>({});
  const [openedRecords, setOpenedRecords] = useState<string[]>([]);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [openedInterviews, setOpenedInterviews] = useState<string[]>([]);
  const [expandedInterview, setExpandedInterview] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<ThresholdStageId[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [hintedStages, setHintedStages] = useState<ThresholdStageId[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalAccuracy, setFinalAccuracy] = useState<number | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    beginCaseTimer("threshold");
    return () => pauseCaseTimer("threshold");
  }, []);

  const currentStage = THRESHOLD_STAGES[stageIndex] ?? THRESHOLD_STAGES[0];
  const currentStageId = currentStage.id;
  const currentStageCompleted = completedStages.includes(currentStageId);
  const verdictUnlocked = completedStages.length === THRESHOLD_STAGES.length;
  const visibleRecords = THRESHOLD_RECORDS.filter(
    (record) => getStageIndex(record.stage) <= stageIndex,
  );
  const currentRecords = THRESHOLD_RECORDS.filter((record) => record.stage === currentStageId);
  const visibleInterviews = THRESHOLD_INTERVIEWS.filter(
    (interview) => getStageIndex(interview.stage) <= stageIndex,
  );
  const currentClaims = THRESHOLD_CLAIMS.filter((claim) => claim.stage === currentStageId);
  const visibleTimeline = THRESHOLD_TIMELINE.filter(
    (event) => getStageIndex(event.stage) <= stageIndex,
  );
  const stageRecordsReviewed = currentRecords.every((record) => openedRecords.includes(record.id));
  const allCurrentClaimsAnswered = currentClaims.every((claim) => Boolean(answers[claim.id]));
  const correctClaims = THRESHOLD_CLAIMS.filter(
    (claim) => answers[claim.id] === claim.correctClass,
  ).length;

  function toggleRecord(recordId: string) {
    setOpenedRecords((current) => (current.includes(recordId) ? current : [...current, recordId]));
    setExpandedRecord((current) => (current === recordId ? null : recordId));
  }

  function toggleInterview(interviewId: string) {
    setOpenedInterviews((current) =>
      current.includes(interviewId) ? current : [...current, interviewId],
    );
    setExpandedInterview((current) => (current === interviewId ? null : interviewId));
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
    if (!checkThresholdStageClaims(currentStageId, answers)) {
      setMistakes((current) => current + 1);
      setFeedback(
        "Há uma classificação incompatível com as fontes. Releia os registros e separe observação, relato e hipótese.",
      );
      return;
    }
    setCompletedStages((current) =>
      current.includes(currentStageId) ? current : [...current, currentStageId],
    );
    setFeedback("Etapa conferida. As classificações respeitam o que as fontes permitem afirmar.");
  }

  function advanceStage() {
    if (!currentStageCompleted) return;
    setFeedback("");
    setShowHint(false);
    if (stageIndex < THRESHOLD_STAGES.length - 1) {
      setStageIndex((current) => current + 1);
      setTab("timeline");
      return;
    }
    setTab("verdict");
  }

  function requestHint() {
    if (!hintedStages.includes(currentStageId)) {
      setHintedStages((current) => [...current, currentStageId]);
      setHints((current) => current + 1);
    }
    setShowHint((current) => !current);
  }

  function finishCase() {
    if (!verdictUnlocked) {
      setFeedback("Conclua as quatro etapas do arquivo antes de apresentar o veredito.");
      return;
    }
    const verdict = THRESHOLD_VERDICTS.find((item) => item.id === selectedVerdict);
    if (!verdict) {
      setFeedback("Selecione uma conclusão antes de fechar o dossiê.");
      return;
    }
    if (!verdict.correct) {
      setMistakes((current) => current + 1);
      setFeedback(verdict.text);
      return;
    }
    if (recordedRef.current) return;

    const score = getThresholdScore({
      recordsOpened: openedRecords.length,
      interviewsOpened: openedInterviews.length,
      claimsCorrect: correctClaims,
      stagesCompleted: completedStages.length,
      verdictCorrect: true,
      mistakes,
      hints,
    });
    const actions = getThresholdActionCounts({
      recordsOpened: openedRecords.length,
      interviewsOpened: openedInterviews.length,
      claimsCorrect: correctClaims,
      stagesCompleted: completedStages.length,
      verdictCorrect: true,
    });
    const accuracy =
      actions.totalActions > 0
        ? Math.round((actions.correctActions / actions.totalActions) * 100)
        : 0;

    recordedRef.current = true;
    const elapsedSeconds = finishCaseTimer("threshold");
    recordCaseCompletion({
      caseId: "threshold",
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
            Dossiê concluído
          </p>
          <h1 className="mt-3 font-display text-4xl">Threshold · Ashen Creek, 1973</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Você separou o que foi observado das explicações que continuam em aberto. O arquivo
            registra o fechamento da passagem, mas não transforma as perguntas restantes em
            certezas.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Pontuação" value={`${finalScore ?? 0}/100`} />
            <Stat label="Precisão" value={`${finalAccuracy ?? 0}%`} />
            <Stat label="Erros registrados" value={mistakes} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBack}
              className="border border-primary/50 bg-primary/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-primary transition hover:bg-primary/20"
            >
              Voltar ao arquivo de casos
            </button>
            <TrilogyBookPurchaseButton chapter={9} />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border border-border bg-card/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/50 hover:text-primary"
        >
          ← Voltar aos casos
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <TrilogyBookPurchaseButton chapter={9} compact />
          <button
            type="button"
            onClick={onToggleSound}
            className="border border-border bg-card/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:border-primary/50 hover:text-primary"
          >
            {soundOn ? "Som ligado" : "Som desligado"}
          </button>
          <label className="flex items-center gap-2 border border-border bg-card/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Música
            <input
              aria-label="Volume da música de Threshold"
              type="range"
              min="0"
              max="100"
              value={Math.round(musicVolume * 100)}
              onChange={(event) => onMusicVolumeChange(Number(event.currentTarget.value) / 100)}
              className="w-24 accent-primary"
            />
            <span>{Math.round(musicVolume * 100)}%</span>
          </label>
        </div>
      </div>

      <header className="border border-primary/30 bg-card/70 p-5 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.34em] text-primary">
          Capítulo 09 · Ashen Creek · 1973
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Threshold</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Um arquivo sobre um aparelho esquecido, registros incompletos e acontecimentos estranhos
          em Ashen Creek. Avance por etapas; cada seção revela somente o período já alcançado.
        </p>
        <CaseHeroImage
          src="/images/threshold-cover.webp"
          alt="Capa do romance Threshold, em orientação vertical, com uma paisagem sombria de Ashen Creek."
          caption="Arquivo Threshold · Ashen Creek, 1973"
          orientation="portrait"
        />
      </header>

      <section aria-label="Progresso do caso" className="mt-5 grid gap-2 sm:grid-cols-4">
        {THRESHOLD_STAGES.map((stage, index) => {
          const completed = completedStages.includes(stage.id);
          const active = index === stageIndex;
          return (
            <div
              key={stage.id}
              aria-current={active ? "step" : undefined}
              className={`border p-3 ${active ? "border-primary/70 bg-primary/10" : completed ? "border-emerald-500/40 bg-emerald-950/20" : "border-border bg-card/50"}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Etapa {stage.number}{" "}
                {completed ? "· conferida" : active ? "· atual" : "· bloqueada"}
              </p>
              <p className="mt-1 font-display text-lg">
                {index <= stageIndex ? stage.title : "Arquivo lacrado"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {index <= stageIndex ? stage.period : "Avance para revelar"}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat
          label="Registros lidos"
          value={`${openedRecords.length}/${THRESHOLD_RECORDS.length}`}
        />
        <Stat
          label="Classificações corretas"
          value={`${correctClaims}/${THRESHOLD_CLAIMS.length}`}
        />
        <Stat
          label="Etapas conferidas"
          value={`${completedStages.length}/${THRESHOLD_STAGES.length}`}
        />
        <Stat label="Erros · dicas" value={`${mistakes} · ${hints}`} />
      </section>

      <section className="mt-6 border border-border bg-card/60 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              Etapa {currentStage.number} · {currentStage.period}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">{currentStage.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {currentStage.brief}
            </p>
          </div>
          <button
            type="button"
            onClick={requestHint}
            aria-expanded={showHint}
            className="shrink-0 border border-amber-500/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-950/30"
          >
            {showHint ? "Ocultar dica" : "Solicitar dica"}
          </button>
        </div>
        {showHint && (
          <p className="mt-4 border-l-2 border-amber-400/70 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {currentStage.hint}
          </p>
        )}

        <nav
          aria-label="Seções do dossiê"
          className="mt-5 flex flex-wrap gap-2 border-b border-border pb-4"
        >
          {tabs.map((item) => {
            const locked = item.id === "verdict" && !verdictUnlocked;
            return (
              <button
                key={item.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!locked) {
                    setTab(item.id);
                    setFeedback("");
                  }
                }}
                className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${tab === item.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                {item.id === "verdict" && !verdictUnlocked ? "Veredito · bloqueado" : item.label}
              </button>
            );
          })}
        </nav>

        {tab === "timeline" && (
          <div className="mt-5 space-y-3">
            {visibleTimeline.map((event) => (
              <article
                key={event.id}
                className="grid gap-3 border border-border/70 bg-background/40 p-4 sm:grid-cols-[10rem_1fr]"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                    {event.when}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Etapa {String(getStageIndex(event.stage) + 1).padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-xl">{event.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.text}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                    {event.source}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "records" && (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {visibleRecords.map((record) => {
              const isOpen = expandedRecord === record.id;
              const hasBeenRead = openedRecords.includes(record.id);
              return (
                <article key={record.id} className="border border-border/70 bg-background/40">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleRecord(record.id)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-primary/5"
                  >
                    <span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                        Registro · Etapa {String(getStageIndex(record.stage) + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block font-display text-xl">{record.title}</span>
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {hasBeenRead ? "Lido" : "Abrir"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/70 p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{record.text}</p>
                      {record.imageSrc && (
                        <figure className="mt-4 overflow-hidden border border-primary/20 bg-black/50">
                          <img
                            src={record.imageSrc}
                            alt={
                              record.imageAlt ?? "Ilustração do romance relacionada ao registro."
                            }
                            loading="lazy"
                            decoding="async"
                            className="max-h-[28rem] w-full object-contain"
                          />
                          {record.imageCaption && (
                            <figcaption className="border-t border-primary/20 px-3 py-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
                              {record.imageCaption}
                            </figcaption>
                          )}
                        </figure>
                      )}
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Fonte: {record.source}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {tab === "classification" && (
          <div className="mt-5 space-y-3">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Classifique cada afirmação pela natureza da fonte. Não transforme uma hipótese em fato
              nem preencha lacunas com informação de fora do arquivo.
            </p>
            {currentClaims.map((claim, index) => (
              <div
                key={claim.id}
                className="grid gap-3 border border-border/70 bg-background/40 p-4 md:grid-cols-[1fr_15rem] md:items-center"
              >
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                    Afirmação {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{claim.statement}</p>
                  {answers[claim.id] === claim.correctClass && (
                    <p className="mt-2 text-xs text-emerald-300">
                      Classificação sustentada pela fonte.
                    </p>
                  )}
                </div>
                <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Classificação: {claim.statement}
                  <select
                    aria-label={`Classificação: ${claim.statement}`}
                    value={answers[claim.id] ?? ""}
                    onChange={(event) => {
                      const value = event.currentTarget.value as ThresholdEvidenceClass | "";
                      if (!value) return;
                      setAnswers((current) => ({ ...current, [claim.id]: value }));
                      setFeedback("");
                    }}
                    className="mt-2 block w-full border border-border bg-background px-3 py-2 text-xs normal-case tracking-normal text-foreground"
                  >
                    <option value="">Selecione…</option>
                    {THRESHOLD_EVIDENCE_CLASSES.map((evidenceClass) => (
                      <option key={evidenceClass.id} value={evidenceClass.id}>
                        {evidenceClass.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={verifyStage}
                disabled={currentStageCompleted}
                className="border border-primary/50 bg-primary/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentStageCompleted ? "Etapa conferida" : "Conferir esta etapa"}
              </button>
              {currentStageCompleted && (
                <button
                  type="button"
                  onClick={advanceStage}
                  className="border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200 transition hover:bg-emerald-950/50"
                >
                  {stageIndex === THRESHOLD_STAGES.length - 1
                    ? "Abrir o veredito final"
                    : "Avançar para a próxima etapa"}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "interviews" && (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {visibleInterviews.map((interview) => {
              const isOpen = expandedInterview === interview.id;
              const hasBeenRead = openedInterviews.includes(interview.id);
              return (
                <article key={interview.id} className="border border-border/70 bg-background/40">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={`${interview.name} · ${interview.prompt}`}
                    onClick={() => toggleInterview(interview.id)}
                    className="w-full p-4 text-left hover:bg-primary/5"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                      {interview.role} · Etapa{" "}
                      {String(getStageIndex(interview.stage) + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-3 font-display text-xl">
                      {interview.name}
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                        {hasBeenRead ? "Lido" : "Abrir"}
                      </span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Pergunta
                      </p>
                      <p className="mt-1 text-sm">{interview.prompt}</p>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Resposta registrada
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {interview.answer}
                      </p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Fonte: {interview.source}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {tab === "verdict" && verdictUnlocked && (
          <div className="mt-5">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Apresente a conclusão mais bem sustentada. O arquivo aceita incerteza quando as fontes
              não permitem uma resposta definitiva.
            </p>
            <div className="mt-4 space-y-3">
              {THRESHOLD_VERDICTS.map((verdict) => (
                <label
                  key={verdict.id}
                  className={`block cursor-pointer border p-4 transition ${selectedVerdict === verdict.id ? "border-primary/70 bg-primary/10" : "border-border bg-background/40 hover:border-primary/40"}`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="threshold-verdict"
                      aria-label={verdict.title}
                      value={verdict.id}
                      checked={selectedVerdict === verdict.id}
                      onChange={(event) => setSelectedVerdict(event.currentTarget.value)}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      <span className="block font-display text-lg leading-snug">
                        {verdict.title}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                        {verdict.text}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={finishCase}
              className="mt-5 border border-primary/50 bg-primary/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary transition hover:bg-primary/20"
            >
              Fechar dossiê e conferir conclusão
            </button>
          </div>
        )}

        {feedback && (
          <p
            role="status"
            className="mt-4 border-l-2 border-primary/60 bg-background/50 px-4 py-3 text-sm text-muted-foreground"
          >
            {feedback}
          </p>
        )}
      </section>
    </main>
  );
}
