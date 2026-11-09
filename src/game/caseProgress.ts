export type StoredCaseProgress<T> = {
  version: 1;
  savedAt: number;
  state: T;
};

export function readCaseProgress<T>(key: string): StoredCaseProgress<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as Partial<
      StoredCaseProgress<T>
    > | null;
    if (
      !parsed ||
      parsed.version !== 1 ||
      typeof parsed.savedAt !== "number" ||
      !("state" in parsed)
    ) {
      return null;
    }
    return parsed as StoredCaseProgress<T>;
  } catch {
    return null;
  }
}

export function writeCaseProgress<T>(key: string, state: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ version: 1, savedAt: Date.now(), state } satisfies StoredCaseProgress<T>),
    );
  } catch {
    // A investigação continua jogável quando o armazenamento está indisponível.
  }
}

export function clearCaseProgress(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage restrictions.
  }
}

export function formatSavedAt(savedAt: number) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(savedAt),
    );
  } catch {
    return "recentemente";
  }
}
