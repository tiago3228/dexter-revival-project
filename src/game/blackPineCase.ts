export const BLACK_PINE_PEOPLE = [
  { id: "arthur", name: "Arthur Holloway", role: "Dono da locadora" },
  { id: "emily", name: "Emily Carter", role: "Conhece a história de Daniel" },
  { id: "samuel", name: "Samuel Grady", role: "Guarda-florestal" },
  { id: "eleanor", name: "Eleanor Vale", role: "Bibliotecária" },
  { id: "margaret", name: "Margaret Morgan", role: "Herdeira da mansão" },
] as const;

export const BLACK_PINE_LOCATIONS = [
  { id: "video", label: "Black Pine Video" },
  { id: "cellar", label: "Porão dos Carter" },
  { id: "station", label: "Black Pine Station" },
  { id: "library", label: "Biblioteca Pública" },
  { id: "mansion", label: "Mansão Morgan" },
] as const;

export const BLACK_PINE_ARTIFACTS = [
  { id: "tape", label: "Fita VHS de 1969" },
  { id: "toy", label: "Trem de brinquedo de Daniel" },
  { id: "map", label: "Mapa ferroviário raspado" },
  { id: "diary", label: "Caderno de Whitmore" },
  { id: "coin", label: "Moeda de prata" },
] as const;

export type BlackPinePersonId = (typeof BLACK_PINE_PEOPLE)[number]["id"];
export type BlackPineLocationId = (typeof BLACK_PINE_LOCATIONS)[number]["id"];
export type BlackPineArtifactId = (typeof BLACK_PINE_ARTIFACTS)[number]["id"];
export type BlackPineMark = "" | "x" | "o";

export const BLACK_PINE_LOCATION_SOLUTION: Record<BlackPinePersonId, BlackPineLocationId> = {
  arthur: "video",
  emily: "cellar",
  samuel: "station",
  eleanor: "library",
  margaret: "mansion",
};

export const BLACK_PINE_ARTIFACT_SOLUTION: Record<BlackPinePersonId, BlackPineArtifactId> = {
  arthur: "tape",
  emily: "toy",
  samuel: "map",
  eleanor: "diary",
  margaret: "coin",
};

export const BLACK_PINE_CLUES = [
  "Arthur guardava a fita VHS na locadora, onde o relógio da cidade aparece marcando 02h17.",
  "A pessoa que estava junto do trem de brinquedo não estava na biblioteca nem na estação.",
  "Samuel foi visto na estação e conhecia o mapa com as cidades raspadas.",
  "Eleanor consultou o caderno de Whitmore na biblioteca antes do desaparecimento.",
  "A moeda de prata estava ligada à família Morgan, não à locadora ou ao arquivo público.",
  "Emily estava no porão dos Carter quando falou pela última vez com Ethan naquela noite.",
  "Cada pessoa e cada local aparecem uma única vez na reconstrução da última movimentação conhecida.",
] as const;

export const BLACK_PINE_RECORDS = [
  {
    id: "room",
    title: "O quarto 17",
    text: "Porta aberta, janela trancada por dentro, nenhuma luta e dezessete moedas em círculo.",
  },
  {
    id: "coins",
    title: "As dezessete moedas",
    text: "Viradas para cima, formam WHITMORE SABIA. A mensagem não prova morte nem autoria.",
  },
  {
    id: "diary",
    title: "A última anotação",
    text: "Whitmore esperava que alguém perguntasse sobre a estação.",
  },
  {
    id: "station",
    title: "A estação",
    text: "O chapéu e o bilhete de Whitmore foram encontrados ali; as pegadas só têm ida.",
  },
  {
    id: "limits",
    title: "Limite da evidência",
    text: "Nenhuma fonte prova que uma pessoa específica matou Whitmore ou que a floresta o matou.",
  },
] as const;

export const BLACK_PINE_INTERVIEWS = [
  {
    id: "arthur",
    name: "Arthur Holloway",
    question: "Por que a fita de 1969 estava guardada na locadora?",
    answer:
      "Meu pai dizia que a figura aparecia em qualquer gravação de Black Pine. Eu guardei a fita porque ninguém mais queria admitir que ela existia.",
    clue: "A fita liga Arthur ao registro audiovisual, mas não ao quarto 17 naquela noite.",
  },
  {
    id: "emily",
    name: "Emily Carter",
    question: "O que você sabia sobre Daniel e a estação?",
    answer:
      "Eu sabia que meu irmão voltou diferente e que a estação era uma das portas da história. Não sabia o que Whitmore pretendia fazer.",
    clue: "Emily omite informações, mas a omissão não prova que ela preparou a cena.",
  },
  {
    id: "samuel",
    name: "Samuel Grady",
    question: "Por que as pegadas na estação eram importantes?",
    answer:
      "Porque eram recentes, não tinham sangue e não havia pegadas de volta. Whitmore foi até lá; o resto é uma pergunta.",
    clue: "Samuel confirma a última localização verificável, não um culpado.",
  },
  {
    id: "eleanor",
    name: "Eleanor Vale",
    question: "O que o arquivo secreto prova?",
    answer:
      "Prova que Black Pine esconde desaparecimentos há décadas. Não prova quem escreveu as moedas nem quem abriu a porta.",
    clue: "O arquivo dá contexto histórico, mas não identifica autoria.",
  },
  {
    id: "margaret",
    name: "Margaret Morgan",
    question: "Por que a moeda número 1 está na mansão?",
    answer:
      "Porque minha família confundiu dinheiro com negociação. A moeda é uma memória de dívida, não um recibo de crime.",
    clue: "A moeda liga Margaret à história Morgan, não ao desaparecimento de Whitmore.",
  },
] as const;

export const BLACK_PINE_VERDICTS = [
  {
    id: "murder",
    title: "Whitmore foi assassinado no quarto 17.",
    text: "A cena não contém sangue, luta ou corpo. As moedas são uma mensagem, não prova suficiente.",
    correct: false,
  },
  {
    id: "supernatural",
    title: "A floresta levou Whitmore, e o caso está resolvido.",
    text: "Essa é uma hipótese possível dentro da lenda, mas não é uma conclusão sustentada pelos documentos.",
    correct: false,
  },
  {
    id: "supported",
    title:
      "Whitmore saiu voluntariamente para seguir a pista da estação; a cena foi usada para controlar a narrativa.",
    text: "É a conclusão mais forte: o quarto foi encenado, a estação é a última localização verificável e a autoria da mensagem permanece aberta.",
    correct: true,
  },
] as const;

export function nextBlackPineMark(mark: BlackPineMark): BlackPineMark {
  return mark === "" ? "x" : mark === "x" ? "o" : "";
}

export function checkBlackPineGrid(marks: Record<string, BlackPineMark>) {
  return BLACK_PINE_PEOPLE.every((person) =>
    BLACK_PINE_LOCATIONS.every((location) => {
      const confirmed = marks[`${person.id}|${location.id}`] === "o";
      return confirmed === (BLACK_PINE_LOCATION_SOLUTION[person.id] === location.id);
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
