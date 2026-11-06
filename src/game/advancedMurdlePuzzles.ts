export const SPARROW_ADVANCED_SEQUENCE = [
  {
    id: "closure",
    label: "A pedreira fecha",
    detail: "O jornal registra um incidente e o fechamento por motivos de segurança.",
  },
  {
    id: "permission",
    label: "A permissão na clareira",
    detail: "O Sr. Reyes autoriza o acampamento antes da cerca.",
  },
  {
    id: "crossing",
    label: "A travessia",
    detail: "Na segunda noite, os quatro atravessam o limite e Marcus desce.",
  },
  {
    id: "return",
    label: "O começo do quarto dia",
    detail: "Marcus reaparece; o arquivo registra mudanças e lacunas.",
  },
  {
    id: "equinox",
    label: "O desfecho no equinócio",
    detail: "A presença recua, mas o relatório não afirma que foi destruída.",
  },
] as const;

export type SparrowAdvancedSequenceId = (typeof SPARROW_ADVANCED_SEQUENCE)[number]["id"];

export function checkSparrowAdvancedSequence(sequence: string[]) {
  return sequence.join(",") === SPARROW_ADVANCED_SEQUENCE.map((item) => item.id).join(",");
}

export const THRESHOLD_CONTRADICTION_ROWS = [
  {
    id: "window-location",
    label: "A janela com céu desconhecido",
    evidence: "O grupo viu a abertura, mas não identificou o lugar além dela.",
    options: ["localização comprovada", "observação sem localização", "hipótese de transporte"],
    answer: "observação sem localização",
  },
  {
    id: "blood-test",
    label: "O sangue de Iara",
    evidence: "O resultado é inconsistente e Voss enumera possibilidades sem diagnóstico.",
    options: ["diagnóstico confirmado", "resultado inconclusivo", "prova de imunidade"],
    answer: "resultado inconclusivo",
  },
  {
    id: "flower-map",
    label: "O mapa em forma de flor",
    evidence: "Os focos formam um padrão; Voss admite que ele pode ser natural.",
    options: ["inteligência comprovada", "padrão observado, causa aberta", "foco eliminado"],
    answer: "padrão observado, causa aberta",
  },
  {
    id: "barn-collapse",
    label: "O celeiro desaba",
    evidence: "A passagem é fechada e o celeiro cai, mas o relato não explica o outro lado.",
    options: [
      "ameaça definitivamente destruída",
      "fechamento observado, consequência aberta",
      "abertura nunca existiu",
    ],
    answer: "fechamento observado, consequência aberta",
  },
] as const;

export type ThresholdContradictionId = (typeof THRESHOLD_CONTRADICTION_ROWS)[number]["id"];
export type ThresholdContradictionAnswer = (typeof THRESHOLD_CONTRADICTION_ROWS)[number]["answer"];

export function checkThresholdContradictions(answers: Record<string, string>) {
  return THRESHOLD_CONTRADICTION_ROWS.every((row) => answers[row.id] === row.answer);
}
