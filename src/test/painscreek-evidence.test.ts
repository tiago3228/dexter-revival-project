import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";
import { PAINSCREEK_EVIDENCE_001_116 } from "@/game/painscreekEvidence";

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
});
