import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

import { VivianRobertsCase } from "@/game/VivianRobertsCase";
import { PAINSCREEK_EVIDENCE_IMAGE_GROUPS } from "@/game/painscreekEvidenceImages";

const SAVE_KEY = "vivian-playable-investigation-v1";

function openVivianProfile() {
  render(<VivianRobertsCase />);
  fireEvent.click(screen.getByRole("button", { name: /Vivian Roberts/ }));
  return screen.getByRole("region", { name: "Imagens do diário de Vivian Roberts" });
}

function openDiaryProfile(personName: string) {
  render(<VivianRobertsCase />);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(personName) }));
  return screen.getByRole("region", { name: `Imagens do diário de ${personName}` });
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

  it.each([
    ["Andrew Reed", "andrew", "henry-death"],
    ["Bernard Hopkins", "bernard", "charles-secret"],
    ["Charles Roberts", "charles", "charles-secret"],
    ["Derrick Tyler", "derrick", "dorothy-photo"],
    ["Dorothy Patterson", "dorothy", "dorothy-photo"],
    ["James Howard", "james", "police-report"],
    ["Mary Martinez", "mary", "police-report"],
    ["Padre Matthew Brooks", "matthew", "code-0318"],
    ["Scott Brooks", "scott", "scott-denial"],
    ["Steven Moss", "steven", "police-report"],
    ["Trisha Roberts", "trisha", "charles-secret"],
    ["Vivian Roberts", "vivian", "vivian-medical"],
    ["Wanda Tyler", "wanda", "daniel-letter"],
  ])("unlocks %s from its matching clue", async (personName, groupId, requiredClue) => {
    const diary = openDiaryProfile(personName);
    const group = PAINSCREEK_EVIDENCE_IMAGE_GROUPS.find((item) => item.id === groupId);
    expect(group, `missing image group for ${groupId}`).toBeDefined();

    expect(within(diary).getAllByLabelText(/Imagem bloqueada/)).toHaveLength(group!.images.length);

    saveFoundClues(["hospital-closure"]);
    await act(async () => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });
    expect(within(diary).queryAllByRole("link")).toHaveLength(0);

    saveFoundClues([requiredClue]);
    await act(async () => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });

    expect(within(diary).queryAllByLabelText(/Imagem bloqueada/)).toHaveLength(0);
    expect(
      within(diary).getAllByRole("link", {
        name: new RegExp(`Abrir .* do diário de ${personName}`),
      }),
    ).toHaveLength(group!.images.length);
    cleanup();
    window.localStorage.clear();
  });
});
