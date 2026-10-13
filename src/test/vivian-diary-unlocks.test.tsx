import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";

import { vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

import { VivianRobertsCase } from "@/game/VivianRobertsCase";

const SAVE_KEY = "vivian-playable-investigation-v1";

function openVivianProfile() {
  render(<VivianRobertsCase />);
  fireEvent.click(screen.getByRole("button", { name: /Vivian Roberts/ }));
  return screen.getByRole("region", { name: "Imagens do diário de Vivian Roberts" });
}

function saveFoundClues(found: string[]) {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 2,
      found,
    }),
  );
}

describe("diary image unlocks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("keeps Vivian's diary locked until the matching investigation clue is found", async () => {
    const diary = openVivianProfile();

    expect(within(diary).getAllByLabelText(/Imagem bloqueada/)).toHaveLength(5);
    expect(within(diary).getByText(/Páginas bloqueadas/)).toBeInTheDocument();

    saveFoundClues(["police-report"]);
    await act(async () => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });

    expect(within(diary).getAllByLabelText(/Imagem bloqueada/)).toHaveLength(5);
    expect(within(diary).queryByRole("link")).not.toBeInTheDocument();

    saveFoundClues(["police-report", "vivian-medical"]);
    await act(async () => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });

    expect(within(diary).getByText(/Páginas liberadas/)).toBeInTheDocument();
    expect(within(diary).queryAllByLabelText(/Imagem bloqueada/)).toHaveLength(0);
    const links = within(diary).getAllByRole("link", {
      name: /Abrir .* do diário de Vivian Roberts/,
    });
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveAttribute("href", "/images/painscreek-evidence/vivian.png");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });
});
