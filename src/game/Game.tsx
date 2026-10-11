import { useState, type ReactNode } from "react";
import {
  CIPHER_KEY,
  CIPHER_TEXT,
  DOAKES_WINDOWS,
  DOCS,
  END_MIN,
  LOCATION_NAMES,
  START_MIN,
  caesar,
  fmtClock,
  type DocId,
  type LocationId,
} from "./data";

type PuzzleId = "sangue" | "hora" | "contradicao" | "janela" | "fechadura" | "cifra" | "luva";
type Modal = { kind: "doc"; id: DocId } | { kind: "puzzle"; id: PuzzleId } | { kind: "acusar" } | null;
type Ending = { title: string; text: string; good: boolean } | null;

const initial = () => ({
  loc: "lab" as LocationId,
  clock: START_MIN,
  suspicion: 0,
  docs: [] as DocId[],
  solved: [] as PuzzleId[],
  flags: { tellezIncriminado: false, horaFalsa: false },
  log: ["23:00 — Mais um turno da noite. O caso Ortega foi arquivado rápido demais. O Passageiro Sombrio não gosta disso."] as string[],
});

export function Game() {
  const [s, setS] = useState(initial);
  const [modal, setModal] = useState<Modal>(null);
  const [ending, setEnding] = useState<Ending>(null);
  const [tab, setTab] = useState<"cena" | "caderno">("cena");

  const has = (d: DocId) => s.docs.includes(d);
  const done = (p: PuzzleId) => s.solved.includes(p);

  function narrate(text: string, extra: Partial<ReturnType<typeof initial>> = {}, minutes = 0, susp = 0) {
    setS((prev) => {
      const clock = prev.clock + minutes;
      const suspicion = prev.suspicion + susp;
      const next = { ...prev, ...extra, clock, suspicion, log: [`${fmtClock(clock)} — ${text}`, ...prev.log] };
      if (suspicion >= 3)
        setEnding({
          good: false,
          title: "Doakes te pegou",
          text: "\"Eu sempre soube que tinha algo errado com você, Morgan.\" Doakes te encontra num lugar onde um analista de sangue não deveria estar. A noite acaba numa sala de interrogatório.",
        });
      else if (clock >= END_MIN)
        setEnding({
          good: false,
          title: "Amanheceu",
          text: "O turno da manhã chega. LaGuerta assina o arquivamento do caso Ortega. O assassino continua lá fora, e você perdeu a janela.",
        });
      return next;
    });
  }

  const addDoc = (d: DocId, text: string) => {
    if (has(d)) return setModal({ kind: "doc", id: d });
    narrate(text, { docs: [...s.docs, d] });
    setModal({ kind: "doc", id: d });
  };

  const solve = (p: PuzzleId, text: string, extra: Partial<ReturnType<typeof initial>> = {}) => {
    narrate(text, { solved: [...s.solved, p], ...extra });
    setModal(null);
  };

  const fail = (text: string, minutes = 30, susp = 0) => narrate(text, {}, minutes, susp);

  const go = (loc: LocationId) => {
    if (loc === s.loc) return;
    narrate(`Você vai até: ${LOCATION_NAMES[loc]}.`, { loc }, 10);
    setTab("cena");
  };

  const Hot = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
    <button onClick={onClick} className="inline text-foreground underline-offset-4 decoration-primary/0 hover:underline hover:decoration-primary">
      {children}
    </button>
  );

  const scenes: Record<LocationId, ReactNode> = {
    lab: (
      <>
        <p>
          O laboratório cheira a reagente e café velho. Sobre a bancada estão as <Hot onClick={() => (done("sangue") ? addDoc("versoFoto", "Você vira a foto do banheiro. Há algo escrito no verso.") : setModal({ kind: "puzzle", id: "sangue" }))}>fotos da cena</Hot> do apartamento 4B, ao lado do <Hot onClick={() => addDoc("legista", "Você lê o relatório do legista. Um número foi rasurado.")}>relatório do legista</Hot>.
        </p>
        <p>
          Na parede, a velha <Hot onClick={() => { if (!has("tabela")) addDoc("tabela", "Você copia a tabela de resfriamento."); else setModal({ kind: "puzzle", id: "hora" }); }}>tabela de resfriamento</Hot> amarelada. O <Hot onClick={() => addDoc("microscopio", "Você confere a lâmina no microscópio.")}>microscópio</Hot> ainda está ligado, e há um papel colado no monitor de Masuka — um <Hot onClick={() => addDoc("masuka", "Você lê o post-it de Masuka.")}>post-it</Hot> amarelo.
        </p>
        {has("bilhete") && (
          <p>
            O <Hot onClick={() => setModal({ kind: "puzzle", id: "cifra" })}>computador</Hot> do laboratório pode rodar qualquer decifrador simples.
          </p>
        )}
      </>
    ),
    corredor: (
      <>
        <p>
          A Homicídios está quase vazia. Na mesa de Debra, uma <Hot onClick={() => { ["depRuiz", "depTellez", "depTeresa"].forEach((d) => !has(d as DocId) && s.docs.push(d as DocId)); addDoc("depRuiz", "Você folheia a pasta de depoimentos do caso Ortega."); }}>pasta de depoimentos</Hot> e as <Hot onClick={() => addDoc("fichas", "Você lê as fichas dos envolvidos.")}>fichas dos envolvidos</Hot>.
        </p>
        <p>
          No balcão do plantão, o <Hot onClick={() => addDoc("detencao", "Você abre o livro de detenção da noite do crime.")}>livro de detenção</Hot>. O fax ainda cospe uma <Hot onClick={() => addDoc("ponto", "Um fax do Porto de Miami chegou para Debra.")}>folha do porto</Hot>.
        </p>
        <p>
          No quadro branco, Debra escreveu com força: <Hot onClick={() => setModal({ kind: "puzzle", id: "contradicao" })}>"QUEM ESTÁ MENTINDO?"</Hot>
        </p>
        <p className="text-muted-foreground italic">
          {s.suspicion === 0 && "A porta da sala de Doakes está entreaberta. Ele não está olhando para você. Ainda."}
          {s.suspicion === 1 && "Doakes levanta os olhos quando você passa. \"Trabalhando até tarde, Morgan?\""}
          {s.suspicion >= 2 && "Doakes está encostado no batente, braços cruzados, te observando sem disfarçar."}
        </p>
      </>
    ),
    evidencias: (
      <>
        <p>
          Prateleiras de metal e caixas lacradas. Junto à porta fica o <Hot onClick={() => addDoc("registro", "Você lê o registro de entrada da sala.")}>registro de entrada</Hot>. Ao fundo, a fileira de armários velhos, numerados de 1 a 30.
        </p>
        {has("versoFoto") && !done("fechadura") && (
          <p>
            O <Hot onClick={() => setModal({ kind: "puzzle", id: done("janela") ? "fechadura" : "janela" })}>armário 17</Hot> tem uma fechadura antiga. Doakes passa por aqui o tempo todo.
          </p>
        )}
        {done("fechadura") && (
          <p>
            Dentro do armário 17: um <Hot onClick={() => addDoc("bilhete", "Você fotografa o bilhete cifrado.")}>bilhete dobrado</Hot> e uma <Hot onClick={() => setModal({ kind: "puzzle", id: "luva" })}>luva manchada de sangue</Hot> num saco plástico sem etiqueta.
          </p>
        )}
      </>
    ),
    apartamento: (
      <>
        <p>
          Seu apartamento. Silencioso, limpo, controlado. No ar-condicionado, escondida, fica a caixa de lâminas. Na estante, o <Hot onClick={() => addDoc("codigo", "Você relê o Código, como Harry ensinou.")}>caderno de Harry</Hot>.
        </p>
        <p>
          Na mesa, você pode montar o <Hot onClick={() => setModal({ kind: "acusar" })}>quadro do alvo</Hot> e decidir quem vai para a sua mesa esta noite.
        </p>
      </>
    ),
  };

  if (ending) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl py-24 text-center">
          <p className="font-mono text-sm text-muted-foreground">{fmtClock(s.clock)}</p>
          <h1 className={`mt-4 font-display text-5xl ${ending.good ? "text-primary" : "text-destructive"}`}>{ending.title}</h1>
          <p className="mt-6 text-lg leading-relaxed">{ending.text}</p>
          <button className="mt-10 border border-border px-6 py-3 font-mono text-sm hover:bg-accent" onClick={() => { setS(initial()); setEnding(null); setModal(null); }}>
            Recomeçar o turno
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Dexter — Episódio 1</p>
          <h1 className="font-display text-3xl">Turno da Noite</h1>
        </div>
        <p className="font-mono text-2xl text-primary">{fmtClock(s.clock)}</p>
      </header>

      <nav className="mt-4 flex flex-wrap gap-2 font-mono text-sm">
        {(Object.keys(LOCATION_NAMES) as LocationId[]).map((l) => (
          <button key={l} onClick={() => go(l)} className={`border px-3 py-1.5 ${s.loc === l ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {LOCATION_NAMES[l]}
          </button>
        ))}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 flex gap-4 font-mono text-sm">
            <button onClick={() => setTab("cena")} className={tab === "cena" ? "text-primary" : "text-muted-foreground"}>Cena</button>
            <button onClick={() => setTab("caderno")} className={tab === "caderno" ? "text-primary" : "text-muted-foreground"}>Caderno ({s.docs.length})</button>
          </div>
          {tab === "cena" ? (
            <div className="space-y-4 border border-border bg-card p-6 text-lg leading-relaxed">
              <h2 className="font-display text-2xl">{LOCATION_NAMES[s.loc]}</h2>
              {scenes[s.loc]}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {s.docs.length === 0 && <p className="text-muted-foreground">Nada anotado ainda. Leia tudo.</p>}
              {s.docs.map((d) => (
                <button key={d} onClick={() => setModal({ kind: "doc", id: d })} className="border border-border bg-card p-3 text-left hover:border-primary">
                  {DOCS[d].title}
                </button>
              ))}
            </div>
          )}
        </section>
        <aside>
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Pensamentos</h3>
          <ul className="mt-3 max-h-[60vh] space-y-3 overflow-auto text-sm leading-relaxed">
            {s.log.map((l, i) => (
              <li key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{l}</li>
            ))}
          </ul>
        </aside>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4" onClick={() => setModal(null)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            {modal.kind === "doc" && (
              <>
                <h2 className="font-display text-2xl">{DOCS[modal.id].title}</h2>
                <p className="mt-4 whitespace-pre-line font-mono text-sm leading-relaxed">{modal.id === "bilhete" ? CIPHER_TEXT : DOCS[modal.id].body}</p>
              </>
            )}
            {modal.kind === "puzzle" && (
              <Puzzle id={modal.id} s={s} solve={solve} fail={fail} />
            )}
            {modal.kind === "acusar" && (
              <Accuse
                onPick={(who) => {
                  const all = s.solved.length === 7;
                  if (who === "ruiz" && all)
                    setEnding({ good: true, title: "O Código foi respeitado", text: "Ruiz mentiu sobre a noite, lavou o sangue antes de chegar ao bar e plantou a luva para incriminar Tellez. No armazém nove das docas, você encontra o resto. Esta noite, o Passageiro Sombrio come. E ninguém inocente paga por isso." });
                  else if (who === "ruiz")
                    setEnding({ good: false, title: "Ponta solta", text: "Você tinha razão sobre Ruiz, mas não tinha certeza. Harry estaria decepcionado. Faltaram provas, e Ruiz percebe que está sendo seguido. Ele some de Miami antes do amanhecer." });
                  else if (who === "tellez")
                    setEnding({ good: false, title: "Um inocente na mesa", text: "Tellez estava no porto a noite toda; o ponto e a câmera provavam isso. A luva foi plantada. Você quebrou a primeira regra do Código, e o verdadeiro assassino agradece." });
                  else setEnding({ good: false, title: "A testemunha errada", text: "Teresa só contou o que viu. Acusá-la não faz sentido nenhum, e o caso se fecha sem culpado." });
                }}
              />
            )}
            <button className="mt-6 font-mono text-xs text-muted-foreground hover:text-foreground" onClick={() => setModal(null)}>fechar</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-10">{children}</main>;
}

type SolveFn = (p: PuzzleId, text: string, extra?: Record<string, unknown>) => void;
type FailFn = (text: string, minutes?: number, susp?: number) => void;

function Choice({ options, onPick }: { options: { label: string; value: string }[]; onPick: (v: string) => void }) {
  return (
    <div className="mt-4 grid gap-2">
      {options.map((o) => (
        <button key={o.value} onClick={() => onPick(o.value)} className="border border-border px-4 py-2 text-left hover:border-primary">
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Puzzle({ id, s, solve, fail }: { id: PuzzleId; s: ReturnType<typeof initial>; solve: SolveFn; fail: FailFn }) {
  const [order, setOrder] = useState<string[]>([]);
  const [pins, setPins] = useState<number[]>([]);
  const [noise, setNoise] = useState(0);
  const [key, setKey] = useState("");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [liar, setLiar] = useState<string | null>(null);

  if (id === "sangue") {
    const stains = [
      { id: "banheiro", label: "Banheiro — poça redonda, sem cauda" },
      { id: "porta", label: "Porta de entrada — gotas muito alongadas, cauda apontando para a cozinha" },
      { id: "corredor", label: "Corredor — gotas quase redondas, cauda curta" },
      { id: "cozinha", label: "Cozinha — gotas levemente alongadas" },
    ];
    const correct = ["porta", "cozinha", "corredor", "banheiro"];
    return (
      <>
        <h2 className="font-display text-2xl">Fotos da cena — reconstrução</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sangue em movimento deixa gotas alongadas. Quanto mais devagar a vítima anda, mais redondas elas ficam. Quando ela para, sobra uma poça. Ordene o caminho da vítima.</p>
        <div className="mt-4 grid gap-2">
          {stains.map((st) => (
            <button key={st.id} disabled={order.includes(st.id)} onClick={() => setOrder([...order, st.id])} className="border border-border px-4 py-2 text-left hover:border-primary disabled:opacity-40">
              {order.includes(st.id) && <span className="mr-2 font-mono text-primary">{order.indexOf(st.id) + 1}.</span>}
              {st.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3 font-mono text-sm">
          <button onClick={() => setOrder([])} className="text-muted-foreground">limpar</button>
          {order.length === 4 && (
            <button className="text-primary" onClick={() => {
              if (order.join() === correct.join()) solve("sangue", "A vítima foi atacada na porta, cambaleou pela cozinha e pelo corredor e caiu no banheiro. Alguém ajeitou a cena depois. E no verso de uma das fotos tem algo escrito.");
              else { setOrder([]); fail("A sequência não fecha com as gotas. Você perde tempo refazendo as medições."); }
            }}>confirmar sequência</button>
          )}
        </div>
      </>
    );
  }

  if (id === "hora") {
    return (
      <>
        <h2 className="font-display text-2xl">Hora real da morte</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cruze o relatório do legista com a tabela. Quando Lucía Ortega morreu de verdade?</p>
        <Choice
          options={[{ label: "Por volta de 20:30", value: "a" }, { label: "Por volta de 22:30", value: "b" }, { label: "01:00, como está no relatório", value: "c" }, { label: "Por volta de 02:15", value: "d" }]}
          onPick={(v) => v === "b"
            ? solve("hora", "37 menos 30,4 dá 6,6 graus, e a 1,5 por hora são umas 4h20. Ela morreu por volta de 22:30. Alguém mudou a hora do relatório para 01:00, um horário em que Ruiz já tinha álibi no bar.")
            : fail(v === "c" ? "Você aceita a hora rasurada. Algo te incomoda; você recalcula e perde tempo." : "As contas não batem com a tabela. Você refaz tudo.")}
        />
      </>
    );
  }

  if (id === "contradicao") {
    if (!s.solved.includes("hora")) {
      return <><h2 className="font-display text-2xl">Quadro de Debra</h2><p className="mt-4">Sem saber a hora real da morte, qualquer álibi parece bom. Primeiro descubra quando ela morreu.</p></>;
    }
    return (
      <>
        <h2 className="font-display text-2xl">Quem está mentindo?</h2>
        {!liar ? (
          <Choice
            options={[{ label: "Carlos Ruiz", value: "ruiz" }, { label: "Marco Tellez", value: "tellez" }, { label: "Teresa Vidal", value: "teresa" }]}
            onPick={setLiar}
          />
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Qual documento prova a mentira?</p>
            <Choice
              options={[{ label: "Livro de detenção", value: "detencao" }, { label: "Ponto eletrônico do porto", value: "ponto" }, { label: "Fichas dos envolvidos", value: "fichas" }, { label: "Relatório do legista", value: "legista" }]}
              onPick={(doc) => {
                if (liar === "ruiz" && doc === "detencao")
                  solve("contradicao", "Ruiz disse que estava no bar desde as 21h, mas às 21h estava preso aqui. Foi liberado às 22:05, a dez minutos do 4B, e o crime foi às 22:30. Teresa confirma que ele chegou ao bar depois das 23h, molhado.");
                else { setLiar(null); fail(liar === "tellez" ? "Você aponta Tellez para Debra. Ela mostra o ponto do porto: ele não saiu de lá. Ela te olha estranho, e Doakes ouviu tudo." : "A prova não se sustenta. Debra balança a cabeça.", 30, liar === "tellez" ? 1 : 0); }
              }}
            />
          </>
        )}
      </>
    );
  }

  if (id === "janela") {
    return (
      <>
        <h2 className="font-display text-2xl">Armário 17</h2>
        <p className="mt-2 text-sm text-muted-foreground">Arrombar um armário de evidências com Doakes na sala é suicídio. Quando você volta? Agora são {fmtClock(s.clock)}.</p>
        <Choice
          options={[{ label: "Agora mesmo", value: "now" }, ...DOAKES_WINDOWS.map((w, i) => ({ label: `Na janela ${w.label}`, value: String(i) }))]}
          onPick={(v) => {
            if (v === "now") {
              const inWin = DOAKES_WINDOWS.some((w) => s.clock >= w.start && s.clock < w.end);
              if (inWin) return solve("janela", "Doakes saiu para o café. A sala está vazia.");
              return fail("Você mal toca na fechadura e ouve passos. Doakes: \"Perdeu alguma coisa, Morgan?\"", 10, 1);
            }
            const w = DOAKES_WINDOWS[Number(v)];
            if (s.clock >= w.end) return fail("Essa janela já passou. Você fica parado olhando o relógio feito um idiota.", 10);
            solve("janela", `Você espera até ${w.label.split(" ")[0]}. Doakes sai para o café, como sempre.`, { clock: Math.max(s.clock, w.start) });
          }}
        />
      </>
    );
  }

  if (id === "fechadura") {
    const correct = [5, 4, 3, 2];
    return (
      <>
        <h2 className="font-display text-2xl">Fechadura de 4 pinos</h2>
        <p className="mt-2 text-sm text-muted-foreground">Defina a altura de cada pino, em ordem. Cada erro faz barulho. Pinos: {pins.join(" · ") || "—"}</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className="h-12 w-12 border border-border font-mono hover:border-primary" onClick={() => {
              if (correct[pins.length] === n) {
                const np = [...pins, n];
                setPins(np);
                if (np.length === 4) solve("fechadura", "Clique. O armário 17 abre.");
              } else {
                const nn = noise + 1;
                setNoise(nn);
                setPins([]);
                if (nn >= 3) { setNoise(0); fail("A fechadura estala alto demais. Você ouve uma cadeira se mexer no corredor e precisa sair.", 20, 1); }
              }
            }}>{n}</button>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">Barulho: {"▮".repeat(noise)}{"▯".repeat(3 - noise)}</p>
      </>
    );
  }

  if (id === "cifra") {
    return (
      <>
        <h2 className="font-display text-2xl">Decifrador</h2>
        <p className="mt-2 font-mono text-sm">{CIPHER_TEXT}</p>
        <p className="mt-2 text-sm text-muted-foreground">Cada letra foi deslocada por um número. Assassinos metódicos usam datas que importam para eles. Cada tentativa leva tempo.</p>
        <div className="mt-4 flex gap-2">
          <input value={key} onChange={(e) => setKey(e.target.value.replace(/\D/g, ""))} className="w-24 border border-input bg-background px-3 py-2 font-mono" placeholder="chave" />
          <button className="border border-border px-4 font-mono text-sm hover:border-primary" onClick={() => {
            const k = Number(key);
            if (!key) return;
            setDecoded(caesar(CIPHER_TEXT, -k));
            if (k === CIPHER_KEY) solve("cifra", "Chave 7: o dia do primeiro crime. \"ARMAZÉM NOVE DAS DOCAS DE DODGE ISLAND.\" É onde ele guarda o que sobra.");
            else fail("Sai só lixo na tela. O computador range e o relógio corre.", 15);
          }}>aplicar</button>
        </div>
        {decoded && <p className="mt-3 font-mono text-sm text-muted-foreground">{decoded}</p>}
      </>
    );
  }

  // luva
  return (
    <>
      <h2 className="font-display text-2xl">A luva</h2>
      <p className="mt-2">Luva de couro tamanho M. Sangue seco tipo O−. Saco plástico sem etiqueta, com um recibo do porto dentro, no nome de Marco Tellez.</p>
      <p className="mt-3 text-sm text-muted-foreground">O que essa luva realmente diz?</p>
      <Choice
        options={[
          { label: "É prova contra Tellez: o recibo é dele", value: "tellez" },
          { label: "Foi plantada para incriminar Tellez: ele usa GG, e ele estava no porto", value: "plantada" },
          { label: "É de Teresa: ela estava perto da cena", value: "teresa" },
        ]}
        onPick={(v) => v === "plantada"
          ? solve("luva", "O tamanho M serve em Ruiz, não em Tellez, e o ponto do porto inocenta o vizinho. Alguém quis um culpado pronto, e esse alguém conhecia os dois.")
          : fail(v === "tellez" ? "Você quase leva a luva para Debra. Aí lembra das mãos de Tellez. Alguma coisa está errada." : "Teresa não tem ligação com o armário. Você descarta a ideia.", 20)}
      />
    </>
  );
}

function Accuse({ onPick }: { onPick: (who: string) => void }) {
  return (
    <>
      <h2 className="font-display text-2xl">Quadro do alvo</h2>
      <p className="mt-2 text-sm text-muted-foreground">Harry diria: certeza absoluta, ou nada. Quem vai para a sua mesa?</p>
      <Choice options={[{ label: "Carlos Ruiz", value: "ruiz" }, { label: "Marco Tellez", value: "tellez" }, { label: "Teresa Vidal", value: "teresa" }]} onPick={onPick} />
    </>
  );
}
