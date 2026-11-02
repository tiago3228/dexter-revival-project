import { useState } from "react";
import { CircuitBoard, Flag, Gamepad2, Grid3X3, KeyRound, LockKeyhole, Route } from "lucide-react";
import { CircuitPanelMinigame } from "./CircuitPanelMinigame";
import { DotConnectionMinigame } from "./DotConnectionMinigame";
import { FlagMinigame } from "./FlagMinigame";
import { SealCodeMinigame } from "./SealCodeMinigame";
import { VivianLogicGrid } from "./VivianLogicGrid";
import { VivianMurdleCipherDecoder } from "./VivianMurdleCipherDecoder";
import { VivianMurdleDeduction } from "./VivianMurdleDeduction";
import { VivianMurdleWitnessRoute } from "./VivianMurdleWitnessRoute";
import { VivianQuickChallenges } from "./VivianQuickChallenges";
import { GRID_RECORDS } from "./vivianLogicGrid";
import { PainscreekEvidenceChainMinigame } from "./PainscreekEvidenceChainMinigame";
import { PainscreekMurdleGrid } from "./PainscreekMurdleGrid";

const CASE_RECORD_IDS = GRID_RECORDS.map((record) => record.id);

export function MinigamesMenu() {
  const [solvedGridLevels, setSolvedGridLevels] = useState<string[]>([]);
  const [completedQuickCases, setCompletedQuickCases] = useState<string[]>([]);

  return (
    <section
      className="mt-8 border border-primary/60 bg-[#171516] p-4 sm:p-6"
      aria-label="Menu de minigames"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-primary">
            <Gamepad2 size={15} aria-hidden="true" /> Arquivo de minigames
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Minigames</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Desafios rápidos para testar atenção, memória visual e raciocínio espacial. Cada jogo
            abre em seu próprio painel e pode ser fechado sem perder o progresso salvo.
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
          11 disponíveis
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <article className="border border-cyan-300/30 bg-[#11182a]/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="border border-cyan-300/50 bg-cyan-300/10 p-2 text-cyan-200">
              <Flag size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200">
                Memória visual · Livre ou cronometrado
              </p>
              <h3 className="mt-1 font-display text-2xl text-cyan-50">Mini Game de Bandeiras</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9ba8c6]">
                Identifique bandeiras, construa sequências e desbloqueie troféus no ranking local.
              </p>
            </div>
          </div>
          <FlagMinigame />
        </article>
        <article className="border border-amber-300/30 bg-[#201b16]/80 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="border border-amber-300/50 bg-amber-300/10 p-2 text-amber-100">
              <CircuitBoard size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">
                Raciocínio espacial · Sem cronômetro
              </p>
              <h3 className="mt-1 font-display text-2xl text-amber-50">Painel Elétrico</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#b9ae9b]">
                Gire os conectores em 90° e energize todos os nós de uma rede interrompida.
              </p>
            </div>
          </div>
          <CircuitPanelMinigame />
        </article>
        <article className="border border-rose-300/30 bg-[#251518]/80 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="border border-rose-300/50 bg-rose-300/10 p-2 text-rose-200">
              <Route size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rose-200">
                Raciocínio espacial · 3 dificuldades
              </p>
              <h3 className="mt-1 font-display text-2xl text-rose-50">Conexão de Pontos</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#c0a7aa]">
                Ligue todas as bolinhas uma única vez, sem deixar pontos de fora nem cruzar as
                linhas.
              </p>
            </div>
          </div>
          <DotConnectionMinigame />
        </article>
        <article className="border border-violet-300/30 bg-[#1d1824]/80 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="border border-violet-300/50 bg-violet-300/10 p-2 text-violet-200">
              <LockKeyhole size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet-200">
                Dedução · até 8 palpites
              </p>
              <h3 className="mt-1 font-display text-2xl text-violet-50">Código do Lacre</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#b8aebe]">
                Descubra a sequência de símbolos cruzando acertos de posição e combinações.
              </p>
            </div>
          </div>
          <SealCodeMinigame />
        </article>
        <article className="border border-[#c4a779]/40 bg-[#1c1a17]/80 p-4 sm:p-5 md:col-span-2 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="border border-[#c4a779]/60 bg-[#c4a779]/10 p-2 text-[#ead8b8]">
              <Grid3X3 size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e1c18d]">
                Exercício documental · 3 níveis
              </p>
              <h3 className="mt-1 font-display text-2xl text-[#f0dfbd]">Grade de Dedução</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#c7bba8]">
                Organize relações entre pessoas, registros, locais e períodos usando as pistas do
                caso.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <VivianLogicGrid
              found={CASE_RECORD_IDS}
              solvedLevels={solvedGridLevels}
              onSolve={(levelId) =>
                setSolvedGridLevels((current) =>
                  current.includes(levelId) ? current : [...current, levelId],
                )
              }
            />
          </div>
        </article>
        <article className="border border-[#c4a779]/40 bg-[#1c1a17]/80 p-4 sm:p-5 md:col-span-2 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="border border-[#c4a779]/60 bg-[#c4a779]/10 p-2 text-[#ead8b8]">
              <KeyRound size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e1c18d]">
                Arquivo Vivian · dedução e relações
              </p>
              <h3 className="mt-1 font-display text-2xl text-[#f0dfbd]">Minigames do caso</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#c7bba8]">
                Os mesmos exercícios que aparecem durante a investigação, disponíveis aqui para
                jogar novamente fora do fluxo do caso.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-5">
            <VivianMurdleDeduction onSolved={() => undefined} />
            <VivianMurdleWitnessRoute onSolved={() => undefined} />
            <VivianMurdleCipherDecoder onSolved={() => undefined} />
            <VivianQuickChallenges
              found={CASE_RECORD_IDS}
              completed={completedQuickCases}
              onComplete={(id) =>
                setCompletedQuickCases((current) =>
                  current.includes(id) ? current : [...current, id],
                )
              }
            />
          </div>
        </article>
        <article className="border border-[#8e7a4e]/40 bg-[#1d1a15]/80 p-4 sm:p-5 md:col-span-2 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="border border-[#c4a779]/60 bg-[#c4a779]/10 p-2 text-[#ead8b8]">
              <Grid3X3 size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e1c18d]">
                Painscreek · grade de relações
              </p>
              <h3 className="mt-1 font-display text-2xl text-[#f0dfbd]">Murdle de Painscreek</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#c7bba8]">
                Uma grade original de associação inspirada no método de dedução do livro, usando
                pessoas, fontes e locais do arquivo.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <PainscreekMurdleGrid />
          </div>
        </article>
        <article className="border border-[#527078]/40 bg-[#151a1c]/80 p-4 sm:p-5 md:col-span-2 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="border border-[#9fd1d5]/60 bg-[#9fd1d5]/10 p-2 text-[#c5e4e4]">
              <KeyRound size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#9fd1d5]">
                Painscreek · fonte → teste → estado
              </p>
              <h3 className="mt-1 font-display text-2xl text-[#d8eeee]">Cadeia de Evidência</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#abc0c2]">
                Organize uma diligência rastreável sem converter uma hipótese em fato narrativo.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <PainscreekEvidenceChainMinigame />
          </div>
        </article>
      </div>
    </section>
  );
}
