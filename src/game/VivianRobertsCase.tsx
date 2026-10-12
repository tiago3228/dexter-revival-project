import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, FileSearch, MapPin, Users, X } from "lucide-react";

type ReviewStatus = "pendente" | "confirmado" | "contradicao";
type Person = { id: string; name: string; role: string; note: string; status: ReviewStatus };
type Place = { id: string; name: string; group: string; description: string; status: ReviewStatus };
type DocumentItem = { id: string; title: string; type: string; location: string; status: ReviewStatus; body: string };

const PEOPLE: Person[] = [
  { id: "vivian", name: "Vivian Roberts", role: "Vítima central", note: "Perfil e cronologia aguardam conferência documental.", status: "pendente" },
  { id: "charles", name: "Charles Roberts", role: "Personagem", note: "Relações, declarações e álibi ainda precisam de fontes verificadas.", status: "pendente" },
  { id: "magdalene", name: "Magdalene Roberts", role: "Personagem", note: "Biografia e eventos associados pendentes de conferência.", status: "pendente" },
  { id: "trisha", name: "Trisha Roberts", role: "Personagem", note: "Biografia e relações pendentes de conferência.", status: "pendente" },
  { id: "bernard", name: "Bernard Hopkins", role: "Personagem", note: "Depoimentos e documentos pendentes de conferência.", status: "pendente" },
  { id: "dorothy", name: "Dorothy Patterson", role: "Personagem", note: "Diários e relatos devem ser transcritos antes de conclusões.", status: "pendente" },
  { id: "derrick", name: "Derrick Tyler", role: "Personagem", note: "Documentos e linha temporal pendentes.", status: "pendente" },
  { id: "sofia", name: "Sofia Miller", role: "Personagem", note: "Documentos associados devem ser conferidos na fonte.", status: "pendente" },
  { id: "scott", name: "Scott Brooks", role: "Personagem", note: "Não presumir identidade com Vincent sem evidência direta.", status: "contradicao" },
  { id: "matthew", name: "Father Matthew", role: "Personagem", note: "Nenhuma conclusão de culpa será exibida antes da análise das evidências.", status: "pendente" },
  { id: "andrew", name: "Andrew Reed", role: "Personagem", note: "Cronologia e registros pendentes.", status: "pendente" },
  { id: "henry", name: "Dr. Henry Johnson", role: "Personagem", note: "Registros médicos e cronologia pendentes.", status: "pendente" },
  { id: "moss", name: "Steven Moss", role: "Personagem", note: "Diários, registros e datas pendentes.", status: "pendente" },
  { id: "james", name: "James Howard", role: "Personagem", note: "Documentos de transferência pendentes.", status: "pendente" },
  { id: "wanda", name: "Wanda Tyler", role: "Personagem", note: "Diários e relação com os demais personagens pendentes.", status: "pendente" },
  { id: "mary", name: "Mary Martinez", role: "Personagem", note: "Diários e declarações pendentes.", status: "pendente" },
  { id: "oliver", name: "Oliver Gibson", role: "Personagem", note: "Registros e fotografias pendentes.", status: "pendente" },
  { id: "rachel", name: "Sister Rachel", role: "Personagem", note: "Relato atribuído deve ser conferido integralmente.", status: "pendente" },
  { id: "calvin", name: "Father Calvin Bennett", role: "Personagem", note: "Registros e datas pendentes de conferência.", status: "pendente" },
  { id: "sylvia", name: "Sylvia", role: "Personagem", note: "Sobrenome e contexto não devem ser presumidos.", status: "pendente" },
  { id: "hannah", name: "Hannah", role: "Personagem", note: "Identificação completa pendente.", status: "pendente" },
  { id: "nicole", name: "Nicole", role: "Personagem", note: "Identificação completa pendente.", status: "pendente" },
  { id: "katherine", name: "Nurse Katherine", role: "Personagem", note: "Registros hospitalares pendentes de conferência.", status: "pendente" },
  { id: "daniel", name: "Daniel", role: "Personagem", note: "Identificação completa e documentos pendentes.", status: "pendente" },
  { id: "unidentified", name: "Empregados e residentes não identificados", role: "Grupo de registros", note: "Adicionar indivíduos apenas quando a fonte permitir distingui-los.", status: "pendente" },
];

const PLACES: Place[] = [
  { id: "mansion", name: "Roberts Mansion", group: "Residência", description: "Local principal a ser mapeado por cômodos e acessos.", status: "pendente" },
  { id: "charles-study", name: "Escritório de Charles", group: "Roberts Mansion", description: "Sub-local da mansão; documentos e mecanismo de acesso aguardam validação.", status: "pendente" },
  { id: "tea-room", name: "Sala de chá", group: "Roberts Mansion", description: "Sub-local da mansão; registrar cada documento e objeto encontrado.", status: "pendente" },
  { id: "gallery", name: "Galeria", group: "Roberts Mansion", description: "Sub-local da mansão; eventuais cofres e pistas serão ligados às fontes.", status: "pendente" },
  { id: "vivian-room", name: "Quarto de Vivian", group: "Roberts Mansion", description: "Sub-local da mansão; diários e objetos aguardam transcrição verificada.", status: "pendente" },
  { id: "trisha-room", name: "Quarto de Trisha", group: "Roberts Mansion", description: "Sub-local da mansão; registrar acessos e documentos.", status: "pendente" },
  { id: "security-room", name: "Sala de segurança", group: "Roberts Mansion", description: "Sub-local da mansão; registros e chaves precisam de conferência.", status: "pendente" },
  { id: "attic", name: "Sótão", group: "Roberts Mansion / Igreja", description: "A localização exata e os acessos devem ser validados na fonte.", status: "pendente" },
  { id: "well", name: "Poço do jardim", group: "Roberts Mansion", description: "Local provisório; confirmar objetos, acesso e contexto.", status: "pendente" },
  { id: "hospital", name: "Painscreek Community Hospital", group: "Hospital", description: "Mapear arquivos, salas, escritório médico e áreas de serviço.", status: "pendente" },
  { id: "morgue", name: "Porão / necrotério", group: "Hospital", description: "Sub-local provisório; confirmar os objetos e documentos encontrados.", status: "pendente" },
  { id: "church", name: "Trinity Church", group: "Religioso", description: "Mapear quartos, depósito, confessionário e áreas superiores.", status: "pendente" },
  { id: "scott-cabin", name: "Cabana de Scott", group: "Residência", description: "Mapear cômodos e passagens somente após conferir a fonte.", status: "pendente" },
  { id: "inn", name: "Anne’s Courtyard Inn & Suites", group: "Hospedagem", description: "Mapear recepção, quartos e registros associados.", status: "pendente" },
  { id: "dorothy-house", name: "Casa de Dorothy", group: "Residência", description: "Local e documentos pendentes de conferência.", status: "pendente" },
  { id: "bernard-house", name: "Casa de Bernard", group: "Residência", description: "Local e objetos pendentes de conferência.", status: "pendente" },
  { id: "andrew-house", name: "Casa de Andrew", group: "Residência", description: "Local e documentos pendentes de conferência.", status: "pendente" },
  { id: "cemetery", name: "Cemitério", group: "Público", description: "Conferir inscrições, túmulos e pistas de acesso.", status: "pendente" },
  { id: "sheriff", name: "Escritório do xerife", group: "Institucional", description: "Conferir arquivos, livros de registro e cadeia de custódia.", status: "pendente" },
  { id: "wanda-house", name: "Casa de Wanda e Derrick", group: "Residência", description: "Local e diários pendentes de conferência.", status: "pendente" },
  { id: "photo-shop", name: "Loja de fotografia de Oliver", group: "Comércio", description: "Conferir fotos, registros e ferramentas citadas.", status: "pendente" },
  { id: "lake", name: "Lago", group: "Exterior", description: "Vínculo com a cronologia e a descoberta de um corpo precisa de fonte.", status: "pendente" },
  { id: "river", name: "Área do rio", group: "Exterior", description: "Relação com Sofia a confirmar documentalmente.", status: "pendente" },
  { id: "drain", name: "Dreno junto à igreja", group: "Exterior", description: "Acesso e objetos associados pendentes de verificação.", status: "pendente" },
  { id: "sewers", name: "Esgotos e acessos subterrâneos", group: "Infraestrutura", description: "Mapear entradas, conexões e mecanismos após validar os documentos.", status: "pendente" },
];

const DOCUMENTS: DocumentItem[] = [
  { id: "diary-vivian", title: "Diários de Vivian Roberts", type: "Diário", location: "Local a confirmar", status: "pendente", body: "Transcrição integral ainda não incorporada. Este registro é um marcador de planejamento, não o conteúdo do diário." },
  { id: "letters", title: "Cartas e bilhetes", type: "Correspondência", location: "Múltiplos locais", status: "pendente", body: "Adicionar cada documento como item separado depois de registrar a página de origem e transcrever o texto." },
  { id: "medical-records", title: "Registros médicos e laudos", type: "Documento oficial", location: "Hospital — local exato a confirmar", status: "pendente", body: "Adicionar apenas após conferir texto, autoria, data, rasuras e página de origem." },
  { id: "photos", title: "Fotografias e versos", type: "Fotografia", location: "Local a confirmar", status: "pendente", body: "Cada fotografia deve ter sua própria ficha, com descrição visual e transcrição do verso quando legível." },
  { id: "recordings", title: "Gravações e mensagens", type: "Áudio", location: "Local a confirmar", status: "pendente", body: "Transcrever sem completar trechos incertos. Guardar a referência à fonte e distinguir gravação original de interpretação." },
];

const statusLabel: Record<ReviewStatus, string> = {
  pendente: "Revisão pendente",
  confirmado: "Confirmado na fonte",
  contradicao: "Contradição em aberto",
};

function StatusPill({ status }: { status: ReviewStatus }) {
  return <span className="inline-flex border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-200">{statusLabel[status]}</span>;
}

/**
 * Base isolada do Capítulo 6. Ainda não está ligada ao menu principal:
 * integrar somente após revisar as transcrições e as dependências do caso.
 */
export function VivianRobertsCase({ onBack }: { onBack?: () => void }) {
  const [section, setSection] = useState<"pessoas" | "locais" | "documentos">("pessoas");
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);

  const filteredPeople = useMemo(() => PEOPLE.filter((p) => `${p.name} ${p.role} ${p.note}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const filteredPlaces = useMemo(() => PLACES.filter((p) => `${p.name} ${p.group} ${p.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const filteredDocuments = useMemo(() => DOCUMENTS.filter((d) => `${d.title} ${d.type} ${d.location}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const closeDetail = () => { setSelectedPerson(null); setSelectedPlace(null); setSelectedDocument(null); };

  return (
    <main className="min-h-screen bg-[#11110f] px-4 py-6 text-[#eee9df] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#c4a779]">Dexter Revival Project · Capítulo 06</p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">O Caso Vivian Roberts</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">Arquivo investigativo em preparação. Os registros marcados como pendentes ainda não foram conferidos integralmente contra o material-fonte.</p>
          </div>
          {onBack && <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"><ArrowLeft size={16} /> Voltar aos capítulos</button>}
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4"><Users className="mb-3 text-[#c4a779]" /><p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">Personagens catalogados</p><p className="mt-1 text-3xl">{PEOPLE.length}</p></div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4"><MapPin className="mb-3 text-[#c4a779]" /><p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">Locais para revisar</p><p className="mt-1 text-3xl">{PLACES.length}</p></div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4"><BookOpen className="mb-3 text-[#c4a779]" /><p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">Grupos documentais</p><p className="mt-1 text-3xl">{DOCUMENTS.length}</p></div>
        </section>

        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Seções do dossiê">
          {([{ id: "pessoas", label: "Personagens" }, { id: "locais", label: "Locais" }, { id: "documentos", label: "Documentos e evidências" }] as const).map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={section === item.id} onClick={() => { setSection(item.id); setQuery(""); closeDetail(); }} className={`min-h-11 border px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${section === item.id ? "border-[#c4a779] bg-[#c4a779]/10 text-[#e6cfaa]" : "border-[#4b4439] text-[#bdb5a8] hover:border-[#79664c]"}`}>{item.label}</button>
          ))}
        </div>

        <label className="mt-4 flex max-w-2xl items-center gap-3 border border-[#4b4439] bg-[#1b1a17] px-3">
          <FileSearch size={18} className="shrink-0 text-[#c4a779]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar personagem, local ou documento..." className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#81796d]" />
        </label>

        {section === "pessoas" && <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filteredPeople.map((person) => <button key={person.id} type="button" onClick={() => { setSelectedPerson(person); setSelectedPlace(null); setSelectedDocument(null); }} className="min-h-36 border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#242119]"><div className="flex items-start justify-between gap-3"><h2 className="font-display text-xl">{person.name}</h2><span className="text-[#c4a779]">↗</span></div><p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">{person.role}</p><p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{person.note}</p><div className="mt-3"><StatusPill status={person.status} /></div></button>)}</section>}

        {section === "locais" && <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filteredPlaces.map((place) => <button key={place.id} type="button" onClick={() => { setSelectedPlace(place); setSelectedPerson(null); setSelectedDocument(null); }} className="min-h-36 border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#242119]"><div className="flex items-start justify-between gap-3"><h2 className="font-display text-xl">{place.name}</h2><MapPin size={17} className="shrink-0 text-[#c4a779]" /></div><p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">{place.group}</p><p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{place.description}</p><div className="mt-3"><StatusPill status={place.status} /></div></button>)}</section>}

        {section === "documentos" && <section className="mt-5 grid gap-3 sm:grid-cols-2">{filteredDocuments.map((doc) => <button key={doc.id} type="button" onClick={() => { setSelectedDocument(doc); setSelectedPerson(null); setSelectedPlace(null); }} className="border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779]"><div className="flex items-start justify-between gap-3"><h2 className="font-display text-xl">{doc.title}</h2><BookOpen size={17} className="shrink-0 text-[#c4a779]" /></div><p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">{doc.type} · {doc.location}</p><p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{doc.body}</p><div className="mt-3"><StatusPill status={doc.status} /></div></button>)}</section>}

        {(selectedPerson || selectedPlace || selectedDocument) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="presentation" onClick={closeDetail}><section role="dialog" aria-modal="true" aria-label="Detalhes do item selecionado" className="max-h-[85vh] w-full max-w-2xl overflow-auto border border-[#79664c] bg-[#1b1a17] p-5 sm:p-7" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">Dossiê de investigação</p><h2 className="mt-2 font-display text-2xl sm:text-3xl">{selectedPerson?.name ?? selectedPlace?.name ?? selectedDocument?.title}</h2></div><button type="button" onClick={closeDetail} aria-label="Fechar detalhes" className="min-h-10 border border-[#4b4439] p-2 hover:border-[#c4a779]"><X size={18} /></button></div><div className="mt-5 space-y-4 text-sm leading-relaxed text-[#c9c1b5]">{selectedPerson && <><p className="text-[#c4a779]">{selectedPerson.role}</p><p>{selectedPerson.note}</p><p>As informações biográficas e eventuais relações causais serão preenchidas após conferência das fontes documentais.</p><StatusPill status={selectedPerson.status} /></>}{selectedPlace && <><p className="text-[#c4a779]">{selectedPlace.group}</p><p>{selectedPlace.description}</p><p>O inventário de objetos, documentos, portas e dependências deste local será preenchido a partir das transcrições revisadas.</p><StatusPill status={selectedPlace.status} /></>}{selectedDocument && <><p className="text-[#c4a779]">{selectedDocument.type} · {selectedDocument.location}</p><p className="whitespace-pre-wrap">{selectedDocument.body}</p><StatusPill status={selectedDocument.status} /></>}</div></section></div>}

        <footer className="mt-10 border-t border-[#4b4439] pt-4 text-xs leading-relaxed text-[#81796d]">Versão-base de organização. Não representa ainda o caso jogável final; não contém solução oficial nem rota alternativa concluída.</footer>
      </div>
    </main>
  );
}
