type CaseHeroImageProps = {
  src: string;
  alt: string;
  caption: string;
};

export function CaseHeroImage({ src, alt, caption }: CaseHeroImageProps) {
  return (
    <figure className="mx-auto mt-6 w-full max-w-5xl overflow-hidden border border-primary/40 bg-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-[3/2] w-full">
        <img
          src={src}
          alt={alt}
          width={1536}
          height={1024}
          loading="eager"
          decoding="async"
          className="h-full w-full object-contain"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"
        />
      </div>
      <figcaption className="border-t border-primary/25 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:px-4">
        {caption}
      </figcaption>
    </figure>
  );
}
