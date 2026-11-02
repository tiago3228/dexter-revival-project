import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianQuickChallenges } from "@/game/VivianQuickChallenges";
import { QUICK_CASE_IDS, VIVIAN_QUICK_CASES, WITNESS_CASE } from "@/game/vivianQuickCases";
import { recordMinigameProgress } from "@/game/minigameProgress";

vi.mock("@/game/minigameProgress", () => ({ recordMinigameProgress: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("progresso dos desafios rápidos", () => {
  it("registra o desafio do mentiroso após resposta correta, mas não após incorreta", () => {
    const onComplete = vi.fn();
    render(
      <VivianQuickChallenges
        found={[...WITNESS_CASE.requiredRecords]}
        completed={[]}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));

    fireEvent.click(screen.getByRole("radio", { name: /Relato A/ }));
    fireEvent.click(screen.getByRole("button", { name: "Conferir depoimentos" }));
    expect(recordMinigameProgress).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("radio", { name: /Relato B/ }));
    fireEvent.click(screen.getByRole("button", { name: "Conferir depoimentos" }));
    expect(recordMinigameProgress).toHaveBeenCalledWith("quick-challenges", WITNESS_CASE.id);
    expect(onComplete).toHaveBeenCalledWith(WITNESS_CASE.id);
  });

  it("registra o ID real do caso somente após todas as respostas corretas", () => {
    const quickCase = VIVIAN_QUICK_CASES[0]!;
    const onComplete = vi.fn();
    render(
      <VivianQuickChallenges
        found={[...quickCase.requiredRecords]}
        completed={[]}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Entre um local e outro/ }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(quickCase.title) }));
    const challenge = within(screen.getByRole("article", { name: quickCase.title }));

    fireEvent.click(challenge.getByRole("button", { name: "Conferir caso" }));
    expect(recordMinigameProgress).not.toHaveBeenCalled();

    for (const step of quickCase.steps) {
      const answer = step.options.find((option) => option.id === step.answer)!;
      fireEvent.click(challenge.getByRole("radio", { name: answer.label }));
    }
    fireEvent.click(challenge.getByRole("button", { name: "Conferir caso" }));
    expect(QUICK_CASE_IDS).toContain(quickCase.id);
    expect(recordMinigameProgress).toHaveBeenCalledWith("quick-challenges", quickCase.id);
    expect(onComplete).toHaveBeenCalledWith(quickCase.id);
  });
});
