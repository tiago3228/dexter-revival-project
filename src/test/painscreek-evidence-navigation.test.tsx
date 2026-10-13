import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";
import { validateHomeSearch } from "@/game/vivianCaseNavigation";

describe("Painscreek evidence catalog navigation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("returns to the game with an explicit Painscreek resume parameter", () => {
    render(<PainscreekEvidenceExplorer />);

    const returnLink = screen.getByRole("link", { name: /voltar ao jogo/i });

    expect(returnLink).toHaveAttribute("href", "/?resumeVivian=1");
  });

  it("recognizes only the explicit Vivian resume parameter", () => {
    expect(validateHomeSearch({ resumeVivian: "1" })).toEqual({ resumeVivian: true });
    expect(validateHomeSearch({ resumeVivian: "true" })).toEqual({ resumeVivian: true });
    expect(validateHomeSearch({ resumeVivian: true })).toEqual({ resumeVivian: true });
    expect(validateHomeSearch({ resumeVivian: "0" })).toEqual({});
  });
});
