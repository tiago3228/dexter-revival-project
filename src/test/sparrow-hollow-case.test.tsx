import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SparrowHollowCase } from "@/game/SparrowHollowCase";
import {
  SPARROW_HOLLOW_CLAIMS,
  SPARROW_HOLLOW_INTERVIEWS,
  SPARROW_HOLLOW_RECORDS,
  SPARROW_HOLLOW_STAGES,
  SPARROW_HOLLOW_VERDICTS,
} from "@/game/sparrowHollowCase";

const { recordCaseCompletion, beginCaseTimer, pauseCaseTimer, finishCaseTimer } = vi.hoisted(
  () => ({
    recordCaseCompletion: vi.fn(),
    beginCaseTimer: vi.fn(),
    pauseCaseTimer: vi.fn(),
    finishCaseTimer: vi.fn(() => 42),
  }),
);

vi.mock("@/game/achievements", () => ({ recordCaseCompletion }));
vi.mock("@/game/caseTimer", () => ({ beginCaseTimer, pauseCaseTimer, finishCaseTimer }));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});

function renderCase(onToggleSound = vi.fn(), onMusicVolumeChange = vi.fn()) {
  render(
    <SparrowHollowCase
      onBack={vi.fn()}
      soundOn
      onToggleSound={onToggleSound}
      musicVolume={0.6}
      onMusicVolumeChange={onMusicVolumeChange}
    />,
  );
  return { onToggleSound, onMusicVolumeChange };
}

function openRecordsForStage(stageId: (typeof SPARROW_HOLLOW_STAGES)[number]["id"]) {
  fireEvent.click(screen.getByRole("button", { name: "Registros" }));
  for (const record of SPARROW_HOLLOW_RECORDS.filter((item) => item.stage === stageId)) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${record.title}`) }));
  }
}

function openInterviewsForStage(stageId: (typeof SPARROW_HOLLOW_STAGES)[number]["id"]) {
  fireEvent.click(screen.getByRole("button", { name: "Depoimentos" }));
  for (const interview of SPARROW_HOLLOW_INTERVIEWS.filter((item) => item.stage === stageId)) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${interview.name}`) }));
  }
}

function solveCurrentStage(stageId: (typeof SPARROW_HOLLOW_STAGES)[number]["id"], last = false) {
  fireEvent.click(screen.getByRole("button", { name: "Classificar evidências" }));
  for (const claim of SPARROW_HOLLOW_CLAIMS.filter((item) => item.stage === stageId)) {
    fireEvent.change(screen.getByLabelText(`Classificação: ${claim.statement}`), {
      target: { value: claim.correctClass },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: "Conferir esta etapa" }));
  fireEvent.click(
    screen.getByRole("button", {
      name: last ? "Abrir o veredito final" : "Avançar para a próxima etapa",
    }),
  );
}

describe("Caso 08 · Sparrow Hollow", () => {
  it("oculta o equinócio até a progressão e oferece controles do áudio compartilhado", () => {
    const { onToggleSound, onMusicVolumeChange } = renderCase();

    expect(screen.getByText("Sinais na cidade")).toBeInTheDocument();
    expect(screen.queryByText("A noite do equinócio")).not.toBeInTheDocument();
    expect(screen.queryByText(/seis crianças na pedreira/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Veredito · bloqueado/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Música ligada" }));
    fireEvent.change(screen.getByLabelText("Volume da música de Sparrow Hollow"), {
      target: { value: "74" },
    });

    expect(onToggleSound).toHaveBeenCalledOnce();
    expect(onMusicVolumeChange).toHaveBeenCalledWith(0.74);
    expect(beginCaseTimer).toHaveBeenCalledWith("sparrowhollow");
  });

  it("não libera uma etapa quando as classificações não correspondem às fontes", () => {
    renderCase();
    openRecordsForStage("archive");
    fireEvent.click(screen.getByRole("button", { name: "Classificar evidências" }));

    for (const claim of SPARROW_HOLLOW_CLAIMS.filter((item) => item.stage === "archive")) {
      fireEvent.change(screen.getByLabelText(`Classificação: ${claim.statement}`), {
        target: {
          value: claim.id === "collapse-certain" ? "witness" : claim.correctClass,
        },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Conferir esta etapa" }));

    expect(screen.getByRole("status")).toHaveTextContent("ainda contém uma classificação");
    expect(
      screen.queryByRole("button", { name: "Avançar para a próxima etapa" }),
    ).not.toBeInTheDocument();
    expect(recordCaseCompletion).not.toHaveBeenCalled();
  });

  it("registra 100 pontos e 100% de precisão após uma execução perfeita", () => {
    renderCase();

    SPARROW_HOLLOW_STAGES.forEach((stage, index) => {
      openRecordsForStage(stage.id);
      openInterviewsForStage(stage.id);
      solveCurrentStage(stage.id, index === SPARROW_HOLLOW_STAGES.length - 1);
    });

    const supportedVerdict = SPARROW_HOLLOW_VERDICTS.find((verdict) => verdict.correct)!;
    fireEvent.click(screen.getByRole("radio", { name: supportedVerdict.title }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar dossiê e conferir conclusão" }));

    expect(recordCaseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId: "sparrowhollow",
        score: 100,
        hints: 0,
        mistakes: 0,
        correctConclusion: true,
        elapsedSeconds: 42,
        correctActions: expect.any(Number),
        totalActions: expect.any(Number),
      }),
    );
    const completion = recordCaseCompletion.mock.calls[0][0];
    expect(completion.correctActions).toBe(completion.totalActions);
    expect(screen.getByText("Sparrow Hollow · O verão de 1986")).toBeInTheDocument();
    expect(screen.getByText("100%", { selector: "p" })).toBeInTheDocument();
  }, 30000);
});
