import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BadgeCheck,
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
  MISTAKE_PENALTY,
  normalizeSavedIds,
} from "@/game/vivianInvestigationRules";
import {
  PAINSCREEK_EVIDENCE_001_116,
  type PainscreekEvidence,
  type PainscreekEvidenceStatus,
} from "@/game/painscreekEvidence";
import {
  loadCurrentPlayerName,
  loadPlayerRanking,
  recordPlayerPerformance,
  type PlayerRankingEntry,
} from "@/game/playerRanking";

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
type RiddleId =
  | "archive-identity"
  | "archive-police"
  | "hospital-amount"
  | "hospital-vivian"
  | "mansion-code"
  | "mansion-secret"
  | "mansion-photo"
  | "church-recipient"
  | "lake-doctor";
type CodeLockId = "katherine-cabinet" | "study-drawer" | "gallery-safe";
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

type Riddle = {
  id: RiddleId;
  title: string;
  prompt: string;
  hint: string;
  answers: string[];
  clueId: ClueId;
  place: PlaceId;
  nameLength?: number;
};
type CodeLock = {
  id: CodeLockId;
  title: string;
  prompt: string;
  hint: string;
  code: string;
  reward: string;
  place: PlaceId;
};
type PendingHint = {
  clueId: ClueId;
  level: 1 | 2 | 3;
  key?: string;
  text?: string;
};

type Place = { id: PlaceId; name: string; description: string; unlockHint: string };

type SaveData = {
  version: 5;
  found: ClueId[];
  readClues: ClueId[];
  solvedRiddles: RiddleId[];
  solvedCodeLocks: CodeLockId[];
  visited: PlaceId[];
  links: LinkId[];
  activePlace: PlaceId;
  phase: Phase;
  timelineOrder: string[];
  reportSubmitted: boolean;
  chosenConclusion: string;
  mistakes: number;
  usedHints: string[];
  rankingRecorded: boolean;
};

const SAVE_KEY = "vivian-playable-investigation-v1";
const MAP_TARGET_KEY = "vivian-map-target";
const FINAL_DOSSIER_PASSWORD = "M99";
const DOSSIER_LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const DOSSIER_DIGITS = Array.from({ length: 10 }, (_, index) => String(index));
const CODE_LOCKS: CodeLock[] = [
  {
    id: "katherine-cabinet",
    title: "Armário de Katherine",
    prompt: "O armário da enfermeira aceita um código de quatro dígitos.",
    hint: "Procure o número estampado no verso do alfinete devolvido à recepção.",
    code: "1964",
    reward: "Diário de enfermagem e acesso a uma nova anotação do hospital.",
    place: "hospital",
  },
  {
    id: "study-drawer",
    title: "Gaveta do estudo",
    prompt: "Uma gaveta trancada esconde documentos sobre a família Roberts.",
    hint: "A resposta vem do enigma das peças de xadrez e deve ter quatro dígitos.",
    code: "5194",
    reward: "Correspondência de Charles e uma pista para a investigação financeira.",
    place: "mansion",
  },
  {
    id: "gallery-safe",
    title: "Cofre da galeria",
    prompt: "O cofre usa uma combinação de seis dígitos ligada à identidade de Vincent.",
    hint: "Cruze o aniversário de Vincent com as informações dos retratos da galeria.",
    code: "611975",
    reward: "Fotografia de Sofia com o bebê e uma conexão importante do caso.",
    place: "mansion",
  },
];

type DossierCombination = [string, string, string];

const playLockSound = (kind: "open" | "fail") => {
  if (typeof window === "undefined" || !window.AudioContext) return;
  const context = new window.AudioContext();
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(kind === "open" ? 0.24 : 0.2, now + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "open" ? 0.7 : 0.42));
  master.connect(context.destination);
  void context.resume();

  const addTone = (frequency: number, start: number, duration: number, type: OscillatorType) => {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now + start);
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "open" ? frequency * 1.08 : frequency * 0.65,
      now + start + duration,
    );
    oscillator.connect(master);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration);
  };

  if (kind === "open") {
    addTone(145, 0, 0.12, "square");
    addTone(215, 0.09, 0.13, "square");
    addTone(330, 0.18, 0.18, "triangle");
    addTone(660, 0.34, 0.28, "sine");
  } else {
    addTone(110, 0, 0.18, "sawtooth");
    addTone(78, 0.12, 0.24, "square");
    const buffer = context.createBuffer(1, context.sampleRate * 0.28, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
    }
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, now);
    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(master);
    noise.start(now + 0.04);
    noise.stop(now + 0.32);
  }
  window.setTimeout(() => void context.close(), 900);
};

type InvestigationSound =
  | "collect"
  | "navigate"
  | "select"
  | "success"
  | "fail"
  | "connection"
  | "timeline"
  | "report"
  | "hint";

const playInvestigationSound = (kind: InvestigationSound) => {
  if (typeof window === "undefined" || !window.AudioContext) return;
  const context = new window.AudioContext();
  const now = context.currentTime;
  const profiles: Record<InvestigationSound, Array<[number, number, number, OscillatorType]>> = {
    collect: [
      [440, 0, 0.08, "sine"],
      [660, 0.08, 0.16, "triangle"],
    ],
    navigate: [
      [180, 0, 0.08, "triangle"],
      [260, 0.08, 0.1, "sine"],
    ],
    select: [[320, 0, 0.05, "square"]],
    success: [
      [392, 0, 0.1, "triangle"],
      [523, 0.08, 0.12, "triangle"],
      [784, 0.18, 0.2, "sine"],
    ],
    fail: [
      [180, 0, 0.12, "sawtooth"],
      [120, 0.1, 0.18, "square"],
    ],
    connection: [
      [294, 0, 0.08, "sine"],
      [440, 0.08, 0.14, "triangle"],
    ],
    timeline: [
      [260, 0, 0.07, "sine"],
      [330, 0.08, 0.07, "sine"],
      [494, 0.16, 0.16, "triangle"],
    ],
    report: [
      [330, 0, 0.1, "triangle"],
      [494, 0.1, 0.12, "triangle"],
      [659, 0.22, 0.25, "sine"],
    ],
    hint: [
      [220, 0, 0.1, "sine"],
      [277, 0.1, 0.16, "triangle"],
    ],
  };
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  master.connect(context.destination);
  for (const [frequency, start, duration, type] of profiles[kind]) {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now + start);
    oscillator.connect(master);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration);
  }
  void context.resume();
  window.setTimeout(() => void context.close(), 800);
};

const RIDDLES: Riddle[] = [
  {
    id: "archive-identity",
    title: "A voz por trás da negativa",
    prompt:
      "O relatório chama alguém de principal suspeito. No recorte seguinte, essa mesma pessoa diz que foi embora. Qual é o primeiro nome?",
    hint: "A resposta começa com S e aparece na declaração sobre a floresta.",
    answers: ["scott"],
    clueId: "scott-denial",
    place: "archive",
    nameLength: 5,
  },
  {
    id: "archive-police",
    title: "A natureza do documento",
    prompt: "Qual tipo de documento registra Scott como principal suspeito pela morte de Vivian?",
    hint: "A resposta não é uma pessoa. É o documento oficial arquivado pelo xerife.",
    answers: ["relatorio policial", "relatório policial", "relatorio", "police report"],
    clueId: "police-report",
    place: "archive",
  },
  {
    id: "hospital-amount",
    title: "O valor fora do balanço",
    prompt:
      "A carta dos investigadores fala em uma transferência offshore. Digite o valor aproximado, sem símbolo de moeda.",
    hint: "O número tem seis algarismos: 160 mil dólares.",
    answers: ["160000", "160 mil", "160 mil dolares", "160000 dolares"],
    clueId: "funds-investigation",
    place: "hospital",
  },
  {
    id: "hospital-vivian",
    title: "A assinatura clínica",
    prompt: "Qual médico assina o relatório sobre o estado clínico de Vivian?",
    hint: "É o mesmo médico citado na notícia do Lago Cherry Creek.",
    answers: ["henry", "henry johnson"],
    clueId: "vivian-medical",
    place: "hospital",
    nameLength: 12,
  },
  {
    id: "mansion-code",
    title: "Quatro algarismos para Sofia",
    prompt: "Matthew associa uma sequência à chegada de Sofia ao orfanato. Qual é o código?",
    hint: "São quatro algarismos e começam por zero.",
    answers: ["0318", "03/18", "3 18"],
    clueId: "code-0318",
    place: "mansion",
  },
  {
    id: "mansion-secret",
    title: "O nome que desapareceu",
    prompt: "A carta sobre os segredos da família menciona qual pessoa desaparecida?",
    hint: "O nome começa com S e está ligado à chegada ao orfanato.",
    answers: ["sofia"],
    clueId: "charles-secret",
    place: "mansion",
    nameLength: 5,
  },
  {
    id: "mansion-photo",
    title: "O objeto emprestado",
    prompt: "O que Scott pediu emprestado a Dorothy depois da conversa sobre Charles e Vivian?",
    hint: "É uma imagem guardada no álbum de Dorothy.",
    answers: ["foto", "fotografia"],
    clueId: "dorothy-photo",
    place: "mansion",
  },
  {
    id: "church-recipient",
    title: "O nome no envelope",
    prompt:
      "A correspondência fala em recuperação, no Dr. Johnson e em trabalho na mansão. Para quem ela foi endereçada?",
    hint: "O nome começa com D e também aparece em outra carta do caso.",
    answers: ["daniel"],
    clueId: "daniel-letter",
    place: "church",
    nameLength: 6,
  },
  {
    id: "lake-doctor",
    title: "Quem repousava no carro?",
    prompt: "O carro submerso no lago escondia o corpo de qual médico?",
    hint: "O sobrenome Johnson aparece na notícia.",
    answers: ["henry", "henry johnson"],
    clueId: "henry-death",
    place: "lake",
    nameLength: 12,
  },
];

const CASE_DOSSIER = [
  {
    title: "Relações essenciais",
    items: [
      "Vivian Roberts era casada com Charles e é a vítima central do caso.",
      "Scott Brooks foi adotado pelo Padre Matthew e namorava Trisha Roberts.",
      "Derrick Tyler era motorista de Vivian, filho de Wanda e amigo de infância de Trisha e Scott.",
      "Sofia Miller foi empregada da mansão e é ligada ao passado de Matthew e ao nascimento de Vincent.",
      "Dr. Henry Johnson era o médico ligado ao hospital, a Andrew Reed e ao relatório clínico de Vivian.",
      "Steven Moss investigava o caso; James Howard era o xerife original da investigação.",
    ],
  },
  {
    title: "Cronologia de referência",
    items: [
      "30/06/1971 — casamento de Vivian e Charles Roberts.",
      "Nov/1972 — Sofia Miller é contratada para a mansão.",
      "26/06/1975 — provável morte de Sofia; em julho ela já aparece como desaparecida.",
      "06/04/1985 — Padre Matthew adota Scott Brooks oficialmente.",
      "19/05/1993 — Dr. Johnson começa a ficar inacessível e estranho.",
      "28/06/1995 — última vez em que Henry Johnson é visto vivo; 12/07/1995 — corpo achado no lago.",
      "19–20/07/1995 — assassinato de Vivian Roberts; 20/02/1996 — hospital fechado.",
      "21/03/1997 — Steven Moss chega à cidade; 04/04/1997 — desaparece.",
    ],
  },
  {
    title: "Códigos e itens de campo",
    items: [
      "Código 0318 — associado por Matthew à chegada de Sofia ao orfanato.",
      "Portão do cemitério — código 1131.",
      "Sala de segurança da mansão — código 025241.",
      "Cofre da galeria — código 611975, ligado ao aniversário de Vincent.",
      "Armário da enfermeira Katherine — código 1964, visto no verso de um alfinete.",
      "Cartão de acesso de Henry Johnson — encontrado no hospital; o escritório também depende da energia restaurada.",
    ],
  },
];

const COMPLETE_CASE_DOSSIER = [
  {
    title: "1 · Perfil dos personagens e relações",
    items: [
      "Vivian Roberts — vítima central em 1995; esposa de Charles e reformadora do hospital.",
      "Charles Roberts — prefeito de Painscreek e marido de Vivian.",
      "Magdalene Roberts — mãe de Charles; morreu em 1975 enquanto procurava uma fita secreta.",
      "Bernard Hopkins — mordomo de Vivian; tinha uma paixão por ela e uma coleção de machados.",
      "Dorothy Patterson — chefe das empregadas; desconfiava da relação entre Matthew e Sofia.",
      "Derrick Tyler — motorista de Vivian, filho de Wanda e amigo de infância de Trisha e Scott.",
      "Sofia Miller — ex-empregada contratada em 1972; mãe de Vincent e desaparecida em 1975.",
      "Scott Brooks — principal suspeito; adotado pelo Padre Matthew em 1985 e namorado de Trisha.",
      "Trisha Roberts — filha de Vivian e Charles; amiga de infância de Scott e Derrick.",
      "Padre Matthew Brooks — padre da Trinity Church; adotou Scott e esteve ligado ao passado de Sofia.",
      "Andrew Reed — ex-funcionário internado no hospital; deixou a frase ‘estamos todos juntos nessa’.",
      "Dr. Henry Johnson — médico ligado a Andrew, ao hospital e ao relatório clínico de Vivian.",
      "Steven Moss — investigador particular que chegou em 1997 e desapareceu depois.",
      "James Howard — xerife original do caso, realocado em 1998.",
    ],
  },
  {
    title: "2 · Cronologia completa dos eventos",
    items: [
      "30/06/1971 — casamento de Vivian e Charles Roberts.",
      "Meados de 1970 — Vivian reforma o Hospital Comunitário.",
      "Nov/1972 — Sofia Miller é contratada para a mansão.",
      "1973 — acidente na mina de carvão dos Roberts.",
      "11/06/1974 — nascimento de Trisha Roberts.",
      "Maio/1975 — nascimento de Scott Brooks; a identidade de Vincent permanece como teoria.",
      "26/06/1975 — provável morte de Sofia Miller; em julho ela já consta como desaparecida.",
      "Out/1975 — morte de Magdalene Roberts, com suspeita de envenenamento.",
      "06/04/1985 — Padre Matthew adota Scott oficialmente.",
      "19/05/1993 — Henry Johnson começa a ficar inacessível e estranho.",
      "04/09/1993 — Scott começa a trabalhar na mansão e morar na cabana de caça.",
      "23/09/1994 — Andrew Reed é internado; em jan/1995 Scott é demitido por Vivian.",
      "18–19/06/1995 — Andrew morre; 28/06 é a última vez que Henry é visto vivo.",
      "12/07/1995 — corpo de Henry é encontrado submerso no Lago Cherry Creek.",
      "19–20/07/1995 — Vivian Roberts é assassinada entre 23h e 01h.",
      "20/02/1996 — Hospital Comunitário é fechado; em 1997 Moss chega e desaparece.",
    ],
  },
  {
    title: "3 · Teorias e pontos de investigação",
    items: [
      "Teoria de 1975: Sofia teria sido morta e um pacto de silêncio teria envolvido Vivian, Henry e Andrew.",
      "A fita secreta procurada por Magdalene seria uma peça central para confirmar ou refutar essa teoria.",
      "A frase ‘estamos todos juntos nessa’ pode apontar para o pacto, mas não prova autoria ou cumplicidade.",
      "Identidade de Scott: a coincidência entre seu nascimento em 1975 e Vincent sustenta uma suspeita não confirmada.",
      "Derrick tinha sentimentos por Trisha e evitava Vivian; isso é contexto, não prova criminal.",
      "Bernard tinha paixão por Vivian e acesso a machados; acesso e motivo aparente não estabelecem autoria.",
      "A linha financeira envolve Henry e a Roberts Relief; acusações precisam de confirmação independente.",
    ],
  },
  {
    title: "4 · Guia de acessos, códigos e itens",
    items: [
      "Portão do cemitério — 1131.",
      "Sala de segurança da mansão — 025241.",
      "Cofre da galeria — 611975, relacionado ao aniversário de Vincent.",
      "Gaveta da mesa do estudo — 5194, ligado ao enigma das peças de xadrez.",
      "Armário da enfermeira Katherine — 1964, número estampado no verso de um alfinete.",
      "Caixa de Sofia — 0526, número gravado no broche encontrado no jardim/poço.",
      "Gaveta de Bernard — 0137, obtido pela pontuação dos dardos vermelhos menos a dos amarelos.",
      "Presente de Sofia — 1203, associado à caça ao tesouro espalhada pela cidade.",
      "Código 0318 — Matthew o associa à chegada de Sofia ao orfanato e à data de 18 de março.",
      "Cartão de Henry — encontrado no hospital; o escritório depende da restauração da energia.",
      "Pá e chave inglesa — encontradas na loja de fotografia de Oliver, após obter a chave na casa de Dorothy.",
      "Lanterna e mapa — disponíveis no Gabinete do Xerife desde o início.",
    ],
  },
  {
    title: "5 · Guia de acessos por local e documentos importantes",
    items: [
      "Gabinete do Xerife — lanterna, mapa, mensagens de Moss, jornais, diário de James e chave da mesa.",
      "Hospital — diários de Wanda, registros médicos, cartão de Henry e investigação de fraude por fax.",
      "Trinity Church — jornal sobre Andrew, recorte de Scott e diário de Scott de 1985.",
      "Mansão do prefeito — diários da família, chave da igreja e pistas sobre Sofia, Matthew e Scott.",
      "Cabana de Scott — porões levam à sala secreta, ao quadro de conspiração e à chave dos esgotos.",
      "Casa de Dorothy — diários de 1975 e 1995, chave da loja de Oliver e caixa de Sofia.",
      "Casa de Andrew — carta a Daniel, diário de Andrew e a frase ameaçadora sobre ‘ela’.",
      "Casa de Bernard — diários, foto apagada de Vivian, enigma dos dardos e faca ensanguentada.",
      "Casa de Wanda e Derrick — diários e a pista da cápsula do tempo perto de uma grande pedra.",
      "Anne’s Courtyard Inn — pasta de Moss, códigos, chaves, notas rasgadas e diários de 1997.",
      "Esgotos e porão do hospital — exigem a chave de acesso encontrada na sala secreta de Scott.",
      "Cemitério — a cápsula do tempo exige localização, pá e investigação perto da grande pedra.",
      "Loja de fotografia de Oliver — fornece a pá e a chave inglesa depois que a casa de Dorothy é acessada.",
    ],
  },
  {
    title: "6 · Método de investigação",
    items: [
      "Leia o verso das fotos, as últimas páginas dos diários e as datas incorporadas nos objetos.",
      "Portões exigem chaves físicas, códigos ou conhecimento de uma pista anterior.",
      "Pistas apontam para chaves e soluções, mas podem ser descobertas por exploração independente.",
      "Separe fato documentado, relato de personagem, teoria e coincidência temporal.",
      "Uma conexão entre documentos orienta a investigação, mas não prova culpa por si só.",
    ],
  },
];

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
      "Uma notícia de 21 de fevereiro de 1996 relata o fechamento do hospital após cerca de 60 anos de funcionamento; o texto diz que a instituição foi inaugurada em 1936.",
    caution:
      "A página foi conferida visualmente. A notícia não comprova desvio de fundos nem relação direta com a morte de Vivian.",
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

type CatalogEvidenceLink = { evidenceId: string; sourcePage: number };

const GAME_CATALOG_LINKS: Partial<Record<ClueId, CatalogEvidenceLink>> = {
  "police-report": { evidenceId: "P-010", sourcePage: 90 },
  "scott-denial": { evidenceId: "P-016", sourcePage: 88 },
  "hospital-closure": { evidenceId: "P-013", sourcePage: 84 },
  "henry-death": { evidenceId: "P-008", sourcePage: 85 },
  "funds-investigation": { evidenceId: "P-007", sourcePage: 97 },
  "vivian-medical": { evidenceId: "P-020", sourcePage: 94 },
  "code-0318": { evidenceId: "P-003", sourcePage: 102 },
};

const CATALOG_EVIDENCE_BY_ID = new Map<string, PainscreekEvidence>(
  PAINSCREEK_EVIDENCE_001_116.map((evidence) => [evidence.id, evidence] as const),
);

const REVIEW_STATUS_LABELS: Record<PainscreekEvidenceStatus, string> = {
  unverified: "Não conferida",
  "visually-checked": "Conferida visualmente",
  incomplete: "Incompleta",
  contradictory: "Contraditória",
};

function getCatalogEvidenceForClue(clueId: ClueId) {
  const link = GAME_CATALOG_LINKS[clueId];
  if (!link) return undefined;
  const evidence = CATALOG_EVIDENCE_BY_ID.get(link.evidenceId);
  if (
    !evidence ||
    evidence.status !== "visually-checked" ||
    !evidence.pages.includes(link.sourcePage)
  ) {
    return undefined;
  }
  return { evidence, sourcePage: link.sourcePage };
}

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
  { id: "letter-1973", label: "Carta sobre fornecimento ao hospital (1973)", year: 1973 },
  { id: "funds-1993", label: "Relatório sobre fundos da Roberts Relief (1993)", year: 1993 },
  { id: "vivian-1995", label: "Morte de Vivian e investigação policial (1995)", year: 1995 },
  { id: "hospital-1996", label: "Fechamento do Hospital Comunitário (1996)", year: 1996 },
];

function readSave(): SaveData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Omit<Partial<SaveData>, "version"> & {
      version?: 1 | 2 | 3 | 4 | 5;
    };
    if (![1, 2, 3, 4, 5].includes(value.version ?? 0))
      return null;
    const ids = normalizeSavedIds;
    const timelineCandidates = Array.isArray(value.timelineOrder)
      ? value.timelineOrder.map((id) => (id === "hospital-1956" ? "hospital-1996" : id))
      : value.timelineOrder;
    return {
      version: 5,
      found: ids(
        value.found,
        CLUES.map((item) => item.id),
      ),
      readClues: ids(value.readClues, CLUES.map((item) => item.id)),
      solvedRiddles: ids(
        value.solvedRiddles,
        RIDDLES.map((item) => item.id),
      ),
      solvedCodeLocks: ids(
        value.solvedCodeLocks,
        CODE_LOCKS.map((item) => item.id),
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
        timelineCandidates,
        TIMELINE.map((item) => item.id),
      ),
      reportSubmitted: value.reportSubmitted === true,
      chosenConclusion: typeof value.chosenConclusion === "string" ? value.chosenConclusion : "",
      mistakes:
        typeof value.mistakes === "number" && Number.isFinite(value.mistakes)
          ? Math.max(0, Math.floor(value.mistakes))
          : 0,
      usedHints: ids(value.usedHints, [
        ...Object.keys(CLUE_HINTS).flatMap((id) => [1, 2, 3].map((level) => `${id}:${level}`)),
        ...RIDDLES.map((riddle) => `riddle:${riddle.id}:1`),
        ...CODE_LOCKS.map((lock) => `code:${lock.id}:1`),
      ]),
      rankingRecorded: value.rankingRecorded === true,
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
  const [readClues, setReadClues] = useState<ClueId[]>(saved?.readClues ?? []);
  const [solvedRiddles, setSolvedRiddles] = useState<RiddleId[]>(saved?.solvedRiddles ?? []);
  const [solvedCodeLocks, setSolvedCodeLocks] = useState<CodeLockId[]>(
    saved?.solvedCodeLocks ?? [],
  );
  const [usedHints, setUsedHints] = useState<string[]>(saved?.usedHints ?? []);
  const [visited, setVisited] = useState<PlaceId[]>(saved?.visited ?? ["archive"]);
  const [links, setLinks] = useState<LinkId[]>(saved?.links ?? []);
  const [activePlace, setActivePlace] = useState<PlaceId>(() => {
    const mapTarget =
      typeof window !== "undefined" ? window.localStorage.getItem(MAP_TARGET_KEY) : null;
    if (typeof window !== "undefined") window.localStorage.removeItem(MAP_TARGET_KEY);
    const target = PLACES.some((place) => place.id === mapTarget) ? (mapTarget as PlaceId) : null;
    return target && isUnlocked(target, saved?.found ?? [])
      ? target
      : (saved?.activePlace ?? "archive");
  });
  const [phase, setPhase] = useState<Phase>(saved?.phase ?? "explore");
  const [timelineOrder, setTimelineOrder] = useState<string[]>(
    saved?.timelineOrder.length ? saved.timelineOrder : TIMELINE.map((item) => item.id),
  );
  const [reportSubmitted, setReportSubmitted] = useState(saved?.reportSubmitted ?? false);
  const [chosenConclusion, setChosenConclusion] = useState(saved?.chosenConclusion ?? "");
  const [mistakes, setMistakes] = useState(saved?.mistakes ?? 0);
  const [rankingRecorded, setRankingRecorded] = useState(saved?.rankingRecorded ?? false);
  const [playerName, setPlayerName] = useState(() => loadCurrentPlayerName() || "Investigador");
  const [playerRanking, setPlayerRanking] = useState<PlayerRankingEntry[]>(() =>
    loadPlayerRanking(),
  );
  const [pendingHint, setPendingHint] = useState<PendingHint | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [dossierUnlocked, setDossierUnlocked] = useState(false);
  const [dossierCombination, setDossierCombination] = useState<DossierCombination>(["A", "0", "0"]);
  const [dossierNotice, setDossierNotice] = useState("");
  const [notice, setNotice] = useState(
    "Comece pelo arquivo do xerife. Leia os registros, colete evidências e cruze fontes antes de concluir.",
  );
  const [riddleAnswers, setRiddleAnswers] = useState<Partial<Record<RiddleId, string>>>({});
  const [nameDialAnswers, setNameDialAnswers] = useState<Partial<Record<RiddleId, string>>>({});
  const [codeLockAnswers, setCodeLockAnswers] = useState<Partial<Record<CodeLockId, string>>>({});
  const [selectedClues, setSelectedClues] = useState<ClueId[]>([]);
  const [timelineChecked, setTimelineChecked] = useState(false);
  const [openClueId, setOpenClueId] = useState<ClueId | null>(null);
  const [placeIntroOpen, setPlaceIntroOpen] = useState<PlaceId | null>(null);

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
      version: 5,
      found,
      readClues,
      solvedRiddles,
      solvedCodeLocks,
      visited,
      links,
      activePlace,
      phase,
      timelineOrder,
      reportSubmitted,
      chosenConclusion,
      mistakes,
      usedHints,
      rankingRecorded,
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    window.dispatchEvent(new Event("vivian-investigation-progress"));
  }, [
    found,
    readClues,
    solvedRiddles,
    solvedCodeLocks,
    visited,
    links,
    activePlace,
    phase,
    timelineOrder,
    reportSubmitted,
    chosenConclusion,
    mistakes,
    usedHints,
    rankingRecorded,
  ]);

  const currentPlace = PLACES.find((place) => place.id === activePlace)!;
  const currentClues = CLUES.filter((clue) => clue.place === activePlace);
  const currentRiddles = RIDDLES.filter((riddle) => riddle.place === activePlace);
  const currentCodeLocks = CODE_LOCKS.filter((lock) => lock.place === activePlace);
  const openClue = openClueId ? CLUES.find((clue) => clue.id === openClueId) : undefined;
  const nextRiddle = currentRiddles.find((riddle) => !solvedRiddles.includes(riddle.id));
  const nextCodeLock = currentCodeLocks.find((lock) => !solvedCodeLocks.includes(lock.id));
  const nextClue = currentClues.find((clue) => !found.includes(clue.id));
  const nextStep = nextRiddle
    ? `Leia os arquivos do local e resolva: ${nextRiddle.title}.`
    : nextCodeLock
      ? `Investigue as fontes e abra: ${nextCodeLock.title}.`
      : nextClue
        ? `Abra e registre o próximo arquivo: ${nextClue.title}.`
        : activePlace === "archive"
          ? "Arquivo concluído. Volte à lista de locais para seguir a pista liberada."
          : "Local concluído. Escolha outro local liberado ou avance para o quadro de evidências.";
  const allCodeLocksSolved = solvedCodeLocks.length === CODE_LOCKS.length;
  const sortedTimeline = useMemo(() => [...timelineOrder], [timelineOrder]);
  const progress = Math.round((found.length / CLUES.length) * 100);
  const { penalty: scorePenalty, score } = calculateInvestigationScore(usedHints, mistakes);
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
  const playerRank = playerRanking.findIndex(
    (entry) => entry.name.toLocaleLowerCase("pt-BR") === playerName.toLocaleLowerCase("pt-BR"),
  );
  const requestHint = (clueId: ClueId, level: 1 | 2 | 3) => {
    const key = `${clueId}:${level}`;
    if (usedHints.includes(key)) {
      setNotice("Esta dica já foi consultada e a penalidade já foi aplicada.");
      return;
    }
    setPendingHint({ clueId, level });
  };

  const requestCustomHint = (key: string, text: string) => {
    if (usedHints.includes(key)) {
      setNotice("Esta dica já foi consultada e a penalidade já foi aplicada.");
      return;
    }
    setPendingHint({ clueId: "police-report", level: 1, key, text });
  };

  const cancelHint = () => {
    setPendingHint(null);
    setNotice("Dica cancelada. Sua pontuação foi mantida.");
  };

  const confirmHint = () => {
    if (!pendingHint) return;
    const { clueId, level } = pendingHint;
    const key = pendingHint.key ?? `${clueId}:${level}`;
    if (usedHints.includes(key)) {
      setPendingHint(null);
      setNotice("Esta dica já foi consultada e a penalidade já foi aplicada.");
      return;
    }
    setUsedHints((current) => (current.includes(key) ? current : [...current, key]));
    playInvestigationSound("hint");
    const hintText = pendingHint.text ?? CLUE_HINTS[clueId][level - 1];
    setNotice(`Dica: ${hintText} Penalidade: -${HINT_COSTS[level - 1]} pontos.`);
    setPendingHint(null);
  };

  const enterPlace = (place: Place) => {
    if (!isUnlocked(place.id, found)) {
      playInvestigationSound("fail");
      setNotice("Local ainda bloqueado. " + place.unlockHint);
      return;
    }
    playInvestigationSound("navigate");
    setActivePlace(place.id);
    setVisited((items) => (items.includes(place.id) ? items : [...items, place.id]));
    setPhase("explore");
    setSelectedClues([]);
    setPlaceIntroOpen(place.id);
    setNotice(
      "Local acessado. Abra a sala de leitura para começar pelos arquivos deste local.",
    );
  };

  const openDocument = (clue: Clue) => {
    playInvestigationSound("select");
    setOpenClueId(clue.id);
  };

  const closeDocument = (reopenRoom = true) => {
    if (openClueId) {
      setReadClues((items) => (items.includes(openClueId) ? items : [...items, openClueId]));
    }
    setOpenClueId(null);
    if (reopenRoom) setPlaceIntroOpen(activePlace);
  };

  const beginPlaceReading = (placeId: PlaceId) => {
    const firstClue = CLUES.find((clue) => clue.place === placeId && !readClues.includes(clue.id));
    setPlaceIntroOpen(null);
    if (firstClue) {
      openDocument(firstClue);
      return;
    }
    setNotice("Todos os arquivos deste local já foram registrados. Revise os enigmas ou avance.");
  };

  const collectClue = (clue: Clue) => {
    if (found.includes(clue.id)) {
      setNotice(
        "Você já catalogou esta evidência. Releia a ressalva antes de usá-la em uma conclusão.",
      );
      return;
    }
    setFound((items) => [...items, clue.id]);
    playInvestigationSound("collect");
    setNotice("Evidência adicionada ao caderno: " + clue.title);
  };

  const registerMistake = (message: string) => {
    setMistakes((count) => count + 1);
    setNotice(`${message} Penalidade: -${MISTAKE_PENALTY} pontos.`);
  };

  const solveRiddle = (riddle: Riddle, answer: string) => {
    const normalized = answer
      .trim()
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
    const acceptedAnswers = riddle.answers.map((item) =>
      item
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ""),
    );
    if (!acceptedAnswers.some((item) => item === normalized)) {
      playInvestigationSound("fail");
      registerMistake("Resposta incorreta. Releia os documentos e tente novamente.");
      return;
    }
    if (!solvedRiddles.includes(riddle.id)) {
      setSolvedRiddles((items) => [...items, riddle.id]);
    }
    if (!found.includes(riddle.clueId)) {
      playInvestigationSound("success");
      setFound((items) => [...items, riddle.clueId]);
      setNotice(`Enigma resolvido: ${riddle.title}. Nova pista adicionada ao caderno.`);
    } else {
      setNotice(`Enigma resolvido: ${riddle.title}. A pista já estava catalogada.`);
    }
  };

  const solveCodeLock = (lock: CodeLock, answer: string) => {
    const normalized = answer.replace(/\D/g, "");
    if (normalized !== lock.code) {
      playInvestigationSound("fail");
      registerMistake(
        `Código incorreto na fechadura: ${lock.title}. Releia a pista e tente novamente.`,
      );
      return;
    }
    playInvestigationSound("success");
    if (!solvedCodeLocks.includes(lock.id)) {
      setSolvedCodeLocks((items) => [...items, lock.id]);
    }
    setNotice(`Fechadura aberta: ${lock.title}. ${lock.reward}`);
  };

  const toggleSelectedClue = (id: ClueId) => {
    playInvestigationSound("select");
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
      playInvestigationSound("fail");
      setNotice("Selecione exatamente duas evidências para cruzar.");
      return;
    }
    const match = LINKS.find((link) => link.clues.every((id) => selectedClues.includes(id)));
    if (!match) {
      playInvestigationSound("fail");
      registerMistake(
        "Ainda não há uma conexão documentada entre essas duas fontes. Registre a hipótese no caderno, mas não a trate como fato.",
      );
      return;
    }
    if (links.includes(match.id)) {
      setNotice("Essa conexão já está registrada no quadro.");
      return;
    }
    setLinks((items) => [...items, match.id]);
    playInvestigationSound("connection");
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
      playInvestigationSound("timeline");
      setNotice(
        "Cronologia coerente. Você organizou os quatro marcos por data; isso não prova uma ligação causal entre eles.",
      );
    } else {
      playInvestigationSound("fail");
      registerMistake(
        "A ordem ainda não está correta. Confira os anos nos próprios documentos; a data de publicação nem sempre é a data do acontecimento.",
      );
    }
  };

  const submitReport = () => {
    if (found.length < 6 || links.length < 2 || !timelineChecked) {
      playInvestigationSound("fail");
      setNotice(
        "Relatório bloqueado: colete ao menos 6 evidências, registre 2 conexões e verifique a cronologia.",
      );
      return;
    }
    playInvestigationSound("report");
    setPhase("report");
    setNotice(
      "Requisitos cumpridos. Escolha qual linha de investigação merece prioridade no relatório provisório.",
    );
  };

  const registerFinalRanking = () => {
    if (rankingRecorded) return;
    const normalizedName = playerName.trim() || "Investigador";
    const nextRanking = recordPlayerPerformance(normalizedName, {
      score,
      mistakes,
      hints: usedHints.length,
    });
    setPlayerName(normalizedName);
    setPlayerRanking(nextRanking);
    setRankingRecorded(true);
    playInvestigationSound("report");
    setNotice("Resultado registrado no quadro de honra deste navegador.");
  };

  const rotateDossierDial = (position: 0 | 1 | 2, direction: -1 | 1) => {
    const values = position === 0 ? DOSSIER_LETTERS : DOSSIER_DIGITS;
    setDossierCombination((current) => {
      const next = [...current] as DossierCombination;
      const currentIndex = values.indexOf(current[position]);
      const nextIndex = (currentIndex + direction + values.length) % values.length;
      next[position] = values[nextIndex] ?? "";
      return next;
    });
  };

  const rotateNameDial = (
    riddleId: RiddleId,
    position: number,
    direction: -1 | 1,
    length: number,
  ) => {
    setNameDialAnswers((current) => {
      const next = (current[riddleId] ?? "A".repeat(length))
        .padEnd(length, "A")
        .slice(0, length)
        .split("");
      const currentIndex = DOSSIER_LETTERS.indexOf(next[position] ?? "A");
      const nextIndex =
        (currentIndex + direction + DOSSIER_LETTERS.length) % DOSSIER_LETTERS.length;
      next[position] = DOSSIER_LETTERS[nextIndex] ?? "A";
      return { ...current, [riddleId]: next.join("") };
    });
  };

  const submitDossierCombination = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dossierCombination.join("") !== FINAL_DOSSIER_PASSWORD) {
      playLockSound("fail");
      setMistakes((count) => count + 1);
      setDossierNotice(
        `O cadeado não abriu. A combinação está incorreta. Penalidade: -${MISTAKE_PENALTY} pontos.`,
      );
      return;
    }
    playLockSound("open");
    setDossierUnlocked(true);
    setDossierNotice("");
  };

  const resetSave = () => {
    if (!window.confirm("Apagar o progresso desta investigação neste navegador?")) return;
    window.localStorage.removeItem(SAVE_KEY);
    setFound([]);
    setReadClues([]);
    setSolvedRiddles([]);
    setSolvedCodeLocks([]);
    setUsedHints([]);
    setVisited(["archive"]);
    setLinks([]);
    setActivePlace("archive");
    setPhase("explore");
    setTimelineOrder(TIMELINE.map((item) => item.id));
    setReportSubmitted(false);
    setChosenConclusion("");
    setMistakes(0);
    setRankingRecorded(false);
    setPlayerRanking(loadPlayerRanking());
    setSelectedClues([]);
    setTimelineChecked(false);
    setPlaceIntroOpen(null);
    setOpenClueId(null);
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
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#a9a092]">
              Fichas do catálogo aparecem apenas para páginas já cotejadas visualmente; outras
              pistas permanecem sem vínculo até a fonte ser validada.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDossierOpen(true);
                setDossierUnlocked(false);
                setDossierCombination(["A", "0", "0"]);
                setDossierNotice("");
              }}
              className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs"
            >
              <LockKeyhole size={15} /> Dossiê completo
            </button>
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
          <details className="mt-4 border border-[#4b4439] bg-[#191714]">
            <summary className="cursor-pointer list-none px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#e1c18d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c4a779]">
              Dossiê de apoio · relações, cronologia e códigos
            </summary>
            <div className="grid gap-4 border-t border-[#4b4439] p-4 lg:grid-cols-3">
              {CASE_DOSSIER.map((section) => (
                <section key={section.title} aria-label={section.title}>
                  <h2 className="font-display text-xl text-[#ead8b8]">{section.title}</h2>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#bdb5a8]">
                    {section.items.map((item) => (
                      <li key={item} className="border-l border-[#79664c] pl-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </details>
        )}

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
              <div className="mt-4 border border-[#c4a779]/60 bg-[#c4a779]/10 p-4" aria-label="Próximo passo">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                  Próximo passo recomendado
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#ead8b8]">{nextStep}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-[#a9a092]">
                  Abra cada arquivo antes de registrar a evidência. O botão de voltar mantém você no
                  local atual para não perder o contexto.
                </p>
              </div>
              {currentRiddles.length > 0 && (
                <section
                  className="mt-5 border border-[#79664c] bg-[#211f1b] p-4"
                  aria-label="Enigmas de arquivo"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                        Enigmas de arquivo
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-[#bdb5a8]">
                        Resolva o desafio para revelar uma pista e avançar até os próximos diários.
                      </p>
                    </div>
                    <FileSearch size={18} className="shrink-0 text-[#c4a779]" />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {currentRiddles.map((riddle) => {
                      const solved = solvedRiddles.includes(riddle.id);
                      const answer = riddleAnswers[riddle.id] ?? "";
                      const hintKey = `riddle:${riddle.id}:1`;
                      const hintUsed = usedHints.includes(hintKey);
                      const nameAnswer = riddle.nameLength
                        ? (nameDialAnswers[riddle.id] ?? "A".repeat(riddle.nameLength))
                        : "";
                      return (
                        <article
                          key={riddle.id}
                          className="border border-[#4b4439] bg-[#171512] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-display text-xl">{riddle.title}</h3>
                            {solved && <Check size={17} className="shrink-0 text-emerald-300" />}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-[#c9c1b5]">
                            {riddle.prompt}
                          </p>
                          {solved ? (
                            <p className="mt-3 border-l-2 border-emerald-400/70 pl-3 text-xs text-emerald-100">
                              Enigma resolvido. A pista foi adicionada ao caderno.
                            </p>
                          ) : (
                            <form
                              className="mt-4 flex flex-wrap gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                solveRiddle(riddle, riddle.nameLength ? nameAnswer : answer);
                              }}
                            >
                              {riddle.nameLength ? (
                                <div className="w-full">
                                  <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
                                    {nameAnswer.split("").map((letter, index) => (
                                      <div key={`${riddle.id}-${index}`} className="text-center">
                                        <button
                                          type="button"
                                          aria-label={`Girar letra ${index + 1} para cima`}
                                          onClick={() =>
                                            rotateNameDial(riddle.id, index, 1, riddle.nameLength!)
                                          }
                                          className="min-h-8 w-full border border-[#4b4439] text-[#c4a779] hover:bg-[#c4a779]/10"
                                        >
                                          ▲
                                        </button>
                                        <div className="py-2 font-mono text-xl text-[#ead8b8]">
                                          {letter}
                                        </div>
                                        <button
                                          type="button"
                                          aria-label={`Girar letra ${index + 1} para baixo`}
                                          onClick={() =>
                                            rotateNameDial(riddle.id, index, -1, riddle.nameLength!)
                                          }
                                          className="min-h-8 w-full border border-[#4b4439] text-[#c4a779] hover:bg-[#c4a779]/10"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-[#81796d]">
                                    Nome selecionado: {nameAnswer}
                                  </p>
                                </div>
                              ) : (
                                <input
                                  value={answer}
                                  onChange={(event) =>
                                    setRiddleAnswers((items) => ({
                                      ...items,
                                      [riddle.id]: event.target.value,
                                    }))
                                  }
                                  aria-label={`Resposta para ${riddle.title}`}
                                  placeholder="Digite sua resposta"
                                  className="min-h-10 min-w-0 flex-1 border border-[#4b4439] bg-[#11100e] px-3 text-sm outline-none focus:border-[#c4a779]"
                                />
                              )}
                              <button
                                type="submit"
                                className="min-h-10 border border-[#c4a779] px-3 font-mono text-[10px] uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/10"
                              >
                                Verificar
                              </button>
                            </form>
                          )}
                          {hintUsed ? (
                            <p className="mt-3 border-l-2 border-[#c4a779] pl-3 text-xs leading-relaxed text-[#d5c9b5]">
                              <strong>Dica desbloqueada:</strong> {riddle.hint}
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestCustomHint(hintKey, riddle.hint)}
                              className="mt-3 min-h-9 border border-[#79664c] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#c4a779] hover:border-[#c4a779]"
                            >
                              Ver dica (-{HINT_COSTS[0]} pontos)
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
              {currentCodeLocks.length > 0 && (
                <section
                  className="mt-5 border border-[#79664c] bg-[#211f1b] p-4"
                  aria-label="Fechaduras de código"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                        Fechaduras de código
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-[#bdb5a8]">
                        Encontre a combinação nas fontes e digite os algarismos como em um painel de
                        segurança.
                      </p>
                    </div>
                    <LockKeyhole size={18} className="shrink-0 text-[#c4a779]" />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {currentCodeLocks.map((lock) => {
                      const solved = solvedCodeLocks.includes(lock.id);
                      const answer = codeLockAnswers[lock.id] ?? "";
                      const hintKey = `code:${lock.id}:1`;
                      const hintUsed = usedHints.includes(hintKey);
                      return (
                        <article key={lock.id} className="border border-[#4b4439] bg-[#171512] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-display text-xl">{lock.title}</h3>
                            {solved && <Check size={17} className="shrink-0 text-emerald-300" />}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-[#c9c1b5]">
                            {lock.prompt}
                          </p>
                          {solved ? (
                            <p className="mt-3 border-l-2 border-emerald-400/70 pl-3 text-xs leading-relaxed text-emerald-100">
                              Fechadura aberta. {lock.reward}
                            </p>
                          ) : (
                            <form
                              className="mt-4 flex flex-wrap gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                solveCodeLock(lock, answer);
                              }}
                            >
                              <input
                                value={answer}
                                onChange={(event) =>
                                  setCodeLockAnswers((items) => ({
                                    ...items,
                                    [lock.id]: event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, lock.code.length),
                                  }))
                                }
                                inputMode="numeric"
                                maxLength={lock.code.length}
                                aria-label={`Código para ${lock.title}`}
                                placeholder={`${lock.code.length} dígitos`}
                                className="min-h-10 min-w-0 flex-1 border border-[#4b4439] bg-[#11100e] px-3 font-mono text-sm tracking-[0.35em] outline-none focus:border-[#c4a779]"
                              />
                              <button
                                type="submit"
                                className="min-h-10 border border-[#c4a779] px-3 font-mono text-[10px] uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/10"
                              >
                                Abrir código
                              </button>
                            </form>
                          )}
                          {hintUsed ? (
                            <p className="mt-3 border-l-2 border-[#c4a779] pl-3 text-xs leading-relaxed text-[#d5c9b5]">
                              <strong>Pista desbloqueada:</strong> {lock.hint}
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestCustomHint(hintKey, lock.hint)}
                              className="mt-3 min-h-9 border border-[#79664c] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#c4a779] hover:border-[#c4a779]"
                            >
                              Ver pista (-{HINT_COSTS[0]} pontos)
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {currentClues.map((clue) => {
                  const collected = found.includes(clue.id);
                  const catalogLink = collected ? getCatalogEvidenceForClue(clue.id) : undefined;
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
                      {catalogLink && (
                        <details className="mt-3 border border-[#79664c]/70 bg-[#171510] p-3">
                          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-[#c4a779] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c4a779]">
                            Ficha documental do catálogo · {catalogLink.evidence.id} ·{" "}
                            {REVIEW_STATUS_LABELS[catalogLink.evidence.status]}
                          </summary>
                          <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#c9c1b5]">
                            <p>
                              <strong>Origem desta pista:</strong> PDF p. {catalogLink.sourcePage}.
                              <span className="block text-[#a9a092]">
                                O registro {catalogLink.evidence.id} agrupa as páginas{" "}
                                {catalogLink.evidence.pages.join(", ")}; abrir a ficha é opcional e
                                pode revelar contexto de outras páginas.
                              </span>
                            </p>
                            <p>
                              <strong>Tipo de fonte:</strong> {catalogLink.evidence.sourceType}
                            </p>
                            <p>
                              <strong>O catálogo registra:</strong>{" "}
                              {catalogLink.evidence.documented}
                            </p>
                            <p>
                              <strong>Pendência ou limite:</strong>{" "}
                              {catalogLink.evidence.pendingVerification}
                            </p>
                            <p>
                              <strong>Inferência permitida:</strong>{" "}
                              {catalogLink.evidence.playerInference}
                            </p>
                            <p className="border-t border-[#4b4439] pt-2 text-[#a9a092]">
                              “Conferida visualmente” descreve o cotejo da fonte; não confirma
                              automaticamente todas as alegações nem prova causalidade.
                            </p>
                          </div>
                        </details>
                      )}
                      <button
                        type="button"
                        onClick={() => openDocument(clue)}
                        className="mt-4 inline-flex min-h-10 items-center gap-2 border border-[#79664c] px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-[#c4a779]"
                      >
                        <FileSearch size={14} />
                        {collected ? "Abrir arquivo novamente" : "Abrir arquivo para leitura"}
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
                  Penalidade total
                </p>
                <p className="mt-1 text-3xl">-{scorePenalty}</p>
                <p className="mt-1 text-xs text-[#bdb5a8]">
                  {usedHints.length} dicas · {mistakes} erros (-{mistakes * MISTAKE_PENALTY} pontos)
                </p>
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
                <div className="mt-5 border border-[#79664c] bg-[#171512] p-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#c4a779]">
                    Quadro de honra · resultado desta investigação
                  </p>
                  {!rankingRecorded ? (
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <label className="min-w-56 flex-1 text-xs text-[#bdb5a8]">
                        Nome ou codinome do investigador
                        <input
                          value={playerName}
                          onChange={(event) => setPlayerName(event.target.value)}
                          maxLength={24}
                          aria-label="Nome do investigador"
                          className="mt-1 min-h-10 w-full border border-[#4b4439] bg-[#11100e] px-3 text-sm text-[#eee9df] outline-none focus:border-[#c4a779]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={registerFinalRanking}
                        className="min-h-10 border border-[#c4a779] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8]"
                      >
                        Registrar pontuação
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-[#a9a092]">Investigador</p>
                        <p className="mt-1 text-xl text-[#ead8b8]">{playerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#a9a092]">Posição neste navegador</p>
                        <p className="mt-1 text-xl text-[#ead8b8]">
                          {playerRank >= 0 ? `#${playerRank + 1}` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#a9a092]">Pontuação registrada</p>
                        <p className="mt-1 text-xl text-[#ead8b8]">{score} pontos</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 grid gap-2 text-xs text-[#bdb5a8] sm:grid-cols-3">
                    <p>Base: {MAX_SCORE} pontos</p>
                    <p>
                      Dicas: -
                      {usedHints.reduce(
                        (total, key) =>
                          total + (key.endsWith(":1") ? 20 : key.endsWith(":2") ? 50 : 100),
                        0,
                      )}{" "}
                      pontos
                    </p>
                    <p>Erros: -{mistakes * MISTAKE_PENALTY} pontos</p>
                  </div>
                </div>
                {allCodeLocksSolved ? (
                  <p className="mt-4 border border-emerald-700/70 bg-emerald-950/30 p-3 font-mono text-sm uppercase tracking-wider text-emerald-100">
                    Senha final revelada: <strong>{FINAL_DOSSIER_PASSWORD}</strong>
                  </p>
                ) : (
                  <p className="mt-4 border border-amber-700/70 bg-amber-950/20 p-3 text-xs leading-relaxed text-amber-100">
                    Resolva as {CODE_LOCKS.length} fechaduras de código na fase Explorar para
                    revelar a senha final do dossiê.
                  </p>
                )}
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

        {placeIntroOpen && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/85 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="vivian-place-entry-title"
              className="w-full max-w-2xl border border-[#c4a779] bg-[#1b1a17] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.8)] sm:p-7"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                Entrada de investigação
              </p>
              <h2 id="vivian-place-entry-title" className="mt-2 font-display text-3xl">
                {PLACES.find((place) => place.id === placeIntroOpen)?.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#d5c9b5]">
                {PLACES.find((place) => place.id === placeIntroOpen)?.description}
              </p>
              <div className="mt-5 border border-[#4b4439] bg-[#211f1b] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
                  Arquivos disponíveis nesta sala
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#c9c1b5]">
                  {CLUES.filter((clue) => clue.place === placeIntroOpen).map((clue) => {
                    const completed = readClues.includes(clue.id);
                    return (
                      <li key={clue.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPlaceIntroOpen(null);
                            openDocument(clue);
                          }}
                          className={`flex min-h-11 w-full items-center gap-2 border px-3 py-2 text-left text-sm transition ${completed ? "border-emerald-500/60 bg-emerald-950/20 text-emerald-100" : "border-[#4b4439] text-[#c9c1b5] hover:border-[#c4a779]"}`}
                        >
                          {completed ? (
                            <Check size={15} className="shrink-0 text-emerald-300" aria-hidden="true" />
                          ) : (
                            <FileSearch size={14} className="shrink-0 text-[#c4a779]" aria-hidden="true" />
                          )}
                          <span className="flex-1">{clue.title}</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                            {completed ? "Lido" : "Abrir"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[#a9a092]">
                Comece pela leitura do primeiro arquivo. Depois de fechar a ficha, você poderá
                resolver os enigmas e registrar as evidências sem sair deste local.
              </p>
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPlaceIntroOpen(null)}
                  className="min-h-11 border border-[#79664c] px-4 py-2 font-mono text-xs uppercase tracking-wider"
                >
                  Ver sala primeiro
                </button>
                <button
                  type="button"
                  onClick={() => beginPlaceReading(placeIntroOpen)}
                  className="min-h-11 border border-[#c4a779] bg-[#c4a779]/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8]"
                >
                  Começar leitura
                </button>
              </div>
            </section>
          </div>
        )}

        {openClue && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/85 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="vivian-document-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-auto border border-[#c4a779] bg-[#1b1a17] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.8)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#5c5143] pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                    Arquivo aberto · {currentPlace.name}
                  </p>
                  <h2 id="vivian-document-title" className="mt-2 font-display text-3xl">
                    {openClue.title}
                  </h2>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
                    {openClue.source}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Fechar arquivo"
                  onClick={() => closeDocument(true)}
                  className="min-h-10 border border-[#79664c] px-3 font-mono text-xs text-[#ead8b8]"
                >
                  Voltar
                </button>
              </div>
              <div className="mt-5 border-l-2 border-[#c4a779] bg-[#211f1b] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
                  Leitura registrada na ficha
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#eee9df]">{openClue.summary}</p>
              </div>
              <div className="mt-4 border border-amber-500/50 bg-amber-950/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-amber-200">
                  Limite documental
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-100/90">{openClue.caution}</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[#a9a092]">
                Separe fato documentado, relato e alegação. Registrar esta ficha não transforma uma
                acusação ou inferência em fato.
              </p>
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                {!found.includes(openClue.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      collectClue(openClue);
                      closeDocument(false);
                    }}
                    className="min-h-11 border border-[#c4a779] bg-[#c4a779]/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8]"
                  >
                    Registrar evidência no caderno
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => closeDocument(true)}
                  className="min-h-11 border border-[#79664c] px-4 py-2 font-mono text-xs uppercase tracking-wider"
                >
                  Voltar ao local
                </button>
              </div>
            </section>
          </div>
        )}

        {dossierOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
            {dossierUnlocked ? (
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="complete-dossier-title"
                className="max-h-[90vh] w-full max-w-6xl overflow-auto border border-[#c4a779] bg-[#171512] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.8)] sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                      Arquivo liberado · senha final confirmada
                    </p>
                    <h2
                      id="complete-dossier-title"
                      className="mt-2 font-display text-3xl sm:text-4xl"
                    >
                      Dossiê completo de Painscreek
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
                      Relações, cronologia, teorias, códigos, acessos e método de investigação
                      reunidos em um só arquivo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDossierOpen(false);
                      setDossierUnlocked(false);
                    }}
                    className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs uppercase tracking-wider"
                  >
                    <ArrowLeft size={15} /> Voltar
                  </button>
                </div>
                <section
                  aria-label="Vitória da investigação"
                  className="mt-6 overflow-hidden border border-emerald-400/70 bg-[radial-gradient(circle_at_top,#315442_0%,#18241d_45%,#111613_100%)] p-6 shadow-[0_0_45px_rgba(74,222,128,0.12)] sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300">
                        Caso encerrado · vitória
                      </p>
                      <h3 className="mt-3 font-display text-4xl text-emerald-50 sm:text-5xl">
                        Caso resolvido
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100/80">
                        Você reuniu as pistas, abriu as fechaduras e confirmou a combinação final. O
                        dossiê completo de Painscreek agora está disponível para consulta.
                      </p>
                    </div>
                    <BadgeCheck size={64} strokeWidth={1.2} className="text-emerald-300" />
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="border border-emerald-300/20 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-200/60">
                        Fechaduras
                      </p>
                      <p className="mt-1 font-display text-2xl text-emerald-50">
                        {CODE_LOCKS.length}/{CODE_LOCKS.length}
                      </p>
                    </div>
                    <div className="border border-emerald-300/20 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-200/60">
                        Arquivo
                      </p>
                      <p className="mt-1 font-display text-2xl text-emerald-50">M99</p>
                    </div>
                    <div className="border border-emerald-300/20 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-200/60">
                        Status
                      </p>
                      <p className="mt-1 font-display text-2xl text-emerald-50">Confirmado</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDossierOpen(false);
                      setDossierUnlocked(false);
                    }}
                    className="mt-6 min-h-11 border border-emerald-300/70 bg-emerald-300/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-emerald-50 hover:bg-emerald-300/20"
                  >
                    Continuar investigando
                  </button>
                </section>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {COMPLETE_CASE_DOSSIER.map((section) => (
                    <details
                      key={section.title}
                      open
                      className="border border-[#4b4439] bg-[#211f1b] p-4 sm:p-5"
                    >
                      <summary className="cursor-pointer list-none font-display text-2xl text-[#ead8b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c4a779]">
                        {section.title}
                      </summary>
                      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#c9c1b5]">
                        {section.items.map((item) => (
                          <li key={item} className="border-l-2 border-[#79664c] pl-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>
            ) : (
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="dossier-gate-title"
                className="w-full max-w-lg border border-[#c4a779] bg-[#1b1a17] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.8)] sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <LockKeyhole size={24} className="mt-1 shrink-0 text-[#c4a779]" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                      Arquivo lacrado
                    </p>
                    <h2 id="dossier-gate-title" className="mt-2 font-display text-3xl">
                      Dossiê completo
                    </h2>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[#d5c9b5]">
                  Gire os três discos até formar a senha final. A primeira posição usa letras; as
                  duas seguintes usam números.
                </p>
                {!reportSubmitted && (
                  <p className="mt-3 border-l-2 border-amber-500/70 pl-3 text-xs leading-relaxed text-amber-100">
                    O relatório ainda não foi registrado. Resolva o caso para revelar a combinação
                    final e liberar o mecanismo.
                  </p>
                )}
                <form className="mt-5 space-y-4" onSubmit={submitDossierCombination}>
                  <div className="grid grid-cols-3 gap-3" aria-label="Fechadura de três discos">
                    {dossierCombination.map((value, position) => (
                      <div
                        key={position}
                        className="border border-[#79664c] bg-[#11100e] p-2 text-center"
                      >
                        <button
                          type="button"
                          aria-label={`Girar disco ${position + 1} para cima`}
                          onClick={() => rotateDossierDial(position as 0 | 1 | 2, 1)}
                          className="min-h-9 w-full border border-[#4b4439] text-[#c4a779] hover:bg-[#c4a779]/10"
                        >
                          ▲
                        </button>
                        <div
                          aria-label={`Valor do disco ${position + 1}: ${value}`}
                          className="py-4 font-mono text-4xl text-[#ead8b8]"
                        >
                          {value}
                        </div>
                        <button
                          type="button"
                          aria-label={`Girar disco ${position + 1} para baixo`}
                          onClick={() => rotateDossierDial(position as 0 | 1 | 2, -1)}
                          className="min-h-9 w-full border border-[#4b4439] text-[#c4a779] hover:bg-[#c4a779]/10"
                        >
                          ▼
                        </button>
                        <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-[#81796d]">
                          {position === 0 ? "Letras" : "Números"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-[#a9a092]">
                    Combinação selecionada: {dossierCombination.join("")}
                  </p>
                  {dossierNotice && (
                    <p role="alert" className="text-sm text-amber-100">
                      {dossierNotice}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    {!reportSubmitted && (
                      <button
                        type="button"
                        onClick={() => {
                          setDossierOpen(false);
                          submitReport();
                        }}
                        className="min-h-11 border border-[#c4a779] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8]"
                      >
                        Ir para relatório
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDossierOpen(false)}
                      className="min-h-11 border border-[#79664c] px-4 py-2 font-mono text-xs uppercase tracking-wider"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="min-h-11 border border-[#c4a779] bg-[#c4a779]/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8]"
                    >
                      Abrir dossiê
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
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
