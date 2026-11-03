export const BLACK_PINE_PEOPLE = [
  { id: "arthur", name: "Arthur", role: "Dono da Black Pine Video" },
  { id: "emily", name: "Emily Carter", role: "Irmã de Daniel" },
  { id: "samuel", name: "Samuel Grady", role: "Guarda-florestal" },
  { id: "eleanor", name: "Eleanor Voss", role: "Bibliotecária desde 1951" },
  { id: "margaret", name: "Margaret Morgan", role: "Moradora da Mansão Morgan" },
] as const;

export const BLACK_PINE_LOCATIONS = [
  { id: "video", label: "Black Pine Video" },
  { id: "black-cedar", label: "Black Cedar" },
  { id: "station", label: "Black Pine Station" },
  { id: "library", label: "Biblioteca Pública" },
  { id: "mansion", label: "Mansão Morgan" },
] as const;

export const BLACK_PINE_ARTIFACTS = [
  { id: "tape", label: "Fita VHS de 1969" },
  { id: "toy", label: "Trem de brinquedo de Daniel" },
  { id: "map", label: "Mapa ferroviário raspado" },
  { id: "coin-3", label: "Moeda nº 3 · Eleanor Voss" },
  { id: "coin-1", label: "Moeda nº 1 · família Morgan" },
] as const;

export type BlackPinePersonId = (typeof BLACK_PINE_PEOPLE)[number]["id"];
export type BlackPineLocationId = (typeof BLACK_PINE_LOCATIONS)[number]["id"];
export type BlackPineArtifactId = (typeof BLACK_PINE_ARTIFACTS)[number]["id"];
export type BlackPineMark = "" | "x" | "o";

export const BLACK_PINE_COIN_MESSAGE = "WHITMORE SABIA";

export const BLACK_PINE_TIMELINE = [
  {
    id: "ethan-room-17",
    when: "13 out. 1987 · 18h42",
    title: "Chegada de Ethan · Quarto 17",
    text: "Whitmore indica o quarto 17 a Ethan quando ele não pede um número. A chave traz o pinheiro; a moeda e a fotografia revelam a marca 217. Este é o quarto de Ethan, não a cena do desaparecimento.",
  },
  {
    id: "whitmore-room",
    when: "Noite do desaparecimento · data e número do quarto não registrados",
    title: "Quarto de Whitmore",
    text: `A narrativa o situa no fim do corredor do segundo andar. O livro não informa o número. As dezessete moedas estão com os números para baixo; ao virá-las, a inscrição registrada tem treze letras: ${BLACK_PINE_COIN_MESSAGE}.`,
  },
  {
    id: "station",
    when: "Ainda naquela noite",
    title: "Black Pine Station",
    text: "Pegadas atribuídas a Whitmore seguem até a estação, sem trilha de volta. O chapéu e um bilhete são encontrados lá. É a pista física mais forte, não a confirmação do destino final.",
  },
] as const;

export const BLACK_PINE_LOCATION_SOLUTION: Record<
  BlackPinePersonId,
  readonly BlackPineLocationId[]
> = {
  arthur: ["video"],
  emily: ["station"],
  samuel: ["station", "black-cedar"],
  eleanor: ["library"],
  margaret: ["mansion"],
};

export const BLACK_PINE_LOCATION_MATCH_COUNT = Object.values(BLACK_PINE_LOCATION_SOLUTION).reduce(
  (total, locations) => total + locations.length,
  0,
);

export const BLACK_PINE_ARTIFACT_SOLUTION: Record<BlackPinePersonId, BlackPineArtifactId> = {
  arthur: "tape",
  emily: "toy",
  samuel: "map",
  eleanor: "coin-3",
  margaret: "coin-1",
};

export const BLACK_PINE_CLUES = [
  "Arthur guarda a fita de 1969 na locadora; nela, o relógio da prefeitura marca 02h17 em pleno meio-dia.",
  "Emily reconhece como sendo de Daniel o trem de brinquedo encontrado numa caixa na estação.",
  "Samuel examina as pegadas na estação e conduz Ethan a Black Cedar; o mapa ferroviário com nomes raspados está na sala dos fundos da estação.",
  "Eleanor Voss abre o arquivo restrito da biblioteca e revela possuir a moeda nº 3; o caderno de Whitmore não é atribuído a ela.",
  "Margaret recebe Ethan na mansão da família; a moeda nº 1 pertence ao velho Morgan.",
  "O Quarto 17 foi indicado por Whitmore para Ethan; Ethan não havia pedido um número, e o quarto não é identificado como o de Whitmore.",
  "A grade reúne associações de cenas e evidências, não a última localização de cada pessoa. Mais de uma pessoa pode estar ligada ao mesmo local.",
] as const;

export const BLACK_PINE_RECORDS = [
  {
    id: "ethan-room-17",
    title: "Quarto 17 · registro de Ethan",
    text: "Em 13 de outubro de 1987, Ethan diz que não pediu um número; a recepção confirma que não havia reserva e que Whitmore escolheu o quarto 17. A chave trazia o pinheiro; a moeda 17, comparada à fotografia, revelou 217. Este quarto pertence à chegada de Ethan e não deve ser confundido com o quarto do desaparecimento.",
  },
  {
    id: "whitmore-room",
    title: "Quarto de Whitmore · número não informado",
    text: "O quarto ficava no fim do corredor do segundo andar. Cama feita, sapatos alinhados e um copo pela metade; não havia sinais de luta ou pressa. O manuscrito não informa o número desse quarto.",
  },
  {
    id: "coins",
    title: "As dezessete moedas",
    text: `As moedas estavam com os números para baixo. Ao virá-las, a mensagem registrada é ${BLACK_PINE_COIN_MESSAGE} — treze letras, sem contar o espaço. A frase não prova morte nem autoria.`,
  },
  {
    id: "diary",
    title: "A última anotação",
    text: "Whitmore escreveu que esperava que Ethan perguntasse sobre a estação e que já estava pronto. Isso indica expectativa, mas não explica sozinho o desaparecimento nem prova que ele saiu voluntariamente.",
  },
  {
    id: "station",
    title: "A estação · trilha posterior",
    text: "Na noite da busca, pegadas de ida levam até a entrada da estação. O chapéu de Whitmore e um bilhete são encontrados na bilheteria; o telefone, dado como morto desde 1971, transmite uma voz.",
  },
  {
    id: "limits",
    title: "Limite da evidência",
    text: "A estação é a pista física mais forte, mas os registros não determinam o destino final de Whitmore, se ele saiu por vontade própria ou quem organizou as moedas.",
  },
] as const;

export const BLACK_PINE_INTERVIEWS = [
  {
    id: "arthur",
    name: "Arthur",
    question: "O que a fita de 1969 registra?",
    answer:
      "A gravação mostra uma figura imóvel na rua. O relógio da prefeitura marca 02h17, embora seja meio-dia. Meu pai a chamava de Último Passageiro.",
    clue: "A fita liga Arthur ao registro audiovisual; não o coloca no Quarto 17 nem no quarto de Whitmore.",
  },
  {
    id: "emily",
    name: "Emily Carter",
    question: "De quem era o trem de brinquedo encontrado na estação?",
    answer:
      "Era de Daniel. Eu o reconheci quando o encontrei na caixa da sala dos fundos. Isso não me diz o que aconteceu com Whitmore.",
    clue: "O vínculo com o brinquedo é confirmado; não prova que Emily tenha preparado o desaparecimento.",
  },
  {
    id: "samuel",
    name: "Samuel Grady",
    question: "O que as pegadas permitem afirmar?",
    answer:
      "Elas eram recentes e seguiam até a estação. Não havia pegadas de volta. O caminho aponta para lá; o que aconteceu depois continua sem resposta.",
    clue: "A trilha sustenta a estação como pista, não a voluntariedade ou o destino final.",
  },
  {
    id: "eleanor",
    name: "Eleanor Voss",
    question: "O que há no arquivo restrito da biblioteca?",
    answer:
      "Registros sobre o incêndio de 1958, desaparecimentos e a família Holloway. Tenho a moeda nº 3. Nada disso identifica quem organizou as moedas de Whitmore.",
    clue: "Eleanor é bibliotecária e guardiã de um arquivo histórico; o diário de Whitmore foi encontrado no quarto dele.",
  },
  {
    id: "margaret",
    name: "Margaret Morgan",
    question: "O que a moeda da família Morgan significa?",
    answer:
      "Meu pai guardava a moeda nº 1. Para ele, ela lembrava um acordo antigo — não era um recibo de crime nem uma prova sobre Whitmore.",
    clue: "A moeda liga a família Morgan à história da cidade, mas não coloca Margaret no quarto do desaparecimento.",
  },
] as const;

export const BLACK_PINE_VERDICTS = [
  {
    id: "murder",
    title: "Whitmore foi assassinado no Quarto 17.",
    text: "O Quarto 17 foi atribuído a Ethan. O livro não identifica esse quarto como o de Whitmore; não há corpo nem marcas que provem assassinato.",
    correct: false,
  },
  {
    id: "supernatural",
    title: "A floresta levou Whitmore, e o caso está resolvido.",
    text: "O romance contém fenômenos inexplicados, mas este dossiê não determina se a floresta levou Whitmore nem encerra seu destino.",
    correct: false,
  },
  {
    id: "supported",
    title: "A estação é a pista mais forte; o destino de Whitmore permanece desconhecido.",
    text: "O diário mostra que ele esperava que Ethan perguntasse sobre a estação; pegadas, chapéu e bilhete reforçam essa linha. É razoável inferir que Whitmore foi até lá, mas não concluir que saiu voluntariamente nem o que aconteceu depois.",
    correct: true,
  },
] as const;

export type BlackPineActionCountsInput = {
  recordsReviewed: number;
  interviewsOpened: number;
  locationGridSolved: boolean;
  artifactGridSolved: boolean;
  correctVerdict: boolean;
  mistakes: number;
};

export function getBlackPineActionCounts(input: BlackPineActionCountsInput) {
  const recordsReviewed = Number.isFinite(input.recordsReviewed)
    ? Math.min(BLACK_PINE_RECORDS.length, Math.max(0, Math.floor(input.recordsReviewed)))
    : 0;
  const interviewsOpened = Number.isFinite(input.interviewsOpened)
    ? Math.min(BLACK_PINE_INTERVIEWS.length, Math.max(0, Math.floor(input.interviewsOpened)))
    : 0;
  const mistakes = Number.isFinite(input.mistakes) ? Math.max(0, Math.floor(input.mistakes)) : 0;
  const correctActions =
    recordsReviewed +
    interviewsOpened +
    (input.locationGridSolved ? BLACK_PINE_LOCATION_MATCH_COUNT : 0) +
    (input.artifactGridSolved ? BLACK_PINE_PEOPLE.length : 0) +
    (input.correctVerdict ? 1 : 0);

  return { correctActions, totalActions: correctActions + mistakes };
}

export function nextBlackPineMark(mark: BlackPineMark): BlackPineMark {
  return mark === "" ? "x" : mark === "x" ? "o" : "";
}

export function checkBlackPineGrid(marks: Record<string, BlackPineMark>) {
  return BLACK_PINE_PEOPLE.every((person) =>
    BLACK_PINE_LOCATIONS.every((location) => {
      const confirmed = marks[`${person.id}|${location.id}`] === "o";
      const expected = BLACK_PINE_LOCATION_SOLUTION[person.id].includes(location.id);
      return confirmed === expected;
    }),
  );
}

export function checkBlackPineArtifactGrid(marks: Record<string, BlackPineMark>) {
  return BLACK_PINE_PEOPLE.every((person) =>
    BLACK_PINE_ARTIFACTS.every((artifact) => {
      const confirmed = marks[`${person.id}|${artifact.id}`] === "o";
      return confirmed === (BLACK_PINE_ARTIFACT_SOLUTION[person.id] === artifact.id);
    }),
  );
}
