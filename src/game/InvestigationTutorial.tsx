import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type InvestigationTutorialProps = {
  chapter: 8 | 9;
  onClose: () => void;
};

export function InvestigationTutorial({ chapter, onClose }: InvestigationTutorialProps) {
  const title = chapter === 8 ? "O verão de 1986" : "Threshold · Ashen Creek";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:px-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="investigation-tutorial-title"
        className="w-full max-w-2xl border border-primary/60 bg-card/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)] sm:p-10"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Guia rápido · Capítulo {String(chapter).padStart(2, "0")}
        </p>
        <h1 id="investigation-tutorial-title" className="mt-3 font-display text-4xl sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Antes de avançar, use estas três regras para separar o que o arquivo sustenta do que ele
          apenas sugere.
        </p>
        <ol className="mt-7 space-y-4">
          <Rule number="01" title="Leia antes de classificar">
            Examine os documentos e depoimentos da etapa atual antes de responder às afirmações.
          </Rule>
          <Rule number="02" title="Separe fato, testemunho e hipótese">
            Uma observação pode ser verdadeira sem provar a interpretação feita por uma personagem.
          </Rule>
          <Rule number="03" title="Use apenas evidências comprovadas">
            O veredicto final deve respeitar as fontes e também reconhecer o que continua sem
            resposta.
          </Rule>
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onClose}>
            Entendi, iniciar investigação
          </Button>
          <p className="text-xs text-muted-foreground">
            Você pode rever estas instruções durante o caso.
          </p>
        </div>
      </section>
    </main>
  );
}

function Rule({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 border-l-2 border-primary/60 pl-4">
      <span className="font-mono text-xs text-primary">{number}</span>
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
