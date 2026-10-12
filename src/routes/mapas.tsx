import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Map, ZoomIn, ZoomOut } from "lucide-react";

const maps = [
  { title: "Mapa da cidade", file: "mapa de paisncreek cidade.png", note: "Referência geral para localizar edifícios, ruas e pontos de interesse." },
  { title: "Rede de esgotos", file: "mapa de paisncreek esgoto.png", note: "Rotas subterrâneas e ligações entre áreas da cidade." },
  { title: "Hospital comunitário", file: "mapa de paisncreek hospital.png", note: "Plantas e setores do hospital." },
  { title: "Mansão — 1º andar", file: "mapa de paisncreek mansão 1° andar.png", note: "Cômodos e circulação do primeiro piso." },
  { title: "Mansão — 2º andar", file: "mapa de paisncreek mansão 2° andar.png", note: "Quartos e áreas do segundo piso." },
];

export const Route = createFileRoute("/mapas")({
  component: MapasPage,
});

function MapasPage() {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const selected = maps[active]!;
  const src = "/maps/" + encodeURIComponent(selected.file);

  return (
    <main className="min-h-screen bg-[#111310] text-[#e8e4d9]">
      <header className="border-b border-[#45483d] bg-[#191b17] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#a5a78d]">Arquivo investigativo · Painscreek</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Atlas de investigação</h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 border border-[#56594c] px-3 py-2 text-sm hover:bg-[#292c24]">
            <ArrowLeft size={16} /> Voltar ao jogo
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] sm:px-8">
        <aside className="space-y-2">
          <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#a5a78d]"><Map size={15}/> Mapas disponíveis</div>
          {maps.map((item, i) => (
            <button key={item.file} onClick={() => { setActive(i); setZoom(1); }} className={"w-full border p-3 text-left transition-colors " + (active === i ? "border-[#b6a36a] bg-[#292c24]" : "border-[#383b32] bg-[#191b17] hover:border-[#77745a]")}>
              <span className="block font-medium">{item.title}</span>
              <span className="mt-1 block text-xs text-[#a5a78d]">{String(i + 1).padStart(2, "0")} / 05</span>
            </button>
          ))}
          <div className="border border-[#383b32] bg-[#191b17] p-3 text-sm leading-relaxed text-[#bcbcaf]">
            <p className="font-medium text-[#e8e4d9]">Nota do arquivo</p>
            <p className="mt-2">Use os mapas como referência espacial. As conclusões do caso devem ser confirmadas por documentos e pistas, não apenas pela localização.</p>
          </div>
        </aside>
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <p className="mt-1 text-sm text-[#a5a78d]">{selected.note}</p>
            </div>
            <div className="flex gap-2">
              <button aria-label="Diminuir zoom" onClick={() => setZoom(v => Math.max(0.5, +(v - 0.25).toFixed(2)))} className="border border-[#56594c] p-2 hover:bg-[#292c24]"><ZoomOut size={17}/></button>
              <span className="min-w-16 self-center text-center font-mono text-sm">{Math.round(zoom * 100)}%</span>
              <button aria-label="Aumentar zoom" onClick={() => setZoom(v => Math.min(3, +(v + 0.25).toFixed(2)))} className="border border-[#56594c] p-2 hover:bg-[#292c24]"><ZoomIn size={17}/></button>
              <button onClick={() => setZoom(1)} className="border border-[#56594c] px-3 text-xs hover:bg-[#292c24]">Reset</button>
            </div>
          </div>
          <div className="overflow-auto border border-[#45483d] bg-[#e7e3d8] p-2 sm:p-4" style={{ maxHeight: "75vh" }}>
            <img src={src} alt={selected.title} className="mx-auto h-auto max-w-none origin-top transition-transform duration-150" style={{ width: `${zoom * 100}%`, minWidth: zoom < 1 ? "60%" : undefined }} />
          </div>
          <p className="mt-3 font-mono text-xs text-[#858875]">ARQUIVO {String(active + 1).padStart(2, "0")} · Material de referência para a investigação</p>
        </section>
      </div>
    </main>
  );
}
