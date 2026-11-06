import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrilogyBookPurchaseButton, TRILOGY_SALES_URL } from "@/game/TrilogyBookPurchaseButton";

describe("TrilogyBookPurchaseButton", () => {
  it.each([7, 8, 9] as const)("aponta o capítulo %s para a página de vendas", (chapter) => {
    render(<TrilogyBookPurchaseButton chapter={chapter} />);

    const link = screen.getByRole("link", {
      name: new RegExp(`Comprar livro.*Capítulo ${chapter}`),
    });
    expect(link).toHaveAttribute("href", TRILOGY_SALES_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
