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
    />
  );
}
