import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VivianLogicGrid } from "@/game/VivianLogicGrid";
import { GRID_ID, GRID_LEVELS, GRID_RECORDS, type Mark } from "@/game/vivianLogicGrid";
import { recordMinigameProgress } from "@/game/minigameProgress";

vi.mock("@/game/minigameProgress", () => ({ recordMinigameProgress: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("progresso da grade de dedução", () => {
  it("registra o ID real somente quando a solução do nível é conferida", () => {
    const onSolve = vi.fn();
    render(
      <VivianLogicGrid
        found={GRID_RECORDS.map(({ id }) => id)}
        solvedLevels={[]}
        onSolve={onSolve}
      />,
    );
    const grid = within(screen.getByRole("region", { name: "Grade de dedução" }));

    fireEvent.click(grid.getByRole("button", { name: "Conferir nível" }));
    expect(recordMinigameProgress).not.toHaveBeenCalled();
    expect(onSolve).not.toHaveBeenCalled();

    const level = GRID_LEVELS.find(({ id }) => id === GRID_ID)!;
    for (const row of level.rows) {
      for (const column of level.columns) {
        const cell = grid.getByRole("button", { name: `${row.label} e ${column.label}` });
        fireEvent.click(cell);
        if (level.solution[row.id] === column.id) fireEvent.click(cell);
      }
    }

    fireEvent.click(grid.getByRole("button", { name: "Conferir nível" }));
    expect(recordMinigameProgress).toHaveBeenCalledWith("deduction-grid", GRID_ID);
    expect(onSolve).toHaveBeenCalledWith(GRID_ID);
  });
});
