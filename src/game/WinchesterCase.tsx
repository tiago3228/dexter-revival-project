import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardList, Eye, FileSearch, LockKeyhole, Search, ShieldAlert, Skull, Sparkles, Users } from "lucide-react";
import { CaseHeroImage } from "./CaseHeroImage";
import { recordCaseCompletion } from "./achievements";
import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "./caseTimer";
import oTrioAsset from "@/assets/o-trio.png.asset.json";

type Act = 0 | 1 | 2 | 3 | 4 | 5;
type Evidence = { id: string; title: string; source: string; detail: string; act: Act; category: string; interaction?: "route" | "manifest" | "recorder"; audio?: string };
const EVIDENCE: Evidence[] = [
  { id: "blood", title: "Sangue sem origem", source: "Cena do canal", detail: "O sangue está disposto em três pontos separados, mas não há trilha de arrasto nem volume compatível com uma vítima ferida. O padrão parece ter sido montado.", act: 0, category: "Forense" },
  { id: "clock", title: "Relógio parado às 03:17", source: "Apartamento de Elias Voss", detail: "O relógio parou às 03:17, mas a bateria foi removida depois. A hora é uma mensagem deliberada, não um horário confiável de morte.", act: 0, category: "Forense" },
  { id: "salt", title: "Resíduo mineral", source: "Borda do canal", detail: "Cristais incomuns misturados à lama não pertencem à água do canal. A composição é compatível com um antigo depósito industrial perto das docas.", act: 0, category: "Laboratório" },
  { id: "camera", title: "Intervalo apagado", source: "Câmera municipal", detail: "A gravação some por onze minutos, mas o relógio interno da câmera foi atrasado em seis minutos. Alguém tinha acesso ao sistema antes da noite do crime.", act: 1, category: "Digital" },
  { id: "autopsy", title: "Laudo incompatível", source: "Necrotério", detail: "A temperatura registrada não sustenta o horário oficial. O formulário foi alterado depois da assinatura, e a tinta da correção é recente.", act: 1, category: "Forense" },
  { id: "badge", title: "Crachá de visitante", source: "Arquivo da delegacia", detail: "O crachá foi emitido com credenciais federais válidas, mas o número de série pertence a um lote recolhido anos atrás.", act: 1, category: "Documental" },
  { id: "sam", title: "Caderno de Sam", source: "Quarto alugado", detail: "Sam registrou desaparecimentos com o mesmo intervalo entre cidades diferentes. Ele evita chamar isso de padrão até que você apresente as datas e os nomes.", act: 2, category: "Histórico" },
  { id: "dean", title: "Recibo de Dean", source: "Estacionamento das docas", detail: "O recibo prova que Dean estava perto do depósito antes da polícia chegar. Ele diz que procurava uma pessoa desaparecida, não o assassino.", act: 2, category: "Depoimento" },
  { id: "route-map", title: "Mapa de desvios de Mateo", source: "Quarto alugado", detail: "No mapa dobrado, Dean marcou duas rotas para chegar às docas. A estrada principal passa diante de uma câmera ativa; a rota de serviço cruza o intervalo apagado. Um horário foi escrito por cima e quase desapareceu.", act: 2, category: "Rota", interaction: "route" },
  { id: "archive", title: "Ficha retirada do arquivo", source: "Arquivo municipal", detail: "Três vítimas foram declaradas mortas sem que seus corpos fossem identificados. A mesma assinatura autorizou a transferência dos registros.", act: 3, category: "Histórico" },
  { id: "family", title: "Fotografia queimada", source: "Arquivo lacrado", detail: "Uma família aparece ao lado de um carro destruído. No verso, duas iniciais — S. W. — e uma data que antecede a primeira série de desaparecimentos.", act: 3, category: "Pessoal" },
  { id: "ledger", title: "Livro-caixa do cais", source: "Armazém 9", detail: "Pagamentos foram feitos para apagar imagens, deslocar caixas sem carga declarada e alterar o inventário de um depósito fechado há décadas.", act: 4, category: "Financeiro" },
  { id: "symbol", title: "Marca no concreto", source: "Armazém 9", detail: "A marca não é uma assinatura comum. Sam reconhece um símbolo usado para proteger uma área; Dean insiste que alguém o desenhou de propósito para assustar a polícia.", act: 4, category: "Anômalo" },
  { id: "manifest", title: "Manifesto de carga reescrito", source: "Mesa de despacho · Armazém 9", detail: "Três cópias do manifesto listam pesos diferentes para a mesma caixa. A via carbono preservou o lote original, mas um algarismo está coberto por uma mancha de tinta.", act: 4, category: "Documental", interaction: "manifest" },
  { id: "yellow", title: "Testemunho dos olhos amarelos", source: "Sala de máquinas", detail: "A testemunha descreve olhos amarelos refletidos no escuro e uma presença que não aparece nas câmeras. Sam liga o relato à história de sua família. A hipótese de Azazel deixa de ser apenas folclore.", act: 5, category: "Testemunho" },
  { id: "trap", title: "Círculo de contenção", source: "Piso do armazém", detail: "Sob a tinta recente há um desenho antigo, interrompido por marcas de arrasto. A cena foi preparada como armadilha — e talvez não para um ser humano.", act: 5, category: "Anômalo" },
  { id: "recorder", title: "Gravador de campo de Sam", source: "Subsolo do armazém", detail: "A gravação de Sam foi interrompida no meio de uma frase. O trecho final descreve a rota de serviço e alerta para uma marca escondida na margem do mapa.", act: 5, category: "Áudio", interaction: "recorder", audio: "/audio/winchester/field-message-sam.wav" },
];
const ACTS = [
  { title: "Ecos na cena do crime", subtitle: "Canal de Miami · 23h40", desc: "Uma cena montada tenta convencer Dexter de que houve uma luta. O sangue, porém, conta uma história diferente." },
  { title: "A perícia não fecha", subtitle: "Laboratório e Homicídios", desc: "Horários, laudo e câmeras discordam. A investigação começa a parecer manipulada por alguém com acesso oficial." },
  { title: "Os homens que sabem demais", subtitle: "Hotel barato · madrugada", desc: "Dois agentes federais — Sam e Dean Winchester — chegam com perguntas que não constam no relatório policial." },
  { title: "O arquivo que não deveria existir", subtitle: "Arquivo municipal", desc: "Desaparecimentos antigos ligam cidades distantes. Há documentos removidos, identidades incompletas e uma família que alguém tentou apagar." },
  { title: "A armadilha", subtitle: "Docas · Armazém 9", desc: "A trilha converge para um depósito abandonado. Dexter precisa decidir se confia nos irmãos antes que alguém destrua a última prova." },
  { title: "Os olhos amarelos", subtitle: "Subsolo do armazém", desc: "A explicação racional ainda é possível — até que os últimos vestígios e um testemunho impossível se cruzam. A resposta de Dexter a Sam e Dean define qual final especial poderá alcançar." },
] as const;
const SUSPECTS = [
  { id: "vale", name: "Detetive Mara Vale", role: "Investigadora do caso", clue: "Tinha acesso ao arquivo e autorizou a correção do laudo.", question: "Quem alterou o horário da morte?", answer: "Eu assinei a primeira versão. A correção chegou pronta da chefia. Não conferi o original antes de anexar.", audio: "/audio/winchester/mara-vale-interview.wav", dialogue: [{ speaker: "Dexter", text: "Quem alterou o horário da morte?" }, { speaker: "Detetive Mara Vale", text: "Eu assinei a primeira versão. A correção chegou pronta da chefia. Não conferi o original antes de anexar." }, { speaker: "Dexter", text: "Então alguém usou sua assinatura para fazer o relatório parecer legítimo." }, { speaker: "Detetive Mara Vale", text: "Ou eu fui descuidada o bastante para facilitar. Vou entregar o histórico de acesso." }] },
  { id: "dock", name: "Nico Alvarez", role: "Funcionário das docas", clue: "Conhece o armazém e recebeu pagamentos fora da folha.", question: "O que foi retirado do armazém?", answer: "Caixas vazias no papel. Algumas pesavam demais. Disseram que era equipamento antigo e me pagaram para não perguntar.", audio: "/audio/winchester/nico-alvarez-interview.wav", dialogue: [{ speaker: "Dexter", text: "O que foi retirado do armazém?" }, { speaker: "Nico Alvarez", text: "Caixas vazias no papel. Algumas pesavam demais. Disseram que era equipamento antigo e me pagaram para não perguntar." }, { speaker: "Dexter", text: "Quem fez o pagamento?" }, { speaker: "Nico Alvarez", text: "Um intermediário. Guardei o recibo porque não confiei nele. Se ainda estiver no meu armário, vocês podem conferir." }] },
  { id: "witness", name: "Lena Ortiz", role: "Testemunha sobrevivente", clue: "Mudou seu depoimento após receber uma ameaça.", question: "O que você viu naquela noite?", answer: "Uma figura no corredor. Achei que fosse um homem, até olhar para o rosto. Os olhos refletiam amarelo. Ninguém acreditou em mim.", audio: "/audio/winchester/lena-ortiz-interview.wav", dialogue: [{ speaker: "Dexter", text: "O que você viu naquela noite?" }, { speaker: "Lena Ortiz", text: "Uma figura no corredor. Achei que fosse um homem, até olhar para o rosto. Os olhos refletiam amarelo. Ninguém acreditou em mim." }, { speaker: "Dexter", text: "Não vou pedir que chame isso de monstro. Só me diga o que aconteceu, na ordem em que aconteceu." }, { speaker: "Lena Ortiz", text: "Primeiro veio o barulho no subsolo. Depois a luz apagou. Então vi os olhos." }] },
  { id: "archivist", name: "Dr. Peter Hales", role: "Arquivista municipal", clue: "A assinatura dele aparece em transferências de registros.", question: "Por que os registros desapareceram?", answer: "Recebi ordens com carimbo oficial. Quando tentei contestar, meu próprio arquivo pessoal foi esvaziado.", audio: "/audio/winchester/peter-hales-interview.wav", dialogue: [{ speaker: "Dexter", text: "Por que os registros desapareceram?" }, { speaker: "Dr. Peter Hales", text: "Recebi ordens com carimbo oficial. Quando tentei contestar, meu próprio arquivo pessoal foi esvaziado." }, { speaker: "Dexter", text: "Alguém acessou os registros depois da ordem?" }, { speaker: "Dr. Peter Hales", text: "Sim. O terminal do subsolo foi usado fora do expediente. O livro de visitas foi apagado, mas a impressora ainda guarda o número do lote." }] },
] as const;

type DialogueLine = { speaker: string; text: string };
type DialogueOption = { id: string; label: string; lines: DialogueLine[]; audioSrc?: string };
type InterviewDetails = { id: string; name: string; role: string; opening: DialogueLine[]; followUps: DialogueOption[]; audioSrc?: string };
type InterviewProgress = { lines: DialogueLine[]; explored: string[] };
type EndingChoice = "false" | "partial" | "true" | "secret" | "sam" | "dean" | "dexter";

const WINCHESTER_DIALOGUES: Record<string, InterviewDetails> = {
  sam: {
    id: "sam",
    name: "Sam Winchester",
    role: "Pesquisador · registros históricos",
    audioSrc: "/audio/winchester/sam-dexter-opening.wav",
    opening: [
      { speaker: "Dexter", text: "Você pediu para conversar fora do relatório. Isso costuma significar que alguém quer esconder alguma coisa." },
      { speaker: "Sam", text: "Ou que o relatório já foi escrito para esconder. Em três cidades, desaparecimentos foram arquivados como fugas." },
      { speaker: "Dexter", text: "Mostre-me o padrão. Sem folclore, só o que os registros dizem." },
      { speaker: "Sam", text: "Onze desaparecimentos em oito anos. Cada cidade tinha uma obra abandonada, uma câmera desligada e um sobrevivente que depois mudou a versão." },
      { speaker: "Dexter", text: "Coincidências empilhadas ainda são coincidências. Mas alguém está escolhendo os lugares e editando as provas." },
      { speaker: "Sam", text: "É por isso que precisamos das duas coisas: a sua perícia e o que aprendemos seguindo os casos." },
    ],
    followUps: [
      {
        id: "sam-pattern",
        label: "Perguntar sobre o padrão entre as cidades",
        lines: [
          { speaker: "Dexter", text: "Mostre-me o padrão. Sem folclore, só o que os registros dizem." },
          { speaker: "Sam", text: "Onze desaparecimentos em oito anos. Cada cidade tinha uma obra abandonada, uma câmera desligada e um sobrevivente que depois mudou a versão." },
          { speaker: "Dean", text: "E agora Miami tem um relógio parado, onze minutos apagados e gente jurando que viu olhos amarelos." },
          { speaker: "Dexter", text: "Coincidências empilhadas ainda são coincidências. Mas alguém está escolhendo os lugares e editando as provas." },
          { speaker: "Sam", text: "É por isso que precisamos das duas coisas: a sua perícia e o que aprendemos seguindo os casos." },
        ],
      },
      {
        id: "sam-family",
        label: "Perguntar sobre a tragédia da família Winchester",
        audioSrc: "/audio/winchester/sam-family-story.wav",
        lines: [
          { speaker: "Dexter", text: "Você disse que as datas coincidem com uma tragédia da sua família. O que aconteceu?" },
          { speaker: "Sam", text: "Quando eu era criança, algo entrou na nossa casa. Minha mãe morreu naquela noite. Meu pai passou o resto da vida procurando uma explicação que ninguém queria ouvir." },
          { speaker: "Dexter", text: "Uma família pode transformar dor em método. Às vezes, o método protege. Às vezes, só mantém a ferida aberta." },
          { speaker: "Sam", text: "Eu sei. Mas se eu parar de procurar, aquela noite vira só mais um arquivo esquecido." },
          { speaker: "Dexter", text: "Eu entendo o impulso. Não significa que ele sempre esteja certo." },
        ],
      },
      {
        id: "sam-dean",
        label: "Perguntar por que Dean desconfia tanto da polícia",
        audioSrc: "/audio/winchester/sam-dean-trust.wav",
        lines: [
          { speaker: "Sam", text: "Você já viu arquivos desaparecerem depois de uma ligação. Para você, confiar primeiro é dar vantagem a quem está mentindo." },
          { speaker: "Dean", text: "Não precisa me explicar como se eu não estivesse aqui, Sam." },
          { speaker: "Sam", text: "Então explica você." },
          { speaker: "Dean", text: "Eu confio nele para encontrar o que eu não vejo. Só não confio no sistema para deixar a gente terminar." },
          { speaker: "Sam", text: "E eu confio que você vai me ouvir quando eu disser que desta vez precisamos deixar a prova intacta." },
          { speaker: "Dean", text: "Eu ouvi. Ainda não disse que gosto do plano." },
        ],
      },
      {
        id: "sam-hunting",
        label: "Perguntar como Sam transforma o passado em pistas verificáveis",
        lines: [
          { speaker: "Dexter", text: "Você liga desaparecimentos a histórias antigas. Como evita enxergar um padrão onde só há coincidência?" },
          { speaker: "Sam", text: "Procuro o que pode ser conferido: datas, rotas, objetos que aparecem em mais de uma cena. A lenda só me diz onde começar." },
          { speaker: "Dean", text: "E eu vou ao lugar. Um arquivo pode mentir; uma porta arrombada não costuma escrever relatório." },
          { speaker: "Sam", text: "Desta vez, o livro-caixa e a marca no concreto são o elo. Se não coincidirem, abandonamos a teoria." },
          { speaker: "Dexter", text: "Bom. Uma hipótese que aceita ser testada é mais útil que uma certeza que não aceita perguntas." },
        ],
      },
      {
        id: "sam-dexter-code",
        label: "Perguntar o que Sam percebeu no método de Dexter",
        lines: [
          { speaker: "Sam", text: "Você olha para uma cena como se estivesse ouvindo alguém contar uma história. O que procura primeiro?" },
          { speaker: "Dexter", text: "O que não pertence. Sangue sem ferida. Uma pausa que não combina com a gravação. Um detalhe colocado para ser notado." },
          { speaker: "Dean", text: "Então o autor da cena queria que você encontrasse o sangue." },
          { speaker: "Dexter", text: "Ou queria que eu parasse de procurar depois dele. Não pretendo facilitar." },
          { speaker: "Sam", text: "É exatamente por isso que achei que você poderia nos ajudar." },
        ],
      },
    ],
  },
  dean: {
    id: "dean",
    name: "Dean Winchester",
    role: "Agente federal · campo",
    audioSrc: "/audio/winchester/dean-dexter-docks.wav",
    opening: [
      { speaker: "Dexter", text: "Seu recibo põe você nas docas antes da polícia. Quer explicar por quê?" },
      { speaker: "Dean", text: "Eu procurava Mateo Ruiz. Sumiu há duas semanas. O nome dele aparece no livro de entrada do cais." },
      { speaker: "Dexter", text: "Não há Mateo no relatório oficial." },
      { speaker: "Dean", text: "A gente não veio roubar a sua investigação. Viemos descobrir quem está apagando pessoas antes que o próximo nome suma." },
      { speaker: "Dexter", text: "Você quer que eu confie em dois agentes que omitiram metade da história." },
      { speaker: "Dean", text: "Não. Quero que confira cada palavra. É assim que a gente continua vivo." },
    ],
    followUps: [
      {
        id: "dean-mateo",
        label: "Perguntar quem é Mateo Ruiz",
        lines: [
          { speaker: "Dexter", text: "Quem era Mateo antes de virar um nome que alguém apagou?" },
          { speaker: "Dean", text: "Mecânico. Consertava caminhões perto das docas e fazia perguntas demais sobre cargas sem registro." },
          { speaker: "Sam", text: "A irmã dele recebeu uma ligação dizendo que Mateo tinha ido embora. A conta bancária, o apartamento e o carro ficaram para trás." },
          { speaker: "Dexter", text: "Uma fuga que deixa tudo para trás costuma ser uma cena montada." },
          { speaker: "Dean", text: "Agora você está entendendo por que eu estava lá antes da perícia." },
        ],
      },
      {
        id: "dean-skeptic",
        label: "Perguntar se ele acredita na hipótese de Sam",
        lines: [
          { speaker: "Dexter", text: "Sam fala em um padrão, símbolos e uma tragédia antiga. Você acredita nele?" },
          { speaker: "Dean", text: "Acredito que ele pesquisa melhor do que qualquer um que conheço. Isso não significa que eu aceite toda conclusão antes de ver a prova." },
          { speaker: "Sam", text: "Dean já viu coisas que não consegue explicar. Ele só prefere chamar de problema até não haver outra palavra." },
          { speaker: "Dean", text: "E você prefere transformar tudo em teoria. É por isso que funcionamos — um de nós sempre pede a prova que o outro esqueceu." },
          { speaker: "Dexter", text: "No meu trabalho, essa discussão costuma começar depois que alguém já limpou a cena." },
        ],
      },
      {
        id: "dean-dexter",
        label: "Perguntar por que ele escolheu envolver Dexter",
        lines: [
          { speaker: "Dexter", text: "Você podia ter procurado um detetive federal. Por que veio até mim?" },
          { speaker: "Dean", text: "Porque você percebeu que o sangue foi colocado ali depois. A maioria viu vermelho e concluiu que tinha um corpo." },
          { speaker: "Sam", text: "E porque você não escreveu 'fuga voluntária' só para fechar o caso antes do fim do turno." },
          { speaker: "Dexter", text: "Não confunda persistência com confiança. Eu ainda vou verificar tudo o que disserem." },
          { speaker: "Dean", text: "Ótimo. A gente também." },
        ],
      },
      {
        id: "dean-brothers",
        label: "Perguntar por que Dean sempre protege Sam",
        lines: [
          { speaker: "Dexter", text: "Você responde por Sam antes que ele termine. É hábito de campo ou medo de perdê-lo?" },
          { speaker: "Dean", text: "Eu sou o irmão mais velho. Se alguém precisa entrar primeiro numa sala perigosa, sou eu." },
          { speaker: "Sam", text: "Ele diz isso como se eu ainda fosse criança. Mas eu também voltaria por ele, sem pensar." },
          { speaker: "Dean", text: "Eu sei. É justamente o que me preocupa." },
          { speaker: "Dexter", text: "Família é uma excelente razão para tomar decisões ruins com convicção." },
        ],
      },
      {
        id: "dean-impala",
        label: "Perguntar o que Dean encontrou nas docas",
        lines: [
          { speaker: "Dexter", text: "Você passou pelas docas antes de qualquer equipe oficial. O que viu que não está no meu laudo?" },
          { speaker: "Dean", text: "Pneus pesados sobre a poeira, uma marca de arrasto que termina na rampa e um cadeado trocado recentemente." },
          { speaker: "Sam", text: "A câmera foi desligada por dentro. O horário bate com o intervalo apagado do registro." },
          { speaker: "Dexter", text: "Isso transforma uma suspeita em uma sequência. Vou comparar com o padrão do sangue." },
          { speaker: "Dean", text: "Faça isso. Se a sequência não fechar, não temos nada." },
        ],
      },
    ],
  },
  "family-photo": {
    id: "family-photo",
    name: "Sam e Dean Winchester",
    role: "Conversa no arquivo municipal · fotografia queimada",
    opening: [
      { speaker: "Dexter", text: "As iniciais no verso são S. W. Sam Winchester. Por que seu nome aparece numa fotografia ligada a Elias Voss?" },
      { speaker: "Sam", text: "Não é minha letra. A foto foi tirada durante uma investigação antiga. Nós chegamos à cidade depois que três pessoas desapareceram." },
      { speaker: "Dean", text: "A polícia disse que a família da foto tinha ido embora. O carro foi encontrado queimado, mas ninguém procurou os corpos." },
      { speaker: "Dexter", text: "E vocês deixaram isso fora do depoimento." },
      { speaker: "Sam", text: "Porque a última vez que entregamos essa informação, o arquivo sumiu e uma testemunha retirou tudo o que disse." },
      { speaker: "Dean", text: "Agora você tem a foto. Decide se quer uma versão conveniente ou uma investigação de verdade." },
    ],
    followUps: [
      {
        id: "photo-date",
        label: "Perguntar o que aconteceu na noite da fotografia",
        lines: [
          { speaker: "Dexter", text: "Sam, conte a sequência desde o começo. Quem tirou a foto?" },
          { speaker: "Sam", text: "Um vizinho. Ele viu a família discutindo perto do carro e chamou a polícia. Quando voltamos, a casa estava vazia e o relatório dizia que nunca houve chamado." },
          { speaker: "Dean", text: "A única coisa que sobrou foi essa cópia. Alguém queimou as bordas, mas esqueceu o verso." },
          { speaker: "Dexter", text: "Destruir o conteúdo e preservar a identificação. Um erro pequeno, mas muito humano." },
        ],
      },
      {
        id: "photo-trust",
        label: "Questionar por que os irmãos esconderam a ligação",
        lines: [
          { speaker: "Dexter", text: "Vocês pedem confiança, mas guardaram a pista mais pessoal até eu encontrá-la." },
          { speaker: "Dean", text: "Eu não sabia que a foto estava aqui. Sam reconheceu as iniciais e tentou ganhar tempo." },
          { speaker: "Sam", text: "Eu não queria que uma pista antiga virasse prova de que estamos envolvidos no desaparecimento." },
          { speaker: "Dexter", text: "O silêncio sempre parece proteção para quem o escolhe. Para quem investiga, parece motivo." },
          { speaker: "Dean", text: "Então não aceite nossa palavra. Compare com o livro-caixa e com o registro do arquivo." },
        ],
      },
    ],
  },
};

export function WinchesterCase({
  onBack,
  musicVolume,
  onMusicVolumeChange,
  soundOn,
  onToggleSound,
}: {
  onBack: () => void;
  musicVolume: number;
  onMusicVolumeChange: (value: number) => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  const [act, setAct] = useState<Act>(0);
  const [found, setFound] = useState<string[]>([]);
  const [interrogated, setInterrogated] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [trustWinchesters, setTrustWinchesters] = useState<boolean | null>(null);
  const [dialogueChoice, setDialogueChoice] = useState<"sam" | "dean" | "dexter" | null>(null);
  const [itemInteractions, setItemInteractions] = useState<string[]>([]);
  const [ending, setEnding] = useState<EndingChoice | null>(null);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("A primeira cena parece simples demais. Comece examinando os vestígios do canal.");
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const [routeAnswer, setRouteAnswer] = useState<string | null>(null);
  const [manifestAnswer, setManifestAnswer] = useState<string | null>(null);
  const [activeInterview, setActiveInterview] = useState<InterviewDetails | null>(null);
  const [currentDialogueAudio, setCurrentDialogueAudio] = useState<string | null>(null);
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [availableFollowUps, setAvailableFollowUps] = useState<DialogueOption[]>([]);
  const [interviewProgress, setInterviewProgress] = useState<Record<string, InterviewProgress>>({});
  const dialogueEndRef = useRef<HTMLDivElement | null>(null);
  const [ambientOn, setAmbientOn] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(() => {
    const stored = typeof window === "undefined" ? null : window.localStorage.getItem("dexter-winchester-ambient-volume");
    if (stored === null) return 0.3;
    const saved = Number(stored);
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.3;
  });
  const ambientRef = useRef<{ context: AudioContext; sources: AudioScheduledSourceNode[]; gains: GainNode[] } | null>(null);
  const recorded = useRef(false);

  const stopAmbient = useCallback(() => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    ambient.sources.forEach((source) => source.stop());
    ambientRef.current = null;
    void ambient.context.close();
  }, []);

  const startAmbient = useCallback(() => {
    if (!ambientOn || ambientRef.current || typeof window === "undefined") return;
    const context = new AudioContext();
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * 0.12;
    const roomTone = context.createBufferSource();
    roomTone.buffer = buffer;
    roomTone.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const roomGain = context.createGain();
    roomGain.gain.value = 0.025 * ambientVolume;
    roomTone.connect(filter).connect(roomGain).connect(context.destination);
    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 48;
    const humGain = context.createGain();
    humGain.gain.value = 0.008 * ambientVolume;
    hum.connect(humGain).connect(context.destination);
    roomTone.start();
    hum.start();
    ambientRef.current = { context, sources: [roomTone, hum], gains: [roomGain, humGain] };
  }, [ambientOn, ambientVolume]);

  useEffect(() => () => stopAmbient(), [stopAmbient]);
  useEffect(() => {
    if (!ambientOn) stopAmbient();
  }, [ambientOn, stopAmbient]);
  useEffect(() => {
    if (!ambientOn || ambientRef.current) return;
    window.addEventListener("pointerdown", startAmbient, { once: true });
    return () => window.removeEventListener("pointerdown", startAmbient);
  }, [ambientOn, startAmbient]);
  useEffect(() => {
    if (ambientRef.current) {
      const [roomGain, humGain] = ambientRef.current.gains;
      if (roomGain) roomGain.gain.value = 0.025 * ambientVolume;
      if (humGain) humGain.gain.value = 0.008 * ambientVolume;
    }
    window.localStorage.setItem("dexter-winchester-ambient-volume", String(ambientVolume));
  }, [ambientVolume]);

  useEffect(() => {
    beginCaseTimer("winchester");
    const pause = () => pauseCaseTimer("winchester");
    const visibility = () => document.visibilityState === "hidden" ? pauseCaseTimer("winchester") : beginCaseTimer("winchester");
    window.addEventListener("pagehide", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", pause);
      document.removeEventListener("visibilitychange", visibility);
      pauseCaseTimer("winchester");
    };
  }, []);

  const availableEvidence = useMemo(() => EVIDENCE.filter((item) => item.act <= act), [act]);
  const actEvidence = EVIDENCE.filter((item) => item.act === act);
  const openedEvidence = activeEvidence ? EVIDENCE.find((item) => item.id === activeEvidence) ?? null : null;
  const actFound = actEvidence.filter((item) => found.includes(item.id)).length;
  const progress = Math.round((found.length / EVIDENCE.length) * 100);
  const allHumanThreads = ["blood", "autopsy", "camera", "archive", "ledger"].every((id) => found.includes(id));
  const fullTimeline = ["clock", "salt", "sam", "family", "symbol"].every((id) => found.includes(id));
  const hasWitness = found.includes("yellow") && found.includes("trap");
  const interactiveEvidenceComplete = ["route-map", "manifest", "recorder"].every((id) => itemInteractions.includes(id));
  const allInterviews = interrogated.length >= 6;
  const correctConnections = ["family-sam", "ledger-vale", "yellow-witness", "symbol-dean", "route-map-dean", "manifest-vale"];
  const secretReady = EVIDENCE.every((item) => found.includes(item.id)) && interactiveEvidenceComplete && allInterviews && connections.includes("family-sam") && connections.includes("ledger-vale") && correctConnections.filter((key) => connections.includes(key)).length >= 3 && trustWinchesters === true && (dialogueChoice === "sam" || dialogueChoice === "dean") && mistakes === 0;

  useEffect(() => {
    if (!ending || recorded.current) return;
    recorded.current = true;
    const score = Math.max(0, Math.min(100, Math.round((found.length / EVIDENCE.length) * 60 + (allInterviews ? 15 : interrogated.length * 3) + (connections.length >= 3 ? 10 : connections.length * 2) + Math.min(6, itemInteractions.length * 2) + (hints === 0 ? 10 : Math.max(0, 10 - hints * 3)) - mistakes * 4)));
    recordCaseCompletion({ caseId: "winchester", score, hints, mistakes, correctConclusion: ending !== "false" && ending !== "partial", elapsedSeconds: finishCaseTimer("winchester"), correctActions: found.length + connections.length + interrogated.length + itemInteractions.length, totalActions: found.length + connections.length + interrogated.length + itemInteractions.length + mistakes });
  }, [ending, found.length, allInterviews, interrogated.length, connections.length, itemInteractions.length, hints, mistakes]);

  const examine = (id: string) => {
    if (!EVIDENCE.some((item) => item.id === id)) return;
    setRouteAnswer(null);
    setManifestAnswer(null);
    setActiveEvidence(id);
  };

  const catalogEvidence = (id: string) => {
    if (found.includes(id)) return;
    const item = EVIDENCE.find((e) => e.id === id);
    if (!item) return;
    setFound((current) => [...current, id]);
    setFeedback(`Nova evidência catalogada: ${item.title}. Compare com outros registros antes de concluir.`);
  };

  const solveInteractiveEvidence = (id: "route-map" | "manifest", answer: string) => {
    const correctAnswer = id === "route-map" ? "service-road" : "lot-09";
    if (answer !== correctAnswer) {
      setMistakes((current) => current + 1);
      setFeedback(id === "route-map" ? "Esse trajeto não cruza o intervalo da câmera. Reavalie os horários antes de registrar a rota." : "Esse lote não coincide com o peso preservado na via carbono. Tente cruzar o número com o Armazém 9.");
      return;
    }
    setItemInteractions((current) => current.includes(id) ? current : [...current, id]);
    setFeedback(id === "route-map" ? "Rota confirmada: a estrada de serviço cruza o apagão às 03h11 e termina na entrada de manutenção." : "Lote confirmado: o número 09 liga a caixa ao inventário oculto do armazém.");
  };

  const markRecorderHeard = () => {
    setItemInteractions((current) => current.includes("recorder") ? current : [...current, "recorder"]);
    setFeedback("Trecho do gravador catalogado. A voz de Sam confirma a rota e a marca escondida no mapa.");
  };

  const connect = () => {
    if (!selectedPerson || !selectedEvidence) return;
    const key = `${selectedEvidence}-${selectedPerson}`;
    const correct = key === "family-sam" || key === "ledger-vale" || key === "yellow-witness" || key === "symbol-dean" || key === "route-map-dean" || key === "manifest-vale";
    if (connections.includes(key)) {
      setFeedback("Essa ligação já está registrada no quadro.");
    } else {
      setConnections((current) => [...current, key]);
      if (correct) setFeedback("Conexão sustentada. A hipótese agora tem uma evidência independente.");
      else {
        setMistakes((current) => current + 1);
        setFeedback("Essa conexão não se sustenta sozinha. Registre como hipótese e procure confirmação.");
      }
    }
    setSelectedPerson(null);
    setSelectedEvidence(null);
  };

  const interview = (id: string) => {
    const person = SUSPECTS.find((p) => p.id === id);
    const interviewDetails: InterviewDetails | undefined = person
      ? {
          id,
          name: person.name,
          role: person.role,
          audioSrc: person.audio,
          opening: person.dialogue ? person.dialogue.map((line) => ({ ...line })) : [
            { speaker: "Dexter", text: person.question },
            { speaker: person.name, text: person.answer },
          ],
          followUps: [],
        }
      : WINCHESTER_DIALOGUES[id];
    if (!interviewDetails) return;
    if (id !== "family-photo") {
      setInterrogated((current) => current.includes(id) ? current : [...current, id]);
    }
    const progress = interviewProgress[id];
    setActiveInterview(interviewDetails);
    setCurrentDialogueAudio(interviewDetails.audioSrc ?? null);
    setDialogueLines(progress?.lines ?? interviewDetails.opening);
    setAvailableFollowUps(
      interviewDetails.followUps.filter((option) => !progress?.explored.includes(option.id)),
    );
    setFeedback(`Dexter abriu uma conversa com ${interviewDetails.name}.`);
  };

  const chooseDialogueOption = (option: DialogueOption) => {
    if (!activeInterview) return;
    const existing = interviewProgress[activeInterview.id] ?? {
      lines: activeInterview.opening,
      explored: [],
    };
    const nextLines = [...existing.lines, ...option.lines];
    const nextExplored = [...existing.explored, option.id];
    setDialogueLines(nextLines);
    setCurrentDialogueAudio(option.audioSrc ?? null);
    setInterviewProgress((current) => ({
      ...current,
      [activeInterview.id]: { lines: nextLines, explored: nextExplored },
    }));
    setAvailableFollowUps((current) => current.filter((item) => item.id !== option.id));
  };

  useEffect(() => {
    if (activeInterview) dialogueEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeInterview, dialogueLines.length]);

  const advance = () => {
    if (act === 0 && !["blood", "clock"].every((id) => found.includes(id))) return setFeedback("A cena ainda não foi documentada. Examine o sangue e o relógio antes de avançar.");
    if (act === 1 && !["camera", "autopsy"].every((id) => found.includes(id))) return setFeedback("O laboratório ainda tem contradições sem resposta. Confira câmera e laudo.");
    if (act === 2 && !["sam", "dean"].every((id) => found.includes(id))) return setFeedback("Você precisa registrar as duas versões antes de decidir se confia nos Winchester.");
    if (act === 3 && !["archive", "family"].every((id) => found.includes(id))) return setFeedback("O arquivo está incompleto. Encontre a ficha retirada e a fotografia.");
    if (act === 4 && !["ledger", "symbol"].every((id) => found.includes(id))) return setFeedback("O armazém ainda não foi documentado. Não avance sem registrar o livro-caixa e a marca.");
    if (act < 5) setAct((current) => (current + 1) as Act);
    setActiveEvidence(null);
    setFeedback(ACTS[Math.min(5, act + 1)]?.desc ?? ACTS[5].desc);
  };

  const conclude = (choice: EndingChoice) => {
    const finalChoice: EndingChoice = choice === "true" && dialogueChoice ? dialogueChoice : choice;
    if (finalChoice === "secret" && !secretReady) {
      setMistakes((current) => current + 1);
      setFeedback("O dossiê secreto ainda não está completo. Faltam evidências, entrevistas ou conexões independentes.");
      return;
    }
    if (finalChoice === "true" && !(allHumanThreads && fullTimeline && hasWitness && itemInteractions.includes("route-map") && itemInteractions.includes("recorder"))) {
      setMistakes((current) => current + 1);
      setFeedback("A hipótese sobrenatural ainda não está sustentada. Cruze o mapa, a gravação de Sam e as evidências humanas antes de concluir.");
      return;
    }
    if (finalChoice === "partial" && !allHumanThreads) {
      setFeedback("Ainda faltam provas para fechar a parte humana do caso. Reúna os vestígios do laboratório, arquivo e docas.");
      return;
    }
    if (finalChoice === "sam" && (dialogueChoice !== "sam" || trustWinchesters !== true || !(allHumanThreads && fullTimeline && hasWitness && itemInteractions.includes("route-map") && itemInteractions.includes("recorder")))) {
      setFeedback("O plano de Sam exige que você escolha confiar nele no Ato 5, confirme a rota de serviço e ouça a gravação completa.");
      return;
    }
    if (finalChoice === "dean" && (dialogueChoice !== "dean" || trustWinchesters !== true || !(allHumanThreads && hasWitness && itemInteractions.includes("manifest") && itemInteractions.includes("recorder")))) {
      setFeedback("O plano de Dean exige que você escolha proteger a testemunha, confirmar o manifesto e ouvir a gravação de campo.");
      return;
    }
    if (finalChoice === "dexter" && (dialogueChoice !== "dexter" || !(allHumanThreads && itemInteractions.includes("route-map") && itemInteractions.includes("manifest")))) {
      setFeedback("O final de Dexter exige que você escolha preservar uma cópia independente e confirme a rota e o manifesto.");
      return;
    }
    setEnding(finalChoice);
  };

  const endingContent = {
    false: { title: "Arquivo encerrado — explicação conveniente", subtitle: "Final incompleto", text: "A polícia prende uma pessoa ligada às fraudes do cais. O caso é encerrado como encobrimento e homicídio encenado. Dexter sabe que os horários não fecham; no relatório, os olhos amarelos viram “reflexo da iluminação”. No último registro, alguém risca o nome de Elias Voss e escreve: próximo." },
    partial: { title: "A verdade pela metade", subtitle: "Final alternativo", text: "Você expõe a manipulação de laudos, câmeras e arquivos, mas deixa a natureza do fenômeno sem resposta. Sam agradece a ajuda; Dean diz que, às vezes, sobreviver já é uma conclusão. Dexter guarda uma cópia do símbolo no envelope pessoal." },
    true: { title: "O Sangue dos Condenados", subtitle: "Final verdadeiro", text: "As evidências humanas provam que alguém preparou a cena e tentou apagar o rastro. O testemunho, o círculo interrompido e a sequência histórica apontam para algo além de um assassino comum. Sam finalmente pronuncia o nome que evitou desde o início: Azazel. Dean confirma que os olhos amarelos estão ligados à tragédia que marcou sua família. Dexter não aceita a explicação sem reservas — mas pela primeira vez, a perícia não oferece uma resposta suficiente." },
    secret: { title: "A quarta testemunha", subtitle: "Final secreto · dossiê completo", text: "Você encontra uma gravação escondida atrás do livro-caixa: a quarta testemunha não é uma pessoa, mas a própria cadeia de falsificações. O símbolo foi coberto antes da chegada da polícia; o relógio foi parado depois; o laudo foi alterado por ordem de alguém que não aparece em nenhum quadro de funcionários. Sam e Dean compartilham o que sabem sobre Azazel — e Dexter entrega a eles a cópia original, mantendo uma duplicata para provar que o inexplicável também deixa vestígios. A investigação termina, mas a parceria entre o Código e a caça está apenas começando." },
    sam: { title: "O pacto de Sam", subtitle: "Final de confiança · rota preservada", text: "Dexter aceita o plano de Sam: preservar a marca, proteger a testemunha e seguir o trajeto de serviço sem transformar a hipótese em certeza. A gravação confirma que alguém chegou ao armazém às 03h11, durante o intervalo apagado. Sam reconhece a sequência como parte de um padrão maior; Dean fica de vigia enquanto Dexter lacra a via original do manifesto. Eles não resolvem tudo naquela noite, mas a investigação continua com as provas intactas e os três trabalhando juntos.", dialogue: [{ speaker: "Dexter", text: "A marca não é só uma pista. É uma escolha: preservar a prova ou apagar o que não entendemos." }, { speaker: "Sam", text: "Se deixarmos o círculo intacto e protegermos a testemunha, talvez descubramos quem preparou tudo." }, { speaker: "Dexter", text: "Eu não preciso acreditar em cada parte da sua teoria para proteger a evidência." }, { speaker: "Sam", text: "Não. Só precisa aceitar que desta vez não está investigando sozinho." }, { speaker: "Dexter", text: "Não se acostume." }] },
    dean: { title: "Ninguém fica para trás", subtitle: "Final de ação · testemunha protegida", text: "Dexter segue o plano de Dean. A testemunha é retirada antes que o armazém seja isolado; o manifesto e a gravação ficam registrados em cópias, e a entrada de manutenção é selada. Sam protesta que a marca deveria permanecer intacta, mas Dean o convence: não existe investigação se ninguém sair vivo para contá-la. O fenômeno continua sem explicação, porém a rede de falsificações é exposta e a próxima vítima não desaparece naquela noite.", dialogue: [{ speaker: "Dexter", text: "Você quer destruir o círculo para que ninguém volte a usá-lo." }, { speaker: "Dean", text: "Primeiro eu tiro todo mundo daqui. Depois decidimos o que fazer com o resto." }, { speaker: "Dexter", text: "Se apagarmos a prova, não saberemos quem armou isso." }, { speaker: "Dean", text: "Se ficarmos para protegê-la, talvez não haja ninguém para contar." }, { speaker: "Dexter", text: "Então retiramos a testemunha, isolamos o local e fotografamos cada centímetro." }, { speaker: "Dean", text: "Agora você está falando a minha língua." }] },
    dexter: { title: "A cópia que ficou", subtitle: "Final de Dexter · prova independente", text: "Dexter não entrega o original a ninguém. Ele confirma a rota, identifica o lote 09 no manifesto e guarda uma cópia forense fora do circuito oficial. Sam entende a decisão, mas percebe que Dexter não confia plenamente nos irmãos nem na polícia. Dean aceita o acordo com uma condição: se outra pessoa sumir, Dexter liga antes de fechar o arquivo. O caso humano fica documentado; a pergunta sobre os olhos amarelos permanece no envelope pessoal de Dexter.", dialogue: [{ speaker: "Dexter", text: "Vou guardar uma cópia independente. Uma prova não pode depender de quem promete protegê-la." }, { speaker: "Dean", text: "Desde que uma cópia saia comigo e com Sam." }, { speaker: "Dexter", text: "Uma cópia. Você decide se a mantém." }, { speaker: "Dean", text: "Você é um sujeito difícil de confiar." }, { speaker: "Dexter", text: "É o propósito do arquivo." }, { speaker: "Dean", text: "Se alguém sumir de novo, você liga antes de fechar o caso." }, { speaker: "Dexter", text: "Se o registro estiver limpo, sim." }] },
  } as const;

  if (ending) {
    const result = endingContent[ending];
    const score = Math.max(0, Math.min(100, Math.round((found.length / EVIDENCE.length) * 60 + (allInterviews ? 15 : interrogated.length * 3) + (connections.length >= 3 ? 10 : connections.length * 2) + Math.min(6, itemInteractions.length * 2) + (hints === 0 ? 10 : Math.max(0, 10 - hints * 3)) - mistakes * 4)));
    const endingAudio = ending === "sam" ? "/audio/winchester/ending-sam.wav" : ending === "dean" ? "/audio/winchester/ending-dean.wav" : ending === "dexter" ? "/audio/winchester/ending-dexter.wav" : null;
    return (
      <main className="min-h-screen bg-[#0c0d10] px-4 py-8 text-zinc-100 sm:px-8">
        <div className="mx-auto max-w-4xl border border-red-900/70 bg-[#141317] p-6 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-red-400">{result.subtitle}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">{result.title}</h1>
          <p className="mt-6 text-base leading-8 text-zinc-300">{result.text}</p>
          {"dialogue" in result && (
            <div className="mt-6 space-y-3 border-l-2 border-red-700 pl-4">
              {result.dialogue.map((line, index) => (
                <p key={`${line.speaker}-${index}`} className="text-sm leading-6 text-zinc-300">
                  <strong className="font-mono text-[10px] uppercase tracking-wider text-red-300">{line.speaker}:</strong> {line.text}
                </p>
              ))}
            </div>
          )}
          {endingAudio && <audio className="mt-6 w-full" controls preload="metadata" src={endingAudio} aria-label={`Ouvir o final de ${ending === "sam" ? "Sam" : ending === "dean" ? "Dean" : "Dexter"}`} />}
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Evidências</p><p className="mt-1 text-2xl">{found.length}/{EVIDENCE.length}</p></div>
            <div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Entrevistas</p><p className="mt-1 text-2xl">{interrogated.length}/6</p></div>
            <div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Itens inspecionados</p><p className="mt-1 text-2xl">{itemInteractions.length}/3</p></div>
            <div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Pontuação estimada</p><p className="mt-1 text-2xl">{score}/100</p></div>
          </div>
          <button onClick={onBack} className="mt-8 min-h-12 border border-red-700 px-5 py-3 font-mono text-xs uppercase tracking-wider text-red-300 hover:bg-red-950/40"><ArrowLeft className="mr-2 inline h-4 w-4" /> Voltar à seleção de capítulos</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c0d10] text-zinc-100">
      <header className="border-b border-red-950/80 bg-[#111115] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-400">Arquivo confidencial · Caso 02</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">O Sangue dos Condenados</h1></div>
          <button onClick={onBack} className="min-h-10 border border-white/20 px-3 py-2 font-mono text-xs text-zinc-300 hover:border-red-500"><ArrowLeft className="mr-2 inline h-4 w-4" /> Menu de casos</button>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 pt-4 sm:px-8" aria-label="Controles de áudio">
        <button type="button" onClick={onToggleSound} aria-pressed={soundOn} className="min-h-10 border border-red-900/70 px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-red-500">
          Trilha: {soundOn ? "ligada" : "desligada"}
        </button>
        <label className="flex min-h-10 items-center gap-2 border border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
          Música {Math.round(musicVolume * 100)}%
          <input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(event) => onMusicVolumeChange(Number(event.target.value))} aria-label="Volume da música tema" className="w-24 accent-red-500" />
        </label>
        <button type="button" onClick={() => { if (ambientOn) { stopAmbient(); setAmbientOn(false); } else { setAmbientOn(true); startAmbient(); } }} aria-pressed={ambientOn} className="min-h-10 border border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-red-500">
          Ambiente: {ambientOn ? "ligado" : "desligado"}
        </button>
        <label className="flex min-h-10 items-center gap-2 border border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
          Ambiente {Math.round(ambientVolume * 100)}%
          <input type="range" min="0" max="1" step="0.01" value={ambientVolume} onChange={(event) => setAmbientVolume(Number(event.target.value))} aria-label="Volume do som ambiente" className="w-24 accent-red-500" />
        </label>
      </div>
      <CaseHeroImage
        src={oTrioAsset.url}
        alt="Dexter Morgan com Sam e Dean Winchester em frente ao Impala"
        caption="Arquivo de cena · Dexter Morgan, Sam e Dean Winchester"
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] sm:px-8">
        <section className="min-w-0">
          <div className="border border-red-950 bg-gradient-to-br from-[#211317] via-[#151316] to-[#101116] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300">{ACTS[act].subtitle}</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{ACTS[act].title}</h2></div><span className="border border-red-900/80 px-3 py-2 font-mono text-[10px] text-red-300">ATO {act + 1}/6</span></div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">{ACTS[act].desc}</p>
            <div className="mt-5 h-1.5 bg-white/10"><div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 font-mono text-[10px] text-zinc-500">{found.length} de {EVIDENCE.length} evidências catalogadas · {progress}% do dossiê</p>
          </div>

          <section className="mt-5 border border-white/10 bg-[#131419] p-4 sm:p-6">
            <div className="flex items-center gap-2"><Search className="h-4 w-4 text-red-400" /><h3 className="font-display text-2xl">Locais e evidências</h3></div>
            <p className="mt-2 text-sm text-zinc-400">Examine os itens liberados até este ato. Uma evidência isolada é apenas uma hipótese.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {actEvidence.map((item) => <button key={item.id} onClick={() => examine(item.id)} className={`min-h-28 border p-4 text-left transition hover:border-red-500 ${found.includes(item.id) ? "border-emerald-900/70 bg-emerald-950/20" : "border-white/10 bg-black/20"}`}><div className="flex items-start justify-between gap-2"><span className="font-mono text-[10px] uppercase tracking-wider text-red-300">{item.category}</span>{found.includes(item.id) ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <FileSearch className="h-4 w-4 text-zinc-500" />}</div><h4 className="mt-2 font-display text-xl">{item.title}</h4><p className="mt-1 text-xs text-zinc-500">{item.source}</p></button>)}
            </div>
            {act === 2 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{[{id:"sam",name:"Sam Winchester",role:"Pesquisador · registros históricos",prompt:"Converse sobre os casos, a família e o padrão."},{id:"dean",name:"Dean Winchester",role:"Agente federal · campo",prompt:"Converse sobre as docas, Mateo e a parceria com Sam."}].map((person) => <button key={person.id} onClick={() => interview(person.id)} className="border border-white/10 p-4 text-left hover:border-red-500"><p className="font-display text-xl">{person.name}</p><p className="mt-1 text-xs text-zinc-500">{person.role}</p><p className="mt-2 text-sm text-zinc-400">{person.prompt}</p><span className="mt-3 block font-mono text-[10px] uppercase text-red-300">{interrogated.includes(person.id) ? "Continuar conversa" : "Iniciar conversa"}</span></button>)}</div>}
            {act === 3 && found.includes("family") && <button type="button" onClick={() => interview("family-photo")} className="mt-4 w-full border border-amber-900/60 bg-amber-950/10 p-4 text-left transition hover:border-amber-500"><span className="font-mono text-[10px] uppercase tracking-wider text-amber-300">Nova conversa · pista pessoal</span><h4 className="mt-1 font-display text-xl">Confrontar Sam e Dean com a fotografia</h4><p className="mt-1 text-sm text-zinc-400">As iniciais no verso mudam o tom da investigação. Ouça os dois lados e escolha o que perguntar.</p></button>}
            {act === 4 && <section className="mt-4 border border-blue-900/60 bg-blue-950/10 p-4"><p className="font-mono text-[10px] uppercase tracking-wider text-blue-300">Conversa decisiva · como responder aos irmãos?</p><p className="mt-2 text-sm text-zinc-300">Sam: “Preserve a marca até entendermos o padrão.” Dean: “Tiramos a testemunha daqui primeiro.” Dexter precisa escolher qual promessa fará antes de entrar no subsolo.</p><div className="mt-3 grid gap-2"><button type="button" onClick={() => { setDialogueChoice("sam"); setTrustWinchesters(true); setFeedback("Você promete a Sam preservar a marca e investigar a rota sem tratar a hipótese como certeza."); }} className={`border p-3 text-left text-sm ${dialogueChoice === "sam" ? "border-amber-400 bg-amber-950/30" : "border-white/15 hover:border-amber-500"}`}><strong className="text-amber-200">Seguir Sam</strong><span className="mt-1 block text-xs text-zinc-400">Manter o círculo intacto e cruzar o padrão histórico.</span></button><button type="button" onClick={() => { setDialogueChoice("dean"); setTrustWinchesters(true); setFeedback("Você aceita o plano de Dean: proteger a testemunha, isolar a entrada e preservar cópias das provas."); }} className={`border p-3 text-left text-sm ${dialogueChoice === "dean" ? "border-blue-400 bg-blue-950/30" : "border-white/15 hover:border-blue-500"}`}><strong className="text-blue-200">Seguir Dean</strong><span className="mt-1 block text-xs text-zinc-400">Retirar a testemunha primeiro e selar o armazém.</span></button><button type="button" onClick={() => { setDialogueChoice("dexter"); setTrustWinchesters(false); setFeedback("Você decide guardar uma cópia independente. Sam e Dean recebem apenas o necessário para agir."); }} className={`border p-3 text-left text-sm ${dialogueChoice === "dexter" ? "border-red-400 bg-red-950/30" : "border-white/15 hover:border-red-500"}`}><strong className="text-red-200">Seguir o Código de Dexter</strong><span className="mt-1 block text-xs text-zinc-400">Preservar uma cópia fora do circuito e manter a decisão final consigo.</span></button></div>{dialogueChoice && <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-emerald-300">Rota narrativa selecionada: {dialogueChoice === "sam" ? "plano de Sam" : dialogueChoice === "dean" ? "plano de Dean" : "prova independente de Dexter"}</p>}</section>}
            {act === 5 && <div className="mt-5 border border-red-900/60 bg-red-950/10 p-4"><p className="font-mono text-xs uppercase tracking-wider text-red-300">Relatório final</p><p className="mt-2 text-sm text-zinc-300">Escolha uma conclusão. A hipótese sobrenatural só se confirma se a cadeia de provas for consistente.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button onClick={() => conclude("false")} className="border border-white/15 p-4 text-left hover:border-white/50"><span className="font-mono text-[10px] text-zinc-500">FINAL A</span><h4 className="mt-1 font-display text-xl">Explicação humana</h4><p className="mt-1 text-xs text-zinc-400">Encerrar com o que a polícia consegue provar.</p></button><button onClick={() => conclude("partial")} className="border border-white/15 p-4 text-left hover:border-amber-500"><span className="font-mono text-[10px] text-amber-300">FINAL B</span><h4 className="mt-1 font-display text-xl">Verdade pela metade</h4><p className="mt-1 text-xs text-zinc-400">Expor o encobrimento, sem concluir o inexplicável.</p></button><button onClick={() => conclude("true")} className="border border-red-700/70 p-4 text-left hover:bg-red-950/30"><span className="font-mono text-[10px] text-red-300">FINAL C</span><h4 className="mt-1 font-display text-xl">Seguir a pista sobrenatural</h4><p className="mt-1 text-xs text-zinc-400">Exige prova forense, linha histórica e testemunho.</p></button><button onClick={() => conclude("secret")} className="border border-amber-700/60 p-4 text-left hover:bg-amber-950/20"><span className="font-mono text-[10px] text-amber-300"><LockKeyhole className="mr-1 inline h-3 w-3" /> FINAL SECRETO</span><h4 className="mt-1 font-display text-xl">A quarta testemunha</h4><p className="mt-1 text-xs text-zinc-400">Todas as evidências, os seis depoimentos, três conexões corretas, confiança e nenhum erro.</p></button></div></div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-xs text-zinc-500">Evidências neste ato: {actFound}/{actEvidence.length}</p>{act < 5 && <button onClick={advance} className="min-h-11 border border-red-700 bg-red-950/30 px-5 py-3 font-mono text-xs uppercase tracking-wider text-red-200 hover:bg-red-900/40">Avançar investigação →</button>}</div>
          </section>

          {activeEvidence && <section className="mt-5 border border-red-900/60 bg-[#171418] p-5" aria-live="polite"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300">Registro de evidência</p><h3 className="mt-2 font-display text-2xl">{EVIDENCE.find((e) => e.id === activeEvidence)?.title}</h3></div><button onClick={() => setActiveEvidence(null)} className="text-xs text-zinc-500 hover:text-white">Fechar</button></div><p className="mt-3 text-sm leading-7 text-zinc-300">{EVIDENCE.find((e) => e.id === activeEvidence)?.detail}</p><p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Fonte: {EVIDENCE.find((e) => e.id === activeEvidence)?.source}</p></section>}

          <section className="mt-5 border border-white/10 bg-[#131419] p-4 sm:p-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-red-400" /><h3 className="font-display text-2xl">Interrogatórios</h3></div><p className="mt-2 text-sm text-zinc-400">Depoimentos liberados podem contradizer a versão oficial. Registre todos para abrir o final secreto.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{SUSPECTS.map((person) => <article key={person.id} className="border border-white/10 p-4"><div className="flex items-start justify-between gap-2"><div><h4 className="font-display text-xl">{person.name}</h4><p className="mt-1 text-xs text-zinc-500">{person.role}</p></div><ShieldAlert className="h-4 w-4 text-red-400" /></div><p className="mt-3 text-sm text-zinc-400">{person.clue}</p><button onClick={() => interview(person.id)} disabled={interrogated.includes(person.id)} className="mt-4 min-h-10 border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-red-500 disabled:opacity-40">{interrogated.includes(person.id) ? "Depoimento registrado" : person.question}</button></article>)}</div></section>

          <section className="mt-5 border border-white/10 bg-[#131419] p-4 sm:p-6"><div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-red-400" /><h3 className="font-display text-2xl">Quadro de conexões</h3></div><p className="mt-2 text-sm text-zinc-400">Selecione uma pessoa e uma evidência para cruzar. A conclusão sobrenatural exige mais de uma linha independente.</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Pessoas</p><div className="flex flex-wrap gap-2">{[{id:"sam",name:"Sam Winchester"},{id:"dean",name:"Dean Winchester"},{id:"vale",name:"Mara Vale"},{id:"witness",name:"Lena Ortiz"}].map((p)=><button key={p.id} onClick={()=>setSelectedPerson(p.id)} className={`border px-3 py-2 text-xs ${selectedPerson===p.id?"border-red-500 bg-red-950/40":"border-white/15"}`}>{p.name}</button>)}</div></div><div><p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Evidências catalogadas</p><div className="flex flex-wrap gap-2">{availableEvidence.filter((e)=>found.includes(e.id)).map((e)=><button key={e.id} onClick={()=>setSelectedEvidence(e.id)} className={`border px-3 py-2 text-xs ${selectedEvidence===e.id?"border-red-500 bg-red-950/40":"border-white/15"}`}>{e.title}</button>)}</div></div></div><button onClick={connect} disabled={!selectedPerson||!selectedEvidence} className="mt-4 min-h-10 border border-red-700 px-4 py-2 font-mono text-xs text-red-200 disabled:opacity-40">Registrar conexão</button>{connections.length>0&&<div className="mt-4 flex flex-wrap gap-2">{connections.map((c)=><span key={c} className="border border-emerald-900/70 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-200">{c.replace("-", " ↔ ")}</span>)}</div>}</section>
        </section>

        <aside className="space-y-4">
          <section className="border border-red-950 bg-[#131419] p-4"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Caderno de Dexter</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400">“A explicação mais simples é útil. Até que os fatos parem de caber nela.”</p><div className="mt-4 space-y-2">{ACTS.map((item,i)=><button key={item.title} onClick={()=>{if(i<=act){setAct(i as Act);setActiveEvidence(null);}}} disabled={i>act} className={`flex w-full items-center gap-3 border p-3 text-left ${i===act?"border-red-600 bg-red-950/20":"border-white/10"} disabled:opacity-30`}><span className="font-mono text-xs text-red-300">0{i+1}</span><span className="flex-1 text-sm">{item.title}</span>{i<act&&<CheckCircle2 className="h-4 w-4 text-emerald-400" />}</button>)}</div></section>
          <section className="border border-white/10 bg-[#131419] p-4"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Estado do dossiê</h2></div><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Evidências</span><span>{found.length}/{EVIDENCE.length}</span></div><div className="flex justify-between"><span className="text-zinc-500">Entrevistas</span><span>{interrogated.length}/6</span></div><div className="flex justify-between"><span className="text-zinc-500">Conexões</span><span>{connections.length}</span></div><div className="flex justify-between"><span className="text-zinc-500">Erros</span><span className={mistakes?"text-red-300":"text-emerald-300"}>{mistakes}</span></div><div className="flex justify-between"><span className="text-zinc-500">Dicas</span><span>{hints}</span></div></div><button onClick={()=>{setHints((n)=>n+1);setFeedback(act===0?"Compare o formato das gotas com a posição do relógio: a cena foi montada depois do fato.":act===1?"Os horários oficiais foram editados. Compare o laudo original, a câmera e o número do crachá.":act===2?"Sam busca um padrão entre cidades; Dean estava nas docas por um motivo que ainda não contou.":act===3?"A fotografia liga as iniciais S. W. a uma data anterior aos desaparecimentos.":act===4?"O livro-caixa prova encobrimento humano; o símbolo talvez explique o motivo de esconder o local.":"Não conclua pelo relato isolado: cruze testemunho, marca no concreto e linha histórica.");}} className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 border border-amber-900/60 px-3 py-2 font-mono text-xs text-amber-200 hover:bg-amber-950/20"><Sparkles className="h-4 w-4" /> Pedir dica (reduz pontuação)</button></section>
          <section className="border border-white/10 bg-[#131419] p-4"><div className="flex items-center gap-2"><Skull className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Pensamentos</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400" aria-live="polite">{feedback}</p><p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-zinc-600">O nome de Azazel não aparece nos arquivos iniciais. A ligação com os Winchester só ganha força quando a cadeia de evidências estiver quase completa.</p></section>
          <section className="border border-white/10 bg-[#131419] p-4"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Arquivo secreto</h2></div><p className="mt-2 text-sm text-zinc-400">{secretReady?"Condições reunidas. A quarta testemunha está disponível no relatório final.":"Requer 17 evidências, os 3 itens interativos, os 6 depoimentos, conexões familiares e financeiras, o plano de Sam ou Dean e zero erros."}</p></section>
        </aside>
      </div>
      {activeInterview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="interview-title">
          <button type="button" aria-label="Fechar depoimento" className="absolute inset-0 cursor-default" onClick={() => setActiveInterview(null)} />
          <article className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-red-900/70 bg-[#101115] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300">Conversa de investigação · escolha os assuntos</p>
                <h2 id="interview-title" className="mt-2 font-display text-3xl sm:text-4xl">{activeInterview.name}</h2>
                <p className="mt-2 text-sm text-zinc-400">{activeInterview.role}</p>
                {currentDialogueAudio && <audio className="mt-4 w-full" controls preload="metadata" src={currentDialogueAudio} aria-label={`Ouvir diálogo de ${activeInterview.name}`} />}
              </div>
              <button type="button" onClick={() => setActiveInterview(null)} className="shrink-0 border border-white/15 px-3 py-2 font-mono text-xs text-zinc-300 hover:border-red-500">Pausar conversa ✕</button>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              <div className="space-y-3" aria-live="polite">
                {dialogueLines.map((line, index) => (
                  <div key={`${activeInterview.id}-${index}`} className={`max-w-[95%] border p-4 ${line.speaker === "Dexter" ? "ml-auto border-red-800/70 bg-red-950/20" : line.speaker === "Sam Winchester" || line.speaker === "Sam" ? "border-amber-900/60 bg-amber-950/10" : "border-blue-900/50 bg-blue-950/10"}`}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-300">{line.speaker}</p>
                    <p className="mt-2 text-sm leading-7 text-zinc-200">{line.text}</p>
                  </div>
                ))}
                <div ref={dialogueEndRef} />
              </div>
              {availableFollowUps.length > 0 ? (
                <div className="border-t border-white/10 pt-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">O que Dexter pergunta agora?</p>
                  <div className="grid gap-2">
                    {availableFollowUps.map((option) => (
                      <button key={option.id} type="button" onClick={() => chooseDialogueOption(option)} className="min-h-11 border border-white/15 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-red-500 hover:bg-red-950/20">{option.label}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="border-t border-white/10 pt-5 text-sm leading-6 text-zinc-400">Todos os assuntos desta conversa foram explorados. Você pode pausá-la e voltar à investigação.</p>
              )}
              <div className="flex justify-end border-t border-white/10 pt-5">
                <button type="button" onClick={() => setActiveInterview(null)} className="min-h-11 border border-red-700 bg-red-950/30 px-5 py-3 font-mono text-xs uppercase tracking-wider text-red-100 hover:bg-red-900/40">Voltar à investigação</button>
              </div>
            </div>
          </article>
        </div>
      )}
      {openedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="evidence-detail-title">
          <button type="button" aria-label="Fechar detalhes da evidência" className="absolute inset-0 cursor-default" onClick={() => setActiveEvidence(null)} />
          <article className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-red-900/70 bg-[#101115] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300">Dossiê · Ato {openedEvidence.act + 1}</p>
                <h2 id="evidence-detail-title" className="mt-2 font-display text-3xl sm:text-4xl">{openedEvidence.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{openedEvidence.source}</p>
              </div>
              <button type="button" onClick={() => setActiveEvidence(null)} className="shrink-0 border border-white/15 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-red-500 hover:text-white">Fechar ✕</button>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-red-900/70 bg-red-950/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-red-200">{openedEvidence.category}</span>
                <span className={"border px-3 py-1 font-mono text-[10px] uppercase tracking-wider " + (found.includes(openedEvidence.id) ? "border-emerald-900/70 text-emerald-300" : "border-white/15 text-zinc-400")}>{found.includes(openedEvidence.id) ? "Catalogada" : "Ainda não catalogada"}</span>
              </div>
              <div className="border-l-2 border-red-700 bg-white/[0.03] p-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Conteúdo da evidência</p>
                <p className="whitespace-pre-line text-base leading-8 text-zinc-200">{openedEvidence.detail}</p>
              </div>
              <p className="text-sm leading-6 text-zinc-400">Leia o conteúdo com atenção e compare com os outros documentos antes de tirar uma conclusão.</p>
              {openedEvidence.interaction === "route" && (
                <section className="border border-amber-900/60 bg-amber-950/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300">Item interativo · sobrepor os horários</p>
                  <p className="mt-2 text-sm text-zinc-300">Qual rota coincide com o intervalo da câmera às 03h11?</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {[{ id: "main-road", label: "Avenida principal" }, { id: "service-road", label: "Estrada de serviço" }, { id: "canal", label: "Margem do canal" }].map((route) => (
                      <button key={route.id} type="button" onClick={() => setRouteAnswer(route.id)} className={`min-h-10 border px-3 py-2 text-xs ${routeAnswer === route.id ? "border-amber-400 bg-amber-950/40" : "border-white/15 hover:border-amber-500"}`}>{route.label}</button>
                    ))}
                  </div>
                  <button type="button" disabled={!routeAnswer || itemInteractions.includes("route-map")} onClick={() => routeAnswer && solveInteractiveEvidence("route-map", routeAnswer)} className="mt-3 min-h-10 border border-amber-700 px-4 py-2 font-mono text-[10px] uppercase text-amber-200 disabled:opacity-40">{itemInteractions.includes("route-map") ? "Rota verificada" : "Comparar com a câmera"}</button>
                  {itemInteractions.includes("route-map") && <p className="mt-2 text-sm text-emerald-300">A estrada de serviço coincide com o apagão e revela a entrada de manutenção.</p>}
                </section>
              )}
              {openedEvidence.interaction === "manifest" && (
                <section className="border border-amber-900/60 bg-amber-950/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300">Item interativo · recuperar via carbono</p>
                  <p className="mt-2 text-sm text-zinc-300">Qual lote aparece sob a mancha de tinta?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["lot-09", "lot-17", "lot-31"].map((lot) => <button key={lot} type="button" onClick={() => setManifestAnswer(lot)} className={`min-h-10 border px-4 py-2 font-mono text-xs ${manifestAnswer === lot ? "border-amber-400 bg-amber-950/40" : "border-white/15 hover:border-amber-500"}`}>Lote {lot.slice(-2)}</button>)}
                  </div>
                  <button type="button" disabled={!manifestAnswer || itemInteractions.includes("manifest")} onClick={() => manifestAnswer && solveInteractiveEvidence("manifest", manifestAnswer)} className="mt-3 min-h-10 border border-amber-700 px-4 py-2 font-mono text-[10px] uppercase text-amber-200 disabled:opacity-40">{itemInteractions.includes("manifest") ? "Lote confirmado" : "Revelar número"}</button>
                  {itemInteractions.includes("manifest") && <p className="mt-2 text-sm text-emerald-300">Lote 09. O peso coincide com o inventário apagado do Armazém 9.</p>}
                </section>
              )}
              {openedEvidence.interaction === "recorder" && (
                <section className="border border-blue-900/60 bg-blue-950/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-blue-300">Item interativo · ouvir gravação de campo</p>
                  <p className="mt-2 text-sm text-zinc-300">Ouça o trecho inteiro para registrar o horário e a advertência final.</p>
                  <audio className="mt-3 w-full" controls preload="metadata" src={openedEvidence.audio} onEnded={markRecorderHeard} aria-label="Gravação de campo de Sam Winchester" />
                  <p className="mt-2 text-xs text-zinc-400">{itemInteractions.includes("recorder") ? "Trecho ouvido e catalogado." : "A interação é concluída ao fim do áudio."}</p>
                </section>
              )}
              <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
                <button type="button" onClick={() => setActiveEvidence(null)} className="min-h-11 border border-white/15 px-5 py-3 font-mono text-xs uppercase tracking-wider text-zinc-300 hover:border-white/40">Voltar aos locais</button>
                <button type="button" onClick={() => { catalogEvidence(openedEvidence.id); setActiveEvidence(null); }} className="min-h-11 border border-red-700 bg-red-950/30 px-5 py-3 font-mono text-xs uppercase tracking-wider text-red-100 hover:bg-red-900/40">{found.includes(openedEvidence.id) ? "Concluir leitura" : "Catalogar evidência"}</button>
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
