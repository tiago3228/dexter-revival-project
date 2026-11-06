import { ExternalLink, ShoppingBag } from "lucide-react";

export const TRILOGY_SALES_URL = "https://trilogia-blackpine.lovable.app";

export function TrilogyBookPurchaseButton({
  chapter,
  compact = false,
}: {
  chapter: 7 | 8 | 9;
  compact?: boolean;
}) {
  return (
    <a
      href={TRILOGY_SALES_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "inline-flex items-center gap-2 border border-primary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary transition hover:bg-primary/10"
          : "inline-flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-3 font-mono text-xs uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
      }
    >
      <ShoppingBag size={compact ? 14 : 16} />
      Comprar livro · Capítulo {chapter}
      <ExternalLink size={compact ? 13 : 15} />
    </a>
  );
}
