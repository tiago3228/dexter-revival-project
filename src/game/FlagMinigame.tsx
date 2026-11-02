import { useCallback, useEffect, useState } from "react";
import { Flag, Music, X } from "lucide-react";
import { markMinigameStarted, recordMinigameProgress } from "./minigameProgress";

type Country = { name: string; code: string };
type Mode = "free" | "timed" | "challenge";
type Theme = "neon" | "gameboy" | "sunset";
type Question = { answer: Country; options: Country[] };

type RankingEntry = {
  score: number;
  correct: number;
  wrong: number;
  mode: Mode;
  date: string;
};

const COUNTRIES: Country[] = [
  {
    name: "Brasil",
    code: "br",
  },
  {
    name: "Argentina",
    code: "ar",
  },
  {
    name: "Chile",
    code: "cl",
  },
  {
    name: "Colômbia",
    code: "co",
  },
  {
    name: "Peru",
    code: "pe",
  },
  {
    name: "Uruguai",
    code: "uy",
  },
  {
    name: "Bolívia",
    code: "bo",
  },
  {
    name: "Paraguai",
    code: "py",
  },
  {
    name: "Equador",
    code: "ec",
  },
  {
    name: "Venezuela",
    code: "ve",
  },
  {
    name: "México",
    code: "mx",
  },
  {
    name: "Estados Unidos",
    code: "us",
  },
  {
    name: "Canadá",
    code: "ca",
  },
  {
    name: "Costa Rica",
    code: "cr",
  },
  {
    name: "Panamá",
    code: "pa",
  },
  {
    name: "Cuba",
    code: "cu",
  },
  {
    name: "Jamaica",
    code: "jm",
  },
  {
    name: "Haiti",
    code: "ht",
  },
  {
    name: "República Dominicana",
    code: "do",
  },
  {
    name: "Guatemala",
    code: "gt",
  },
  {
    name: "Honduras",
    code: "hn",
  },
  {
    name: "Nicarágua",
    code: "ni",
  },
  {
    name: "El Salvador",
    code: "sv",
  },
  {
    name: "Belize",
    code: "bz",
  },
  {
    name: "Guiana",
    code: "gy",
  },
  {
    name: "Suriname",
    code: "sr",
  },
  {
    name: "Trinidad e Tobago",
    code: "tt",
  },
  {
    name: "Bahamas",
    code: "bs",
  },
  {
    name: "Barbados",
    code: "bb",
  },
  {
    name: "Reino Unido",
    code: "gb",
  },
  {
    name: "França",
    code: "fr",
  },
  {
    name: "Alemanha",
    code: "de",
  },
  {
    name: "Itália",
    code: "it",
  },
  {
    name: "Espanha",
    code: "es",
  },
  {
    name: "Portugal",
    code: "pt",
  },
  {
    name: "Irlanda",
    code: "ie",
  },
  {
    name: "Países Baixos",
    code: "nl",
  },
  {
    name: "Bélgica",
    code: "be",
  },
  {
    name: "Suíça",
    code: "ch",
  },
  {
    name: "Áustria",
    code: "at",
  },
  {
    name: "Polônia",
    code: "pl",
  },
  {
    name: "Grécia",
    code: "gr",
  },
  {
    name: "Noruega",
    code: "no",
  },
  {
    name: "Suécia",
    code: "se",
  },
  {
    name: "Finlândia",
    code: "fi",
  },
  {
    name: "Dinamarca",
    code: "dk",
  },
  {
    name: "Islândia",
    code: "is",
  },
  {
    name: "Ucrânia",
    code: "ua",
  },
  {
    name: "Rússia",
    code: "ru",
  },
  {
    name: "Romênia",
    code: "ro",
  },
  {
    name: "Bulgária",
    code: "bg",
  },
  {
    name: "Croácia",
    code: "hr",
  },
  {
    name: "Sérvia",
    code: "rs",
  },
  {
    name: "Eslovênia",
    code: "si",
  },
  {
    name: "Eslováquia",
    code: "sk",
  },
  {
    name: "Lituânia",
    code: "lt",
  },
  {
    name: "Letônia",
    code: "lv",
  },
  {
    name: "Estônia",
    code: "ee",
  },
  {
    name: "Malta",
    code: "mt",
  },
  {
    name: "Chipre",
    code: "cy",
  },
  {
    name: "Moldávia",
    code: "md",
  },
  {
    name: "Bielorrússia",
    code: "by",
  },
  {
    name: "Bósnia e Herzegovina",
    code: "ba",
  },
  {
    name: "Montenegro",
    code: "me",
  },
  {
    name: "Macedônia do Norte",
    code: "mk",
  },
  {
    name: "Liechtenstein",
    code: "li",
  },
  {
    name: "San Marino",
    code: "sm",
  },
  {
    name: "Andorra",
    code: "ad",
  },
  {
    name: "Vaticano",
    code: "va",
  },
  {
    name: "Kosovo",
    code: "xk",
  },
  {
    name: "Japão",
    code: "jp",
  },
  {
    name: "Coreia do Sul",
    code: "kr",
  },
  {
    name: "Coreia do Norte",
    code: "kp",
  },
  {
    name: "China",
    code: "cn",
  },
  {
    name: "Mongólia",
    code: "mn",
  },
  {
    name: "Tailândia",
    code: "th",
  },
  {
    name: "Vietnã",
    code: "vn",
  },
  {
    name: "Laos",
    code: "la",
  },
  {
    name: "Camboja",
    code: "kh",
  },
  {
    name: "Indonésia",
    code: "id",
  },
  {
    name: "Filipinas",
    code: "ph",
  },
  {
    name: "Índia",
    code: "in",
  },
  {
    name: "Nepal",
    code: "np",
  },
  {
    name: "Butão",
    code: "bt",
  },
  {
    name: "Cazaquistão",
    code: "kz",
  },
  {
    name: "Geórgia",
    code: "ge",
  },
  {
    name: "Armênia",
    code: "am",
  },
  {
    name: "Azerbaijão",
    code: "az",
  },
  {
    name: "Afeganistão",
    code: "af",
  },
  {
    name: "Paquistão",
    code: "pk",
  },
  {
    name: "Bangladesh",
    code: "bd",
  },
  {
    name: "Sri Lanka",
    code: "lk",
  },
  {
    name: "Taiwan",
    code: "tw",
  },
  {
    name: "Mianmar",
    code: "mm",
  },
  {
    name: "Austrália",
    code: "au",
  },
  {
    name: "Nova Zelândia",
    code: "nz",
  },
  {
    name: "Fiji",
    code: "fj",
  },
  {
    name: "Samoa",
    code: "ws",
  },
  {
    name: "Tonga",
    code: "to",
  },
  {
    name: "Papua-Nova Guiné",
    code: "pg",
  },
  {
    name: "Egito",
    code: "eg",
  },
  {
    name: "Marrocos",
    code: "ma",
  },
  {
    name: "Argélia",
    code: "dz",
  },
  {
    name: "Tunísia",
    code: "tn",
  },
  {
    name: "Nigéria",
    code: "ng",
  },
  {
    name: "Quênia",
    code: "ke",
  },
  {
    name: "Gana",
    code: "gh",
  },
  {
    name: "Etiópia",
    code: "et",
  },
  {
    name: "Senegal",
    code: "sn",
  },
  {
    name: "Costa do Marfim",
    code: "ci",
  },
  {
    name: "Camarões",
    code: "cm",
  },
  {
    name: "Tanzânia",
    code: "tz",
  },
  {
    name: "Uganda",
    code: "ug",
  },
  {
    name: "Ruanda",
    code: "rw",
  },
  {
    name: "Madagascar",
    code: "mg",
  },
  {
    name: "Namíbia",
    code: "na",
  },
  {
    name: "Botsuana",
    code: "bw",
  },
  {
    name: "Zimbábue",
    code: "zw",
  },
  {
    name: "Zâmbia",
    code: "zm",
  },
  {
    name: "Angola",
    code: "ao",
  },
  {
    name: "Moçambique",
    code: "mz",
  },
  {
    name: "Maurício",
    code: "mu",
  },
  {
    name: "Seicheles",
    code: "sc",
  },
  {
    name: "Malawi",
    code: "mw",
  },
  {
    name: "Libéria",
    code: "lr",
  },
  {
    name: "Serra Leoa",
    code: "sl",
  },
  {
    name: "Guiné",
    code: "gn",
  },
  {
    name: "Mali",
    code: "ml",
  },
  {
    name: "Burkina Faso",
    code: "bf",
  },
  {
    name: "Benim",
    code: "bj",
  },
  {
    name: "Togo",
    code: "tg",
  },
  {
    name: "Gabão",
    code: "ga",
  },
  {
    name: "República do Congo",
    code: "cg",
  },
  {
    name: "República Democrática do Congo",
    code: "cd",
  },
  {
    name: "Somália",
    code: "so",
  },
  {
    name: "Sudão",
    code: "sd",
  },
  {
    name: "Sudão do Sul",
    code: "ss",
  },
  {
    name: "Israel",
    code: "il",
  },
  {
    name: "Arábia Saudita",
    code: "sa",
  },
  {
    name: "Emirados Árabes Unidos",
    code: "ae",
  },
  {
    name: "Turquia",
    code: "tr",
  },
  {
    name: "Irã",
    code: "ir",
  },
  {
    name: "Iraque",
    code: "iq",
  },
  {
    name: "Jordânia",
    code: "jo",
  },
  {
    name: "Líbano",
    code: "lb",
  },
  {
    name: "Bahrein",
    code: "bh",
  },
  {
    name: "Catar",
    code: "qa",
  },
  {
    name: "Omã",
    code: "om",
  },
  {
    name: "Iêmen",
    code: "ye",
  },
  {
    name: "Síria",
    code: "sy",
  },
  {
    name: "África do Sul",
    code: "za",
  },
];
const RANKING_KEY = "minigame-ranking-v1";
const TROPHIES_KEY = "minigame-trophies-v1";
const THEMES: Array<{ id: Theme; label: string; description: string }> = [
  { id: "neon", label: "Arcade Neon", description: "Cores vibrantes e energia de fliperama" },
  {
    id: "gameboy",
    label: "Game Boy",
    description: "Verde monocromático, como um portátil clássico",
  },
  { id: "sunset", label: "Sunset 16-bit", description: "Roxo, laranja e pôr do sol dos arcades" },
];
const TROPHIES = [
  ["first-correct", "Primeira bandeira", "Acerte sua primeira bandeira.", "🚩"],
  ["explorer", "Explorador", "Responda 10 bandeiras diferentes.", "🧭"],
  ["hot-streak", "Mão quente", "Acerte 5 bandeiras consecutivas.", "🔥"],
  ["world-tour", "Volta ao mundo", "Descubra 25 países diferentes.", "🌎"],
  ["century", "Centenário", "Alcance 100 pontos.", "💯"],
  ["against-clock", "Contra o relógio", "Acerte 5 no modo cronometrado ou desafio.", "⏱️"],
] as const;

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function buildQuestion(used: Set<string>, previous: string | null): Question {
  let available = COUNTRIES.filter(
    (country) => !used.has(country.code) && country.code !== previous,
  );
  if (available.length === 0) {
    used.clear();
    available = COUNTRIES.filter((country) => country.code !== previous);
  }
  const answer = shuffle(available)[0];
  if (!answer) throw new Error("Não foi possível criar uma pergunta de bandeira");
  used.add(answer.code);
  let wrong = shuffle(
    COUNTRIES.filter((country) => country.code !== answer.code && !used.has(country.code)),
  ).slice(0, 3);
  if (wrong.length < 3)
    wrong = shuffle(COUNTRIES.filter((country) => country.code !== answer.code)).slice(0, 3);
  return { answer, options: shuffle([answer, ...wrong]) };
}

function playTone(correct: boolean) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(correct ? 660 : 180, now);
    oscillator.frequency.exponentialRampToValueAtTime(correct ? 990 : 110, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    oscillator.addEventListener("ended", () => void audio.close(), { once: true });
  } catch {
    // Áudio é uma melhoria; não pode impedir a resposta.
  }
}

export function FlagMinigame() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [progressRecorded, setProgressRecorded] = useState(false);
  const [mode, setMode] = useState<Mode>("free");
  const [theme, setTheme] = useState<Theme>("neon");
  const [question, setQuestion] = useState<Question | null>(null);
  const [used, setUsed] = useState(() => new Set<string>());
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLimit, setTimeLimit] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [achievements, setAchievements] = useState<string[]>(() => readStorage(TROPHIES_KEY, []));
  const [showRanking, setShowRanking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const answered = correctAnswers + wrongAnswers;
  const uniqueFlags = used.size;
  const modeLabel = mode === "challenge" ? "Desafio" : mode === "timed" ? "15 segundos" : "Livre";
  const panelClass =
    theme === "gameboy"
      ? "border-[#71884c] bg-[#c8d69b] text-[#26351f]"
      : theme === "sunset"
        ? "border-[#8d457b] bg-gradient-to-br from-[#32145f] via-[#4b1e71] to-[#150a2d] text-[#fff7ef]"
        : "border-cyan-300/40 bg-[#11182a] text-[#f5f7ff]";
  const mutedClass =
    theme === "gameboy"
      ? "text-[#536640]"
      : theme === "sunset"
        ? "text-[#e6b8ca]"
        : "text-[#9ba8c6]";
  const accentClass =
    theme === "gameboy"
      ? "border-[#40532d] text-[#40532d]"
      : theme === "sunset"
        ? "border-[#ffb347] text-[#ffb347]"
        : "border-cyan-300 text-cyan-300";
  const cardClass =
    theme === "gameboy"
      ? "border-[#71884c] bg-[#dce8b0]"
      : theme === "sunset"
        ? "border-[#8d457b] bg-[#4b1e71]/80"
        : "border-[#283553] bg-[#17213a]";

  const close = useCallback(() => {
    if (answered > 0) {
      const ranking = readStorage<RankingEntry[]>(RANKING_KEY, []);
      ranking.push({
        score,
        correct: correctAnswers,
        wrong: wrongAnswers,
        mode,
        date: new Date().toISOString(),
      });
      window.localStorage.setItem(
        RANKING_KEY,
        JSON.stringify(ranking.sort((a, b) => b.score - a.score).slice(0, 50)),
      );
    }
    setStarted(false);
    setQuestion(null);
    setOpen(false);
  }, [answered, correctAnswers, mode, score, wrongAnswers]);

  const start = (nextMode: Mode) => {
    markMinigameStarted("flag-game");
    setProgressRecorded(false);
    const nextUsed = new Set<string>();
    setMode(nextMode);
    setUsed(nextUsed);
    setQuestion(buildQuestion(nextUsed, null));
    setSelected(null);
    setCorrect(null);
    setScore(0);
    setRound(1);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLimit(15);
    setTimeLeft(15);
    setNotice(null);
    setStarted(true);
  };

  const answerQuestion = useCallback(
    (country: Country | null, timedOut = false) => {
      if (!question || selected) return;
      const isCorrect = !timedOut && country?.code === question.answer.code;
      if (!progressRecorded) {
        recordMinigameProgress("flag-game", "played");
        setProgressRecorded(true);
      }
      setSelected(timedOut ? "timeout" : (country?.code ?? null));
      setCorrect(isCorrect);
      playTone(isCorrect);
      if (isCorrect) {
        setScore((value) => value + 15);
        setCorrectAnswers((value) => value + 1);
        setStreak((value) => {
          const next = value + 1;
          setBestStreak((best) => Math.max(best, next));
          if (next >= 2)
            setNotice(
              next >= 10 ? "Imparável!" : next >= 5 ? "Mão quente!" : `Boa sequência: ${next}`,
            );
          return next;
        });
        if (mode === "challenge") setTimeLimit((value) => Math.max(5, value - 1));
      } else {
        setScore((value) => value - 8);
        setWrongAnswers((value) => value + 1);
        setStreak(0);
        setNotice(timedOut ? "Tempo esgotado" : "Resposta incorreta");
      }
    },
    [mode, progressRecorded, question, selected],
  );

  useEffect(() => {
    if (!started || mode === "free" || selected) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          answerQuestion(null, true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [answerQuestion, mode, selected, started]);

  useEffect(() => {
    if (!started || !musicEnabled) return;
    let audio: AudioContext | null = null;
    let timer = 0;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      audio = new AudioContextClass();
      const melody = [659.25, 783.99, 987.77, 783.99, 587.33, 659.25, 783.99, 523.25];
      let step = 0;
      const tick = () => {
        if (!audio) return;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const now = audio.currentTime;
        oscillator.type = "square";
        oscillator.frequency.value = melody[step++ % melody.length]!;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.025, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
      };
      void audio.resume();
      tick();
      timer = window.setInterval(tick, 180);
    } catch {
      audio = null;
    }
    return () => {
      window.clearInterval(timer);
      if (audio) void audio.close();
    };
  }, [musicEnabled, started]);

  useEffect(() => {
    if (!started) return;
    const checks: Record<string, boolean> = {
      "first-correct": correctAnswers >= 1,
      explorer: uniqueFlags >= 10,
      "hot-streak": bestStreak >= 5,
      "world-tour": uniqueFlags >= 25,
      century: score >= 100,
      "against-clock": mode !== "free" && correctAnswers >= 5,
    };
    const newlyUnlocked = TROPHIES.filter(([id]) => checks[id] && !achievements.includes(id)).map(
      ([id]) => id,
    );
    if (newlyUnlocked.length) {
      const next = [...achievements, ...newlyUnlocked];
      setAchievements(next);
      window.localStorage.setItem(TROPHIES_KEY, JSON.stringify(next));
      setNotice(`Troféu desbloqueado: ${TROPHIES.find(([id]) => id === newlyUnlocked[0])?.[1]}`);
    }
  }, [achievements, bestStreak, correctAnswers, mode, score, started, uniqueFlags]);

  const nextQuestion = () => {
    if (!question) return;
    const nextUsed = new Set(used);
    const nextQuestion = buildQuestion(nextUsed, question.answer.code);
    setUsed(nextUsed);
    setQuestion(nextQuestion);
    setSelected(null);
    setCorrect(null);
    setNotice(null);
    setRound((value) => value + 1);
    setTimeLeft(mode === "challenge" ? timeLimit : 15);
  };

  const ranking = readStorage<RankingEntry[]>(RANKING_KEY, []).slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border border-cyan-300/70 bg-cyan-300/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-300 hover:text-[#07111c]"
        aria-haspopup="dialog"
      >
        <Flag size={16} aria-hidden="true" /> Mini Game de Bandeiras
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mini Game — Adivinhe a Bandeira"
        >
          <section
            className={`relative max-h-[95vh] w-full max-w-3xl overflow-y-auto border-2 shadow-2xl ${panelClass}`}
          >
            <button
              type="button"
              onClick={close}
              className={`absolute right-3 top-3 z-10 min-h-10 min-w-10 border bg-black/10 p-2 ${accentClass}`}
              aria-label="Fechar Mini Game"
            >
              <X size={18} />
            </button>
            <div className="p-4 sm:p-7">
              {!started ? (
                <>
                  <header className="text-center">
                    <p
                      className={`font-mono text-xs uppercase tracking-[0.25em] ${accentClass.replace("border-", "")}`}
                    >
                      ⚑ Mini Game
                    </p>
                    <h2 className="mt-2 font-display text-3xl sm:text-4xl">Adivinhe a Bandeira</h2>
                    <p className={`mx-auto mt-3 max-w-xl text-sm ${mutedClass}`}>
                      Escolha um modo e jogue sem limite de rodadas. A partida continua até você
                      fechar.
                    </p>
                  </header>
                  <div className={`mt-6 border p-4 ${cardClass}`}>
                    <p className="font-mono text-xs uppercase tracking-widest">Skin visual</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {THEMES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTheme(item.id)}
                          className={`min-h-16 border p-3 text-left ${theme === item.id ? accentClass : "border-current/20"}`}
                        >
                          <strong className="block text-sm">{item.label}</strong>
                          <span className={`mt-1 block text-xs ${mutedClass}`}>
                            {item.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`mt-4 border p-4 ${cardClass}`}>
                    <p className="font-mono text-xs uppercase tracking-widest">Modo de jogo</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {(
                        [
                          ["free", "Modo livre", "Sem tempo. Pense com calma."],
                          ["timed", "Modo cronometrado", "15 segundos por bandeira."],
                          ["challenge", "Modo desafio", "Começa em 15s e diminui até 5s."],
                        ] as const
                      ).map(([id, title, description]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setMode(id)}
                          className={`min-h-24 border p-3 text-left ${mode === id ? accentClass : "border-current/20"}`}
                        >
                          <strong className="block text-sm">{title}</strong>
                          <span className={`mt-1 block text-xs ${mutedClass}`}>{description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`mt-4 border p-4 ${cardClass}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs uppercase tracking-widest">Troféus</p>
                      <span className={`text-xs ${mutedClass}`}>
                        {achievements.length}/{TROPHIES.length} desbloqueados
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {TROPHIES.map(([id, title, description, icon]) => (
                        <div
                          key={id}
                          title={description}
                          className={`border p-2 text-center text-xs ${achievements.includes(id) ? "border-amber-400 text-amber-300" : `border-current/20 opacity-45 grayscale ${mutedClass}`} `}
                        >
                          <span className="block text-xl">{icon}</span>
                          <span className="mt-1 block truncate">{title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => start(mode)}
                    className={`mt-5 min-h-12 w-full border-2 bg-current/10 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider transition hover:bg-current/20 ${accentClass}`}
                  >
                    Começar · {modeLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRanking((value) => !value)}
                    className={`mt-3 min-h-10 w-full border px-4 py-2 text-xs ${mutedClass}`}
                  >
                    {showRanking ? "Ocultar ranking" : "Ver ranking local"}
                  </button>
                  {showRanking && (
                    <div className={`mt-3 border p-3 ${cardClass}`}>
                      <p className="font-mono text-xs uppercase tracking-widest">
                        Melhores resultados neste navegador
                      </p>
                      {ranking.length ? (
                        ranking.map((entry, index) => (
                          <div
                            key={`${entry.date}-${index}`}
                            className="mt-2 flex items-center justify-between gap-3 text-xs"
                          >
                            <span>{index + 1}. Jogador</span>
                            <span>
                              {entry.score > 0 ? "+" : ""}
                              {entry.score} ·{" "}
                              {entry.mode === "challenge"
                                ? "Desafio"
                                : entry.mode === "timed"
                                  ? "15s"
                                  : "Livre"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className={`mt-2 text-xs ${mutedClass}`}>Ainda não há pontuações.</p>
                      )}
                    </div>
                  )}
                </>
              ) : question ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
                    <div className="flex flex-wrap gap-2">
                      <span className={`border px-3 py-1 text-xs ${accentClass}`}>
                        Rodada {round}
                      </span>
                      {mode !== "free" && (
                        <span
                          className={`border px-3 py-1 text-xs ${timeLeft <= 5 ? "border-red-400 text-red-300" : accentClass}`}
                        >
                          ⏱ {mode === "challenge" ? "Desafio · " : ""}
                          {timeLeft}s
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`block text-[10px] uppercase tracking-widest ${mutedClass}`}>
                        Pontuação
                      </span>
                      <strong className={`text-2xl ${score < 0 ? "text-red-300" : ""}`}>
                        {score > 0 ? "+" : ""}
                        {score}
                      </strong>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div className="mt-4 flex justify-between border border-amber-300/60 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
                      <span>Sequência de acertos: {streak}</span>
                      <span>Melhor: {bestStreak}</span>
                    </div>
                  )}
                  <div className="mt-5 text-center">
                    <p
                      className={`font-mono text-xs uppercase tracking-[0.2em] ${accentClass.replace("border-", "")}`}
                    >
                      De qual país é essa bandeira?
                    </p>
                    <div
                      className={`mx-auto mt-4 flex min-h-52 max-w-md items-center justify-center border-4 p-3 ${cardClass}`}
                    >
                      <img
                        src={`https://flagcdn.com/w320/${question.answer.code}.png`}
                        alt="Bandeira para adivinhar"
                        className="max-h-48 w-full rounded object-contain"
                      />
                    </div>
                  </div>
                  {notice && (
                    <p className="mt-4 text-center text-sm font-bold text-amber-300" role="status">
                      {notice}
                    </p>
                  )}
                  {correct !== null && (
                    <div
                      className={`mt-4 border p-3 text-center text-sm font-bold ${correct ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-red-400 bg-red-400/10 text-red-300"}`}
                      role="status"
                    >
                      {correct ? (
                        `✓ Correto — esta bandeira é de ${question.answer.name}.`
                      ) : (
                        <>
                          ✕ {selected === "timeout" ? "Tempo esgotado" : "Incorreta"}
                          <span className={`mt-1 block text-xs font-normal ${mutedClass}`}>
                            {selected !== "timeout"
                              ? `Você escolheu: ${question.options.find((item) => item.code === selected)?.name}`
                              : ""}
                            <br />
                            Resposta correta: {question.answer.name}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {question.options.map((country) => {
                      const isAnswer = country.code === question.answer.code;
                      const isSelected = selected === country.code;
                      return (
                        <button
                          key={country.code}
                          type="button"
                          disabled={selected !== null}
                          onClick={() => answerQuestion(country)}
                          className={`min-h-12 border p-2 text-sm font-bold transition ${isSelected && correct ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : isSelected && !correct ? "border-red-400 bg-red-400/20 text-red-300" : selected && isAnswer ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : cardClass}`}
                          aria-label={`Responder ${country.name}`}
                        >
                          {country.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={nextQuestion}
                      disabled={!selected}
                      className={`min-h-11 border px-4 py-2 text-sm font-bold disabled:opacity-40 ${accentClass}`}
                    >
                      Próxima bandeira
                    </button>
                    <button
                      type="button"
                      onClick={() => setMusicEnabled((value) => !value)}
                      className={`min-h-11 border px-3 py-2 text-sm ${mutedClass}`}
                      aria-label={musicEnabled ? "Desligar música" : "Ligar música"}
                    >
                      <Music size={16} className="mr-2 inline" />
                      {musicEnabled ? "Música ligada" : "Música desligada"}
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className={`min-h-11 border px-4 py-2 text-sm ${mutedClass}`}
                    >
                      Fechar e salvar
                    </button>
                  </div>
                  <p className={`mt-4 text-center text-xs ${mutedClass}`}>
                    {answered} respostas · {uniqueFlags} bandeiras diferentes · áudio{" "}
                    {musicEnabled ? "ativo" : "desligado"}
                  </p>
                </>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
