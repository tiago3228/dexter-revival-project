export type LocationId = "lab" | "corredor" | "evidencias" | "apartamento";

export type DocId =
  | "legista"
  | "tabela"
  | "masuka"
  | "microscopio"
  | "versoFoto"
  | "depRuiz"
  | "depTellez"
  | "depTeresa"
  | "detencao"
  | "ponto"
  | "fichas"
  | "registro"
  | "bilhete"
  | "codigo";

export const DOCS: Record<DocId, { title: string; body: string }> = {
  legista: {
    title: "Relatório do legista — Caso Lucía Ortega",
    body:
      "Vítima: Lucía Ortega, 34 anos. Encontrada no banheiro do apto 4B, Little Havana.\n" +
      "Temperatura retal medida às 03:00: 30,4 °C.\n" +
      "Hora estimada da morte: 01:00 (o número foi rasurado e reescrito a caneta).\n" +
      "Anexo: caso arquivado semelhante — primeira vítima encontrada em 7 de março, também nas docas.",
  },
  tabela: {
    title: "Tabela de resfriamento corporal (parede do laboratório)",
    body:
      "Temperatura normal do corpo: 37,0 °C.\nEm ambiente climatizado, o corpo perde em média 1,5 °C por hora nas primeiras 12 horas.",
  },
  masuka: {
    title: "Post-it de Masuka",
    body:
      "Dex, os armários velhos da sala de evidências ainda usam aquela fechadura de 4 pinos.\n" +
      "Truque: os pinos estão sempre em ordem decrescente, nenhum se repete, e a soma é 14. O primeiro é o mais alto que a fechadura aceita (5).\nNão conta pro Doakes. — V.M.",
  },
  microscopio: {
    title: "Resultado do microscópio",
    body:
      "Amostra do banheiro: sangue tipo O−, compatível com a vítima.\nNenhum outro tipo sanguíneo encontrado na cena.",
  },
  versoFoto: {
    title: "Verso da foto do banheiro",
    body: "Escrito à mão, quase apagado: \"Armário 17 — o que a polícia não viu está lá.\"",
  },
  depRuiz: {
    title: "Depoimento — Carlos Ruiz (ex-namorado)",
    body:
      "\"Eu estava no bar Tropicana desde as 21h. Fiquei lá até depois da meia-noite. Não saí nenhuma vez. Pode perguntar pra qualquer um.\"",
  },
  depTellez: {
    title: "Depoimento — Marco Tellez (vizinho)",
    body:
      "\"Eu trabalho de noite no porto. Entrei às 20h e saí às 4h. Quando cheguei em casa, já tinha polícia no prédio.\"",
  },
  depTeresa: {
    title: "Depoimento — Teresa Vidal (bartender do Tropicana)",
    body:
      "\"O Carlos? Chegou tarde, bem depois das 23h, com a camisa molhada como se tivesse lavado alguma coisa. Pediu um rum duplo.\"",
  },
  detencao: {
    title: "Livro de detenção da delegacia — noite do crime",
    body:
      "20:40 — Carlos Ruiz detido para averiguação (briga de trânsito).\n22:05 — Carlos Ruiz liberado sem acusação.\nObs.: a delegacia fica a 10 minutos do apto 4B.",
  },
  ponto: {
    title: "Fax: ponto eletrônico do Porto de Miami",
    body:
      "Funcionário: Marco Tellez.\nEntrada 19:58 — Saída 04:02.\nNenhuma saída intermediária registrada. Câmera do portão confirma.",
  },
  fichas: {
    title: "Fichas dos envolvidos",
    body:
      "Carlos Ruiz — tipo sanguíneo O+. Luvas: tamanho M.\nMarco Tellez — tipo sanguíneo A+. Mãos grandes, usa luvas tamanho GG (ficha do porto).\nTeresa Vidal — tipo sanguíneo B+.",
  },
  registro: {
    title: "Registro de entrada da sala de evidências",
    body:
      "Doakes faz a ronda da sala a noite toda, mas sai sempre no mesmo padrão:\n" +
      "00:40 saída (café) — 01:10 retorno\n02:40 saída (café) — 03:10 retorno\n" +
      "Anotação do plantão: \"Ele repete isso a cada duas horas, igual relógio.\"",
  },
  bilhete: {
    title: "Bilhete cifrado (dentro do armário 17)",
    body: "",
  },
  codigo: {
    title: "O Código de Harry",
    body:
      "1. Tenha certeza de que a pessoa matou.\n2. Tenha prova que a polícia não consegue usar.\n3. Nunca acuse sem fechar cada ponta solta.\n4. Não seja pego.",
  },
};

export const CIPHER_PLAIN = "ARMAZEM NOVE DAS DOCAS DE DODGE ISLAND";
export const CIPHER_KEY = 7;

export function caesar(text: string, shift: number) {
  return text.replace(/[A-Z]/g, (c) =>
    String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 26 * 10) % 26) + 65),
  );
}

export const CIPHER_TEXT = caesar(CIPHER_PLAIN, CIPHER_KEY);

export const LOCATION_NAMES: Record<LocationId, string> = {
  lab: "Laboratório forense",
  corredor: "Corredor da Homicídios",
  evidencias: "Sala de evidências",
  apartamento: "Apartamento de Dexter",
};

export const START_MIN = 23 * 60; // 23:00
export const END_MIN = 30 * 60; // 06:00 do dia seguinte

export function fmtClock(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

// Janelas em que Doakes está fora (minutos desde 00:00 do dia do jogo, ajustado para pós meia-noite)
export const DOAKES_WINDOWS = [
  { label: "00:40 – 01:10", start: 24 * 60 + 40, end: 25 * 60 + 10 },
  { label: "02:40 – 03:10", start: 26 * 60 + 40, end: 27 * 60 + 10 },
  { label: "04:40 – 05:10", start: 28 * 60 + 40, end: 29 * 60 + 10 },
];
