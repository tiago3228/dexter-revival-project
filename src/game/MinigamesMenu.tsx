import { CircuitBoard, Flag, Gamepad2, Route } from "lucide-react";
import { CircuitPanelMinigame } from "./CircuitPanelMinigame";
import { DotConnectionMinigame } from "./DotConnectionMinigame";
import { FlagMinigame } from "./FlagMinigame";

export function MinigamesMenu() {
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
          03 disponíveis
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </section>
  );
}
