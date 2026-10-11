import { CASE_IDS, type CaseId } from "./achievements";

type TimerRecord = {
  elapsedMs: number;
  startedAt: number | null;
};

type TimerStore = Partial<Record<CaseId, TimerRecord>>;

const STORAGE_KEY = "dexter-case-timers-v1";

function readTimers(): TimerStore {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      unknown
    >;
    const timers: TimerStore = {};
    for (const caseId of CASE_IDS) {
      const value = parsed[caseId];
      if (!value || typeof value !== "object") continue;
      const record = value as Partial<TimerRecord>;
      if (typeof record.elapsedMs !== "number" || !Number.isFinite(record.elapsedMs)) continue;
      timers[caseId] = {
        elapsedMs: Math.max(0, record.elapsedMs),
        startedAt:
          typeof record.startedAt === "number" && Number.isFinite(record.startedAt)
            ? record.startedAt
            : null,
      };
    }
    return timers;
  } catch {
    return {};
  }
}

function writeTimers(timers: TimerStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch {
    // Keep the investigation playable when browser storage is unavailable.
  }
}

export function beginCaseTimer(caseId: CaseId, restart = false, now = Date.now()) {
  const timers = readTimers();
  const current = timers[caseId];
  if (restart || !current) {
    timers[caseId] = { elapsedMs: 0, startedAt: now };
  } else if (current.startedAt === null) {
    timers[caseId] = { ...current, startedAt: now };
  }
  writeTimers(timers);
}

export function pauseCaseTimer(caseId: CaseId, now = Date.now()) {
  const timers = readTimers();
  const current = timers[caseId];
  if (!current || current.startedAt === null) return;
  timers[caseId] = {
    elapsedMs: current.elapsedMs + Math.max(0, now - current.startedAt),
    startedAt: null,
  };
  writeTimers(timers);
}

export function finishCaseTimer(caseId: CaseId, now = Date.now()) {
  const timers = readTimers();
  const current = timers[caseId];
  if (!current) return 1;
  const elapsedMs =
    current.elapsedMs + (current.startedAt === null ? 0 : Math.max(0, now - current.startedAt));
  delete timers[caseId];
  writeTimers(timers);
  return Math.max(1, Math.floor(elapsedMs / 1000));
}
