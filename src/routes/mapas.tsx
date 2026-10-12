import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Map, ZoomIn, ZoomOut, Volume2, VolumeX, Music2, Hand } from "lucide-react";

const maps = [
  {
    title: "Mapa da cidade",
    file: "mapa de paisncreek cidade.png",
    note: "Referência geral para localizar edifícios, ruas e pontos de interesse.",
  },
  {
    title: "Rede de esgotos",
    file: "mapa de paisncreek esgoto.png",
    note: "Rotas subterrâneas e ligações entre áreas da cidade.",
  },
  {
    title: "Hospital comunitário",
    file: "mapa de paisncreek hospital.png",
    note: "Plantas e setores do hospital.",
  },
  {
    title: "Mansão — 1º andar",
    file: "mapa de paisncreek mansão 1° andar.png",
    note: "Cômodos e circulação do primeiro piso.",
  },
  {
    title: "Mansão — 2º andar",
    file: "mapa de paisncreek mansão 2° andar.png",
    note: "Quartos e áreas do segundo piso.",
  },
];

export const Route = createFileRoute("/mapas")({
  component: MapasPage,
});

function MapasPage() {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [ambientOn, setAmbientOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window === "undefined") return 0.3;
    const saved = window.localStorage.getItem("dexter-music-volume");
    if (saved === null) return 0.3;
    const parsed = Number(saved);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.3;
  });
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(() => {
    if (typeof window === "undefined") return 0.22;
    const saved = window.localStorage.getItem("vivian-ambient-volume");
    if (saved === null) return 0.22;
    const parsed = Number(saved);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.22;
  });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const audioRef = useRef<{
    context: AudioContext;
    nodes: AudioScheduledSourceNode[];
    gains: [GainNode, GainNode];
  } | null>(null);
  const selected = maps[active]!;
  const src = "/maps/" + encodeURIComponent(selected.file);

  useEffect(() => {
    try {
      window.localStorage.setItem("vivian-ambient-volume", String(ambientVolume));
    } catch {
      // A preferência de volume é opcional se o armazenamento local estiver indisponível.
    }
  }, [ambientVolume]);

  useEffect(() => {
    try {
      window.localStorage.setItem("dexter-music-volume", String(musicVolume));
    } catch {
      // A preferência de volume é opcional se o armazenamento local estiver indisponível.
    }
    if (musicRef.current) musicRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    const audio = new Audio("/audio/painscreek/painscreek-case-theme.mp3");
    audio.loop = true;
    audio.volume = musicVolume;
    musicRef.current = audio;
    const startMusic = () => {
      if (!musicOn || !musicRef.current) return;
      void musicRef.current.play().catch(() => undefined);
    };
    if (musicOn) {
      window.addEventListener("pointerdown", startMusic, { once: true });
      void audio.play().catch(() => undefined);
    }
    return () => {
      window.removeEventListener("pointerdown", startMusic);
      audio.pause();
      audio.src = "";
      musicRef.current = null;
    };
  }, [musicOn]);

  useEffect(() => {
    if (!ambientOn || typeof window === "undefined") return;
    const startAmbient = () => {
      if (!ambientOn || audioRef.current) return;
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.32;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 360;
      const windGain = context.createGain();
      windGain.gain.value = 0.11 * ambientVolume;
      noise.connect(filter).connect(windGain).connect(context.destination);
      const hum = context.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 54;
      const humGain = context.createGain();
      humGain.gain.value = 0.036 * ambientVolume;
      hum.connect(humGain).connect(context.destination);
      noise.start();
      hum.start();
      audioRef.current = { context, nodes: [noise, hum], gains: [windGain, humGain] };
    };
    window.addEventListener("pointerdown", startAmbient, { once: true });
    return () => window.removeEventListener("pointerdown", startAmbient);
  }, [ambientOn, ambientVolume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.gains[0].gain.value = 0.11 * ambientVolume;
    audioRef.current.gains[1].gain.value = 0.036 * ambientVolume;
  }, [ambientVolume]);

  useEffect(() => {
    if (ambientOn) return;
    const current = audioRef.current;
    audioRef.current = null;
    if (current) {
      current.nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // O nó pode já estar parado durante o encerramento da ambientação.
        }
      });
      void current.context.close();
    }
  }, [ambientOn]);

  useEffect(
    () => () => {
      const current = audioRef.current;
      if (current) {
        current.nodes.forEach((node) => {
          try {
            node.stop();
          } catch {
            // O nó pode já estar parado durante o encerramento da ambientação.
          }
        });
        void current.context.close();
        audioRef.current = null;
      }
    },
    [],
  );

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const changeMap = (index: number) => {
    setActive(index);
    resetView();
  };
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom((current) =>
      Math.min(4, Math.max(0.5, +(current + (event.deltaY < 0 ? 0.15 : -0.15)).toFixed(2))),
    );
  };
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPan({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  };
  const stopDragging = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <main className="min-h-screen bg-[#111310] text-[#e8e4d9]">
      <header className="border-b border-[#45483d] bg-[#191b17] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#a5a78d]">
              Arquivo investigativo · Painscreek
            </p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Atlas de investigação</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-3 border border-[#56594c] bg-[#111310] px-3 py-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={musicOn ? "Desligar trilha sonora" : "Ligar trilha sonora"}
                  onClick={() => setMusicOn((value) => !value)}
                  className="inline-flex items-center gap-1 text-sm hover:text-[#c4b27a]"
                >
                  <Music2 size={17} /> <span className="hidden sm:inline">Trilha</span>
                </button>
                <input
                  aria-label="Volume da trilha sonora"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(event) => setMusicVolume(Number(event.target.value))}
                  className="w-16 accent-[#a5a78d] sm:w-20"
                />
              </div>
              <div className="flex items-center gap-2 border-l border-[#45483d] pl-3">
                <button
                  type="button"
                  aria-label={ambientOn ? "Desligar ambientação" : "Ligar ambientação"}
                  onClick={() => setAmbientOn((value) => !value)}
                  className="inline-flex items-center gap-1 text-sm hover:text-[#c4b27a]"
                >
                  {ambientOn ? <Volume2 size={17} /> : <VolumeX size={17} />}{" "}
                  <span className="hidden sm:inline">Ambiente</span>
                </button>
                <input
                  aria-label="Volume da ambientação"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(event) => setAmbientVolume(Number(event.target.value))}
                  className="w-16 accent-[#a5a78d] sm:w-20"
                />
              </div>
            </div>
            <Link
              to="/painscreek-evidence"
              className="inline-flex items-center gap-2 border border-[#56594c] px-3 py-2 text-sm hover:bg-[#292c24]"
            >
              Catálogo de evidências
            </Link>
            <Link
              to="/"
              onClick={() => {
                try {
                  window.sessionStorage.setItem("dexter-return-to-vivian-case", "true");
                } catch {
                  // A navegação continua funcional se o armazenamento da sessão estiver bloqueado.
                }
              }}
              className="inline-flex items-center gap-2 border border-[#56594c] px-3 py-2 text-sm hover:bg-[#292c24]"
            >
              <ArrowLeft size={16} /> Voltar ao jogo
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] sm:px-8">
        <aside className="space-y-2">
          <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#a5a78d]">
            <Map size={15} /> Mapas disponíveis
          </div>
          {maps.map((item, i) => (
            <button
              key={item.file}
              onClick={() => changeMap(i)}
              className={
                "w-full border p-3 text-left transition-colors " +
                (active === i
                  ? "border-[#b6a36a] bg-[#292c24]"
                  : "border-[#383b32] bg-[#191b17] hover:border-[#77745a]")
              }
            >
              <span className="block font-medium">{item.title}</span>
              <span className="mt-1 block text-xs text-[#a5a78d]">
                {String(i + 1).padStart(2, "0")} / 05
              </span>
            </button>
          ))}
          <div className="border border-[#383b32] bg-[#191b17] p-3 text-sm leading-relaxed text-[#bcbcaf]">
            <p className="font-medium text-[#e8e4d9]">Nota do arquivo</p>
            <p className="mt-2">
              Use os mapas como referência espacial. As conclusões do caso devem ser confirmadas por
              documentos e pistas, não apenas pela localização.
            </p>
          </div>
        </aside>
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <p className="mt-1 text-sm text-[#a5a78d]">{selected.note}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                aria-label="Diminuir zoom"
                onClick={() => setZoom((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}
                className="border border-[#56594c] p-2 hover:bg-[#292c24]"
              >
                <ZoomOut size={17} />
              </button>
              <span className="min-w-16 self-center text-center font-mono text-sm">
                {Math.round(zoom * 100)}%
              </span>
              <button
                aria-label="Aumentar zoom"
                onClick={() => setZoom((v) => Math.min(4, +(v + 0.25).toFixed(2)))}
                className="border border-[#56594c] p-2 hover:bg-[#292c24]"
              >
                <ZoomIn size={17} />
              </button>
              <button
                onClick={resetView}
                className="border border-[#56594c] px-3 text-xs hover:bg-[#292c24]"
              >
                Centralizar
              </button>
            </div>
          </div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[#a5a78d]">
            <Hand size={15} /> Arraste com o botão esquerdo pressionado para mover · role o scroll
            para aproximar ou afastar
          </div>
          <div
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onLostPointerCapture={stopDragging}
            className={
              "relative h-[60vh] min-h-[360px] overflow-hidden border border-[#45483d] bg-[#e7e3d8] sm:h-[72vh] " +
              (isDragging ? "cursor-grabbing" : "cursor-grab")
            }
            style={{ touchAction: "none" }}
          >
            <img
              key={selected.file}
              src={src}
              alt={selected.title}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: "min(100%, 1200px)",
                height: "auto",
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            />
          </div>
          <p className="mt-3 font-mono text-xs text-[#858875]">
            ARQUIVO {String(active + 1).padStart(2, "0")} · Material de referência para a
            investigação
          </p>
        </section>
      </div>
    </main>
  );
}
