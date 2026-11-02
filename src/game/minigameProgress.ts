import { GRID_LEVEL_IDS } from "./vivianLogicGrid";
import { readQuickChallengeProgress } from "./vivianQuickCaseProgress";
import { QUICK_CASE_IDS } from "./vivianQuickCases";

export const MINIGAME_PROGRESS_STORAGE_KEY = "dexter-minigame-progress-v1";
export const MINIGAME_PROGRESS_EVENT = "dexter-minigame-progress";

const levelIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `level-${index + 1}`);

export const MINIGAME_CATALOG = [
  { id: "flag-game", title: "Mini Game de Bandeiras", unitIds: ["played"], continuous: true },
  { id: "circuit-panel", title: "Painel Elétrico", unitIds: levelIds(3) },
  { id: "dot-connection", title: "Conexão de Pontos", unitIds: levelIds(4) },
  { id: "seal-code", title: "Código do Lacre", unitIds: ["solved"] },
  { id: "deduction-grid", title: "Grade de Dedução", unitIds: [...GRID_LEVEL_IDS] },
  { id: "relations-dossier", title: "Dossiê de relações", unitIds: ["solved"] },
  { id: "witness-route", title: "A rota da fita", unitIds: levelIds(2) },
  { id: "detective-ring", title: "O anel do detetive", unitIds: levelIds(2) },
  { id: "quick-challenges", title: "Depoimentos e casos curtos", unitIds: [...QUICK_CASE_IDS] },
  { id: "painscreek-murdle-grid", title: "Murdle de Painscreek", unitIds: ["solved"] },
  { id: "evidence-chain", title: "Cadeia de Evidência", unitIds: ["solved"] },
  { id: "mine-settlement", title: "Fechamento de contas: a mina", unitIds: ["solved"] },
  { id: "sheriff-transfer", title: "Despacho do xerife", unitIds: ["solved"] },
  { id: "impossible-window", title: "Janela impossível — Andrew", unitIds: ["solved"] },
] as const;

export type MinigameId = (typeof MINIGAME_CATALOG)[number]["id"];
export type MinigameProgressState = {
  completed: Record<MinigameId, string[]>;
  started: MinigameId[];
};

const catalogById = new Map(MINIGAME_CATALOG.map((item) => [item.id, item]));
const defaults = (): MinigameProgressState => {
  const completed = Object.create(null) as Record<MinigameId, string[]>;
  for (const { id } of MINIGAME_CATALOG) completed[id] = [];
  return { completed, started: [] };
};

function cleanState(value: unknown): MinigameProgressState {
  const result = defaults();
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  const candidate = value as { completed?: unknown; started?: unknown };
  if (
    candidate.completed &&
    typeof candidate.completed === "object" &&
    !Array.isArray(candidate.completed)
  ) {
    for (const [rawId, units] of Object.entries(candidate.completed)) {
      if (!catalogById.has(rawId as MinigameId) || !Array.isArray(units)) continue;
      const id = rawId as MinigameId;
      const allowed = new Set<string>(catalogById.get(id)!.unitIds);
      result.completed[id] = [
        ...new Set(
          units.filter((unit): unit is string => typeof unit === "string" && allowed.has(unit)),
        ),
      ];
    }
  }
  if (Array.isArray(candidate.started)) {
    result.started = [
      ...new Set(
        candidate.started.filter(
          (id): id is MinigameId => typeof id === "string" && catalogById.has(id as MinigameId),
        ),
      ),
    ];
  }
  return result;
}

function mergeLegacy(state: MinigameProgressState): MinigameProgressState {
  if (typeof window === "undefined") return state;
  try {
    const completed = { ...state.completed };
    if (window.localStorage.getItem("dexter-circuit-panel-completed-v1") === "true") {
      completed["circuit-panel"] = [...new Set([...completed["circuit-panel"], ...levelIds(3)])];
    } else {
      const level = window.localStorage.getItem("dexter-circuit-panel-level-v1");
      if (level === "1")
        completed["circuit-panel"] = [
          ...new Set([...completed["circuit-panel"], "level-1", "level-2"]),
        ];
      if (level === "2")
        completed["circuit-panel"] = [...new Set([...completed["circuit-panel"], ...levelIds(3)])];
    }
    if (window.localStorage.getItem("dexter-dot-connection-completed-v1") === "true") {
      completed["dot-connection"] = [...new Set([...completed["dot-connection"], ...levelIds(4)])];
    }
    const quickCompleted = readQuickChallengeProgress().completed;
    const validQuickIds = new Set<string>(QUICK_CASE_IDS);
    completed["quick-challenges"] = [
      ...new Set([
        ...completed["quick-challenges"],
        ...quickCompleted.filter((id) => validQuickIds.has(id)),
      ]),
    ];
    return { ...state, completed };
  } catch {
    return state;
  }
}

export function readMinigameProgress(): MinigameProgressState {
  if (typeof window === "undefined") return defaults();
  let state = defaults();
  try {
    const raw = window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY);
    if (raw) state = cleanState(JSON.parse(raw));
  } catch {
    state = defaults();
  }
  return mergeLegacy(state);
}

function persist(state: MinigameProgressState): MinigameProgressState {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MINIGAME_PROGRESS_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* armazenamento indisponível */
    }
    window.dispatchEvent(new Event(MINIGAME_PROGRESS_EVENT));
  }
  return state;
}

export function recordMinigameProgress(id: MinigameId, unitId: string): MinigameProgressState {
  const item = catalogById.get(id);
  if (!item || !item.unitIds.includes(unitId as never)) return readMinigameProgress();
  const state = readMinigameProgress();
  state.completed[id] = [...new Set([...state.completed[id], unitId])];
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY);
      const saved = raw ? cleanState(JSON.parse(raw)) : defaults();
      for (const { id: gameId } of MINIGAME_CATALOG) {
        saved.completed[gameId] = [
          ...new Set([...saved.completed[gameId], ...state.completed[gameId]]),
        ];
      }
      saved.completed[id] = [...new Set([...saved.completed[id], unitId])];
      saved.started = [...new Set([...saved.started, ...state.started])];
      return persist(saved);
    } catch {
      return persist(state);
    }
  }
  return state;
}

export function markMinigameStarted(id: MinigameId): MinigameProgressState {
  if (!catalogById.has(id)) return readMinigameProgress();
  const state = readMinigameProgress();
  state.started = [...new Set([...state.started, id])];
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(MINIGAME_PROGRESS_STORAGE_KEY);
      const saved = raw ? cleanState(JSON.parse(raw)) : defaults();
      saved.started = [...new Set([...saved.started, id])];
      return persist(saved);
    } catch {
      return persist(state);
    }
  }
  return state;
}
