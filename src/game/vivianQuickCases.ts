export type QuickCaseOption = { id: string; label: string };
export type QuickCaseStep = {
  id: string;
  question: string;
  options: readonly QuickCaseOption[];
  answer: string;
  explanation: string;
};
export type QuickCaseAudioSource = {
  id: string;
  title: string;
  reference: string;
  audioSrc: string;
};
export type QuickCase = {
  id: string;
  title: string;
  summary: string;
  requiredRecords: readonly string[];
  sourceReference?: string;
  briefing?: string;
  objective?: string;
  audioSources?: readonly QuickCaseAudioSource[];
  steps: readonly QuickCaseStep[];
};

export const WITNESS_CASE_ID = "witness-one-liar" as const;
export const WITNESS_CASE = {
  id: WITNESS_CASE_ID,
  requiredRecords: ["police-report"],
  title: "Depoimentos: encontre a versão incompatível",
  instructions:
    "Estas três falas são enunciados simulados para um exercício de conferência, não citações nem novos depoimentos canônicos. Uma delas contradiz o relatório do xerife.",
  statements: [
    {
      id: "a",
      speaker: "Relato A",
      text: "Os caçadores viram Scott e Vivian discutindo na floresta ao norte da mansão.",
    },
    {
      id: "b",
      speaker: "Relato B",
      text: "Os caçadores estavam perto o bastante para ouvir as palavras da discussão.",
    },
    {
      id: "c",
      speaker: "Relato C",
      text: "O relatório registra Scott como o único suspeito detido naquele momento.",
    },
  ],
  answer: "b",
  explanation:
    "O relatório diz que os caçadores estavam longe demais para ouvir a conversa. Eles viram uma discussão e ouviram gritos, mas o documento não informa as palavras trocadas. Isso identifica apenas a afirmação incompatível; não prova culpa nem cria uma testemunha nova.",
} as const;

export const VIVIAN_QUICK_CASES: readonly QuickCase[] = [
  {
    id: "forest-witnesses",
    title: "O que foi possível ouvir na floresta?",
    summary: "Separe o que o relatório descreve do que ele não permite concluir.",
    requiredRecords: ["police-report"],
    sourceReference: "Relatório policial · PDF p. 90 · 6 de agosto de 1995",
    briefing:
      "O documento registra que dois caçadores ouviram gritos e viram Scott e Vivian discutindo perto da floresta ao norte da mansão. A distância os impediu de ouvir a conversa. Scott aparece como o único suspeito detido naquele momento; o próprio relatório informa que a investigação continuava.",
    objective:
      "Reconstrua em três passos o que foi observado, o que não pôde ser ouvido e o que o relatório permite concluir sobre a autoria.",
    steps: [
      {
        id: "observation",
        question: "Quais observações o relatório atribui aos dois caçadores?",
        options: [
          {
            id: "argument",
            label: "Viram Scott e Vivian discutindo perto da floresta e ouviram gritos.",
          },
          { id: "confession", label: "Viram o crime acontecer e identificaram quem o cometeu." },
          { id: "motive", label: "Ouviram as palavras da conversa e o motivo da discussão." },
        ],
        answer: "argument",
        explanation:
          "O relatório atribui aos caçadores a observação de uma discussão e de gritos; não diz que presenciaram o crime.",
      },
      {
        id: "hearing",
        question: "O que a distância impediu os caçadores de confirmar?",
        options: [
          {
            id: "words",
            label: "As palavras da conversa; o relatório não transcreve o diálogo.",
          },
          { id: "argument", label: "Se houve uma discussão entre Scott e Vivian." },
          { id: "presence", label: "Se Scott e Vivian estavam perto da floresta." },
        ],
        answer: "words",
        explanation:
          "A p. 90 diz que os caçadores estavam longe demais para ouvir a conversa; o conteúdo das falas permanece desconhecido.",
      },
      {
        id: "inference",
        question:
          "Scott era o único suspeito detido. Qual conclusão respeita o restante do relatório?",
        options: [
          { id: "guilty", label: "A detenção comprova que Scott cometeu o crime." },
          {
            id: "open",
            label:
              "O relatório registra a situação de suspeito detido e diz que a investigação continuava.",
          },
          { id: "witnessed", label: "Os caçadores identificaram Scott como autor do crime." },
        ],
        answer: "open",
        explanation:
          "Ser o único suspeito detido descreve o estado da investigação, não uma prova de culpa. O relatório diz que o caso ainda estava sendo investigado.",
      },
    ],
  },
  {
    id: "lake-car",
    title: "O carro submerso de Cherry Creek",
    summary: "Analise a descoberta do veículo e os limites da estimativa de tempo na água.",
    requiredRecords: ["henry-death"],
    sourceReference: "Notícia de jornal · PDF p. 85 · 13 de julho de 1995",
    briefing:
      "A notícia relata que Henry Johnson foi encontrado morto dentro de um veículo submerso no Lago Cherry Creek. O texto estima que o corpo permaneceu na água entre dez e quinze dias e informa que o hospital o viu pela última vez em 28 de junho.",
    objective:
      "Em três passos, identifique o achado físico, interprete com cuidado a estimativa temporal e separe o que a notícia não esclarece.",
    steps: [
      {
        id: "physical-finding",
        question: "Qual é o achado físico descrito na notícia?",
        options: [
          {
            id: "submerged-car",
            label:
              "Henry Johnson foi encontrado morto dentro de um carro submerso no Lago Cherry Creek.",
          },
          {
            id: "empty-car",
            label: "Um carro vazio foi encontrado no estacionamento do hospital.",
          },
          { id: "weapon", label: "A notícia registra a recuperação de uma arma no lago." },
        ],
        answer: "submerged-car",
        explanation:
          "A p. 85 relata a descoberta de Henry no interior de um veículo submerso; a notícia não menciona a recuperação de uma arma.",
      },
      {
        id: "time-estimate",
        question: "O que a estimativa de dez a quinze dias na água permite afirmar?",
        options: [
          {
            id: "range",
            label:
              "A notícia apresenta uma faixa aproximada, não um horário exato da morte ou da entrada do carro no lago.",
          },
          {
            id: "exact-date",
            label:
              "Henry morreu com certeza em 28 de junho, no mesmo dia em que foi visto no hospital.",
          },
          {
            id: "exact-entry",
            label: "O carro foi colocado no lago exatamente dez dias antes da descoberta.",
          },
        ],
        answer: "range",
        explanation:
          "A notícia fornece uma estimativa de permanência na água. Ela não fixa o momento exato da morte nem quando o veículo entrou no lago.",
      },
      {
        id: "open-questions",
        question: "Qual questão permanece sem resposta nessa notícia?",
        options: [
          {
            id: "cause-open",
            label:
              "A causa e as circunstâncias da morte; a notícia registra a descoberta, não uma conclusão oficial.",
          },
          { id: "place-open", label: "O nome do lago onde o carro foi encontrado." },
          { id: "body-open", label: "Se Henry foi encontrado em um veículo." },
        ],
        answer: "cause-open",
        explanation:
          "O catálogo registra que a notícia foi conferida, mas aponta causa e circunstâncias como questões a verificar em fontes oficiais.",
      },
    ],
  },
  {
    id: "scott-hunters-audio",
    title: "Confronto em áudio: Scott e os caçadores",
    summary:
      "Compare duas versões e identifique o que coincide — e o que continua sem verificação.",
    requiredRecords: ["scott-denial", "police-report"],
    sourceReference: "Notícia · PDF p. 88 + relatório policial · PDF p. 90",
    briefing:
      "A p. 88 registra a versão de Scott: ele afirma ter encontrado Vivian na floresta, voltado à cabana e permanecido ali por dias. A p. 90 relata que dois caçadores viram Scott e Vivian discutindo e ouviram gritos, mas não conseguiram ouvir a conversa.",
    objective:
      "Ouça os resumos narrados e, em três etapas, separe o ponto em comum, o alcance da observação dos caçadores e o que nenhuma das fontes confirma independentemente.",
    audioSources: [
      {
        id: "scott-denial-audio",
        title: "Versão de Scott · resumo narrado",
        reference: "Notícia · PDF p. 88",
        audioSrc: "/audio/painscreek/clues/scott-denial.wav",
      },
      {
        id: "police-report-audio",
        title: "Relatório dos caçadores · resumo narrado",
        reference: "Relatório policial · PDF p. 90",
        audioSrc: "/audio/painscreek/clues/police-report.wav",
      },
    ],
    steps: [
      {
        id: "shared-location",
        question: "Qual ponto aparece nas duas fontes?",
        options: [
          {
            id: "forest-encounter",
            label:
              "Ambas situam Scott e Vivian na floresta: Scott relata que a encontrou; os caçadores dizem tê-los visto discutindo.",
          },
          {
            id: "cabin-confirmed",
            label: "Os caçadores confirmam que Scott voltou à cabana e ficou lá por dias.",
          },
          {
            id: "dialogue-confirmed",
            label: "As duas fontes transcrevem as palavras da conversa.",
          },
        ],
        answer: "forest-encounter",
        explanation:
          "A versão de Scott e o relatório dos caçadores situam os dois na floresta, mas isso não confirma os detalhes posteriores narrados por Scott.",
      },
      {
        id: "hunter-hearing",
        question: "O que os caçadores dizem ter ouvido?",
        options: [
          { id: "screams-only", label: "Gritos; estavam longe demais para ouvir a conversa." },
          { id: "full-dialogue", label: "Toda a conversa entre Scott e Vivian." },
          { id: "confession", label: "Uma confissão de Scott sobre o assassinato." },
        ],
        answer: "screams-only",
        explanation:
          "O relatório registra gritos e uma discussão observada, mas diz que os caçadores não conseguiam ouvir o diálogo.",
      },
      {
        id: "unverified-timeline",
        question: "Qual detalhe permanece sem corroboração independente nesses dois registros?",
        options: [
          {
            id: "afterward",
            label:
              "Se Scott voltou à cabana e permaneceu lá por dias; esse trecho é a versão dele, não algo confirmado pelos caçadores.",
          },
          { id: "meeting", label: "Se Scott e Vivian estiveram juntos na floresta." },
          { id: "screams", label: "Se o relatório dos caçadores menciona gritos." },
        ],
        answer: "afterward",
        explanation:
          "A p. 88 registra a declaração de Scott sobre voltar à cabana; a p. 90 não acompanha seus movimentos depois do encontro. Nenhuma delas estabelece autoria do crime.",
      },
    ],
  },
  {
    id: "funds-report",
    title: "Acusação ou conclusão judicial?",
    summary: "Leia a natureza e o limite do relatório sobre a Roberts Relief.",
    requiredRecords: ["funds-investigation"],
    steps: [
      {
        id: "author",
        question: "Quem produziu o relatório sobre as transferências?",
        options: [
          { id: "court", label: "Um tribunal que publicou uma sentença." },
          { id: "investigators", label: "Uma firma de investigação privada." },
          { id: "hospital", label: "O conselho do Hospital Comunitário." },
        ],
        answer: "investigators",
        explanation: "O documento é atribuído à Nelson & Brown Investigations.",
      },
      {
        id: "conclusion",
        question: "O que o documento, por si só, estabelece?",
        options: [
          { id: "conviction", label: "Uma condenação judicial definitiva." },
          {
            id: "allegation",
            label:
              "Que investigadores fizeram uma alegação sobre transferências; não uma decisão judicial.",
          },
          { id: "motive", label: "O motivo de outro crime." },
        ],
        answer: "allegation",
        explanation:
          "A página contém uma alegação investigativa, sem demonstrar condenação ou motivo para outro crime.",
      },
    ],
  },
  {
    id: "family-letter",
    title: "A carta com lacunas",
    summary: "Diferencie o conteúdo relatado da autoria e das partes encobertas.",
    requiredRecords: ["charles-secret"],
    steps: [
      {
        id: "content",
        question: "Qual tema aparece no trecho legível da carta?",
        options: [
          {
            id: "family",
            label:
              "Rumores sobre Vivian, o relacionamento de Charles com Sofia e o desaparecimento de Sofia e da criança.",
          },
          { id: "verdict", label: "Uma sentença judicial sobre a morte de Vivian." },
          { id: "police", label: "Uma transcrição integral do interrogatório de Scott." },
        ],
        answer: "family",
        explanation:
          "O corpo legível relata esses tópicos, mas a imagem tem títulos sobrepostos e trechos incompletos.",
      },
      {
        id: "caveat",
        question: "Qual ressalva deve acompanhar essa leitura?",
        options: [
          {
            id: "confirmed",
            label: "A autoria e o final da carta ainda não estão totalmente confirmados.",
          },
          {
            id: "complete",
            label: "A carta está completa e confirma todos os rumores como fatos.",
          },
          { id: "crime", label: "A carta prova quem assassinou Vivian." },
        ],
        answer: "confirmed",
        explanation:
          "A própria revisão da fonte assinala sobreposição, autoria incerta e final não legível.",
      },
    ],
  },
  {
    id: "borrowed-photo",
    title: "A fotografia emprestada",
    summary: "Cruze a entrada de Dorothy com o que ela não identifica.",
    requiredRecords: ["dorothy-photo"],
    steps: [
      {
        id: "action",
        question: "O que o diário registra sobre Scott?",
        options: [
          { id: "borrowed", label: "Ele pediu emprestada uma fotografia do álbum de Dorothy." },
          { id: "destroyed", label: "Ele destruiu o álbum inteiro." },
          {
            id: "identified",
            label: "Ele revelou a identidade comprovada de todas as pessoas na imagem.",
          },
        ],
        answer: "borrowed",
        explanation:
          "A entrada registra o empréstimo, sem reproduzir nem identificar a fotografia.",
      },
      {
        id: "limit",
        question: "O que permanece em aberto na fonte disponível?",
        options: [
          { id: "identity", label: "A identidade e o conteúdo exatos da fotografia." },
          { id: "owner", label: "Quem emprestou o álbum: a fonte não nomeia ninguém." },
          { id: "request", label: "Se houve um pedido de empréstimo." },
        ],
        answer: "identity",
        explanation:
          "O diário cita Dorothy e o pedido de Scott, mas a imagem não permite identificar com segurança a foto.",
      },
    ],
  },
] as const;

export const QUICK_CASE_IDS = [
  WITNESS_CASE_ID,
  ...VIVIAN_QUICK_CASES.map((quickCase) => quickCase.id),
] as const;

export type QuickCaseResult = "locked" | "supported" | "unsupported";

export function evaluateWitnessClaim(
  selectedStatement: string,
  found: readonly string[],
): QuickCaseResult {
  if (!WITNESS_CASE.requiredRecords.every((recordId) => found.includes(recordId))) return "locked";
  return selectedStatement === WITNESS_CASE.answer ? "supported" : "unsupported";
}

export function evaluateQuickCase(
  caseId: string,
  answers: Readonly<Record<string, string>>,
  found: readonly string[],
): QuickCaseResult {
  const quickCase = VIVIAN_QUICK_CASES.find((item) => item.id === caseId);
  if (!quickCase) return "unsupported";
  if (!quickCase.requiredRecords.every((recordId) => found.includes(recordId))) return "locked";
  return quickCase.steps.every((step) => answers[step.id] === step.answer)
    ? "supported"
    : "unsupported";
}
