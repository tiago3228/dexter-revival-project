import { useEffect, useRef, useState, type ReactNode } from "react";
import { Search, ZoomIn } from "lucide-react";
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
import { MentalistCase } from "./MentalistCase";
import { WinchesterCase } from "./WinchesterCase";
import { VivianRobertsCase } from "./VivianRobertsCase";
import { StoryDialogue, type StoryDialogueScene } from "./StoryDialogue";
import { ORTEGA_DIALOGUE } from "./ortegaDialogues";
import {
  ACHIEVEMENTS,
  CASE_IDS,
  loadAchievementProgress,
  recordCaseCompletion,
  type AchievementId,
  type CaseId,
} from "./achievements";
import { HarryCodePanel } from "./HarryCodePanel";
import { CaseHeroImage } from "./CaseHeroImage";
import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "./caseTimer";
import {
  loadCurrentPlayerName,
  loadPlayerRanking,
  setCurrentPlayerName,
  type PlayerRankingEntry,
} from "./playerRanking";
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
  | "reacao"
  | "lamina";
type ImageId = "blood-trail" | "autopsy-report" | "glove-bag" | "harry-notebook";
type Modal =
  | { kind: "doc"; id: DocId }
  | { kind: "puzzle"; id: PuzzleId }
  | { kind: "image"; id: ImageId }
  | { kind: "zoom"; title: string; src: string; alt: string; description?: string }
  | { kind: "acusar" }
  | null;
type InfoModal = "como-jogar" | "dicas" | null;
type Ending = {
  title: string;
  text: string;
  good: boolean;
  speaker?: string;
  speechText?: string;
  speechSrc?: string;
} | null;

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

const TROPHY_ART: Record<
  Exclude<AchievementId, "blood-slide-box">,
  { src: string; alt: string }
> = {
  "first-case": {
    src: "/images/dexter-items/latex-gloves.webp",
    alt: "Luvas forenses azuis ao lado de uma lâmina de evidência",
  },
  "sharp-eye": {
    src: "/images/dexter-items/forensics-badge.webp",
    alt: "Crachá fictício de laboratório forense com vestígio de sangue em lâmina",
  },
  "no-hints": {
    src: "/images/dexter-items/knife-kit.webp",
    alt: "Estojo de facas de Dexter aberto e organizado",
  },
  "clean-run": {
    src: "/images/dexter-items/dexter-work-shirt.webp",
    alt: "Camisa escura de trabalho de Dexter dobrada como evidência",
  },
  "correct-verdict": {
    src: "/images/dexter-items/blood-slide-sample.webp",
    alt: "Lâmina de vidro com amostra de sangue preservada",
  },
  "master-interrogator": {
    src: "/images/dexter-items/forensics-badge.webp",
    alt: "Crachá do laboratório forense acompanhado por uma lâmina de evidência",
  },
  "red-john-profiler": {
    src: "/images/dexter-items/latex-gloves.webp",
    alt: "Luvas forenses azuis de Dexter em uma bancada de evidências",
  },
  "all-cases": {
    src: "/images/dexter-items/dexter-work-shirt.webp",
    alt: "Camisa escura de Dexter preservada no arquivo de investigação",
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
  const solvedPoints = Math.round((state.solved.length / 14) * 60);
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
  const [activeStoryDialogue, setActiveStoryDialogue] = useState<StoryDialogueScene | null>(null);
  const [ending, setEnding] = useState<Ending>(null);
  const [tab, setTab] = useState<"cena" | "caderno">("cena");
  const [infoModal, setInfoModal] = useState<InfoModal>(null);
  const [hintConfirmed, setHintConfirmed] = useState(false);
  const [harryLine, setHarryLine] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window === "undefined") return 0.3;
    const stored = window.localStorage.getItem("dexter-music-volume");
    if (stored === null) return 0.3;
    const saved = Number(stored);
    if (stored === "0" && window.localStorage.getItem("dexter-audio-defaults-v1") !== "true") {
      return 0.3;
    }
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.3;
  });
  const [ambientVolume, setAmbientVolume] = useState(() => {
    if (typeof window === "undefined") return 0.28;
    const stored = window.localStorage.getItem("dexter-ortega-ambient-volume");
    if (stored === null) return 0.28;
    const saved = Number(stored);
    if (stored === "0" && window.localStorage.getItem("dexter-audio-defaults-v1") !== "true") {
      return 0.28;
    }
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.28;
  });
  const [caseMode, setCaseMode] = useState<
    "ortega" | "monroe" | "painscreek" | "mentalist" | "winchester" | "vivian"
  >("ortega");
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showInvestigatorSetup, setShowInvestigatorSetup] = useState(false);
  const [introMusicActive, setIntroMusicActive] = useState(true);
  const [playerName, setPlayerName] = useState(() => loadCurrentPlayerName());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedEndingRef = useRef(false);
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
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modal]);

  useEffect(() => {
    if (!ending) {
      recordedEndingRef.current = false;
      return;
    }
    if (recordedEndingRef.current) return;
    recordedEndingRef.current = true;
    const score = getInvestigatorScore(s);
    recordCaseCompletion({
      caseId: "ortega",
      score: score.points,
      hints: s.hintsUsed,
      mistakes: s.mistakes,
      correctConclusion: ending.good,
      elapsedSeconds: finishCaseTimer("ortega"),
      correctActions: s.solved.length,
      totalActions: s.solved.length + s.mistakes,
    });
  }, [ending, s]);

  useEffect(() => {
    if (showIntro || showMenu) return;
    beginCaseTimer(caseMode, caseMode === "monroe");
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") pauseCaseTimer(caseMode);
      else beginCaseTimer(caseMode);
    };
    const pause = () => pauseCaseTimer(caseMode);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", pause);
      pauseCaseTimer(caseMode);
    };
  }, [caseMode, showIntro, showMenu]);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    const startMusic = () => {
      if (!soundOnRef.current || reflectionModalOpenRef.current) return;
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

    const track = introMusicActive
      ? aberturaAudio.url
      : !showMenu && (caseMode === "painscreek" || caseMode === "vivian")
        ? "/audio/painscreek/painscreek-case-theme.mp3"
        : !showMenu && caseMode === "mentalist"
          ? "/audio/mentalist/red-john-theme.mp3"
          : !showMenu && caseMode === "winchester"
            ? "/audio/winchester/o-sangue-dos-condenados.mp3"
            : "/audio/DexterEndingThemeSong-GhastlyCarrot-HomeoftheRandom.mp3";
    const trackUrl = new URL(track, window.location.href).href;
    if (audio.src !== trackUrl) {
      audio.pause();
      audio.src = track;
      audio.load();
    }
    audio.volume = musicVolumeRef.current;
    if (introMusicActive) {
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

    if (soundOnRef.current && !reflectionModalOpenRef.current) {
      // Tenta o autoplay; navegadores que o bloquearem aguardam a primeira interação.
      void audio.play().catch(() => undefined);
    }

    return () => {
      audio.onerror = null;
      void sfxRef.current?.close();
      sfxRef.current = null;
    };
  }, [caseMode, introMusicActive, showMenu]);

  const fadingRef = useRef(false);
  useEffect(() => {
    if (fadingRef.current) return;
    if (audioRef.current) audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    window.localStorage.setItem("dexter-audio-defaults-v1", "true");
  }, []);

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

  const showInvestigatorSetupScreen = () => {
    setShowIntro(false);
    setShowInvestigatorSetup(true);
  };

  const fadeOutIntroMusic = (onComplete: () => void) => {
    const audio = audioRef.current;
    if (!audio || !soundOnRef.current) {
      onComplete();
      return;
    }
    if (fadingRef.current) return;
    fadingRef.current = true;
    const startVolume = audio.volume;
    const steps = 60;
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      const ratio = Math.max(0, 1 - step / steps);
      if (audioRef.current === audio) audio.volume = startVolume * ratio;
      if (step >= steps) {
        window.clearInterval(interval);
        fadingRef.current = false;
        audio.pause();
        onComplete();
      }
    }, 50);
  };

  if (showIntro) {
    return (
      <IntroScreen
        onStart={showInvestigatorSetupScreen}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    );
  }

  if (showInvestigatorSetup) {
    return (
      <InvestigatorSetupScreen
        initialName={playerName}
        onSubmit={(name) => {
          const normalized = setCurrentPlayerName(name);
          setPlayerName(normalized);
          fadeOutIntroMusic(() => {
            setIntroMusicActive(false);
            setShowInvestigatorSetup(false);
            setShowMenu(true);
          });
        }}
      />
    );
  }

  if (showMenu) {
    return (
      <MainMenu
        onSelect={(nextCase) => {
          if (nextCase === "ortega" && ending) {
            setS(initial());
            setEnding(null);
            setModal(null);
          }
          setCaseMode(nextCase);
          setShowMenu(false);
        }}
        playerName={playerName}
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
    return (
      <DexterCase onBack={() => setShowMenu(true)} soundOn={soundOn} onToggleSound={toggleSound} />
    );
  }

  if (caseMode === "winchester") {
    return (
      <WinchesterCase
        onBack={() => setShowMenu(true)}
        musicVolume={musicVolume}
        onMusicVolumeChange={setMusicVolume}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    );
  }

  if (caseMode === "mentalist") {
    return (
      <MentalistCase
        onBack={() => setShowMenu(true)}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    );
  }

  if (caseMode === "vivian") {
    return (
      <VivianRobertsCase
        onBack={() => setShowMenu(true)}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        musicVolume={musicVolume}
        onMusicVolumeChange={setMusicVolume}
      />
    );
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

  const openZoom = (title: string, src: string, alt: string, description?: string) => {
    playSfx("evidence");
    setModal({
      kind: "zoom",
      title,
      src,
      alt,
      ...(description !== undefined ? { description } : {}),
    });
  };

  const has = (d: DocId) => s.docs.includes(d);
  const done = (p: PuzzleId) => s.solved.includes(p);

  const nextObjective = (() => {
    if (s.solved.length >= 14) {
      return {
        title: "Concluir a investigação",
        detail:
          "Abra o quadro do alvo na cena do Apartamento de Dexter e escolha quem será acusado.",
        location: "apartamento" as LocationId,
        action: "Abrir o quadro do alvo",
      };
    }
    if (!done("sangue")) {
      return {
        title: "Examinar a cena do crime",
        detail:
          "No Laboratório forense, abra a fotografia da trilha de sangue e observe a sequência das gotas.",
        location: "lab" as LocationId,
        action: "Ver fotografia da cena",
      };
    }
    if (!done("relatorio")) {
      return {
        title: "Conferir o relatório do legista",
        detail:
          "Ainda no Laboratório forense, examine o relatório e identifique o campo incompatível com as medições.",
        location: "lab" as LocationId,
        action: "Examinar relatório",
      };
    }
    if (!done("hora")) {
      return {
        title: "Reconstruir a hora da morte",
        detail:
          "Cruze a temperatura do relatório com a tabela de resfriamento e resolva o enigma da hora.",
        location: "lab" as LocationId,
        action: "Comparar os registros",
      };
    }
    if (!done("contradicao")) {
      return {
        title: "Conferir os depoimentos",
        detail:
          "Na Homicídios, compare o relato de Carlos Ruiz com os registros oficiais de horário.",
        location: "corredor" as LocationId,
        action: "Investigar depoimentos",
      };
    }
    if (!done("janela") || !done("fechadura") || !done("luva")) {
      return {
        title: "Examinar a sala de evidências",
        detail:
          "Leia o registro de rondas e investigue o armário 17. A fechadura e a luva dependem das pistas encontradas antes.",
        location: "evidencias" as LocationId,
        action: "Investigar armário 17",
      };
    }
    if (!done("cifra")) {
      return {
        title: "Decifrar o bilhete",
        detail:
          "Volte ao Laboratório forense e use a mensagem encontrada no armário 17. Procure a chave nos documentos.",
        location: "lab" as LocationId,
        action: "Decifrar mensagem",
      };
    }
    if (!done("rede") || !done("reacao")) {
      return {
        title: "Cruzar nomes e endereços",
        detail:
          "No Laboratório forense, conecte os nomes, endereços e horários; depois examine a reação deixada na bancada.",
        location: "lab" as LocationId,
        action: "Cruzar as pistas",
      };
    }
    if (!done("vestigio") || !done("lamina")) {
      return {
        title: "Confirmar os vestígios físicos",
        detail:
          "Compare a luva, as fichas sanguíneas e os documentos. Não confunda uma suspeita com uma prova conclusiva.",
        location: "evidencias" as LocationId,
        action: "Analisar vestígios",
      };
    }
    if (!done("segredo") || !done("caderno")) {
      return {
        title: "Revisar o Código de Harry",
        detail:
          "No Apartamento de Dexter, examine o caderno e o compartimento oculto antes de fechar as pontas soltas.",
        location: "apartamento" as LocationId,
        action: "Revisar o Código",
      };
    }
    return {
      title: "Revisar as evidências restantes",
      detail:
        "Consulte o Caderno e retorne aos locais com pistas pendentes. Resolva os enigmas restantes antes de acusar.",
      location: s.loc,
      action: "Abrir Caderno",
    };
  })();

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
    setHarryLine("Observe o que a evidência confirma — e também o que ela ainda não pode provar.");
    setModal({ kind: "doc", id: d });
  };

  const solve = (p: PuzzleId, text: string, extra: Partial<ReturnType<typeof initial>> = {}) => {
    playSfx("success");
    narrate(text, { solved: [...s.solved, p], ...extra });
    const reactions: Partial<Record<PuzzleId, string>> = {
      sangue: "A cena conta uma história. Não confunda a primeira marca com a sequência inteira.",
      contradicao: "Uma mentira só importa quando outra prova a torna impossível.",
      lamina:
        "Uma prova pode apontar para alguém. Ela ainda precisa resistir a cada explicação alternativa.",
      reacao: "Quando alguém mexe no tabuleiro, significa que você chegou perto demais.",
    };
    setHarryLine(
      reactions[p] ?? "Certeza não é instinto. É a soma de detalhes que ninguém conseguiu apagar.",
    );
    setModal(null);
  };

  const fail = (text: string, minutes = 30, susp = 0) => {
    playSfx("error");
    setHarryLine(
      "Não force uma conclusão, Dexter. Volte às provas antes que a pressa deixe um rastro.",
    );
    narrate(text, { mistakes: s.mistakes + 1 }, minutes, susp);
  };

  const go = (loc: LocationId) => {
    if (loc === s.loc) return;
    narrate(`Você vai até: ${LOCATION_NAMES[loc]}.`, { loc }, 10);
    setTab("cena");
  };

  const Hot = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="my-1 inline-flex min-h-10 max-w-full touch-manipulation flex-wrap items-center gap-2 border border-primary/60 bg-black/80 px-3 py-2 align-middle font-mono text-xs text-primary transition hover:bg-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="text-[9px] uppercase tracking-widest text-white/60">examinar</span>
      <span className="text-left">{children}</span>
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
        {has("fichas") && (
          <section className="mt-5 max-w-xl border border-primary/50 bg-black/45 p-3 sm:p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Análise complementar · armário 17
            </p>
            <div className="mt-3 grid grid-cols-[96px_1fr] items-center gap-3 sm:grid-cols-[132px_1fr]">
              <img
                src="/images/dexter-items/blood-slides-box-closed.webp"
                alt="Caixa fechada de lâminas de vidro de Dexter"
                className="h-24 w-full border border-white/15 object-cover sm:h-28"
              />
              <p className="text-sm leading-relaxed text-white/85">
                Uma caixa de lâminas foi guardada junto à luva sem etiqueta. A ficha sanguínea dos
                envolvidos permite conferir um microtraço no punho interno.
              </p>
            </div>
            {done("lamina") ? (
              <button
                type="button"
                onClick={() =>
                  addDoc("amostraLuva", "Você revisa o laudo da microamostra da luva.")
                }
                className="mt-3 min-h-10 border border-border px-3 py-2 font-mono text-xs text-primary hover:border-primary"
              >
                Rever laudo da microamostra
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!has("amostraLuva")) {
                    playSfx("evidence");
                    narrate(
                      "A caixa guarda uma lâmina preparada do punho interno da luva do armário 17.",
                      {
                        docs: [...s.docs, "amostraLuva"],
                      },
                    );
                  }
                  setModal({ kind: "puzzle", id: "lamina" });
                }}
                className="mt-3 min-h-10 border border-primary px-3 py-2 font-mono text-xs text-primary hover:bg-primary/10"
              >
                Comparar a amostra com as fichas →
              </button>
            )}
          </section>
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
        <section
          className="mt-5 max-w-4xl border border-primary/40 bg-black/55 p-3 sm:p-4"
          aria-label="Arquivo particular de Dexter"
        >
          <div className="mb-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Arquivo particular · itens de Dexter
            </h3>
            <p className="mt-1 text-xs text-white/65">
              Toque em qualquer peça para ver a imagem ampliada.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ArtifactCard
              src="/images/dexter-items/blood-slides-box-open.webp"
              alt="Caixa aberta de lâminas de sangue de Dexter"
              title="Caixa de lâminas de sangue"
              onClick={() =>
                openZoom(
                  "Caixa de lâminas de sangue",
                  "/images/dexter-items/blood-slides-box-open.webp",
                  "Caixa de Dexter aberta com lâminas de sangue catalogadas",
                )
              }
            />
            <ArtifactCard
              src="/images/dexter-items/blood-slide-sample.webp"
              alt="Lâmina de vidro com amostra de sangue preservada"
              title="Lâmina catalogada"
              onClick={() =>
                openZoom(
                  "Lâmina catalogada",
                  "/images/dexter-items/blood-slide-sample.webp",
                  "Lâmina de vidro com uma amostra de sangue preservada",
                )
              }
            />
            <ArtifactCard
              src="/images/dexter-items/knife-kit.webp"
              alt="Conjunto de facas de Dexter guardado em um estojo"
              title="Conjunto de facas"
              onClick={() =>
                openZoom(
                  "Conjunto de facas",
                  "/images/dexter-items/knife-kit.webp",
                  "Estojo aberto com facas e ferramentas organizadas",
                )
              }
            />
            <ArtifactCard
              src="/images/dexter-items/latex-gloves.webp"
              alt="Luvas forenses junto a uma lâmina de evidência"
              title="Luvas de proteção"
              onClick={() =>
                openZoom(
                  "Luvas de proteção",
                  "/images/dexter-items/latex-gloves.webp",
                  "Luvas forenses azuis ao lado de uma lâmina de evidência",
                )
              }
            />
            <ArtifactCard
              src="/images/dexter-items/dexter-work-shirt.webp"
              alt="Camisa escura de trabalho de Dexter dobrada como evidência"
              title="Roupa do arquivo"
              onClick={() =>
                openZoom(
                  "Roupa do arquivo",
                  "/images/dexter-items/dexter-work-shirt.webp",
                  "Camisa escura de trabalho dobrada ao lado de uma etiqueta de evidência",
                )
              }
            />
            <ArtifactCard
              src="/images/dexter-items/forensics-badge.webp"
              alt="Crachá fictício de laboratório forense ao lado de vestígio em lâmina"
              title="Crachá do laboratório"
              onClick={() =>
                openZoom(
                  "Crachá do laboratório",
                  "/images/dexter-items/forensics-badge.webp",
                  "Crachá fictício de laboratório forense e lâmina com vestígio de sangue",
                )
              }
            />
          </div>
        </section>
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
        <button
          type="button"
          onClick={() => {
            addDoc("estojoFacas", "Você examina o estojo pessoal de ferramentas.");
            setHarryLine(
              "Uma ferramenta não é uma prova. O que importa é o vestígio que ela deixa.",
            );
          }}
          className="evidence-card group mt-2 block w-full max-w-xl touch-manipulation border border-border bg-black/20 p-2 text-left hover:border-primary"
        >
          <img
            src="/images/dexter-items/knife-kit.webp"
            alt="Estojo aberto com facas e ferramentas organizadas"
            className="h-40 w-full object-cover transition group-hover:opacity-90 sm:h-52"
          />
          <span className="mt-2 block px-1 pb-1 font-mono text-xs text-white/75">
            Examinar o estojo de ferramentas
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
          {ending.speaker && ending.speechText && ending.speechSrc && (
            <section className="mt-7 border border-primary/50 bg-card/60 p-4 text-left sm:p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Depoimento final · {ending.speaker}
              </p>
              <blockquote className="mt-3 border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">
                “{ending.speechText}”
              </blockquote>
              <audio
                className="mt-4 w-full"
                controls
                preload="none"
                src={ending.speechSrc}
                muted={!soundOn}
                ref={(el) => {
                  if (el) el.volume = Math.min(1, Math.max(0, ambientVolume));
                }}
                aria-label={`Ouvir o depoimento final de ${ending.speaker}`}
                onPlay={() => {
                  audioRef.current?.pause();
                  playSfx("click");
                }}
                onPause={() => {
                  if (soundOnRef.current && !reflectionModalOpenRef.current) {
                    void audioRef.current?.play().catch(() => undefined);
                  }
                }}
                onEnded={() => {
                  if (soundOnRef.current && !reflectionModalOpenRef.current) {
                    void audioRef.current?.play().catch(() => undefined);
                  }
                }}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                A trilha de fundo pausa durante o depoimento e retorna ao final.
              </p>
            </section>
          )}
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
              <ScoreMetric label="Puzzles" value={`${s.solved.length}/14`} />
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
              beginCaseTimer("ortega", true);
              setS(initial());
              setEnding(null);
              setModal(null);
              setHarryLine(null);
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

      <CaseHeroImage
        src="/images/ortega-investigation.webp"
        alt="Dexter examina evidências forenses em um laboratório de Miami à noite"
        caption="Arquivo de cena · Miami Metro · Caso Ortega"
      />

      <section
        aria-labelledby="case-guide-title"
        className="mt-5 border border-primary/40 bg-card/70 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              Briefing · objetivo atual
            </p>
            <h2 id="case-guide-title" className="mt-1 font-display text-2xl">
              {nextObjective.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {nextObjective.detail}
            </p>
          </div>
          <div className="grid min-w-[140px] grid-cols-2 gap-2 sm:min-w-[190px]">
            <div className="border border-border bg-background/70 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Enigmas
              </p>
              <p className="mt-1 font-mono text-xl text-primary">{s.solved.length}/14</p>
            </div>
            <div className="border border-border bg-background/70 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Documentos
              </p>
              <p className="mt-1 font-mono text-xl text-primary">{s.docs.length}/20</p>
            </div>
          </div>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden bg-muted"
          role="progressbar"
          aria-label="Progresso dos enigmas"
          aria-valuemin={0}
          aria-valuemax={14}
          aria-valuenow={s.solved.length}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(100, (s.solved.length / 14) * 100)}%` }}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              number: "01",
              title: "Investigar",
              text: "Escolha um local e examine fotos, objetos e textos destacados.",
              complete: s.docs.length > 0,
            },
            {
              number: "02",
              title: "Analisar",
              text: "Resolva os enigmas e consulte os documentos no Caderno.",
              complete: s.solved.length > 0,
            },
            {
              number: "03",
              title: "Cruzar provas",
              text: "Compare horários, depoimentos e vestígios antes de tirar conclusões.",
              complete: done("rede") && done("vestigio") && done("lamina"),
            },
            {
              number: "04",
              title: "Concluir",
              text:
                s.solved.length >= 14
                  ? "Todos os enigmas foram resolvidos. Você já pode abrir o quadro do alvo."
                  : "A acusação conclusiva fica disponível após resolver os 14 enigmas.",
              complete: s.solved.length >= 14,
            },
          ].map((step) => (
            <div
              key={step.number}
              className={`border p-3 ${step.complete ? "border-primary/50 bg-primary/5" : "border-border bg-background/40"}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{step.number}</span>
                <h3 className="font-mono text-xs uppercase tracking-wider">{step.title}</h3>
                {step.complete && (
                  <span
                    className="ml-auto text-xs text-primary"
                    aria-label="Etapa iniciada ou concluída"
                  >
                    ✓
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (s.solved.length >= 14) {
                setS((current) => ({ ...current, loc: "apartamento" }));
                setTab("cena");
                setModal({ kind: "acusar" });
                return;
              }
              if (s.loc !== nextObjective.location) {
                go(nextObjective.location);
                return;
              }
              if (nextObjective.title === "Examinar a cena do crime") openImage("blood-trail");
              else if (nextObjective.title === "Conferir o relatório do legista")
                openImage("autopsy-report");
              else if (nextObjective.title === "Reconstruir a hora da morte")
                setModal({ kind: "puzzle", id: "hora" });
              else if (nextObjective.title === "Conferir os depoimentos")
                setModal({ kind: "puzzle", id: "contradicao" });
              else if (nextObjective.title === "Examinar a sala de evidências")
                setModal({
                  kind: "puzzle",
                  id: !done("janela") ? "janela" : !done("fechadura") ? "fechadura" : "luva",
                });
              else if (nextObjective.title === "Decifrar o bilhete")
                setModal({ kind: "puzzle", id: "cifra" });
              else if (nextObjective.title === "Cruzar nomes e endereços")
                setModal({ kind: "puzzle", id: !done("rede") ? "rede" : "reacao" });
              else if (nextObjective.title === "Confirmar os vestígios físicos")
                setModal({ kind: "puzzle", id: !done("vestigio") ? "vestigio" : "lamina" });
              else if (nextObjective.title === "Revisar o Código de Harry")
                setModal({ kind: "puzzle", id: !done("caderno") ? "caderno" : "segredo" });
              else setTab("caderno");
            }}
            className="min-h-11 border border-primary bg-primary/10 px-4 py-2 font-mono text-xs text-primary hover:bg-primary/20"
          >
            {nextObjective.action} →
          </button>
          <p className="text-xs text-muted-foreground">
            Use os botões de evidência destacados para investigar. Toque na imagem da cena para
            ampliá-la.
          </p>
        </div>
      </section>

      <HarryCodePanel line={harryLine} onDismiss={() => setHarryLine(null)} />

      {s.docs.length >= 3 && !ending && (
        <section className="mt-5 border border-primary/50 bg-primary/5 p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            Testemunhos cruzados · Porto de Miami
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare a lembrança de Teresa com o ponto de Tellez, a câmera e a luva encontrada na cena.
          </p>
          <button
            type="button"
            onClick={() => setActiveStoryDialogue(ORTEGA_DIALOGUE)}
            className="mt-3 min-h-10 border border-primary px-4 py-2 font-mono text-xs text-primary hover:bg-primary/10"
          >
            Reconstituir os depoimentos
          </button>
        </section>
      )}

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Locais da investigação · selecione para explorar
      </p>
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
              <button
                type="button"
                onClick={() =>
                  openZoom(LOCATION_NAMES[s.loc], SCENE_IMAGES[s.loc].src, SCENE_IMAGES[s.loc].alt)
                }
                aria-label={`Ampliar imagem da cena: ${LOCATION_NAMES[s.loc]}`}
                className="absolute bottom-4 right-4 z-20 inline-flex min-h-11 items-center gap-2 border border-primary bg-black/90 px-4 py-2 font-mono text-xs text-primary shadow-lg transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ZoomIn aria-hidden="true" className="size-4" />
                Ampliar imagem
              </button>
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
            className={`max-h-[90vh] w-full overflow-auto border border-border bg-card p-4 sm:p-6 ${modal.kind === "zoom" ? "max-w-6xl" : modal.kind === "image" ? "max-w-4xl" : "max-w-xl"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {modal.kind === "zoom" && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl sm:text-2xl">{modal.title}</h2>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="min-h-11 shrink-0 border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
                    aria-label="Fechar imagem ampliada"
                  >
                    Fechar
                  </button>
                </div>
                <img
                  src={modal.src}
                  alt={modal.alt}
                  className="mt-4 max-h-[72vh] w-full border border-border/70 bg-black object-contain"
                />
                {modal.description && (
                  <p className="mt-3 text-sm text-muted-foreground">{modal.description}</p>
                )}
              </>
            )}
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
                  const all = s.solved.length === 14;
                  const correctWithProof = who === "ruiz" && all;
                  playSfx(correctWithProof ? "success" : "error");
                  if (who === "ruiz" && all)
                    setEnding({
                      good: true,
                      title: "O Código foi respeitado",
                      text: "Ruiz mentiu sobre a noite, lavou o sangue antes de chegar ao bar e plantou a luva para incriminar Tellez. No armazém nove das docas, você encontra o resto. Esta noite, o Passageiro Sombrio come. E ninguém inocente paga por isso.",
                      speaker: "Ruiz",
                      speechText:
                        "Eu precisava que todos suspeitassem de Tellez. A luva plantada desviaria os olhos da polícia do armazém nove. Você juntou as peças.",
                      speechSrc: "/audio/dexter/ortega/ruiz-confession.mp3",
                    });
                  else if (who === "ruiz")
                    setEnding({
                      good: false,
                      title: "Ponta solta",
                      text: "Você tinha razão sobre Ruiz, mas não tinha certeza. Harry estaria decepcionado. Faltaram provas, e Ruiz percebe que está sendo seguido. Ele some de Miami antes do amanhecer.",
                      speaker: "Ruiz",
                      speechText:
                        "Você sabe que estou mentindo, mas não consegue provar. Quando perceber o que ficou faltando, eu já estarei longe de Miami.",
                      speechSrc: "/audio/dexter/ortega/ruiz-escape.mp3",
                    });
                  else if (who === "tellez")
                    setEnding({
                      good: false,
                      title: "Um inocente na mesa",
                      text: "Tellez estava no porto a noite toda; o ponto e a câmera provavam isso. A luva foi plantada. Você quebrou a primeira regra do Código, e o verdadeiro assassino agradece.",
                      speaker: "Tellez",
                      speechText:
                        "Eu estava no porto aquela noite. O ponto e as câmeras confirmam. Aquela luva não é minha.",
                      speechSrc: "/audio/dexter/ortega/tellez-defensive.mp3",
                    });
                  else
                    setEnding({
                      good: false,
                      title: "A testemunha errada",
                      text: "Teresa só contou o que viu. Acusá-la não faz sentido nenhum, e o caso se fecha sem culpado.",
                      speaker: "Teresa",
                      speechText:
                        "Eu só contei o que vi. Não sei quem matou Ortega, e não posso inventar uma resposta para você.",
                      speechSrc: "/audio/dexter/ortega/teresa-witness.mp3",
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
      {activeStoryDialogue && (
        <StoryDialogue
          scene={activeStoryDialogue}
          onClose={() => setActiveStoryDialogue(null)}
        />
      )}
    </Shell>
  );
}

function InvestigatorSetupScreen({
  initialName,
  onSubmit,
}: {
  initialName: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const normalizedName = name.trim().replace(/\s+/g, " ");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0d0f] px-4 py-8 text-white sm:px-8">
      <section className="w-full max-w-xl border border-[#a71925]/70 bg-[#171719] p-6 shadow-[0_0_60px_rgba(167,25,37,0.16)] sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d52c39]">
          Novo registro de investigação
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Quem está no arquivo?
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#d5d0cd] sm:text-base">
          Adicione seu apelido ou nome de investigador. Sua pontuação, erros e dicas serão usados
          para ordenar o ranking neste navegador.
        </p>
        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (normalizedName) onSubmit(normalizedName);
          }}
        >
          <label
            htmlFor="investigator-name"
            className="font-mono text-xs uppercase tracking-[0.2em] text-[#bcb4b0]"
          >
            Apelido do investigador
          </label>
          <input
            id="investigator-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 24))}
            placeholder="Ex.: Morgan Silva"
            maxLength={24}
            required
            className="mt-3 min-h-12 w-full border border-white/25 bg-black/50 px-4 font-mono text-base text-white outline-none transition placeholder:text-white/35 focus:border-[#d52c39] focus:ring-1 focus:ring-[#d52c39]"
          />
          <div className="mt-2 flex justify-between gap-3 font-mono text-[10px] text-white/45">
            <span>Esse nome aparecerá no quadro de honra.</span>
            <span>{name.length}/24</span>
          </div>
          <button
            type="submit"
            disabled={!normalizedName}
            className="mt-7 min-h-12 w-full border-2 border-[#f4ece8] bg-[#b21f2c] px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[5px_5px_0_#6f111a] transition hover:bg-[#d12a37] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Abrir quadro de investigação
          </button>
        </form>
      </section>
    </main>
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
  playerName,
  musicVolume,
  onMusicVolumeChange,
  soundOn,
  onToggleSound,
  onReflectionModalOpenChange,
}: {
  onSelect: (nextCase: "ortega" | "monroe" | "painscreek" | "mentalist" | "winchester" | "vivian") => void;
  playerName: string;
  musicVolume: number;
  onMusicVolumeChange: (value: number) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onReflectionModalOpenChange: (open: boolean) => void;
}) {
  const [showReflections, setShowReflections] = useState(false);
  const [activeVideo, setActiveVideo] = useState<1 | 2 | null>(null);
  const [showTrophies, setShowTrophies] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [transitionChapter, setTransitionChapter] = useState<CaseId | null>(null);
  const [achievementProgress] = useState(() => loadAchievementProgress());
  const [playerRanking] = useState<PlayerRankingEntry[]>(() => loadPlayerRanking());
  const bloodSlideTrophy = ACHIEVEMENTS.find(
    (achievement) => achievement.id === "blood-slide-box",
  )!;
  const bloodSlideUnlocked = achievementProgress.unlockedIds.includes("blood-slide-box");
  const chapterTransitionCopy: Record<CaseId, { index: string; title: string; detail: string }> = {
    ortega: {
      index: "CAPÍTULO 01 · MIAMI",
      title: "Turno da Noite",
      detail: "Carregando o arquivo Ortega e os registros de Homicídios.",
    },
    monroe: {
      index: "CAPÍTULO 02 · GREENFIELD",
      title: "O Caso Monroe",
      detail: "Reunindo depoimentos, documentos e evidências do dossiê.",
    },
    painscreek: {
      index: "CAPÍTULO 03 · GREYBRIDGE",
      title: "Painscreek Case",
      detail: "Abrindo os arquivos forenses de Greybridge.",
    },
    mentalist: {
      index: "CAPÍTULO 04 · MIAMI / CBI",
      title: "O Mentalista: O Caso Red John",
      detail: "Conectando as evidências de Dexter e Patrick Jane.",
    },
    winchester: {
      index: "CAPÍTULO 05 · MIAMI / DOCAS",
      title: "O Sangue dos Condenados",
      detail: "Abrindo um dossiê de homicídios com evidências que desafiam a perícia.",
    },
    vivian: {
      index: "CAPÍTULO 06 · PAINSCREEK",
      title: "O Caso Vivian Roberts",
      detail: "Abrindo o arquivo investigativo e o catálogo inicial de evidências.",
    },
  };

  const chapterStatus = (caseId: CaseId) => {
    if (!achievementProgress.completedCases.includes(caseId)) return "ARQUIVO DISPONÍVEL";
    return `CONCLUÍDO · MELHOR ${achievementProgress.bestScores[caseId] ?? 0}/100`;
  };

  const chapterTitles: Record<CaseId, string> = {
    ortega: "Turno da Noite · Caso Ortega",
    monroe: "O Caso Monroe",
    painscreek: "Painscreek Case",
    mentalist: "O Mentalista: O Caso Red John",
    winchester: "O Sangue dos Condenados",
    vivian: "O Caso Vivian Roberts",
  };
  const formatDuration = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    return hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const selectChapter = (caseId: CaseId) => {
    if (transitionChapter !== null) return;
    setTransitionChapter(caseId);
    if (soundOn) {
      const transitionSound = new Audio("/audio/dexter/sfx/chapter-transition.mp3");
      transitionSound.volume = 0.42;
      void transitionSound.play().catch(() => undefined);
    }
    window.setTimeout(() => onSelect(caseId), 1150);
  };

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
      {transitionChapter !== null && (
        <div
          className="chapter-transition-overlay fixed inset-0 z-[80] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          aria-label={`Abrindo ${chapterTransitionCopy[transitionChapter].title}`}
        >
          <section className="chapter-transition-card relative w-full max-w-xl border border-primary/70 bg-[#100d0d] p-6 shadow-[0_0_55px_rgba(180,35,45,0.2)] sm:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {chapterTransitionCopy[transitionChapter].index}
            </p>
            <h2 className="chapter-transition-title mt-5 font-display text-4xl sm:text-5xl">
              {chapterTransitionCopy[transitionChapter].title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {chapterTransitionCopy[transitionChapter].detail}
            </p>
            <div className="chapter-transition-stamp mt-7 inline-flex border border-primary/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              Acesso autorizado
            </div>
            <div className="chapter-transition-track mt-8 h-1 overflow-hidden bg-white/10">
              <div className="chapter-transition-progress h-full bg-primary" />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Abrindo dossiê confidencial...
            </p>
          </section>
        </div>
      )}
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
          Dexter · capítulos de investigação
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight sm:text-7xl">
          Seleção de capítulos
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Escolha um capítulo para investigar. Você pode voltar a este menu e alternar entre os três
          casos sempre que quiser.
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
        <button
          type="button"
          onClick={() => setShowRanking((visible) => !visible)}
          aria-expanded={showRanking}
          className="mt-6 min-h-11 border border-primary px-5 py-3 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/10"
        >
          {showRanking ? "Fechar quadro de honra" : "Quadro de honra"}
        </button>
        {showRanking && (
          <section
            className="mt-5 border border-primary/50 bg-card/40 p-4 sm:p-6"
            aria-label="Ranking de jogadores"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                  Investigadores registrados
                </p>
                <h2 className="mt-2 font-display text-2xl">Ranking global deste navegador</h2>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">Jogador: {playerName}</p>
            </div>
            {playerRanking.length === 0 ? (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Nenhum caso concluído ainda. Feche um dossiê para entrar no ranking.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-3">Pos.</th>
                      <th className="px-3 py-3">Investigador</th>
                      <th className="px-3 py-3">Pontos</th>
                      <th className="px-3 py-3">Casos</th>
                      <th className="px-3 py-3">Erros</th>
                      <th className="px-3 py-3">Dicas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerRanking.slice(0, 10).map((entry, index) => {
                      const isCurrent =
                        entry.name.toLocaleLowerCase("pt-BR") ===
                        playerName.toLocaleLowerCase("pt-BR");
                      return (
                        <tr
                          key={`${entry.name}-${entry.lastPlayedAt}`}
                          className={`border-b border-border/60 ${isCurrent ? "bg-primary/10 text-primary" : "text-foreground"}`}
                        >
                          <td className="px-3 py-3 font-bold">{index + 1}º</td>
                          <td className="px-3 py-3 font-semibold">
                            {entry.name}
                            {isCurrent ? " · você" : ""}
                          </td>
                          <td className="px-3 py-3">{entry.score}</td>
                          <td className="px-3 py-3">{entry.casesCompleted}</td>
                          <td className="px-3 py-3">{entry.mistakes}</td>
                          <td className="px-3 py-3">{entry.hints}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Pontos de casos concluídos fazem você subir. Erros e dicas reduzem a pontuação da
              investigação e, em empates, deixam o investigador mais disciplinado à frente.
            </p>
          </section>
        )}
        <button
          type="button"
          onClick={() => setShowStatistics((visible) => !visible)}
          aria-expanded={showStatistics}
          className="mt-6 min-h-11 border border-primary px-5 py-3 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/10"
        >
          {showStatistics ? "Fechar estatísticas" : "Estatísticas detalhadas"}
        </button>
        {showStatistics && (
          <section
            className="mt-5 border border-primary/50 bg-card/40 p-4 sm:p-6"
            aria-label="Estatísticas detalhadas dos casos"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                  Registro de desempenho
                </p>
                <h2 className="mt-2 font-display text-2xl">Estatísticas dos capítulos</h2>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                Salvas somente neste navegador
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {CASE_IDS.map((caseId) => {
                const stats = achievementProgress.caseStats[caseId];
                const accuracy =
                  stats && stats.lastTotalActions > 0
                    ? Math.round((stats.lastCorrectActions / stats.lastTotalActions) * 100)
                    : null;
                return (
                  <article key={caseId} className="border border-border bg-background/50 p-4">
                    <h3 className="font-display text-xl">{chapterTitles[caseId]}</h3>
                    {stats ? (
                      <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed">
                        <p>
                          Tentativas concluídas:{" "}
                          <span className="text-primary">{stats.attempts}</span>
                        </p>
                        <p>
                          Último tempo:{" "}
                          <span className="text-primary">
                            {formatDuration(stats.lastElapsedSeconds)}
                          </span>
                        </p>
                        <p>
                          Melhor tempo:{" "}
                          <span className="text-primary">
                            {formatDuration(stats.bestElapsedSeconds)}
                          </span>
                        </p>
                        <p>
                          Precisão recente:{" "}
                          <span className="text-primary">
                            {accuracy === null
                              ? "N/D"
                              : `${accuracy}% (${stats.lastCorrectActions}/${stats.lastTotalActions})`}
                          </span>
                        </p>
                        <p>
                          Melhor pontuação:{" "}
                          <span className="text-primary">
                            {achievementProgress.bestScores[caseId] ?? 0}/100
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Conclua este capítulo para registrar tempo, precisão e pontuação.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              A precisão compara ações corretas com decisões registradas: puzzles no Caso Ortega,
              objetivos no Caso Monroe e evidências, mecanismos e interrogatórios em The Last
              Confession, além de evidências, conexões e entrevistas em Red John: O Sorriso
              Escarlate.
            </p>
          </section>
        )}
        <button
          type="button"
          onClick={() => setShowTrophies((visible) => !visible)}
          aria-expanded={showTrophies}
          className="mt-6 min-h-11 border border-primary px-5 py-3 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/10"
        >
          {showTrophies ? "Fechar mural" : "Mural de troféus"} ·{" "}
          {achievementProgress.unlockedIds.length}/{ACHIEVEMENTS.length}
        </button>
        {showTrophies && (
          <section
            className="mt-5 border border-primary/50 bg-card/40 p-4 sm:p-6"
            aria-label="Mural de troféus"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                  Desempenho do investigador
                </p>
                <h2 className="mt-2 font-display text-2xl">Mural de troféus</h2>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {achievementProgress.unlockedIds.length}/{ACHIEVEMENTS.length} conquistados
              </p>
            </div>
            <section
              className={`mt-5 flex flex-col items-center gap-4 border p-5 text-center sm:flex-row sm:text-left ${bloodSlideUnlocked ? "border-primary bg-primary/10" : "border-primary/40 bg-background/40"}`}
              aria-label="Troféu máximo: caixa de lâminas de sangue"
            >
              <BloodSlideBoxIcon locked={!bloodSlideUnlocked} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  Troféu máximo · {bloodSlideTrophy.tier}
                </p>
                <h3 className="mt-2 font-display text-2xl">{bloodSlideTrophy.title}</h3>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {bloodSlideTrophy.description}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-primary">
                  {bloodSlideUnlocked
                    ? "Conquistado"
                    : "Bloqueado · requer excelência nos cinco capítulos e interrogatórios perfeitos"}
                </p>
              </div>
            </section>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ACHIEVEMENTS.filter((achievement) => achievement.id !== "blood-slide-box").map(
                (achievement) => {
                  const unlocked = achievementProgress.unlockedIds.includes(achievement.id);
                  return (
                    <article
                      key={achievement.id}
                      className={`border p-4 ${unlocked ? "border-primary bg-primary/5" : "border-border bg-background/40 opacity-70"}`}
                    >
                      <img
                        src={
                          TROPHY_ART[achievement.id as Exclude<AchievementId, "blood-slide-box">]
                            .src
                        }
                        alt={
                          TROPHY_ART[achievement.id as Exclude<AchievementId, "blood-slide-box">]
                            .alt
                        }
                        loading="lazy"
                        className="mb-4 aspect-[4/3] w-full border border-border/70 bg-black object-cover"
                      />
                      <p
                        className={`font-mono text-[10px] uppercase tracking-wider ${unlocked ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {achievement.tier} · {unlocked ? "Conquistado" : "Bloqueado"}
                      </p>
                      <h3 className="mt-2 font-display text-xl">{achievement.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            disabled={transitionChapter !== null}
            onClick={() => selectChapter("ortega")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Capítulo 01 · Miami
            </p>
            <h2 className="mt-3 font-display text-3xl">Turno da Noite</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Reconstrua o caso Ortega durante um turno em Homicídios. Sangue, documentos e o Código
              de Harry esperam por você.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Abrir capítulo →
            </span>
            <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {chapterStatus("ortega")}
            </span>
          </button>
          <button
            type="button"
            disabled={transitionChapter !== null}
            onClick={() => selectChapter("monroe")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Capítulo 02 · Greenfield · 20/05/2023
            </p>
            <h2 className="mt-3 font-display text-3xl">O Caso Monroe</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Um dossiê em quatro objetivos, com interrogatórios completos, áudios opcionais, cifras
              e relatório final alternativo.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Abrir capítulo →
            </span>
            <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {chapterStatus("monroe")}
            </span>
          </button>
          <button
            type="button"
            disabled={transitionChapter !== null}
            onClick={() => selectChapter("painscreek")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Capítulo 03 · Greybridge
            </p>
            <h2 className="mt-3 font-display text-3xl">Painscreek Case</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Explore locais, examine documentos, destranque mecanismos e conecte evidências
              forenses para reconstruir um caso arquivado.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Escolher dificuldade e iniciar →
            </span>
            <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {chapterStatus("painscreek")}
            </span>
          </button>
          <button
            type="button"
            disabled={transitionChapter !== null}
            onClick={() => selectChapter("mentalist")}
            className="group border border-primary/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-primary hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Capítulo 04 · Miami / CBI
            </p>
            <h2 className="mt-3 font-display text-3xl">O Mentalista: O Caso Red John</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Dexter precisa da mente de Patrick Jane para seguir a assinatura de Red John, cruzar
              registros policiais e identificar quem manipula a investigação por dentro.
            </p>
            <span className="mt-8 block font-mono text-xs text-primary group-hover:underline">
              Abrir capítulo →
            </span>
            <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {chapterStatus("mentalist")}
            </span>
          </button>
          <button
            type="button"
            disabled={transitionChapter !== null}
            onClick={() => selectChapter("winchester")}
            className="group border border-red-900/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-red-600 hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-red-300">
              Capítulo 05 · Miami / Docas
            </p>
            <h2 className="mt-3 font-display text-3xl">O Sangue dos Condenados</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Um caso maior em seis atos: perícia contraditória, arquivos apagados, interrogatórios,
              conexões ocultas e uma hipótese sobrenatural que só se confirma perto do fim.
            </p>
            <span className="mt-8 block font-mono text-xs text-red-300 group-hover:underline">
              Abrir dossiê →
            </span>
            <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {chapterStatus("winchester")}
            </span>
          </button>
          <button
            type="button"
            disabled={transitionChapter !== null}
            onClick={() => selectChapter("vivian")}
            className="group border border-amber-700/70 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-amber-500 hover:bg-card sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-300">
              Capítulo 06 · Painscreek
            </p>
            <h2 className="mt-3 font-display text-3xl">O Caso Vivian Roberts</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Investigue personagens, locais e documentos de um caso em preparação. Esta versão-base ainda não contém a solução nem as rotas investigativas completas.
            </p>
            <span className="mt-8 block font-mono text-xs text-amber-300 group-hover:underline">
              Abrir arquivo-base →
            </span>
            <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {chapterStatus("vivian")}
            </span>
          </button>
        </div>
        <div className="mt-8 border border-border p-5 font-mono text-xs text-muted-foreground">
          <p>ARQUIVOS DISPONÍVEIS: 06</p>
          <p className="mt-2">
            CAPÍTULOS CONCLUÍDOS: {achievementProgress.completedCases.length}/{CASE_IDS.length}
          </p>
          <p className="mt-2">
            TROFÉUS CONQUISTADOS: {achievementProgress.unlockedIds.length}/{ACHIEVEMENTS.length}
          </p>
        </div>
      </div>
    </main>
  );
}

function ArtifactCard({
  src,
  alt,
  title,
  onClick,
}: {
  src: string;
  alt: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-44 touch-manipulation border border-white/20 bg-black/60 p-2 text-left transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      aria-label={`Ampliar item: ${title}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-32 w-full object-cover transition group-hover:brightness-110 sm:h-36"
      />
      <span className="mt-2 flex items-center justify-between gap-2 px-1 font-mono text-xs text-primary">
        {title}
        <ZoomIn aria-hidden="true" className="size-4 shrink-0" />
      </span>
    </button>
  );
}

function BloodSlideBoxIcon({ locked }: { locked: boolean }) {
  return (
    <figure
      className={`relative m-0 flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden border border-primary/40 bg-black/70 p-2 ${locked ? "opacity-50 grayscale" : "shadow-[0_0_32px_rgba(166,58,62,0.28)]"}`}
    >
      <img
        src="/images/dexter-items/blood-slides-box-open.webp"
        alt={
          locked
            ? "Caixa de lâminas de sangue; troféu máximo bloqueado"
            : "Caixa de lâminas de sangue conquistada"
        }
        loading="eager"
        className="h-full w-full object-contain"
      />
    </figure>
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

  if (id === "lamina") {
    return (
      <>
        <h2 className="font-display text-2xl">Microtraços na luva</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A lâmina foi preparada do punho interno da luva encontrada no armário 17. Compare o laudo
          com as fichas sanguíneas e com o padrão de transferência descrito.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <figure className="border border-border bg-background/50 p-2">
            <img
              src="/images/dexter-items/blood-slides-box-open.webp"
              alt="Caixa aberta contendo lâminas de sangue arquivadas"
              className="h-40 w-full object-cover"
            />
            <figcaption className="mt-2 font-mono text-[10px] text-muted-foreground">
              Caixa de lâminas · arquivo pessoal
            </figcaption>
          </figure>
          <figure className="border border-border bg-background/50 p-2">
            <img
              src="/images/dexter-items/blood-slide-sample.webp"
              alt="Lâmina de vidro com uma amostra de sangue preservada"
              className="h-40 w-full object-cover"
            />
            <figcaption className="mt-2 font-mono text-[10px] text-muted-foreground">
              Lâmina nº 18 · microamostra do punho
            </figcaption>
          </figure>
        </div>
        <Choice
          options={[
            {
              label:
                "O− e O+: a mistura liga a luva a Lucía e Ruiz, mas outras provas são necessárias.",
              value: "ruiz",
            },
            {
              label: "Apenas O−: a luva esteve com a vítima e exclui os suspeitos.",
              value: "victim",
            },
            { label: "O sangue prova sozinho que Teresa plantou a luva.", value: "teresa" },
          ]}
          onPick={(value) => {
            if (value === "ruiz") {
              const docs = s.docs.includes("amostraLuva") ? s.docs : [...s.docs, "amostraLuva"];
              solve(
                "lamina",
                "A amostra contém sangue O− de Lucía e um microtraço O+ compatível com Ruiz. A transferência na costura reforça a ligação dele com a luva, mas não determina quando ocorreu o contato nem prova autoria. Cruze essa pista com o álibi e com as demais provas.",
                { docs },
              );
            } else {
              fail(
                "O laudo não exclui todos os suspeitos nem identifica sozinho quem plantou a luva. Compare o tipo O+ com as fichas e respeite os limites da amostra.",
                10,
              );
            }
          }}
        />
      </>
    );
  }

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
