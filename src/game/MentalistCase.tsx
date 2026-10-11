import { useCallback, useEffect, useRef, useState } from "react";
import { recordCaseCompletion } from "./achievements";
import { HarryCodePanel } from "./HarryCodePanel";
import { finishCaseTimer } from "./caseTimer";

type Difficulty = "investigador" | "detetive" | "dexter";
type Clue = { id: string; title: string; place: string; text: string };

const DIFFICULTIES: { id: Difficulty; title: string; subtitle: string; details: string }[] = [
  { id: "investigador", title: "Investigador", subtitle: "Fácil", details: "Pistas mais orientadas, dicas de Jane e requisitos mais acessíveis." },
  { id: "detetive", title: "Detetive", subtitle: "Normal", details: "Cruze evidências, examine contradições e escolha cuidadosamente os suspeitos." },
  { id: "dexter", title: "Dexter", subtitle: "Difícil", details: "Investigue tudo, interrogue todos e resolva conexões sem depender de dicas." },
];

const CLUES: Clue[] = [
  {
    id: "smile",
    title: "O sorriso na parede",
    place: "Cena do crime",
    text: "Um rosto sorridente foi desenhado com tinta vermelha perto do corpo. A marca foi feita depois da morte, mas o traço interrompe-se onde havia uma camada recente de poeira: o autor conhecia a sala antes de o crime acontecer.",
  },
  {
    id: "feather",
    title: "Fibra de uniforme",
    place: "Cena do crime",
    text: "Uma fibra azul-escura ficou presa na fita adesiva usada para isolar a porta. O tecido corresponde a um uniforme de serviço do condado — não a uma roupa civil.",
  },
  {
    id: "call",
    title: "Registro telefônico",
    place: "Central de comunicações",
    text: "O telefone da vítima recebeu uma chamada de um aparelho descartável às 21h14. O mesmo aparelho ligou para uma linha interna do gabinete do xerife quatro minutos depois.",
  },
  {
    id: "photo",
    title: "Fotografia antiga",
    place: "Arquivo do CBI",
    text: "Na fotografia de um antigo encontro de investigadores, três suspeitos aparecem juntos. No verso, uma anotação a lápis: 'Quem controla o arquivo controla a versão oficial'.",
  },
  {
    id: "bird",
    title: "Penas no carro",
    place: "Estacionamento do condado",
    text: "Penas de pombo foram encontradas no tapete do carro ligado ao suspeito. Patrick Jane observa que alguém que teme aves pode ter tentado removê-las às pressas — um detalhe comportamental, não uma prova isolada.",
  },
  {
    id: "ledger",
    title: "Livro de acesso",
    place: "Gabinete do xerife",
    text: "O livro registra uma entrada apagada às 20h52. A pressão do lápis ainda é visível no papel: a rubrica começa com 'T. Mc...' e o horário foi alterado após o fechamento do plantão.",
  },
];

const SUSPECTS = [
  {
    id: "mcallister",
    name: "Thomas McAllister",
    role: "Xerife do condado",
    detail:
      "Acesso a registros, uniformes e recursos locais. Seu nome aparece parcialmente no livro de acesso.",
  },
  {
    id: "bertram",
    name: "Gale Bertram",
    role: "Diretor do CBI",
    detail: "Poderia manipular investigações e tinha contato com os principais investigadores.",
  },
  {
    id: "stiles",
    name: "Bret Stiles",
    role: "Líder da Visualize",
    detail: "Possui influência e seguidores capazes de obter informações confidenciais.",
  },
];

export function MentalistCase({
  onBack,
  soundOn,
  onToggleSound,
}: {
  onBack: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [selectedClues, setSelectedClues] = useState<string[]>([]);
  const [interviewed, setInterviewed] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showJane, setShowJane] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [harryLine, setHarryLine] = useState<string | null>(null);
  const [ambientOn, setAmbientOn] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(() => {
    if (typeof window === "undefined") return 0.32;
    const saved = window.localStorage.getItem("dexter-mentalist-ambient-volume");
    if (saved === null) return 0.32;
    const parsed = Number(saved);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.32;
  });
  const ambientRef = useRef<{
    context: AudioContext;
    sources: AudioScheduledSourceNode[];
    gains: GainNode[];
  } | null>(null);

  const stopAmbient = useCallback(() => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    ambient.sources.forEach((source) => source.stop());
    ambientRef.current = null;
    void ambient.context.close();
  }, []);

  const startAmbient = useCallback(
    (force = false) => {
      if ((!ambientOn && !force) || ambientRef.current || typeof window === "undefined") return;
      const context = new AudioContext();
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * 0.16;
      }

      const roomTone = context.createBufferSource();
      roomTone.buffer = buffer;
      roomTone.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1150;
      const roomGain = context.createGain();
      roomGain.gain.value = 0.026 * ambientVolume;
      roomTone.connect(filter).connect(roomGain).connect(context.destination);

      const hum = context.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 52;
      const humGain = context.createGain();
      humGain.gain.value = 0.008 * ambientVolume;
      hum.connect(humGain).connect(context.destination);

      roomTone.start();
      hum.start();
      ambientRef.current = { context, sources: [roomTone, hum], gains: [roomGain, humGain] };
    },
    [ambientOn, ambientVolume],
  );

  useEffect(() => () => stopAmbient(), [stopAmbient]);

  useEffect(() => {
    if (!ambientOn) stopAmbient();
  }, [ambientOn, stopAmbient]);

  useEffect(() => {
    if (!ambientOn || ambientRef.current) return;
    const activateAmbient = () => startAmbient();
    window.addEventListener("pointerdown", activateAmbient, { once: true });
    return () => window.removeEventListener("pointerdown", activateAmbient);
  }, [ambientOn, startAmbient]);

  useEffect(() => {
    if (ambientRef.current) {
      const [roomGain, humGain] = ambientRef.current.gains;
      if (roomGain) roomGain.gain.value = 0.026 * ambientVolume;
      if (humGain) humGain.gain.value = 0.008 * ambientVolume;
    }
  }, [ambientVolume]);

  useEffect(() => {
    window.localStorage.setItem("dexter-mentalist-ambient-volume", String(ambientVolume));
  }, [ambientVolume]);

  const toggleAmbient = () => {
    if (ambientOn) {
      stopAmbient();
      setAmbientOn(false);
    } else {
      setAmbientOn(true);
      startAmbient(true);
    }
  };

  const allCoreClues = (difficulty === "dexter" ? CLUES.map((clue) => clue.id) : ["call", "ledger", "feather"]).every((id) => found.includes(id));
  const connectionsSolved =
    selectedClues.includes("call+ledger") && selectedClues.includes("feather+ledger");

  const collect = (id: string) => {
    startAmbient();
    if (!found.includes(id)) setFound((current) => [...current, id]);
    setHarryLine(
      "Um comportamento pode orientar a investigação; a prova material precisa sustentá-lo.",
    );
    setFeedback("Evidência adicionada ao quadro de investigação.");
  };

  const connect = (pair: string) => {
    startAmbient();
    if (selectedClues.includes(pair)) return;
    const valid = pair === "call+ledger" || pair === "feather+ledger";
    if (valid) {
      setSelectedClues((current) => [...current, pair]);
      setHarryLine(
        "Conexão confirmada. Agora veja se uma fonte independente sustenta a mesma sequência.",
      );
      setFeedback(
        pair === "call+ledger"
          ? "Patrick: 'A ligação à linha interna e a entrada apagada se confirmam. Alguém dentro do gabinete orientou o crime.'"
          : "Patrick: 'A fibra do uniforme e o acesso adulterado apontam para alguém com autoridade local.'",
      );
    } else {
      setHarryLine("Não junte peças só porque parecem combinar. Procure um elo verificável.");
      setMistakes((current) => current + 1);
      setFeedback(
        "A conexão ainda não sustenta uma conclusão. Cruze evidências físicas com registros verificáveis.",
      );
    }
  };

  const interview = (id: string) => {
    startAmbient();
    if (!interviewed.includes(id)) setInterviewed((current) => [...current, id]);
    const lines: Record<string, string> = {
      mcallister:
        "McAllister diz que não entrou no gabinete depois das 20h. Ao responder, pergunta quem teve acesso ao livro — antes de Dexter mencionar o registro apagado.",
      bertram:
        "Bertram admite que a investigação foi compartilhada com o gabinete do xerife, mas afirma que não esteve em Miami naquela noite.",
      stiles:
        "Stiles diz que influência não é o mesmo que presença. Ele confirma que a vítima estava investigando uma rede interna de proteção.",
    };
    setHarryLine("Observe o que o suspeito sabe antes de você apresentar a evidência.");
    setFeedback(lines[id] ?? "");
  };

  const accuse = () => {
    startAmbient();
    const requiredInterviews = difficulty === "dexter" ? 3 : difficulty === "investigador" ? 1 : 2;
    if (!allCoreClues || !connectionsSolved || interviewed.length < requiredInterviews) {
      setHarryLine(
        "Uma acusação não substitui o trabalho que ainda falta. Complete as conexões e os depoimentos.",
      );
      setMistakes((current) => current + 1);
      setFeedback(
        "Ainda faltam elementos: reúna a fibra, o registro de acesso e o telefonema; confirme as conexões e interrogue pelo menos dois suspeitos.",
      );
      return;
    }
    const correct = answer === "mcallister";
    if (!correct) {
      setHarryLine("Intuição não é veredito. Volte às provas que a hipótese precisa explicar.");
      setMistakes((current) => current + 1);
      setFeedback(
        "A acusação não fecha com as provas reunidas. Patrick pede que você reavalie os depoimentos e escolha novamente; intuição não substitui evidência.",
      );
      return;
    }
    setFinished(true);
    setHarryLine(
      "Você fez o comportamento coincidir com evidências verificáveis. É assim que se evita uma suspeita vazia.",
    );
    const correctActions = found.length + selectedClues.length + interviewed.length + 1;
    recordCaseCompletion({
      caseId: "mentalist",
      score: Math.max(0, 100 - mistakes * (difficulty === "investigador" ? 5 : 8) - (hint ? 12 : 0) - (difficulty === "dexter" ? 0 : difficulty === "detetive" ? 5 : 10)),
      hints: hint ? 1 : 0,
      mistakes,
      correctConclusion: true,
      elapsedSeconds: finishCaseTimer("mentalist"),
      correctActions,
      totalActions: correctActions + mistakes,
    });
    setFeedback(
      "DEXTER: A autoridade que controlava a cena tentou controlar também a narrativa. JANE: Exatamente. Thomas McAllister é Red John.",
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/50 pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Arquivo confidencial · Crossover
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">
              Red John: O Sorriso Escarlate
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Dexter Morgan precisa recorrer a Patrick Jane quando uma assinatura de Red John surge
              numa cena em Miami. Caso inspirado no arco mais famoso de O Mentalista; esta
              investigação é uma história original do jogo.
            </p>
          </div>
          <button
            onClick={onBack}
            className="min-h-11 border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-primary"
          >
            ← Voltar aos capítulos
          </button>
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-3 border border-border bg-card/30 p-3">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className="min-h-10 border border-primary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-primary"
          >
            Trilha: {soundOn ? "ligada" : "desligada"}
          </button>
          <button
            type="button"
            onClick={toggleAmbient}
            aria-pressed={ambientOn}
            className="min-h-10 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-primary"
          >
            Ambiente: {ambientOn ? "ligado" : "desligado"}
          </button>
          <label className="flex min-h-10 items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Volume ambiente
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              aria-label="Volume do som ambiente"
              onChange={(event) => setAmbientVolume(Number(event.target.value))}
              className="w-24 accent-primary"
            />
            <span>{Math.round(ambientVolume * 100)}%</span>
          </label>
          <p className="basis-full text-xs text-muted-foreground">
            O som ambiente e a trilha podem tocar separadamente ou juntos.
          </p>
        </div>

        <HarryCodePanel line={harryLine} onDismiss={() => setHarryLine(null)} />

        <section className="mt-6 overflow-hidden border border-primary/40 bg-card/40">
          <img src="/images/red-john-investigation.webp" alt="Dexter Morgan e Patrick Jane analisam juntos o sorriso vermelho de Red John numa parede coberta de pistas" className="block max-h-[560px] w-full object-cover object-center" />
          <div className="p-4 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Briefing · Dexter + Patrick Jane
          </p>
          <p className="mt-3 leading-relaxed">
            Uma testemunha ligada a uma antiga investigação foi encontrada morta, e o sorriso
            vermelho reapareceu. Dexter percebe que o assassino conhece procedimentos policiais por
            dentro. Jane aceita ajudar, mas avisa: uma boa leitura comportamental só vale quando é
            confirmada por evidências.
          </p>
          <button
            onClick={() => {
              startAmbient();
              setShowJane((current) => !current);
            }}
            className="mt-4 min-h-10 border border-primary px-4 py-2 font-mono text-xs text-primary hover:bg-primary/10"
          >
            {showJane ? "Ocultar análise de Jane" : "Ouvir a análise inicial de Patrick Jane"}
          </button>
          {showJane && (
            <blockquote className="mt-4 border-l-2 border-primary pl-4 text-sm italic">
              “Não procure o suspeito mais assustador. Procure quem sabe o que a polícia vai fazer
              antes de a polícia decidir fazê-lo. E depois prove.” — Patrick Jane
            </blockquote>
          )}
          </div>
        </section>

        {difficulty === null ? (
          <section className="mt-6 border border-primary/50 bg-card/40 p-4 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Seleção de dificuldade</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">Escolha como vai caçar Red John</h2>
            <p className="mt-2 text-sm text-muted-foreground">A dificuldade altera os requisitos para fechar o caso e a pontuação final.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {DIFFICULTIES.map((item) => (
                <button key={item.id} onClick={() => setDifficulty(item.id)} className="min-h-40 border border-border bg-background/40 p-4 text-left transition hover:border-primary hover:bg-primary/5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{item.subtitle}</span>
                  <span className="mt-2 block font-display text-2xl">{item.title}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{item.details}</span>
                  <span className="mt-4 block font-mono text-xs uppercase tracking-wider text-primary">Selecionar →</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
        <>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-primary/40 bg-primary/5 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">Dificuldade: {DIFFICULTIES.find((item) => item.id === difficulty)?.title}</p>
          <button onClick={() => setDifficulty(null)} className="min-h-9 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-primary">Trocar dificuldade</button>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border border-border bg-card/30 p-4 sm:p-6">
            <h2 className="font-display text-2xl">1. Recolha de evidências</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Examine cada local e adicione os itens ao quadro. Leia o texto completo antes de
              concluir.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {CLUES.map((clue) => (
                <article
                  key={clue.id}
                  className={`border p-4 ${found.includes(clue.id) ? "border-primary bg-primary/5" : "border-border bg-background/40"}`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    {clue.place}
                  </p>
                  <h3 className="mt-2 font-display text-lg">{clue.title}</h3>
                  {found.includes(clue.id) && (
                    <p className="mt-2 text-sm leading-relaxed">{clue.text}</p>
                  )}
                  <button
                    onClick={() => collect(clue.id)}
                    disabled={found.includes(clue.id)}
                    className="mt-3 min-h-9 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-primary disabled:opacity-50"
                  >
                    {found.includes(clue.id) ? "Coletada" : "Examinar evidência"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="border border-border bg-card/30 p-4 sm:p-6">
              <h2 className="font-display text-2xl">2. Quadro de conexões</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Colete as evidências primeiro. Depois, cruze os registros.
              </p>
              <div className="mt-4 grid gap-2">
                <button
                  disabled={!found.includes("call") || !found.includes("ledger")}
                  onClick={() => connect("call+ledger")}
                  className="min-h-11 border border-border p-3 text-left text-sm hover:border-primary disabled:opacity-40"
                >
                  Registro telefônico + livro de acesso
                </button>
                <button
                  disabled={!found.includes("feather") || !found.includes("ledger")}
                  onClick={() => connect("feather+ledger")}
                  className="min-h-11 border border-border p-3 text-left text-sm hover:border-primary disabled:opacity-40"
                >
                  Fibra de uniforme + livro de acesso
                </button>
              </div>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                Conexões confirmadas: {selectedClues.length}/2 necessárias
              </p>
            </section>

            <section className="border border-border bg-card/30 p-4 sm:p-6">
              <h2 className="font-display text-2xl">3. Interrogatórios</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fale com pelo menos dois suspeitos e observe o que cada um sabe antes de ser
                perguntado.
              </p>
              <div className="mt-4 space-y-3">
                {SUSPECTS.map((suspect) => (
                  <article key={suspect.id} className="border border-border p-3">
                    <p className="font-display text-lg">{suspect.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      {suspect.role}
                    </p>
                    <p className="mt-2 text-sm">{suspect.detail}</p>
                    <button
                      onClick={() => interview(suspect.id)}
                      className="mt-3 min-h-9 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-primary"
                    >
                      {interviewed.includes(suspect.id) ? "Rever depoimento" : "Interrogar"}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="border border-primary/50 bg-card/40 p-4 sm:p-6">
              <h2 className="font-display text-2xl">4. Conclusão conjunta</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Dexter exige provas materiais. Jane ajuda a interpretar os comportamentos, mas a
                decisão final é sua.
              </p>
              <div className="mt-4 space-y-3">
                {SUSPECTS.map((suspect) => (
                  <label
                    key={suspect.id}
                    className="flex cursor-pointer items-start gap-3 border border-border p-3"
                  >
                    <input
                      type="radio"
                      name="red-john-suspect"
                      value={suspect.id}
                      checked={answer === suspect.id}
                      onChange={() => setAnswer(suspect.id)}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      <strong>{suspect.name}</strong>
                      <span className="block text-xs text-muted-foreground">{suspect.role}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={hint}
                  onChange={(event) => setHint(event.target.checked)}
                  className="mt-1 accent-primary"
                />{" "}
                Usar uma dica de Patrick Jane (reduz a pontuação)
              </label>
              {hint && (
                <p className="mt-2 border-l-2 border-primary pl-3 text-sm">
                  A ligação interna, a fibra de uniforme e o livro adulterado convergem para alguém
                  que controla os recursos locais.
                </p>
              )}
              <button
                onClick={accuse}
                disabled={finished}
                className="mt-5 min-h-12 w-full border border-primary bg-primary/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                {finished ? "Conclusão registrada" : "Confirmar acusação"}
              </button>
              {finished && (
                <p className="mt-3 text-sm font-semibold">
                  {answer === "mcallister" ? "Caso resolvido." : "A acusação falhou."}
                </p>
              )}
            </section>
          </div>
        </div>

        </>
        )}

        {feedback && (
          <p
            role="status"
            className="mt-6 border border-primary/40 bg-primary/5 p-4 text-sm leading-relaxed"
          >
            {feedback}
          </p>
        )}
        <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
          <span>
            EVIDÊNCIAS COLETADAS: {found.length}/{CLUES.length}
          </span>
          <span>INTERROGATÓRIOS: {interviewed.length}/3</span>
          <span>ERROS: {mistakes}</span>
          <span>CONEXÕES: {selectedClues.length}/2</span>
        </footer>
      </div>
    </main>
  );
}
