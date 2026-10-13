import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  FileSearch,
  MapPin,
  Users,
  X,
  ClipboardList,
  Network,
  Clock3,
} from "lucide-react";
import { VivianInvestigationGame } from "./VivianInvestigationGame";

type ReviewStatus = "pendente" | "confirmado" | "contradicao";
type Person = { id: string; name: string; role: string; note: string; status: ReviewStatus };
type Place = { id: string; name: string; group: string; description: string; status: ReviewStatus };
type DocumentItem = {
  id: string;
  title: string;
  type: string;
  location: string;
  status: ReviewStatus;
  body: string;
};

const PEOPLE: Person[] = [
  {
    id: "vivian",
    name: "Vivian Roberts",
    role: "Vítima central do caso",
    note: "Fontes: pp. 82, 94 e 100. Laudo: esposa de Charles; notícia relata sua morte; carta anônima chama o caso de assassinato.",
    status: "confirmado",
  },
  {
    id: "charles",
    name: "Charles Roberts",
    role: "Marido de Vivian · ex-prefeito (segundo notícia)",
    note: "Fontes: pp. 6–7, 18, 82 e 92. Relações familiares e candidatura aparecem em diário/carta; opiniões são atribuídas.",
    status: "confirmado",
  },
  {
    id: "magdalene",
    name: "Magdalene Roberts",
    role: "Mãe de Charles (cruzamento documental)",
    note: "Fontes: pp. 74, 78 e 93–94. O parentesco resulta do cruzamento entre carta e laudo; outras afirmações são relatos.",
    status: "confirmado",
  },
  {
    id: "trisha",
    name: "Trisha Roberts",
    role: "Filha de Vivian e Charles · diário pessoal",
    note: "Fontes: pp. 18, 63, 65, 69 e 71. O diário registra a relação com Scott; rumores permanecem atribuídos.",
    status: "confirmado",
  },
  {
    id: "bernard",
    name: "Bernard Hopkins",
    role: "Mordomo (ficha funcional)",
    note: "Fontes: pp. 3–5 e 95. A ficha funcional o identifica como mordomo; a nota investigativa da p. 61 é outro documento e não prova envolvimento.",
    status: "confirmado",
  },
  {
    id: "dorothy",
    name: "Dorothy Patterson",
    role: "Funcionária da mansão · cargo exato não confirmado",
    note: "Fontes: pp. 96 e 113–114. A carta relata mais de vinte anos de serviço; diários documentam tarefas específicas, sem confirmar o cargo de governanta.",
    status: "confirmado",
  },
  {
    id: "derrick",
    name: "Derrick Tyler",
    role: "Motorista da família Roberts",
    note: "Fontes: pp. 8–9 e 18. É identificado como motorista; os relatos de convivência com Scott e Trisha vêm de diários.",
    status: "confirmado",
  },
  {
    id: "sofia",
    name: "Sofia (sobrenome não confirmado)",
    role: "Pessoa mencionada · destino em disputa",
    note: "Fontes: pp. 2–3, 51, 54, 75 e 93. Há relatos de que partiu de Painscreek e de que morreu; sobrenome e destino não estão resolvidos.",
    status: "contradicao",
  },
  {
    id: "scott",
    name: "Scott Brooks",
    role: "Filho adotivo de Matthew (relato de Rachel)",
    note: "Fontes: pp. 70–71, 99 e 104. A adoção é relatada por Rachel; a possível identidade com Vincent continua sem prova conclusiva.",
    status: "contradicao",
  },
  {
    id: "matthew",
    name: "Padre Matthew Brooks",
    role: "Padre da Igreja da Trindade",
    note: "Fontes: pp. 83, 99, 101–102 e 112. A adoção de Scott é relatada por Rachel; sobrenome e papel sacerdotal aparecem em fontes distintas.",
    status: "confirmado",
  },
  {
    id: "andrew",
    name: "Andrew Reed",
    role: "Funcionário da família Roberts",
    note: "Fontes: pp. 1–2 e 87. O jornal o descreve como jardineiro e faz-tudo; a matéria não determina a causa do incêndio.",
    status: "confirmado",
  },
  {
    id: "henry",
    name: "Dr. Henry Johnson",
    role: "Médico do Painscreek Community Hospital",
    note: "Fontes: pp. 94 e 97. O laudo confirma o vínculo médico; o suposto desvio de fundos é acusação atribuída à firma investigadora.",
    status: "confirmado",
  },
  {
    id: "moss",
    name: "Steven Moss",
    role: "Detetive particular (carta anônima)",
    note: "Fontes: pp. 100 e 110–111. Carta anônima é endereçada ao detetive; a avaliação de sua confiabilidade não é confirmação independente.",
    status: "confirmado",
  },
  {
    id: "james",
    name: "James Howard",
    role: "Xerife de Painscreek",
    note: "Fontes: pp. 82 e 89–90. É identificado como xerife; a carta de 1998 registra sua transferência para Grand County.",
    status: "confirmado",
  },
  {
    id: "wanda",
    name: "Wanda Tyler",
    role: "Autora de diário · vínculo com Derrick relatado",
    note: "Fontes: pp. 78–80. Há diários sob seu nome; o vínculo com Derrick e as opiniões sobre Sofia são relatos atribuídos.",
    status: "confirmado",
  },
  {
    id: "mary",
    name: "Mary Martinez",
    role: "Funcionária da mansão (segundo notícia)",
    note: "Fontes: pp. 22–27 e 82. Diário identificado; a notícia a descreve como funcionária e relata que encontrou Vivian; residência não confirmada.",
    status: "confirmado",
  },
  {
    id: "oliver",
    name: "Oliver (sobrenome não confirmado)",
    role: "Fotografia (relatos; nome incompleto)",
    note: "Fontes: pp. 67, 76 e 102. Há menções a um Oliver como professor/fotógrafo; “Gibson” e uma loja de fotografia não foram confirmados.",
    status: "confirmado",
  },
  {
    id: "rachel",
    name: "Irmã Rachel Davis",
    role: "Religiosa do Orfanato São Patrício",
    note: "Fonte: p. 99. A carta a Scott está assinada por Irmã Rachel Davis; as lembranças sobre ele continuam atribuídas à autora.",
    status: "confirmado",
  },
  {
    id: "calvin",
    name: "Padre Calvin",
    role: "Padre mencionado nos relatos",
    note: "Fontes: pp. 14, 28–32, 44, 56 e 93. As fontes o chamam de “padre Calvin”; o sobrenome Bennett não foi confirmado.",
    status: "confirmado",
  },
  {
    id: "sylvia",
    name: "Sylvia",
    role: "Carta atribuída a Sylvia pela interface",
    note: "Fonte: p. 93. O título da interface atribui a carta a Sylvia; não há assinatura visível no trecho e o conteúdo é relato.",
    status: "confirmado",
  },
  {
    id: "hannah",
    name: "Hannah",
    role: "Identidade não confirmada nos documentos revisados",
    note: "Revisão pendente: não foi localizada identificação primária suficiente na transcrição fornecida; aguarda documento original que a nomeie.",
    status: "pendente",
  },
  {
    id: "nicole",
    name: "Nicole",
    role: "Identidade não confirmada nos documentos revisados",
    note: "Revisão pendente: não foi localizada identificação primária suficiente na transcrição fornecida; aguarda documento original que a nomeie.",
    status: "pendente",
  },
  {
    id: "katherine",
    name: "Katherine",
    role: "Pessoa citada em registro de enfermagem",
    note: "Fonte: p. 105. O registro diz que Katherine telefonou relatando doença; profissão de enfermeira e sobrenome não foram confirmados.",
    status: "confirmado",
  },
  {
    id: "daniel",
    name: "Daniel",
    role: "Destinatário de carta · mencionado em diário",
    note: "Fontes: pp. 91 e 116. Remetente não identificado o chama de “meu filho”; Dorothy o viu com Laura, sem provar relação com Andrew.",
    status: "confirmado",
  },
];

const PERSON_SUMMARIES: Record<string, string> = {
  vivian:
    "O laudo hospitalar a identifica como esposa de Charles. A notícia relata que ela foi encontrada morta; uma carta anônima chama o caso de assassinato, sem identificar autor.",
  charles:
    "Diários e documentos identificam Charles como marido de Vivian e pai de Trisha; uma notícia o chama de ex-prefeito. Suas interpretações pessoais permanecem atribuídas a ele.",
  magdalene:
    "Uma carta identifica Magdalene Roberts como mãe de Charles; diários e um laudo registram relatos sobre a expectativa de um herdeiro, sem formar uma biografia completa.",
  trisha:
    "Registros identificam Trisha como filha de Vivian e Charles; em seu diário, ela relata seus encontros com Scott e o desejo de manter a relação em segredo.",
  bernard:
    "A ficha funcional identifica Bernard Hopkins como mordomo e descreve responsabilidades na casa; as observações de seu caderno são relatos pessoais, não prova de culpa.",
  dorothy:
    "Em carta a Charles, Dorothy relata mais de vinte anos de serviço; em seu diário, registra que ajudou a cuidar de Sofia durante a gravidez.",
  derrick:
    "Derrick Tyler é identificado como motorista da família Roberts; em seu diário, relata convivência com Scott Brooks e Trisha Roberts.",
  sofia:
    "Os documentos mencionam Sofia, mas não confirmam o sobrenome “Miller”. Relatos divergem entre sua partida de Painscreek e sua morte; o destino permanece incerto.",
  scott:
    "Irmã Rachel relata que Matthew adotou Scott. A possível identificação de Scott com Vincent permanece em aberto e não é apresentada como fato.",
  matthew:
    "Matthew Brooks é identificado como padre da Igreja da Trindade; em carta, Irmã Rachel relata que ele adotou Scott.",
  andrew:
    "O caderno está associado ao nome Andrew Reed; uma notícia o descreve como jardineiro e faz-tudo da família Roberts e relata sua morte após um incêndio cuja causa não estava determinada.",
  henry:
    "Dr. Henry Johnson assina um laudo médico do hospital sobre Vivian; a acusação financeira da p. 97 é atribuída a investigadores e não aparece como fato comprovado.",
  moss: "Uma carta anônima endereçada ao detetive particular Steven Moss solicita uma investigação sobre a morte de Vivian Roberts; a remetente não é identificada.",
  james:
    "James Howard é identificado como xerife de Painscreek; relatório oficial e carta de transferência documentam seu cargo e sua realocação em 1998.",
  wanda:
    "Diários identificados como de Wanda Tyler registram sua relação com Derrick e seus cuidados com Vivian; suas opiniões sobre Sofia não são fatos independentes.",
  mary: "O diário identifica Mary Martinez; uma notícia a descreve como funcionária da mansão e relata que encontrou Vivian e chamou a emergência.",
  oliver:
    "Os documentos mencionam um Oliver como professor de fotografia de Trisha e fotógrafo de eventos; o sobrenome Gibson e vínculo com uma loja não foram confirmados.",
  rachel:
    "Irmã Rachel Davis assina uma carta do Orfanato São Patrício a Scott e relata que Matthew o adotou; esse trecho é o relato da própria autora.",
  calvin:
    "Os documentos mencionam um “padre Calvin” em relatos de Mary, Matthew e Scott; as páginas consultadas não confirmam o sobrenome Bennett.",
  sylvia:
    "A interface intitula o documento da p. 93 “Carta de confissão de Sylvia”; a página não mostra assinatura visível, e o título não valida as alegações narradas.",
  hannah:
    "A identidade de Hannah e sua relação com os registros do caso não puderam ser confirmadas nas fontes primárias localizadas; aguarda-se documento identificador.",
  nicole:
    "A identidade de Nicole e sua relação com os registros do caso não puderam ser confirmadas nas fontes primárias localizadas; aguarda-se documento identificador.",
  katherine:
    "Um registro de enfermagem de 1993 menciona que Katherine telefonou dizendo estar doente; não identifica seu sobrenome nem confirma sua função profissional.",
  daniel:
    "Uma carta sem remetente identificado, dirigida a Daniel, o chama de “meu filho”; Dorothy relata tê-lo visto com Laura no funeral de Andrew. A relação com Andrew não é estabelecida.",
};

const PLACES: Place[] = [
  {
    id: "mansion",
    name: "Roberts Mansion",
    group: "Residência",
    description: "Local principal a ser mapeado por cômodos e acessos.",
    status: "pendente",
  },
  {
    id: "charles-study",
    name: "Escritório de Charles",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; documentos e mecanismo de acesso aguardam validação.",
    status: "pendente",
  },
  {
    id: "tea-room",
    name: "Sala de chá",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; registrar cada documento e objeto encontrado.",
    status: "pendente",
  },
  {
    id: "gallery",
    name: "Galeria",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; eventuais cofres e pistas serão ligados às fontes.",
    status: "pendente",
  },
  {
    id: "vivian-room",
    name: "Quarto de Vivian",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; diários e objetos aguardam transcrição verificada.",
    status: "pendente",
  },
  {
    id: "trisha-room",
    name: "Quarto de Trisha",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; registrar acessos e documentos.",
    status: "pendente",
  },
  {
    id: "security-room",
    name: "Sala de segurança",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; registros e chaves precisam de conferência.",
    status: "pendente",
  },
  {
    id: "attic",
    name: "Sótão",
    group: "Roberts Mansion / Igreja",
    description: "A localização exata e os acessos devem ser validados na fonte.",
    status: "pendente",
  },
  {
    id: "well",
    name: "Poço do jardim",
    group: "Roberts Mansion",
    description: "Local provisório; confirmar objetos, acesso e contexto.",
    status: "pendente",
  },
  {
    id: "hospital",
    name: "Painscreek Community Hospital",
    group: "Hospital",
    description: "Mapear arquivos, salas, escritório médico e áreas de serviço.",
    status: "pendente",
  },
  {
    id: "morgue",
    name: "Porão / necrotério",
    group: "Hospital",
    description: "Sub-local provisório; confirmar os objetos e documentos encontrados.",
    status: "pendente",
  },
  {
    id: "church",
    name: "Trinity Church",
    group: "Religioso",
    description: "Mapear quartos, depósito, confessionário e áreas superiores.",
    status: "pendente",
  },
  {
    id: "scott-cabin",
    name: "Cabana de Scott",
    group: "Residência",
    description: "Mapear cômodos e passagens somente após conferir a fonte.",
    status: "pendente",
  },
  {
    id: "inn",
    name: "Anne’s Courtyard Inn & Suites",
    group: "Hospedagem",
    description: "Mapear recepção, quartos e registros associados.",
    status: "pendente",
  },
  {
    id: "dorothy-house",
    name: "Casa de Dorothy",
    group: "Residência",
    description: "Local e documentos pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "bernard-house",
    name: "Casa de Bernard",
    group: "Residência",
    description: "Local e objetos pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "andrew-house",
    name: "Casa de Andrew",
    group: "Residência",
    description: "Local e documentos pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "cemetery",
    name: "Cemitério",
    group: "Público",
    description: "Conferir inscrições, túmulos e pistas de acesso.",
    status: "pendente",
  },
  {
    id: "sheriff",
    name: "Escritório do xerife",
    group: "Institucional",
    description: "Conferir arquivos, livros de registro e cadeia de custódia.",
    status: "pendente",
  },
  {
    id: "wanda-house",
    name: "Casa de Wanda e Derrick",
    group: "Residência",
    description: "Local e diários pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "photo-shop",
    name: "Loja de fotografia de Oliver",
    group: "Comércio",
    description: "Conferir fotos, registros e ferramentas citadas.",
    status: "pendente",
  },
  {
    id: "lake",
    name: "Lago",
    group: "Exterior",
    description: "Vínculo com a cronologia e a descoberta de um corpo precisa de fonte.",
    status: "pendente",
  },
  {
    id: "river",
    name: "Área do rio",
    group: "Exterior",
    description: "Relação com Sofia a confirmar documentalmente.",
    status: "pendente",
  },
  {
    id: "drain",
    name: "Dreno junto à igreja",
    group: "Exterior",
    description: "Acesso e objetos associados pendentes de verificação.",
    status: "pendente",
  },
  {
    id: "sewers",
    name: "Esgotos e acessos subterrâneos",
    group: "Infraestrutura",
    description: "Mapear entradas, conexões e mecanismos após validar os documentos.",
    status: "pendente",
  },
];

const DOCUMENTS: DocumentItem[] = [
  {
    id: "diary-vivian",
    title: "Diários de Vivian Roberts",
    type: "Diário",
    location: "Local a confirmar",
    status: "pendente",
    body: "Transcrição integral ainda não incorporada. Este registro é um marcador de planejamento, não o conteúdo do diário.",
  },
  {
    id: "letters",
    title: "Cartas e bilhetes",
    type: "Correspondência",
    location: "Múltiplos locais",
    status: "pendente",
    body: "Adicionar cada documento como item separado depois de registrar a página de origem e transcrever o texto.",
  },
  {
    id: "medical-records",
    title: "Registros médicos e laudos",
    type: "Documento oficial",
    location: "Hospital — local exato a confirmar",
    status: "pendente",
    body: "Adicionar apenas após conferir texto, autoria, data, rasuras e página de origem.",
  },
  {
    id: "photos",
    title: "Fotografias e versos",
    type: "Fotografia",
    location: "Local a confirmar",
    status: "pendente",
    body: "Cada fotografia deve ter sua própria ficha, com descrição visual e transcrição do verso quando legível.",
  },
  {
    id: "recordings",
    title: "Gravações e mensagens",
    type: "Áudio",
    location: "Local a confirmar",
    status: "pendente",
    body: "Transcrever sem completar trechos incertos. Guardar a referência à fonte e distinguir gravação original de interpretação.",
  },
];

const statusLabel: Record<ReviewStatus, string> = {
  pendente: "Revisão pendente",
  confirmado: "Confirmado na fonte",
  contradicao: "Contradição em aberto",
};

function StatusPill({ status }: { status: ReviewStatus }) {
  return (
    <span className="inline-flex border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-200">
      {statusLabel[status]}
    </span>
  );
}

type BoardConnection = { personId: string; placeId: string };
function InvestigationBoard({ onClose }: { onClose: () => void }) {
  const [connections, setConnections] = useState<BoardConnection[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("vivian-investigation-board-v1") || "[]",
      );
      return Array.isArray(saved)
        ? saved.filter(
            (item) => item && typeof item.personId === "string" && typeof item.placeId === "string",
          )
        : [];
    } catch {
      return [];
    }
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [step, setStep] = useState<"people" | "places">("people");
  const [confirmAnotherPlace, setConfirmAnotherPlace] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [notice, setNotice] = useState(
    "Escolha uma pessoa e depois selecione um ou mais locais para relacioná-la.",
  );
  useEffect(() => {
    window.localStorage.setItem("vivian-investigation-board-v1", JSON.stringify(connections));
  }, [connections]);

  const linkedPersonIds = new Set(connections.map((item) => item.personId));
  const availablePeople = PEOPLE.filter((person) => !linkedPersonIds.has(person.id));
  const selectedPerson = PEOPLE.find((person) => person.id === selectedPersonId) ?? null;
  const filteredPlaces = PLACES.filter((place) => {
    const search = placeQuery.trim().toLocaleLowerCase("pt-BR");
    return (
      !search ||
      `${place.name} ${place.group} ${place.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(search)
    );
  });
  const openPlacePicker = (personId: string, isAdditional = false) => {
    const person = PEOPLE.find((item) => item.id === personId);
    if (!person) return;
    setSelectedPersonId(personId);
    setPlaceQuery("");
    setStep("places");
    setNotice(
      isAdditional
        ? `Adicione outro local para ${person.name}. As ligações existentes serão mantidas.`
        : `Agora escolha um local relacionado a ${person.name}.`,
    );
  };
  const addConnection = (personId: string, placeId: string) => {
    const person = PEOPLE.find((item) => item.id === personId);
    const place = PLACES.find((item) => item.id === placeId);
    if (!person || !place) return;
    if (connections.some((item) => item.personId === personId && item.placeId === placeId)) {
      setNotice(`${person.name} já está relacionado(a) a ${place.name}. Escolha outro local.`);
      return;
    }
    setConnections((current) => [...current, { personId, placeId }]);
    setPlaceQuery("");
    setNotice(`Local adicionado: ${person.name} ↔ ${place.name}.`);
    setConfirmAnotherPlace(true);
  };
  const removeConnection = (personId: string, placeId: string) => {
    const person = PEOPLE.find((item) => item.id === personId);
    const place = PLACES.find((item) => item.id === placeId);
    const remainingForPerson = connections.filter(
      (item) => item.personId === personId && item.placeId !== placeId,
    );
    setConnections((current) =>
      current.filter((item) => !(item.personId === personId && item.placeId === placeId)),
    );
    setNotice(
      remainingForPerson.length === 0
        ? `${person?.name ?? "Pessoa"} ficou sem locais relacionados e voltou para a lista de pessoas disponíveis.`
        : `Ligação com ${place?.name ?? "o local"} removida. As outras ligações de ${person?.name ?? "essa pessoa"} foram mantidas.`,
    );
  };
  const groupedConnections = PEOPLE.map((person) => ({
    person,
    places: connections
      .filter((item) => item.personId === person.id)
      .map((link) => ({
        ...link,
        place: PLACES.find((place) => place.id === link.placeId),
      }))
      .filter((link) => link.place),
  })).filter((group) => group.places.length > 0);

  return (
    <main className="min-h-screen bg-[#11100e] px-3 py-5 text-[#eee9df] sm:px-7 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#c4a779]">
              Dexter Revival Project · Evidências conectadas
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">Quadro investigativo</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
              Relacione cada pessoa a quantos locais forem necessários. Você pode acrescentar ou
              remover ligações a qualquer momento; tudo fica salvo neste navegador.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
          >
            <ArrowLeft size={16} /> Voltar ao caso
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 border border-[#4b4439] bg-[#1b1a17] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-[#c9c1b5]" aria-live="polite">
            {notice}
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="border border-[#79664c] px-3 py-2 font-mono text-xs">
              {connections.length} ligações
            </span>
            <span className="border border-[#79664c] px-3 py-2 font-mono text-xs">
              {availablePeople.length} pessoas sem locais
            </span>
            <button
              type="button"
              onClick={() => {
                setConnections([]);
                setSelectedPersonId(null);
                setStep("people");
                setPlaceQuery("");
                setNotice("Quadro limpo. Todas as pessoas voltaram para a lista.");
              }}
              className="min-h-10 border border-red-900/70 px-3 py-2 font-mono text-xs text-red-200 hover:bg-red-950/40"
            >
              Limpar quadro
            </button>
          </div>
        </div>

        {step === "people" ? (
          <section className="mt-5 border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl sm:text-3xl">
                  <Users size={21} className="text-[#c4a779}" /> Escolha uma pessoa
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#a9a092]">
                  Toque ou clique em uma pessoa para começar a relacioná-la com locais. Pessoas que
                  já têm ligações aparecem abaixo e podem receber locais adicionais.
                </p>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#c4a779]">
                {availablePeople.length} disponíveis
              </span>
            </div>
            {availablePeople.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availablePeople.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => openPlacePicker(person.id)}
                    className="flex min-h-[92px] items-center justify-between gap-3 border border-[#4b4439] bg-[#211f1b] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#c4a779]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b77e]"
                  >
                    <span>
                      <span className="block font-medium leading-snug">{person.name}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-wider text-[#a9a092]">
                        {person.role}
                      </span>
                    </span>
                    <span className="shrink-0 text-[#c4a779]" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 border border-[#79664c] bg-[#211f1b] p-6 text-center">
                <p className="font-display text-2xl">Todas as pessoas já têm locais relacionados</p>
                <p className="mt-2 text-sm text-[#bdb5a8]">
                  Você pode adicionar outros locais ou remover ligações na seção abaixo.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section
            className="mt-5 border border-[#4b4439] bg-[#191714] p-4 sm:p-6"
            aria-labelledby="place-picker-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#4b4439] pb-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                  Selecionar local
                </p>
                <h2 id="place-picker-title" className="mt-2 font-display text-2xl sm:text-3xl">
                  Onde essa pessoa se conecta?
                </h2>
                {selectedPerson && (
                  <div className="mt-3 max-w-2xl border border-[#79664c]/70 bg-[#211f1b] p-3 sm:p-4">
                    <p className="text-sm text-[#bdb5a8]">
                      Pessoa selecionada:{" "}
                      <strong className="text-[#ead8b8]">{selectedPerson.name}</strong>
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c4a779]">
                      Lembrete do personagem
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#d2c9bb]">
                      {PERSON_SUMMARIES[selectedPerson.id] ?? selectedPerson.note}
                    </p>
                  </div>
                )}
                {selectedPerson &&
                  connections.some((item) => item.personId === selectedPerson.id) && (
                    <p className="mt-2 text-xs text-[#c4a779]">
                      Os locais já associados serão preservados; selecione outro local para
                      acrescentar uma ligação.
                    </p>
                  )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPersonId(null);
                  setStep("people");
                  setPlaceQuery("");
                  setNotice(
                    "Escolha uma pessoa ou adicione um local a alguém que já aparece nas ligações registradas.",
                  );
                }}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
              >
                <ArrowLeft size={15} /> Voltar
              </button>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs uppercase tracking-wider text-[#bdb5a8]">
                Buscar local
              </span>
              <span className="flex items-center gap-2 border border-[#5c5143] bg-[#11100e] px-3">
                <FileSearch size={17} className="shrink-0 text-[#c4a779}" />
                <input
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  placeholder="Digite o nome de um local..."
                  className="min-h-12 w-full bg-transparent text-base text-[#eee9df] outline-none placeholder:text-[#81796d]"
                />
              </span>
            </label>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlaces.map((place) => {
                const alreadyLinked =
                  !!selectedPersonId &&
                  connections.some(
                    (item) => item.personId === selectedPersonId && item.placeId === place.id,
                  );
                return (
                  <button
                    key={place.id}
                    type="button"
                    disabled={alreadyLinked}
                    onClick={() => selectedPersonId && addConnection(selectedPersonId, place.id)}
                    className={`min-h-[112px] border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b77e] ${alreadyLinked ? "cursor-not-allowed border-[#4b4439] bg-[#171512] opacity-60" : "border-[#6a5942] bg-[#211f1b] hover:border-[#c4a779] hover:bg-[#c4a779]/10"}`}
                  >
                    <span className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 shrink-0 text-[#c4a779]" />
                      <span>
                        <span className="block font-medium leading-snug">{place.name}</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-[#c4a779]">
                          {place.group}
                        </span>
                      </span>
                    </span>
                    <span className="mt-3 block text-xs leading-relaxed text-[#a9a092]">
                      {place.description}
                    </span>
                    <span className="mt-4 flex items-center justify-end gap-2 border-t border-[#4b4439] pt-3 font-mono text-[10px] uppercase tracking-wider text-[#ead8b8]">
                      {alreadyLinked ? "Já relacionado" : "Adicionar este local"}{" "}
                      <span aria-hidden="true">{alreadyLinked ? "✓" : "→"}</span>
                    </span>
                  </button>
                );
              })}
              {filteredPlaces.length === 0 && (
                <p className="border border-dashed border-[#5c5143] p-5 text-sm text-[#bdb5a8] sm:col-span-2 lg:col-span-3">
                  Nenhum local encontrado. Tente outro termo.
                </p>
              )}
            </div>
          </section>
        )}

        <section className="mt-5 border border-[#4b4439] bg-[#242019] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Network size={20} className="text-[#c4a779}" /> Ligações registradas
            </h2>
            <span className="font-mono text-xs text-[#c4a779]">
              {connections.length} ligações · {groupedConnections.length} pessoas
            </span>
          </div>
          {groupedConnections.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupedConnections.map(({ person, places }) => (
                <article key={person.id} className="border border-[#6a5942] bg-[#171512]/90 p-4">
                  <div className="flex items-start gap-3">
                    <Users size={17} className="mt-0.5 shrink-0 text-[#c4a779]" />
                    <div className="min-w-0">
                      <p className="font-medium">{person.name}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#a9a092]">
                        {person.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {places.map(
                      ({ place }) =>
                        place && (
                          <div
                            key={place.id}
                            className="flex items-start justify-between gap-2 border border-[#79664c]/70 bg-[#3a2e20]/50 px-3 py-3"
                          >
                            <span className="flex min-w-0 items-start gap-2 text-sm text-[#ead8b8]">
                              <MapPin size={14} className="mt-0.5 shrink-0 text-[#c4a779]" />
                              <span className="min-w-0 break-words">
                                {place.name}
                                <span className="mt-1 block text-[10px] uppercase tracking-wider text-[#a9a092]">
                                  {place.group}
                                </span>
                              </span>
                            </span>
                            <button
                              type="button"
                              aria-label={`Remover local ${place.name} de ${person.name}`}
                              onClick={() => removeConnection(person.id, place.id)}
                              className="min-h-8 min-w-8 shrink-0 border border-[#79664c] text-lg text-[#bdb5a8] hover:border-red-800 hover:text-red-200"
                            >
                              ×
                            </button>
                          </div>
                        ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPlacePicker(person.id, true)}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 border border-[#79664c] px-3 py-2 text-xs text-[#ead8b8] transition hover:border-[#c4a779] hover:bg-[#c4a779]/10"
                  >
                    <span className="text-lg leading-none">+</span> Adicionar outro local
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 border border-dashed border-[#5c5143] p-5 text-sm text-[#a9a092]">
              As ligações que você criar aparecerão aqui para revisão.
            </p>
          )}
        </section>
        {confirmAnotherPlace && selectedPerson && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="presentation"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-another-place-title"
              className="w-full max-w-md border border-[#c4a779] bg-[#1b1a17] p-5 shadow-2xl sm:p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                Ligação registrada
              </p>
              <h2 id="confirm-another-place-title" className="mt-2 font-display text-2xl">
                Deseja adicionar esse personagem a outro local?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">
                <strong className="text-[#ead8b8]">{selectedPerson.name}</strong> já foi relacionado
                ao local escolhido. Você pode continuar adicionando outros locais ou voltar à lista
                de personagens.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAnotherPlace(false);
                    setSelectedPersonId(null);
                    setStep("people");
                    setPlaceQuery("");
                    setNotice(
                      `${selectedPerson.name} foi registrado(a). Escolha outro personagem para continuar.`,
                    );
                  }}
                  className="min-h-11 border border-[#79664c] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#d4cabc] hover:bg-white/5"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAnotherPlace(false);
                    setStep("places");
                    setPlaceQuery("");
                    setNotice(
                      `Escolha outro local para ${selectedPerson.name}. As ligações existentes serão mantidas.`,
                    );
                  }}
                  className="min-h-11 border border-[#c4a779] bg-[#c4a779]/10 px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/20"
                >
                  Sim, adicionar outro local
                </button>
              </div>
            </section>
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-[#81796d]">
          Importante: uma ligação entre pessoa e local é uma anotação de investigação; sozinha, não
          confirma presença na noite do crime nem culpa.
        </p>
      </div>
    </main>
  );
}

/**
 * Base isolada do Capítulo 6. Ainda não está ligada ao menu principal:
 * integrar somente após revisar as transcrições e as dependências do caso.
 */
export function VivianRobertsCase({
  onBack,
  soundOn = true,
  onToggleSound,
  musicVolume = 0.3,
  onMusicVolumeChange,
}: {
  onBack?: () => void;
  soundOn?: boolean;
  onToggleSound?: () => void;
  musicVolume?: number;
  onMusicVolumeChange?: (value: number) => void;
}) {
  const [showBoard, setShowBoard] = useState(false);
  const [showPlayableGame, setShowPlayableGame] = useState(false);
  const [ambientOn, setAmbientOn] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(() => {
    if (typeof window === "undefined") return 0.22;
    const saved = window.localStorage.getItem("vivian-ambient-volume");
    if (saved === null) return 0.22;
    const parsed = Number(saved);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.22;
  });
  const ambientRef = useRef<{
    context: AudioContext;
    nodes: AudioScheduledSourceNode[];
    gains: [GainNode, GainNode];
  } | null>(null);
  const [section, setSection] = useState<"pessoas" | "locais" | "documentos">("pessoas");
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);

  useEffect(() => {
    if (!ambientOn || typeof window === "undefined") return;
    const startAmbient = () => {
      if (!ambientOn || ambientRef.current) return;
      const context = new AudioContext();
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.32;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 360;
      const windGain = context.createGain();
      windGain.gain.value = 0.11 * ambientVolume;
      noise.connect(filter).connect(windGain).connect(context.destination);
      const hum = context.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 54;
      const humGain = context.createGain();
      humGain.gain.value = 0.036 * ambientVolume;
      hum.connect(humGain).connect(context.destination);
      noise.start();
      hum.start();
      ambientRef.current = { context, nodes: [noise, hum], gains: [windGain, humGain] };
    };
    window.addEventListener("pointerdown", startAmbient, { once: true });
    return () => window.removeEventListener("pointerdown", startAmbient);
  }, [ambientOn, ambientVolume]);
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.gains[0].gain.value = 0.11 * ambientVolume;
      ambientRef.current.gains[1].gain.value = 0.036 * ambientVolume;
    }
  }, [ambientVolume]);
  useEffect(() => {
    window.localStorage.setItem("vivian-ambient-volume", String(ambientVolume));
  }, [ambientVolume]);
  useEffect(() => {
    if (ambientOn) return;
    const current = ambientRef.current;
    ambientRef.current = null;
    if (current) {
      current.nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // A limpeza é best-effort; o nó pode já ter sido interrompido.
        }
      });
      void current.context.close();
    }
  }, [ambientOn]);
  useEffect(
    () => () => {
      const current = ambientRef.current;
      if (current) {
        current.nodes.forEach((node) => {
          try {
            node.stop();
          } catch {
            // A limpeza é best-effort; o nó pode já ter sido interrompido.
          }
        });
        void current.context.close();
        ambientRef.current = null;
      }
    },
    [],
  );

  const filteredPeople = useMemo(
    () =>
      PEOPLE.filter((p) =>
        `${p.name} ${p.role} ${p.note}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const filteredPlaces = useMemo(
    () =>
      PLACES.filter((p) =>
        `${p.name} ${p.group} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const filteredDocuments = useMemo(
    () =>
      DOCUMENTS.filter((d) =>
        `${d.title} ${d.type} ${d.location}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const closeDetail = () => {
    setSelectedPerson(null);
    setSelectedPlace(null);
    setSelectedDocument(null);
  };

  if (showPlayableGame)
    return <VivianInvestigationGame onBack={() => setShowPlayableGame(false)} />;

  if (showBoard) return <InvestigationBoard onClose={() => setShowBoard(false)} />;

  return (
    <main className="min-h-screen bg-[#11110f] px-4 py-6 text-[#eee9df] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#c4a779]">
              Arquivo confidencial · Capítulo 06
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">The Painscreek Case</h1>
            <p className="mt-2 max-w-3xl text-xs uppercase tracking-[0.2em] text-[#bdb5a8]">
              Painscreek, 1995 · O caso que a cidade tentou esquecer
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
              Reconstrua as relações, compare os registros e descubra quais conexões resistem às
              evidências. Não confunda suspeita com prova.
            </p>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-10 border border-[#79664c] px-3 py-2 font-mono text-xs text-[#d6c9b5] hover:border-[#c4a779]"
            >
              <ArrowLeft size={16} className="mr-2 inline" /> Menu de casos
            </button>
          )}
        </header>
        <div
          className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center gap-3 border border-[#4b4439] bg-[#1b1a17] p-3"
          aria-label="Controles de áudio"
        >
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className="min-h-10 border border-[#79664c] px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-[#c4a779]"
          >
            Trilha: {soundOn ? "ligada" : "desligada"}
          </button>
          <label className="flex min-h-10 items-center gap-2 border border-[#4b4439] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#bdb5a8]">
            Música {Math.round(musicVolume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(event) => onMusicVolumeChange?.(Number(event.target.value))}
              aria-label="Volume da trilha musical"
              className="w-24 accent-[#c4a779]"
            />
          </label>
          <button
            type="button"
            onClick={() => setAmbientOn((value) => !value)}
            aria-pressed={ambientOn}
            className="min-h-10 border border-[#4b4439] px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-[#c4a779]"
          >
            Ambiente: {ambientOn ? "ligado" : "desligado"}
          </button>
          <label className="flex min-h-10 items-center gap-2 border border-[#4b4439] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#bdb5a8]">
            Ambiente {Math.round(ambientVolume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientVolume}
              onChange={(event) => setAmbientVolume(Number(event.target.value))}
              aria-label="Volume do som ambiente"
              className="w-24 accent-[#c4a779]"
            />
          </label>
        </div>
        <figure className="relative mx-auto mt-6 w-full overflow-hidden border border-[#79664c] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="relative aspect-[16/7] min-h-[230px] w-full sm:min-h-[320px]">
            <img
              src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/624270/header.jpg"
              alt="Arte oficial de The Painscreek Killings, jogo que inspira o caso Vivian Roberts"
              loading="eager"
              className="h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/5"
            />
          </div>
          <figcaption className="border-t border-[#79664c] bg-[#171512] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a9a092] sm:px-4">
            Arquivo visual · The Painscreek Killings · EQ Studios
          </figcaption>
        </figure>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#4b4439] bg-[#1b1a17] p-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#c4a779]">
              Ferramentas de investigação
            </p>
            <p className="mt-1 text-sm text-[#bdb5a8]">
              Organize conexões entre personagens e consulte os mapas do caso.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowPlayableGame(true)}
              className="inline-flex min-h-12 items-center gap-2 border border-[#c4a779] bg-[#c4a779]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#ead8b8] transition hover:bg-[#c4a779]/20"
            >
              <FileSearch size={17} /> Iniciar investigação
            </button>
            <button
              type="button"
              onClick={() => setShowBoard(true)}
              className="inline-flex min-h-12 items-center gap-2 border border-[#c4a779] bg-[#c4a779]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#ead8b8] transition hover:bg-[#c4a779]/20"
            >
              <ClipboardList size={17} /> Quadro investigativo
            </button>
            <Link
              to="/mapas"
              onClick={() => {
                try {
                  window.sessionStorage.setItem("dexter-return-to-vivian-case", "true");
                } catch {
                  // A navegação continua funcional se o armazenamento da sessão estiver bloqueado.
                }
              }}
              className="inline-flex min-h-12 items-center gap-2 border border-[#a5a78d] bg-[#a5a78d]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#d9dbc9] transition hover:bg-[#a5a78d]/20"
            >
              <MapPin size={17} /> Mapa
            </Link>
            <Link
              to="/linha-do-tempo"
              onClick={() => {
                try {
                  window.sessionStorage.setItem("dexter-return-to-vivian-case", "true");
                } catch {
                  // A navegação continua funcional se o armazenamento da sessão estiver bloqueado.
                }
              }}
              className="inline-flex min-h-12 items-center gap-2 border border-[#79664c] bg-[#79664c]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#e2cba4] transition hover:bg-[#79664c]/20"
            >
              <Clock3 size={17} /> Linha do tempo
            </Link>
          </div>
        </div>
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <Users className="mb-3 text-[#c4a779]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">
              Personagens catalogados
            </p>
            <p className="mt-1 text-3xl">{PEOPLE.length}</p>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <MapPin className="mb-3 text-[#c4a779]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">
              Locais para revisar
            </p>
            <p className="mt-1 text-3xl">{PLACES.length}</p>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <BookOpen className="mb-3 text-[#c4a779]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">
              Grupos documentais
            </p>
            <p className="mt-1 text-3xl">{DOCUMENTS.length}</p>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Seções do dossiê">
          {(
            [
              { id: "pessoas", label: "Personagens" },
              { id: "locais", label: "Locais" },
              { id: "documentos", label: "Documentos e evidências" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={section === item.id}
              onClick={() => {
                setSection(item.id);
                setQuery("");
                closeDetail();
              }}
              className={`min-h-11 border px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${section === item.id ? "border-[#c4a779] bg-[#c4a779]/10 text-[#e6cfaa]" : "border-[#4b4439] text-[#bdb5a8] hover:border-[#79664c]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex max-w-2xl items-center gap-3 border border-[#4b4439] bg-[#1b1a17] px-3">
          <FileSearch size={18} className="shrink-0 text-[#c4a779]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar personagem, local ou documento..."
            className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#81796d]"
          />
        </label>

        {section === "pessoas" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  setSelectedPerson(person);
                  setSelectedPlace(null);
                  setSelectedDocument(null);
                }}
                className="min-h-36 border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#242119]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl">{person.name}</h2>
                  <span className="text-[#c4a779]">↗</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">
                  {person.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{person.note}</p>
                <div className="mt-3">
                  <StatusPill status={person.status} />
                </div>
              </button>
            ))}
          </section>
        )}

        {section === "locais" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  setSelectedPlace(place);
                  setSelectedPerson(null);
                  setSelectedDocument(null);
                }}
                className="min-h-36 border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#242119]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl">{place.name}</h2>
                  <MapPin size={17} className="shrink-0 text-[#c4a779]" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">
                  {place.group}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{place.description}</p>
                <div className="mt-3">
                  <StatusPill status={place.status} />
                </div>
              </button>
            ))}
          </section>
        )}

        {section === "documentos" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2">
            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setSelectedDocument(doc);
                  setSelectedPerson(null);
                  setSelectedPlace(null);
                }}
                className="border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl">{doc.title}</h2>
                  <BookOpen size={17} className="shrink-0 text-[#c4a779]" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">
                  {doc.type} · {doc.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{doc.body}</p>
                <div className="mt-3">
                  <StatusPill status={doc.status} />
                </div>
              </button>
            ))}
          </section>
        )}

        {(selectedPerson || selectedPlace || selectedDocument) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="presentation"
            onClick={closeDetail}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes do item selecionado"
              className="max-h-[85vh] w-full max-w-2xl overflow-auto border border-[#79664c] bg-[#1b1a17] p-5 sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                    Dossiê de investigação
                  </p>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl">
                    {selectedPerson?.name ?? selectedPlace?.name ?? selectedDocument?.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  aria-label="Fechar detalhes"
                  className="min-h-10 border border-[#4b4439] p-2 hover:border-[#c4a779]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#c9c1b5]">
                {selectedPerson && (
                  <>
                    <p className="text-[#c4a779]">{selectedPerson.role}</p>
                    <p>{selectedPerson.note}</p>
                    <p>
                      As informações biográficas e eventuais relações causais serão preenchidas após
                      conferência das fontes documentais.
                    </p>
                    <StatusPill status={selectedPerson.status} />
                  </>
                )}
                {selectedPlace && (
                  <>
                    <p className="text-[#c4a779]">{selectedPlace.group}</p>
                    <p>{selectedPlace.description}</p>
                    <p>
                      O inventário de objetos, documentos, portas e dependências deste local será
                      preenchido a partir das transcrições revisadas.
                    </p>
                    <StatusPill status={selectedPlace.status} />
                  </>
                )}
                {selectedDocument && (
                  <>
                    <p className="text-[#c4a779]">
                      {selectedDocument.type} · {selectedDocument.location}
                    </p>
                    <p className="whitespace-pre-wrap">{selectedDocument.body}</p>
                    <StatusPill status={selectedDocument.status} />
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        <footer className="mt-10 border-t border-[#4b4439] pt-4 text-xs leading-relaxed text-[#81796d]">
          Versão-base de organização. Não representa ainda o caso jogável final; não contém solução
          oficial nem rota alternativa concluída.
        </footer>
      </div>
    </main>
  );
}
