import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  DoorOpen,
  FileSearch,
  LockKeyhole,
  MapPin,
  Network,
  RotateCcw,
} from "lucide-react";

import {
  calculateInvestigationScore,
  HINT_COSTS,
  MAX_SCORE,
  normalizeSavedIds,
} from "@/game/vivianInvestigationRules";

type PlaceId = "archive" | "mansion" | "hospital" | "church" | "lake";
type ClueId =
  | "police-report"
  | "scott-denial"
  | "hospital-closure"
  | "hospital-contract"
  | "henry-death"
  | "funds-investigation"
  | "vivian-medical"
  | "charles-secret"
  | "dorothy-photo"
  | "daniel-letter"
  | "code-0318";
type LinkId =
  "scott-versions" | "hospital-money" | "henry-money" | "vivian-charles" | "photo-scott";
type Phase = "explore" | "board" | "timeline" | "report";

type Clue = {
  id: ClueId;
  title: string;
  source: string;
  summary: string;
  caution: string;
  place: PlaceId;
};

type Place = { id: PlaceId; name: string; description: string; unlockHint: string };

type SaveData = {
  version: 2;
  found: ClueId[];
  visited: PlaceId[];
  links: LinkId[];
  activePlace: PlaceId;
  phase: Phase;
  timelineOrder: string[];
  reportSubmitted: boolean;
  chosenConclusion: string;
  mistakes: number;
  usedHints: string[];
};

const SAVE_KEY = "vivian-playable-investigation-v1";

const PLACES: Place[] = [
  {
    id: "archive",
    name: "Arquivo do xerife",
    description:
      "Relatórios oficiais, recortes de jornal e versões registradas sobre a morte de Vivian.",
    unlockHint: "Disponível desde o início.",
  },
  {
    id: "mansion",
    name: "Mansão Roberts",
    description: "Cartas, registros da equipe e relações privadas da família.",
    unlockHint: "Encontre o relatório policial e examine a versão de Scott.",
  },
  {
    id: "hospital",
    name: "Hospital Comunitário",
    description: "Registros médicos e a história financeira da instituição.",
    unlockHint: "Encontre a notícia sobre o fechamento do hospital.",
  },
  {
    id: "church",
    name: "Trinity Church",
    description: "Correspondências que podem esclarecer pessoas, datas e segredos antigos.",
    unlockHint: "Encontre a carta sobre os segredos da família na mansão.",
  },
  {
    id: "lake",
    name: "Lago Cherry Creek",
    description: "Um local ligado à notícia sobre a morte do Dr. Henry Johnson.",
    unlockHint: "Encontre o relatório sobre os fundos da Roberts Relief no hospital.",
  },
];

const CLUES: Clue[] = [
  {
    id: "police-report",
    title: "Relatório policial sobre Vivian",
    source: "Arquivo do xerife · PDF p. 90",
    summary:
      "O relatório registra Scott Brooks como principal suspeito e menciona testemunhas que ouviram uma discussão, sem conseguir identificar as palavras ditas.",
    caution: "Ser suspeito e ter sido visto em uma discussão não prova autoria do homicídio.",
    place: "archive",
  },
  {
    id: "scott-denial",
    title: "Scott nega ter matado Vivian",
    source: "Recorte de jornal · PDF p. 88",
    summary:
      "Scott afirma que encontrou Vivian na floresta e foi embora. A declaração é a versão dele, não uma confirmação independente.",
    caution: "Compare a declaração com o relatório policial e procure corroboração independente.",
    place: "archive",
  },
  {
    id: "hospital-closure",
    title: "Fechamento do Hospital Comunitário",
    source: "Notícia de jornal · PDF p. 84",
    summary:
      "Uma notícia relata o fechamento do hospital em 1956, após décadas de funcionamento, e cita dificuldades financeiras e suspeitas sobre fundos.",
    caution:
      "A OCR precisa de conferência visual; a notícia não prova que as suspeitas eram verdadeiras.",
    place: "archive",
  },
  {
    id: "hospital-contract",
    title: "Carta sobre fornecimento ao hospital",
    source: "Correspondência · PDF p. 92",
    summary:
      "Uma carta datada de 16 de outubro de 1973 agradece a Vivian por escolher a empresa como fornecedora do Hospital Comunitário e menciona a candidatura de Charles a prefeito e o uso de fundos para pesquisa e atendimento a idosos.",
    caution:
      "A carta demonstra uma relação comercial e filantrópica descrita pelo remetente; não prova desvio de fundos nem relação com a morte de Vivian.",
    place: "hospital",
  },
  {
    id: "henry-death",
    title: "Morte do Dr. Henry Johnson",
    source: "Notícia de jornal · PDF p. 85",
    summary:
      "A notícia relata que Henry Johnson foi encontrado morto em um veículo submerso no Lago Cherry Creek em 1995.",
    caution:
      "A notícia registra a descoberta do corpo; causa, circunstâncias e conexões ainda precisam ser confirmadas.",
    place: "lake",
  },
  {
    id: "funds-investigation",
    title: "Investigação sobre fundos da Roberts Relief",
    source: "Carta de investigadores privados · PDF p. 97",
    summary:
      "Um relatório acusa Henry Johnson de transferir dinheiro para uma conta offshore e estima o total em aproximadamente US$ 160 mil.",
    caution:
      "É uma acusação de investigadores privados, não uma conclusão judicial nem prova de motivo para outro crime.",
    place: "hospital",
  },
  {
    id: "vivian-medical",
    title: "Relatório médico de Vivian",
    source: "Registro médico · PDF p. 94",
    summary:
      "O documento atribuído ao Dr. Henry Johnson descreve o estado clínico de Vivian, a necessidade de reabilitação e o efeito estressante da presença de Charles.",
    caution: "O contexto médico não estabelece, por si só, culpa ou motivo criminal.",
    place: "hospital",
  },
  {
    id: "charles-secret",
    title: "Carta sobre os segredos da família",
    source: "Correspondência · PDF p. 93",
    summary:
      "A carta menciona problemas de saúde de Vivian, um relacionamento extraconjugal de Charles e o desaparecimento de Sofia e do filho.",
    caution:
      "O trecho disponível é incompleto e exige comparação com a imagem original e outras cartas.",
    place: "mansion",
  },
  {
    id: "dorothy-photo",
    title: "Fotografia emprestada",
    source: "Diário de Dorothy · PDF pp. 104 e 116",
    summary:
      "O diário registra que Scott pediu emprestada uma fotografia do álbum de Dorothy após uma conversa sobre Charles e Vivian.",
    caution: "A identidade da fotografia e sua relevância ainda não estão estabelecidas.",
    place: "mansion",
  },
  {
    id: "daniel-letter",
    title: "Carta endereçada a Daniel",
    source: "Correspondência · PDF p. 91",
    summary:
      "A carta menciona recuperação, o Dr. Johnson, o fim de alucinações e trabalho na mansão; o autor e o contexto não estão totalmente identificados.",
    caution:
      "O documento está incompleto na transcrição; não atribua autoria ou diagnóstico sem conferir a fonte.",
    place: "church",
  },
  {
    id: "code-0318",
    title: "Código 0318",
    source: "Carta · PDF p. 102",
    summary: "Matthew associa o código 0318 à data da chegada de Sofia ao orfanato.",
    caution:
      "A referência foi conferida visualmente, mas sua função como senha de um objeto do jogo ainda não foi validada. Neste protótipo, ela funciona como exercício de cruzamento, não como chave de cofre.",
    place: "mansion",
  },
];

const LINKS: { id: LinkId; title: string; clues: [ClueId, ClueId]; insight: string }[] = [
  {
    id: "scott-versions",
    title: "Suspeita e negativa",
    clues: ["police-report", "scott-denial"],
    insight:
      "Há versões em tensão: o relatório registra suspeita; Scott nega a autoria. O conflito pede corroboração, não um veredito automático.",
  },
  {
    id: "hospital-money",
    title: "Histórico do hospital e dinheiro",
    clues: ["hospital-closure", "funds-investigation"],
    insight:
      "Os documentos apontam questões financeiras em épocas diferentes. A semelhança temática sugere uma linha de pesquisa, mas não prova que se trata do mesmo esquema.",
  },
  {
    id: "henry-money",
    title: "Henry Johnson: dinheiro e morte",
    clues: ["henry-death", "funds-investigation"],
    insight:
      "O mesmo nome aparece em uma acusação financeira e em uma notícia sobre morte. Isso justifica investigação, mas não estabelece causalidade.",
  },
  {
    id: "vivian-charles",
    title: "Saúde de Vivian e relação com Charles",
    clues: ["vivian-medical", "charles-secret"],
    insight:
      "O relatório médico e a carta familiar dão contexto à relação de Vivian e Charles. Contexto e possível conflito não são prova de homicídio.",
  },
  {
    id: "photo-scott",
    title: "Scott e a fotografia",
    clues: ["dorothy-photo", "police-report"],
    insight:
      "A fotografia aparece no diário de Dorothy, enquanto o relatório situa Scott na investigação. Sem localizar a imagem e seu conteúdo, a ligação é apenas uma pergunta investigativa.",
  },
];

const CLUE_HINTS: Record<ClueId, [string, string, string]> = {
  "police-report": [
    "Identifique quem aparece como suspeito no relatório.",
    "As testemunhas ouviram uma discussão, mas não entenderam as palavras.",
    "Compare com a declaração de Scott na página 88; suspeita não é prova.",
  ],
  "scott-denial": [
    "Observe o que Scott afirma ter feito após encontrar Vivian.",
    "A notícia registra a versão dele, não uma confirmação independente.",
    "Cruze com o relatório policial da página 90 e procure corroboração.",
  ],
  "hospital-closure": [
    "Confira o ano do fechamento e os motivos financeiros citados.",
    "A notícia menciona suspeitas, não comprovação de desvio.",
    "Compare com documentos financeiros posteriores sem presumir que sejam o mesmo esquema.",
  ],
  "hospital-contract": [
    "Confira a data e o motivo da correspondência dirigida a Vivian.",
    "A carta relaciona fornecimento ao hospital e candidatura de Charles.",
    "Use como pista de relações comerciais; ela não comprova desvio.",
  ],
  "henry-death": [
    "Localize onde Henry Johnson foi encontrado.",
    "A descoberta do corpo não explica sozinha a causa da morte.",
    "Compare com a carta financeira, sem presumir relação causal.",
  ],
  "funds-investigation": [
    "Procure quem é acusado e para onde o dinheiro teria ido.",
    "A carta atribui os dados a investigadores privados.",
    "Cruze com outros documentos, mas trate o conteúdo como acusação até confirmação.",
  ],
  "vivian-medical": [
    "Observe quem assina o relatório e o estado clínico descrito.",
    "O texto menciona reabilitação e o efeito da presença de Charles.",
    "Cruze com a carta familiar, separando contexto pessoal de prova criminal.",
  ],
  "charles-secret": [
    "Procure os nomes além de Vivian e Charles.",
    "A carta cita Sofia e o filho, mas o trecho está incompleto.",
    "Compare datas e nomes com outras correspondências antes de concluir.",
  ],
  "dorothy-photo": [
    "A pista envolve um objeto emprestado a Scott.",
    "O diário menciona uma fotografia, mas não identifica seguramente a imagem.",
    "Busque outros registros antes de afirmar o conteúdo ou a importância da foto.",
  ],
  "daniel-letter": [
    "Observe as referências a recuperação, Dr. Johnson e mansão.",
    "O autor e o contexto da carta não estão totalmente identificados.",
    "Procure confirmação independente de autoria, datas e contexto.",
  ],
  "code-0318": [
    "Observe a associação entre Matthew, 0318 e Sofia.",
    "A carta liga o código a uma data relacionada ao orfanato.",
    "Não há confirmação de que o número funcione como senha de fechadura.",
  ],
};

const TIMELINE = [
  { id: "hospital-1956", label: "Fechamento do Hospital Comunitário (1956)", year: 1956 },
  { id: "letter-1973", label: "Carta sobre fornecimento ao hospital (1973)", year: 1973 },
  { id: "funds-1993", label: "Relatório sobre fundos da Roberts Relief (1993)", year: 1993 },
  { id: "vivian-1995", label: "Morte de Vivian e investigação policial (1995)", year: 1995 },
];

function readSave(): SaveData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Omit<Partial<SaveData>, "version"> & {
      version?: 1 | 2;
    };
    if (value.version !== 1 && value.version !== 2) return null;
    const ids = normalizeSavedIds;
    return {
      version: 2,
      found: ids(
        value.found,
        CLUES.map((item) => item.id),
      ),
      visited: ids(
        value.visited,
        PLACES.map((item) => item.id),
      ),
      links: ids(
        value.links,
        LINKS.map((item) => item.id),
      ),
      activePlace: PLACES.some((item) => item.id === value.activePlace)
        ? (value.activePlace as PlaceId)
        : "archive",
      phase: ["explore", "board", "timeline", "report"].includes(value.phase ?? "")
        ? (value.phase as Phase)
        : "explore",
      timelineOrder: ids(
        value.timelineOrder,
        TIMELINE.map((item) => item.id),
      ),
      reportSubmitted: value.reportSubmitted === true,
      chosenConclusion: typeof value.chosenConclusion === "string" ? value.chosenConclusion : "",
      mistakes:
        typeof value.mistakes === "number" && Number.isFinite(value.mistakes)
          ? Math.max(0, Math.floor(value.mistakes))
          : 0,
      usedHints: ids(
        value.usedHints,
        Object.keys(CLUE_HINTS).flatMap((id) => [1, 2, 3].map((level) => `${id}:${level}`)),
      ),
    };
  } catch {
    return null;
  }
}

function isUnlocked(placeId: PlaceId, found: ClueId[]) {
  if (placeId === "archive") return true;
  if (placeId === "mansion")
    return found.includes("police-report") && found.includes("scott-denial");
  if (placeId === "hospital") return found.includes("hospital-closure");
  if (placeId === "church") return found.includes("charles-secret");
  if (placeId === "lake") return found.includes("funds-investigation");
  return false;
}

export function VivianInvestigationGame({ onBack }: { onBack: () => void }) {
  const [saved] = useState(readSave);
  const [found, setFound] = useState<ClueId[]>(saved?.found ?? []);
  const [usedHints, setUsedHints] = useState<string[]>(saved?.usedHints ?? []);
  const [visited, setVisited] = useState<PlaceId[]>(saved?.visited ?? ["archive"]);
  const [links, setLinks] = useState<LinkId[]>(saved?.links ?? []);
  const [activePlace, setActivePlace] = useState<PlaceId>(saved?.activePlace ?? "archive");
  const [phase, setPhase] = useState<Phase>(saved?.phase ?? "explore");
  const [timelineOrder, setTimelineOrder] = useState<string[]>(
    saved?.timelineOrder.length ? saved.timelineOrder : TIMELINE.map((item) => item.id),
  );
  const [reportSubmitted, setReportSubmitted] = useState(saved?.reportSubmitted ?? false);
  const [chosenConclusion, setChosenConclusion] = useState(saved?.chosenConclusion ?? "");
  const [pendingHint, setPendingHint] = useState<{ clueId: ClueId; level: 1 | 2 | 3 } | null>(null);
  const [notice, setNotice] = useState(
    "Comece pelo arquivo do xerife. Leia os registros, colete evidências e cruze fontes antes de concluir.",
  );
  const [selectedClues, setSelectedClues] = useState<ClueId[]>([]);
  const [timelineChecked, setTimelineChecked] = useState(false);

  useEffect(() => {
    if (!pendingHint) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingHint(null);
        setNotice("Dica cancelada. Sua pontuação foi mantida.");
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [pendingHint]);

  useEffect(() => {
    const save: SaveData = {
      version: 2,
      found,
      visited,
      links,
      activePlace,
      phase,
      timelineOrder,
      reportSubmitted,
      chosenConclusion,
      mistakes: 0,
      usedHints,
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [
    found,
    visited,
    links,
    activePlace,
    phase,
    timelineOrder,
    reportSubmitted,
    chosenConclusion,
    usedHints,
  ]);

  const currentPlace = PLACES.find((place) => place.id === activePlace)!;
  const currentClues = CLUES.filter((clue) => clue.place === activePlace);
  const sortedTimeline = useMemo(() => [...timelineOrder], [timelineOrder]);
  const progress = Math.round((found.length / CLUES.length) * 100);
  const { penalty: scorePenalty, score } = calculateInvestigationScore(usedHints);
  const scoreRank =
    score >= 900
      ? "Detetive excepcional"
      : score >= 750
        ? "Investigador atento"
        : score >= 500
          ? "Investigador assistido"
          : score > 0
            ? "Precisou de bastante ajuda"
            : "Assistência máxima";
  const requestHint = (clueId: ClueId, level: 1 | 2 | 3) => {
    const key = `${clueId}:${level}`;
    if (usedHints.includes(key)) {
      setNotice("Esta dica já foi consultada e a penalidade já foi aplicada.");
      return;
    }
    setPendingHint({ clueId, level });
  };

  const cancelHint = () => {
    setPendingHint(null);
    setNotice("Dica cancelada. Sua pontuação foi mantida.");
  };

  const confirmHint = () => {
    if (!pendingHint) return;
    const { clueId, level } = pendingHint;
    const key = `${clueId}:${level}`;
    if (usedHints.includes(key)) {
      setPendingHint(null);
      setNotice("Esta dica já foi consultada e a penalidade já foi aplicada.");
      return;
    }
    setUsedHints((current) => (current.includes(key) ? current : [...current, key]));
    setNotice(
      `Dica ${level}: ${CLUE_HINTS[clueId][level - 1]} Penalidade: -${HINT_COSTS[level - 1]} pontos.`,
    );
    setPendingHint(null);
  };

  const enterPlace = (place: Place) => {
    if (!isUnlocked(place.id, found)) {
      setNotice("Local ainda bloqueado. " + place.unlockHint);
      return;
    }
    setActivePlace(place.id);
    setVisited((items) => (items.includes(place.id) ? items : [...items, place.id]));
    setPhase("explore");
    setSelectedClues([]);
    setNotice(
      "Local acessado. Examine os documentos disponíveis e registre o que cada fonte realmente afirma.",
    );
  };

  const collectClue = (clue: Clue) => {
    if (found.includes(clue.id)) {
      setNotice(
        "Você já catalogou esta evidência. Releia a ressalva antes de usá-la em uma conclusão.",
      );
      return;
    }
    setFound((items) => [...items, clue.id]);
    setNotice("Evidência adicionada ao caderno: " + clue.title);
  };

  const toggleSelectedClue = (id: ClueId) => {
    setSelectedClues((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 2
          ? [...current, id]
          : [current[1] ?? id, id],
    );
  };

  const makeConnection = () => {
    if (selectedClues.length !== 2) {
      setNotice("Selecione exatamente duas evidências para cruzar.");
      return;
    }
    const match = LINKS.find((link) => link.clues.every((id) => selectedClues.includes(id)));
    if (!match) {
      setNotice(
        "Ainda não há uma conexão documentada entre essas duas fontes. Registre a hipótese no caderno, mas não a trate como fato.",
      );
      return;
    }
    if (links.includes(match.id)) {
      setNotice("Essa conexão já está registrada no quadro.");
      return;
    }
    setLinks((items) => [...items, match.id]);
    setNotice("Conexão registrada: " + match.title + ". Leia o limite da inferência no quadro.");
    setSelectedClues([]);
  };

  const checkTimeline = () => {
    setTimelineChecked(true);
    const expected = [...TIMELINE].sort((a, b) => a.year - b.year).map((item) => item.id);
    if (
      timelineOrder.length === expected.length &&
      timelineOrder.every((id, index) => id === expected[index])
    ) {
      setNotice(
        "Cronologia coerente. Você organizou os quatro marcos por data; isso não prova uma ligação causal entre eles.",
      );
    } else {
      setNotice(
        "A ordem ainda não está correta. Confira os anos nos próprios documentos; a data de publicação nem sempre é a data do acontecimento.",
      );
    }
  };

  const submitReport = () => {
    if (found.length < 6 || links.length < 2 || !timelineChecked) {
      setNotice(
        "Relatório bloqueado: colete ao menos 6 evidências, registre 2 conexões e verifique a cronologia.",
      );
      return;
    }
    setPhase("report");
    setNotice(
      "Requisitos cumpridos. Escolha qual linha de investigação merece prioridade no relatório provisório.",
    );
  };

  const resetSave = () => {
    if (!window.confirm("Apagar o progresso desta investigação neste navegador?")) return;
    window.localStorage.removeItem(SAVE_KEY);
    setFound([]);
    setUsedHints([]);
    setVisited(["archive"]);
    setLinks([]);
    setActivePlace("archive");
    setPhase("explore");
    setTimelineOrder(TIMELINE.map((item) => item.id));
    setReportSubmitted(false);
    setChosenConclusion("");
    setSelectedClues([]);
    setTimelineChecked(false);
    setNotice("Investigação reiniciada. Nenhuma evidência foi mantida.");
  };

  const moveTimeline = (id: string, direction: -1 | 1) => {
    setTimelineOrder((current) => {
      const base = current.length ? [...current] : [...TIMELINE].map((item) => item.id);
      const index = base.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= base.length) return base;
      const currentEntry = base[index];
      const targetEntry = base[target];
      if (currentEntry === undefined || targetEntry === undefined) return base;
      base[index] = targetEntry;
      base[target] = currentEntry;
      return base;
    });
    setTimelineChecked(false);
  };

  return (
    <main className="min-h-screen bg-[#11100e] px-3 py-5 text-[#eee9df] sm:px-7 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#c4a779]">
              Capítulo 06 · modo jogável
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">O Caso Vivian Roberts</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
              Explore locais, recolha documentos, cruze evidências e construa uma cronologia. As
              fontes incompletas continuam marcadas como incertas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs"
            >
              <ArrowLeft size={16} /> Voltar ao dossiê
            </button>
            <button
              type="button"
              onClick={resetSave}
              className="inline-flex min-h-11 items-center gap-2 border border-red-900/70 px-4 py-2 font-mono text-xs text-red-200"
            >
              <RotateCcw size={15} /> Reiniciar
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">
              Evidências coletadas
            </p>
            <p className="mt-1 text-3xl">
              {found.length}
              <span className="text-base text-[#81796d]"> / {CLUES.length}</span>
            </p>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">
              Conexões confirmadas
            </p>
            <p className="mt-1 text-3xl">
              {links.length}
              <span className="text-base text-[#81796d]"> / {LINKS.length}</span>
            </p>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">
              Progresso documental
            </p>
            <p className="mt-1 text-3xl">{progress}%</p>
            <div className="mt-2 h-1.5 bg-[#342e25]">
              <div
                className="h-full bg-[#c4a779] transition-all"
                style={{ width: progress + "%" }}
              />
            </div>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">
              Pontuação atual
            </p>
            <p className="mt-1 text-3xl">
              {score}
              <span className="text-base text-[#81796d]"> / {MAX_SCORE}</span>
            </p>
            <p className="mt-1 text-[10px] text-[#c4a779]">
              {usedHints.length} dicas usadas · -{scorePenalty} pts
            </p>
          </div>
        </section>

        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Fases da investigação">
          {(
            [
              { id: "explore", label: "Explorar", icon: MapPin },
              { id: "board", label: "Quadro de evidências", icon: Network },
              { id: "timeline", label: "Cronologia", icon: ClipboardList },
              { id: "report", label: "Relatório", icon: BookOpen },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.id === "report" ? submitReport() : setPhase(item.id))}
                className={`inline-flex min-h-11 items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider ${phase === item.id ? "border-[#c4a779] bg-[#c4a779]/10 text-[#ead8b8]" : "border-[#4b4439] text-[#bdb5a8]"}`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          className="mt-4 border border-[#5c5143] bg-[#1b1a17] p-3 text-sm leading-relaxed text-[#d5c9b5]"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>

        {phase === "explore" && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border border-[#4b4439] bg-[#191714] p-4">
              <h2 className="font-display text-2xl">Locais</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#a9a092]">
                Novos locais abrem quando uma pista documental justifica o próximo passo.
              </p>
              <div className="mt-4 space-y-2">
                {PLACES.map((place) => {
                  const unlocked = isUnlocked(place.id, found);
                  return (
                    <button
                      key={place.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => enterPlace(place)}
                      className={`flex min-h-16 w-full items-start gap-3 border p-3 text-left ${activePlace === place.id ? "border-[#c4a779] bg-[#c4a779]/10" : unlocked ? "border-[#4b4439] hover:border-[#79664c]" : "cursor-not-allowed border-[#302b24] opacity-50"}`}
                    >
                      {unlocked ? (
                        <DoorOpen size={17} className="mt-0.5 shrink-0 text-[#c4a779]" />
                      ) : (
                        <LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#81796d]" />
                      )}
                      <span>
                        <span className="block text-sm">{place.name}</span>
                        <span className="mt-1 block text-[10px] leading-relaxed text-[#a9a092]">
                          {unlocked ? place.description : place.unlockHint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
            <section className="border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                Local atual
              </p>
              <h2 className="mt-2 font-display text-3xl">{currentPlace.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
                {currentPlace.description}
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {currentClues.map((clue) => {
                  const collected = found.includes(clue.id);
                  return (
                    <article key={clue.id} className="border border-[#4b4439] bg-[#211f1b] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl">{clue.title}</h3>
                        {collected && <Check size={17} className="shrink-0 text-emerald-300" />}
                      </div>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
                        {clue.source}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#c9c1b5]">
                        {collected
                          ? clue.summary
                          : "Documento encontrado no local. Examine para registrar a evidência no caderno."}
                      </p>
                      {collected && (
                        <p className="mt-3 border-l-2 border-amber-500/70 pl-3 text-xs leading-relaxed text-[#bdb5a8]">
                          <strong>Ressalva:</strong> {clue.caution}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => collectClue(clue)}
                        className="mt-4 inline-flex min-h-10 items-center gap-2 border border-[#79664c] px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-[#c4a779]"
                      >
                        <FileSearch size={14} />
                        {collected ? "Rever evidência" : "Examinar e coletar"}
                      </button>
                      <div className="mt-4 border-t border-[#4b4439] pt-3">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
                          Dicas graduais · último recurso · perde pontos
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#a9a092]">
                          Use somente se não conseguir avançar pelas evidências. A penalidade só é
                          aplicada após confirmação.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {([1, 2, 3] as const).map((level) => {
                            const key = `${clue.id}:${level}`;
                            const used = usedHints.includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => requestHint(clue.id, level)}
                                disabled={used}
                                className="min-h-9 border border-[#79664c] px-2 py-1 text-[10px] disabled:opacity-40"
                              >
                                {used
                                  ? `Dica ${level} usada`
                                  : `Dica ${level} (-${HINT_COSTS[level - 1]})`}
                              </button>
                            );
                          })}
                        </div>
                        {([1, 2, 3] as const)
                          .filter((level) => usedHints.includes(`${clue.id}:${level}`))
                          .map((level) => (
                            <p
                              key={level}
                              className="mt-2 border-l-2 border-[#c4a779] pl-3 text-xs leading-relaxed text-[#d5c9b5]"
                            >
                              <strong>Dica {level}:</strong> {CLUE_HINTS[clue.id][level - 1]}
                            </p>
                          ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {phase === "board" && (
          <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
              <h2 className="font-display text-2xl">Caderno de evidências</h2>
              <p className="mt-2 text-sm text-[#bdb5a8]">
                Selecione duas evidências para cruzar. O sistema só registra conexões previstas;
                outras hipóteses continuam abertas.
              </p>
              <div className="mt-4 space-y-2">
                {CLUES.filter((clue) => found.includes(clue.id)).map((clue) => (
                  <label
                    key={clue.id}
                    className="flex cursor-pointer items-start gap-3 border border-[#4b4439] bg-[#211f1b] p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClues.includes(clue.id)}
                      onChange={() => toggleSelectedClue(clue.id)}
                      className="mt-1 accent-[#c4a779]"
                    />
                    <span>
                      <span className="block text-sm">{clue.title}</span>
                      <span className="mt-1 block text-[10px] text-[#a9a092]">{clue.source}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={makeConnection}
                className="mt-4 min-h-11 border border-[#c4a779] px-4 py-2 font-mono text-xs uppercase tracking-wider"
              >
                Cruzar as duas selecionadas
              </button>
            </div>
            <div className="border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
              <h2 className="font-display text-2xl">Conexões registradas</h2>
              {links.length ? (
                <div className="mt-4 space-y-3">
                  {LINKS.filter((link) => links.includes(link.id)).map((link) => (
                    <article key={link.id} className="border border-[#79664c] bg-[#211f1b] p-4">
                      <h3 className="font-display text-xl">{link.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#c9c1b5]">{link.insight}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 border border-dashed border-[#4b4439] p-5 text-sm text-[#a9a092]">
                  Nenhuma conexão registrada ainda.
                </p>
              )}
            </div>
          </section>
        )}

        {phase === "timeline" && (
          <section className="mt-5 border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
            <h2 className="font-display text-2xl">Reconstrua a cronologia</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#bdb5a8]">
              Ordene os marcos do mais antigo ao mais recente. Use as datas dos documentos; não
              confunda data de publicação com data do acontecimento.
            </p>
            <div className="mt-5 space-y-2">
              {(sortedTimeline.length ? sortedTimeline : TIMELINE.map((item) => item.id)).map(
                (id) => {
                  const item = TIMELINE.find((entry) => entry.id === id)!;
                  const index = (
                    sortedTimeline.length ? sortedTimeline : TIMELINE.map((entry) => entry.id)
                  ).indexOf(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 border border-[#4b4439] bg-[#211f1b] p-3"
                    >
                      <span className="font-mono text-xs text-[#c4a779]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-sm">{item.label}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label={`Mover ${item.label} para cima`}
                          disabled={index === 0}
                          onClick={() => moveTimeline(id, -1)}
                          className="min-h-9 min-w-9 border border-[#79664c] disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`Mover ${item.label} para baixo`}
                          disabled={index === 3}
                          onClick={() => moveTimeline(id, 1)}
                          className="min-h-9 min-w-9 border border-[#79664c] disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            <button
              type="button"
              onClick={checkTimeline}
              className="mt-4 min-h-11 border border-[#c4a779] px-4 py-2 font-mono text-xs uppercase tracking-wider"
            >
              Verificar cronologia
            </button>
            {timelineChecked && (
              <p className="mt-3 text-xs text-[#bdb5a8]">
                A verificação está refletida no aviso acima. Você pode reorganizar e conferir
                novamente.
              </p>
            )}
          </section>
        )}

        {phase === "report" && (
          <section className="mt-5 border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
            <h2 className="font-display text-3xl">Relatório provisório</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
              O objetivo desta etapa é registrar uma hipótese responsável, não adivinhar um culpado.
              As evidências atuais ainda têm ressalvas de OCR e de verificação documental.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="border border-[#4b4439] bg-[#211f1b] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
                  Pontuação final
                </p>
                <p className="mt-1 text-3xl">
                  {score} / {MAX_SCORE}
                </p>
                <p className="mt-1 text-xs text-[#c4a779]">{scoreRank}</p>
              </div>
              <div className="border border-[#4b4439] bg-[#211f1b] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
                  Penalidade por dicas
                </p>
                <p className="mt-1 text-3xl">-{scorePenalty}</p>
                <p className="mt-1 text-xs text-[#bdb5a8]">{usedHints.length} dicas consultadas</p>
              </div>
              <div className="border border-[#4b4439] bg-[#211f1b] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
                  Pontuação máxima
                </p>
                <p className="mt-1 text-3xl">{MAX_SCORE}</p>
                <p className="mt-1 text-xs text-[#bdb5a8]">Sem usar dicas</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "scott",
                  label: "Priorizar a contradição entre suspeita e negativa de Scott",
                },
                {
                  id: "finances",
                  label: "Priorizar a linha financeira envolvendo hospital e Roberts Relief",
                },
                {
                  id: "family",
                  label: "Priorizar as relações e correspondências da família Roberts",
                },
                {
                  id: "insufficient",
                  label: "Conclusão insuficiente: solicitar mais verificação documental",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setChosenConclusion(item.id)}
                  className={`min-h-20 border p-4 text-left text-sm leading-relaxed ${chosenConclusion === item.id ? "border-[#c4a779] bg-[#c4a779]/10" : "border-[#4b4439] bg-[#211f1b]"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!chosenConclusion}
              onClick={() => {
                setReportSubmitted(true);
                setNotice(
                  "Conclusão provisória registrada. Nenhuma pessoa foi declarada culpada; a investigação permanece aberta até a revisão das fontes.",
                );
              }}
              className="mt-4 min-h-11 border border-[#c4a779] px-4 py-2 font-mono text-xs uppercase tracking-wider disabled:opacity-40"
            >
              Registrar conclusão provisória
            </button>
            {reportSubmitted && (
              <div className="mt-5 border border-emerald-900/70 bg-emerald-950/20 p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-emerald-200">
                  Relatório salvo neste navegador
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#d5c9b5]">
                  {(
                    {
                      scott: "Linha de investigação: versões conflitantes sobre Scott.",
                      finances:
                        "Linha de investigação: histórico financeiro e documentos sobre a Roberts Relief.",
                      family: "Linha de investigação: relações familiares e correspondências.",
                      insufficient:
                        "Conclusão: evidências insuficientes para um veredito responsável.",
                    } as Record<string, string>
                  )[chosenConclusion] ?? "Relatório provisório registrado."}
                </p>
                <p className="mt-2 text-xs text-[#a9a092]">
                  O caso continua aberto. A lógica de veredito final será habilitada quando a
                  solução e as fontes estiverem verificadas.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setPhase("explore")}
              className="mt-4 flex min-h-10 items-center gap-2 text-sm text-[#c4a779]"
            >
              <ArrowLeft size={15} /> Voltar à exploração
            </button>
          </section>
        )}

        {pendingHint && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="vivian-hint-dialog-title"
              aria-describedby="vivian-hint-dialog-description"
              className="w-full max-w-lg border border-[#c4a779] bg-[#1b1a17] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] sm:p-7"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                Ajuda de último recurso
              </p>
              <h2 id="vivian-hint-dialog-title" className="mt-2 font-display text-2xl">
                Deseja continuar?
              </h2>
              <p
                id="vivian-hint-dialog-description"
                className="mt-3 text-sm leading-relaxed text-[#d5c9b5]"
              >
                Esta dica será aberta e reduzirá sua pontuação em{" "}
                <strong>{HINT_COSTS[pendingHint.level - 1]} pontos</strong>. Use-a somente como
                último recurso. Se escolher “Não”, nenhum ponto será perdido.
              </p>
              <p className="mt-3 border-l-2 border-amber-500/70 pl-3 font-mono text-xs uppercase tracking-wider text-amber-100">
                Penalidade: -{HINT_COSTS[pendingHint.level - 1]} pontos
              </p>
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={cancelHint}
                  className="min-h-11 border border-[#79664c] px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-[#c4a779]"
                >
                  Não, voltar
                </button>
                <button
                  type="button"
                  onClick={confirmHint}
                  className="min-h-11 border border-[#c4a779] bg-[#c4a779]/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/20"
                >
                  Sim, abrir dica
                </button>
              </div>
            </section>
          </div>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#4b4439] pt-4 text-xs leading-relaxed text-[#81796d]">
          <span>O progresso é salvo automaticamente neste navegador.</span>
          <span>Protótipo de lógica · sem culpado ou motivo inventados.</span>
        </footer>
      </div>
    </main>
  );
}
