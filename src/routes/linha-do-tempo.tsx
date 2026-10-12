import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, LockKeyhole, LockKeyholeOpen, Search, Clock3 } from "lucide-react";

type DiarySource = { id: string; title: string; attribution: string; pages: string; note: string };
type TimelineEntry = { id: string; date: string; year: number; sourceId: string; heading: string; summary: string; page: string; certainty: string };

const SOURCES: DiarySource[] = [
  { id: "diario-007", title: "DIARIO-007", attribution: "Atribuição provisória: Matthew Brooks", pages: "PDF pp. 28–32", note: "A identificação do autor vem da indicação visual no caderno; confirmar na imagem original." },
  { id: "trisha-1995", title: "Diário atribuído a Trisha Roberts", attribution: "Autoria provisória", pages: "PDF pp. 33–34", note: "As suspeitas registradas pertencem à narradora e não constituem prova." },
  { id: "scott-brooks", title: "Diário de Scott Brooks", attribution: "Atribuição conforme o caderno", pages: "PDF pp. 35–40", note: "Entradas sobre sua infância, relação com Matthew e aproximação de Trisha." },
  { id: "scott-later", title: "Diário de Scott · 1993–1995", attribution: "Scott Brooks (conforme a seleção do caderno)", pages: "PDF pp. 41–57", note: "Inclui a busca pela origem de Scott e o relato de Andrew sobre Sofia. Relatos indiretos não equivalem a prova independente." },
  { id: "trisha-early", title: "Diário de Trisha · 1988–1994", attribution: "Trisha Roberts (conforme a seleção do caderno)", pages: "PDF pp. 63–72", note: "Entradas sobre infância, relação com Scott e oposição da família. Perguntas sobre salas secretas não confirmam que elas existam." },
  { id: "vivian-roberts", title: "Diário de Vivian Roberts", attribution: "Vivian Roberts (conforme a seleção do caderno)", pages: "PDF pp. 73–77", note: "Registros sobre Charles, a família e eventos beneficentes; algumas capturas têm OCR incompleto." },
  { id: "wanda-tyler", title: "Diário de Wanda Tyler", attribution: "Wanda Tyler (conforme a seleção do caderno)", pages: "PDF pp. 78–79", note: "Contém opiniões pessoais sobre Sofia e relatos da internação de Vivian; opiniões não são provas." },
  { id: "dorothy-patterson", title: "Diário de Dorothy Patterson", attribution: "Dorothy Patterson (conforme a seleção do caderno)", pages: "PDF pp. 112–114", note: "Registros de 1973–1975 sobre Sofia, Matthew e Charles. Datas e trechos precisam de conferência visual." },
  { id: "moss-investigation", title: "Notas da investigação de Steven Moss", attribution: "Steven Moss / fontes relacionadas; atribuição por página", pages: "PDF pp. 58, 61–62, 100, 110–111", note: "Mistura notas, fichas e relatos sobre a investigação; cada afirmação mantém sua proveniência." },
  { id: "press-records", title: "Notícias e relatório policial", attribution: "Imprensa local e Departamento do Xerife", pages: "PDF pp. 82–90", note: "Inclui alegações públicas e relatório policial; suspeita contra Scott não é prova de culpa." },
  { id: "letters-medical", title: "Cartas e documentos médicos", attribution: "Vários autores; ver documento individual", pages: "PDF pp. 91–104", note: "Cartas, laudos e documentos sobre Sofia, Scott, Vivian e a família Roberts. Algumas autorias permanecem provisórias." },
  { id: "records-mansion", title: "Registros de enfermagem, segurança e pousada", attribution: "Autores variados / alguns não identificados", pages: "PDF pp. 105–109, 115–116", note: "Registros de rotina, observações e relatos. Anotações incompletas não devem ser tratadas como conclusões." },
];

const ENTRIES: TimelineEntry[] = [
  { id: "e-1975-09-16", date: "1975-09-16", year: 1975, sourceId: "diario-007", heading: "Despedida da estadia", summary: "O narrador escreve que retornará para casa no dia seguinte e sentirá falta das pessoas que conheceu.", page: "31", certainty: "Relato do diário; autoria provisória" },
  { id: "e-1975-09-19", date: "1975-09-19", year: 1975, sourceId: "diario-007", heading: "Sofia teria deixado Painscreek", summary: "Padre Calvin informa que Sofia partiu. O narrador questiona se ela foi forçada a sair ou se escondia algo.", page: "31", certainty: "Informação recebida pelo narrador; motivo desconhecido" },
  { id: "e-1975-12-29", date: "1975-12-29", year: 1975, sourceId: "diario-007", heading: "Destino de Sofia desconhecido", summary: "Meses depois, ninguém sabe para onde Sofia foi. Padre Calvin aconselha o narrador a deixar o assunto para trás.", page: "32", certainty: "Destino e motivo da partida não esclarecidos" },
  { id: "e-1985-04-06", date: "1985-04-06", year: 1985, sourceId: "scott-brooks", heading: "Scott deixa o orfanato", summary: "Padre Matthew busca Scott e oferece acolhê-lo. A entrada relata a assinatura de um documento e a adoção do nome Scott Brooks.", page: "35", certainty: "Relato do diário; conferir grafia do nome na imagem" },
  { id: "e-1985-05-03", date: "1985-05-03", year: 1985, sourceId: "scott-brooks", heading: "O sótão e o avião de madeira", summary: "Matthew mostra a Scott seus brinquedos de madeira e oferece ensiná-lo a trabalhar com madeira quando for mais velho.", page: "36", certainty: "Relato do diário; não estabelece outros segredos no sótão" },
  { id: "e-1985-06-06", date: "1985-06-06", year: 1985, sourceId: "scott-brooks", heading: "Hostilidade dos outros meninos", summary: "Scott relata insultos e diz não entender o significado de uma das ofensas dirigidas a ele.", page: "36", certainty: "Relato pessoal" },
  { id: "e-1985-06-23", date: "1985-06-23", year: 1985, sourceId: "scott-brooks", heading: "Matthew cuida dos ferimentos", summary: "Depois de Scott ser atingido por pedras, Matthew limpa seus machucados e o aconselha a perdoar os outros meninos.", page: "37", certainty: "Relato pessoal; não identifica quem jogou as pedras" },
  { id: "e-1985-07-12", date: "1985-07-12", year: 1985, sourceId: "scott-brooks", heading: "Scott admira Charles", summary: "Trisha defende Scott. Ele expressa o desejo de ser como Charles Roberts para não voltar a ser intimidado.", page: "37", certainty: "Relato pessoal" },
  { id: "e-1985-09-15", date: "1985-09-15", year: 1985, sourceId: "scott-brooks", heading: "A ideia de um presente para Derrick", summary: "Scott descreve Derrick como protetor de Trisha e bom desenhista; considera construir um carrinho de madeira para o aniversário dele.", page: "38", certainty: "Relato pessoal" },
  { id: "e-1990-02-18", date: "1990-02-18", year: 1990, sourceId: "scott-brooks", heading: "Funeral do Sr. Peterson", summary: "Scott relata o funeral do Sr. Peterson, de 81 anos, e teme que a cidade perca moradores à medida que os jovens não retornam.", page: "38", certainty: "Relato do diário" },
  { id: "e-1990-04-22", date: "1990-04-22", year: 1990, sourceId: "scott-brooks", heading: "Sentimentos por Trisha", summary: "Scott escreve que tem conversado bastante com Trisha, sente-se confortável com ela e questiona se está apaixonado.", page: "39", certainty: "Sentimentos do próprio narrador" },
  { id: "e-1990-05-14", date: "1990-05-14", year: 1990, sourceId: "scott-brooks", heading: "Conselho sobre objetivos de vida", summary: "Scott reflete sobre os objetivos de vida que Matthew recomenda ter.", page: "39", certainty: "Reflexão pessoal; não estabelece um acontecimento criminal" },
  { id: "e-1990-05-18", date: "1990-05-18", year: 1990, sourceId: "scott-brooks", heading: "Derrick consegue trabalho como motorista", summary: "Scott sente inveja de Derrick, que foi contratado como motorista pelo pai de Trisha e viaja pelo mundo.", page: "40", certainty: "Relato do diário; não indica envolvimento em crime" },
  { id: "e-1990-05-20", date: "1990-05-20", year: 1990, sourceId: "scott-brooks", heading: "Pergunta sobre uma sala secreta", summary: "Scott pergunta se existe uma sala secreta na mansão e diz que gostaria de explorá-la com Trisha.", page: "40", certainty: "Curiosidade registrada; a entrada não confirma que a sala exista" },
  { id: "e-1995-05-13", date: "1995-05-13", year: 1995, sourceId: "trisha-1995", heading: "Suspeitas sobre a morte de Sofia", summary: "A narradora relata uma visita a Scott e passa a suspeitar que Sofia foi morta. Ela questiona se várias pessoas poderiam estar envolvidas.", page: "33", certainty: "Suspeita da narradora, não prova" },
  { id: "e-1995-05-28", date: "1995-05-28", year: 1995, sourceId: "trisha-1995", heading: "Visita ao túmulo de Sofia", summary: "A narradora visita o túmulo de Sofia, descrito como uma cruz de madeira com seu nome, e deixa flores.", page: "33", certainty: "Descrição do diário; confirmar visualmente na fonte" },
  { id: "e-1995-06-04", date: "1995-06-04", year: 1995, sourceId: "trisha-1995", heading: "Encontro durante a missa", summary: "A narradora vê Vivian e Henry na missa e registra sua suspeita de que eles talvez tenham matado Sofia.", page: "34", certainty: "Suspeita expressa pela narradora, não prova" },
  { id: "e-1995-06-06", date: "1995-06-06", year: 1995, sourceId: "trisha-1995", heading: "A intenção de falar com Andrew", summary: "A narradora escreve que precisa conversar com Andrew e tentar obter uma confissão.", page: "34", certainty: "Intenção registrada; nenhuma confissão é reproduzida neste trecho" },
  { id: "e-1993-06-22", date: "1993-06-22", year: 1993, sourceId: "scott-later", heading: "Scott confronta Matthew sobre seu passado", summary: "Scott relata uma briga com Matthew e pergunta se ele sabe quem são seus pais biológicos. Matthew não esclarece a questão.", page: "42", certainty: "Relato de Scott; resposta não esclarecida" },
  { id: "e-1993-09-02", date: "1993-09-02", year: 1993, sourceId: "scott-later", heading: "Scott deixa a igreja e vai para a cabana", summary: "Charles permite que Scott fique na cabana e trabalhe como ajudante de jardinagem.", page: "43", certainty: "Relato do diário" },
  { id: "e-1993-11-20", date: "1993-11-20", year: 1993, sourceId: "scott-later", heading: "Andrew repete o nome Sofia", summary: "Bêbado, Andrew murmura “Sinto muito, Sofia”. Scott passa a procurar informações sobre ela.", page: "45", certainty: "Observação de Scott; motivo desconhecido" },
  { id: "e-1993-12-18", date: "1993-12-18", year: 1993, sourceId: "scott-later", heading: "Dorothy fala sobre Sofia", summary: "Dorothy diz que Sofia era sua amiga e que teve um caso com Charles enquanto Vivian estava internada; afirma que Sofia deixou Painscreek e nunca mais foi vista.", page: "48", certainty: "Relato de Dorothy; destino de Sofia não confirmado" },
  { id: "e-1994-09-28", date: "1994-09-28", year: 1994, sourceId: "scott-later", heading: "Andrew conta sua versão sobre Sofia", summary: "Andrew afirma que Sofia morreu após cair em um poço durante um confronto com Vivian e Henry Johnson em 26/06/1975; diz que Vivian pediu que ele ocultasse o corpo e o bebê, chamado Vincent.", page: "54", certainty: "Relato indireto de Andrew reproduzido por Scott; exige corroboração independente" },
  { id: "e-1995-02-13-scott", date: "1995-02-13", year: 1995, sourceId: "scott-later", heading: "Scott acredita reconhecer sua origem", summary: "Ao ver uma fotografia e reconhecer o cobertor, Scott conclui que é o bebê ligado a Sofia e Charles. A conclusão é dele e deve ser confrontada com outros documentos.", page: "55", certainty: "Conclusão pessoal, ainda não confirmação documental completa" },
  { id: "e-1995-04-04", date: "1995-04-04", year: 1995, sourceId: "scott-later", heading: "Scott encontra o corpo que acredita ser de sua mãe", summary: "Scott encontra o poço seco e coberto de lama e encontra o corpo. Diz que o enterrou no cemitério ao lado do padre Calvin, sob uma cruz de madeira.", page: "56", certainty: "Relato de Scott; identidade do corpo depende da fonte" },
  { id: "e-1995-04-13", date: "1995-04-13", year: 1995, sourceId: "scott-later", heading: "Andrew indica o local do corpo", summary: "Andrew vai à cabana, diz onde o corpo foi escondido, pede desculpas e vai embora. A entrada está datada depois da entrada de 04/04; preservar a ordem original do caderno.", page: "56", certainty: "Relato de Scott; sequência cronológica interna inconsistente" },
  { id: "e-1995-05-03-scott", date: "1995-05-03", year: 1995, sourceId: "scott-later", heading: "Scott conta a Matthew o que descobriu", summary: "Scott revela que acredita que Charles é seu pai e que Trisha é sua meia-irmã. Matthew escuta em silêncio.", page: "57", certainty: "Relato de Scott; inferência de parentesco a confrontar com documentos" },
  { id: "e-1988-11-13", date: "1988-11-13", year: 1988, sourceId: "trisha-early", heading: "Trisha observa o bullying contra Scott", summary: "Trisha descreve Scott como quieto e questiona por que os outros meninos o intimidam e por que os pais dele não o quiseram.", page: "63", certainty: "Relato pessoal" },
  { id: "e-1993-03-26", date: "1993-03-26", year: 1993, sourceId: "trisha-early", heading: "Trisha se sente à vontade com Scott", summary: "Trisha escreve que Scott não a julga e que os dois começam a organizar um esconderijo para se encontrar em segredo.", page: "65", certainty: "Relato pessoal" },
  { id: "e-1994-05-22", date: "1994-05-22", year: 1994, sourceId: "trisha-early", heading: "A família se opõe ao relacionamento", summary: "Trisha questiona a oposição da mãe ao relacionamento com Scott e se pergunta se Matthew também está impedindo os encontros.", page: "69", certainty: "Percepção de Trisha; motivo dos outros não confirmado" },
  { id: "e-1994-11-22", date: "1994-11-22", year: 1994, sourceId: "trisha-early", heading: "Trisha suspeita de uma sala secreta na cabana", summary: "Trisha tenta surpreender Scott, não o encontra e depois o vê aparecer de repente. Ela pergunta se há uma sala secreta, mas não confirma que exista.", page: "72", certainty: "Pergunta da narradora, não evidência de uma sala" },
  { id: "e-1972-06-30", date: "1972-06-30", year: 1972, sourceId: "vivian-roberts", heading: "Vivian e Charles comemoram o aniversário", summary: "Vivian descreve um jantar e uma caminhada pela praia com Charles, recordando um período de proximidade entre os dois.", page: "73", certainty: "Relato pessoal de Vivian" },
  { id: "e-1974-08-22", date: "1974-08-22", year: 1974, sourceId: "wanda-tyler", heading: "Vivian passa por reabilitação", summary: "Wanda diz que Vivian está internada por instabilidade mental e foi pedido que Wanda cuide dela. Wanda também relata a pressão de Magdalene por um herdeiro homem.", page: "78", certainty: "Relato de Wanda; motivo médico deve ser conferido no laudo" },
  { id: "e-1973-09-24", date: "1973-09-24", year: 1973, sourceId: "dorothy-patterson", heading: "Sofia pergunta como é ser amada", summary: "Sofia diz a Dorothy que é difícil imaginar o que significa ser amada porque não tem pais. Dorothy decide se esforçar para cuidar melhor dela.", page: "112", certainty: "Relato atribuído a Dorothy; transcrição parcial" },
  { id: "e-1975-02-02", date: "1975-02-02", year: 1975, sourceId: "dorothy-patterson", heading: "Charles pede que Dorothy cuide de Sofia", summary: "Charles oferece pagar as despesas de uma casa perto da mansão e pede que Dorothy mantenha segredo sobre o plano envolvendo Sofia.", page: "113", certainty: "Relato atribuído a Dorothy; data exata a confirmar" },
  { id: "e-1993-02-17", date: "1993-02-17", year: 1993, sourceId: "moss-investigation", heading: "Investigador relata possível desvio de fundos", summary: "Nelson & Brown afirma que Henry Johnson transferia US$ 9.990 por mês para uma conta offshore e que faltavam suprimentos e equipamentos. É uma alegação investigativa que exige corroboradores.", page: "97", certainty: "Relatório privado; alegação não é prova conclusiva" },
  { id: "e-1995-vivian-found", date: "1995-07-19", year: 1995, sourceId: "press-records", heading: "Vivian é encontrada morta", summary: "A notícia diz que Mary Martinez encontrou Vivian diante da casa às 7h15; a janela estimada da morte vai da noite anterior até 1h. Conferir a data exata da manchete antes de fixá-la na cronologia.", page: "82", certainty: "Notícia; data exata do cabeçalho deve ser conferida" },
  { id: "e-1995-scott-suspect", date: "1995-07-20", year: 1995, sourceId: "press-records", heading: "Scott torna-se o principal suspeito", summary: "Uma testemunha anônima diz ter visto Scott afastando-se da mansão; o relatório policial também menciona uma discussão observada por caçadores, longe demais para ouvir o conteúdo.", page: "83, 90", certainty: "Alegações de testemunhas e suspeita policial; não comprovam culpa" },
  { id: "e-1995-henry-found", date: "1995-07-12", year: 1995, sourceId: "press-records", heading: "Henry Johnson é encontrado em carro submerso", summary: "Uma notícia relata que o carro de Henry foi encontrado no Lago Cherry Creek e estima que o corpo esteve submerso por 10–15 dias. Não há conclusão de homicídio no recorte.", page: "85", certainty: "Notícia; circunstâncias e causa da morte não resolvidas aqui" },
  { id: "e-1995-andrew-fire", date: "1995-06-07", year: 1995, sourceId: "press-records", heading: "Andrew Reed morre em incêndio", summary: "A notícia informa que Andrew foi encontrado morto após um incêndio em sua casa; a causa ainda não havia sido determinada.", page: "87", certainty: "Notícia; acidente ou crime não concluídos" },
  { id: "e-1996-hospital-close", date: "1996-02-02", year: 1996, sourceId: "press-records", heading: "Hospital Comunitário fecha", summary: "A imprensa relata o fechamento do hospital após 60 anos e cita o declínio populacional e suspeitas de desvio de fundos.", page: "84", certainty: "Notícia; motivo é apresentado como suspeita" },
  { id: "e-1997-moss-hired", date: "1997-03-13", year: 1997, sourceId: "moss-investigation", heading: "Detetive particular é contratado", summary: "Uma carta anônima contrata Steven Moss para reexaminar a morte de Vivian e informa que Scott foi solto por falta de evidência suficiente e que o caso foi arquivado como não solucionado.", page: "100", certainty: "Carta anônima; identidade do remetente desconhecida" },
  { id: "e-1994-security-intruder", date: "1994-03-18", year: 1994, sourceId: "records-mansion", heading: "Intruso entra no jardim da mansão", summary: "O livro de segurança registra um homem encapuzado que pulou a cerca e o muro; a câmera não captou o rosto e Charles pediu mais câmeras.", page: "106", certainty: "Registro de segurança; identidade do homem desconhecida" },
  { id: "e-1994-stephanie", date: "1994-10-31", year: 1994, sourceId: "records-mansion", heading: "Menina desaparecida retorna com ajuda de uma mulher", summary: "Um registro da pousada relata que Stephanie, de seis anos, voltou após se perder e descreveu uma mulher de cabelo preto comprido e vestido preto. A identidade da mulher não é confirmada.", page: "109", certainty: "Relato registrado; identidade não confirmada" },
];

export const Route = createFileRoute("/linha-do-tempo")({ component: TimelinePage });

function TimelinePage() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("todos");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("vivian-found-diaries-v1") || "[]");
      if (Array.isArray(saved)) setUnlocked(saved.filter((id): id is string => typeof id === "string" && SOURCES.some((source) => source.id === id)));
    } catch { setUnlocked([]); }
  }, []);

  const setFound = (sourceId: string, found: boolean) => {
    setUnlocked((current) => {
      const next = found ? Array.from(new Set([...current, sourceId])) : current.filter((id) => id !== sourceId);
      window.localStorage.setItem("vivian-found-diaries-v1", JSON.stringify(next));
      return next;
    });
  };

  const visibleEntries = useMemo(() => ENTRIES.filter((entry) => {
    const source = SOURCES.find((item) => item.id === entry.sourceId)!;
    return (unlocked.includes(entry.sourceId)) &&
      (year === "todos" || String(entry.year) === year) &&
      (entry.heading + " " + entry.summary + " " + source.title).toLowerCase().includes(query.toLowerCase());
  }), [unlocked, query, year]);

  const years = Array.from(new Set(ENTRIES.map((entry) => String(entry.year)))).sort();
  const foundCount = SOURCES.filter((source) => unlocked.includes(source.id)).length;

  return (
    <main className="min-h-screen bg-[#11110e] px-4 py-6 text-[#eee9df] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#c4a779]">Dexter Revival Project · Caderno de investigação</p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">Linha do tempo</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">Os acontecimentos só aparecem depois que o diário de origem é encontrado e registrado como coletado.</p>
          </div>
          <Link to="/" onClick={() => { try { window.sessionStorage.setItem("dexter-return-to-vivian-case", "true"); } catch {} }} className="inline-flex min-h-10 items-center gap-2 border border-[#5c5143] px-3 py-2 text-xs uppercase tracking-wider hover:border-[#c4a779]"><ArrowLeft size={15}/> Voltar ao caso</Link>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">Diários encontrados</p><p className="mt-2 text-3xl">{foundCount} / {SOURCES.length}</p></div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">Eventos revelados</p><p className="mt-2 text-3xl">{visibleEntries.length} / {ENTRIES.length}</p></div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-[#bdb5a8]">Registro de progresso</p><p className="mt-2 text-sm">Salvo neste navegador</p></div>
        </section>

        <section className="mt-7">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-[#c4a779]">Diários e fontes</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {SOURCES.map((source) => {
              const found = unlocked.includes(source.id);
              return <article key={source.id} className="border border-[#4b4439] bg-[#1b1a17] p-4">
                <div className="flex items-start gap-3"><BookOpen className="mt-1 shrink-0 text-[#c4a779]" size={18}/><div><h3 className="font-semibold">{source.title}</h3><p className="mt-1 text-xs text-[#bdb5a8]">{source.attribution}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#9e967f]">{source.pages}</p></div></div>
                <p className="mt-3 text-xs leading-relaxed text-[#bdb5a8]">{source.note}</p>
                <button type="button" onClick={() => setFound(source.id, !found)} className={"mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider " + (found ? "border-emerald-700/70 bg-emerald-950/30 text-emerald-200" : "border-[#7d6b4e] text-[#e7d4b0] hover:bg-[#c4a779]/10")}>
                  {found ? <><LockKeyholeOpen size={14}/> Encontrado · bloquear novamente</> : <><LockKeyhole size={14}/> Registrar como encontrado</>}
                </button>
              </article>;
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-mono text-xs uppercase tracking-widest text-[#c4a779]">Acontecimentos documentados</h2><span className="text-xs text-[#bdb5a8]">Ordenados por data</span></div>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="flex min-h-10 items-center gap-2 border border-[#4b4439] bg-[#1b1a17] px-3"><Search size={15} className="text-[#c4a779]"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar evento..." className="w-52 bg-transparent text-sm outline-none placeholder:text-[#81796d]"/></label>
            <select value={year} onChange={(event) => setYear(event.target.value)} className="min-h-10 border border-[#4b4439] bg-[#1b1a17] px-3 text-sm"><option value="todos">Todos os anos</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </div>
          {visibleEntries.length === 0 ? <div className="mt-4 border border-dashed border-[#4b4439] bg-[#171613] p-8 text-center"><LockKeyhole className="mx-auto text-[#c4a779]" size={25}/><p className="mt-3 font-semibold">Nenhum acontecimento desbloqueado</p><p className="mt-2 text-sm text-[#bdb5a8]">Encontre um dos diários acima e use “Registrar como encontrado”. Os eventos desse diário aparecerão aqui.</p></div> : <div className="mt-5 space-y-3">{visibleEntries.slice().sort((a,b) => a.date.localeCompare(b.date)).map((entry) => {
            const source = SOURCES.find((item) => item.id === entry.sourceId)!;
            return <article key={entry.id} className="grid gap-3 border border-[#4b4439] bg-[#1b1a17] p-4 sm:grid-cols-[130px_minmax(0,1fr)]">
              <div className="font-mono text-xs text-[#c4a779]"><Clock3 size={14} className="mb-2"/>{entry.date.split("-").reverse().join("/")}</div>
              <div><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-lg font-semibold">{entry.heading}</h3><span className="border border-[#4b4439] px-2 py-1 font-mono text-[10px] text-[#bdb5a8]">{source.title} · p. {entry.page}</span></div><p className="mt-2 text-sm leading-relaxed text-[#d1c9bc]">{entry.summary}</p><p className="mt-3 text-xs text-[#a39a89]">Status da fonte: {entry.certainty}</p></div>
            </article>;
          })}</div>}
        </section>
        <p className="mt-8 border-t border-[#4b4439] pt-4 text-xs leading-relaxed text-[#81796d]">Nota de fidelidade: os cartões são resumos documentais, não transcrições literais dos diários. Trechos de diálogo ou texto original serão adicionados apenas após conferência visual do PDF. O registro de encontrado é manual nesta versão; será ligado à interação de coleta no jogo quando essa mecânica existir.</p>
      </div>
    </main>
  );
}
