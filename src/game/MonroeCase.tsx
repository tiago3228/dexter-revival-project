import { useEffect, useState } from "react";
import { caesar } from "./data";

type Objective = 1 | 2 | 3 | 4;
type Evidence = {
  id: string;
  title: string;
  body: string;
  audio?: string;
};

const TESTIMONIES: Evidence[] = [
  {
    id: "monica",
    title: "Depoimento — Monica Monroe",
    audio: "/audio/monroe/monica-monroe.wav",
    body: "Estive fora da cidade entre 18 e 21 de maio, hospedada no Luxe Hotel, em São Francisco. Quando voltei, encontrei Jonathan morto. Nosso casamento tinha problemas financeiros, mas não sei quem desejaria machucá-lo. Não conheço o cliente secreto.",
  },
  {
    id: "richard",
    title: "Depoimento — Richard Stevens",
    audio: "/audio/monroe/richard-stevens.wav",
    body: "Sou primo de Jonathan e sócio minoritário do escritório. Tivemos divergências, mas estávamos bem. Na noite do crime, eu estava em casa com Amara Verns. Ela pode confirmar. Emily Parker e Daniel Thompson tinham problemas com Jonathan.",
  },
  {
    id: "daniel",
    title: "Depoimento — Daniel J. Thompson",
    audio: "/audio/monroe/daniel-thompson.wav",
    body: "Jonathan e eu éramos rivais profissionais, mas nossas discussões eram apenas verbais. Eu estava em uma conferência jurídica em São Francisco, hospedado no Hotel Carvelle. Fui de carro e não possuo arma.",
  },
  {
    id: "emily",
    title: "Depoimento — Emily Parker",
    audio: "/audio/monroe/emily-parker.wav",
    body: "Jonathan me demitiu em 18 de maio e achei a decisão injusta. Na noite do crime, fiquei no meu apartamento, saindo por cerca de uma hora para comprar comida no Telways. Fui sozinha.",
  },
  {
    id: "jacob",
    title: "Depoimento — Jacob Kline",
    audio: "/audio/monroe/jacob-kline.wav",
    body: "Pensei em contratar Jonathan para um assunto delicado, mas desisti. Na noite do crime, estava em casa e moro sozinho. Normalmente já estou dormindo às oito. Não tenho ninguém para confirmar isso.",
  },
];

const DOCUMENTS: Evidence[] = [
  {
    id: "email-client",
    title: "E-mail de Jonathan para Daniel",
    body: "Um novo cliente potencial, que vende lâmpadas de 200 watts, quer manter a identidade em segredo. Ele aparece com frequência na casa de Jonathan. O advogado pede que Daniel tenha o nome do cliente caso algo aconteça. Abaixo, há a mensagem cifrada: MHJWATCAOB EKDSLMIHNOES.",
  },
  {
    id: "diary-early",
    title: "Página recuperada do diário de Emily",
    body: "Emily relata dívidas, um carro de quinze anos quebrado e a esperança de começar a ganhar dinheiro real em breve. Ela escreve que está aberta a novas oportunidades.",
  },
  {
    id: "hotel-carvelle",
    title: "Fatura do Hotel Carvelle",
    body: "Hóspede: Daniel J. Thompson. Entrada em 18/05/2023, saída em 21/05/2023. Há cobrança de quarto para 20/05.",
  },
  {
    id: "hotel-luxe",
    title: "Fatura do Luxe Hotel",
    body: "Hóspede: Monica Monroe. Entrada em 18/05/2023, saída em 21/05/2023. Suite Deluxe registrada em 20/05.",
  },
  {
    id: "receipt",
    title: "Recibo do supermercado Telways",
    body: "20/05/2023 às 20:20. Compras pagas em dinheiro por Emily Parker. O mercado fica a aproximadamente 35 minutos da casa dos Monroe.",
  },
  {
    id: "newspaper",
    title: "Jornal local — gala em Nova York",
    body: "A edição de 22 de maio mostra Amara Verns em uma gala beneficente em Nova York no dia 20 de maio, ao lado de outras convidadas.",
  },
  {
    id: "sms-richard",
    title: "SMS apagado de Richard",
    body: "Eu sei exatamente o que você fez. Se quiser que eu fique calado, vai te custar 50 mil. Me encontre hoje à noite às 20h, você sabe onde!",
  },
  {
    id: "draft",
    title: "Rascunho não enviado para Daniel",
    body: "Jonathan escreve que está sentindo um clima estranho e pede que Daniel guarde algo que ele mostrou no escritório. O restante foi substituído por símbolos.",
  },
  {
    id: "jacob-sms",
    title: "SMS encontrado no celular de Jacob",
    body: "Eu odeio estar tão longe de você. Tudo vai melhorar em breve. Só precisamos passar por essa última noite. Até logo, meu leão! Enviado às 19:30 de 20 de maio.",
  },
  {
    id: "military",
    title: "Registro militar de Jacob Kline",
    body: "Sargento do Exército, médico de combate, baixa em 17/08/2022. Marca identificadora: grande tatuagem de um leão no peito.",
  },
  {
    id: "diary-final",
    title: "Última página do diário de Emily",
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

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const availableDocs = DOCUMENTS.filter((doc) => {
    if (objective === 1) return ["email-client", "diary-early"].includes(doc.id);
    if (objective === 2)
      return ["hotel-carvelle", "hotel-luxe", "receipt", "newspaper"].includes(doc.id);
    if (objective === 3) return ["sms-richard", "draft", "diary-final"].includes(doc.id);
    return ["jacob-sms", "military", "diary-final", "sms-richard", "receipt"].includes(doc.id);
  });

  const complete = (next: number, message: string) => {
    setCompleted((prev) => (prev.includes(objective) ? prev : [...prev, objective]));
    setAnswer(message);
    setOpened(null);
    setAudio(null);
    setHintConfirmed(false);
    if (next > 4) return;
    window.setTimeout(() => setObjective(next), 900);
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
      return complete(
        5,
        "Caso Monroe solucionado: Emily matou Jonathan e Richard estava trabalhando com ela.",
      );
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
                    onClick={() => setOpened(testimony)}
                    className="min-h-10 border border-border px-3 py-2 font-mono text-xs hover:border-primary"
                  >
                    Ler depoimento
                  </button>
                  <button
                    onClick={() => setAudio(audio === testimony.id ? null : testimony.id)}
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
                  onClick={() => setOpened(doc)}
                  className="border border-border p-3 text-left text-sm hover:border-primary"
                >
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
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{opened.body}</p>
          {opened.audio && (
            <div className="mt-5">
              <p className="mb-2 font-mono text-xs text-muted-foreground">
                Você escolhe: ler e ouvir, só ler ou só ouvir.
              </p>
              <audio controls className="w-full" src={opened.audio} />
            </div>
          )}
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
                  setHintConfirmed(true);
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
