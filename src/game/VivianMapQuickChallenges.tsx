import { useEffect, useState } from "react";
import { VivianQuickChallenges } from "./VivianQuickChallenges";
import { readQuickChallengeProgress, saveQuickCaseCompletion } from "./vivianQuickCaseProgress";

function playMapChallengeCue() {
  if (typeof window === "undefined" || !window.AudioContext) return;

  try {
    const context = new window.AudioContext();
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.035, now + 0.035);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    master.connect(context.destination);

    const notes: readonly [number, number][] = [
      [392, 0],
      [329.63, 0.16],
      [293.66, 0.32],
    ];
    for (const [frequency, offset] of notes) {
      const tone = context.createOscillator();
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(0.0001, now + offset);
      envelope.gain.linearRampToValueAtTime(0.55, now + offset + 0.015);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);
      tone.type = "sine";
      tone.frequency.setValueAtTime(frequency, now + offset);
      tone.connect(envelope);
      envelope.connect(master);
      tone.start(now + offset);
      tone.stop(now + offset + 0.24);
    }

    window.setTimeout(() => void context.close(), 900);
  } catch {
    // O efeito é opcional; navegadores sem Web Audio continuam com a interface normal.
  }
}

export function VivianMapQuickChallenges() {
  const [progress, setProgress] = useState<ReturnType<typeof readQuickChallengeProgress>>({
    found: [],
    completed: [],
  });

  useEffect(() => {
    setProgress(readQuickChallengeProgress());
  }, []);

  const complete = (id: string) => {
    const completed = saveQuickCaseCompletion(id);
    setProgress((current) => ({ ...current, completed }));
  };

  return (
    <VivianQuickChallenges
      found={progress.found}
      completed={progress.completed}
      onComplete={complete}
      onExpandedChange={(expanded) => {
        if (expanded) playMapChallengeCue();
      }}
    />
  );
}
