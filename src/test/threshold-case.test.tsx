import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThresholdCase } from "@/game/ThresholdCase";
import {
  THRESHOLD_CLAIMS,
  THRESHOLD_INTERVIEWS,
  THRESHOLD_RECORDS,
  THRESHOLD_STAGES,
  THRESHOLD_VERDICTS,
} from "@/game/thresholdCase";

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
    <ThresholdCase
      onBack={vi.fn()}
      soundOn
      onToggleSound={onToggleSound}
      musicVolume={0.6}
      onMusicVolumeChange={onMusicVolumeChange}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Entendi, iniciar investigação" }));
  return { onToggleSound, onMusicVolumeChange };
}

function openRecordsForStage(stageId: (typeof THRESHOLD_STAGES)[number]["id"]) {
  fireEvent.click(screen.getByRole("button", { name: "Registros" }));
  for (const record of THRESHOLD_RECORDS.filter((item) => item.stage === stageId)) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp(record.title) }));
  }
}

function openInterviewsForStage(stageId: (typeof THRESHOLD_STAGES)[number]["id"]) {
  fireEvent.click(screen.getByRole("button", { name: "Depoimentos" }));
  for (const interview of THRESHOLD_INTERVIEWS.filter((item) => item.stage === stageId)) {
    fireEvent.click(
      screen.getByRole("button", {
        name: `${interview.name} · ${interview.prompt}`,
      }),
    );
  }
}

function solveCurrentStage(stageId: (typeof THRESHOLD_STAGES)[number]["id"], last = false) {
  fireEvent.click(screen.getByRole("button", { name: "Classificar evidências" }));
  for (const claim of THRESHOLD_CLAIMS.filter((item) => item.stage === stageId)) {
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

describe("Caso 09 · Threshold", () => {
  it("apresenta as três regras antes da primeira etapa", () => {
    render(
      <ThresholdCase
        onBack={vi.fn()}
        soundOn
        onToggleSound={vi.fn()}
        musicVolume={0.6}
        onMusicVolumeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Threshold · Ashen Creek" })).toBeInTheDocument();
    expect(screen.getByText("Leia antes de classificar")).toBeInTheDocument();
    expect(screen.getByText("Separe fato, testemunho e hipótese")).toBeInTheDocument();
    expect(screen.getByText("Use apenas evidências comprovadas")).toBeInTheDocument();
  });

  it("oculta acontecimentos posteriores e mantém controles do áudio compartilhado", () => {
    const { onToggleSound, onMusicVolumeChange } = renderCase();

    expect(screen.getByRole("heading", { name: "O Programa Limiar" })).toBeInTheDocument();
    expect(screen.queryByText("As fotografias de Marlon")).not.toBeInTheDocument();
    expect(screen.queryByText("O que permaneceu")).not.toBeInTheDocument();
    expect(screen.queryByText("A última abertura")).not.toBeInTheDocument();
    expect(screen.queryByText("Diana fareja o jardim")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Veredito · bloqueado/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Som ligado" }));
    fireEvent.change(screen.getByLabelText("Volume da música de Threshold"), {
      target: { value: "74" },
    });

    expect(onToggleSound).toHaveBeenCalledOnce();
    expect(onMusicVolumeChange).toHaveBeenCalledWith(0.74);
    expect(beginCaseTimer).toHaveBeenCalledWith("threshold");
  });

  it("não permite avançar sem ler os registros e classificar as afirmações corretamente", () => {
    renderCase();
    fireEvent.click(screen.getByRole("button", { name: "Classificar evidências" }));
    fireEvent.click(screen.getByRole("button", { name: "Conferir esta etapa" }));
    expect(
      screen.getByRole("button", { name: /Rascunhos do Programa Limiar/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Leia todos os registros");

    openRecordsForStage("program");
    fireEvent.click(screen.getByRole("button", { name: "Classificar evidências" }));
    for (const claim of THRESHOLD_CLAIMS.filter((item) => item.stage === "program")) {
      fireEvent.change(screen.getByLabelText(`Classificação: ${claim.statement}`), {
        target: {
          value: claim.id === "voss-proved-1968" ? "witness" : claim.correctClass,
        },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Conferir esta etapa" }));

    expect(screen.getByRole("status")).toHaveTextContent("incompatível com as fontes");
    expect(
      screen.queryByRole("button", { name: "Avançar para a próxima etapa" }),
    ).not.toBeInTheDocument();
    expect(recordCaseCompletion).not.toHaveBeenCalled();
  });

  it("registra 100 pontos e 100% de precisão após uma execução perfeita", () => {
    renderCase();

    THRESHOLD_STAGES.forEach((stage, index) => {
      openRecordsForStage(stage.id);
      openInterviewsForStage(stage.id);
      solveCurrentStage(stage.id, index === THRESHOLD_STAGES.length - 1);
    });

    const supportedVerdict = THRESHOLD_VERDICTS.find((verdict) => verdict.correct)!;
    fireEvent.click(screen.getByRole("radio", { name: supportedVerdict.title }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar dossiê e conferir conclusão" }));

    expect(recordCaseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId: "threshold",
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
    expect(screen.getByText("Threshold · Ashen Creek, 1973")).toBeInTheDocument();
    expect(screen.getByText("100%", { selector: "p" })).toBeInTheDocument();
  }, 30000);
});
