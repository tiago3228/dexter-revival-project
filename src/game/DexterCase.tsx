import { useEffect, useMemo, useState } from "react";

type Difficulty = "investigador" | "detetive" | "dexter";
type Evidence = { id: string; title: string; location: string; body: string };
type SavedInvestigation = {
  version: 1;
  difficulty: Difficulty;
  visited: string[];
  found: string[];
  activeLocation: string;
  safeOpen: boolean;
  depotOpen: boolean;
  timelineAnswer: string;
  timelineSolved: boolean;
  forensicAnswer: string;
  forensicSolved: boolean;
  suspect: string;
  ending: boolean;
  accusationSubmitted: boolean;
  hintsUsed: string[];
  mistakes: number;
};
const SAVE_KEY = "dexter-last-confession-save";
const isDifficulty = (value: unknown): value is Difficulty =>
  value === "investigador" || value === "detetive" || value === "dexter";

const EVIDENCE: Evidence[] = [
  {
    id: "letter",
    title: "Carta nunca enviada",
    location: "Casa Whitmore",
    body: "Eleanor escreveu: “Se eu desaparecer, procure a gravação de 27 de abril. Ele sempre usa datas que ninguém questiona.” No envelope, alguém anotou 04·27.",
  },
  {
    id: "photo",
    title: "Fotografia do cais",
    location: "Arquivo do xerife",
    body: "No verso: “Depósito 73 / caixa 19”. A foto foi revelada no dia seguinte à morte de Eleanor, embora o registro oficial diga que o laboratório estava fechado.",
  },
  {
    id: "log",
    title: "Livro de entrada",
    location: "Arquivo do xerife",
    body: "Na noite do crime, o xerife-adjunto Paul Renner registrou a saída às 21h10. Uma segunda assinatura, quase apagada, registra seu retorno às 22h06.",
  },
  {
    id: "autopsy",
    title: "Relatório preliminar",
    location: "Hospital St. Agnes",
    body: "A vítima morreu antes da meia-noite. Havia resíduo de detergente nas mãos, mas partículas de tinta azul sob duas unhas. O ferimento não explica a ausência de sangue no corredor.",
  },
  {
    id: "tape",
    title: "Transcrição da fita",
    location: "Capela de Greybridge",
    body: "Eleanor: “A pessoa que me ameaçou disse que estava no cais. Mas ouvi o sino da capela ao fundo — e o sino estava quebrado naquela semana.”",
  },
  {
    id: "receipt",
    title: "Recibo do depósito",
    location: "Cais antigo",
    body: "A caixa 19 foi alugada por P. Renner. O recibo tem tinta azul fresca e uma marca de limpeza no canto, compatível com o resíduo encontrado sob as unhas de Eleanor.",
  },
];

const LOCATIONS = [
  {
    id: "house",
    name: "Casa Whitmore",
    description: "Uma casa preservada como se a proprietária fosse voltar a qualquer momento.",
    evidence: ["letter"],
  },
  {
    id: "sheriff",
    name: "Arquivo do xerife",
    description: "Registros de entrada, fotografias e caixas lacradas empoeiradas.",
    evidence: ["photo", "log"],
  },
  {
    id: "hospital",
    name: "Hospital St. Agnes",
    description: "O relatório original foi arquivado longe dos olhos da imprensa.",
    evidence: ["autopsy"],
  },
  {
    id: "chapel",
    name: "Capela de Greybridge",
    description: "O sino está parado. A gravação parece contradizer o depoimento oficial.",
    evidence: ["tape"],
  },
  {
    id: "pier",
    name: "Cais antigo",
    description: "Um depósito de madeira abandonado e um recibo escondido sob uma tábua.",
    evidence: ["receipt"],
  },
];

const DIFFICULTIES: { id: Difficulty; title: string; subtitle: string; details: string }[] = [
  {
    id: "investigador",
    title: "Investigador",
    subtitle: "Fácil",
    details: "Pistas mais diretas e lembretes contextuais nos enigmas.",
  },
  {
    id: "detetive",
    title: "Detetive",
    subtitle: "Normal",
    details: "Cruze documentos e depoimentos. Dicas limitadas.",
  },
  {
    id: "dexter",
    title: "Dexter",
    subtitle: "Difícil",
    details: "Sem destaques automáticos. Você precisa conectar evidências por conta própria.",
  },
];

export function DexterCase({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("dexter-painscreek-difficulty");
    return saved === "investigador" || saved === "detetive" || saved === "dexter" ? saved : null;
  });
  const [visited, setVisited] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [activeLocation, setActiveLocation] = useState("house");
  const [code, setCode] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [safeOpen, setSafeOpen] = useState(false);
  const [depotOpen, setDepotOpen] = useState(false);
  const [timelineAnswer, setTimelineAnswer] = useState("");
  const [timelineSolved, setTimelineSolved] = useState(false);
  const [forensicAnswer, setForensicAnswer] = useState("");
  const [forensicSolved, setForensicSolved] = useState(false);
  const [suspect, setSuspect] = useState("");
  const [ending, setEnding] = useState(false);
  const [accusationSubmitted, setAccusationSubmitted] = useState(false);
  const [hintDialog, setHintDialog] = useState<{ id: string; hint: string; revealed: boolean } | null>(null);
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [saveReady, setSaveReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedInvestigation>;
        if (saved.version === 1 && isDifficulty(saved.difficulty)) {
          setDifficulty(saved.difficulty);
          setVisited(Array.isArray(saved.visited) ? saved.visited.filter((id): id is string => LOCATIONS.some((item) => item.id === id)) : []);
          setFound(Array.isArray(saved.found) ? saved.found.filter((id): id is string => EVIDENCE.some((item) => item.id === id)) : []);
          setActiveLocation(LOCATIONS.some((item) => item.id === saved.activeLocation) ? (saved.activeLocation as string) : "house");
          setSafeOpen(saved.safeOpen === true);
          setDepotOpen(saved.depotOpen === true);
          setTimelineAnswer(typeof saved.timelineAnswer === "string" ? saved.timelineAnswer : "");
          setTimelineSolved(saved.timelineSolved === true);
          setForensicAnswer(typeof saved.forensicAnswer === "string" ? saved.forensicAnswer : "");
          setForensicSolved(saved.forensicSolved === true);
          setSuspect(typeof saved.suspect === "string" ? saved.suspect : "");
          setEnding(saved.ending === true);
          setAccusationSubmitted(saved.accusationSubmitted === true);
          setHintsUsed(Array.isArray(saved.hintsUsed) ? saved.hintsUsed.filter((id): id is string => ["safe", "depot", "timeline", "forensics"].includes(id)) : []);
          setMistakes(typeof saved.mistakes === "number" && Number.isFinite(saved.mistakes) ? Math.max(0, Math.floor(saved.mistakes)) : 0);
        } else {
          window.localStorage.removeItem(SAVE_KEY);
        }
      }
    } catch {
      window.localStorage.removeItem(SAVE_KEY);
    } finally {
      setSaveReady(true);
    }
  }, []);

  useEffect(() => {
    if (!saveReady) return;
    if (!difficulty) {
      window.localStorage.removeItem(SAVE_KEY);
      return;
    }
    const saved: SavedInvestigation = {
      version: 1,
      difficulty,
      visited,
      found,
      activeLocation,
      safeOpen,
      depotOpen,
      timelineAnswer,
      timelineSolved,
      forensicAnswer,
      forensicSolved,
      suspect,
      ending,
      accusationSubmitted,
      hintsUsed,
      mistakes,
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  }, [saveReady, difficulty, visited, found, activeLocation, safeOpen, depotOpen, timelineAnswer, timelineSolved, forensicAnswer, forensicSolved, suspect, ending, accusationSubmitted, hintsUsed, mistakes]);

  useEffect(() => {
    if (difficulty) window.localStorage.setItem("dexter-painscreek-difficulty", difficulty);
  }, [difficulty]);

  const currentLocation =
    LOCATIONS.find((location) => location.id === activeLocation) ?? LOCATIONS[0];
  const locationEvidence = useMemo(
    () => EVIDENCE.filter((item) => currentLocation.evidence.includes(item.id)),
    [currentLocation],
  );
  const allFound = found.length === EVIDENCE.length;
  const score = Math.max(0, 100 - hintsUsed.length * 15 - mistakes * 5);
  const finalRank = suspect !== "Paul Renner"
    ? "Investigação inconclusiva"
    : score === 100
      ? "Dexter — Instinto impecável"
      : score >= 85
        ? "Investigador de elite"
        : score >= 70
          ? "Detetive experiente"
          : score >= 55
            ? "Investigador mediano"
            : "Investigação comprometida";
  const canSolveTimeline = found.includes("log") && found.includes("tape");
  const canSolveForensics = found.includes("autopsy") && found.includes("receipt");
  const canAccuse =
    safeOpen &&
    depotOpen &&
    timelineSolved &&
    forensicSolved &&
    allFound &&
    !accusationSubmitted;

  const inspectLocation = (id: string) => {
    setActiveLocation(id);
    setVisited((current) => (current.includes(id) ? current : [...current, id]));
  };
  const inspectEvidence = (id: string) =>
    setFound((current) => (current.includes(id) ? current : [...current, id]));
  const submitCode = (kind: "safe" | "depot") => {
    const expected = kind === "safe" ? "0427" : "7319";
    if (code.trim() === expected) {
      if (kind === "safe") setSafeOpen(true);
      else setDepotOpen(true);
      setCodeMessage(
        kind === "safe"
          ? "Cofre aberto. A fita estava escondida no forro."
          : "Caixa 19 localizada. O recibo liga o depósito a Renner.",
      );
      setCode("");
    } else {
      setMistakes((current) => current + 1);
      setCodeMessage(
        difficulty === "investigador"
          ? "Código incorreto. Confira a carta de Eleanor para o cofre ou a foto do cais para a caixa."
          : "Código incorreto. Cruze as anotações e os documentos encontrados.",
      );
    }
  };

  const resetCase = (nextDifficulty: Difficulty | null = null) => {
    setDifficulty(nextDifficulty);
    setVisited([]);
    setFound([]);
    setActiveLocation("house");
    setCode("");
    setCodeMessage("");
    setSafeOpen(false);
    setDepotOpen(false);
    setTimelineAnswer("");
    setTimelineSolved(false);
    setForensicAnswer("");
    setForensicSolved(false);
    setSuspect("");
    setEnding(false);
    setAccusationSubmitted(false);
    setHintDialog(null);
    setHintsUsed([]);
    setMistakes(0);
    window.localStorage.removeItem(SAVE_KEY);
    if (nextDifficulty === null) window.localStorage.removeItem("dexter-painscreek-difficulty");
  };

  if (!difficulty) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={onBack}
            className="mb-8 font-mono text-xs text-muted-foreground hover:text-primary"
          >
            ← VOLTAR AOS ARQUIVOS
          </button>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
            Arquivo especial · Greybridge, Flórida
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight sm:text-7xl">
            The Last Confession
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
            Um caso arquivado, uma gravação desaparecida e uma cidade inteira que aprendeu a
            conviver com uma mentira. Escolha a dificuldade antes de iniciar. A verdade central é a
            mesma em todos os modos.
          </p>
          <h2 className="mt-10 font-display text-2xl">Como você vai investigar?</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {DIFFICULTIES.map((item) => (
              <button
                key={item.id}
                onClick={() => resetCase(item.id)}
                className="border border-border bg-card/50 p-5 text-left transition hover:border-primary hover:bg-card"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-primary">
                  {item.subtitle}
                </p>
                <h3 className="mt-2 font-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.details}</p>
                <span className="mt-6 block font-mono text-xs text-primary">
                  INICIAR NESTA DIFICULDADE →
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <button
              onClick={onBack}
              className="mb-4 font-mono text-xs text-muted-foreground hover:text-primary"
            >
              ← ARQUIVOS
            </button>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Caso 03 · Greybridge, Flórida · 1998
            </p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">The Last Confession</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Dexter Morgan revisita a morte de Eleanor Whitmore depois que uma fita anônima chega
              ao laboratório de Miami Metro.
            </p>
          </div>
          <div className="border border-border px-4 py-3 font-mono text-xs text-muted-foreground">
            <p>
              DIFICULDADE:{" "}
              <span className="text-primary">
                {DIFFICULTIES.find((item) => item.id === difficulty)?.title.toUpperCase()}
              </span>
            </p>
            <p className="mt-2">
              EVIDÊNCIAS: {found.length}/{EVIDENCE.length}
            </p>
            <p className="mt-2">PONTUAÇÃO: {score}/100</p>
            <p className="mt-2 text-[10px] text-primary">{saveReady ? "SALVAMENTO AUTOMÁTICO ATIVO" : "CARREGANDO ARQUIVO..."}</p>
            <button
              className="mt-3 underline hover:text-primary"
              onClick={() => resetCase()}
            >
              Reiniciar / trocar dificuldade
            </button>
          </div>
        </div>

        <section className="mt-6 border border-border bg-card/30 p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Briefing · Miami Metro
          </p>
          <p className="mt-3 leading-relaxed">
            Em outubro de 1998, Eleanor Whitmore foi encontrada morta em sua casa em Greybridge. A
            investigação foi encerrada após o depoimento de um único suspeito. Agora, uma gravação
            recuperada sugere que a cena foi limpa e que um registro oficial foi adulterado. Seu
            trabalho é reconstruir os fatos — e descobrir quem está mentindo.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="border border-border p-4 sm:p-5">
            <h2 className="font-display text-2xl">Locais de investigação</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Visite cada local e registre os itens importantes.
            </p>
            <div className="mt-4 grid gap-2">
              {LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => inspectLocation(location.id)}
                  className={`border p-3 text-left transition ${activeLocation === location.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"}`}
                >
                  <span className="block font-medium">{location.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {location.description}
                  </span>
                  {visited.includes(location.id) && (
                    <span className="mt-2 block font-mono text-[10px] text-primary">
                      LOCAL EXAMINADO
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="border border-border p-4 sm:p-5">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Cena ativa</p>
            <h2 className="mt-2 font-display text-2xl">{currentLocation.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{currentLocation.description}</p>
            <div className="mt-5 space-y-3">
              {locationEvidence.map((item) => (
                <article key={item.id} className="border border-border bg-card/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    {found.includes(item.id) ? (
                      <span className="font-mono text-[10px] text-primary">REGISTRADO</span>
                    ) : (
                      <button
                        onClick={() => inspectEvidence(item.id)}
                        className="font-mono text-[10px] text-primary underline"
                      >
                        EXAMINAR
                      </button>
                    )}
                  </div>
                  {found.includes(item.id) && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  )}
                </article>
              ))}
            </div>
            {locationEvidence.every((item) => found.includes(item.id)) && (
              <p className="mt-4 border-l-2 border-primary pl-3 text-sm text-muted-foreground">
                Não há mais evidências óbvias neste local. Procure contradições entre documentos.
              </p>
            )}
          </section>
        </div>

        <section className="mt-6 border border-border p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Caderno de investigação</p>
              <h2 className="mt-2 font-display text-2xl">Dossiê de evidências</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground">{found.length} DE {EVIDENCE.length} REGISTRADAS</p>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${(found.length / EVIDENCE.length) * 100}%` }} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {EVIDENCE.map((item) => {
              const registered = found.includes(item.id);
              const locationId = LOCATIONS.find((location) => location.name === item.location)?.id ?? "house";
              return (
                <article key={item.id} className="border border-border bg-card/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className={`shrink-0 font-mono text-[10px] ${registered ? "text-primary" : "text-muted-foreground"}`}>{registered ? "REGISTRADA" : "PENDENTE"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.location}</p>
                  {registered ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{item.body}</p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">Esta evidência ainda não foi examinada.</p>
                  )}
                  <button
                    onClick={() => inspectLocation(locationId)}
                    className="mt-3 border border-border px-3 py-2 font-mono text-[10px] text-primary hover:border-primary"
                  >
                    {activeLocation === locationId ? "LOCAL SELECIONADO" : "SELECIONAR LOCAL"}
                  </button>
                </article>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Locais visitados", value: `${visited.length}/${LOCATIONS.length}` },
              { label: "Mecanismos abertos", value: `${Number(safeOpen) + Number(depotOpen)}/2` },
              { label: "Dedução validada", value: `${Number(timelineSolved) + Number(forensicSolved)}/2` },
              { label: "Penalidades", value: `${hintsUsed.length} dicas · ${mistakes} erros` },
            ].map((item) => (
              <div key={item.label} className="border border-border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-mono text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border border-border p-4 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Bancada de análise
          </p>
          <h2 className="mt-2 font-display text-2xl">Fechaduras e mecanismos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Os códigos estão nos documentos. No modo Dexter, nenhuma pista será apontada
            automaticamente.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border border-border bg-card/40 p-4">
              <h3 className="font-medium">Cofre da casa Whitmore {safeOpen && "· ABERTO"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Descubra o código usando as evidências reunidas durante a investigação.
              </p>
              <button
                onClick={() => setHintDialog({ id: "safe", hint: "Eleanor escreveu a data-chave na carta que deixou. Observe como a data pode ser convertida em quatro dígitos.", revealed: false })}
                className="mt-3 border border-border px-3 py-2 font-mono text-xs text-primary transition hover:border-primary"
              >
                DICAS
              </button>
              {!safeOpen && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="4 dígitos"
                    className="min-w-0 flex-1 border border-border bg-background px-3 py-2 font-mono"
                  />
                  <button
                    onClick={() => submitCode("safe")}
                    className="border border-primary px-4 py-2 font-mono text-xs text-primary"
                  >
                    ABRIR
                  </button>
                </div>
              )}
              {safeOpen && (
                <p className="mt-2 text-sm text-primary">
                  A fita estava escondida no forro do cofre.
                </p>
              )}
            </div>
            <div className="border border-border bg-card/40 p-4">
              <h3 className="font-medium">Depósito do cais {depotOpen && "· ABERTO"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Procure as referências que conectam a fotografia ao depósito do cais.
              </p>
              <button
                onClick={() => setHintDialog({ id: "depot", hint: "Leia o verso da fotografia encontrada no arquivo do xerife. As duas referências ali devem ser combinadas em um único código.", revealed: false })}
                className="mt-3 border border-border px-3 py-2 font-mono text-xs text-primary transition hover:border-primary"
              >
                DICAS
              </button>
              {!depotOpen && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="4 dígitos"
                    className="min-w-0 flex-1 border border-border bg-background px-3 py-2 font-mono"
                  />
                  <button
                    onClick={() => submitCode("depot")}
                    className="border border-primary px-4 py-2 font-mono text-xs text-primary"
                  >
                    ABRIR
                  </button>
                </div>
              )}
              {depotOpen && (
                <p className="mt-2 text-sm text-primary">
                  A caixa 19 contém o recibo que liga Renner ao depósito.
                </p>
              )}
            </div>
          </div>
          {codeMessage && (
            <p role="status" className="mt-4 border-l-2 border-primary pl-3 text-sm">
              {codeMessage}
            </p>
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="border border-border p-4 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              Reconstrução temporal
            </p>
            <h2 className="mt-2 font-display text-2xl">O que aconteceu naquela noite?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A versão oficial diz que Renner deixou o posto antes do crime e não retornou. O livro
              de entrada tem duas marcações; a fita coloca em dúvida o local do encontro.
            </p>
            <button
              onClick={() => setHintDialog({ id: "timeline", hint: "Compare as duas marcações do livro de entrada com o detalhe do sino mencionado na fita. Uma dessas informações torna a versão oficial impossível.", revealed: false })}
              className="mt-3 border border-border px-3 py-2 font-mono text-xs text-primary transition hover:border-primary"
            >
              DICAS
            </button>
            {!timelineSolved ? (
              <>
                {!canSolveTimeline && (
                  <p className="mt-4 border-l-2 border-primary/60 pl-3 text-sm text-muted-foreground">
                    Para validar esta dedução, examine primeiro o Livro de entrada no arquivo do xerife e a Transcrição da fita na capela.
                  </p>
                )}
                <label className="mt-4 block text-sm" htmlFor="timeline">
                  Qual conclusão é sustentada pelas evidências?
                </label>
                <select
                  id="timeline"
                  value={timelineAnswer}
                  onChange={(e) => setTimelineAnswer(e.target.value)}
                  disabled={!canSolveTimeline}
                  className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione uma conclusão</option>
                  <option value="a">A fita prova que Eleanor nunca saiu de casa.</option>
                  <option value="b">
                    O registro de retorno contradiz o álibi de Renner; a fita também contém um
                    detalhe temporal impossível.
                  </option>
                  <option value="c">
                    O sino confirma que o encontro ocorreu na capela naquela noite.
                  </option>
                </select>
                <button
                  disabled={!canSolveTimeline || !timelineAnswer}
                  onClick={() => {
                    if (timelineAnswer === "b") setTimelineSolved(true);
                    else setMistakes((current) => current + 1);
                  }}
                  className="mt-3 border border-primary px-4 py-2 font-mono text-xs text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  CONFERIR DEDUÇÃO
                </button>
                {timelineAnswer && timelineAnswer !== "b" && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {difficulty === "investigador"
                      ? "Releia o livro de entrada e lembre-se: o sino estava quebrado."
                      : "Essa conclusão não explica todas as contradições do arquivo."}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-primary">
                Dedução confirmada: o álibi de Renner não se sustenta e a gravação não pode ser
                interpretada literalmente.
              </p>
            )}
          </div>
          <div className="border border-border p-4 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              Análise forense · Dexter
            </p>
            <h2 className="mt-2 font-display text-2xl">O detalhe que não combina</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A ausência de sangue no corredor, o detergente nas mãos e a tinta azul sob as unhas
              sugerem que a vítima tocou em algo pouco antes de morrer.
            </p>
            <button
              onClick={() => setHintDialog({ id: "forensics", hint: "Procure outro item do caso que tenha tinta azul. O vestígio sob as unhas de Eleanor pode conectar a vítima ao depósito.", revealed: false })}
              className="mt-3 border border-border px-3 py-2 font-mono text-xs text-primary transition hover:border-primary"
            >
              DICAS
            </button>
            {!forensicSolved ? (
              <>
                {!canSolveForensics && (
                  <p className="mt-4 border-l-2 border-primary/60 pl-3 text-sm text-muted-foreground">
                    Para validar a análise, examine o Relatório preliminar no hospital e o Recibo do depósito no cais.
                  </p>
                )}
                <label className="mt-4 block text-sm" htmlFor="forensics">
                  Qual evidência conecta a vítima ao depósito?
                </label>
                <select
                  id="forensics"
                  value={forensicAnswer}
                  onChange={(e) => setForensicAnswer(e.target.value)}
                  disabled={!canSolveForensics}
                  className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione uma análise</option>
                  <option value="a">O detergente prova que Eleanor limpou a casa inteira.</option>
                  <option value="b">
                    A tinta azul sob as unhas combina com o recibo recém-impresso e limpo do
                    depósito.
                  </option>
                  <option value="c">A ausência de sangue prova que a morte foi natural.</option>
                </select>
                <button
                  disabled={!canSolveForensics || !forensicAnswer}
                  onClick={() => {
                    if (forensicAnswer === "b") setForensicSolved(true);
                    else setMistakes((current) => current + 1);
                  }}
                  className="mt-3 border border-primary px-4 py-2 font-mono text-xs text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  VALIDAR ANÁLISE
                </button>
                {forensicAnswer && forensicAnswer !== "b" && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Procure um vestígio físico que também apareça em outro item do caso.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-primary">
                Análise validada: a tinta conecta o contato de Eleanor ao recibo do depósito.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 border border-border p-4 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Conclusão do caso
          </p>
          <h2 className="mt-2 font-display text-2xl">Quem adulterou a investigação?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Selecione o suspeito e confronte sua escolha com os registros, o recibo e a análise
            forense. Uma acusação só será aceita quando as principais linhas de investigação
            estiverem concluídas.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Paul Renner", "Dr. Henry Vale", "Pastor Matthew Cole"].map((name) => (
              <button
                key={name}
                disabled={!canAccuse || ending || accusationSubmitted}
                onClick={() => setSuspect(name)}
                className={`border px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${suspect === name ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/60"}`}
              >
                {name}
              </button>
            ))}
          </div>
          <button
            disabled={!canAccuse || !suspect || ending || accusationSubmitted}
            onClick={() => {
              setAccusationSubmitted(true);
              setEnding(true);
            }}
            className="mt-5 border border-primary px-5 py-3 font-mono text-xs text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            FECHAR O CASO
          </button>
          {!canAccuse && !ending && !accusationSubmitted && (
            <p className="mt-3 text-xs text-muted-foreground">
              Para concluir, examine todas as seis evidências, abra os dois mecanismos e valide a cronologia e a análise forense. A acusação final só poderá ser feita uma vez.
            </p>
          )}
          {ending && (
            <div role="status" className="mt-5 border border-primary/60 bg-primary/5 p-5">
              {suspect === "Paul Renner" ? (
                <>
                  <p className="font-mono text-xs uppercase tracking-widest text-primary">
                    Caso reconstruído
                  </p>
                  <h3 className="mt-2 font-display text-2xl">O álibi era a última mentira</h3>
                  <p className="mt-3 text-sm leading-relaxed">
                    Renner usou seu retorno não registrado para voltar à casa de Eleanor, limpou a
                    cena e alterou o arquivo. A tinta azul e o recibo do depósito ligam a vítima à
                    caixa escondida; a fita foi deixada para que alguém percebesse a contradição do
                    sino. A investigação oficial terminou cedo demais — e agora Dexter sabe por quê.
                  </p>
                  <p className="mt-4 font-mono text-xs text-primary">
                    EVIDÊNCIAS REGISTRADAS: {found.length}/{EVIDENCE.length}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {allFound
                      ? "Arquivo completo: todas as evidências foram examinadas."
                      : "O caso foi resolvido, mas ainda existem evidências não examinadas neste arquivo."}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-xs uppercase tracking-widest text-primary">
                    Conclusão inconsistente
                  </p>
                  <h3 className="mt-2 font-display text-2xl">
                    A acusação não se sustenta
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Você encerrou a investigação apontando {suspect}, mas as provas não sustentam essa conclusão. A acusação foi registrada e não pode ser tentada novamente nesta partida. Se quiser investigar de novo, reinicie o caso e reúna as evidências antes de decidir.
                  </p>
                </>
              )}
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-mono text-xs uppercase tracking-widest text-primary">Classificação final</p>
                <p className="mt-2 font-display text-2xl">{finalRank}</p>
                <p className="mt-2 text-sm">Pontuação: <strong>{score}/100</strong></p>
                <p className="mt-1 text-xs text-muted-foreground">Dicas: {hintsUsed.length} × 15 = {hintsUsed.length * 15} pontos · erros: {mistakes} × 5 = {mistakes * 5} pontos de penalidade.</p>
              </div>
            </div>
          )}
        </section>
        {hintDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="hint-dialog-title"
              className="w-full max-w-md border border-primary/60 bg-background p-6 shadow-2xl"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Caderno de investigação</p>
              <h2 id="hint-dialog-title" className="mt-3 font-display text-2xl">
                {hintDialog.revealed ? "Dica desbloqueada" : "Antes de pedir uma dica"}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {hintDialog.revealed
                  ? hintDialog.hint
                  : "Só utilize dicas se realmente não conseguir resolver sozinho. Cada dica aberta reduz 15 pontos; cada código ou dedução validada incorretamente reduz mais 5 pontos."}
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => setHintDialog(null)}
                  className="border border-border px-4 py-3 font-mono text-xs transition hover:border-primary"
                >
                  {hintDialog.revealed ? "FECHAR" : "VOLTAR"}
                </button>
                {!hintDialog.revealed && (
                  <button
                    onClick={() => {
                      if (hintDialog && !hintsUsed.includes(hintDialog.id)) {
                        setHintsUsed((current) => current.includes(hintDialog.id) ? current : [...current, hintDialog.id]);
                      }
                      setHintDialog((current) => current ? { ...current, revealed: true } : null);
                    }}
                    className="border border-primary bg-primary/10 px-4 py-3 font-mono text-xs text-primary transition hover:bg-primary/20"
                  >
                    ABRIR DICA
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
        <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border pt-4 font-mono text-[10px] text-muted-foreground">
          <span>DEXTER MORGAN · CADERNO DE INVESTIGAÇÃO</span>
          <button
            onClick={() => {
              resetCase();
            }}
            className="underline hover:text-primary"
          >
            REINICIAR CASO
          </button>
        </footer>
      </div>
    </main>
  );
}
