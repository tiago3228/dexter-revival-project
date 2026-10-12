import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardList, Eye, FileSearch, LockKeyhole, ShieldAlert, Skull, Sparkles, Users } from "lucide-react";
import { recordCaseCompletion } from "./achievements";
import { beginCaseTimer, finishCaseTimer, pauseCaseTimer } from "./caseTimer";

type Act = 0 | 1 | 2 | 3 | 4 | 5;
type Evidence = { id: string; title: string; source: string; detail: string; act: Act; category: string };
const EVIDENCE: Evidence[] = [
  { id: "blood", title: "Sangue sem origem", source: "Cena do canal", detail: "O sangue está disposto em três pontos separados, mas não há trilha de arrasto nem volume compatível com uma vítima ferida. O padrão parece ter sido montado.", act: 0, category: "Forense" },
  { id: "clock", title: "Relógio parado às 03:17", source: "Apartamento de Elias Voss", detail: "O relógio parou às 03:17, mas a bateria foi removida depois. A hora é uma mensagem deliberada, não um horário confiável de morte.", act: 0, category: "Forense" },
  { id: "salt", title: "Resíduo mineral", source: "Borda do canal", detail: "Cristais incomuns misturados à lama não pertencem à água do canal. A composição é compatível com um antigo depósito industrial perto das docas.", act: 0, category: "Laboratório" },
  { id: "camera", title: "Intervalo apagado", source: "Câmera municipal", detail: "A gravação some por onze minutos, mas o relógio interno da câmera foi atrasado em seis minutos. Alguém tinha acesso ao sistema antes da noite do crime.", act: 1, category: "Digital" },
  { id: "autopsy", title: "Laudo incompatível", source: "Necrotério", detail: "A temperatura registrada não sustenta o horário oficial. O formulário foi alterado depois da assinatura, e a tinta da correção é recente.", act: 1, category: "Forense" },
  { id: "badge", title: "Crachá de visitante", source: "Arquivo da delegacia", detail: "O crachá foi emitido com credenciais federais válidas, mas o número de série pertence a um lote recolhido anos atrás.", act: 1, category: "Documental" },
  { id: "sam", title: "Caderno de Sam", source: "Quarto alugado", detail: "Sam registrou desaparecimentos com o mesmo intervalo entre cidades diferentes. Ele evita chamar isso de padrão até que você apresente as datas e os nomes.", act: 2, category: "Histórico" },
  { id: "dean", title: "Recibo de Dean", source: "Estacionamento das docas", detail: "O recibo prova que Dean estava perto do depósito antes da polícia chegar. Ele diz que procurava uma pessoa desaparecida, não o assassino.", act: 2, category: "Depoimento" },
  { id: "archive", title: "Ficha retirada do arquivo", source: "Arquivo municipal", detail: "Três vítimas foram declaradas mortas sem que seus corpos fossem identificados. A mesma assinatura autorizou a transferência dos registros.", act: 3, category: "Histórico" },
  { id: "family", title: "Fotografia queimada", source: "Arquivo lacrado", detail: "Uma família aparece ao lado de um carro destruído. No verso, duas iniciais — S. W. — e uma data que antecede a primeira série de desaparecimentos.", act: 3, category: "Pessoal" },
  { id: "ledger", title: "Livro-caixa do cais", source: "Armazém 9", detail: "Pagamentos foram feitos para apagar imagens, deslocar caixas sem carga declarada e alterar o inventário de um depósito fechado há décadas.", act: 4, category: "Financeiro" },
  { id: "symbol", title: "Marca no concreto", source: "Armazém 9", detail: "A marca não é uma assinatura comum. Sam reconhece um símbolo usado para proteger uma área; Dean insiste que alguém o desenhou de propósito para assustar a polícia.", act: 4, category: "Anômalo" },
  { id: "yellow", title: "Testemunho dos olhos amarelos", source: "Sala de máquinas", detail: "A testemunha descreve olhos amarelos refletidos no escuro e uma presença que não aparece nas câmeras. Sam liga o relato à história de sua família. A hipótese de Azazel deixa de ser apenas folclore.", act: 5, category: "Testemunho" },
  { id: "trap", title: "Círculo de contenção", source: "Piso do armazém", detail: "Sob a tinta recente há um desenho antigo, interrompido por marcas de arrasto. A cena foi preparada como armadilha — e talvez não para um ser humano.", act: 5, category: "Anômalo" },
];
const ACTS = [
  { title: "Ecos na cena do crime", subtitle: "Canal de Miami · 23h40", desc: "Uma cena montada tenta convencer Dexter de que houve uma luta. O sangue, porém, conta uma história diferente." },
  { title: "A perícia não fecha", subtitle: "Laboratório e Homicídios", desc: "Horários, laudo e câmeras discordam. A investigação começa a parecer manipulada por alguém com acesso oficial." },
  { title: "Os homens que sabem demais", subtitle: "Hotel barato · madrugada", desc: "Dois agentes federais — Sam e Dean Winchester — chegam com perguntas que não constam no relatório policial." },
  { title: "O arquivo que não deveria existir", subtitle: "Arquivo municipal", desc: "Desaparecimentos antigos ligam cidades distantes. Há documentos removidos, identidades incompletas e uma família que alguém tentou apagar." },
  { title: "A armadilha", subtitle: "Docas · Armazém 9", desc: "A trilha converge para um depósito abandonado. Dexter precisa decidir se confia nos irmãos antes que alguém destrua a última prova." },
  { title: "Os olhos amarelos", subtitle: "Subsolo do armazém", desc: "A explicação racional ainda é possível — até que os últimos vestígios e um testemunho impossível se cruzam." },
] as const;
const SUSPECTS = [
  { id: "vale", name: "Detetive Mara Vale", role: "Investigadora do caso", clue: "Tinha acesso ao arquivo e autorizou a correção do laudo.", question: "Quem alterou o horário da morte?", answer: "Eu assinei a primeira versão. A correção chegou pronta da chefia. Não conferi o original antes de anexar." },
  { id: "dock", name: "Nico Alvarez", role: "Funcionário das docas", clue: "Conhece o armazém e recebeu pagamentos fora da folha.", question: "O que foi retirado do armazém?", answer: "Caixas vazias no papel. Algumas pesavam demais. Disseram que era equipamento antigo e me pagaram para não perguntar." },
  { id: "witness", name: "Lena Ortiz", role: "Testemunha sobrevivente", clue: "Mudou seu depoimento após receber uma ameaça.", question: "O que você viu naquela noite?", answer: "Uma figura no corredor. Achei que fosse um homem, até olhar para o rosto. Os olhos refletiam amarelo. Ninguém acreditou em mim." },
  { id: "archivist", name: "Dr. Peter Hales", role: "Arquivista municipal", clue: "A assinatura dele aparece em transferências de registros.", question: "Por que os registros desapareceram?", answer: "Recebi ordens com carimbo oficial. Quando tentei contestar, meu próprio arquivo pessoal foi esvaziado." },
] as const;

export function WinchesterCase({ onBack }: { onBack: () => void }) {
  const [act, setAct] = useState<Act>(0);
  const [found, setFound] = useState<string[]>([]);
  const [interrogated, setInterrogated] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [trustWinchesters, setTrustWinchesters] = useState<boolean | null>(null);
  const [ending, setEnding] = useState<"false" | "partial" | "true" | "secret" | null>(null);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("A primeira cena parece simples demais. Comece examinando os vestígios do canal.");
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const recorded = useRef(false);

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
  const actFound = actEvidence.filter((item) => found.includes(item.id)).length;
  const progress = Math.round((found.length / EVIDENCE.length) * 100);
  const allHumanThreads = ["blood", "autopsy", "camera", "archive", "ledger"].every((id) => found.includes(id));
  const fullTimeline = ["clock", "salt", "sam", "family", "symbol"].every((id) => found.includes(id));
  const hasWitness = found.includes("yellow") && found.includes("symbol");
  const allInterviews = interrogated.length >= 4;
  const secretReady = EVIDENCE.every((item) => found.includes(item.id)) && allInterviews && connections.includes("family-sam") && connections.includes("ledger-vale") && trustWinchesters === true && mistakes === 0;

  useEffect(() => {
    if (!ending || recorded.current) return;
    recorded.current = true;
    const score = Math.max(0, Math.min(100, Math.round((found.length / EVIDENCE.length) * 60 + (allInterviews ? 15 : interrogated.length * 3) + (connections.length >= 3 ? 10 : connections.length * 2) + (hints === 0 ? 10 : Math.max(0, 10 - hints * 3)) - mistakes * 4)));
    recordCaseCompletion({ caseId: "winchester", score, hints, mistakes, correctConclusion: ending === "true" || ending === "secret", elapsedSeconds: finishCaseTimer("winchester"), correctActions: found.length + connections.length + interrogated.length, totalActions: found.length + connections.length + interrogated.length + mistakes });
  }, [ending, found.length, allInterviews, interrogated.length, connections.length, hints, mistakes]);

  const examine = (id: string) => {
    if (found.includes(id)) {
      setActiveEvidence(id);
      return;
    }
    const item = EVIDENCE.find((e) => e.id === id);
    if (!item) return;
    setFound((current) => [...current, id]);
    setActiveEvidence(id);
    setFeedback(`Nova evidência catalogada: ${item.title}. Compare com outros registros antes de concluir.`);
  };

  const connect = () => {
    if (!selectedPerson || !selectedEvidence) return;
    const key = `${selectedEvidence}-${selectedPerson}`;
    const correct = key === "family-sam" || key === "ledger-vale" || key === "yellow-witness" || key === "symbol-dean";
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
    if (interrogated.includes(id)) return;
    setInterrogated((current) => [...current, id]);
    const person = SUSPECTS.find((p) => p.id === id);
    const specialAnswers: Record<string, string> = {
      sam: "Os desaparecimentos seguem um padrão entre cidades. Não é prova de um demônio — ainda não. Mas as datas coincidem com uma tragédia da minha família.",
      dean: "Eu estava nas docas procurando alguém que desapareceu. Não vim prender um assassino comum. E não vou contar tudo até saber o que você encontrou.",
    };
    setFeedback(person ? `${person.name}: “${person.answer}”` : `${id === "sam" ? "Sam Winchester" : "Dean Winchester"}: “${specialAnswers[id] ?? "Não tenho mais nada a acrescentar."}”`);
  };

  const advance = () => {
    if (act === 0 && !["blood", "clock"].every((id) => found.includes(id))) return setFeedback("A cena ainda não foi documentada. Examine o sangue e o relógio antes de avançar.");
    if (act === 1 && !["camera", "autopsy"].every((id) => found.includes(id))) return setFeedback("O laboratório ainda tem contradições sem resposta. Confira câmera e laudo.");
    if (act === 2 && !["sam", "dean"].every((id) => found.includes(id))) return setFeedback("Você precisa registrar as duas versões antes de decidir se confia nos Winchester.");
    if (act === 3 && !["archive", "family"].every((id) => found.includes(id))) return setFeedback("O arquivo está incompleto. Encontre a ficha retirada e a fotografia.");
    if (act === 4 && !["ledger", "symbol"].every((id) => found.includes(id))) return setFeedback("O armazém ainda não foi documentado. Não avance sem registrar o livro-caixa e a marca.");
    if (act < 5) setAct((current) => (current + 1) as Act);
    setActiveEvidence(null);
    setFeedback(ACTS[Math.min(5, act + 1)].desc);
  };

  const conclude = (choice: "false" | "partial" | "true" | "secret") => {
    if (choice === "secret" && !secretReady) {
      setMistakes((current) => current + 1);
      setFeedback("O dossiê secreto ainda não está completo. Faltam evidências, entrevistas ou conexões independentes.");
      return;
    }
    if (choice === "true" && !(allHumanThreads && fullTimeline && hasWitness)) {
      setMistakes((current) => current + 1);
      setFeedback("A hipótese sobrenatural é plausível, mas ainda não está sustentada pela cadeia completa de evidências.");
      return;
    }
    if (choice === "partial" && !allHumanThreads) {
      setFeedback("Ainda faltam provas para fechar a parte humana do caso. Reúna os vestígios do laboratório, arquivo e docas.");
      return;
    }
    setEnding(choice);
  };

  const endingContent = {
    false: { title: "Arquivo encerrado — explicação conveniente", subtitle: "Final incompleto", text: "A polícia prende uma pessoa ligada às fraudes do cais. O caso é encerrado como encobrimento e homicídio encenado. Dexter sabe que os horários não fecham; no relatório, os olhos amarelos viram “reflexo da iluminação”. No último registro, alguém risca o nome de Elias Voss e escreve: próximo." },
    partial: { title: "A verdade pela metade", subtitle: "Final alternativo", text: "Você expõe a manipulação de laudos, câmeras e arquivos, mas deixa a natureza do fenômeno sem resposta. Sam agradece a ajuda; Dean diz que, às vezes, sobreviver já é uma conclusão. Dexter guarda uma cópia do símbolo no envelope pessoal." },
    true: { title: "O Sangue dos Condenados", subtitle: "Final verdadeiro", text: "As evidências humanas provam que alguém preparou a cena e tentou apagar o rastro. O testemunho, o círculo interrompido e a sequência histórica apontam para algo além de um assassino comum. Sam finalmente pronuncia o nome que evitou desde o início: Azazel. Dean confirma que os olhos amarelos estão ligados à tragédia que marcou sua família. Dexter não aceita a explicação sem reservas — mas pela primeira vez, a perícia não oferece uma resposta suficiente." },
    secret: { title: "A quarta testemunha", subtitle: "Final secreto · dossiê completo", text: "Você encontra uma gravação escondida atrás do livro-caixa: a quarta testemunha não é uma pessoa, mas a própria cadeia de falsificações. O símbolo foi coberto antes da chegada da polícia; o relógio foi parado depois; o laudo foi alterado por ordem de alguém que não aparece em nenhum quadro de funcionários. Sam e Dean compartilham o que sabem sobre Azazel — e Dexter entrega a eles a cópia original, mantendo uma duplicata para provar que o inexplicável também deixa vestígios. A investigação termina, mas a parceria entre o Código e a caça está apenas começando." },
  } as const;

  if (ending) {
    const result = endingContent[ending];
    const score = Math.max(0, Math.min(100, Math.round((found.length / EVIDENCE.length) * 60 + (allInterviews ? 15 : interrogated.length * 3) + (connections.length >= 3 ? 10 : connections.length * 2) + (hints === 0 ? 10 : Math.max(0, 10 - hints * 3)) - mistakes * 4)));
    return <main className="min-h-screen bg-[#0c0d10] px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-4xl border border-red-900/70 bg-[#141317] p-6 sm:p-10"><p className="font-mono text-xs uppercase tracking-[0.3em] text-red-400">{result.subtitle}</p><h1 className="mt-4 font-display text-4xl sm:text-5xl">{result.title}</h1><p className="mt-6 text-base leading-8 text-zinc-300">{result.text}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Evidências</p><p className="mt-1 text-2xl">{found.length}/{EVIDENCE.length}</p></div><div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Entrevistas</p><p className="mt-1 text-2xl">{interrogated.length}/4</p></div><div className="border border-white/10 p-4"><p className="text-xs text-zinc-500">Pontuação estimada</p><p className="mt-1 text-2xl">{score}/100</p></div></div><button onClick={onBack} className="mt-8 min-h-12 border border-red-700 px-5 py-3 font-mono text-xs uppercase tracking-wider text-red-300 hover:bg-red-950/40"><ArrowLeft className="mr-2 inline h-4 w-4" /> Voltar à seleção de capítulos</button></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#0c0d10] text-zinc-100">
      <header className="border-b border-red-950/80 bg-[#111115] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-400">Arquivo confidencial · Caso 02</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">O Sangue dos Condenados</h1></div>
          <button onClick={onBack} className="min-h-10 border border-white/20 px-3 py-2 font-mono text-xs text-zinc-300 hover:border-red-500"><ArrowLeft className="mr-2 inline h-4 w-4" /> Menu de casos</button>
        </div>
      </header>
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
            {act === 2 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{[{id:"sam",name:"Sam Winchester",role:"Pesquisador · registros históricos",prompt:"Pergunte sobre desaparecimentos semelhantes."},{id:"dean",name:"Dean Winchester",role:"Agente federal · campo",prompt:"Pergunte sobre a presença nas docas."}].map((person) => <button key={person.id} onClick={() => interview(person.id)} disabled={interrogated.includes(person.id)} className="border border-white/10 p-4 text-left hover:border-red-500 disabled:opacity-40"><p className="font-display text-xl">{person.name}</p><p className="mt-1 text-xs text-zinc-500">{person.role}</p><p className="mt-2 text-sm text-zinc-400">{person.prompt}</p><span className="mt-3 block font-mono text-[10px] uppercase text-red-300">{interrogated.includes(person.id) ? "Depoimento registrado" : "Registrar depoimento"}</span></button>)}</div>}
            {act === 4 && <div className="mt-5 border border-amber-900/60 bg-amber-950/10 p-4"><p className="font-mono text-xs uppercase tracking-wider text-amber-300">Decisão de confiança</p><p className="mt-2 text-sm text-zinc-300">Sam pede que você preserve o símbolo; Dean quer destruir tudo antes que alguém volte. Você confia neles o bastante para dividir as provas?</p><div className="mt-3 flex flex-wrap gap-3"><button onClick={() => {setTrustWinchesters(true); setFeedback("Você entrega uma cópia das provas aos Winchester. A colaboração abre uma linha de investigação adicional.");}} className={`min-h-10 border px-4 py-2 text-sm ${trustWinchesters === true ? "border-emerald-500 bg-emerald-950/30" : "border-white/20"}`}>Confiar nos irmãos</button><button onClick={() => {setTrustWinchesters(false); setFeedback("Você mantém as provas consigo. Pode fechar o caso, mas o arquivo secreto ficará inacessível.");}} className={`min-h-10 border px-4 py-2 text-sm ${trustWinchesters === false ? "border-red-500 bg-red-950/30" : "border-white/20"}`}>Guardar só para Dexter</button></div></div>}
            {act === 5 && <div className="mt-5 border border-red-900/60 bg-red-950/10 p-4"><p className="font-mono text-xs uppercase tracking-wider text-red-300">Relatório final</p><p className="mt-2 text-sm text-zinc-300">Escolha uma conclusão. A hipótese sobrenatural só se confirma se a cadeia de provas for consistente.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button onClick={() => conclude("false")} className="border border-white/15 p-4 text-left hover:border-white/50"><span className="font-mono text-[10px] text-zinc-500">FINAL A</span><h4 className="mt-1 font-display text-xl">Explicação humana</h4><p className="mt-1 text-xs text-zinc-400">Encerrar com o que a polícia consegue provar.</p></button><button onClick={() => conclude("partial")} className="border border-white/15 p-4 text-left hover:border-amber-500"><span className="font-mono text-[10px] text-amber-300">FINAL B</span><h4 className="mt-1 font-display text-xl">Verdade pela metade</h4><p className="mt-1 text-xs text-zinc-400">Expor o encobrimento, sem concluir o inexplicável.</p></button><button onClick={() => conclude("true")} className="border border-red-700/70 p-4 text-left hover:bg-red-950/30"><span className="font-mono text-[10px] text-red-300">FINAL C</span><h4 className="mt-1 font-display text-xl">Seguir a pista sobrenatural</h4><p className="mt-1 text-xs text-zinc-400">Exige prova forense, linha histórica e testemunho.</p></button><button onClick={() => conclude("secret")} className="border border-amber-700/60 p-4 text-left hover:bg-amber-950/20"><span className="font-mono text-[10px] text-amber-300"><LockKeyhole className="mr-1 inline h-3 w-3" /> FINAL SECRETO</span><h4 className="mt-1 font-display text-xl">A quarta testemunha</h4><p className="mt-1 text-xs text-zinc-400">Todas as evidências, quatro entrevistas, três conexões corretas, confiança e nenhum erro.</p></button></div></div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-xs text-zinc-500">Evidências neste ato: {actFound}/{actEvidence.length}</p>{act < 5 && <button onClick={advance} className="min-h-11 border border-red-700 bg-red-950/30 px-5 py-3 font-mono text-xs uppercase tracking-wider text-red-200 hover:bg-red-900/40">Avançar investigação →</button>}</div>
          </section>

          {activeEvidence && <section className="mt-5 border border-red-900/60 bg-[#171418] p-5" aria-live="polite"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300">Registro de evidência</p><h3 className="mt-2 font-display text-2xl">{EVIDENCE.find((e) => e.id === activeEvidence)?.title}</h3></div><button onClick={() => setActiveEvidence(null)} className="text-xs text-zinc-500 hover:text-white">Fechar</button></div><p className="mt-3 text-sm leading-7 text-zinc-300">{EVIDENCE.find((e) => e.id === activeEvidence)?.detail}</p><p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Fonte: {EVIDENCE.find((e) => e.id === activeEvidence)?.source}</p></section>}

          <section className="mt-5 border border-white/10 bg-[#131419] p-4 sm:p-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-red-400" /><h3 className="font-display text-2xl">Interrogatórios</h3></div><p className="mt-2 text-sm text-zinc-400">Depoimentos liberados podem contradizer a versão oficial. Registre todos para abrir o final secreto.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{SUSPECTS.map((person) => <article key={person.id} className="border border-white/10 p-4"><div className="flex items-start justify-between gap-2"><div><h4 className="font-display text-xl">{person.name}</h4><p className="mt-1 text-xs text-zinc-500">{person.role}</p></div><ShieldAlert className="h-4 w-4 text-red-400" /></div><p className="mt-3 text-sm text-zinc-400">{person.clue}</p><button onClick={() => interview(person.id)} disabled={interrogated.includes(person.id)} className="mt-4 min-h-10 border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-red-500 disabled:opacity-40">{interrogated.includes(person.id) ? "Depoimento registrado" : person.question}</button></article>)}</div></section>

          <section className="mt-5 border border-white/10 bg-[#131419] p-4 sm:p-6"><div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-red-400" /><h3 className="font-display text-2xl">Quadro de conexões</h3></div><p className="mt-2 text-sm text-zinc-400">Selecione uma pessoa e uma evidência para cruzar. A conclusão sobrenatural exige mais de uma linha independente.</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Pessoas</p><div className="flex flex-wrap gap-2">{[{id:"sam",name:"Sam Winchester"},{id:"dean",name:"Dean Winchester"},{id:"vale",name:"Mara Vale"},{id:"witness",name:"Lena Ortiz"}].map((p)=><button key={p.id} onClick={()=>setSelectedPerson(p.id)} className={`border px-3 py-2 text-xs ${selectedPerson===p.id?"border-red-500 bg-red-950/40":"border-white/15"}`}>{p.name}</button>)}</div></div><div><p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Evidências catalogadas</p><div className="flex flex-wrap gap-2">{availableEvidence.filter((e)=>found.includes(e.id)).map((e)=><button key={e.id} onClick={()=>setSelectedEvidence(e.id)} className={`border px-3 py-2 text-xs ${selectedEvidence===e.id?"border-red-500 bg-red-950/40":"border-white/15"}`}>{e.title}</button>)}</div></div></div><button onClick={connect} disabled={!selectedPerson||!selectedEvidence} className="mt-4 min-h-10 border border-red-700 px-4 py-2 font-mono text-xs text-red-200 disabled:opacity-40">Registrar conexão</button>{connections.length>0&&<div className="mt-4 flex flex-wrap gap-2">{connections.map((c)=><span key={c} className="border border-emerald-900/70 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-200">{c.replace("-", " ↔ ")}</span>)}</div>}</section>
        </section>

        <aside className="space-y-4">
          <section className="border border-red-950 bg-[#131419] p-4"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Caderno de Dexter</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400">“A explicação mais simples é útil. Até que os fatos parem de caber nela.”</p><div className="mt-4 space-y-2">{ACTS.map((item,i)=><button key={item.title} onClick={()=>{if(i<=act){setAct(i as Act);setActiveEvidence(null);}}} disabled={i>act} className={`flex w-full items-center gap-3 border p-3 text-left ${i===act?"border-red-600 bg-red-950/20":"border-white/10"} disabled:opacity-30`}><span className="font-mono text-xs text-red-300">0{i+1}</span><span className="flex-1 text-sm">{item.title}</span>{i<act&&<CheckCircle2 className="h-4 w-4 text-emerald-400" />}</button>)}</div></section>
          <section className="border border-white/10 bg-[#131419] p-4"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Estado do dossiê</h2></div><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Evidências</span><span>{found.length}/{EVIDENCE.length}</span></div><div className="flex justify-between"><span className="text-zinc-500">Entrevistas</span><span>{interrogated.length}/4</span></div><div className="flex justify-between"><span className="text-zinc-500">Conexões</span><span>{connections.length}</span></div><div className="flex justify-between"><span className="text-zinc-500">Erros</span><span className={mistakes?"text-red-300":"text-emerald-300"}>{mistakes}</span></div><div className="flex justify-between"><span className="text-zinc-500">Dicas</span><span>{hints}</span></div></div><button onClick={()=>{setHints((n)=>n+1);setFeedback(act===0?"Compare o formato das gotas com a posição do relógio: a cena foi montada depois do fato.":act===1?"Os horários oficiais foram editados. Compare o laudo original, a câmera e o número do crachá.":act===2?"Sam busca um padrão entre cidades; Dean estava nas docas por um motivo que ainda não contou.":act===3?"A fotografia liga as iniciais S. W. a uma data anterior aos desaparecimentos.":act===4?"O livro-caixa prova encobrimento humano; o símbolo talvez explique o motivo de esconder o local.":"Não conclua pelo relato isolado: cruze testemunho, marca no concreto e linha histórica.");}} className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 border border-amber-900/60 px-3 py-2 font-mono text-xs text-amber-200 hover:bg-amber-950/20"><Sparkles className="h-4 w-4" /> Pedir dica (reduz pontuação)</button></section>
          <section className="border border-white/10 bg-[#131419] p-4"><div className="flex items-center gap-2"><Skull className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Pensamentos</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400" aria-live="polite">{feedback}</p><p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-zinc-600">O nome de Azazel não aparece nos arquivos iniciais. A ligação com os Winchester só ganha força quando a cadeia de evidências estiver quase completa.</p></section>
          <section className="border border-white/10 bg-[#131419] p-4"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-red-400" /><h2 className="font-display text-xl">Arquivo secreto</h2></div><p className="mt-2 text-sm text-zinc-400">{secretReady?"Condições reunidas. A quarta testemunha está disponível no relatório final.":"Requer 14 evidências, 4 entrevistas, conexões familiares e financeiras, confiança nos Winchester e zero erros."}</p></section>
        </aside>
      </div>
    </main>
  );
}
