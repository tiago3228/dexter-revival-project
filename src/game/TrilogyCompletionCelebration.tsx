export function TrilogyCompletionCelebration() {
  return (
    <section
      className="trilogy-completion-celebration mt-8 overflow-hidden border border-amber-300/70 bg-amber-950/30 p-6 text-center sm:p-8"
      aria-label="Celebração de conclusão da trilogia"
    >
      <div className="trilogy-celebration-sparks" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.34em] text-amber-200">
        Arquivo completo · trilogia encerrada
      </p>
      <h2 className="mt-3 font-display text-3xl text-amber-100 sm:text-4xl">
        As três histórias agora formam um único mapa
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-amber-100/75">
        Black Pine, Sparrow Hollow e Threshold foram concluídos. Revise seus melhores tempos e
        pontuações, ou retorne a um capítulo para tentar uma execução mais limpa.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-amber-200">
        <span className="border border-amber-300/50 px-3 py-2">07 · Quarto 17</span>
        <span className="border border-amber-300/50 px-3 py-2">08 · Sparrow Hollow</span>
        <span className="border border-amber-300/50 px-3 py-2">09 · Threshold</span>
      </div>
    </section>
  );
}
