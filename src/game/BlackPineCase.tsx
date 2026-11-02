import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  Grid3X3,
  HelpCircle,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "./caseTimer";
import { recordCaseCompletion } from "./achievements";
import {
  BLACK_PINE_ARTIFACTS,
  BLACK_PINE_CLUES,
  BLACK_PINE_INTERVIEWS,
  BLACK_PINE_LOCATIONS,
  BLACK_PINE_PEOPLE,
  BLACK_PINE_RECORDS,
  BLACK_PINE_VERDICTS,
  checkBlackPineArtifactGrid,
  checkBlackPineGrid,
  nextBlackPineMark,
  type BlackPineMark,
} from "./blackPineCase";

type Tab = "records" | "grid" | "interviews" | "verdict";

type Props = {
  onBack: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
};

const HERO_SRC = "/images/case-black-pine.jpg";

export function BlackPineCase({ onBack, soundOn, onToggleSound }: Props) {
  const [tab, setTab] = useState<Tab>("records");
  const [marks, setMarks] = useState<Record<string, BlackPineMark>>({});
  const [artifactMarks, setArtifactMarks] = useState<Record<string, BlackPineMark>>({});
  const [openedRecords, setOpenedRecords] = useState<string[]>([]);
  const [openedInterviews, setOpenedInterviews] = useState<string[]>([]);
  const [verdictId, setVerdictId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const recordedRef = useRef(false);

  useEffect(() => {
    beginCaseTimer("blackpine");
    return () => pauseCaseTimer("blackpine");
  }, []);

  const gridSolved = useMemo(() => checkBlackPineGrid(marks), [marks]);
  const artifactGridSolved = useMemo(
    () => checkBlackPineArtifactGrid(artifactMarks),
    [artifactMarks],
  );
  const allGridsSolved = gridSolved && artifactGridSolved;
  const interviewsSolved = openedInterviews.length === BLACK_PINE_INTERVIEWS.length;
  const correctVerdict = verdictId === "supported";
  const score = Math.max(
    0,
    Math.min(
      100,
      (gridSolved ? 40 : 0) +
        (artifactGridSolved ? 15 : 0) +
        (interviewsSolved ? 20 : openedInterviews.length * 4) +
        (correctVerdict ? 25 : 0) -
        mistakes * 4,
    ),
  );

  const completeCase = () => {
    if (!correctVerdict) {
      setFeedback(
        "A conclusão ainda não é sustentada pelo conjunto de documentos. Revise o quarto, a estação e os limites da evidência.",
      );
      setMistakes((value) => value + 1);
      return;
    }
    if (!allGridsSolved) {
      setFeedback(
        "As duas grades ainda têm relações sem conferir. Relacione pessoas, locais e objetos antes de fechar o dossiê.",
      );
      setMistakes((value) => value + 1);
      setTab("grid");
      return;
    }
    if (!recordedRef.current) {
      recordedRef.current = true;
      const elapsedSeconds = finishCaseTimer("blackpine");
      recordCaseCompletion({
        caseId: "blackpine",
        score,
        hints,
        mistakes,
        correctConclusion: true,
        elapsedSeconds,
        correctActions: openedRecords.length + openedInterviews.length + 2,
        totalActions:
          BLACK_PINE_RECORDS.length +
          BLACK_PINE_INTERVIEWS.length +
          BLACK_PINE_PEOPLE.length * 2 +
          2,
      });
    }
    setFinished(true);
  };

  const revealHint = () => {
    setHints((value) => value + 1);
    setShowHint(true);
  };

  if (finished) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
        <div className="mx-auto max-w-4xl border border-primary/60 bg-card/50 p-6 shadow-2xl sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Dossiê encerrado · Black Pine
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl">O Quarto 17</h1>
          <div className="mt-8 border border-primary/40 bg-primary/5 p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Conclusão sustentada
            </p>
            <p className="mt-3 text-lg leading-relaxed">
              Whitmore saiu voluntariamente para seguir a pista da estação. O quarto foi usado para
              controlar a narrativa; a autoria da mensagem permanece sem prova.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Pontuação" value={`${score}/100`} />
            <Stat label="Erros" value={String(mistakes)} />
            <Stat
              label="Pistas consultadas"
              value={`${openedRecords.length}/${BLACK_PINE_RECORDS.length}`}
            />
          </div>
          <p className="mt-8 border-l-2 border-primary px-4 text-sm leading-relaxed text-muted-foreground">
            “O quarto foi encenado. A estação é a última localização comprovável. Whitmore sabia
            mais do que registrou — e alguém queria que a cidade confundisse uma investigação com
            uma lenda.”
          </p>
          <Button type="button" className="mt-8" onClick={onBack}>
            Voltar ao arquivo de casos
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-primary/30 pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
              Capítulo 07 · Black Pine, Maine · 1987
            </p>
            <h1 className="mt-2 font-display text-4xl sm:text-6xl">O Quarto 17</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Whitmore desapareceu do próprio quarto. Dezessete moedas deixaram uma mensagem, mas
              não uma resposta. Reconstrua os fatos antes de acreditar na lenda.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={soundOn ? "Desligar som" : "Ligar som"}
              onClick={onToggleSound}
              className="border border-border p-3 text-muted-foreground hover:border-primary hover:text-primary"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
            >
              ← Casos
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border border-primary/30 bg-card/30 p-5 sm:p-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
              <ShieldAlert size={16} /> Cena inicial
            </div>
            <div className="mt-5 border border-border bg-black/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              <p>BLACK PINE INN · QUARTO 17</p>
              <p className="mt-3">
                Porta aberta. Janela trancada por dentro. Nenhum sinal de luta.
              </p>
              <p className="mt-3 text-primary">17 moedas dispostas em círculo sobre a cama.</p>
              <p className="mt-3">
                Quando viradas, formam: <strong className="text-foreground">WHITMORE SABIA</strong>
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <EvidenceStat
                icon={<BookOpen size={15} />}
                label="Registros"
                value={`${openedRecords.length}/5`}
              />
              <EvidenceStat
                icon={<Grid3X3 size={15} />}
                label="Grade"
                value={allGridsSolved ? "Conferida" : "Aberta"}
              />
              <EvidenceStat
                icon={<MessageSquare size={15} />}
                label="Depoimentos"
                value={`${openedInterviews.length}/5`}
              />
              <EvidenceStat
                icon={<MapPin size={15} />}
                label="Veredicto"
                value={correctVerdict ? "Sustentado" : "Pendente"}
              />
            </div>
          </div>
          <div className="border border-border bg-card/20 p-5 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              Regra do arquivo
            </p>
            <h2 className="mt-2 font-display text-2xl">Fato não é lenda</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Você pode registrar que uma hipótese é estranha sem tratá-la como prova. O melhor
              investigador sabe dizer também o que os documentos não conseguem estabelecer.
            </p>
            <button
              type="button"
              onClick={revealHint}
              className="mt-5 inline-flex items-center gap-2 border border-primary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10"
            >
              <HelpCircle size={15} /> Pedir uma orientação
            </button>
            {showHint && (
              <p className="mt-4 border-l-2 border-primary px-3 text-sm text-muted-foreground">
                Comece pela estação: o caderno, o chapéu, o bilhete e as pegadas apontam para a
                última localização verificável.
              </p>
            )}
          </div>
        </section>

        <nav
          className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3"
          aria-label="Etapas do caso"
        >
          <TabButton
            active={tab === "records"}
            onClick={() => setTab("records")}
            icon={<BookOpen size={15} />}
          >
            Registros
          </TabButton>
          <TabButton
            active={tab === "grid"}
            onClick={() => setTab("grid")}
            icon={<Grid3X3 size={15} />}
          >
            Grade de dedução
          </TabButton>
          <TabButton
            active={tab === "interviews"}
            onClick={() => setTab("interviews")}
            icon={<MessageSquare size={15} />}
          >
            Interrogatórios
          </TabButton>
          <TabButton
            active={tab === "verdict"}
            onClick={() => setTab("verdict")}
            icon={<ShieldAlert size={15} />}
          >
            Veredicto
          </TabButton>
        </nav>

        <section className="mt-5 border border-border bg-card/20 p-5 sm:p-6" aria-live="polite">
          {tab === "records" && (
            <Records
              openedRecords={openedRecords}
              onOpen={(id) =>
                setOpenedRecords((items) => (items.includes(id) ? items : [...items, id]))
              }
            />
          )}
          {tab === "grid" && (
            <DeductionGrid
              marks={marks}
              artifactMarks={artifactMarks}
              onMark={(key) =>
                setMarks((current) => ({
                  ...current,
                  [key]: nextBlackPineMark(current[key] ?? ""),
                }))
              }
              onArtifactMark={(key) =>
                setArtifactMarks((current) => ({
                  ...current,
                  [key]: nextBlackPineMark(current[key] ?? ""),
                }))
              }
            />
          )}
          {tab === "interviews" && (
            <Interviews
              opened={openedInterviews}
              onOpen={(id) =>
                setOpenedInterviews((items) => (items.includes(id) ? items : [...items, id]))
              }
            />
          )}
          {tab === "verdict" && <Verdict verdictId={verdictId} onSelect={setVerdictId} />}
        </section>

        {feedback && (
          <p
            role="status"
            className="mt-4 border border-destructive/60 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {feedback}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {mistakes} erro(s) · {hints} orientação(ões)
          </p>
          <Button type="button" onClick={completeCase}>
            Fechar dossiê e conferir conclusão
          </Button>
        </div>
      </div>
    </main>
  );
}

function Records({
  openedRecords,
  onOpen,
}: {
  openedRecords: string[];
  onOpen: (id: string) => void;
}) {
  return (
    <div>
      <SectionHeading
        icon={<BookOpen size={18} />}
        title="Registros do arquivo"
        detail="Abra os documentos antes de decidir o que eles provam."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {BLACK_PINE_RECORDS.map((record) => {
          const open = openedRecords.includes(record.id);
          return (
            <article
              key={record.id}
              className={`border p-4 ${open ? "border-primary/60 bg-primary/5" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl">{record.title}</h3>
                  {open && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {record.text}
                    </p>
                  )}
                </div>
                {open ? (
                  <Check className="shrink-0 text-primary" size={18} />
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpen(record.id)}
                    className="shrink-0 border border-primary/60 px-3 py-2 font-mono text-[10px] uppercase text-primary hover:bg-primary/10"
                  >
                    Abrir
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function DeductionGrid({
  marks,
  artifactMarks,
  onMark,
  onArtifactMark,
}: {
  marks: Record<string, BlackPineMark>;
  artifactMarks: Record<string, BlackPineMark>;
  onMark: (key: string) => void;
  onArtifactMark: (key: string) => void;
}) {
  return (
    <div>
      <SectionHeading
        icon={<Grid3X3 size={18} />}
        title="Grade de dedução"
        detail="Como em uma grade Murdle: cruze pessoas com locais e objetos. 1 clique marca ✗, 2 confirmam ●, 3 limpam."
      />
      <ol className="mt-5 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        {BLACK_PINE_CLUES.map((clue) => (
          <li key={clue}>{clue}</li>
        ))}
      </ol>
      <div className="mt-6 overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left font-mono font-normal text-muted-foreground">Pessoa</th>
              {BLACK_PINE_LOCATIONS.map((location) => (
                <th
                  key={location.id}
                  className="min-w-28 p-2 text-center font-mono font-normal text-muted-foreground"
                >
                  {location.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLACK_PINE_PEOPLE.map((person) => (
              <tr key={person.id}>
                <th className="border border-border p-2 text-left font-normal">
                  <span className="block">{person.name}</span>
                  <span className="text-[10px] text-muted-foreground">{person.role}</span>
                </th>
                {BLACK_PINE_LOCATIONS.map((location) => {
                  const mark = marks[`${person.id}|${location.id}`] ?? "";
                  return (
                    <td key={location.id} className="border border-border p-0">
                      <button
                        type="button"
                        aria-label={`${person.name} e ${location.label}`}
                        aria-pressed={mark === "o"}
                        onClick={() => onMark(`${person.id}|${location.id}`)}
                        className="h-14 w-full text-lg text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {mark === "x" ? (
                          <X className="mx-auto text-muted-foreground" size={18} />
                        ) : mark === "o" ? (
                          <Check className="mx-auto" size={18} />
                        ) : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="mt-7 font-display text-xl">Pessoa e objeto</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left font-mono font-normal text-muted-foreground">Pessoa</th>
              {BLACK_PINE_ARTIFACTS.map((artifact) => (
                <th
                  key={artifact.id}
                  className="min-w-28 p-2 text-center font-mono font-normal text-muted-foreground"
                >
                  {artifact.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLACK_PINE_PEOPLE.map((person) => (
              <tr key={person.id}>
                <th className="border border-border p-2 text-left font-normal">{person.name}</th>
                {BLACK_PINE_ARTIFACTS.map((artifact) => {
                  const mark = artifactMarks[`${person.id}|${artifact.id}`] ?? "";
                  return (
                    <td key={artifact.id} className="border border-border p-0">
                      <button
                        type="button"
                        aria-label={`${person.name} e ${artifact.label}`}
                        aria-pressed={mark === "o"}
                        onClick={() => onArtifactMark(`${person.id}|${artifact.id}`)}
                        className="h-14 w-full text-lg text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {mark === "x" ? (
                          <X className="mx-auto text-muted-foreground" size={18} />
                        ) : mark === "o" ? (
                          <Check className="mx-auto" size={18} />
                        ) : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        As duas grades organizam a reconstrução documental. Elas não estabelecem culpa.
      </p>
    </div>
  );
}

function Interviews({ opened, onOpen }: { opened: string[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <SectionHeading
        icon={<MessageSquare size={18} />}
        title="Interrogatórios"
        detail="As respostas podem revelar omissões sem transformar suspeita em prova."
      />
      <div className="mt-5 space-y-3">
        {BLACK_PINE_INTERVIEWS.map((interview) => {
          const open = opened.includes(interview.id);
          return (
            <article key={interview.id} className="border border-border p-4">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onOpen(interview.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block font-display text-xl">{interview.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {interview.question}
                  </span>
                </span>
                {open ? (
                  <Check className="shrink-0 text-primary" size={18} />
                ) : (
                  <span className="font-mono text-[10px] uppercase text-primary">Ouvir</span>
                )}
              </button>
              {open && (
                <div className="mt-4 border-l-2 border-primary/50 pl-4 text-sm leading-relaxed">
                  <p>{interview.answer}</p>
                  <p className="mt-3 text-muted-foreground">
                    <strong className="text-primary">Leitura:</strong> {interview.clue}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Verdict({
  verdictId,
  onSelect,
}: {
  verdictId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <SectionHeading
        icon={<ShieldAlert size={18} />}
        title="Veredicto"
        detail="Escolha a conclusão mais forte, não a mais assustadora."
      />
      <div className="mt-5 space-y-3">
        {BLACK_PINE_VERDICTS.map((verdict) => (
          <button
            key={verdict.id}
            type="button"
            onClick={() => onSelect(verdict.id)}
            className={`w-full border p-4 text-left transition ${verdictId === verdict.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}
          >
            <span className="flex items-start gap-3">
              <span
                className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${verdictId === verdict.id ? "border-primary bg-primary" : "border-muted-foreground"}`}
              />
              <span>
                <strong className="font-display text-xl font-normal">{verdict.title}</strong>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  {verdict.text}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-primary">{icon}</span>
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "step" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function EvidenceStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border p-3">
      <span className="flex justify-center text-primary">{icon}</span>
      <span className="mt-2 block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <strong className="mt-1 block text-xs">{value}</strong>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}
