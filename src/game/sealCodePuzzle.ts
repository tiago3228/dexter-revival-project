export const CODE_LENGTH = 4;
export const MAX_ATTEMPTS = 8;

export const SEAL_SYMBOLS = [
  { id: "blood", label: "Gota de sangue", mark: "●", shape: "círculo" },
  { id: "slide", label: "Lâmina", mark: "◆", shape: "losango" },
  { id: "flask", label: "Frasco", mark: "▲", shape: "triângulo" },
  { id: "glove", label: "Luva", mark: "✚", shape: "cruz" },
  { id: "knife", label: "Faca", mark: "✦", shape: "estrela" },
  { id: "badge", label: "Distintivo", mark: "⬟", shape: "hexágono" },
] as const;

export type SealSymbolId = (typeof SEAL_SYMBOLS)[number]["id"];
export type SealCode = readonly SealSymbolId[];

const SYMBOL_IDS = new Set<string>(SEAL_SYMBOLS.map(({ id }) => id));

export function isValidCode(code: readonly string[]): code is SealCode {
  return (
    code.length === CODE_LENGTH &&
    code.every((symbol) => SYMBOL_IDS.has(symbol)) &&
    new Set(code).size === CODE_LENGTH
  );
}

export function generateSecretCode(random: () => number = Math.random): SealSymbolId[] {
  const symbols = SEAL_SYMBOLS.map(({ id }) => id);
  for (let index = symbols.length - 1; index > 0; index -= 1) {
    const candidate = Math.floor(random() * (index + 1));
    const swapIndex = Math.min(index, Math.max(0, candidate));
    [symbols[index], symbols[swapIndex]] = [symbols[swapIndex]!, symbols[index]!];
  }
  return symbols.slice(0, CODE_LENGTH);
}

export function getCodeFeedback(secret: SealCode, guess: SealCode) {
  if (!isValidCode(secret) || !isValidCode(guess)) {
    throw new RangeError("O código e o palpite devem ter quatro símbolos diferentes e válidos.");
  }

  let correctPosition = 0;
  let correctSymbol = 0;
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    if (guess[index] === secret[index]) {
      correctPosition += 1;
    } else if (secret.includes(guess[index]!)) {
      correctSymbol += 1;
    }
  }

  return { correctPosition, correctSymbol };
}
