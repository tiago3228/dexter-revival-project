import { useMemo, useState } from "react";
import {
  Search,
  FileText,
  CircleAlert,
  CheckCircle2,
  Clock3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PAINSCREEK_EVIDENCE_001_116,
  type PainscreekEvidence,
  type PainscreekEvidenceStatus,
} from "@/game/painscreekEvidence";
import { PainscreekArchiveVoices } from "@/game/PainscreekArchiveVoices";
import { PainscreekEvidenceGallery } from "@/game/PainscreekEvidenceGallery";

const statusLabels: Record<PainscreekEvidenceStatus, string> = {
  unverified: "Não verificada",
  "visually-checked": "Conferida visualmente",
  incomplete: "Incompleta",
  contradictory: "Fontes conflitantes",
};

const statusStyles: Record<PainscreekEvidenceStatus, string> = {
  unverified: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  "visually-checked": "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  incomplete: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  contradictory: "border-rose-500/40 bg-rose-500/10 text-rose-200",
};

const confidenceLabels = { low: "Baixa", medium: "Média", high: "Alta" } as const;

function EvidenceCard({ evidence }: { evidence: PainscreekEvidence }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-wider text-muted-foreground">
            {evidence.id} · PÁGINAS {evidence.pages.join(", ")}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-card-foreground">{evidence.title}</h2>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[evidence.status]}`}
        >
          {statusLabels[evidence.status]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{evidence.documented}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-muted px-2 py-1">
          Confiança: {confidenceLabels[evidence.confidence]}
        </span>
        <span className="rounded-md bg-muted px-2 py-1">{evidence.sourceType}</span>
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? "Ocultar fontes e ressalvas" : "Ver fontes e ressalvas"}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3 text-sm leading-6">
          <div>
            <h3 className="font-semibold text-card-foreground">Verificação pendente</h3>
            <p className="text-muted-foreground">{evidence.pendingVerification}</p>
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Limite de interpretação</h3>
            <p className="text-muted-foreground">{evidence.playerInference}</p>
          </div>
          <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <CircleAlert size={15} className="mt-0.5 shrink-0" />O registro descreve o que a fonte
            relata; não transforma uma alegação em fato comprovado.
          </p>
        </div>
      )}
    </article>
  );
}

export function PainscreekEvidenceExplorer() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PainscreekEvidenceStatus>("all");
  const [showSourcesNote, setShowSourcesNote] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return [...PAINSCREEK_EVIDENCE_001_116]
      .sort((a, b) => (a.pages[0] ?? 0) - (b.pages[0] ?? 0) || a.id.localeCompare(b.id))
      .filter((item) => {
        const matchesStatus = status === "all" || item.status === status;
        const searchable = [
          item.id,
          item.title,
          item.documented,
          item.sourceType,
          item.pendingVerification,
          item.playerInference,
          ...item.pages.map(String),
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR");
        return matchesStatus && (!normalized || searchable.includes(normalized));
      });
  }, [query, status]);

  const counts = useMemo(
    () => ({
      all: PAINSCREEK_EVIDENCE_001_116.length,
      pending: PAINSCREEK_EVIDENCE_001_116.filter((item) => item.status !== "visually-checked")
        .length,
      checked: PAINSCREEK_EVIDENCE_001_116.filter((item) => item.status === "visually-checked")
        .length,
    }),
    [],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-6">
          <a
            href="/?resumePainscreek=1"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao jogo
          </a>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Arquivo investigativo · Painscreek
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Catálogo de evidências
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Consulte as {PAINSCREEK_EVIDENCE_001_116.length} referências catalogadas a partir das
            páginas 1–116 do PDF. Busque por título, página ou conteúdo e abra cada registro para
            ver suas ressalvas.
          </p>
          <a
            href="#galeria-imagens"
            className="mt-3 inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
          >
            Abrir galeria complementar de imagens
          </a>
          <a
            href="#falas-documentadas"
            className="ml-2 mt-3 inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
          >
            Ler falas documentadas
          </a>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Registros no catálogo</p>
              <p className="mt-1 text-2xl font-semibold">{counts.all}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Conferidos visualmente</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                <CheckCircle2 size={20} className="text-emerald-400" />
                {counts.checked}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Ainda exigem revisão</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                <Clock3 size={20} className="text-amber-400" />
                {counts.pending}
              </p>
            </div>
          </div>
        </header>

        <section
          aria-label="Filtros de evidências"
          className="sticky top-0 z-10 -mx-4 mt-5 space-y-3 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4"
        >
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, página ou conteúdo…"
              className="w-full rounded-lg border border-input bg-card py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="evidence-status" className="text-sm text-muted-foreground">
              Estado da revisão
            </label>
            <select
              id="evidence-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | PainscreekEvidenceStatus)
              }
              className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm sm:flex-none"
            >
              <option value="all">Todos os estados</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs text-muted-foreground">
              {filtered.length} de {counts.all} registros
            </span>
          </div>
        </section>

        <section className="mt-5 space-y-3" aria-live="polite">
          {filtered.length ? (
            filtered.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} />)
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <FileText size={28} className="mx-auto text-muted-foreground" />
              <h2 className="mt-3 font-semibold">Nenhuma evidência encontrada</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outro termo ou limpe o filtro de revisão.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
                className="mt-4 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        <PainscreekArchiveVoices />
        <PainscreekEvidenceGallery />

        <footer className="mt-8 border-t border-border py-5 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setShowSourcesNote(!showSourcesNote)}
            aria-expanded={showSourcesNote}
            className="font-medium text-foreground hover:underline"
          >
            {showSourcesNote ? "Ocultar nota metodológica" : "Ler nota metodológica"}
          </button>
          {showSourcesNote && (
            <p className="mt-3 max-w-3xl leading-6">
              Este é um catálogo documental preliminar, não um sistema de solução do caso. A
              paginação segue o PDF de origem. Relatos, notícias, acusações e inferências permanecem
              diferenciados; relatos temáticos podem remeter a documentos já catalogados e não são
              confirmações independentes. O catálogo percorre as páginas 1–116; entradas baseadas em
              OCR continuam sinalizadas para revisão visual.
            </p>
          )}
        </footer>
      </div>
    </main>
  );
}
