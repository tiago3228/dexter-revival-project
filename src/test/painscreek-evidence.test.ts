import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PainscreekEvidenceExplorer } from "@/game/PainscreekEvidenceExplorer";
import { PAINSCREEK_EVIDENCE_080_116 } from "@/game/painscreekEvidence";

describe("Painscreek evidence catalog", () => {
  it("contains the 34 stable, unique catalog IDs", () => {
    const ids = PAINSCREEK_EVIDENCE_080_116.map((evidence) => evidence.id);

    expect(ids).toHaveLength(34);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      Array.from({ length: 34 }, (_, index) => `P-${String(index + 1).padStart(3, "0")}`),
    );
  });

  it("displays the current record count in the catalog introduction", () => {
    const markup = renderToStaticMarkup(createElement(PainscreekEvidenceExplorer));

    expect(markup).toContain(
      `Consulte as ${PAINSCREEK_EVIDENCE_080_116.length} referências catalogadas`,
    );
  });

  it("keeps each record traceable to a valid PDF page and documented source", () => {
    for (const evidence of PAINSCREEK_EVIDENCE_080_116) {
      expect(evidence.pages.length, evidence.id).toBeGreaterThan(0);
      expect(
        evidence.pages.every((page) => Number.isInteger(page) && page > 0 && page <= 116),
      ).toBe(true);
      expect(evidence.title.trim(), evidence.id).not.toBe("");
      expect(evidence.sourceType.trim(), evidence.id).not.toBe("");
      expect(evidence.documented.trim(), evidence.id).not.toBe("");
      expect(evidence.pendingVerification.trim(), evidence.id).not.toBe("");
      expect(evidence.playerInference.trim(), evidence.id).not.toBe("");
    }
  });
});
