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
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [documentsOpened, setDocumentsOpened] = useState<string[]>([]);
  const [testimoniesHeard, setTestimoniesHeard] = useState<string[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [finalVerdict, setFinalVerdict] = useState<
    "emily-richard" | "jacob-daniel" | "monica-alone" | null
  >(null);
  const ambientRef = useRef<{
    context: AudioContext;
    sources: AudioScheduledSourceNode[];
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
    rainGain.gain.value = 0.045;
    rain.connect(rainFilter).connect(rainGain).connect(context.destination);
    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 58;
    const humGain = context.createGain();
    humGain.gain.value = 0.012;
    hum.connect(humGain).connect(context.destination);
    rain.start();
    hum.start();
    ambientRef.current = { context, sources: [rain, hum] };
  };

  const playSfx = (kind: "paper" | "play" | "success" | "error" | "warning") => {
    if (!soundOn || typeof window === "undefined") return;
    startAmbient();
    const context = ambientRef.current?.context ?? new AudioContext();
    const tones = {
      paper: [280],
      play: [440, 660],
      success: [392, 523, 659],
      error: [220, 165],
      warning: [180, 220],
    }[kind];
    tones.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.08;
      oscillator.type = kind === "error" ? "sawtooth" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === "paper" ? 0.04 : 0.07, start + 0.01);
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

  const checkChoice = (value: string) => {
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
            onClick={() => {
              setSoundOn((value) => !value);
              if (!soundOn) startAmbient(true);
            }}
            className="min-h-11 border border-primary px-4 py-2 font-mono text-xs text-primary"
          >
            Ambiente: {soundOn ? "ligado" : "desligado"}
          </button>
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
        </aside>
      </div>

      {opened && (
        <Overlay onClose={() => setOpened(null)}>
          <h2 className="font-display text-2xl">{opened.title}</h2>
          {opened.image && (
            <img
              src={opened.image}
              alt={`Página original do PDF: ${opened.title}`}
              className="mt-4 max-h-[55vh] w-full object-contain"
            />
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

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-auto border border-border bg-card p-6"
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
