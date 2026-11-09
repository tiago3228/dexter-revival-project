export const BLACK_PINE_DLC_RECORDS = [
  {
    id: "token",
    title: "A moeda 217",
    text: "O disco de latão traz o número 217 e uma marca de oficina ferroviária. A borda foi limada recentemente, como se alguém quisesse remover uma segunda inscrição.",
  },
  {
    id: "ledger",
    title: "Livro de chaves da estação",
    text: "A chave do armário 217 foi retirada às 23h40 por M. Voss. O livro registra a devolução às 00h15, mas a assinatura está sobreposta por tinta fresca.",
  },
  {
    id: "photograph",
    title: "Fotografia do cais norte",
    text: "Na fotografia, o relógio marca 23h52. Uma luz acesa aparece no cais norte, embora o último trem já tivesse partido.",
  },
  {
    id: "radio",
    title: "Registro de rádio",
    text: "Uma voz pede que a linha fique aberta por mais três minutos. O operador anota apenas: ‘Mara sabia qual sinal usar’.",
  },
] as const;

export const BLACK_PINE_DLC_SUSPECTS = [
  { id: "mara-voss", label: "Mara Voss · chefe da estação" },
  { id: "eli-north", label: "Eli North · operador de rádio" },
  { id: "june-bell", label: "June Bell · arquivista municipal" },
] as const;

export const BLACK_PINE_DLC_OBJECTS = [
  { id: "token-217", label: "A moeda 217" },
  { id: "radio-key", label: "A chave do rádio" },
  { id: "ledger-page", label: "A página arrancada do livro" },
] as const;

export const BLACK_PINE_DLC_LOCATIONS = [
  { id: "north-platform", label: "Cais norte" },
  { id: "station-locker", label: "Armário 217" },
  { id: "municipal-archive", label: "Arquivo municipal" },
] as const;

export const BLACK_PINE_DLC_SOLUTION = {
  suspect: "mara-voss",
  object: "token-217",
  location: "north-platform",
} as const;

export const BLACK_PINE_DLC_SAVE_KEY = "dexter-blackpine-dlc-moeda-217-v1";

export type BlackPineDlcSave = {
  completed: boolean;
  attempts: number;
  bestScore: number;
  bestTime: number;
};

export function loadBlackPineDlcSave(): BlackPineDlcSave {
  const fallback = { completed: false, attempts: 0, bestScore: 0, bestTime: 0 };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = JSON.parse(
      window.localStorage.getItem(BLACK_PINE_DLC_SAVE_KEY) ?? "null",
    ) as Partial<BlackPineDlcSave> | null;
    return {
      completed: raw?.completed === true,
      attempts: typeof raw?.attempts === "number" ? Math.max(0, Math.floor(raw.attempts)) : 0,
      bestScore:
        typeof raw?.bestScore === "number"
          ? Math.max(0, Math.min(100, Math.floor(raw.bestScore)))
          : 0,
      bestTime: typeof raw?.bestTime === "number" ? Math.max(0, Math.floor(raw.bestTime)) : 0,
    };
  } catch {
    return fallback;
  }
}

export type BlackPineDlcSelection = {
  suspect: string;
  object: string;
  location: string;
};

export function checkBlackPineDlcSolution(selection: BlackPineDlcSelection) {
  return (
    selection.suspect === BLACK_PINE_DLC_SOLUTION.suspect &&
    selection.object === BLACK_PINE_DLC_SOLUTION.object &&
    selection.location === BLACK_PINE_DLC_SOLUTION.location
  );
}
