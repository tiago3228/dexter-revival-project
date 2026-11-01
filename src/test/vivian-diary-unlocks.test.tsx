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
    expect(
      within(diary).queryByRole("button", { name: /Abrir .* do diário de Vivian Roberts/ }),
    ).not.toBeInTheDocument();

    saveFoundClues(["police-report", "vivian-medical"]);
    await act(async () => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });

    expect(within(diary).getByText(/Páginas liberadas/)).toBeInTheDocument();
    expect(within(diary).queryAllByLabelText(/Imagem bloqueada/)).toHaveLength(0);
    const thumbnails = within(diary).getAllByRole("button", {
      name: /Abrir .* do diário de Vivian Roberts/,
    });
    expect(thumbnails).toHaveLength(5);
    fireEvent.click(thumbnails[0]!);

    const viewer = screen.getByRole("dialog", { name: "Diário — Vivian Roberts" });
    expect(
      within(viewer).getByRole("img", { name: "Diário — Vivian Roberts: vivian.png" }),
    ).toHaveAttribute("src", "/images/painscreek-evidence/vivian.png");
    fireEvent.keyDown(viewer, { key: "ArrowRight" });
    expect(
      within(viewer).getByRole("img", { name: "Diário — Vivian Roberts: vivian1.png" }),
    ).toHaveAttribute("src", "/images/painscreek-evidence/vivian1.png");
    fireEvent.keyDown(viewer, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Diário — Vivian Roberts" }),
    ).not.toBeInTheDocument();
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
    expect(within(diary).queryAllByRole("button", { name: /Abrir .* do diário de/ })).toHaveLength(
      0,
    );

    saveFoundClues([requiredClue]);
    await act(async () => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });

    expect(within(diary).queryAllByLabelText(/Imagem bloqueada/)).toHaveLength(0);
    const thumbnails = within(diary).getAllByRole("button", {
      name: new RegExp(`Abrir .* do diário de ${personName}`),
    });
    expect(thumbnails).toHaveLength(group!.images.length);
    fireEvent.click(thumbnails[0]!);
    const viewer = screen.getByRole("dialog", { name: group!.title });
    expect(within(viewer).getByRole("img")).toHaveAttribute("src", group!.images[0]!.originalUrl);
    if (group!.images.length > 1) {
      fireEvent.click(within(viewer).getByRole("button", { name: "Próxima imagem" }));
      expect(within(viewer).getByRole("img")).toHaveAttribute("src", group!.images[1]!.originalUrl);
    }
    cleanup();
    window.localStorage.clear();
  });
});

describe("diary viewer gestures and advanced navigation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    saveFoundClues(["vivian-medical"]);
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  function openUnlockedViewer() {
    const diary = openVivianProfile();
    act(() => {
      window.dispatchEvent(new Event("vivian-investigation-progress"));
    });
    const thumbnail = within(diary).getByRole("button", {
      name: "Abrir vivian.png do diário de Vivian Roberts",
    });
    fireEvent.click(thumbnail);
    const viewer = screen.getByRole("dialog", { name: "Diário — Vivian Roberts" });
    const image = within(viewer).getByRole("img", {
      name: "Diário — Vivian Roberts: vivian.png",
    });
    return { viewer, image, surface: image.parentElement as HTMLElement };
  }

  function dispatchPointer(
    target: HTMLElement,
    type: "pointerdown" | "pointermove" | "pointerup",
    values: { pointerId: number; clientX: number; clientY: number },
  ) {
    const event = new Event(type, { bubbles: true });
    Object.entries(values).forEach(([key, value]) => {
      Object.defineProperty(event, key, { configurable: true, value });
    });
    target.dispatchEvent(event);
  }

  it("navigates with swipe, zooms with pinch and pans with a drag at zoom", () => {
    const { viewer, image, surface } = openUnlockedViewer();

    act(() => {
      dispatchPointer(surface, "pointerdown", { pointerId: 1, clientX: 220, clientY: 120 });
      dispatchPointer(surface, "pointermove", { pointerId: 1, clientX: 120, clientY: 120 });
      dispatchPointer(surface, "pointerup", { pointerId: 1, clientX: 120, clientY: 120 });
    });
    expect(within(viewer).getByRole("img")).toHaveAttribute(
      "src",
      "/images/painscreek-evidence/vivian1.png",
    );

    act(() => {
      dispatchPointer(surface, "pointerdown", { pointerId: 1, clientX: 100, clientY: 100 });
      dispatchPointer(surface, "pointerdown", { pointerId: 2, clientX: 180, clientY: 100 });
      dispatchPointer(surface, "pointermove", { pointerId: 2, clientX: 260, clientY: 100 });
      dispatchPointer(surface, "pointerup", { pointerId: 2, clientX: 260, clientY: 100 });
      dispatchPointer(surface, "pointerup", { pointerId: 1, clientX: 100, clientY: 100 });
    });
    expect(viewer).toHaveTextContent(/zoom (?:1\d\d|2\d\d|300)%/);

    act(() => {
      dispatchPointer(surface, "pointerdown", { pointerId: 3, clientX: 100, clientY: 100 });
      dispatchPointer(surface, "pointermove", { pointerId: 3, clientX: 145, clientY: 135 });
      dispatchPointer(surface, "pointerup", { pointerId: 3, clientX: 145, clientY: 135 });
    });
    expect(image.style.transform).toContain("translate(45px, 35px)");
  });

  it("supports advanced keyboard shortcuts and opens presentation mode help", () => {
    const { viewer } = openUnlockedViewer();

    fireEvent.keyDown(window, { key: "End" });
    expect(within(viewer).getByRole("img")).toHaveAttribute(
      "src",
      "/images/painscreek-evidence/vivian4.png",
    );
    fireEvent.keyDown(window, { key: "Home" });
    expect(within(viewer).getByRole("img")).toHaveAttribute(
      "src",
      "/images/painscreek-evidence/vivian.png",
    );
    fireEvent.keyDown(window, { key: "?" });
    expect(within(viewer).getByText("Atalhos de navegação")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "p" });
    expect(
      within(viewer).getByRole("button", { name: "Sair do modo apresentação" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "p" });
    expect(
      within(viewer).queryByRole("button", { name: "Sair do modo apresentação" }),
    ).not.toBeInTheDocument();
  });

  it("enters and exits fullscreen through the visualizer controls", async () => {
    const requestDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "requestFullscreen",
    );
    const exitDescriptor = Object.getOwnPropertyDescriptor(document, "exitFullscreen");
    const requestFullscreen = vi.fn(async function (this: HTMLElement) {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        value: this,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    const exitFullscreen = vi.fn(async () => {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        value: null,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    try {
      const { viewer } = openUnlockedViewer();
      await act(async () => {
        fireEvent.click(within(viewer).getByRole("button", { name: "Abrir em tela cheia" }));
      });
      expect(requestFullscreen).toHaveBeenCalledTimes(1);
      expect(
        within(viewer).getByRole("button", { name: "Sair da tela cheia" }),
      ).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(within(viewer).getByRole("button", { name: "Sair da tela cheia" }));
      });
      expect(exitFullscreen).toHaveBeenCalledTimes(1);
    } finally {
      if (requestDescriptor)
        Object.defineProperty(HTMLElement.prototype, "requestFullscreen", requestDescriptor);
      else delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen;
      if (exitDescriptor) Object.defineProperty(document, "exitFullscreen", exitDescriptor);
      else delete (document as Partial<Document>).exitFullscreen;
    }
  });
});
