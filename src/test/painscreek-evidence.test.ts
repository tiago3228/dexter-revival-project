import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";
import { PainscreekEvidenceGallery } from "@/game/PainscreekEvidenceGallery";
import { PAINSCREEK_EVIDENCE_001_116 } from "@/game/painscreekEvidence";
import {
  PAINSCREEK_EVIDENCE_IMAGE_COUNT,
  PAINSCREEK_EVIDENCE_IMAGE_GROUPS,
} from "@/game/painscreekEvidenceImages";

describe("Painscreek evidence catalog", () => {
  it("contains the 47 stable, unique catalog IDs", () => {
    const ids = PAINSCREEK_EVIDENCE_001_116.map((evidence) => evidence.id);

    expect(ids).toHaveLength(47);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      Array.from({ length: 47 }, (_, index) => `P-${String(index + 1).padStart(3, "0")}`),
    );
  });

  it("displays the current record count in the catalog introduction", () => {
    const markup = renderToStaticMarkup(createElement(PainscreekEvidenceExplorer));

    expect(markup).toContain(
      `Consulte as ${PAINSCREEK_EVIDENCE_001_116.length} referências catalogadas`,
    );
  });

  it("keeps each record traceable to a valid PDF page and documented source", () => {
    for (const evidence of PAINSCREEK_EVIDENCE_001_116) {
      expect(evidence.pages.length, evidence.id).toBeGreaterThan(0);
      expect(
        evidence.pages.every((page) => Number.isInteger(page) && page >= 1 && page <= 116),
      ).toBe(true);
      expect(evidence.title.trim(), evidence.id).not.toBe("");
      expect(evidence.sourceType.trim(), evidence.id).not.toBe("");
      expect(evidence.documented.trim(), evidence.id).not.toBe("");
      expect(evidence.pendingVerification.trim(), evidence.id).not.toBe("");
      expect(evidence.playerInference.trim(), evidence.id).not.toBe("");
    }
  });

  it("includes the Vivian death clipping and the newly cataloged early sources", () => {
    const byId = new Map(PAINSCREEK_EVIDENCE_001_116.map((item) => [item.id, item]));

    expect(byId.get("P-046")?.title).toBe("Notícia sobre a morte de Vivian Roberts");
    expect(byId.get("P-046")?.pages).toEqual([82]);
    expect(byId.get("P-046")?.status).toBe("visually-checked");
    expect(byId.get("P-035")?.pages).toEqual([1, 2]);
    expect(byId.get("P-047")?.pages).toEqual([103]);
    expect(byId.get("P-042")?.pages[0]).toBe(35);
  });

  it("keeps the Stephanie reference marked as an editorial duplicate", () => {
    const byId = new Map(PAINSCREEK_EVIDENCE_001_116.map((item) => [item.id, item]));
    const duplicate = byId.get("P-031");

    expect(duplicate?.title).toMatch(/duplicada.*P-009/i);
    expect(duplicate?.pages).toEqual([109]);
    expect(duplicate?.status).toBe("incomplete");
    expect(duplicate?.confidence).toBe("low");
    expect(duplicate?.playerInference).toMatch(/duplicata editorial/i);
  });

  it("reuses existing source audio for duplicate records and excerpts", () => {
    const byId = new Map(PAINSCREEK_EVIDENCE_001_116.map((item) => [item.id, item]));

    expect(byId.get("P-031")?.audioSrc).toBe(byId.get("P-009")?.audioSrc);
    expect(byId.get("P-027")?.audioSrc).toBe("/audio/painscreek/archive/scott-letter-trisha.wav");
    expect(byId.get("P-027")?.audioDescription).toMatch(/não cobre todo o resumo/i);
    expect(byId.get("P-047")?.audioSrc).toBe("/audio/painscreek/archive/matthew-birthday-card.wav");
    expect(byId.get("P-047")?.audioDescription).toMatch(/não cobre todo o resumo/i);
  });

  it("provides an available audio file for all 47 catalog records", () => {
    expect(PAINSCREEK_EVIDENCE_001_116.filter((evidence) => evidence.audioSrc)).toHaveLength(47);

    for (const evidence of PAINSCREEK_EVIDENCE_001_116) {
      expect(evidence.audioSrc, evidence.id).toBeTruthy();
      expect(
        existsSync(join(process.cwd(), "public", evidence.audioSrc!.slice(1))),
        evidence.id,
      ).toBe(true);
    }
  });

  it("keeps all 116 supplemental originals and thumbnails available through the gallery", () => {
    const images = PAINSCREEK_EVIDENCE_IMAGE_GROUPS.flatMap((group) => group.images);
    const markup = renderToStaticMarkup(createElement(PainscreekEvidenceGallery));

    expect(PAINSCREEK_EVIDENCE_IMAGE_COUNT).toBe(116);
    expect(images).toHaveLength(116);
    expect(markup).toContain("Galeria de imagens das fontes");
    expect(markup).toContain("Recortes de jornal — série jornal");
    expect(markup).toContain("Outros — série de imagens");
    expect(markup.match(/aria-label="Abrir imagem [^"]+ no visualizador"/g) ?? []).toHaveLength(
      116,
    );

    for (const image of images) {
      expect(existsSync(join(process.cwd(), "public", image.originalUrl.slice(1)))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", image.thumbnailUrl.slice(1)))).toBe(true);
      expect(markup).toContain(`src="${image.thumbnailUrl}"`);
    }
  });

  it("opens a source image in a floating viewer with arrow navigation and original link", () => {
    const group = PAINSCREEK_EVIDENCE_IMAGE_GROUPS.find((item) => item.id === "andrew");
    expect(group).toBeDefined();
    if (!group) throw new Error("Andrew image group is missing");

    const firstImage = group.images[0]!;
    const secondImage = group.images[1]!;
    render(createElement(PainscreekEvidenceGallery));
    fireEvent.click(screen.getByText(group.title));
    fireEvent.click(
      screen.getByRole("button", {
        name: `Abrir imagem ${firstImage.fileName} no visualizador`,
      }),
    );

    const viewer = screen.getByRole("dialog", { name: group.title });
    expect(within(viewer).getByRole("img")).toHaveAttribute("src", firstImage.originalUrl);
    expect(within(viewer).getByRole("link", { name: "Abrir imagem original" })).toHaveAttribute(
      "href",
      firstImage.originalUrl,
    );

    fireEvent.click(within(viewer).getByRole("button", { name: "Próxima imagem" }));
    expect(within(viewer).getByRole("img")).toHaveAttribute("src", secondImage.originalUrl);
    fireEvent.keyDown(viewer, { key: "ArrowLeft" });
    expect(within(viewer).getByRole("img")).toHaveAttribute("src", firstImage.originalUrl);
    fireEvent.keyDown(viewer, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: group.title })).not.toBeInTheDocument();
  });
});
