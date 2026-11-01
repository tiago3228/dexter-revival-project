import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PainscreekEvidenceImage } from "@/game/painscreekEvidenceImages";

type PainscreekImageViewerProps = {
  images: readonly PainscreekEvidenceImage[];
  title: string;
  getThumbnailLabel?: (image: PainscreekEvidenceImage, index: number) => string;
  className?: string;
  thumbnailClassName?: string;
  thumbnailImageClassName?: string;
  thumbnailCaptionClassName?: string;
};

export function PainscreekImageViewer({
  images,
  title,
  getThumbnailLabel = (image, index) => `Abrir imagem ${index + 1}: ${image.fileName}`,
  className = "grid grid-cols-2 gap-3 sm:grid-cols-3",
  thumbnailClassName = "group overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  thumbnailImageClassName = "aspect-[4/3] w-full bg-black/5 object-contain",
  thumbnailCaptionClassName = "block truncate px-2 py-1.5 text-xs text-muted-foreground group-hover:text-foreground",
}: PainscreekImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const activeImage = activeIndex === null ? null : (images[activeIndex] ?? null);

  const navigate = (direction: -1 | 1) => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return Math.max(0, Math.min(images.length - 1, current + direction));
    });
  };

  return (
    <>
      <div className={className}>
        {images.map((image, index) => (
          <button
            key={image.fileName}
            type="button"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setActiveIndex(index);
            }}
            aria-label={getThumbnailLabel(image, index)}
            aria-haspopup="dialog"
            className={thumbnailClassName}
          >
            <img
              src={image.thumbnailUrl}
              alt={`${title}, imagem ${index + 1}`}
              loading="lazy"
              decoding="async"
              className={thumbnailImageClassName}
            />
            <span className={thumbnailCaptionClassName}>{image.fileName}</span>
          </button>
        ))}
      </div>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <DialogContent
          className="flex h-[92vh] max-h-[900px] w-[96vw] max-w-[1400px] flex-col gap-3 overflow-hidden border-[#79664c] bg-[#141311] p-3 text-[#eee9df] sm:p-5"
          onKeyDown={(event) => {
            if (activeIndex === null) return;
            if (event.key === "ArrowLeft" && activeIndex > 0) {
              event.preventDefault();
              navigate(-1);
            } else if (event.key === "ArrowRight" && activeIndex < images.length - 1) {
              event.preventDefault();
              navigate(1);
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <DialogHeader className="shrink-0 pr-8 text-left">
            <DialogTitle className="font-display text-xl text-[#ead8b8]">{title}</DialogTitle>
            <DialogDescription className="text-xs text-[#a9a092]">
              {activeIndex === null
                ? "Selecione uma miniatura para abrir a imagem."
                : `Imagem ${activeIndex + 1} de ${images.length} · Use as setas do teclado para navegar.`}
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden border border-[#4b4439] bg-black">
            {activeImage && activeIndex !== null && (
              <>
                <img
                  src={activeImage.originalUrl}
                  alt={`${title}: ${activeImage.fileName}`}
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      disabled={activeIndex === 0}
                      aria-label="Imagem anterior"
                      className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#79664c] bg-black/75 text-[#ead8b8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 sm:left-4"
                    >
                      <ArrowLeft size={21} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(1)}
                      disabled={activeIndex === images.length - 1}
                      aria-label="Próxima imagem"
                      className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#79664c] bg-black/75 text-[#ead8b8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 sm:right-4"
                    >
                      <ArrowRight size={21} aria-hidden="true" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {activeImage && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
              <p className="max-w-[60%] truncate font-mono text-xs text-[#c9c1b5]">
                {activeImage.fileName}
              </p>
              <a
                href={activeImage.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 border border-[#79664c] px-3 py-2 text-xs text-[#ead8b8] transition hover:border-[#c4a779] hover:bg-[#c4a779]/10"
              >
                <ExternalLink size={15} aria-hidden="true" /> Abrir imagem original
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
