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

    expect(returnLink).toHaveAttribute("href", "/?resumePainscreek=1");
  });

  it("recognizes only the explicit Painscreek resume parameter", () => {
    expect(validateHomeSearch({ resumePainscreek: "1" })).toEqual({ resumePainscreek: true });
    expect(validateHomeSearch({ resumePainscreek: "true" })).toEqual({ resumePainscreek: true });
    expect(validateHomeSearch({ resumePainscreek: true })).toEqual({ resumePainscreek: true });
    expect(validateHomeSearch({ resumePainscreek: "0" })).toEqual({});
  });
});
