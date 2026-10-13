import {
  PAINSCREEK_EVIDENCE_IMAGE_COUNT,
  PAINSCREEK_EVIDENCE_IMAGE_GROUPS,
} from "@/game/painscreekEvidenceImages";

export function PainscreekEvidenceGallery() {
  return (
    <section
      id="galeria-imagens"
      aria-labelledby="galeria-imagens-titulo"
      className="mt-8 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Material complementar
          </p>
          <h2 id="galeria-imagens-titulo" className="mt-1 text-xl font-semibold">
            Galeria de imagens das fontes
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {PAINSCREEK_EVIDENCE_IMAGE_COUNT} imagens enviadas para complementar os registros
            escritos, agrupadas por diário, jornal ou tipo de documento. Clique em uma miniatura
            para abrir a imagem original em outra aba. Esta galeria não substitui nem altera o
            catálogo de evidências.
          </p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {PAINSCREEK_EVIDENCE_IMAGE_COUNT} imagens
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {PAINSCREEK_EVIDENCE_IMAGE_GROUPS.map((group) => (
          <details key={group.id} className="rounded-lg border border-border bg-background/50">
            <summary className="cursor-pointer px-3 py-3 text-sm font-medium hover:text-primary">
              {group.title}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {group.images.length} {group.images.length === 1 ? "imagem" : "imagens"}
              </span>
            </summary>
            <div className="grid grid-cols-2 gap-3 border-t border-border p-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.images.map((image, index) => (
                <a
                  key={image.fileName}
                  href={image.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Abrir imagem original ${image.fileName}`}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img
                    src={image.thumbnailUrl}
                    alt={`${group.title}, imagem ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-contain bg-black/5"
                  />
                  <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground group-hover:text-foreground">
                    {image.fileName}
                  </span>
                </a>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
