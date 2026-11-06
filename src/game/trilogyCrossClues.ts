export const TRILOGY_TIMELINE = [
  {
    id: "threshold",
    year: 1973,
    label: "Threshold · junho de 1973",
    detail: "Ashen Creek: o silêncio começa a deixar de parecer apenas ausência de som.",
  },
  {
    id: "sparrow",
    year: 1986,
    label: "Sparrow Hollow · verão de 1986",
    detail: "A pedreira velha e a expedição Vostok transformam um verão em segredo.",
  },
  {
    id: "blackpine",
    year: 1987,
    label: "Black Pine · o Quarto 17",
    detail: "Dezessete moedas e a estação deixam uma última localização verificável.",
  },
] as const;

export type TrilogyBookId = (typeof TRILOGY_TIMELINE)[number]["id"];

export const TRILOGY_BOOK_LABELS: Record<TrilogyBookId, string> = {
  threshold: "Threshold",
  sparrow: "Sparrow Hollow",
  blackpine: "Black Pine",
};

export const TRILOGY_SIGNALS = [
  {
    id: "vostok",
    label: "Expedição Vostok",
    clue: "Um registro de gelo e uma cidade pequena demais para guardar o que trouxe para dentro de si.",
    book: "sparrow",
  },
  {
    id: "ash-creek",
    label: "Ashen Creek",
    clue: "Uma casa junto à água, um diagnóstico e um silêncio que parece esperar uma resposta.",
    book: "threshold",
  },
  {
    id: "seventeen-coins",
    label: "Dezessete moedas",
    clue: "Uma mensagem no Quarto 17, sem corpo e sem prova suficiente de autoria.",
    book: "blackpine",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  clue: string;
  book: TrilogyBookId;
}>;

export type TrilogyCrossClue = {
  id: string;
  label: string;
  clue: string;
  connection: string;
  answer: TrilogyBookId;
  books: readonly TrilogyBookId[];
};

export const TRILOGY_CROSS_CLUES: readonly TrilogyCrossClue[] = [
  {
    id: "waterline-diagnosis",
    label: "A linha d'água",
    clue: "Um diagnóstico aparece ao lado de uma casa junto à água; não é uma prova do fenômeno, mas fixa o primeiro arquivo da cadeia.",
    connection: "Comece pelo registro mais antigo da trilogia.",
    answer: "threshold",
    books: ["threshold", "sparrow", "blackpine"],
  },
  {
    id: "ice-expedition",
    label: "O registro de gelo",
    clue: "A expedição Vostok transforma uma pedreira em ponto de passagem e empurra a investigação para o segundo arquivo.",
    connection: "A pista intermediária vem depois de Ashen Creek.",
    answer: "sparrow",
    books: ["threshold", "sparrow", "blackpine"],
  },
  {
    id: "seventeen-marker",
    label: "O marcador dezessete",
    clue: "As moedas do Quarto 17 não provam autoria, mas fecham a sequência cronológica no arquivo de Black Pine.",
    connection: "A última posição pertence ao arquivo mais recente.",
    answer: "blackpine",
    books: ["threshold", "sparrow", "blackpine"],
  },
  {
    id: "silence-pattern",
    label: "O padrão do silêncio",
    clue: "O silêncio surge primeiro como pergunta em Ashen Creek, reaparece como lacuna na pedreira e termina como ausência de corpo.",
    connection: "Associe a origem do padrão, não a última manifestação.",
    answer: "threshold",
    books: ["threshold", "sparrow", "blackpine"],
  },
  {
    id: "unverified-location",
    label: "Localização verificável",
    clue: "A estação é a única localização final que o arquivo consegue sustentar sem transformar uma hipótese em certeza.",
    connection: "Procure o caso que separa evidência de interpretação.",
    answer: "blackpine",
    books: ["threshold", "sparrow", "blackpine"],
  },
  {
    id: "closed-passage",
    label: "A passagem fechada",
    clue: "Antes do Quarto 17 e da pedreira, o arquivo registra uma passagem que deve ser descrita sem afirmar que foi destruída.",
    connection: "A primeira ocorrência pertence ao limiar.",
    answer: "threshold",
    books: ["threshold", "sparrow", "blackpine"],
  },
] as const;

export function checkTrilogyTimeline(sequence: string[]) {
  return sequence.join(",") === "threshold,sparrow,blackpine";
}

export function checkTrilogySignals(matches: Record<string, TrilogyBookId | "">) {
  return TRILOGY_SIGNALS.every((signal) => matches[signal.id] === signal.book);
}

export function checkTrilogyCrossClues(matches: Record<string, TrilogyBookId | "">) {
  return TRILOGY_CROSS_CLUES.every((clue) => matches[clue.id] === clue.answer);
}
