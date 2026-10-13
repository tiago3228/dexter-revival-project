import { PAINSCREEK_ARCHIVE_VOICES } from "@/game/painscreekArchiveVoices";

const kindLabels = {
  "diary-dialogue": "Diálogo registrado em diário",
  "press-quote": "Citação publicada em jornal",
  "press-report": "Relato jornalístico — não literal",
  card: "Texto de cartão",
  letter: "Trecho de carta",
} as const;

export function PainscreekArchiveVoices() {
  return (
    <section
      id="falas-documentadas"
      aria-labelledby="falas-documentadas-titulo"
      className="mt-8 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
        Complemento narrativo · fontes escritas
      </p>
      <h2 id="falas-documentadas-titulo" className="mt-1 text-xl font-semibold">
        Falas e trechos do arquivo
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        No estilo dos depoimentos do Caso Monroe, estes trechos dão voz às fontes sem reescrever o
        catálogo. Cada item indica se é diálogo anotado, citação publicada, relato indireto ou texto
        de carta/cartão. O material fornecido não contém gravações originais de depoimentos.
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {PAINSCREEK_ARCHIVE_VOICES.map((voice) => (
          <article key={voice.id} className="rounded-lg border border-border bg-background/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                  {kindLabels[voice.kind]}
                </p>
                <h3 className="mt-1 text-base font-semibold text-card-foreground">{voice.title}</h3>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{voice.source}</p>
            </div>

            {voice.lines ? (
              <div className="mt-3 space-y-2" aria-label={`Diálogo: ${voice.title}`}>
                {voice.lines.map((line, index) => (
                  <div
                    key={`${voice.id}-${index}`}
                    className={`max-w-[95%] border p-3 ${index % 2 === 1 ? "ml-auto border-primary/50 bg-primary/5" : "border-border bg-card/40"}`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      {line.speaker}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">{line.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <blockquote className="mt-3 border-l-2 border-primary/70 pl-3 text-sm leading-6 text-foreground">
                {voice.speaker && (
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-primary">
                    {voice.speaker}
                  </span>
                )}
                {voice.kind === "press-report" ? voice.text : `“${voice.text}”`}
              </blockquote>
            )}

            <p className="mt-3 text-xs leading-5 text-muted-foreground">{voice.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
