import { useEffect, useState } from "react";
import { VivianQuickChallenges } from "./VivianQuickChallenges";
import { QUICK_CASE_IDS } from "./vivianQuickCases";

const SAVE_KEY = "vivian-playable-investigation-v1";
const allowedQuickCaseIds = new Set<string>(QUICK_CASE_IDS);

type QuickChallengeProgress = {
  found: string[];
  completed: string[];
};

function validStringIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
    : [];
}

function readQuickChallengeProgress(): QuickChallengeProgress {
  if (typeof window === "undefined") return { found: [], completed: [] };
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return { found: [], completed: [] };
    const save = JSON.parse(raw) as { found?: unknown; completedQuickCases?: unknown } | null;
    return {
      found: validStringIds(save?.found),
      completed: validStringIds(save?.completedQuickCases).filter((id) =>
        allowedQuickCaseIds.has(id),
      ),
    };
  } catch {
    return { found: [], completed: [] };
  }
}

function saveQuickCaseCompletion(id: string): string[] {
  if (!allowedQuickCaseIds.has(id)) return readQuickChallengeProgress().completed;

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    const save =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    const existing = validStringIds(save["completedQuickCases"]).filter((item) =>
      allowedQuickCaseIds.has(item),
    );
    const completed = [...new Set([...existing, id])];
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...save, completedQuickCases: completed }),
    );
    window.dispatchEvent(new Event("vivian-investigation-progress"));
    return completed;
  } catch {
    return [...new Set([...readQuickChallengeProgress().completed, id])];
  }
}

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
  const [progress, setProgress] = useState<QuickChallengeProgress>({ found: [], completed: [] });

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
