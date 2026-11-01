export type QuickCaseOption = { id: string; label: string };
export type QuickCaseStep = {
  id: string;
  question: string;
  options: readonly QuickCaseOption[];
  answer: string;
  explanation: string;
};
export type QuickCase = {
  id: string;
  title: string;
  summary: string;
  requiredRecords: readonly string[];
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
      text: "O relatório registra Scott como principal suspeito da investigação.",
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
    steps: [
      {
        id: "observation",
        question: "O que os caçadores relataram observar?",
        options: [
          {
            id: "argument",
            label: "Scott e Vivian discutiam; os caçadores também ouviram gritos.",
          },
          { id: "confession", label: "Scott confessou o crime diante deles." },
          { id: "motive", label: "Eles ouviram o motivo da discussão." },
        ],
        answer: "argument",
        explanation: "O relatório descreve uma discussão e gritos, sem transcrever palavras.",
      },
      {
        id: "limit",
        question: "Qual conclusão respeita o limite da fonte?",
        options: [
          { id: "proved", label: "A presença na discussão prova quem cometeu o crime." },
          {
            id: "limit",
            label:
              "O relato confirma a discussão observada, não o conteúdo nem a autoria do crime.",
          },
          { id: "nothing", label: "O relatório não registra nenhuma observação de testemunhas." },
        ],
        answer: "limit",
        explanation:
          "A fonte relata observações limitadas e registra uma suspeita, não uma conclusão de autoria.",
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
