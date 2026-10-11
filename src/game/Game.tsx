import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CIPHER_KEY,
  CIPHER_TEXT,
  DOAKES_WINDOWS,
  DOCS,
  END_MIN,
  LOCATION_NAMES,
  START_MIN,
  caesar,
  fmtClock,
  type DocId,
  type LocationId,
} from "./data";
import { MonroeCase } from "./MonroeCase";
import { DexterCase } from "./DexterCase";
import aberturaAudio from "@/assets/abertura-dexter.mp3.asset.json";

type PuzzleId =
  | "sangue"
  | "relatorio"
  | "hora"
  | "contradicao"
  | "janela"
  | "fechadura"
  | "cifra"
  | "luva"
  | "vestigio"
  | "rede"
  | "caderno"
  | "segredo"
  | "reacao";
type ImageId = "blood-trail" | "autopsy-report" | "glove-bag" | "harry-notebook";
type Modal =
  | { kind: "doc"; id: DocId }
  | { kind: "puzzle"; id: PuzzleId }
  | { kind: "image"; id: ImageId }
  | { kind: "acusar" }
  | null;
type InfoModal = "como-jogar" | "dicas" | null;
type Ending = { title: string; text: string; good: boolean } | null;

const initial = () => ({
  loc: "lab" as LocationId,
  clock: START_MIN,
  suspicion: 0,
  mistakes: 0,
  hintsUsed: 0,
  docs: [] as DocId[],
  solved: [] as PuzzleId[],
  flags: { tellezIncriminado: false, horaFalsa: false },
  log: [
    "23:00 — Mais um turno da noite. O caso Ortega foi arquivado rápido demais. O Passageiro Sombrio não gosta disso.",
  ] as string[],
});

const SCENE_IMAGES: Record<LocationId, { src: string; alt: string }> = {
  lab: {
    src: "/images/scene-lab.jpg",
    alt: "Laboratório forense de Miami durante uma noite chuvosa",
  },
  corredor: {
    src: "/images/scene-homicide-corridor.jpg",
    alt: "Corredor noturno da divisão de Homicídios de Miami",
  },
  evidencias: {
    src: "/images/scene-evidence-room.jpg",
    alt: "Sala de evidências da polícia com armários e prateleiras",
  },
  apartamento: {
    src: "/images/scene-dexter-apartment.jpg",
    alt: "Apartamento de Dexter com vista noturna para Miami",
  },
};

type InvestigatorScore = {
  points: number;
  rank: string;
  solvedPoints: number;
  timePoints: number;
  disciplinePoints: number;
};

function getInvestigatorScore(state: ReturnType<typeof initial>): InvestigatorScore {
  const solvedPoints = Math.round((state.solved.length / 13) * 60);
  const timePoints = Math.round(
    Math.max(0, Math.min(1, (END_MIN - state.clock) / (END_MIN - START_MIN))) * 20,
  );
  const disciplinePoints = Math.max(
    0,
    20 - state.mistakes * 3 - state.hintsUsed * 4 - state.suspicion * 4,
  );
  const points = Math.max(0, Math.min(100, solvedPoints + timePoints + disciplinePoints));
  const rank =
    points >= 90
      ? "Analista Fantasma"
      : points >= 75
        ? "Detetive de Homicídios"
        : points >= 55
          ? "Investigador de Campo"
          : points >= 35
            ? "Sob Vigilância"
            : "Ponta Solta";
  return { points, rank, solvedPoints, timePoints, disciplinePoints };
}

export function Game() {
  const [s, setS] = useState(initial);
  const [modal, setModal] = useState<Modal>(null);
  const [ending, setEnding] = useState<Ending>(null);
  const [tab, setTab] = useState<"cena" | "caderno">("cena");
  const [infoModal, setInfoModal] = useState<InfoModal>(null);
  const [hintConfirmed, setHintConfirmed] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window === "undefined") return 0.28;
    const saved = Number(window.localStorage.getItem("dexter-music-volume"));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.28;
  });
  const [ambientVolume, setAmbientVolume] = useState(() => {
    if (typeof window === "undefined") return 0.28;
    const saved = Number(window.localStorage.getItem("dexter-ortega-ambient-volume"));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.28;
  });
  const [caseMode, setCaseMode] = useState<"ortega" | "monroe" | "painscreek">("ortega");
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundOnRef = useRef(soundOn);
  const musicVolumeRef = useRef(musicVolume);
  const reflectionModalOpenRef = useRef(false);
  const sfxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    musicVolumeRef.current = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    const startMusic = () => {
      if (!soundOnRef.current) return;
      void audio.play().catch(() => {
        // O navegador pode bloquear o áudio até uma interação explícita.
      });
    };

    window.addEventListener("pointerdown", startMusic, { once: true });
    return () => {
      window.removeEventListener("pointerdown", startMusic);
      audio.pause();
      audio.onerror = null;
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = showIntro
      ? aberturaAudio.url
      : !showMenu && caseMode === "painscreek"
        ? "/audio/painscreek/painscreek-case-theme.mp3"
        : "/audio/DexterEndingThemeSong-GhastlyCarrot-HomeoftheRandom.mp3";
    const trackUrl = new URL(track, window.location.href).href;
    if (audio.src !== trackUrl) {
      audio.pause();
      audio.src = track;
      audio.load();
    }
    audio.volume = musicVolumeRef.current;
    if (showIntro) {
      audio.onerror = () => {
        // Mantém a abertura sonora mesmo se o arquivo personalizado ainda não estiver publicado.
        audio.onerror = null;
        audio.src = "/audio/DexterEndingThemeSong-GhastlyCarrot-HomeoftheRandom.mp3";
        audio.load();
        if (soundOnRef.current) void audio.play().catch(() => undefined);
      };
    } else {
      audio.onerror = null;
    }

    if (soundOnRef.current) {
      // Tenta o autoplay; navegadores que o bloquearem aguardam a primeira interação.
      void audio.play().catch(() => undefined);
    }

    return () => {
      audio.onerror = null;
      void sfxRef.current?.close();
      sfxRef.current = null;
    };
  }, [caseMode, showIntro, showMenu]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    window.localStorage.setItem("dexter-music-volume", String(musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    window.localStorage.setItem("dexter-ortega-ambient-volume", String(ambientVolume));
  }, [ambientVolume]);

  const toggleSound = () => {
    setSoundOn((current) => {
      const next = !current;
      if (next && !reflectionModalOpenRef.current) {
        void audioRef.current?.play().catch(() => undefined);
      } else audioRef.current?.pause();
      return next;
    });
  };

  const handleReflectionModalOpenChange = (open: boolean) => {
    reflectionModalOpenRef.current = open;
    if (open) audioRef.current?.pause();
    else if (soundOnRef.current) void audioRef.current?.play().catch(() => undefined);
  };

  if (showIntro) {
    return (
      <IntroScreen
        onStart={() => setShowIntro(false)}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    );
  }

  if (showMenu) {
    return (
      <MainMenu
        onSelect={(nextCase) => {
          setCaseMode(nextCase);
          setShowMenu(false);
        }}
        musicVolume={musicVolume}
        onMusicVolumeChange={setMusicVolume}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onReflectionModalOpenChange={handleReflectionModalOpenChange}
      />
    );
  }

  if (caseMode === "monroe") {
    return <MonroeCase onBack={() => setShowMenu(true)} />;
  }

  if (caseMode === "painscreek") {
    return <DexterCase onBack={() => setShowMenu(true)} />;
  }

  const playSfx = (kind: "click" | "evidence" | "success" | "error") => {
    if (!soundOn || typeof window === "undefined") return;
    const context = sfxRef.current ?? new AudioContext();
    sfxRef.current = context;
    void context.resume();
    const profiles = {
      click: [{ frequency: 520, duration: 0.06, delay: 0 }],
      evidence: [
        { frequency: 330, duration: 0.1, delay: 0 },
        { frequency: 494, duration: 0.18, delay: 0.08 },
      ],
      success: [
        { frequency: 392, duration: 0.1, delay: 0 },
        { frequency: 523, duration: 0.1, delay: 0.09 },
        { frequency: 659, duration: 0.18, delay: 0.18 },
      ],
      error: [
        { frequency: 220, duration: 0.12, delay: 0 },
        { frequency: 165, duration: 0.2, delay: 0.11 },
      ],
    } as const;
    const now = context.currentTime;
    profiles[kind].forEach(({ frequency, duration, delay }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + delay;
      oscillator.type = kind === "error" ? "sawtooth" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, 0.07 * (ambientVolume / 0.28)),
        start + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    });
  };

  const openImage = (id: ImageId) => {
    playSfx("evidence");
    setModal({ kind: "image", id });
  };

  const has = (d: DocId) => s.docs.includes(d);
  const done = (p: PuzzleId) => s.solved.includes(p);

  const hint = !done("sangue")
    ? "No laboratório, clique na miniatura 'Ver fotografia da cena e descrição'. Observe as características das gotas: a forma delas indica o ritmo do movimento."
    : !done("relatorio")
      ? "Examine o relatório do legista e marque o campo que não combina com as medições da cena."
      : !done("hora")
        ? "Compare a temperatura registrada com a temperatura normal e a tabela encontrada no laboratório."
        : !done("contradicao")
          ? "Cruze o depoimento de Ruiz com um registro oficial de horário. Uma frase não combina com o que está no papel."
          : !done("janela")
            ? "Os registros da sala de evidências revelam um padrão de ronda. Não é preciso adivinhar: observe os horários."
            : !done("fechadura")
              ? "Uma anotação encontrada no laboratório descreve a regra da fechadura. Leia os documentos antes de tentar."
              : !done("cifra")
                ? "A mensagem pede uma chave numérica. Procure uma data que já apareceu durante a investigação."
                : !done("rede")
                  ? "Uma rede só é confiável quando nome, endereço e horário apontam para a mesma história."
                  : !done("segredo")
                    ? "O Código de Harry fala em não deixar pontas soltas. Examine lugares pessoais com cuidado."
                    : !done("reacao")
                      ? "Uma mensagem anônima pode ser uma armadilha. Preserve as provas verificáveis antes de reagir."
                      : "Compare tamanho, tipo sanguíneo e localização. A evidência mais chamativa nem sempre é a mais confiável.";

  function narrate(
    text: string,
    extra: Partial<ReturnType<typeof initial>> = {},
    minutes = 0,
    susp = 0,
  ) {
    setS((prev) => {
      const clock = (extra.clock ?? prev.clock) + minutes;
      const suspicion = prev.suspicion + susp;
      const next = {
        ...prev,
        ...extra,
        clock,
        suspicion,
        log: [`${fmtClock(clock)} — ${text}`, ...prev.log],
      };
      if (suspicion >= 3)
        setEnding({
          good: false,
          title: "Doakes te pegou",
          text: '"Eu sempre soube que tinha algo errado com você, Morgan." Doakes te encontra num lugar onde um analista de sangue não deveria estar. A noite acaba numa sala de interrogatório.',
        });
      else if (clock >= END_MIN)
        setEnding({
          good: false,
          title: "Amanheceu",
          text: "O turno da manhã chega. LaGuerta assina o arquivamento do caso Ortega. O assassino continua lá fora, e você perdeu a janela.",
        });
      return next;
    });
  }

  const addDoc = (d: DocId, text: string) => {
    playSfx("evidence");
    if (has(d)) return setModal({ kind: "doc", id: d });
    narrate(text, { docs: [...s.docs, d] });
    setModal({ kind: "doc", id: d });
  };

  const solve = (p: PuzzleId, text: string, extra: Partial<ReturnType<typeof initial>> = {}) => {
    playSfx("success");
    narrate(text, { solved: [...s.solved, p], ...extra });
    setModal(null);
  };

  const fail = (text: string, minutes = 30, susp = 0) => {
    playSfx("error");
    narrate(text, { mistakes: s.mistakes + 1 }, minutes, susp);
  };

  const go = (loc: LocationId) => {
    if (loc === s.loc) return;
    narrate(`Você vai até: ${LOCATION_NAMES[loc]}.`, { loc }, 10);
    setTab("cena");
  };

  const Hot = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
    <button
      onClick={onClick}
      className="inline text-foreground underline-offset-4 decoration-primary/0 hover:underline hover:decoration-primary"
    >
      {children}
    </button>
  );

  const scenes: Record<LocationId, ReactNode> = {
    lab: (
      <>
        <p>
          O laboratório cheira a reagente e café velho. Sobre a bancada estão as{" "}
          <Hot
            onClick={() =>
              done("sangue")
                ? addDoc("versoFoto", "Você vira a foto do banheiro. Há algo escrito no verso.")
                : openImage("blood-trail")
            }
          >
            fotos da cena
          </Hot>{" "}
          do apartamento 4B, ao lado do{" "}
          <Hot
            onClick={() =>
              addDoc("legista", "Você lê o relatório do legista. Um número foi rasurado.")
            }
          >
            relatório do legista
          </Hot>
          .
        </p>
        <button
          type="button"
          onClick={() => openImage("blood-trail")}
          className="evidence-card group mt-2 block w-full max-w-xl touch-manipulation border border-white/20 bg-black/30 p-2 text-left hover:border-primary"
        >
          <img
            src="/images/evidence-blood-trail.jpg"
            alt="Fotografia forense com uma trilha de gotas de sangue pelo apartamento"
            className="h-44 w-full object-cover transition group-hover:opacity-90 sm:h-60"
          />
          <span className="mt-2 block px-1 pb-1 font-mono text-xs text-white/75">
            Ver fotografia da cena e descrição
          </span>
        </button>
        <button
          type="button"
          onClick={() => openImage("autopsy-report")}
          className="evidence-card group mt-2 block w-full max-w-xl touch-manipulation border border-white/20 bg-black/30 p-2 text-left hover:border-primary"
        >
          <img
            src="/images/evidence-autopsy-report.jpg"
            alt="Relatório do legista sobre a bancada do laboratório"
            className="h-40 w-full object-cover transition group-hover:opacity-90 sm:h-52"
          />
          <span className="mt-2 block px-1 pb-1 font-mono text-xs text-white/75">
            Ver relatório do legista e descrição
          </span>
        </button>
        <p>
          Na parede, a velha{" "}
          <Hot
            onClick={() => {
              if (!has("tabela")) addDoc("tabela", "Você copia a tabela de resfriamento.");
              else setModal({ kind: "puzzle", id: "hora" });
            }}
          >
            tabela de resfriamento
          </Hot>{" "}
          amarelada. O{" "}
          <Hot onClick={() => addDoc("microscopio", "Você confere a lâmina no microscópio.")}>
            microscópio
          </Hot>{" "}
          ainda está ligado, e há um papel colado no monitor de Masuka — um{" "}
          <Hot onClick={() => addDoc("masuka", "Você lê o post-it de Masuka.")}>post-it</Hot>{" "}
          amarelo.
        </p>
        {has("bilhete") && (
          <p>
            O <Hot onClick={() => setModal({ kind: "puzzle", id: "cifra" })}>computador</Hot> do
            laboratório pode rodar qualquer decifrador simples.
          </p>
        )}
        {done("cifra") && !done("rede") && (
          <p>
            No arquivo de casos antigos, nomes e endereços formam uma{" "}
            <Hot
              onClick={() => {
                if (!has("rede"))
                  addDoc("rede", "Você cruza nomes, datas e endereços no arquivo de casos.");
                setModal({ kind: "puzzle", id: "rede" });
              }}
            >
              rede que não aparece no relatório
            </Hot>
            .
          </p>
        )}
        {done("rede") && !done("reacao") && (
          <p>
            A bancada foi mexida enquanto você estava fora. A{" "}
            <Hot
              onClick={() => {
                if (!has("reacao"))
                  addDoc("reacao", "A cópia da foto sumiu. Alguém deixou uma mensagem no lugar.");
                setModal({ kind: "puzzle", id: "reacao" });
              }}
            >
              reação de quem está sendo investigado
            </Hot>{" "}
            pode revelar qual pista era perigosa.
          </p>
        )}
      </>
    ),
    corredor: (
      <>
        <p>
          A Homicídios está quase vazia. Na mesa de Debra, uma{" "}
          <Hot
            onClick={() => {
              if (!has("depRuiz"))
                narrate(
                  "Você folheia a pasta de depoimentos do caso Ortega: Ruiz, Tellez e Teresa.",
                  { docs: [...s.docs, "depRuiz", "depTellez", "depTeresa"] },
                );
              setModal({ kind: "doc", id: "depRuiz" });
              setTab("caderno");
            }}
          >
            pasta de depoimentos
          </Hot>{" "}
          e as{" "}
          <Hot onClick={() => addDoc("fichas", "Você lê as fichas dos envolvidos.")}>
            fichas dos envolvidos
          </Hot>
          .
        </p>
        <p>
          No balcão do plantão, o{" "}
          <Hot
            onClick={() => addDoc("detencao", "Você abre o livro de detenção da noite do crime.")}
          >
            livro de detenção
          </Hot>
          . O fax ainda cospe uma{" "}
          <Hot onClick={() => addDoc("ponto", "Um fax do Porto de Miami chegou para Debra.")}>
            relatório
          </Hot>
          .
        </p>
        <p>
          No quadro branco, Debra escreveu com força:{" "}
          <Hot onClick={() => setModal({ kind: "puzzle", id: "contradicao" })}>
            "QUEM ESTÁ MENTINDO?"
          </Hot>
        </p>
        <p className="text-muted-foreground italic">
          {s.suspicion === 0 &&
            "A porta da sala de Doakes está entreaberta. Ele não está olhando para você. Ainda."}
          {s.suspicion === 1 &&
            'Doakes levanta os olhos quando você passa. "Trabalhando até tarde, Morgan?"'}
          {s.suspicion >= 2 &&
            "Doakes está encostado no batente, braços cruzados, te observando sem disfarçar."}
        </p>
      </>
    ),
    evidencias: (
      <>
        <p>
          Prateleiras de metal e caixas lacradas. Junto à porta fica o{" "}
          <Hot onClick={() => addDoc("registro", "Você lê o registro de entrada da sala.")}>
            registro de entrada
          </Hot>
          . Ao fundo, a fileira de armários velhos, numerados de 1 a 30.
        </p>
        {has("versoFoto") && !done("fechadura") && (
          <p>
            O{" "}
            <Hot
              onClick={() =>
                setModal({ kind: "puzzle", id: done("janela") ? "fechadura" : "janela" })
              }
            >
              armário 17
            </Hot>{" "}
            tem uma fechadura antiga. Doakes passa por aqui o tempo todo.
          </p>
        )}
        {done("fechadura") && (
          <p>
            Dentro do armário 17: um{" "}
            <Hot onClick={() => addDoc("bilhete", "Você fotografa o bilhete cifrado.")}>
              bilhete dobrado
            </Hot>{" "}
            e uma{" "}
            <Hot onClick={() => setModal({ kind: "puzzle", id: "luva" })}>
              luva manchada de sangue
            </Hot>{" "}
            num saco plástico sem etiqueta.
          </p>
        )}
        {done("fechadura") && (
          <button
            type="button"
            onClick={() => openImage("glove-bag")}
            className="evidence-card group mt-2 block w-full max-w-xl touch-manipulation border border-white/20 bg-black/30 p-2 text-left hover:border-primary"
          >
            <img
              src="/images/evidence-glove-bag.jpg"
              alt="Luva de couro ensacada como evidência"
              className="h-40 w-full object-cover transition group-hover:opacity-90 sm:h-52"
            />
            <span className="mt-2 block px-1 pb-1 font-mono text-xs text-white/75">
              Ver luva ensacada e descrição
            </span>
          </button>
        )}
      </>
    ),
    apartamento: (
      <>
        <p>
          Seu apartamento. Silencioso, limpo, controlado. No ar-condicionado, escondida, fica a
          caixa de lâminas. Na estante, o{" "}
          <Hot onClick={() => addDoc("codigo", "Você relê o Código, como Harry ensinou.")}>
            caderno de Harry
          </Hot>
          .
        </p>
        <button
          type="button"
          onClick={() => openImage("harry-notebook")}
          className="evidence-card group mt-2 block w-full max-w-xl touch-manipulation border border-border bg-black/20 p-2 text-left hover:border-primary"
        >
          <img
            src="/images/evidence-harry-notebook.jpg"
            alt="Caderno antigo de Harry sobre a mesa do apartamento"
            className="h-40 w-full object-cover transition group-hover:opacity-90 sm:h-52"
          />
          <span className="mt-2 block px-1 pb-1 font-mono text-xs text-white/75">
            Ver caderno de Harry e descrição
          </span>
        </button>
        {has("codigo") && !done("segredo") && (
          <p>
            O filtro do ar-condicionado parece ter sido recolocado às pressas. Atrás dele há um{" "}
            <Hot
              onClick={() => {
                if (!has("compartimento"))
                  addDoc(
                    "compartimento",
                    "Você encontra um compartimento que não deveria estar ali.",
                  );
                setModal({ kind: "puzzle", id: "segredo" });
              }}
            >
              compartimento oculto
            </Hot>
            .
          </p>
        )}
        <p>
          Na mesa, você pode montar o{" "}
          <Hot onClick={() => setModal({ kind: "acusar" })}>quadro do alvo</Hot> e decidir quem vai
          para a sua mesa esta noite.
        </p>
      </>
    ),
  };

  if (ending) {
    const score = getInvestigatorScore(s);
    return (
      <Shell>
        <div className="ending-screen mx-auto max-w-2xl py-16 text-center sm:py-24">
          <p className="font-mono text-sm text-muted-foreground">{fmtClock(s.clock)}</p>
          <h1
            className={`ending-title mt-4 font-display text-5xl ${ending.good ? "text-primary" : "text-destructive"}`}
          >
            {ending.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed">{ending.text}</p>
          <section className="score-card mt-10 border border-border bg-card/80 p-5 text-left sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Avaliação da investigação
                </p>
                <h2 className="mt-2 font-display text-3xl text-primary">{score.rank}</h2>
              </div>
              <p className="font-mono text-4xl text-primary">{score.points}/100</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <ScoreMetric label="Puzzles" value={`${s.solved.length}/13`} />
              <ScoreMetric label="Erros" value={String(s.mistakes)} />
              <ScoreMetric label="Dicas" value={String(s.hintsUsed)} />
              <ScoreMetric label="Suspeita" value={`${s.suspicion}/3`} />
            </div>
            <div className="mt-5 space-y-2 font-mono text-xs text-muted-foreground">
              <p>Provas resolvidas: +{score.solvedPoints}</p>
              <p>Tempo preservado: +{score.timePoints}</p>
              <p>Disciplina investigativa: +{score.disciplinePoints}</p>
            </div>
          </section>
          <button
            className="mt-10 min-h-11 border border-border px-6 py-3 font-mono text-sm hover:bg-accent"
            onClick={() => {
              setS(initial());
              setEnding(null);
              setModal(null);
            }}
          >
            Recomeçar o turno
          </button>
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="ml-3 mt-10 min-h-11 border border-primary px-6 py-3 font-mono text-sm text-primary hover:bg-primary/10"
          >
            ← Voltar aos casos
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="game-header flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Dexter — Episódio 1
          </p>
          <h1 className="font-display text-3xl">Turno da Noite</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setInfoModal("como-jogar")}
            className="min-h-10 border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
          >
            Como jogar
          </button>
          <button
            type="button"
            onClick={() => {
              setHintConfirmed(false);
              setInfoModal("dicas");
            }}
            className="min-h-10 border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
          >
            Dicas
          </button>
          <button
            type="button"
            onClick={toggleSound}
            className="min-h-10 border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
            aria-label={soundOn ? "Desligar música" : "Ligar música"}
          >
            Som: {soundOn ? "ligado" : "desligado"}
          </button>
          <label className="flex min-h-10 items-center gap-2 border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
            Ambientação {Math.round(ambientVolume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientVolume}
              onChange={(event) => setAmbientVolume(Number(event.target.value))}
              className="w-24 accent-primary"
              aria-label="Volume da ambientação"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="min-h-10 border border-primary px-3 py-2 font-mono text-xs text-primary hover:bg-primary/10"
          >
            ← Voltar aos casos
          </button>
          <p className="clock-glow font-mono text-2xl text-primary">{fmtClock(s.clock)}</p>
        </div>
      </header>

      <nav className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs sm:flex sm:flex-wrap sm:text-sm">
        {(Object.keys(LOCATION_NAMES) as LocationId[]).map((l) => (
          <button
            key={l}
            onClick={() => go(l)}
            className={`min-h-11 border px-3 py-2 text-left ${s.loc === l ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {LOCATION_NAMES[l]}
          </button>
        ))}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 flex gap-4 font-mono text-sm">
            <button
              onClick={() => setTab("cena")}
              className={`min-h-11 ${tab === "cena" ? "text-primary" : "text-muted-foreground"}`}
            >
              Cena
            </button>
            <button
              onClick={() => setTab("caderno")}
              className={`min-h-11 ${tab === "caderno" ? "text-primary" : "text-muted-foreground"}`}
            >
              Caderno ({s.docs.length})
            </button>
          </div>
          {tab === "cena" ? (
            <div
              key={s.loc}
              className="scene-shell relative min-h-[560px] overflow-hidden border border-border bg-black text-lg leading-relaxed sm:min-h-[620px]"
            >
              <img
                src={SCENE_IMAGES[s.loc].src}
                alt={SCENE_IMAGES[s.loc].alt}
                className="scene-image absolute inset-0 h-full w-full object-cover"
              />
              <div className="scene-vignette absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/80" />
              <div className="scene-rain pointer-events-none absolute inset-0" aria-hidden="true" />
              <div className="relative z-10 space-y-4 p-5 sm:p-8">
                <h2 className="font-display text-2xl text-white">{LOCATION_NAMES[s.loc]}</h2>
                <div className="max-w-3xl space-y-4 text-white/95">{scenes[s.loc]}</div>
              </div>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {s.docs.length === 0 && (
                <p className="text-muted-foreground">Nada anotado ainda. Leia tudo.</p>
              )}
              {s.docs.map((d) => (
                <button
                  key={d}
                  onClick={() => setModal({ kind: "doc", id: d })}
                  className="border border-border bg-card p-3 text-left hover:border-primary"
                >
                  {DOCS[d].title}
                </button>
              ))}
            </div>
          )}
        </section>
        <aside>
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Pensamentos
          </h3>
          <ul className="thoughts-panel mt-3 max-h-[60vh] space-y-3 overflow-auto text-sm leading-relaxed">
            {s.log.map((l, i) => (
              <li key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                {l}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-auto border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.kind === "doc" && (
              <>
                <h2 className="font-display text-2xl">{DOCS[modal.id].title}</h2>
                <p className="mt-4 whitespace-pre-line font-mono text-sm leading-relaxed">
                  {modal.id === "bilhete" ? CIPHER_TEXT : DOCS[modal.id].body}
                </p>
              </>
            )}
            {modal.kind === "image" && modal.id === "blood-trail" && (
              <>
                <h2 className="font-display text-2xl">Fotografia da cena — trilha de sangue</h2>
                <img
                  src="/images/evidence-blood-trail.jpg"
                  alt="Fotografia forense ampliada com uma trilha de gotas de sangue"
                  className="mt-4 max-h-[55vh] w-full object-contain"
                />
                <p className="mt-4 text-sm leading-relaxed">
                  A foto mostra uma porta à esquerda, a cozinha ao centro e um corredor que termina
                  no banheiro. Observe como as gotas mudam de formato ao longo do caminho: algumas
                  são alongadas, outras mais redondas, e há uma poça no ponto final.
                </p>
                <button
                  type="button"
                  className="mt-5 min-h-11 border border-primary px-4 py-3 font-mono text-sm text-primary hover:bg-primary/10"
                  onClick={() => setModal({ kind: "puzzle", id: "sangue" })}
                >
                  Examinar as manchas
                </button>
              </>
            )}
            {modal.kind === "image" && modal.id === "autopsy-report" && (
              <>
                <h2 className="font-display text-2xl">Relatório do legista</h2>
                <img
                  src="/images/evidence-autopsy-report.jpg"
                  alt="Relatório do legista ampliado sobre a bancada do laboratório"
                  className="mt-4 max-h-[55vh] w-full object-contain"
                />
                <p className="mt-4 text-sm leading-relaxed">
                  A folha registra temperatura, ferimentos e duas fotografias de evidência. Um dos
                  números foi rasurado no original; compare o formulário com a tabela de
                  resfriamento antes de tirar qualquer conclusão.
                </p>
                <button
                  type="button"
                  className="mt-5 min-h-11 border border-primary px-4 py-3 font-mono text-sm text-primary hover:bg-primary/10"
                  onClick={() => setModal({ kind: "puzzle", id: "relatorio" })}
                >
                  Analisar o campo rasurado
                </button>
              </>
            )}
            {modal.kind === "image" && modal.id === "glove-bag" && (
              <>
                <h2 className="font-display text-2xl">Luva ensacada</h2>
                <img
                  src="/images/evidence-glove-bag.jpg"
                  alt="Luva de couro manchada ensacada como evidência"
                  className="mt-4 max-h-[55vh] w-full object-contain"
                />
                <p className="mt-4 text-sm leading-relaxed">
                  A luva tem sangue seco no dorso e um recibo do Porto de Miami ao lado. A etiqueta
                  do saco está vazia — alguém retirou a identificação antes de guardar a peça.
                </p>
                <button
                  type="button"
                  className="mt-5 min-h-11 border border-primary px-4 py-3 font-mono text-sm text-primary hover:bg-primary/10"
                  onClick={() => setModal({ kind: "puzzle", id: "vestigio" })}
                >
                  Cruzar os vestígios
                </button>
              </>
            )}
            {modal.kind === "image" && modal.id === "harry-notebook" && (
              <>
                <h2 className="font-display text-2xl">Caderno de Harry</h2>
                <img
                  src="/images/evidence-harry-notebook.jpg"
                  alt="Caderno antigo de Harry ampliado sobre a mesa do apartamento"
                  className="mt-4 max-h-[55vh] w-full object-contain"
                />
                <p className="mt-4 text-sm leading-relaxed">
                  A capa está gasta nas bordas, mas o caderno foi colocado de propósito no centro da
                  mesa. As anotações de Harry lembram que o Código começa antes da ação: observar,
                  confirmar e só então decidir.
                </p>
                <button
                  type="button"
                  className="mt-5 min-h-11 border border-primary px-4 py-3 font-mono text-sm text-primary hover:bg-primary/10"
                  onClick={() => setModal({ kind: "puzzle", id: "caderno" })}
                >
                  Aplicar o Código
                </button>
              </>
            )}
            {modal.kind === "puzzle" && <Puzzle id={modal.id} s={s} solve={solve} fail={fail} />}
            {modal.kind === "acusar" && (
              <Accuse
                onPick={(who) => {
                  const all = s.solved.length === 13;
                  if (who === "ruiz" && all)
                    setEnding({
                      good: true,
                      title: "O Código foi respeitado",
                      text: "Ruiz mentiu sobre a noite, lavou o sangue antes de chegar ao bar e plantou a luva para incriminar Tellez. No armazém nove das docas, você encontra o resto. Esta noite, o Passageiro Sombrio come. E ninguém inocente paga por isso.",
                    });
                  else if (who === "ruiz")
                    setEnding({
                      good: false,
                      title: "Ponta solta",
                      text: "Você tinha razão sobre Ruiz, mas não tinha certeza. Harry estaria decepcionado. Faltaram provas, e Ruiz percebe que está sendo seguido. Ele some de Miami antes do amanhecer.",
                    });
                  else if (who === "tellez")
                    setEnding({
                      good: false,
                      title: "Um inocente na mesa",
                      text: "Tellez estava no porto a noite toda; o ponto e a câmera provavam isso. A luva foi plantada. Você quebrou a primeira regra do Código, e o verdadeiro assassino agradece.",
                    });
                  else
                    setEnding({
                      good: false,
                      title: "A testemunha errada",
                      text: "Teresa só contou o que viu. Acusá-la não faz sentido nenhum, e o caso se fecha sem culpado.",
                    });
                }}
              />
            )}
            <button
              className="mt-6 font-mono text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setModal(null)}
            >
              fechar
            </button>
          </div>
        </div>
      )}

      {infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-auto border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {infoModal === "como-jogar" ? (
              <>
                <h2 className="font-display text-2xl">Como jogar</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed">
                  <p>
                    Leia tudo com atenção e clique nas frases interativas dentro de cada cena. As
                    pistas não aparecem como setas ou marcadores brilhantes.
                  </p>
                  <p>
                    Visite os quatro locais, abra o Caderno para rever documentos e conecte nomes,
                    horários, endereços e objetos.
                  </p>
                  <p>
                    O relógio avança quando você se desloca ou erra. A desconfiança de Doakes
                    aparece no comportamento dele, não em uma barra na tela.
                  </p>
                  <p>
                    Antes de acusar alguém, siga o Código de Harry: tenha certeza, reúna provas e
                    feche todas as pontas soltas.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl">Dicas sem spoiler</h2>
                {!hintConfirmed ? (
                  <>
                    <p className="mt-3 border-l-2 border-primary pl-3 text-sm leading-relaxed text-primary">
                      Só pegue dicas em último caso, quando você realmente não estiver conseguindo
                      resolver. Tente observar e cruzar as pistas antes de abrir esta janela.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="min-h-11 border border-primary px-4 py-3 font-mono text-sm text-primary hover:bg-primary/10"
                        onClick={() => {
                          setHintConfirmed(true);
                          setS((prev) => ({
                            ...prev,
                            hintsUsed: prev.hintsUsed + 1,
                          }));
                        }}
                      >
                        Continuar e ver dica
                      </button>
                      <button
                        type="button"
                        className="min-h-11 border border-border px-4 py-3 font-mono text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setInfoModal(null)}
                      >
                        Voltar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-sm leading-relaxed">Dica atual: {hint}</p>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      A dica acompanha seu progresso e nunca mostra diretamente a resposta, a
                      combinação ou o culpado.
                    </p>
                  </>
                )}
              </>
            )}
            <button
              className="mt-6 min-h-10 font-mono text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setInfoModal(null)}
            >
              fechar
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function IntroScreen({
  onStart,
  soundOn,
  onToggleSound,
}: {
  onStart: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0d0f] px-4 py-5 text-white sm:px-8 sm:py-8">
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center sm:max-w-[60rem]">
        <div className="mb-3 flex w-full justify-end">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Desligar música" : "Ligar música"}
            className="border border-white/25 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/80 transition hover:border-[#d52c39] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d52c39] sm:text-xs"
          >
            Som: {soundOn ? "ligado" : "desligado"}
          </button>
        </div>
        <img
          src="/images/tela-inicial.webp"
          alt="Arte original da tela inicial de Dexter"
          className="max-h-[54vh] w-full object-contain sm:max-h-[54vh]"
        />
        <div className="mt-4 flex w-full flex-col items-center border-t-4 border-[#a71925] bg-[#171719] px-5 py-6 text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)] sm:mt-5 sm:px-10 sm:py-8">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e0d8d4] sm:text-xs sm:tracking-[0.32em]">
            Uma investigação nunca termina na cena do crime
          </p>
          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none tracking-[0.04em] text-white sm:text-6xl">
            Dexter
          </h1>
          <p className="mt-2 font-mono text-lg font-extrabold uppercase tracking-[0.13em] text-[#d52c39] sm:text-2xl">
            Passageiro Sombrio
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#d5d0cd] sm:text-base">
            Todo segredo deixa vestígios. Toda escolha tem um preço.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 min-h-12 min-w-52 border-2 border-[#f4ece8] bg-[#b21f2c] px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.28em] text-white shadow-[5px_5px_0_#6f111a] transition hover:bg-[#d12a37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4ece8]"
          >
            Iniciar
          </button>
          <p className="mt-6 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#bcb4b0] sm:text-[10px] sm:tracking-[0.24em]">
            Investigue <span className="px-1.5 text-[#e13a45]">•</span> Descubra{" "}
            <span className="px-1.5 text-[#e13a45]">•</span> Decida
          </p>
        </div>
      </section>
    </main>
  );
}

function MainMenu({
  onSelect,
  musicVolume,
  onMusicVolumeChange,
  soundOn,
  onToggleSound,
  onReflectionModalOpenChange,
}: {
  onSelect: (nextCase: "ortega" | "monroe" | "painscreek") => void;
  musicVolume: number;
  onMusicVolumeChange: (value: number) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onReflectionModalOpenChange: (open: boolean) => void;
}) {
  const [showReflections, setShowReflections] = useState(false);
  const [activeVideo, setActiveVideo] = useState<1 | 2 | null>(null);

  const closeVideo = () => {
    setActiveVideo(null);
    onReflectionModalOpenChange(false);
  };
  const openVideo = (video: 1 | 2) => {
    onReflectionModalOpenChange(true);
    setActiveVideo(video);
  };

  useEffect(() => {
    if (activeVideo === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveVideo(null);
        onReflectionModalOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeVideo, onReflectionModalOpenChange]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-10 sm:py-16">
      {activeVideo !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Reflexões de Dexter Morgan — Parte ${activeVideo}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeVideo();
          }}
        >
          <div className="flex max-h-full w-full max-w-6xl flex-col">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-white sm:text-base">
                Reflexões de Dexter Morgan · Parte {activeVideo}
              </h2>
              <button
                type="button"
                onClick={closeVideo}
                className="min-h-11 border border-white/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:border-red-500 hover:bg-red-950"
              >
                Fechar ✕
              </button>
            </div>
            <video
              key={activeVideo}
              className="max-h-[78vh] w-full flex-1 bg-black"
              controls
              autoPlay
              playsInline
              preload="metadata"
              src={
                activeVideo === 1
                  ? "/videos/dexter-reflexoes/reflexao-dexter-01.mp4"
                  : "/videos/dexter-reflexoes/reflexao-dexter-02.mp4"
              }
            >
              Seu navegador não suporta reprodução de vídeo.
            </video>
            <p className="mt-3 text-center text-xs text-white/60">
              Para fechar, use o botão acima ou pressione Esc.
            </p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary sm:text-sm">
            Dexter · Passageiro Sombrio
          </p>
          <button
            type="button"
            onClick={() => setShowReflections((visible) => !visible)}
            aria-expanded={showReflections}
            className="min-h-11 border border-primary bg-primary/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.13em] text-primary transition hover:bg-primary hover:text-primary-foreground sm:text-sm"
          >
            Reflexões de Dexter Morgan {showReflections ? "−" : "+"}
          </button>
        </div>
        {showReflections && (
          <section
            className="mb-8 border border-primary/50 bg-card/60 p-4 sm:p-6"
            aria-label="Reflexões de Dexter Morgan"
          >
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              Conteúdo especial
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">Reflexões de Dexter Morgan</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha uma parte para assistir. Os dois vídeos estão disponíveis nesta seção.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openVideo(1)}
                className="min-h-14 border border-border bg-background px-5 py-4 text-left transition hover:border-primary hover:bg-primary/5"
              >
                <span className="block font-mono text-xs uppercase tracking-widest text-primary">
                  Parte 1
                </span>
                <span className="mt-1 block font-display text-xl">Reflexões · Episódio 1</span>
              </button>
              <button
                type="button"
                onClick={() => openVideo(2)}
                className="min-h-14 border border-border bg-background px-5 py-4 text-left transition hover:border-primary hover:bg-primary/5"
              >
                <span className="block font-mono text-xs uppercase tracking-widest text-primary">
                  Parte 2
                </span>
                <span className="mt-1 block font-display text-xl">Reflexões · Episódio 2</span>
              </button>
            </div>
          </section>
        )}
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
          Dexter · Arquivos de investigação
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight sm:text-7xl">
          Escolha seu caso
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Entre em um arquivo, examine documentos, ouça depoimentos e construa uma conclusão que
          sobreviva às provas.
        </p>
        <section
          className="mt-8 max-w-xl border border-border bg-card/40 p-4 sm:p-5"
          aria-label="Controles de áudio"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                Trilha sonora
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Música do Dexter</p>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              className="min-h-10 border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
              aria-label={soundOn ? "Desligar música do Dexter" : "Ligar música do Dexter"}
            >
              Música: {soundOn ? "ligada" : "desligada"}
            </button>
          </div>
          <label className="mt-4 flex min-h-10 flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
            Volume da música {Math.round(musicVolume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
              className="min-w-40 flex-1 accent-primary"
              aria-label="Volume da música do Dexter"
            />
          </label>
        </section>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <button
            onClick={() => onSelect("ortega")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Episódio 1 · Miami
            </p>
            <h2 className="mt-3 font-display text-3xl">Turno da Noite</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Reconstrua o caso Ortega durante um turno em Homicídios. Sangue, documentos e o Código
              de Harry esperam por você.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Abrir arquivo →
            </span>
          </button>
          <button
            onClick={() => onSelect("monroe")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Arquivo Greenfield · 20/05/2023
            </p>
            <h2 className="mt-3 font-display text-3xl">O Caso Monroe</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Um dossiê em quatro objetivos, com interrogatórios completos, áudios opcionais, cifras
              e relatório final alternativo.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Abrir dossiê →
            </span>
          </button>
          <button
            onClick={() => onSelect("painscreek")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Arquivo especial · Greybridge
            </p>
            <h2 className="mt-3 font-display text-3xl">Dexter: The Painscreek Case</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Explore locais, examine documentos, destranque mecanismos e conecte evidências
              forenses para reconstruir um caso arquivado.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Escolher dificuldade e iniciar →
            </span>
          </button>
        </div>
        <div className="mt-8 border border-border p-5 font-mono text-xs text-muted-foreground">
          <p>ARQUIVOS DISPONÍVEIS: 03</p>
          <p className="mt-2">NOVO ARQUIVO: Dexter: The Painscreek Case · disponível</p>
        </div>
      </div>
    </main>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-3 py-4 text-foreground sm:px-10 sm:py-8">
      {children}
    </main>
  );
}

function ScoreMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/70 bg-background/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg text-foreground">{value}</p>
    </div>
  );
}

type SolveFn = (p: PuzzleId, text: string, extra?: Record<string, unknown>) => void;
type FailFn = (text: string, minutes?: number, susp?: number) => void;

function Choice({
  options,
  onPick,
}: {
  options: { label: string; value: string }[];
  onPick: (v: string) => void;
}) {
  return (
    <div className="mt-4 grid gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onPick(o.value)}
          className="min-h-11 touch-manipulation border border-border px-4 py-3 text-left hover:border-primary"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Puzzle({
  id,
  s,
  solve,
  fail,
}: {
  id: PuzzleId;
  s: ReturnType<typeof initial>;
  solve: SolveFn;
  fail: FailFn;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [pins, setPins] = useState<number[]>([]);
  const [noise, setNoise] = useState(0);
  const [key, setKey] = useState("");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [liar, setLiar] = useState<string | null>(null);

  if (id === "sangue") {
    const stains = [
      { id: "banheiro", label: "Banheiro — poça redonda, sem cauda" },
      {
        id: "porta",
        label: "Porta de entrada — gotas muito alongadas, cauda apontando para a cozinha",
      },
      { id: "corredor", label: "Corredor — gotas quase redondas, cauda curta" },
      { id: "cozinha", label: "Cozinha — gotas levemente alongadas" },
    ];
    const correct = ["porta", "cozinha", "corredor", "banheiro"];
    return (
      <>
        <h2 className="font-display text-2xl">Fotos da cena — reconstrução</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sangue em movimento deixa gotas alongadas. Quanto mais devagar a vítima anda, mais
          redondas elas ficam. Quando ela para, sobra uma poça. Ordene o caminho da vítima.
        </p>
        <div className="mt-4 grid gap-2">
          {stains.map((st) => (
            <button
              key={st.id}
              disabled={order.includes(st.id)}
              onClick={() => setOrder([...order, st.id])}
              className="border border-border px-4 py-2 text-left hover:border-primary disabled:opacity-40"
            >
              {order.includes(st.id) && (
                <span className="mr-2 font-mono text-primary">{order.indexOf(st.id) + 1}.</span>
              )}
              {st.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3 font-mono text-sm">
          <button onClick={() => setOrder([])} className="text-muted-foreground">
            limpar
          </button>
          {order.length === 4 && (
            <button
              className="text-primary"
              onClick={() => {
                if (order.join() === correct.join())
                  solve(
                    "sangue",
                    "A vítima foi atacada na porta, cambaleou pela cozinha e pelo corredor e caiu no banheiro. Alguém ajeitou a cena depois. E no verso de uma das fotos tem algo escrito.",
                  );
                else {
                  setOrder([]);
                  fail(
                    "A sequência não fecha com as gotas. Você perde tempo refazendo as medições.",
                  );
                }
              }}
            >
              confirmar sequência
            </button>
          )}
        </div>
      </>
    );
  }

  if (id === "relatorio") {
    return (
      <>
        <h2 className="font-display text-2xl">Campo rasurado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O relatório tem um campo alterado à caneta. Qual informação deve ser tratada como suspeita
          antes de cruzar os números com a tabela?
        </p>
        <Choice
          options={[
            { label: "A identidade da vítima", value: "vitima" },
            { label: "A hora estimada da morte", value: "hora" },
            { label: "O local do apartamento", value: "local" },
            { label: "O tipo de evidência fotografada", value: "evidencia" },
          ]}
          onPick={(v) =>
            v === "hora"
              ? solve(
                  "relatorio",
                  "A rasura está na hora estimada da morte. O campo não deve ser aceito sozinho: agora a temperatura precisa ser comparada com a tabela do laboratório.",
                )
              : fail("Você marca um campo intacto. A rasura está em outro lugar do formulário.", 10)
          }
        />
      </>
    );
  }

  if (id === "hora") {
    return (
      <>
        <h2 className="font-display text-2xl">Hora real da morte</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cruze o relatório do legista com a tabela. Quando Lucía Ortega morreu de verdade?
        </p>
        <Choice
          options={[
            { label: "Por volta de 20:30", value: "a" },
            { label: "Por volta de 22:30", value: "b" },
            { label: "01:00, como está no relatório", value: "c" },
            { label: "Por volta de 02:15", value: "d" },
          ]}
          onPick={(v) =>
            v === "b"
              ? solve(
                  "hora",
                  "37 menos 30,4 dá 6,6 graus, e a 1,5 por hora são umas 4h20. Ela morreu por volta de 22:30. Alguém mudou a hora do relatório para 01:00, um horário em que Ruiz já tinha álibi no bar.",
                )
              : fail(
                  v === "c"
                    ? "Você aceita a hora rasurada. Algo te incomoda; você recalcula e perde tempo."
                    : "As contas não batem com a tabela. Você refaz tudo.",
                )
          }
        />
      </>
    );
  }

  if (id === "contradicao") {
    if (!s.solved.includes("hora")) {
      return (
        <>
          <h2 className="font-display text-2xl">Quadro de Debra</h2>
          <p className="mt-4">
            Sem saber a hora real da morte, qualquer álibi parece bom. Primeiro descubra quando ela
            morreu.
          </p>
        </>
      );
    }
    return (
      <>
        <h2 className="font-display text-2xl">Quem está mentindo?</h2>
        {!liar ? (
          <Choice
            options={[
              { label: "Carlos Ruiz", value: "ruiz" },
              { label: "Marco Tellez", value: "tellez" },
              { label: "Teresa Vidal", value: "teresa" },
            ]}
            onPick={setLiar}
          />
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Qual documento prova a mentira?</p>
            <Choice
              options={[
                { label: "Livro de detenção", value: "detencao" },
                { label: "Ponto eletrônico do porto", value: "ponto" },
                { label: "Fichas dos envolvidos", value: "fichas" },
                { label: "Relatório do legista", value: "legista" },
              ]}
              onPick={(doc) => {
                if (liar === "ruiz" && doc === "detencao")
                  solve(
                    "contradicao",
                    "Ruiz disse que estava no bar desde as 21h, mas às 21h estava preso aqui. Foi liberado às 22:05, a dez minutos do 4B, e o crime foi às 22:30. Teresa confirma que ele chegou ao bar depois das 23h, molhado.",
                  );
                else {
                  setLiar(null);
                  fail(
                    liar === "tellez"
                      ? "Você aponta Tellez para Debra. Ela mostra o ponto do porto: ele não saiu de lá. Ela te olha estranho, e Doakes ouviu tudo."
                      : "A prova não se sustenta. Debra balança a cabeça.",
                    30,
                    liar === "tellez" ? 1 : 0,
                  );
                }
              }}
            />
          </>
        )}
      </>
    );
  }

  if (id === "janela") {
    return (
      <>
        <h2 className="font-display text-2xl">Armário 17</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Arrombar um armário de evidências com Doakes na sala é suicídio. Quando você volta? Agora
          são {fmtClock(s.clock)}.
        </p>
        <Choice
          options={[
            { label: "Agora mesmo", value: "now" },
            ...DOAKES_WINDOWS.map((w, i) => ({ label: `Na janela ${w.label}`, value: String(i) })),
          ]}
          onPick={(v) => {
            if (v === "now") {
              const inWin = DOAKES_WINDOWS.some((w) => s.clock >= w.start && s.clock < w.end);
              if (inWin) return solve("janela", "Doakes saiu para o café. A sala está vazia.");
              return fail(
                'Você mal toca na fechadura e ouve passos. Doakes: "Perdeu alguma coisa, Morgan?"',
                10,
                1,
              );
            }
            const w = DOAKES_WINDOWS[Number(v)]!;
            if (s.clock >= w.end)
              return fail(
                "Essa janela já passou. Você fica parado olhando o relógio feito um idiota.",
                10,
              );
            solve(
              "janela",
              `Você espera até ${w.label.split(" ")[0]}. Doakes sai para o café, como sempre.`,
              { clock: Math.max(s.clock, w.start) },
            );
          }}
        />
      </>
    );
  }

  if (id === "fechadura") {
    const correct = [5, 4, 3, 2];
    return (
      <>
        <h2 className="font-display text-2xl">Fechadura de 4 pinos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina a altura de cada pino, em ordem. Cada erro faz barulho. Pinos:{" "}
          {pins.join(" · ") || "—"}
        </p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className="h-12 w-12 border border-border font-mono hover:border-primary"
              onClick={() => {
                if (correct[pins.length] === n) {
                  const np = [...pins, n];
                  setPins(np);
                  if (np.length === 4) solve("fechadura", "Clique. O armário 17 abre.");
                } else {
                  const nn = noise + 1;
                  setNoise(nn);
                  setPins([]);
                  if (nn >= 3) {
                    setNoise(0);
                    fail(
                      "A fechadura estala alto demais. Você ouve uma cadeira se mexer no corredor e precisa sair.",
                      20,
                      1,
                    );
                  }
                }
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Barulho: {"▮".repeat(noise)}
          {"▯".repeat(3 - noise)}
        </p>
      </>
    );
  }

  if (id === "cifra") {
    return (
      <>
        <h2 className="font-display text-2xl">Decifrador</h2>
        <p className="mt-2 font-mono text-sm">{CIPHER_TEXT}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada letra foi deslocada por um número. Assassinos metódicos usam datas que importam para
          eles. Cada tentativa leva tempo.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value.replace(/\D/g, ""))}
            className="w-24 border border-input bg-background px-3 py-2 font-mono"
            placeholder="chave"
          />
          <button
            className="border border-border px-4 font-mono text-sm hover:border-primary"
            onClick={() => {
              const k = Number(key);
              if (!key) return;
              setDecoded(caesar(CIPHER_TEXT, -k));
              if (k === CIPHER_KEY)
                solve(
                  "cifra",
                  'Chave 7: o dia do primeiro crime. "ARMAZÉM NOVE DAS DOCAS DE DODGE ISLAND." É onde ele guarda o que sobra.',
                );
              else fail("Sai só lixo na tela. O computador range e o relógio corre.", 15);
            }}
          >
            aplicar
          </button>
        </div>
        {decoded && <p className="mt-3 font-mono text-sm text-muted-foreground">{decoded}</p>}
      </>
    );
  }

  if (id === "rede") {
    if (!s.solved.includes("contradicao") || !s.solved.includes("cifra")) {
      return (
        <>
          <h2 className="font-display text-2xl">Arquivo de casos antigos</h2>
          <p className="mt-4">
            Os nomes ainda não formam uma rede confiável. Primeiro, feche a contradição do
            depoimento e leia a mensagem das docas.
          </p>
        </>
      );
    }
    return (
      <>
        <h2 className="font-display text-2xl">A rede por trás da noite</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Uma coincidência só é uma pista quando nomes, endereços e horários apontam para o mesmo
          lugar.
        </p>
        <Choice
          options={[
            { label: "Ruiz — apartamento 4B — 22:30 — armazém 9", value: "ruiz" },
            { label: "Tellez — bar Tropicana — 01:00 — apartamento 4B", value: "tellez" },
            { label: "Teresa — Porto de Miami — 22:05 — armazém 17", value: "teresa" },
          ]}
          onPick={(v) =>
            v === "ruiz"
              ? solve(
                  "rede",
                  "O caminho de Ruiz cruza o apartamento 4B, o horário adulterado e o armazém 9. A história não termina no relatório: alguém guardou algo nas docas.",
                )
              : fail(
                  "Os endereços não fecham. Você mistura pessoas que só aparecem no mesmo papel.",
                  20,
                )
          }
        />
      </>
    );
  }

  if (id === "vestigio") {
    return (
      <>
        <h2 className="font-display text-2xl">O que a luva prova?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A luva traz três pistas diferentes. Escolha a leitura que respeita o tamanho, o sangue e o
          recibo sem transformar uma coincidência em certeza.
        </p>
        <Choice
          options={[
            {
              label: "O recibo basta para provar que Tellez usou a luva",
              value: "recibo",
            },
            {
              label:
                "Tamanho M aproxima a luva de Ruiz, mas o sangue O− é da vítima e o recibo não identifica quem tocou nela",
              value: "cruzar",
            },
            {
              label: "A luva pertence a Teresa porque ela trabalhava à noite",
              value: "teresa",
            },
          ]}
          onPick={(v) =>
            v === "cruzar"
              ? solve(
                  "vestigio",
                  "Você separa fato de suposição: tamanho, sangue e recibo precisam ser cruzados com fichas e ponto do porto antes de apontar um culpado.",
                )
              : fail(
                  "Uma única pista não basta. O Código exige cruzar o vestígio com documentos independentes.",
                  15,
                )
          }
        />
      </>
    );
  }

  if (id === "caderno") {
    return (
      <>
        <h2 className="font-display text-2xl">A ordem do Código</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Harry não ensinou apenas regras; ensinou uma ordem de trabalho. Qual sequência evita uma
          acusação precipitada?
        </p>
        <Choice
          options={[
            {
              label: "Observar → confirmar → reunir prova → decidir",
              value: "certa",
            },
            {
              label: "Escolher um suspeito → procurar uma prova → ignorar contradições",
              value: "atalho",
            },
            {
              label: "Acusar → observar a reação → ajustar a história depois",
              value: "reacao",
            },
          ]}
          onPick={(v) =>
            v === "certa"
              ? solve(
                  "caderno",
                  "O caderno reorganiza a noite: primeiro observe, depois confirme, reúna a prova e só então decida. O Código continua sendo um método, não um palpite.",
                )
              : fail(
                  "Harry teria chamado isso de atalho. Você está tentando encaixar as pistas depois de escolher a resposta.",
                  15,
                )
          }
        />
      </>
    );
  }

  if (id === "segredo") {
    return (
      <>
        <h2 className="font-display text-2xl">O compartimento oculto</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O Código exige prova e nenhuma ponta solta. Qual detalhe do compartimento explica a camisa
          molhada?
        </p>
        <Choice
          options={[
            { label: "A fotografia foi escondida atrás do filtro", value: "foto" },
            { label: "O recibo marca 22:18, antes da hora real da morte", value: "recibo" },
            {
              label: "A caixa de lâminas prova que Tellez esteve no apartamento",
              value: "laminas",
            },
          ]}
          onPick={(v) =>
            v === "recibo"
              ? solve(
                  "segredo",
                  "O recibo coloca Ruiz perto do apartamento às 22:18, antes da morte real. A pista não veio da polícia: veio de um esconderijo dentro da própria casa de Dexter.",
                )
              : fail(
                  "O detalhe chama atenção, mas não explica quando Ruiz esteve perto da cena.",
                  15,
                )
          }
        />
      </>
    );
  }

  if (id === "reacao") {
    return (
      <>
        <h2 className="font-display text-2xl">A pista que desapareceu</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O culpado reagiu à investigação. A mensagem deixada na bancada é uma tentativa de fazer
          você abandonar a cadeia de provas.
        </p>
        <Choice
          options={[
            { label: "Aceitar a mensagem e acusar Tellez imediatamente", value: "armadilha" },
            {
              label: "Registrar a reação, preservar a cópia restante e continuar com as provas",
              value: "preservar",
            },
            { label: "Descartar todos os documentos e começar o caso de novo", value: "descartar" },
          ]}
          onPick={(v) =>
            v === "preservar"
              ? solve(
                  "reacao",
                  "A reação confirma que o caso chegou a alguém com acesso e medo de ser descoberto. Você não troca uma cadeia de provas por uma mensagem anônima.",
                )
              : fail("A mensagem era exatamente o que o culpado queria que você fizesse.", 20, 1)
          }
        />
      </>
    );
  }

  // luva
  return (
    <>
      <h2 className="font-display text-2xl">A luva</h2>
      <p className="mt-2">
        Luva de couro tamanho M. Sangue seco tipo O−. Saco plástico sem etiqueta, com um recibo do
        porto dentro, no nome de Marco Tellez.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">O que essa luva realmente diz?</p>
      <Choice
        options={[
          { label: "É prova contra Tellez: o recibo é dele", value: "tellez" },
          {
            label: "Foi plantada para incriminar Tellez: ele usa GG, e ele estava no porto",
            value: "plantada",
          },
          { label: "É de Teresa: ela estava perto da cena", value: "teresa" },
        ]}
        onPick={(v) =>
          v === "plantada"
            ? solve(
                "luva",
                "O tamanho M serve em Ruiz, não em Tellez, e o ponto do porto inocenta o vizinho. Alguém quis um culpado pronto, e esse alguém conhecia os dois.",
              )
            : fail(
                v === "tellez"
                  ? "Você quase leva a luva para Debra. Aí lembra das mãos de Tellez. Alguma coisa está errada."
                  : "Teresa não tem ligação com o armário. Você descarta a ideia.",
                20,
              )
        }
      />
    </>
  );
}

function Accuse({ onPick }: { onPick: (who: string) => void }) {
  return (
    <>
      <h2 className="font-display text-2xl">Quadro do alvo</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Harry diria: certeza absoluta, ou nada. Quem vai para a sua mesa?
      </p>
      <Choice
        options={[
          { label: "Carlos Ruiz", value: "ruiz" },
          { label: "Marco Tellez", value: "tellez" },
          { label: "Teresa Vidal", value: "teresa" },
        ]}
        onPick={onPick}
      />
    </>
  );
}
