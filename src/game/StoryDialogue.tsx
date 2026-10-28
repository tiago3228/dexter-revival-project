import { useState } from "react";

export type StoryLine = { speaker: string; text: string };
export type StoryChoice = { id: string; label: string; lines: StoryLine[]; audioSrc?: string };
export type StoryDialogueScene = {
  id: string;
  title: string;
  subtitle: string;
  audioSrc?: string;
  opening: StoryLine[];
  choices: StoryChoice[];
};

export function StoryDialogue({
  scene,
  onClose,
}: {
  scene: StoryDialogueScene;
  onClose: () => void;
}) {
  const [lines, setLines] = useState(scene.opening);
  const [choices, setChoices] = useState(scene.choices);
  const [choiceAudioSrc, setChoiceAudioSrc] = useState<string | null>(null);

  const ask = (choice: StoryChoice) => {
    setLines((current) => [...current, ...choice.lines]);
    setChoices((current) => current.filter((item) => item.id !== choice.id));
    setChoiceAudioSrc(choice.audioSrc ?? null);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`story-dialogue-${scene.id}`}
    >
      <button
        type="button"
        aria-label="Fechar conversa"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <article className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-primary/60 bg-background p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Interação investigativa · diálogo opcional
            </p>
            <h2
              id={`story-dialogue-${scene.id}`}
              className="mt-2 font-display text-2xl sm:text-3xl"
            >
              {scene.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{scene.subtitle}</p>
            {scene.audioSrc && (
              <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-primary">
                  Áudio opcional · diálogo completo
                </p>
                <audio
                  className="h-9 w-full"
                  controls
                  preload="none"
                  src={scene.audioSrc}
                  aria-label={`Ouvir diálogo completo: ${scene.title}`}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 border border-border px-3 py-2 font-mono text-[10px] uppercase hover:border-primary"
          >
            Fechar
          </button>
        </div>
        <div className="mt-5 space-y-3" aria-live="polite">
          {lines.map((line, index) => (
            <div
              key={`${scene.id}-${index}`}
              className={`max-w-[95%] border p-4 ${line.speaker.startsWith("Dexter") || line.speaker.startsWith("Johnson") ? "ml-auto border-primary/50 bg-primary/5" : "border-border bg-card/40"}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                {line.speaker}
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">{line.text}</p>
            </div>
          ))}
        </div>
        {choiceAudioSrc && (
          <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-primary">
              Áudio opcional · resposta selecionada
            </p>
            <audio
              className="h-9 w-full"
              controls
              preload="none"
              src={choiceAudioSrc}
              aria-label="Ouvir a resposta da pergunta selecionada"
            />
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              A reprodução não altera as escolhas nem a progressão da investigação.
            </p>
          </div>
        )}
        {choices.length > 0 ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Escolha uma pergunta para continuar
            </p>
            <div className="grid gap-2">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => ask(choice)}
                  className="min-h-11 border border-border px-4 py-3 text-left text-sm transition hover:border-primary hover:bg-primary/5"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
            Você explorou todos os assuntos desta conversa. Feche a janela para voltar ao caso.
          </p>
        )}
      </article>
    </div>
  );
}
