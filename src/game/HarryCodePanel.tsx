export function HarryCodePanel({
  line,
  onDismiss,
}: {
  line: string | null;
  onDismiss: () => void;
}) {
  if (!line) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="mt-4 border-l-2 border-primary bg-primary/5 px-4 py-3 shadow-[inset_0_0_24px_rgba(180,35,45,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            Código de Harry · reação
          </p>
          <p className="mt-2 font-display text-lg italic leading-relaxed text-foreground">
            “{line}”
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dispensar fala do Código de Harry"
          className="min-h-9 shrink-0 border border-border px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
        >
          Fechar
        </button>
      </div>
    </aside>
  );
}
