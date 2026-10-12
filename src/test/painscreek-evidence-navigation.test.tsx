import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";

describe("Painscreek evidence catalog navigation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("preserves the active Vivian case when returning to the game", () => {
    render(<PainscreekEvidenceExplorer />);

    fireEvent.click(screen.getByRole("link", { name: /voltar ao jogo/i }));

    expect(window.sessionStorage.getItem("dexter-return-to-vivian-case")).toBe("true");
  });
});
