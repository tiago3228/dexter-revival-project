import { ExternalLink } from "lucide-react";
import { playTrilogySfx } from "./trilogyAudio";

export const TRILOGY_SALES_URL = "https://trilogia-blackpine.lovable.app";

type Chapter = 7 | 8 | 9;

function TrilogyChapterIcon({ chapter }: { chapter: Chapter }) {
  if (chapter === 7) {
    return (
      <svg
        aria-hidden="true"
        className="trilogy-book-icon shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="5.5" strokeDasharray="1.4 2" />
        <path d="M12 7.5v9M7.5 12h9" />
      </svg>
    );
  }

  if (chapter === 8) {
    return (
      <svg
        aria-hidden="true"
        className="trilogy-book-icon shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 18.5 8.5 7l3.5 4 3.5-6 4.5 13.5" />
        <path d="M3.5 18.5h17" />
        <path d="m7 18.5 2-4 2.5 2.5 2.5-3 3 4.5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="trilogy-book-icon shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h5" />
      <path d="M12 20v-4M9 16h6" />
    </svg>
  );
}

export function TrilogyBookPurchaseButton({
  chapter,
  compact = false,
  soundOn = true,
}: {
  chapter: Chapter;
  compact?: boolean;
  soundOn?: boolean;
}) {
  return (
    <a
      href={TRILOGY_SALES_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-chapter={chapter}
      onClick={() => playTrilogySfx("purchase", soundOn)}
      className={`trilogy-book-purchase group ${
        compact
          ? "inline-flex items-center gap-2 border border-primary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary transition hover:bg-primary/10"
          : "inline-flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-3 font-mono text-xs uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
      }`}
    >
      <TrilogyChapterIcon chapter={chapter} />
      <span>Comprar livro · Capítulo {chapter}</span>
      <ExternalLink className="shrink-0" size={compact ? 13 : 15} />
    </a>
  );
}
