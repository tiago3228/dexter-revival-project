import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PainscreekArchiveVoices } from "@/game/PainscreekArchiveVoices";
import { PAINSCREEK_ARCHIVE_VOICES } from "@/game/painscreekArchiveVoices";

describe("Painscreek archive voices", () => {
  it("keeps every excerpt traceable and labels indirect reporting clearly", () => {
    const markup = renderToStaticMarkup(createElement(PainscreekArchiveVoices));

    expect(PAINSCREEK_ARCHIVE_VOICES).toHaveLength(5);
    expect(markup).toContain("Falas e trechos do arquivo");
    expect(markup).toContain("Diário de Dorothy Patterson · 24/09/1973 · PDF p. 112");
    expect(markup).toContain("O Arauto de Painscreek · 03/03/1993 · PDF p. 86");
    expect(markup).toContain("PDF p. 88");
    expect(markup).toContain("Relato jornalístico — não literal");
    expect(markup).toContain("não transcrição literal");
    expect(markup).toContain(
      "A narração é uma reconstituição em áudio do texto documentado, não uma gravação original da fonte.",
    );
  });
});
