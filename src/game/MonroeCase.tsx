import { useEffect, useRef, useState } from "react";
import { caesar } from "./data";

type Objective = 1 | 2 | 3 | 4;
type Evidence = {
  id: string;
  title: string;
  body: string;
  audio?: string;
  image?: string;
};

const FULL_TRANSCRIPTS = {
  monica: `Detetive Johnson: Bom dia, Sra. Monroe. Poderia descrever como encontrou o corpo?
Monica Monroe: Eu estava fora da cidade em uma viagem de negócios entre os dias 18 e 21 de maio. Quando retornei no dia 21, encontrei a porta do escritório aberta e Jonathan caído no chão. Liguei imediatamente para a polícia.
Detetive Johnson: Como descreveria seu casamento?
Monica Monroe: Tínhamos problemas financeiros e dificuldade para passar tempo juntos, mas tentávamos conversar e resolver as coisas. Eu não consigo acreditar que ele se foi.
Detetive Johnson: Jonathan tinha algum plano naquela noite?
Monica Monroe: Disse que trabalharia até tarde no escritório, como era costume. Normalmente só chegava em casa depois das 22h.
Detetive Johnson: Ele tinha inimigos?
Monica Monroe: Mencionava rivalidades profissionais, mas não consigo pensar em ninguém específico que desejasse machucá-lo.
Detetive Johnson: O que havia no cofre e qual era a combinação?
Monica Monroe: Guardávamos nossas economias. A combinação era a data do nosso aniversário de casamento: 0405.
Detetive Johnson: O que sabe sobre Daniel Thompson?
Monica Monroe: Eles eram amigos antigos da faculdade. Competiam profissionalmente, mas já os vi bebendo e rindo juntos.
Detetive Johnson: Você sabia de algum caso extraconjugal?
Monica Monroe: Não. Tenho certeza de que Jonathan não se relacionava com outras mulheres.
Detetive Johnson: Onde estava na noite do assassinato?
Monica Monroe: Em uma viagem de negócios, hospedada no Luxe Hotel, em São Francisco. Sou coordenadora de eventos.
Detetive Johnson: Funcionários falaram de um cliente secreto que visitava a casa. Sabe quem era?
Monica Monroe: Jonathan não falava de negócios em casa. Alguns clientes foram à nossa casa, mas não lembro nomes ou rostos.
Detetive Johnson: Alguém tinha motivo forte para prejudicá-lo?
Monica Monroe: Não consigo imaginar ninguém. Ele tinha uma carreira exigente, mas era um bom homem.`,
  richard: `Detetive Johnson: Quando foi a última vez que viu Jonathan?
Richard Stevens: Na semana passada, no escritório, durante uma conversa sobre um caso.
Detetive Johnson: Qual era a relação entre vocês?
Richard Stevens: Somos primos e sou sócio minoritário. Tivemos divergências sobre estratégias, mas trabalhávamos próximos e nos dávamos bem.
Detetive Johnson: Quem tinha rancor de Jonathan?
Richard Stevens: Emily Parker, a ex-secretária demitida recentemente, e Daniel Thompson, o advogado concorrente. Vi Daniel discutir com Jonathan em frente ao tribunal.
Detetive Johnson: Também soubemos de conflitos entre você e Jonathan.
Richard Stevens: Isso não é verdade. Estávamos em excelentes termos. Parece fofoca sem fundamento.
Detetive Johnson: Onde estava na noite do assassinato?
Richard Stevens: Em casa com minha namorada, Amara Verns. Jantamos e assistimos a um filme. Ela pode confirmar.
Detetive Johnson: Obrigado. Talvez precisemos conversar novamente.
Richard Stevens: Estarei à disposição.`,
  daniel: `Detetive Johnson: Quando foi a última vez que viu Jonathan?
Daniel Thompson: Nós nos conhecíamos da faculdade e nos enfrentávamos no tribunal.
Detetive Johnson: Vocês eram amigos?
Daniel Thompson: Éramos rivais profissionais, membros do mesmo clube de criptografia. Trocávamos mensagens usando subtração de letras ou Cifra de César.
Detetive Johnson: E a discussão em frente ao tribunal?
Daniel Thompson: Foi apenas verbal. Tínhamos interpretações diferentes sobre a lei, nada físico.
Detetive Johnson: Existiam conflitos pessoais?
Daniel Thompson: Era um choque de egos, mas depois bebíamos juntos. Nossas disputas permaneciam profissionais.
Detetive Johnson: Quem poderia querer prejudicá-lo?
Daniel Thompson: Jonathan criava inimigos. Sei que ele discutia com um sócio júnior; pergunte ao Richard.
Detetive Johnson: Qual é seu álibi?
Daniel Thompson: Eu estava em uma conferência jurídica em São Francisco, hospedado no Hotel Carvelle. Fui de carro; levei pouco mais de quatro horas.
Detetive Johnson: Você possui arma de fogo?
Daniel Thompson: Absolutamente não. Sou advogado, não assassino de aluguel.`,
  emily: `Detetive Johnson: Quando viu Jonathan pela última vez?
Emily Parker: Em 18 de maio, quando ele me demitiu. Eu era a secretária dele.
Detetive Johnson: Por que foi demitida?
Emily Parker: Ele me acusou injustamente de lidar mal com documentos confidenciais. Trabalhei anos para ele e fui dispensada sem explicação. Liguei todos os dias tentando recuperar meu emprego, mas ele não retornou.
Detetive Johnson: Presenciou conflitos entre Jonathan e outras pessoas?
Emily Parker: Jonathan e Monica brigavam constantemente. Eu ouvia os gritos através da porta: Monica falava do casamento e ele respondia sobre o acordo pré-nupcial.
Detetive Johnson: Jonathan tinha inimigos?
Emily Parker: Pessoas contra quem ele advogou poderiam estar irritadas. Pelo casamento em crise, eu não me surpreenderia se Monica estivesse envolvida.
Detetive Johnson: Onde estava na noite do crime?
Emily Parker: No meu apartamento, exceto por uma saída de cerca de uma hora para fazer compras no Telways.
Detetive Johnson: Qual a distância até a casa dos Monroe?
Emily Parker: Cerca de 35 minutos. Já fui lá várias vezes quando Jonathan esquecia documentos.
Detetive Johnson: Alguém a acompanhava?
Emily Parker: Não. Fiz compras sozinha, mas conversei com a caixa.`,
  jacob: `Detetive Johnson: Quando viu Jonathan pela última vez?
Jacob Kline: No dia 16 de maio, na casa dele. Eu queria contratá-lo para um assunto delicado, mas desisti. Era um processo por lesão corporal que acabou arquivado.
Detetive Johnson: Falou com ele depois disso?
Jacob Kline: Não. Não havia necessidade de continuar falando.
Detetive Johnson: Conhece Monica?
Jacob Kline: Apenas de encontros breves quando visitei Jonathan. Ela parecia simpática.
Detetive Johnson: Onde estava na noite de 20 de maio?
Jacob Kline: Em casa. Normalmente já estou dormindo às oito da noite.
Detetive Johnson: Alguém confirma?
Jacob Kline: Não. Moro sozinho.
Detetive Johnson: O que acha que aconteceu?
Jacob Kline: Espero que encontrem o responsável. Provavelmente foi alguém que precisava de dinheiro. É perigoso manter dinheiro vivo no cofre de casa.`,
};

const TESTIMONIES: Evidence[] = [
  {
    id: "monica",
    title: "Depoimento — Monica Monroe",
    audio: "/audio/monroe/monica-monroe-full.wav",
    body: FULL_TRANSCRIPTS.monica,
  },
  {
    id: "richard",
    title: "Depoimento — Richard Stevens",
    audio: "/audio/monroe/richard-stevens-full.wav",
    body: FULL_TRANSCRIPTS.richard,
  },
  {
    id: "daniel",
    title: "Depoimento — Daniel J. Thompson",
    audio: "/audio/monroe/daniel-thompson-full.wav",
    body: FULL_TRANSCRIPTS.daniel,
  },
  {
    id: "emily",
    title: "Depoimento — Emily Parker",
    audio: "/audio/monroe/emily-parker-full.wav",
    body: FULL_TRANSCRIPTS.emily,
  },
  {
    id: "jacob",
    title: "Depoimento — Jacob Kline",
    audio: "/audio/monroe/jacob-kline-full.wav",
    body: FULL_TRANSCRIPTS.jacob,
  },
];

const DOCUMENTS: Evidence[] = [
  {
    id: "email-client",
    title: "E-mail de Jonathan para Daniel",
    image: "/images/monroe/page-17.jpg",
    body: "Um novo cliente potencial, que vende lâmpadas de 200 watts, quer manter a identidade em segredo. Ele aparece com frequência na casa de Jonathan. O advogado pede que Daniel tenha o nome do cliente caso algo aconteça. Abaixo, há a mensagem cifrada: MHJWATCAOB EKDSLMIHNOES.",
  },
  {
    id: "diary-early",
    title: "Página recuperada do diário de Emily",
    image: "/images/monroe/page-17.jpg",
    body: "Emily relata dívidas, um carro de quinze anos quebrado e a esperança de começar a ganhar dinheiro real em breve. Ela escreve que está aberta a novas oportunidades.",
  },
  {
    id: "hotel-carvelle",
    title: "Fatura do Hotel Carvelle",
    image: "/images/monroe/page-19.jpg",
    body: "Hóspede: Daniel J. Thompson. Entrada em 18/05/2023, saída em 21/05/2023. Há cobrança de quarto para 20/05.",
  },
  {
    id: "hotel-luxe",
    title: "Fatura do Luxe Hotel",
    image: "/images/monroe/page-19.jpg",
    body: "Hóspede: Monica Monroe. Entrada em 18/05/2023, saída em 21/05/2023. Suite Deluxe registrada em 20/05.",
  },
  {
    id: "receipt",
    title: "Recibo do supermercado Telways",
    image: "/images/monroe/page-20.jpg",
    body: "20/05/2023 às 20:20. Compras pagas em dinheiro por Emily Parker. O mercado fica a aproximadamente 35 minutos da casa dos Monroe.",
  },
  {
    id: "newspaper",
    title: "Jornal local — gala em Nova York",
    image: "/images/monroe/page-23.jpg",
    body: "A edição de 22 de maio mostra Amara Verns em uma gala beneficente em Nova York no dia 20 de maio, ao lado de outras convidadas.",
  },
  {
    id: "sms-richard",
    title: "SMS apagado de Richard",
    image: "/images/monroe/page-27.jpg",
    body: "Eu sei exatamente o que você fez. Se quiser que eu fique calado, vai te custar 50 mil. Me encontre hoje à noite às 20h, você sabe onde!",
  },
  {
    id: "draft",
    title: "Rascunho não enviado para Daniel",
    image: "/images/monroe/page-28.jpg",
    body: "Jonathan escreve que está sentindo um clima estranho e pede que Daniel guarde algo que ele mostrou no escritório. O restante foi substituído por símbolos.",
  },
  {
    id: "jacob-sms",
    title: "SMS encontrado no celular de Jacob",
    image: "/images/monroe/page-30.jpg",
    body: "Eu odeio estar tão longe de você. Tudo vai melhorar em breve. Só precisamos passar por essa última noite. Até logo, meu leão! Enviado às 19:30 de 20 de maio.",
  },
  {
    id: "military",
    title: "Registro militar de Jacob Kline",
    image: "/images/monroe/page-30.jpg",
    body: "Sargento do Exército, médico de combate, baixa em 17/08/2022. Marca identificadora: grande tatuagem de um leão no peito.",
  },
  {
    id: "diary-final",
    title: "Última página do diário de Emily",
    image: "/images/monroe/page-30.jpg",
    body: "Emily escreve que esteve lá desde o começo, conhece o lugar por dentro e por fora, e sente tanto ódio de Jonathan que poderia matá-lo. A página termina rasgada.",
  },
];

const HINTS: Record<Objective, string> = {
  1: "Comece pelo e-mail. A frase sobre lâmpadas de 200 watts é uma descrição, não uma profissão comum. Cruze-a com quem admitiu ter procurado Jonathan para um assunto delicado.",
  2: "Não aceite um álibi só porque alguém disse que outra pessoa pode confirmar. Compare a fatura do hotel, o recibo do mercado e a notícia sobre Amara.",
  3: "A mensagem apagada de Richard fala em silêncio e cinquenta mil. O rascunho de Jonathan e o SMS revelam que o encontro tinha relação com dinheiro.",
  4: "Separe papéis: motivo, oportunidade e conexão. A solução precisa explicar o dinheiro, a raiva de Emily e por que Richard escondia algo.",
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.94;
  window.speechSynthesis.speak(utterance);
}

export function MonroeCase({ onBack }: { onBack: () => void }) {
  const [objective, setObjective] = useState<Objective>(1);
  const [opened, setOpened] = useState<Evidence | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintConfirmed, setHintConfirmed] = useState(false);
  const [key, setKey] = useState("");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Objective[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0.65;
    const saved = Number(window.localStorage.getItem("dexter-monroe-ambient-volume"));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.65;
  });
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [documentsOpened, setDocumentsOpened] = useState<string[]>([]);
  const [testimoniesRead, setTestimoniesRead] = useState<string[]>([]);
  const [testimoniesHeard, setTestimoniesHeard] = useState<string[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [boardOpen, setBoardOpen] = useState(false);
  const [notes, setNotes] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem("monroe-investigator-notes") ?? ""),
  );
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [finalVerdict, setFinalVerdict] = useState<
    "emily-richard" | "jacob-daniel" | "monica-alone" | null
  >(null);
  const ambientRef = useRef<{
    context: AudioContext;
    sources: AudioScheduledSourceNode[];
    gains: GainNode[];
  } | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      ambientRef.current?.sources.forEach((source) => source.stop());
      void ambientRef.current?.context.close();
    };
  }, []);

  useEffect(() => {
    if (!soundOn && ambientRef.current) {
      ambientRef.current.sources.forEach((source) => source.stop());
      void ambientRef.current.context.close();
      ambientRef.current = null;
    }
  }, [soundOn]);
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.gains[0].gain.value = 0.045 * volume;
      ambientRef.current.gains[1].gain.value = 0.012 * volume;
    }
  }, [volume]);

  useEffect(() => {
    window.localStorage.setItem("dexter-monroe-ambient-volume", String(volume));
  }, [volume]);

  useEffect(() => {
    window.localStorage.setItem("monroe-investigator-notes", notes);
  }, [notes]);

  const startAmbient = (force = false) => {
    if ((!soundOn && !force) || ambientRef.current || typeof window === "undefined") return;
    const context = new AudioContext();
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.22;
    const rain = context.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;
    const rainFilter = context.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 1800;
    const rainGain = context.createGain();
    rainGain.gain.value = 0.045 * volume;
    rain.connect(rainFilter).connect(rainGain).connect(context.destination);
    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 58;
    const humGain = context.createGain();
    humGain.gain.value = 0.012 * volume;
    hum.connect(humGain).connect(context.destination);
    rain.start();
    hum.start();
    ambientRef.current = { context, sources: [rain, hum], gains: [rainGain, humGain] };
  };

  const playSfx = (
    kind: "paper" | "play" | "success" | "error" | "warning" | "connection" | "table",
  ) => {
    if (!soundOn || typeof window === "undefined") return;
    startAmbient();
    const context = ambientRef.current?.context ?? new AudioContext();
    const tones = {
      paper: [280],
      play: [440, 660],
      success: [392, 523, 659],
      error: [220, 165],
      warning: [180, 220],
      connection: [240, 520, 740],
      table: [196, 294, 392, 587, 784],
    }[kind];
    tones.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.08;
      oscillator.type = kind === "error" ? "sawtooth" : kind === "table" ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(
        (kind === "paper" ? 0.04 : kind === "table" ? 0.1 : 0.07) * volume,
        start + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.16);
    });
  };

  const availableDocs = DOCUMENTS.filter((doc) => {
    if (objective === 1) return ["email-client", "diary-early"].includes(doc.id);
    if (objective === 2)
      return ["hotel-carvelle", "hotel-luxe", "receipt", "newspaper"].includes(doc.id);
    if (objective === 3) return ["sms-richard", "draft", "diary-final"].includes(doc.id);
    return ["jacob-sms", "military", "diary-final", "sms-richard", "receipt"].includes(doc.id);
  });

  const reportPoints = Math.max(
    0,
    Math.min(
      100,
      completed.length * 20 +
        Math.min(20, documentsOpened.length * 2) +
        Math.min(10, testimoniesHeard.length * 2) -
        mistakes * 4 -
        hintsUsed * 3,
    ),
  );
  const reportRank =
    reportPoints >= 90
      ? "Investigador de Elite"
      : reportPoints >= 75
        ? "Detetive Principal"
        : reportPoints >= 55
          ? "Analista de Campo"
          : "Investigação Incompleta";
  const verdictTitle =
    finalVerdict === "emily-richard"
      ? "Solução sustentada pelas provas"
      : finalVerdict === "jacob-daniel"
        ? "Hipótese alternativa: pista falsa"
        : finalVerdict === "monica-alone"
          ? "Hipótese alternativa: sem fechamento"
          : "Conclusão pendente";
  const verdictSummary =
    finalVerdict === "emily-richard"
      ? "Emily Parker matou Jonathan Monroe e Richard Stevens trabalhou com ela. Richard mentiu sobre o álibi porque Amara estava em Nova York; o dinheiro desaparecido e a chantagem ligavam Richard ao crime. Emily tinha acesso à casa, motivo financeiro e raiva documentada no diário."
      : finalVerdict === "jacob-daniel"
        ? "A hipótese não se sustenta: o registro militar e o SMS de Jacob não provam presença na casa, enquanto a fatura de Daniel confirma sua viagem. O relatório marca a conclusão como não corroborada."
        : finalVerdict === "monica-alone"
          ? "A crise financeira e o conhecimento do cofre tornam Monica relevante, mas o hotel confirma sua viagem. O relatório registra que essa hipótese não explica a chantagem de Richard nem a participação de Emily."
          : "Nenhum veredicto final foi registrado.";
  const verdictProofs =
    finalVerdict === "emily-richard"
      ? [
          "O jornal coloca Amara em uma gala em Nova York, desmontando o álibi de Richard.",
          "O SMS apagado mostra Richard chantageando Jonathan por cinquenta mil dólares.",
          "O diário de Emily registra motivo, conhecimento do local e ódio direto contra Jonathan.",
        ]
      : finalVerdict === "jacob-daniel"
        ? [
            "O registro militar confirma a identidade de Jacob, mas não sua presença no crime.",
            "A fatura do Hotel Carvelle dá suporte ao álibi de Daniel.",
            "A hipótese não explica o SMS de chantagem enviado por Richard.",
          ]
        : [
            "A fatura do Luxe Hotel coloca Monica fora da cidade.",
            "O SMS de Richard aponta para chantagem e dinheiro desaparecido.",
            "A demissão e o diário de Emily continuam sem explicação nessa hipótese.",
          ];

  const complete = (next: number, message: string) => {
    playSfx("success");
    setCompleted((prev) => (prev.includes(objective) ? prev : [...prev, objective]));
    setAnswer(message);
    setOpened(null);
    setAudio(null);
    setHintConfirmed(false);
    if (next > 4) {
      setReportOpen(true);
      return;
    }
    window.setTimeout(() => setObjective(next), 900);
  };

  const finishAlternate = (
    verdict: "emily-richard" | "jacob-daniel" | "monica-alone",
    message: string,
  ) => {
    playSfx(verdict === "emily-richard" ? "success" : "error");
    setFinalVerdict(verdict);
    setCompleted((prev) => (prev.includes(4) ? prev : [...prev, 4]));
    setAnswer(message);
    setReportOpen(true);
  };

  const conclusionRequirements: Record<Objective, { documents: string[]; testimonies: string[] }> =
    {
      1: {
        documents: ["email-client", "diary-early"],
        testimonies: ["jacob"],
      },
      2: {
        documents: ["hotel-carvelle", "hotel-luxe", "receipt", "newspaper"],
        testimonies: ["monica", "daniel", "richard"],
      },
      3: {
        documents: ["sms-richard", "draft", "diary-final"],
        testimonies: ["richard", "emily"],
      },
      4: {
        documents: ["jacob-sms", "military", "diary-final", "sms-richard", "receipt"],
        testimonies: ["emily", "richard", "jacob"],
      },
    };

  const checkChoice = (value: string) => {
    const requirement = conclusionRequirements[objective];
    const reviewedEverything =
      requirement.documents.every((id) => documentsOpened.includes(id)) &&
      requirement.testimonies.every((id) => testimoniesRead.includes(id));
    if (!reviewedEverything) {
      playSfx("warning");
      setMistakes((current) => current + 1);
      setAnswer(
        "Conclusão prematura. Um investigador não fecha o caso sem cruzar os documentos e depoimentos relevantes deste objetivo.",
      );
      return;
    }
    if (objective === 1 && value === "jacob")
      return complete(2, "Objetivo 1 resolvido: o cliente secreto era Jacob Kline.");
    if (objective === 2 && value === "richard")
      return complete(3, "Objetivo 2 resolvido: Richard mentiu sobre o álibi.");
    if (objective === 3 && value === "money")
      return complete(
        4,
        "Objetivo 3 resolvido: Richard sabia do dinheiro desaparecido e ia encontrar Jonathan.",
      );
    if (objective === 4 && value === "emily-richard")
      return finishAlternate(
        "emily-richard",
        "Caso Monroe solucionado: Emily matou Jonathan e Richard estava trabalhando com ela.",
      );
    if (objective === 4 && value === "jacob-daniel")
      return finishAlternate(
        "jacob-daniel",
        "Hipótese registrada: você apontou Jacob e Daniel, mas o relatório mostrará as contradições dessa leitura.",
      );
    if (objective === 4 && value === "monica-alone")
      return finishAlternate(
        "monica-alone",
        "Hipótese registrada: você apontou Monica sozinha, mas o relatório mostrará quais provas ficaram sem explicação.",
      );
    playSfx("error");
    setMistakes((value) => value + 1);
    setAnswer(
      "Essa hipótese ainda não fecha todas as pistas. Volte aos documentos e compare fatos independentes.",
    );
  };

  const objectiveTitle: Record<Objective, string> = {
    1: "Quem é o cliente secreto?",
    2: "Quem certamente mentiu sobre o álibi?",
    3: "O que essa pessoa sabe e com quem ia se encontrar?",
    4: "Quem matou Jonathan e roubou o dinheiro?",
  };

  const openZoom = (src: string, title: string) => {
    playSfx("paper");
    setZoomLevel(1);
    setZoomedImage({ src, title });
  };

  return (
    <main className="monroe-case min-h-screen bg-background px-3 py-4 text-foreground sm:px-10 sm:py-8">
      <header className="border-b border-border pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Arquivo Greenfield · 20/05/2023
            </p>
            <h1 className="mt-2 font-display text-4xl">O Caso Monroe</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Um caso em quatro objetivos. Leia, ouça e cruze cada documento antes de avançar.
            </p>
          </div>
          <button
            onClick={onBack}
            className="min-h-11 border border-border px-4 py-2 font-mono text-xs hover:border-primary hover:text-primary"
          >
            Voltar ao Turno da Noite
          </button>
          <button
            onClick={() => setBriefingOpen(true)}
            className="min-h-11 border border-border px-4 py-2 font-mono text-xs hover:border-primary hover:text-primary"
          >
            Briefing do caso
          </button>
          <button
            onClick={() => setBoardOpen(true)}
            className="min-h-11 border border-primary px-4 py-2 font-mono text-xs text-primary hover:bg-primary/10"
          >
            Quadro de investigação
          </button>
          <button
            onClick={() => {
              setSoundOn((value) => !value);
              if (!soundOn) startAmbient(true);
            }}
            className="min-h-11 border border-primary px-4 py-2 font-mono text-xs text-primary"
          >
            Ambiente: {soundOn ? "ligado" : "desligado"}
          </button>
          <label className="flex min-h-11 items-center gap-2 border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
            Volume {Math.round(volume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-24 accent-primary"
              aria-label="Volume do Caso Monroe"
            />
          </label>
          <button
            disabled={completed.length < 4}
            onClick={() => setReportOpen(true)}
            className="min-h-11 border border-border px-4 py-2 font-mono text-xs disabled:opacity-40"
          >
            Relatório final
          </button>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((item) => (
            <button
              key={item}
              disabled={item > objective && !completed.includes((item - 1) as Objective)}
              onClick={() => item <= objective && setObjective(item as Objective)}
              className={`min-h-11 border px-2 py-2 font-mono text-xs ${item === objective ? "border-primary text-primary" : completed.includes(item as Objective) ? "border-primary/50 text-primary/70" : "border-border text-muted-foreground disabled:opacity-40"}`}
            >
              Objetivo {item}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="border border-border bg-card/70 p-5 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Objetivo {objective}
            </p>
            <h2 className="mt-2 font-display text-3xl text-primary">{objectiveTitle[objective]}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Você pode ler todos os depoimentos e documentos. Nos depoimentos, escolha entre ler o
              texto, ouvir a gravação ou usar os dois.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {TESTIMONIES.map((testimony) => (
              <article key={testimony.id} className="border border-border bg-card/40 p-4">
                <h3 className="font-display text-xl">
                  {testimony.title.replace("Depoimento — ", "")}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      startAmbient();
                      playSfx("paper");
                      setTestimoniesRead((prev) =>
                        prev.includes(testimony.id) ? prev : [...prev, testimony.id],
                      );
                      setOpened(testimony);
                    }}
                    className="min-h-10 border border-border px-3 py-2 font-mono text-xs hover:border-primary"
                  >
                    Ler depoimento
                  </button>
                  <button
                    onClick={() => {
                      startAmbient();
                      playSfx("play");
                      setAudio(audio === testimony.id ? null : testimony.id);
                    }}
                    className="min-h-10 border border-primary px-3 py-2 font-mono text-xs text-primary hover:bg-primary/10"
                  >
                    {audio === testimony.id ? "Ocultar áudio" : "Ouvir depoimento"}
                  </button>
                </div>
                {audio === testimony.id && (
                  <audio
                    className="mt-3 w-full"
                    controls
                    autoPlay
                    volume={volume}
                    onPlay={() => {
                      startAmbient();
                      playSfx("play");
                      setTestimoniesHeard((prev) =>
                        prev.includes(testimony.id) ? prev : [...prev, testimony.id],
                      );
                    }}
                    src={testimony.audio}
                    aria-label={`Áudio do depoimento de ${testimony.title}`}
                  />
                )}
              </article>
            ))}
          </div>

          <div className="mt-5 border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-2xl">Documentos liberados</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playSfx("warning");
                    setShowHint(true);
                    setHintConfirmed(false);
                  }}
                  className="min-h-10 border border-primary px-3 py-2 font-mono text-xs text-primary"
                >
                  Ouvir dicas
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {availableDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    startAmbient();
                    playSfx("paper");
                    setDocumentsOpened((prev) =>
                      prev.includes(doc.id) ? prev : [...prev, doc.id],
                    );
                    setOpened(doc);
                  }}
                  className="border border-border p-3 text-left text-sm hover:border-primary"
                >
                  {doc.image && (
                    <img
                      src={doc.image}
                      alt={`Página original do PDF: ${doc.title}`}
                      className="mb-3 h-32 w-full object-cover object-top opacity-80"
                    />
                  )}
                  {doc.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border border-border bg-card/50 p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Pista de cifra
            </h3>
            <p className="mt-3 text-sm leading-relaxed">
              As mensagens do clube de criptografia usam deslocamento de letras. A chave precisa ser
              deduzida do contexto, não chutada.
            </p>
            <p className="mt-4 break-words border-l-2 border-primary pl-3 font-mono text-sm text-primary">
              QDR SRVVR WH YHU HVVD VHPDQD, HVWRX IRUD GD FLGDGH
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={key}
                onChange={(event) => setKey(event.target.value.replace(/\D/g, ""))}
                placeholder="chave"
                className="w-24 border border-input bg-background px-3 py-2 font-mono"
                aria-label="Chave da Cifra de César"
              />
              <button
                onClick={() => {
                  const value = Number(key);
                  if (!key) return;
                  playSfx("play");
                  setDecoded(caesar("QDR SRVVR WH YHU HVVD VHPDQD, HVWRX IRUD GD FLGDGH", -value));
                }}
                className="border border-border px-4 py-2 font-mono text-xs hover:border-primary"
              >
                Decifrar
              </button>
            </div>
            {decoded && (
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {decoded}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              A frase decifrada ajuda a verificar se a viagem de alguém realmente aconteceu.
            </p>
            {objective >= 3 && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Segunda mensagem recuperada
                </p>
                <p className="mt-2 font-mono text-sm text-primary">ULFKDUG</p>
                {decoded && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    Resultado com a mesma chave: {caesar("ULFKDUG", -Number(key))}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Use a mesma lógica de deslocamento para revelar o nome que aparece na cadeia de
                  chantagem.
                </p>
              </div>
            )}
          </section>

          <section className="border border-border p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Sua conclusão
            </h3>
            <p className="mt-3 text-sm leading-relaxed">
              {objective === 1 &&
                "O cliente secreto aparece no e-mail de Jonathan e em uma visita que não consta nos arquivos."}
              {objective === 2 &&
                "Compare álibis com evidências externas, especialmente a notícia da gala."}
              {objective === 3 &&
                "O dinheiro desaparecido transforma a discussão profissional em chantagem."}
              {objective === 4 &&
                "Escolha a dupla e três provas que expliquem motivo, oportunidade e ligação."}
            </p>
            <div className="mt-5">
              {objective === 1 && (
                <Choice
                  options={[
                    ["Jacob Kline", "jacob"],
                    ["Daniel Thompson", "daniel"],
                    ["Emily Parker", "emily"],
                  ]}
                  onPick={checkChoice}
                />
              )}
              {objective === 2 && (
                <Choice
                  options={[
                    ["Monica Monroe", "monica"],
                    ["Richard Stevens", "richard"],
                    ["Daniel Thompson", "daniel"],
                    ["Emily Parker", "emily"],
                  ]}
                  onPick={checkChoice}
                />
              )}
              {objective === 3 && (
                <Choice
                  options={[
                    ["Sabia do dinheiro desaparecido e encontraria Jonathan às 20h", "money"],
                    ["Sabia apenas da rivalidade profissional", "rivalry"],
                    ["Não sabia nada e iria ao hotel", "nothing"],
                  ]}
                  onPick={checkChoice}
                />
              )}
              {objective === 4 && (
                <Choice
                  options={[
                    ["Emily Parker, com Richard Stevens", "emily-richard"],
                    ["Jacob Kline, com Daniel Thompson", "jacob-daniel"],
                    ["Monica Monroe, sozinha", "monica-alone"],
                  ]}
                  onPick={checkChoice}
                />
              )}
            </div>
            {answer && (
              <p className="mt-4 border-l-2 border-primary pl-3 text-sm text-primary">{answer}</p>
            )}
          </section>
          <section className="border border-primary/50 bg-primary/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                  Bloco de notas do investigador
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Registre suspeitas, contradições e teorias. Suas anotações ficam salvas neste
                  navegador.
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {notes.length} caracteres
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex.: Richard diz que estava com Amara. Procurar uma prova independente..."
              className="mt-4 min-h-48 w-full resize-y border border-border bg-background/80 p-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:border-primary"
              aria-label="Anotações pessoais da investigação"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-primary">
                salvamento automático ativado
              </span>
              <button
                type="button"
                onClick={() => setNotes("")}
                className="border border-border px-3 py-2 font-mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary"
              >
                Limpar anotações
              </button>
            </div>
          </section>
        </aside>
      </div>

      {boardOpen && (
        <Overlay className="max-w-6xl" onClose={() => setBoardOpen(false)}>
          <InvestigationBoard onFeedback={(kind) => playSfx(kind)} />
        </Overlay>
      )}
      {briefingOpen && (
        <Overlay onClose={() => setBriefingOpen(false)}>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Homicídios · Arquivo Greenfield
          </p>
          <h2 className="mt-2 font-display text-3xl">O Caso Monroe</h2>
          <div className="mt-4">
            <div className="text-sm leading-relaxed">
              <p>
                Você foi convocado para auxiliar em um caso de grande repercussão. O advogado
                Jonathan Monroe foi encontrado morto no escritório de sua casa, em Greenfield,
                depois de uma noite de trabalho. A ligação para a polícia foi feita por Monica
                Monroe quando ela voltou de uma viagem em 21 de maio de 2023.
              </p>
              <p className="mt-3">
                O cofre da residência guardava as economias do casal, mas há sinais de que dinheiro
                desapareceu. Jonathan também mantinha encontros com um cliente não oficial, alguém
                que não aparece no laptop nem nos arquivos do escritório.
              </p>
              <p className="mt-3">
                O dossiê reúne cinco pessoas de interesse: Monica Monroe, Richard Stevens, Daniel
                Thompson, Emily Parker e Jacob Kline. Cada depoimento pode ser lido ou ouvido; as
                faturas, mensagens, páginas de diário e registros visuais precisam ser comparados.
              </p>
              <div className="mt-4 border-l-2 border-primary pl-3 text-primary">
                <p className="font-mono text-xs uppercase tracking-wider">Sua missão</p>
                <p className="mt-2">
                  Descobrir o cliente secreto, identificar quem mentiu sobre o álibi, entender o que
                  essa pessoa sabia e apontar quem matou Jonathan, com quem trabalhou e quais três
                  provas sustentam a conclusão.
                </p>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Nem tudo será evidente à primeira vista. Algumas pistas só fazem sentido quando
                cruzadas com depoimentos e imagens posteriores. Evite avançar por tentativa e erro:
                registre o caminho que as provas realmente sustentam.
              </p>
            </div>
          </div>
          <button
            onClick={() => setBriefingOpen(false)}
            className="mt-6 min-h-11 border border-primary px-5 py-3 font-mono text-sm text-primary"
          >
            Iniciar investigação
          </button>
        </Overlay>
      )}
      {opened && (
        <Overlay onClose={() => setOpened(null)}>
          <h2 className="font-display text-2xl">{opened.title}</h2>
          {opened.image && (
            <>
              <button
                type="button"
                onClick={() => openZoom(opened.image!, opened.title)}
                className="group mt-4 block w-full cursor-zoom-in text-left"
                title="Clique para ampliar"
              >
                <img
                  src={opened.image}
                  alt={`Página original do PDF: ${opened.title}`}
                  className="max-h-[55vh] w-full object-contain transition group-hover:opacity-80"
                />
                <span className="mt-2 block text-center font-mono text-[11px] text-primary">
                  Clique na imagem para ampliar e ler os detalhes
                </span>
              </button>
            </>
          )}
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{opened.body}</p>
          {opened.audio && (
            <div className="mt-5">
              <p className="mb-2 font-mono text-xs text-muted-foreground">
                Você escolhe: ler e ouvir, só ler ou só ouvir.
              </p>
              <audio
                controls
                className="w-full"
                volume={volume}
                src={opened.audio}
                onPlay={() => {
                  startAmbient();
                  playSfx("play");
                }}
              />
            </div>
          )}
        </Overlay>
      )}
      {reportOpen && (
        <Overlay onClose={() => setReportOpen(false)}>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Relatório final · Arquivo Greenfield
          </p>
          <h2 className="mt-2 font-display text-3xl">O Caso Monroe</h2>
          <div className="mt-5 border border-primary/60 bg-primary/5 p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Classificação do investigador
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <p className="font-display text-2xl text-primary">{reportRank}</p>
              <p className="font-mono text-3xl text-primary">{reportPoints}/100</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ReportMetric label="Objetivos" value={`${completed.length}/4`} />
            <ReportMetric label="Documentos" value={String(documentsOpened.length)} />
            <ReportMetric label="Áudios" value={String(testimoniesHeard.length)} />
            <ReportMetric label="Erros / dicas" value={`${mistakes} / ${hintsUsed}`} />
          </div>
          <section className="mt-6 border-t border-border pt-5 text-sm leading-relaxed">
            <h3 className="font-display text-xl">{verdictTitle}</h3>
            <p className="mt-3">{verdictSummary}</p>
          </section>
          <section className="mt-5 border-t border-border pt-5 text-sm leading-relaxed">
            <h3 className="font-display text-xl">Três provas principais</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              {verdictProofs.map((proof) => (
                <li key={proof}>{proof}</li>
              ))}
            </ol>
          </section>
          <p className="mt-6 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
            Este relatório separa evidências observadas de conclusão investigativa. A classificação
            considera objetivos resolvidos, documentos consultados, depoimentos ouvidos, erros e
            dicas utilizadas.
          </p>
        </Overlay>
      )}
      {showHint && (
        <Overlay onClose={() => setShowHint(false)}>
          <h2 className="font-display text-2xl">Dicas do Caso Monroe</h2>
          {!hintConfirmed ? (
            <>
              <p className="mt-4 border-l-2 border-primary pl-3 text-sm leading-relaxed text-primary">
                Ouça uma dica apenas em último caso. Tente cruzar as pistas por conta própria antes
                de revelar uma orientação.
              </p>
              <button
                onClick={() => {
                  playSfx("warning");
                  setHintConfirmed(true);
                  setHintsUsed((value) => value + 1);
                  speak(HINTS[objective]);
                }}
                className="mt-5 min-h-11 border border-primary px-4 py-3 font-mono text-sm text-primary"
              >
                Confirmar e ouvir dica
              </button>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-relaxed">{HINTS[objective]}</p>
              <button
                onClick={() => speak(HINTS[objective])}
                className="mt-5 min-h-11 border border-border px-4 py-3 font-mono text-sm"
              >
                Reproduzir novamente
              </button>
            </>
          )}
        </Overlay>
      )}
      {zoomedImage && (
        <ImageZoom
          image={zoomedImage}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </main>
  );
}

function Choice({
  options,
  onPick,
}: {
  options: [string, string][];
  onPick: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map(([label, value]) => (
        <button
          key={value}
          onClick={() => onPick(value)}
          className="min-h-11 border border-border px-4 py-3 text-left text-sm hover:border-primary"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg text-foreground">{value}</p>
    </div>
  );
}

function InvestigationBoard({
  onFeedback,
}: {
  onFeedback?: (kind: "success" | "error" | "connection" | "table") => void;
}) {
  const suspects = [
    ["Monica Monroe", "esposa · viagem de negócios"],
    ["Richard Stevens", "primo · sócio minoritário"],
    ["Daniel Thompson", "advogado rival · criptografia"],
    ["Emily Parker", "ex-secretária · demitida"],
    ["Jacob Kline", "cliente · registro militar"],
  ];
  const clues = [
    ["Faturas de hotel", "Daniel e Monica fora de Greenfield"],
    ["SMS de Richard", "chantagem de 50 mil dólares"],
    ["Diário de Emily", "motivo e acesso à casa"],
    ["Jornal da gala", "Amara em Nova York"],
  ];
  const requiredConnections = [
    ["Richard Stevens", "Jornal da gala"],
    ["Richard Stevens", "SMS de Richard"],
    ["Emily Parker", "Diário de Emily"],
  ];
  const dexterNarrations: Record<string, string> = {
    "Richard Stevens|Jornal da gala":
      "O álibi de Richard sangra no papel. Amara estava em Nova York. Ele estava sozinho quando disse o contrário.",
    "Richard Stevens|SMS de Richard":
      "Cinquenta mil dólares não são um pedido. São uma coleira. Richard tinha um motivo para silenciar Jonathan.",
    "Emily Parker|Diário de Emily":
      "Emily conhecia a casa, conhecia a rotina e carregava o ódio como uma lâmina escondida. Motivo e acesso: uma combinação perigosa.",
  };
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [selectedClue, setSelectedClue] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ suspect: string; clue: string }[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    kind: "correct" | "wrong" | "duplicate";
    text: string;
    narration?: string;
  } | null>(null);

  const isRequiredConnection = (suspect: string, clue: string) =>
    requiredConnections.some(
      ([requiredSuspect, requiredClue]) => requiredSuspect === suspect && requiredClue === clue,
    );

  const correctConnections = connections.filter((connection) =>
    isRequiredConnection(connection.suspect, connection.clue),
  );
  const allProofsReady = correctConnections.length === requiredConnections.length;

  const connect = (suspect: string | null, clue: string | null) => {
    if (!suspect || !clue) return;
    const alreadyConnected = connections.some(
      (connection) => connection.suspect === suspect && connection.clue === clue,
    );
    if (alreadyConnected) {
      setFeedback({ kind: "duplicate", text: "Esse fio já está preso ao quadro." });
      return;
    }
    const correct = isRequiredConnection(suspect, clue);
    const nextCorrectCount = correctConnections.length + (correct ? 1 : 0);
    setConnections((current) => [...current, { suspect, clue }]);
    setScore((current) => Math.max(0, current + (correct ? 100 : -25)));
    setFeedback(
      correct
        ? {
            kind: "correct",
            text: "Conexão confirmada. Essa evidência sustenta a cadeia do crime.",
            narration: dexterNarrations[`${suspect}|${clue}`],
          }
        : {
            kind: "wrong",
            text: "Conexão sem sustentação suficiente. Mantenha-a como hipótese e volte aos documentos.",
          },
    );
    onFeedback?.(
      correct
        ? nextCorrectCount === requiredConnections.length
          ? "table"
          : "connection"
        : "error",
    );
    setSelectedSuspect(null);
    setSelectedClue(null);
  };

  const selectSuspect = (name: string) => {
    if (selectedClue) {
      connect(name, selectedClue);
      return;
    }
    setSelectedSuspect((current) => (current === name ? null : name));
  };

  const selectClue = (name: string) => {
    if (selectedSuspect) {
      connect(selectedSuspect, name);
      return;
    }
    setSelectedClue((current) => (current === name ? null : name));
  };

  const removeConnection = (suspect: string, clue: string) => {
    setConnections((current) =>
      current.filter((connection) => connection.suspect !== suspect || connection.clue !== clue),
    );
    setFeedback({ kind: "duplicate", text: "Fio removido. A hipótese voltou a ficar em aberto." });
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
        Quadro de investigação
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Conexões do Caso Monroe</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Você está na pele de <strong className="text-foreground">Dexter Morgan</strong>. Cruze
            pessoas e evidências para construir um caso que sobreviva às provas — e descobrir quem
            merece ser levado à mesa.
          </p>
        </div>
        <span className="border border-primary/60 px-3 py-2 font-mono text-[10px] text-primary">
          PREPARAR A MESA · UM FATO POR VEZ
        </span>
      </div>
      <div className="mt-5 border border-primary/40 bg-primary/5 p-4 text-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Como Dexter trabalha
        </p>
        <p className="mt-2 text-muted-foreground">
          Selecione um suspeito e depois uma pista para prender um fio vermelho entre os dois. As
          conexões são suas hipóteses de trabalho; a prova final ainda precisa ser confirmada no
          dossiê e apresentada no relatório antes de colocar o assassino na mesa de Dexter.
        </p>
      </div>
      <div className="mt-5 overflow-auto border border-border bg-[#15100f] p-3 sm:p-6">
        <div className="relative min-h-[690px] min-w-[920px] bg-[radial-gradient(circle_at_center,#2a1a18_0%,#120d0d_70%)] p-5">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
              <g stroke="#b4232d" strokeWidth="0.35" fill="none">
                {connections.map((connection) => {
                  const suspectIndex = suspects.findIndex(([name]) => name === connection.suspect);
                  const clueIndex = clues.findIndex(([name]) => name === connection.clue);
                  const x1 = 10 + suspectIndex * 20;
                  const x2 = 12.5 + clueIndex * 25;
                  return (
                    <path
                      key={`${connection.suspect}-${connection.clue}`}
                      d={`M${x1} 21 C${x1 + (x2 - x1) * 0.2} 34, ${x2 - (x2 - x1) * 0.2} 49, ${x2} 64`}
                      stroke="#d12d3a"
                      strokeWidth="0.55"
                    />
                  );
                })}
              </g>
            </svg>
          </div>
          <p className="relative z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-red-300/80">
            Pessoas de interesse
          </p>
          <div className="relative z-10 mt-3 grid grid-cols-5 gap-4">
            {suspects.map(([name, detail]) => (
              <button
                type="button"
                key={name}
                onClick={() => selectSuspect(name)}
                className={`min-h-36 border p-3 text-left shadow-[0_0_18px_rgba(180,35,45,0.2)] transition hover:-translate-y-1 ${selectedSuspect === name ? "border-white bg-[#681d25] ring-2 ring-primary" : "border-red-400/70 bg-[#2b1718]/95"}`}
                aria-pressed={selectedSuspect === name}
              >
                <div className="mb-2 h-10 w-10 rounded-full border border-red-300/70 bg-black/30" />
                <p className="font-display text-lg text-red-100">{name}</p>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-red-200/70">
                  {detail}
                </p>
              </button>
            ))}
          </div>
          <div className="relative z-10 mt-40">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300/80">
              Pistas que exigem cruzamento
            </p>
            <div className="mt-3 grid grid-cols-4 gap-5">
              {clues.map(([name, detail]) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => selectClue(name)}
                  className={`min-h-28 border p-3 text-left shadow-[0_0_18px_rgba(216,164,85,0.12)] transition hover:-translate-y-1 ${selectedClue === name ? "border-white bg-[#67431f] ring-2 ring-primary" : "border-amber-200/60 bg-[#33251b]/95"}`}
                  aria-pressed={selectedClue === name}
                >
                  <p className="font-display text-lg text-amber-100">{name}</p>
                  <p className="mt-1 font-mono text-[10px] leading-relaxed text-amber-100/70">
                    {detail}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-6 flex items-center justify-center">
            <div className="border-2 border-red-400 bg-[#3b1418] px-8 py-4 text-center shadow-[0_0_25px_rgba(180,35,45,0.35)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-200/80">
                Mesa de Dexter Morgan
              </p>
              <p className="mt-1 font-display text-xl text-red-50">Quem matou Jonathan Monroe?</p>
              <p className="mt-2 max-w-sm text-xs text-red-100/70">
                O objetivo não é apenas apontar um nome. É reunir a prova necessária para colocar o
                assassino na mesa.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-card/40 p-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Pontuação da dedução
          </p>
          <p className="mt-1 font-display text-2xl">{score} pontos</p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Provas necessárias: {correctConnections.length}/{requiredConnections.length}
        </p>
      </div>
      {feedback && (
        <div
          className={`mt-3 border p-4 text-sm ${feedback.kind === "correct" ? "border-primary bg-primary/10 text-primary" : feedback.kind === "wrong" ? "border-red-400/70 bg-red-950/30 text-red-100" : "border-border bg-card/40 text-muted-foreground"}`}
          aria-live="polite"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em]">
            {feedback.kind === "correct"
              ? "Conexão correta · +100"
              : feedback.kind === "wrong"
                ? "Hipótese não confirmada · −25"
                : "Quadro atualizado"}
          </p>
          <p className="mt-1">{feedback.text}</p>
          {feedback.narration && (
            <blockquote className="mt-3 border-l-2 border-primary/70 pl-3 font-display text-lg italic text-foreground">
              <span className="mr-2 font-mono text-[10px] not-italic uppercase tracking-[0.2em] text-primary">
                Dexter Morgan
              </span>
              “{feedback.narration}”
            </blockquote>
          )}
        </div>
      )}
      {allProofsReady && (
        <div className="relative mt-4 overflow-hidden border-2 border-primary bg-[#3b1418] p-5 text-center shadow-[0_0_35px_rgba(180,35,45,0.55)] animate-pulse">
          <div className="pointer-events-none absolute inset-0 border-4 border-primary/30 animate-ping" />
          <p className="relative font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Todas as provas necessárias reunidas
          </p>
          <h3 className="relative mt-2 font-display text-3xl text-red-50">
            A mesa de Dexter está pronta
          </h3>
          <p className="relative mx-auto mt-2 max-w-2xl text-sm text-red-100/80">
            O fio entre Richard, a chantagem e o álibi quebrado está ligado ao motivo e ao acesso de
            Emily. Você já tem a cadeia mínima para apontar o assassino — agora confirme tudo no
            relatório final.
          </p>
          <blockquote className="relative mx-auto mt-4 max-w-2xl border-l-2 border-primary/70 pl-3 text-left font-display text-lg italic text-red-50">
            <span className="mr-2 font-mono text-[10px] not-italic uppercase tracking-[0.2em] text-primary">
              Dexter Morgan
            </span>
            “Três fios. Um motivo. Uma oportunidade. Agora só falta levar o assassino até a minha
            mesa.”
          </blockquote>
          <div className="relative mt-4 flex items-center justify-center gap-2 font-mono text-xs text-primary">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(255,80,80,0.9)]" />
            CASO PRONTO PARA A CONCLUSÃO
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(255,80,80,0.9)]" />
          </div>
        </div>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="border border-border bg-card/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Fios montados: {connections.length}
            </p>
            {(selectedSuspect || selectedClue) && (
              <p className="font-mono text-xs text-amber-200">
                {selectedSuspect ? "Agora escolha uma pista" : "Agora escolha um suspeito"}
              </p>
            )}
          </div>
          {connections.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhuma conexão montada. Comece por uma pessoa de interesse e cruze-a com um
              documento.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {connections.map((connection) => (
                <button
                  key={`${connection.suspect}-${connection.clue}`}
                  type="button"
                  onClick={() => removeConnection(connection.suspect, connection.clue)}
                  className="border border-red-400/70 px-3 py-2 text-left text-xs text-red-100 hover:bg-red-950/60"
                  title="Remover conexão"
                >
                  {connection.suspect} <span className="text-red-300">×</span> {connection.clue}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setConnections([]);
            setSelectedSuspect(null);
            setSelectedClue(null);
          }}
          disabled={connections.length === 0 && !selectedSuspect && !selectedClue}
          className="min-h-11 self-start border border-border px-4 py-3 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpar quadro
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Consulte os documentos no dossiê e use o bloco de notas para separar fatos confirmados de
        teorias. O quadro organiza o raciocínio; o relatório final decide quem chega à mesa.
      </p>
    </div>
  );
}
function ImageZoom({
  image,
  zoomLevel,
  onZoomChange,
  onClose,
}: {
  image: { src: string; title: string };
  zoomLevel: number;
  onZoomChange: (value: number) => void;
  onClose: () => void;
}) {
  const baseWidth = typeof window === "undefined" ? 1020 : Math.min(window.innerWidth * 0.92, 1020);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 p-3 text-white sm:p-6"
      onClick={onClose}
      onWheel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onZoomChange(Math.min(8, Math.max(0.5, zoomLevel + (event.deltaY < 0 ? 0.25 : -0.25))));
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
            Visualizador de evidência
          </p>
          <h2 className="mt-1 font-display text-xl">{image.title}</h2>
        </div>
        <div
          className="flex flex-wrap items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.25))}
            className="min-h-10 min-w-10 border border-white/30 px-3 font-mono text-lg hover:border-primary hover:text-primary"
            aria-label="Diminuir zoom"
          >
            −
          </button>
          <input
            type="range"
            min="0.5"
            max="8"
            step="0.25"
            value={zoomLevel}
            onChange={(event) => onZoomChange(Number(event.target.value))}
            className="w-32 accent-primary sm:w-48"
            aria-label="Nível de zoom"
          />
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(8, zoomLevel + 0.25))}
            className="min-h-10 min-w-10 border border-white/30 px-3 font-mono text-lg hover:border-primary hover:text-primary"
            aria-label="Aumentar zoom"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(1)}
            className="min-h-10 border border-white/30 px-3 font-mono text-xs hover:border-primary hover:text-primary"
          >
            {Math.round(zoomLevel * 100)}% · resetar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 border border-primary px-3 font-mono text-xs text-primary hover:bg-primary/10"
          >
            Fechar
          </button>
        </div>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-auto rounded border border-white/10 bg-black/40 p-4">
        <div style={{ width: baseWidth * zoomLevel }}>
          <img
            src={image.src}
            alt={`Evidência ampliada: ${image.title}`}
            className="max-w-none cursor-zoom-out select-none"
            style={{ width: "100%" }}
            onClick={(event) => event.stopPropagation()}
            draggable={false}
          />
        </div>
      </div>
      <p className="pt-3 text-center font-mono text-[11px] text-white/60">
        Use +, −, o controle deslizante ou a roda do mouse/trackpad. Arraste as barras de rolagem
        para explorar a página.
      </p>
    </div>
  );
}

function Overlay({
  children,
  onClose,
  className = "max-w-xl",
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full overflow-auto border border-border bg-card p-6 ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-6 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          fechar
        </button>
      </div>
    </div>
  );
}
