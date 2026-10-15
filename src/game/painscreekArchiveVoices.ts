export type PainscreekArchiveVoiceLine = {
  speaker: string;
  text: string;
};

export type PainscreekArchiveVoice = {
  id: string;
  title: string;
  kind: "diary-dialogue" | "press-quote" | "press-report" | "card" | "letter";
  source: string;
  audioSrc: string;
  lines?: PainscreekArchiveVoiceLine[];
  speaker?: string;
  text?: string;
  note: string;
};

export const PAINSCREEK_ARCHIVE_VOICES: PainscreekArchiveVoice[] = [
  {
    id: "dorothy-sofia-tea",
    title: "Uma conversa durante o chá",
    kind: "diary-dialogue",
    source: "Diário de Dorothy Patterson · 24/09/1973 · PDF p. 112",
    audioSrc: "/audio/painscreek/archive/dorothy-sofia-tea.wav",
    lines: [
      { speaker: "Sofia", text: "Como é ser amada?" },
      {
        speaker: "Dorothy",
        text: "Bom, é como a sensação que você tem quando está com seus pais.",
      },
      { speaker: "Sofia", text: "É difícil de imaginar, porque eu não tenho pais." },
    ],
    note: "Diálogo reproduzido no diário de Dorothy; é uma anotação escrita, não uma gravação de áudio.",
  },
  {
    id: "vivian-press-quote",
    title: "Vivian fala sobre a ajuda às famílias da mina",
    kind: "press-quote",
    source: "O Arauto de Painscreek · 03/03/1993 · PDF p. 86",
    audioSrc: "/audio/painscreek/archive/vivian-press-quote.wav",
    speaker: "Vivian Roberts, citada pelo jornal",
    text: "O que podemos fazer, no entanto, é dar a eles a ajuda que precisarem. E a família Roberts agradece àqueles que ajudaram financeiramente.",
    note: "Citação publicada no artigo sobre a tragédia da mina; a fonte disponível é o jornal, não uma gravação da entrevista.",
  },
  {
    id: "scott-court-press-report",
    title: "A versão de Scott no tribunal",
    kind: "press-report",
    source: "O Arauto de Painscreek · PDF p. 88",
    audioSrc: "/audio/painscreek/archive/scott-court-press-report.wav",
    speaker: "Scott Brooks, conforme relato do jornal",
    text: "A matéria registra que Scott se declarou inocente, disse ter encontrado Vivian na floresta e afirmou que ela ainda estava viva quando ele foi embora.",
    note: "Resumo do conteúdo jornalístico, não transcrição literal das palavras de Scott.",
  },
  {
    id: "matthew-birthday-card",
    title: "Um pedido no cartão de aniversário",
    kind: "card",
    source: "Cartão de Matthew para Sofia · 18/03/1975 · PDF p. 103",
    audioSrc: "/audio/painscreek/archive/matthew-birthday-card.wav",
    speaker: "Matthew",
    text: "Por favor, espere eu voltar. Com amor, Matthew.",
    note: "Trecho de um cartão escrito; foi mantido como texto documental, não como fala pronunciada.",
  },
  {
    id: "scott-letter-trisha",
    title: "A carta de Scott para Trisha",
    kind: "letter",
    source: "Carta de Scott a Trisha · PDF p. 104",
    audioSrc: "/audio/painscreek/archive/scott-letter-trisha.wav",
    speaker: "Scott",
    text: "Por favor, acredite quando digo que não matei sua mãe. Eu nunca menti para você e nunca vou mentir. Não sei quem matou a Vivian.",
    note: "Trecho de carta pessoal em primeira pessoa; registra a versão de Scott, não uma confirmação independente dos fatos.",
  },
];
