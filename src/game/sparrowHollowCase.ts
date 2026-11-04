export type SparrowHollowStageId = "archive" | "clearing" | "disappearance" | "equinox";

export const SPARROW_HOLLOW_STAGES = [
  {
    id: "archive",
    number: "01",
    title: "Sinais na cidade",
    period: "1949 · junho e julho de 1986",
    brief:
      "Um fechamento mal explicado, versões incompatíveis e observações que ainda não formam uma conclusão.",
    hint: "Separe o que está no jornal do que chegou à biblioteca por memória de família.",
  },
  {
    id: "clearing",
    number: "02",
    title: "A clareira",
    period: "Agosto de 1986 · antes da cerca",
    brief: "O limite autorizado para o acampamento e os primeiros sinais registrados na floresta.",
    hint: "A autorização era para a clareira antes da cerca; ela não incluía a pedreira.",
  },
  {
    id: "disappearance",
    number: "03",
    title: "O desaparecimento",
    period: "Agosto de 1986 · segunda noite e quarto dia",
    brief: "A travessia, a busca e o retorno de Marcus precisam permanecer em ordem.",
    hint: "A referência a três dias pertence à história da irmã do xerife, que passou longe em 1962.",
  },
  {
    id: "equinox",
    number: "04",
    title: "A noite do equinócio",
    period: "Setembro de 1986",
    brief: "Só agora o arquivo abre o relato do desfecho e o relatório público que veio depois.",
    hint: "O fenômeno recua, mas o narrador diz que não compreende o mecanismo nem afirma que ele foi destruído.",
  },
] as const;

export const SPARROW_HOLLOW_EVIDENCE_CLASSES = [
  {
    id: "record",
    label: "Registro",
    description: "Documento, jornal ou relatório escrito.",
  },
  {
    id: "witness",
    label: "Testemunho",
    description: "Observação narrada por quem esteve presente.",
  },
  {
    id: "retelling",
    label: "Relato indireto",
    description: "Informação transmitida por outra pessoa.",
  },
  {
    id: "hypothesis",
    label: "Hipótese",
    description: "Interpretação atribuída a um personagem, não uma prova.",
  },
  {
    id: "unsupported",
    label: "Não sustentado",
    description: "A fonte não permite afirmar isso ou a contradiz.",
  },
] as const;

export type SparrowHollowEvidenceClass = (typeof SPARROW_HOLLOW_EVIDENCE_CLASSES)[number]["id"];

export const SPARROW_HOLLOW_TIMELINE = [
  {
    id: "quarry-closure",
    stage: "archive",
    when: "1949",
    title: "A pedreira fecha",
    text: "O jornal registra um incidente e o encerramento das operações por motivos de segurança. A cidade conserva explicações diferentes; o documento não nomeia crianças nem registra mortes.",
    source: "Capítulos 3 e 9 · A Pedreira Velha / A Biblioteca",
  },
  {
    id: "four-friends",
    stage: "archive",
    when: "Junho de 1986",
    title: "Quatro amigos",
    text: "Denny, Cass, Sam e Marcus têm treze anos e começam o verão juntos em Sparrow Hollow.",
    source: "Capítulo 1 · Bicicletas ao Entardecer",
  },
  {
    id: "sparrows-west",
    stage: "archive",
    when: "Junho de 1986",
    title: "Os pardais a oeste",
    text: "Denny narra a observação de pardais imóveis, voltados para as árvores e para a direção das antigas pedreiras. A narrativa não determina a causa.",
    source: "Capítulo 1 · Bicicletas ao Entardecer",
  },
  {
    id: "permission",
    stage: "clearing",
    when: "Agosto de 1986 · primeira noite",
    title: "Um limite claro",
    text: "O Sr. Reyes permite que os quatro acampem na clareira antes da cerca e proíbe que a atravessem.",
    source: "Capítulos 11 e 12 · Permissão / A Clareira",
  },
  {
    id: "crossing",
    stage: "disappearance",
    when: "Agosto de 1986 · segunda noite",
    title: "Além da cerca",
    text: "Na segunda noite, os quatro atravessam a cerca. Marcus desce os degraus da pedreira e desaparece na escuridão.",
    source: "Capítulos 16 e 17 · Do Outro Lado da Cerca / O Que Vive no Fundo",
  },
  {
    id: "search",
    stage: "disappearance",
    when: "Agosto de 1986 · madrugada",
    title: "A busca",
    text: "As pegadas atribuídas a Marcus terminam abruptamente na borda. A busca não encontra o menino nem um corpo.",
    source: "Capítulo 18 · Antes do Amanhecer",
  },
  {
    id: "fourth-day",
    stage: "disappearance",
    when: "Agosto de 1986 · começo do quarto dia",
    title: "Marcus retorna",
    text: "Marcus reaparece no começo do quarto dia. A narrativa descreve mudanças nele, mas também breves momentos em que o próprio Marcus parece pedir ajuda.",
    source: "Capítulo 22 · O Quarto Dia",
  },
  {
    id: "equinox",
    stage: "equinox",
    when: "Setembro de 1986 · noite do equinócio",
    title: "Seis crianças na pedreira",
    text: "Os amigos e o xerife seguem Marcus até a pedreira. O relato descreve seis crianças nos degraus e uma presença que recua depois que Marcus e as crianças despertam.",
    source:
      "Capítulos 29 a 31 · Uma Semana / O Que Ela Estava Construindo / O Que a Amizade Consegue Fazer",
  },
  {
    id: "public-report",
    stage: "equinox",
    when: "Duas semanas depois",
    title: "A versão pública",
    text: "O relatório registra baixa visibilidade e desorientação coletiva. Ele não inclui a luz nem a presença descritas pelos meninos.",
    source: "Capítulo 32 · Setembro",
  },
] as const;

export type SparrowHollowRecord = {
  id: string;
  stage: SparrowHollowStageId;
  title: string;
  text: string;
  source: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export const SPARROW_HOLLOW_RECORDS: readonly SparrowHollowRecord[] = [
  {
    id: "closure-record",
    stage: "archive",
    title: "A pedreira fechada",
    text: "A empresa encerrou as operações em 1949. Desabamento, água contaminada e incêndio aparecem como versões locais incompatíveis; o jornal registra um “incidente” e fechamento por “motivos de segurança”, sem identificar crianças nem relatar mortes.",
    source: "Capítulos 3 e 9 · A Pedreira Velha / A Biblioteca",
    imageSrc: "/images/sparrow-hollow-quarry.webp",
    imageAlt:
      "Ilustração do livro de uma pedreira em ruínas entre pinheiros; imagem de ambientação, não fotografia de arquivo.",
    imageCaption: "Arte do romance · referência visual, não evidência fotográfica",
  },
  {
    id: "agnes-account",
    stage: "archive",
    title: "O relato de Agnes Pruitt",
    text: "Agnes conta que, em 1949, cinco crianças entraram na pedreira e apenas seu irmão saiu. É uma lembrança transmitida pela bibliotecária; o jornal não identifica as crianças nem confirma essa contagem.",
    source: "Capítulo 9 · A Biblioteca",
  },
  {
    id: "conflicting-stories",
    stage: "archive",
    title: "Três versões para o fechamento",
    text: "Moradores mencionam desabamento, água contaminada ou incêndio. A avó de Cass recorda um som de respiração, não uma explosão ou um desabamento. Nenhuma dessas versões é confirmada pelo registro jornalístico.",
    source: "Capítulo 3 · A Pedreira Velha",
  },
  {
    id: "birds-west",
    stage: "archive",
    title: "Pardais voltados para oeste",
    text: "Denny descreve dezenas de pardais imóveis nos fios, voltados para as árvores e para a direção das pedreiras antigas. Bater palmas não os afasta. A observação é narrada; sua causa permanece desconhecida.",
    source: "Capítulo 1 · Bicicletas ao Entardecer",
    imageSrc: "/images/sparrow-hollow-sparrows.webp",
    imageAlt: "Ilustração do livro de pássaros pousados em fios sobre uma cidade enevoada.",
    imageCaption: "Arte do romance · não é uma fotografia do evento",
  },
  {
    id: "camp-permission",
    stage: "clearing",
    title: "A permissão do Sr. Reyes",
    text: "O pai de Sam autoriza o acampamento na clareira antes da cerca. A instrução é não atravessar o limite; o grupo só cruza a cerca na segunda noite.",
    source: "Capítulos 11 e 12 · Permissão / A Clareira",
  },
  {
    id: "tracks-and-feather",
    stage: "clearing",
    title: "Pegadas e uma pena",
    text: "Depois da primeira noite, os amigos encontram uma pena preta grande e quatro conjuntos de pegadas descalças que param diante da barraca. Cass fotografa uma pegada; Sam a desenha. A fonte não identifica quem ou o que deixou os rastros.",
    source: "Capítulos 12 e 13 · A Clareira / Quem Confia em Quem",
  },
  {
    id: "rex-collar",
    stage: "clearing",
    title: "A coleira de Rex",
    text: "A coleira traz o nome Rex e a indicação de propriedade de E. Pruitt. Sam observa que ela foi pendurada na cerca, não simplesmente perdida. O livro não identifica quem a colocou nem confirma o destino do cão.",
    source: "Capítulo 14 · O Que o Sam Não Contou",
  },
  {
    id: "quarry-crossing",
    stage: "disappearance",
    title: "A travessia da cerca",
    text: "Na segunda noite, os quatro amigos atravessam a cerca. Marcus caminha até os degraus e desce; em seguida, a narrativa descreve uma luz e a perda de contato com ele.",
    source: "Capítulos 16 e 17 · Do Outro Lado da Cerca / O Que Vive no Fundo",
  },
  {
    id: "search-tracks",
    stage: "disappearance",
    title: "A trilha que termina",
    text: "A busca encontra pegadas que chegam à beira da pedreira e param abruptamente. Não se encontra Marcus nem um corpo; as pegadas não explicam o que aconteceu depois.",
    source: "Capítulo 18 · Antes do Amanhecer",
  },
  {
    id: "marcus-return",
    stage: "disappearance",
    title: "O começo do quarto dia",
    text: "Marcus volta no começo do quarto dia, usando as roupas da noite do desaparecimento, agora limpas e passadas. Os amigos percebem mudanças, mas a narrativa também registra momentos em que o Marcus de antes parece surgir por trás delas.",
    source: "Capítulo 22 · O Quarto Dia; Capítulo 25 · Quase Ele",
  },
  {
    id: "boyle-three-days",
    stage: "disappearance",
    title: "Três dias: a história da irmã de Boyle",
    text: "Boyle conta que a irmã passou três dias longe, em 1962. Essa referência não é a cronologia do retorno de Marcus, que ocorre no começo do quarto dia em 1986; o romance não explica a diferença de contagem.",
    source: "Capítulo 22 · O Quarto Dia; Capítulo 33 · O Resto do Verão",
  },
  {
    id: "webb-expedition",
    stage: "disappearance",
    title: "A pasta do Sr. Webb",
    text: "A pasta contém um memorando que encerra uma expedição de pesquisa no gelo, uma frase traduzida sobre algo que “reescreve quem você é” e uma fotografia desfocada. Webb diz não saber quem eram os homens nem o que aquilo significa; o documento não identifica a causa do caso de Marcus.",
    source: "Capítulos 23 e 24 · A Pasta do Sr. Webb / O Mesmo Tipo de Fome",
  },
  {
    id: "seed-theory",
    stage: "equinox",
    title: "Uma interpretação, não um laudo",
    text: "Agnes atribui ao irmão a comparação do fenômeno com uma semente que precisaria de tempo e de pessoas para crescer. O próprio romance não confirma essa explicação como mecanismo ou diagnóstico.",
    source: "Capítulo 27 · O Que a Senhorita Pruitt Não Quis Dizer",
  },
  {
    id: "equinox-children",
    stage: "equinox",
    title: "As seis crianças",
    text: "Na noite do equinócio, o relato descreve seis crianças paradas nos degraus da pedreira. Os três amigos e o xerife seguem Marcus; as crianças e Marcus voltam a responder depois que os amigos recorrem às lembranças compartilhadas.",
    source:
      "Capítulos 29 a 31 · Uma Semana / O Que Ela Estava Construindo / O Que a Amizade Consegue Fazer",
    imageSrc: "/images/sparrow-hollow-quarry.webp",
    imageAlt:
      "Ilustração do livro de uma pedreira antiga na floresta, usada aqui como ambientação da sequência do equinócio.",
    imageCaption: "Arte do romance · a cena não é uma fotografia de arquivo",
  },
  {
    id: "receding-presence",
    stage: "equinox",
    title: "O que o relato não resolve",
    text: "A presença recua e a escuridão comum volta ao fundo da pedreira. Denny afirma que não compreende a física ou a lógica do que ocorreu. O livro não declara que a ameaça foi destruída nem apresenta uma regra repetível para o retorno.",
    source: "Capítulo 31 · O Que a Amizade Consegue Fazer",
  },
  {
    id: "official-report",
    stage: "equinox",
    title: "O relatório de Boyle",
    text: "A versão escrita registra “baixa visibilidade” e “desorientação coletiva”. Boyle omite do relatório a luz, os olhos dourados e a presença descrita pelos meninos; o documento é uma versão pública, não uma explicação completa do evento.",
    source: "Capítulos 20 e 32 · O Que a Cidade Decidiu Acreditar / Setembro",
  },
];

export const SPARROW_HOLLOW_INTERVIEWS = [
  {
    id: "agnes",
    stage: "archive",
    name: "Agnes Pruitt",
    question: "O que a biblioteca consegue confirmar sobre 1949?",
    answer:
      "Agnes transmite o relato do irmão sobre cinco crianças na pedreira e diz que apenas ele voltou. O jornal encadernado registra um incidente e o fechamento, mas não dá os nomes nem a contagem.",
    clue: "Distinga o que Agnes ouviu do irmão do que está documentado no jornal.",
    source: "Capítulo 9 · A Biblioteca",
  },
  {
    id: "sam",
    stage: "clearing",
    name: "Sam Reyes",
    question: "Qual foi o limite combinado para o acampamento?",
    answer:
      "O Sr. Reyes permitiu que os quatro ficassem na clareira antes da cerca. A permissão não incluía atravessar para a pedreira.",
    clue: "O acampamento autorizado e a travessia posterior são momentos diferentes.",
    source: "Capítulos 11 e 12 · Permissão / A Clareira",
  },
  {
    id: "cass",
    stage: "clearing",
    name: "Cass",
    question: "O que ficou registrado sobre os rastros?",
    answer:
      "Cass fotografou uma das pegadas e Sam a desenhou. Esses registros mostram uma marca no chão; não identificam quem a deixou.",
    clue: "Uma imagem de uma pegada não determina, por si só, a identidade de quem passou.",
    source: "Capítulos 12 e 13 · A Clareira / Quem Confia em Quem",
  },
  {
    id: "webb",
    stage: "disappearance",
    name: "Sr. Webb",
    question: "A pasta explica o que aconteceu com Marcus?",
    answer:
      "Webb descreve uma expedição de pesquisa no gelo e mostra os documentos que guardou. Ele admite que não sabe quem eram os homens da fotografia nem o que o texto significa.",
    clue: "A semelhança entre registros é uma pista; Webb não confirma uma causa ou identidade comum.",
    source: "Capítulos 23 e 24 · A Pasta do Sr. Webb / O Mesmo Tipo de Fome",
  },
  {
    id: "boyle",
    stage: "equinox",
    name: "Xerife Boyle",
    question: "O relatório oficial descreve tudo o que os meninos dizem ter visto?",
    answer:
      "Não. O texto oficial registra baixa visibilidade e desorientação coletiva. Boyle escolhe não incluir os elementos que os meninos relataram.",
    clue: "O relatório informa a versão pública adotada, não toda a narrativa vivida.",
    source: "Capítulos 20 e 32 · O Que a Cidade Decidiu Acreditar / Setembro",
  },
] as const;

export const SPARROW_HOLLOW_CLAIMS = [
  {
    id: "newspaper-1949",
    stage: "archive",
    statement:
      "O jornal de 1949 registra um incidente e o fechamento por motivos de segurança, sem identificar as crianças nem relatar mortes.",
    correctClass: "record",
    explanation:
      "Essa formulação descreve o que aparece no registro jornalístico; ele não confirma a história completa de Agnes.",
    source: "Capítulo 9 · A Biblioteca",
  },
  {
    id: "agnes-five",
    stage: "archive",
    statement:
      "Cinco crianças entraram na pedreira em 1949 e apenas o irmão de Agnes saiu, segundo o que ela conta.",
    correctClass: "retelling",
    explanation: "É o relato de Agnes sobre o irmão, não uma contagem registrada pelo jornal.",
    source: "Capítulo 9 · A Biblioteca",
  },
  {
    id: "collapse-certain",
    stage: "archive",
    statement: "Um desabamento é a causa comprovada do fechamento da pedreira.",
    correctClass: "unsupported",
    explanation:
      "Desabamento é uma das versões locais; o texto mostra versões incompatíveis e nenhum registro que confirme a causa.",
    source: "Capítulo 3 · A Pedreira Velha",
  },
  {
    id: "birds-observed",
    stage: "archive",
    statement: "Denny narra pardais imóveis voltados para oeste, na direção das antigas pedreiras.",
    correctClass: "witness",
    explanation:
      "É uma observação narrada por Denny. O romance não dá uma causa biológica ou sobrenatural para as aves.",
    source: "Capítulo 1 · Bicicletas ao Entardecer",
  },
  {
    id: "permission-boundary",
    stage: "clearing",
    statement:
      "O Sr. Reyes autoriza o acampamento na clareira antes da cerca e proíbe atravessá-la.",
    correctClass: "witness",
    explanation:
      "O limite da autorização é expresso na conversa narrada; a travessia acontece depois, sem permissão.",
    source: "Capítulos 11 e 12 · Permissão / A Clareira",
  },
  {
    id: "tracks-documented",
    stage: "clearing",
    statement:
      "Cass fotografa uma pegada e Sam a desenha; esses registros não identificam quem deixou as marcas.",
    correctClass: "witness",
    explanation:
      "O romance narra a fotografia e o desenho, mas não oferece identificação conclusiva da origem das pegadas.",
    source: "Capítulos 12 e 13 · A Clareira / Quem Confia em Quem",
  },
  {
    id: "collar-owner",
    stage: "clearing",
    statement:
      "A coleira identifica Rex e E. Pruitt; o livro não identifica quem a pendurou na cerca.",
    correctClass: "witness",
    explanation:
      "Sam encontra a coleira e observa que ela foi colocada ali de propósito; isso não identifica a pessoa responsável.",
    source: "Capítulo 14 · O Que o Sam Não Contou",
  },
  {
    id: "collar-destination",
    stage: "clearing",
    statement: "A coleira prova que Rex entrou na pedreira e revela o destino do cão.",
    correctClass: "unsupported",
    explanation:
      "A coleira liga Rex a E. Pruitt e aparece na cerca, mas o texto não confirma quem a colocou nem para onde o cão foi.",
    source: "Capítulos 14 e 33 · O Que o Sam Não Contou / O Resto do Verão",
  },
  {
    id: "crossing-disappearance",
    stage: "disappearance",
    statement:
      "Na segunda noite, os quatro atravessam a cerca e Marcus desaparece depois de descer os degraus.",
    correctClass: "witness",
    explanation:
      "Esse é o relato de Denny sobre a travessia e o desaparecimento; o mecanismo não é explicado.",
    source: "Capítulos 16 e 17 · Do Outro Lado da Cerca / O Que Vive no Fundo",
  },
  {
    id: "tracks-no-body",
    stage: "disappearance",
    statement: "A busca encontra pegadas que terminam na borda, sem encontrar Marcus ou um corpo.",
    correctClass: "witness",
    explanation:
      "O relato distingue a trilha física do que não foi encontrado; não autoriza concluir morte ou destino.",
    source: "Capítulo 18 · Antes do Amanhecer",
  },
  {
    id: "fourth-day-return",
    stage: "disappearance",
    statement:
      "Marcus retorna no começo do quarto dia; a referência de Boyle a três dias é sobre a irmã dele, em 1962.",
    correctClass: "witness",
    explanation:
      "O romance separa as ocorrências. Não há explicação textual para reconciliar as contagens.",
    source: "Capítulo 22 · O Quarto Dia; Capítulo 33 · O Resto do Verão",
  },
  {
    id: "webb-cause",
    stage: "disappearance",
    statement: "A pasta do Sr. Webb comprova a causa do desaparecimento de Marcus.",
    correctClass: "unsupported",
    explanation:
      "A pasta sugere uma investigação anterior e contém uma frase enigmática; Webb não identifica a causa do caso de Marcus.",
    source: "Capítulos 23 e 24 · A Pasta do Sr. Webb / O Mesmo Tipo de Fome",
  },
  {
    id: "seed-interpretation",
    stage: "equinox",
    statement:
      "A comparação do fenômeno com uma semente é a interpretação atribuída ao irmão do Sr. Pruitt, não uma explicação confirmada.",
    correctClass: "hypothesis",
    explanation:
      "Agnes transmite a interpretação do irmão. O próprio romance não a trata como mecanismo comprovado.",
    source: "Capítulo 27 · O Que a Senhorita Pruitt Não Quis Dizer",
  },
  {
    id: "six-children",
    stage: "equinox",
    statement:
      "Na noite do equinócio, seis crianças estão nos degraus da pedreira; elas e Marcus voltam a responder após a intervenção dos amigos.",
    correctClass: "witness",
    explanation:
      "É o relato do narrador sobre o clímax. Ele descreve o que ocorreu, mas diz não entender sua física ou lógica.",
    source: "Capítulos 30 e 31 · O Que Ela Estava Construindo / O Que a Amizade Consegue Fazer",
  },
  {
    id: "official-terms",
    stage: "equinox",
    statement: "O relatório público registra baixa visibilidade e desorientação coletiva.",
    correctClass: "record",
    explanation:
      "Esses termos pertencem ao relatório posterior e não incluem tudo o que os meninos dizem ter visto.",
    source: "Capítulo 32 · Setembro",
  },
  {
    id: "entity-destroyed",
    stage: "equinox",
    statement:
      "O romance confirma que a presença foi destruída e que o perigo terminou para sempre.",
    correctClass: "unsupported",
    explanation:
      "A presença recua; Denny diz que não compreende o mecanismo. O livro não afirma destruição definitiva nem encerramento da ameaça.",
    source: "Capítulos 31 e epílogo",
  },
] as const;

export type SparrowHollowClaimId = (typeof SPARROW_HOLLOW_CLAIMS)[number]["id"];
export type SparrowHollowClaimAnswers = Partial<
  Record<SparrowHollowClaimId, SparrowHollowEvidenceClass>
>;

export function getSparrowHollowStageClaims(stage: SparrowHollowStageId) {
  return SPARROW_HOLLOW_CLAIMS.filter((claim) => claim.stage === stage);
}

export function checkSparrowHollowStageClaims(
  stage: SparrowHollowStageId,
  answers: SparrowHollowClaimAnswers,
) {
  const claims = getSparrowHollowStageClaims(stage);
  return claims.length > 0 && claims.every((claim) => answers[claim.id] === claim.correctClass);
}

export const SPARROW_HOLLOW_VERDICTS = [
  {
    id: "accident",
    title: "Marcus se perdeu por acidente; a volta encerra a busca e explica a causa.",
    correct: false,
    explanation:
      "A busca e o retorno estão narrados, mas não explicam o que aconteceu dentro da pedreira nem por que Marcus voltou diferente.",
  },
  {
    id: "destroyed",
    title: "A presença foi destruída no equinócio, e a cidade ficou definitivamente a salvo.",
    correct: false,
    explanation:
      "A presença recua; o narrador não afirma que ela foi destruída ou que a ameaça terminou para sempre.",
  },
  {
    id: "supported",
    title:
      "Marcus desapareceu após descer à pedreira, voltou no começo do quarto dia e foi recuperado com as seis crianças no equinócio; a presença recuou, mas sua natureza e o mecanismo continuam sem explicação.",
    correct: true,
    explanation:
      "Essa síntese distingue o que o narrador relata, o que o relatório oficial registra e o que permanece sem prova. Ela não transforma a hipótese da “semente” em diagnóstico.",
  },
  {
    id: "expedition",
    title: "A pasta de Webb identifica a origem da presença e prova que o fenômeno foi controlado.",
    correct: false,
    explanation:
      "Webb não sabe quem eram os homens da fotografia nem o que a pasta significa. O documento não resolve o caso de Marcus.",
  },
] as const;

export type SparrowHollowActionCountsInput = {
  recordsOpened: number;
  interviewsOpened: number;
  claimsCorrect: number;
  stagesCompleted: number;
  verdictCorrect: boolean;
  mistakes: number;
};

function clampCount(value: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;
}

export function getSparrowHollowActionCounts(input: SparrowHollowActionCountsInput) {
  const recordsOpened = clampCount(input.recordsOpened, SPARROW_HOLLOW_RECORDS.length);
  const interviewsOpened = clampCount(input.interviewsOpened, SPARROW_HOLLOW_INTERVIEWS.length);
  const claimsCorrect = clampCount(input.claimsCorrect, SPARROW_HOLLOW_CLAIMS.length);
  const stagesCompleted = clampCount(input.stagesCompleted, SPARROW_HOLLOW_STAGES.length);
  const mistakes = clampCount(input.mistakes, Number.MAX_SAFE_INTEGER);
  const correctActions =
    recordsOpened +
    interviewsOpened +
    claimsCorrect +
    stagesCompleted +
    (input.verdictCorrect ? 1 : 0);

  return { correctActions, totalActions: correctActions + mistakes };
}

export type SparrowHollowScoreInput = {
  recordsOpened: number;
  interviewsOpened: number;
  claimsCorrect: number;
  stagesCompleted: number;
  verdictCorrect: boolean;
  mistakes: number;
  hints: number;
};

export function getSparrowHollowScore(input: SparrowHollowScoreInput) {
  const records = clampCount(input.recordsOpened, SPARROW_HOLLOW_RECORDS.length);
  const interviews = clampCount(input.interviewsOpened, SPARROW_HOLLOW_INTERVIEWS.length);
  const claims = clampCount(input.claimsCorrect, SPARROW_HOLLOW_CLAIMS.length);
  const stages = clampCount(input.stagesCompleted, SPARROW_HOLLOW_STAGES.length);
  const mistakes = clampCount(input.mistakes, Number.MAX_SAFE_INTEGER);
  const hints = clampCount(input.hints, Number.MAX_SAFE_INTEGER);
  const points =
    Math.round((records / SPARROW_HOLLOW_RECORDS.length) * 30) +
    Math.round((interviews / SPARROW_HOLLOW_INTERVIEWS.length) * 15) +
    Math.round((claims / SPARROW_HOLLOW_CLAIMS.length) * 35) +
    Math.round((stages / SPARROW_HOLLOW_STAGES.length) * 10) +
    (input.verdictCorrect ? 10 : 0) -
    mistakes * 3 -
    hints * 2;

  return Math.max(0, Math.min(100, points));
}
