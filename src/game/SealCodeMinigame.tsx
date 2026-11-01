import { useState } from "react";
import { LockKeyhole, RotateCcw, X } from "lucide-react";
import {
  CODE_LENGTH,
  generateSecretCode,
  getCodeFeedback,
  isValidCode,
  MAX_ATTEMPTS,
  SEAL_SYMBOLS,
  type SealCode,
  type SealSymbolId,
} from "./sealCodePuzzle";
import { playMinigameVictorySound } from "./minigameVictoryEffects";

type Attempt = {
  guess: SealCode;
  correctPosition: number;
  correctSymbol: number;
};

type Outcome = "playing" | "won" | "lost";

const SYMBOL_COLORS: Record<SealSymbolId, string> = {
  blood: "#f28b82",
  slide: "#9fc5ff",
  flask: "#a7d7a5",
  glove: "#f6d579",
  knife: "#d5a6ed",
  badge: "#f3b58d",
};

const EMPTY_CODE: (SealSymbolId | null)[] = Array.from({ length: CODE_LENGTH }, () => null);

export function SealCodeMinigame() {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<SealSymbolId[]>(generateSecretCode);
  const [selection, setSelection] = useState<(SealSymbolId | null)[]>(() => [...EMPTY_CODE]);
  const [activePosition, setActivePosition] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [outcome, setOutcome] = useState<Outcome>("playing");

  const startNewCode = () => {
    setSecret(generateSecretCode());
    setSelection([...EMPTY_CODE]);
    setActivePosition(0);
    setAttempts([]);
    setOutcome("playing");
  };

  const chooseSymbol = (symbol: SealSymbolId) => {
    if (outcome !== "playing") return;
    const usedAtAnotherPosition = selection.some(
      (chosen, index) => chosen === symbol && index !== activePosition,
    );
    if (usedAtAnotherPosition) return;

    setSelection((current) =>
      current.map((chosen, index) => (index === activePosition ? symbol : chosen)),
    );
    const nextEmptyPosition = selection.findIndex(
      (chosen, index) => index !== activePosition && chosen === null,
    );
    if (nextEmptyPosition >= 0) setActivePosition(nextEmptyPosition);
  };

  const submitGuess = () => {
    const guess = selection.filter((symbol): symbol is SealSymbolId => symbol !== null);
    if (!isValidCode(guess) || outcome !== "playing") return;

    const feedback = getCodeFeedback(secret, guess);
    const nextAttempts = [...attempts, { guess, ...feedback }];
    setAttempts(nextAttempts);
    setSelection([...EMPTY_CODE]);
    setActivePosition(0);

    if (feedback.correctPosition === CODE_LENGTH) {
      playMinigameVictorySound();
      setOutcome("won");
    } else if (nextAttempts.length >= MAX_ATTEMPTS) {
      setOutcome("lost");
    }
  };

  const selectedCodeIsValid = isValidCode(
    selection.filter((symbol): symbol is SealSymbolId => symbol !== null),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border border-amber-300/70 bg-amber-300/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-300 hover:text-[#17120d]"
        aria-haspopup="dialog"
      >
        <LockKeyhole size={16} aria-hidden="true" /> Código do Lacre
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mini Game — Código do Lacre"
        >
          <section className="relative max-h-[95vh] w-full max-w-3xl overflow-y-auto border border-[#927451] bg-[#161512] text-[#eee8dc] shadow-[0_0_70px_rgba(218,171,92,.15)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 min-h-10 min-w-10 border border-[#806b4e] p-2 text-[#edcf9d] transition hover:bg-amber-300/15"
              aria-label="Fechar Mini Game — Código do Lacre"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <header className="border-b border-[#51442f] bg-[#211d16] px-5 py-5 pr-16 sm:px-8 sm:pr-20">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d9b46d]">
                Mini Game · Arquivo forense
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">Código do Lacre</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#b9ae9b]">
                Decifre a sequência que protege o arquivo. O lacre usa quatro símbolos diferentes
                entre seis; você tem até oito tentativas. O relatório informa apenas quantos estão
                no lugar certo e quantos pertencem ao código em outra posição.
              </p>
            </header>

            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border border-[#5e503b] bg-[#201c16] px-4 py-3">
                <p className="font-mono text-xs uppercase tracking-wider text-[#dfc58e]">
                  Tentativas: {attempts.length}/{MAX_ATTEMPTS}
                </p>
                <button
                  type="button"
                  onClick={startNewCode}
                  className="inline-flex min-h-10 items-center gap-2 border border-[#947d59] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#ecd39e] transition hover:bg-amber-300/10"
                >
                  <RotateCcw size={14} aria-hidden="true" /> Novo código
                </button>
              </div>

              <div className="mt-5 border border-[#5e503b] bg-[#1d1a15] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl">Monte seu palpite</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#a99b83]">
                    Posição ativa: {activePosition + 1}
                  </p>
                </div>

                <div
                  className="mt-4 grid grid-cols-4 gap-2 sm:gap-3"
                  role="group"
                  aria-label="Posições do palpite"
                >
                  {selection.map((symbolId, index) => {
                    const symbol = SEAL_SYMBOLS.find(({ id }) => id === symbolId);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActivePosition(index)}
                        aria-label={`Posição ${index + 1}${symbol ? `, ${symbol.label}` : ", vazia"}`}
                        aria-pressed={activePosition === index}
                        className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 border bg-[#15130f] p-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${activePosition === index ? "border-[#e2be70] ring-1 ring-[#e2be70]/50" : "border-[#5e503b] hover:border-[#9d8355]"}`}
                      >
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#95876f]">
                          {index + 1}
                        </span>
                        {symbol ? (
                          <span
                            className="text-xl leading-none"
                            style={{ color: SYMBOL_COLORS[symbol.id] }}
                            aria-hidden="true"
                          >
                            {symbol.mark}
                          </span>
                        ) : (
                          <span className="font-mono text-lg text-[#726753]" aria-hidden="true">
                            —
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#a99b83]">
                  Selecione um símbolo para a posição ativa
                </p>
                <div
                  className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"
                  role="group"
                  aria-label="Símbolos disponíveis"
                >
                  {SEAL_SYMBOLS.map((symbol) => {
                    const usedAtAnotherPosition = selection.some(
                      (chosen, index) => chosen === symbol.id && index !== activePosition,
                    );
                    return (
                      <button
                        key={symbol.id}
                        type="button"
                        onClick={() => chooseSymbol(symbol.id)}
                        disabled={usedAtAnotherPosition || outcome !== "playing"}
                        aria-pressed={selection[activePosition] === symbol.id}
                        className="flex min-h-12 items-center gap-2 border border-[#5e503b] bg-[#211d16] px-3 py-2 text-left text-xs text-[#e3d8c4] transition hover:border-[#c3a56a] hover:bg-[#2b251a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <span
                          className="w-6 text-center text-lg leading-none"
                          style={{ color: SYMBOL_COLORS[symbol.id] }}
                          aria-hidden="true"
                        >
                          {symbol.mark}
                        </span>
                        <span>{symbol.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={submitGuess}
                  disabled={!selectedCodeIsValid || outcome !== "playing"}
                  className="mt-4 min-h-11 w-full border-2 border-[#dfbc70] bg-[#dfbc70]/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#f0d99e] transition hover:bg-[#dfbc70]/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submeter palpite
                </button>
              </div>

              <ol className="mt-5 space-y-2" aria-label="Histórico de tentativas">
                {attempts.map((attempt, attemptIndex) => (
                  <li
                    key={attemptIndex}
                    className="flex flex-wrap items-center justify-between gap-3 border border-[#463c2d] bg-[#1b1914] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[#9f927c]">
                        #{attemptIndex + 1}
                      </span>
                      <span
                        className="flex gap-2"
                        aria-label={`Símbolos do palpite ${attemptIndex + 1}`}
                      >
                        {attempt.guess.map((id, index) => {
                          const symbol = SEAL_SYMBOLS.find((item) => item.id === id)!;
                          return (
                            <span
                              key={`${id}-${index}`}
                              className="text-lg leading-none"
                              style={{ color: SYMBOL_COLORS[id] }}
                              aria-label={symbol.label}
                            >
                              {symbol.mark}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#c8b998]">
                      {attempt.correctPosition} na posição certa · {attempt.correctSymbol} na
                      posição errada
                    </span>
                  </li>
                ))}
              </ol>

              {outcome === "won" && (
                <p
                  className="seal-code-victory-notice mt-5 border border-emerald-700/70 bg-emerald-950/40 p-4 font-display text-xl text-emerald-200"
                  role="status"
                >
                  Lacre aberto. Código deduzido — arquivo liberado.
                </p>
              )}
              {outcome === "lost" && (
                <div className="mt-5 border border-[#a35b50] bg-[#321d19] p-4" role="status">
                  <p className="font-display text-xl text-[#f0b4a5]">
                    Tentativas esgotadas. O lacre permanece fechado.
                  </p>
                  <p className="mt-2 text-sm text-[#dfc3b5]">A sequência correta era:</p>
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Código secreto revelado">
                    {secret.map((id, index) => {
                      const symbol = SEAL_SYMBOLS.find((item) => item.id === id)!;
                      return (
                        <span
                          key={`${id}-${index}`}
                          className="inline-flex items-center gap-2 border border-[#89604d] bg-black/20 px-3 py-2 text-sm"
                          style={{ color: SYMBOL_COLORS[id] }}
                        >
                          <span className="text-xl" aria-hidden="true">
                            {symbol.mark}
                          </span>
                          <span className="text-[#f0dfcf]">{symbol.label}</span>
                        </span>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={startNewCode}
                    className="mt-4 min-h-10 border border-[#d39b82] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f3c6ae] hover:bg-[#d39b82]/10"
                  >
                    Tentar de novo
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
