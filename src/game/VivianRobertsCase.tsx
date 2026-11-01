import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  EyeOff,
  FileSearch,
  Keyboard,
  Maximize2,
  Minimize2,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  SunMedium,
  Users,
  X,
  Volume2,
  VolumeX,
  ClipboardList,
  Network,
  Clock3,
} from "lucide-react";
import { VivianInvestigationGame } from "./VivianInvestigationGame";
import { VivianFinalReveal } from "./VivianFinalReveal";
import { readVivianCaseCompleted } from "./vivianFinalCase";
import { PAINSCREEK_EVIDENCE_001_116 } from "./painscreekEvidence";
import { PAINSCREEK_EVIDENCE_IMAGE_GROUPS } from "./painscreekEvidenceImages";

type ReviewStatus = "pendente" | "parcial" | "confirmado" | "contradicao";
type Person = { id: string; name: string; role: string; note: string; status: ReviewStatus };
type Place = { id: string; name: string; group: string; description: string; status: ReviewStatus };
type DocumentItem = {
  id: string;
  title: string;
  type: string;
  location: string;
  status: ReviewStatus;
  body: string;
};

const VIVIAN_INVESTIGATION_SAVE_KEY = "vivian-playable-investigation-v1";

const DIARY_UNLOCK_CLUES: Record<string, string> = {
  andrew: "henry-death",
  bernard: "charles-secret",
  charles: "charles-secret",
  derrick: "dorothy-photo",
  dorothy: "dorothy-photo",
  james: "police-report",
  mary: "police-report",
  matthew: "code-0318",
  scott: "scott-denial",
  moss: "police-report",
  trisha: "charles-secret",
  vivian: "vivian-medical",
  wanda: "daniel-letter",
};

const DIARY_IMAGE_GROUP_IDS: Record<string, string> = {
  moss: "steven",
};

const DIARY_REFERENCE_TERMS: Record<string, string[]> = {
  andrew: ["Andrew Reed"],
  bernard: ["Bernard Hopkins"],
  charles: ["Charles Roberts"],
  derrick: ["Derrick Tyler"],
  dorothy: ["Dorothy"],
  james: ["James Howard"],
  mary: ["Mary Martinez"],
  matthew: ["Matthew Brooks"],
  scott: ["Scott Brooks", "Scott"],
  moss: ["Steven Moss"],
  trisha: ["Trisha Roberts"],
  vivian: ["Vivian Roberts"],
  wanda: ["Wanda Tyler"],
};

const DIARY_CATALOG_PAGES: Record<string, number[]> = {
  andrew: [1, 2],
  bernard: [3, 4, 5],
  charles: [6, 7],
  derrick: [8, 9, 10, 11, 12, 8, 9, 10, 11, 12],
  dorothy: [78, 78, 79, 79, 80, 81],
  james: [18, 19, 20],
  mary: [13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27],
  matthew: [28, 29, 30, 31, 32, 33, 34],
  scott: Array.from({ length: 23 }, (_, index) => index + 35),
  moss: [58, 59, 60, 62, 62],
  trisha: [63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
  vivian: [73, 74, 75, 76, 77],
  wanda: [78, 79, 80, 81],
};

function getDiaryReferences(personId: string, catalogPage: number | undefined) {
  const terms = DIARY_REFERENCE_TERMS[personId] ?? [];
  return PAINSCREEK_EVIDENCE_001_116.filter(
    (evidence) =>
      terms.some((term) => evidence.title.includes(term)) &&
      (catalogPage === undefined || evidence.pages.includes(catalogPage)),
  ).slice(0, 4);
}

function readFoundVivianClues() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(VIVIAN_INVESTIGATION_SAVE_KEY) || "null");
    return Array.isArray(saved?.found)
      ? saved.found.filter((id: unknown): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function DiaryImages({
  personId,
  personName,
  foundClues,
  previousDiary,
  nextDiary,
  onNavigateDiary,
}: {
  personId: string;
  personName: string;
  foundClues: string[];
  previousDiary?: string | undefined;
  nextDiary?: string | undefined;
  onNavigateDiary?: ((personId: string) => void) | undefined;
}) {
  const groupId = DIARY_IMAGE_GROUP_IDS[personId] ?? personId;
  const group = PAINSCREEK_EVIDENCE_IMAGE_GROUPS.find((item) => item.id === groupId);
  const imageCount = group?.images.length ?? 0;

  const requiredClue = DIARY_UNLOCK_CLUES[personId];
  const unlocked = requiredClue ? foundClues.includes(requiredClue) : false;

  const progressKey = `vivian-diary-progress-v1:${groupId}`;
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = Number(window.localStorage.getItem(progressKey));
    return Number.isInteger(saved) && saved >= 0 && saved < imageCount ? saved : 0;
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [readerTheme, setReaderTheme] = useState<"dark" | "light" | "sepia">("dark");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchZoomRef = useRef(1);
  const swipeRef = useRef<{
    startX: number;
    startY: number;
    hadMultiTouch: boolean;
  } | null>(null);
  const panDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("vivian-diary-reader-settings-v1") || "null",
      );
      if (Number.isFinite(saved?.brightness))
        setBrightness(Math.min(140, Math.max(70, saved.brightness)));
      if (Number.isFinite(saved?.contrast))
        setContrast(Math.min(160, Math.max(70, saved.contrast)));
      if (["dark", "light", "sepia"].includes(saved?.readerTheme))
        setReaderTheme(saved.readerTheme);
    } catch {
      // Ignora preferências corrompidas e mantém a leitura padrão.
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "vivian-diary-reader-settings-v1",
        JSON.stringify({ brightness, contrast, readerTheme }),
      );
    }
  }, [brightness, contrast, readerTheme]);

  const saveProgress = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      if (typeof window !== "undefined") window.localStorage.setItem(progressKey, String(index));
    },
    [progressKey],
  );

  const openViewer = (index: number) => {
    saveProgress(index);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setViewerOpen(true);
  };

  const closeViewer = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    setViewerOpen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const changePage = useCallback(
    (direction: -1 | 1) => {
      if (!group) return;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= group.images.length) return;
      saveProgress(nextIndex);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    [currentIndex, group, saveProgress],
  );

  const adjustZoom = useCallback(
    (amount: number) =>
      setZoom((value) => Math.min(6, Math.max(1, Number((value + amount).toFixed(2))))),
    [],
  );

  useEffect(() => {
    if (zoom <= 1.05) setPan({ x: 0, y: 0 });
  }, [zoom]);

  const toggleFullscreen = useCallback(async () => {
    if (!viewerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await viewerRef.current.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (!group) return;
    const handleFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!viewerOpen) return;
      if (event.key === "Escape") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else closeViewer();
      }
      if (event.key === "ArrowLeft") changePage(-1);
      if (event.key === "ArrowRight") changePage(1);
      if (event.key === "+" || event.key === "=") adjustZoom(0.25);
      if (event.key === "-") adjustZoom(-0.25);
      if (event.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
      if (event.key === "Home") {
        event.preventDefault();
        saveProgress(0);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
      if (event.key === "End") {
        event.preventDefault();
        saveProgress(group.images.length - 1);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
      if (event.key === "?") setShortcutsOpen((open) => !open);
      if (event.key.toLowerCase() === "p") setPresentationMode((open) => !open);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewerOpen, currentIndex, group, closeViewer, changePage, adjustZoom, saveProgress]);

  if (!group) return null;

  const currentImage = group.images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < group.images.length - 1;
  const currentCatalogPage = DIARY_CATALOG_PAGES[groupId]?.[currentIndex];
  const diaryReferences = getDiaryReferences(personId, currentCatalogPage);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) {
      swipeRef.current = { startX: event.clientX, startY: event.clientY, hadMultiTouch: false };
      if (zoom > 1.05) {
        panDragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: pan.x,
          originY: pan.y,
        };
        setIsPanning(true);
      }
    } else if (swipeRef.current) {
      swipeRef.current.hadMultiTouch = true;
      panDragRef.current = null;
      setIsPanning(false);
    }
    if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      pinchDistanceRef.current = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      pinchZoomRef.current = zoom;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const panDrag = panDragRef.current;
    if (pointersRef.current.size === 1 && panDrag?.pointerId === event.pointerId) {
      setPan({
        x: panDrag.originX + event.clientX - panDrag.startX,
        y: panDrag.originY + event.clientY - panDrag.startY,
      });
      return;
    }
    if (pointersRef.current.size !== 2 || pinchDistanceRef.current === null) return;
    const points = [...pointersRef.current.values()] as [
      { x: number; y: number },
      { x: number; y: number },
    ];
    const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    setZoom(Math.min(6, Math.max(1, pinchZoomRef.current * (pinchDistanceRef.current / distance))));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    panDragRef.current = null;
    setIsPanning(false);
    if (pointersRef.current.size < 2) pinchDistanceRef.current = null;
    if (pointersRef.current.size > 0) return;

    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.hadMultiTouch || zoom > 1.05) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
    changePage(deltaX < 0 ? 1 : -1);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    panDragRef.current = null;
    setIsPanning(false);
    pinchDistanceRef.current = null;
    swipeRef.current = null;
  };

  return (
    <section
      className="border border-[#4b4439] bg-[#211f1b] p-4"
      aria-label={`Imagens do diário de ${personName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c4a779]">
            Arquivo visual
          </p>
          <h3 className="mt-1 font-display text-xl">{group.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#a9a092]">
            {unlocked
              ? `Páginas liberadas. ${group.images.length} páginas disponíveis para leitura.`
              : "Páginas bloqueadas. Avance na investigação para liberar este diário."}
          </p>
        </div>
        {unlocked ? (
          <ExternalLink size={17} className="shrink-0 text-[#c4a779]" aria-hidden="true" />
        ) : (
          <LockKeyhole size={17} className="shrink-0 text-[#c4a779]" aria-hidden="true" />
        )}
      </div>
      {unlocked && (
        <div className="mt-4 flex items-center justify-between gap-3 border border-[#4b4439] bg-[#171512] px-3 py-2">
          <p className="text-xs text-[#c9c1b5]">
            Última página: <strong className="text-[#ead8b8]">{currentIndex + 1}</strong> de{" "}
            {group.images.length}
          </p>
          <button
            type="button"
            onClick={() => openViewer(currentIndex)}
            className="min-h-9 border border-[#c4a779] px-3 font-mono text-[10px] uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/10"
          >
            Retomar leitura
          </button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {group.images.map((image, index) =>
          unlocked ? (
            <button
              key={image.fileName}
              type="button"
              onClick={() => openViewer(index)}
              aria-label={`Abrir ${image.fileName} do diário de ${personName}`}
              className={`group overflow-hidden border bg-[#171512] text-left transition hover:border-[#c4a779] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b77e] ${currentIndex === index ? "border-[#c4a779]" : "border-[#4b4439]"}`}
            >
              <img
                src={image.thumbnailUrl}
                alt={`${group.title}, imagem ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
              />
              <span className="flex items-center justify-between gap-2 px-2 py-1 text-[10px] text-[#a9a092] group-hover:text-[#eee9df]">
                <span className="truncate">{image.fileName}</span>
                {currentIndex === index && <span className="shrink-0 text-[#c4a779]">atual</span>}
              </span>
            </button>
          ) : (
            <div
              key={image.fileName}
              className="relative overflow-hidden border border-[#302b24] bg-[#171512]"
              aria-label={`Imagem bloqueada ${index + 1} do diário de ${personName}`}
            >
              <img
                src={image.thumbnailUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover opacity-35 grayscale blur-[3px]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <LockKeyhole size={19} className="text-[#ead8b8]" aria-hidden="true" />
              </div>
            </div>
          ),
        )}
      </div>
      {(previousDiary || nextDiary) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#4b4439] pt-4">
          <button
            type="button"
            onClick={() => previousDiary && onNavigateDiary?.(previousDiary)}
            disabled={!previousDiary}
            className="min-h-10 border border-[#79664c] px-3 font-mono text-[10px] uppercase tracking-wider text-[#c9c1b5] disabled:opacity-35"
          >
            ← Diário anterior
          </button>
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#81796d]">
            Navegação entre diários
          </p>
          <button
            type="button"
            onClick={() => nextDiary && onNavigateDiary?.(nextDiary)}
            disabled={!nextDiary}
            className="min-h-10 border border-[#79664c] px-3 font-mono text-[10px] uppercase tracking-wider text-[#c9c1b5] disabled:opacity-35"
          >
            Diário próximo →
          </button>
        </div>
      )}
      <details className="mt-4 border border-[#79664c]/70 bg-[#171510] p-3">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
          Referências da página atual
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#c9c1b5]">
          <p className="text-[#a9a092]">
            Imagem {currentIndex + 1} · PDF p. {currentCatalogPage ?? "não mapeada"}
          </p>
          {diaryReferences.length > 0 ? (
            diaryReferences.map((reference) => (
              <div key={reference.id} className="border-l-2 border-[#79664c] pl-3">
                <p className="text-[#ead8b8]">
                  {reference.id} · {reference.title}
                </p>
                <p className="text-[#a9a092]">
                  PDF pp. {reference.pages.join(", ")} · {reference.sourceType}
                </p>
                <p className="mt-1 text-[#bdb5a8]">{reference.documented}</p>
              </div>
            ))
          ) : (
            <p className="text-[#81796d]">
              Nenhuma referência específica foi catalogada para esta página.
            </p>
          )}
          <p className="border-t border-[#4b4439] pt-2 text-[#81796d]">
            Relação por nome e referência de catálogo; o vínculo não é uma interpretação nem prova
            independente.
          </p>
        </div>
      </details>
      {viewerOpen && currentImage && (
        <div
          ref={viewerRef}
          className={`fixed inset-0 z-[80] flex flex-col ${readerTheme === "light" ? "bg-[#eee9df] text-[#211f1b]" : readerTheme === "sepia" ? "bg-[#33291e] text-[#f1dfbd]" : "bg-[#0d0c0b]/[.98] text-[#ead8b8]"} ${presentationMode ? "p-0" : isFullscreen ? "p-3 sm:p-5" : "p-3 sm:p-6"}`}
          role="dialog"
          aria-modal="true"
          aria-label={group.title}
        >
          {presentationMode && (
            <button
              type="button"
              onClick={() => setPresentationMode(false)}
              aria-label="Sair do modo apresentação"
              className="absolute right-14 top-3 z-10 border border-[#79664c] bg-black/60 p-2 text-[#ead8b8] opacity-30 transition hover:opacity-100"
              title="Sair do modo apresentação (P)"
            >
              <EyeOff size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Fechar visualizador"
            className="absolute right-3 top-3 z-10 inline-flex min-h-10 min-w-10 items-center justify-center border border-[#c4a779] bg-black/75 text-[#ead8b8] shadow-lg transition hover:bg-black"
            title="Fechar foto"
          >
            <X size={20} />
          </button>
          <div
            className={
              presentationMode
                ? "hidden"
                : "flex items-center justify-between gap-3 border-b border-[#4b4439] pb-3 text-[#ead8b8]"
            }
          >
            <div className="min-w-0">
              <p className="truncate font-display text-xl">{group.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#a9a092]">
                Página {currentIndex + 1} de {group.images.length} · zoom {Math.round(zoom * 100)}%
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => adjustZoom(-0.25)}
                disabled={zoom <= 1}
                aria-label="Reduzir zoom"
                className="viewer-control"
                title="Reduzir zoom"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Resetar zoom"
                className="viewer-control px-2 font-mono text-[10px]"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => adjustZoom(0.25)}
                disabled={zoom >= 6}
                aria-label="Aumentar zoom"
                className="viewer-control"
                title="Aumentar zoom"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
                className="viewer-control"
                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() =>
                  setReaderTheme((theme) =>
                    theme === "dark" ? "sepia" : theme === "sepia" ? "light" : "dark",
                  )
                }
                aria-label="Alternar tema de leitura"
                className="viewer-control"
                title="Alternar tema"
              >
                <SunMedium size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShortcutsOpen((open) => !open)}
                aria-label="Mostrar atalhos de teclado"
                aria-expanded={shortcutsOpen}
                className="viewer-control"
                title="Atalhos de teclado (?)"
              >
                <Keyboard size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPresentationMode(true)}
                aria-label="Ativar modo apresentação limpo"
                className="viewer-control"
                title="Modo apresentação (P)"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
          {!presentationMode && shortcutsOpen && (
            <div className="border-b border-[#4b4439] bg-[#171512]/80 px-3 py-2 text-xs text-[#c9c1b5]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
                Atalhos de navegação
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                <span>
                  <kbd>←</kbd> <kbd>→</kbd> páginas
                </span>
                <span>
                  <kbd>+</kbd> <kbd>-</kbd> zoom
                </span>
                <span>
                  <kbd>0</kbd> resetar zoom
                </span>
                <span>
                  <kbd>Home</kbd> / <kbd>End</kbd> início/fim
                </span>
                <span>
                  <kbd>Esc</kbd> fechar
                </span>
                <span>
                  <kbd>?</kbd> mostrar/ocultar ajuda
                </span>
              </div>
            </div>
          )}
          <div
            className={
              presentationMode
                ? "hidden"
                : "flex flex-wrap items-center gap-3 border-b border-[#4b4439] py-2 text-xs"
            }
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <label className="flex items-center gap-2">
              Brilho
              <input
                type="range"
                min="70"
                max="140"
                value={brightness}
                onChange={(event) => setBrightness(Number(event.target.value))}
                aria-label="Brilho da página"
                className="w-24 accent-[#c4a779]"
              />
              <span className="font-mono text-[10px]">{brightness}%</span>
            </label>
            <label className="flex items-center gap-2">
              Contraste
              <input
                type="range"
                min="70"
                max="160"
                value={contrast}
                onChange={(event) => setContrast(Number(event.target.value))}
                aria-label="Contraste da página"
                className="w-24 accent-[#c4a779]"
              />
              <span className="font-mono text-[10px]">{contrast}%</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setBrightness(100);
                setContrast(100);
                setReaderTheme("dark");
              }}
              className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#c4a779]"
            >
              <RotateCcw size={13} /> Resetar leitura
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-3 sm:gap-4">
            <button
              type="button"
              onClick={() => changePage(-1)}
              disabled={!hasPrevious}
              aria-label="Imagem anterior"
              className="viewer-nav"
            >
              <ChevronLeft size={22} />
            </button>
            <div
              className={`flex h-full min-w-0 flex-1 touch-none items-center justify-center overflow-hidden overscroll-contain ${zoom > 1.05 ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onDoubleClick={() => setZoom((value) => (value === 1 ? 2 : 1))}
            >
              <img
                src={currentImage.originalUrl}
                alt={`${group.title}: ${currentImage.fileName}`}
                className="max-h-full max-w-full select-none object-contain transition-transform duration-100"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
                draggable={false}
              />
            </div>
            <button
              type="button"
              onClick={() => changePage(1)}
              disabled={!hasNext}
              aria-label="Próxima imagem"
              className="viewer-nav"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className={presentationMode ? "hidden" : "border-t border-[#4b4439] pt-3"}>
            <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Miniaturas das páginas">
              {group.images.map((image, index) => (
                <button
                  key={image.fileName}
                  type="button"
                  onClick={() => {
                    saveProgress(index);
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  aria-label={`Ir para página ${index + 1}`}
                  className={`w-16 shrink-0 border p-1 sm:w-20 ${currentIndex === index ? "border-[#c4a779]" : "border-[#4b4439]"}`}
                >
                  <img
                    src={image.thumbnailUrl}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="mt-1 block text-center font-mono text-[9px] text-[#a9a092]">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center font-mono text-[10px] text-[#81796d]">
              Setas ou deslize: navegar · +/-: zoom · mãozinha: puxar a página · aproxime os dedos:
              ampliar · P: apresentação · Esc: fechar
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

const PEOPLE: Person[] = [
  {
    id: "vivian",
    name: "Vivian Roberts",
    role: "Vítima central do caso",
    note: "O laudo a identifica como esposa de Charles; a notícia relata sua morte; a carta anônima chama o caso de assassinato.",
    status: "confirmado",
  },
  {
    id: "charles",
    name: "Charles Roberts",
    role: "Marido de Vivian · ex-prefeito (segundo notícia)",
    note: "Relações familiares e candidatura aparecem em diário e carta; opiniões são atribuídas.",
    status: "confirmado",
  },
  {
    id: "magdalene",
    name: "Magdalene Roberts",
    role: "Mãe de Charles (cruzamento documental)",
    note: "O parentesco resulta do cruzamento entre carta e laudo; outras afirmações são relatos.",
    status: "confirmado",
  },
  {
    id: "trisha",
    name: "Trisha Roberts",
    role: "Filha de Vivian e Charles · diário pessoal",
    note: "O diário registra a relação com Scott; rumores permanecem atribuídos.",
    status: "confirmado",
  },
  {
    id: "bernard",
    name: "Bernard Hopkins",
    role: "Mordomo (ficha funcional)",
    note: "A ficha funcional o identifica como mordomo; a nota investigativa da p. 61 é outro documento e não prova envolvimento.",
    status: "confirmado",
  },
  {
    id: "dorothy",
    name: "Dorothy Patterson",
    role: "Funcionária da mansão · cargo exato não confirmado",
    note: "A carta relata mais de vinte anos de serviço; diários documentam tarefas específicas, sem confirmar o cargo de governanta.",
    status: "confirmado",
  },
  {
    id: "derrick",
    name: "Derrick Tyler",
    role: "Motorista da família Roberts",
    note: "É identificado como motorista; os relatos de convivência com Scott e Trisha vêm de diários.",
    status: "confirmado",
  },
  {
    id: "sofia",
    name: "Sofia (sobrenome não confirmado)",
    role: "Pessoa mencionada · destino em disputa",
    note: "Há relatos de que partiu de Painscreek e de que morreu; sobrenome e destino não estão resolvidos.",
    status: "contradicao",
  },
  {
    id: "scott",
    name: "Scott Brooks",
    role: "Filho adotivo de Matthew (relato de Rachel)",
    note: "A adoção é relatada por Rachel; a possível identidade com Vincent continua sem prova conclusiva.",
    status: "contradicao",
  },
  {
    id: "matthew",
    name: "Padre Matthew Brooks",
    role: "Padre da Igreja da Trindade",
    note: "A adoção de Scott é relatada por Rachel; sobrenome e papel sacerdotal aparecem em fontes distintas.",
    status: "confirmado",
  },
  {
    id: "andrew",
    name: "Andrew Reed",
    role: "Funcionário da família Roberts",
    note: "O jornal o descreve como jardineiro e faz-tudo; a matéria não determina a causa do incêndio.",
    status: "confirmado",
  },
  {
    id: "henry",
    name: "Dr. Henry Johnson",
    role: "Médico do Painscreek Community Hospital",
    note: "O laudo confirma o vínculo médico; o suposto desvio de fundos é acusação atribuída à firma investigadora.",
    status: "confirmado",
  },
  {
    id: "moss",
    name: "Steven Moss",
    role: "Detetive particular (carta anônima)",
    note: "Carta anônima é endereçada ao detetive; a avaliação de sua confiabilidade não é confirmação independente.",
    status: "confirmado",
  },
  {
    id: "james",
    name: "James Howard",
    role: "Xerife de Painscreek",
    note: "É identificado como xerife; a carta de 1998 registra sua transferência para Grand County.",
    status: "confirmado",
  },
  {
    id: "wanda",
    name: "Wanda Tyler",
    role: "Autora de diário · vínculo com Derrick relatado",
    note: "Há diários sob seu nome; o vínculo com Derrick e as opiniões sobre Sofia são relatos atribuídos.",
    status: "confirmado",
  },
  {
    id: "mary",
    name: "Mary Martinez",
    role: "Funcionária da mansão (segundo notícia)",
    note: "Diário identificado; a notícia a descreve como funcionária e relata que encontrou Vivian; residência não confirmada.",
    status: "confirmado",
  },
  {
    id: "oliver",
    name: "Oliver (sobrenome não confirmado)",
    role: "Fotografia (relatos; nome incompleto)",
    note: "Há menções a um Oliver como professor/fotógrafo; “Gibson” e uma loja de fotografia não foram confirmados.",
    status: "confirmado",
  },
  {
    id: "rachel",
    name: "Irmã Rachel Davis",
    role: "Religiosa do Orfanato São Patrício",
    note: "A carta a Scott está assinada por Irmã Rachel Davis; as lembranças sobre ele continuam atribuídas à autora.",
    status: "confirmado",
  },
  {
    id: "calvin",
    name: "Padre Calvin",
    role: "Padre mencionado nos relatos",
    note: "As fontes o chamam de “padre Calvin”; o sobrenome Bennett não foi confirmado.",
    status: "confirmado",
  },
  {
    id: "sylvia",
    name: "Sylvia",
    role: "Carta atribuída a Sylvia pela interface",
    note: "O título da interface atribui a carta a Sylvia; não há assinatura visível no trecho e o conteúdo é relato.",
    status: "confirmado",
  },
  {
    id: "hannah",
    name: "Hannah",
    role: "Identidade não confirmada nos documentos revisados",
    note: "Revisão pendente: não foi localizada identificação primária suficiente na transcrição fornecida; aguarda documento original que a nomeie.",
    status: "pendente",
  },
  {
    id: "nicole",
    name: "Nicole",
    role: "Identidade não confirmada nos documentos revisados",
    note: "Revisão pendente: não foi localizada identificação primária suficiente na transcrição fornecida; aguarda documento original que a nomeie.",
    status: "pendente",
  },
  {
    id: "katherine",
    name: "Katherine",
    role: "Pessoa citada em registro de enfermagem",
    note: "O registro diz que Katherine telefonou relatando doença; profissão de enfermeira e sobrenome não foram confirmados.",
    status: "confirmado",
  },
  {
    id: "daniel",
    name: "Daniel",
    role: "Destinatário de carta · mencionado em diário",
    note: "Remetente não identificado o chama de “meu filho”; Dorothy o viu com Laura, sem provar relação com Andrew.",
    status: "confirmado",
  },
];

const PERSON_SUMMARIES: Record<string, string> = {
  vivian:
    "O laudo hospitalar a identifica como esposa de Charles. A notícia relata que ela foi encontrada morta; uma carta anônima chama o caso de assassinato, sem identificar autor.",
  charles:
    "Diários e documentos identificam Charles como marido de Vivian e pai de Trisha; uma notícia o chama de ex-prefeito. Suas interpretações pessoais permanecem atribuídas a ele.",
  magdalene:
    "Uma carta identifica Magdalene Roberts como mãe de Charles; diários e um laudo registram relatos sobre a expectativa de um herdeiro, sem formar uma biografia completa.",
  trisha:
    "Registros identificam Trisha como filha de Vivian e Charles; em seu diário, ela relata seus encontros com Scott e o desejo de manter a relação em segredo.",
  bernard:
    "A ficha funcional identifica Bernard Hopkins como mordomo e descreve responsabilidades na casa; as observações de seu caderno são relatos pessoais, não prova de culpa.",
  dorothy:
    "Em carta a Charles, Dorothy relata mais de vinte anos de serviço; em seu diário, registra que ajudou a cuidar de Sofia durante a gravidez.",
  derrick:
    "Derrick Tyler é identificado como motorista da família Roberts; em seu diário, relata convivência com Scott Brooks e Trisha Roberts.",
  sofia:
    "Os documentos mencionam Sofia, mas não confirmam o sobrenome “Miller”. Relatos divergem entre sua partida de Painscreek e sua morte; o destino permanece incerto.",
  scott:
    "Irmã Rachel relata que Matthew adotou Scott. A possível identificação de Scott com Vincent permanece em aberto e não é apresentada como fato.",
  matthew:
    "Matthew Brooks é identificado como padre da Igreja da Trindade; em carta, Irmã Rachel relata que ele adotou Scott.",
  andrew:
    "O caderno está associado ao nome Andrew Reed; uma notícia o descreve como jardineiro e faz-tudo da família Roberts e relata sua morte após um incêndio cuja causa não estava determinada.",
  henry:
    "Dr. Henry Johnson assina um laudo médico do hospital sobre Vivian; a acusação financeira da p. 97 é atribuída a investigadores e não aparece como fato comprovado.",
  moss: "Uma carta anônima endereçada ao detetive particular Steven Moss solicita uma investigação sobre a morte de Vivian Roberts; a remetente não é identificada.",
  james:
    "James Howard é identificado como xerife de Painscreek; relatório oficial e carta de transferência documentam seu cargo e sua realocação em 1998.",
  wanda:
    "Diários identificados como de Wanda Tyler registram sua relação com Derrick e seus cuidados com Vivian; suas opiniões sobre Sofia não são fatos independentes.",
  mary: "O diário identifica Mary Martinez; uma notícia a descreve como funcionária da mansão e relata que encontrou Vivian e chamou a emergência.",
  oliver:
    "Os documentos mencionam um Oliver como professor de fotografia de Trisha e fotógrafo de eventos; o sobrenome Gibson e vínculo com uma loja não foram confirmados.",
  rachel:
    "Irmã Rachel Davis assina uma carta do Orfanato São Patrício a Scott e relata que Matthew o adotou; esse trecho é o relato da própria autora.",
  calvin:
    "Os documentos mencionam um “padre Calvin” em relatos de Mary, Matthew e Scott; as páginas consultadas não confirmam o sobrenome Bennett.",
  sylvia:
    "A interface intitula o documento da p. 93 “Carta de confissão de Sylvia”; a página não mostra assinatura visível, e o título não valida as alegações narradas.",
  hannah:
    "A identidade de Hannah e sua relação com os registros do caso não puderam ser confirmadas nas fontes primárias localizadas; aguarda-se documento identificador.",
  nicole:
    "A identidade de Nicole e sua relação com os registros do caso não puderam ser confirmadas nas fontes primárias localizadas; aguarda-se documento identificador.",
  katherine:
    "Um registro de enfermagem de 1993 menciona que Katherine telefonou dizendo estar doente; não identifica seu sobrenome nem confirma sua função profissional.",
  daniel:
    "Uma carta sem remetente identificado, dirigida a Daniel, o chama de “meu filho”; Dorothy relata tê-lo visto com Laura no funeral de Andrew. A relação com Andrew não é estabelecida.",
};

const PLACES: Place[] = [
  {
    id: "mansion",
    name: "Roberts Mansion",
    group: "Residência",
    description: "Local principal a ser mapeado por cômodos e acessos.",
    status: "pendente",
  },
  {
    id: "charles-study",
    name: "Escritório de Charles",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; documentos e mecanismo de acesso aguardam validação.",
    status: "pendente",
  },
  {
    id: "tea-room",
    name: "Sala de chá",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; registrar cada documento e objeto encontrado.",
    status: "pendente",
  },
  {
    id: "gallery",
    name: "Galeria",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; eventuais cofres e pistas serão ligados às fontes.",
    status: "pendente",
  },
  {
    id: "vivian-room",
    name: "Quarto de Vivian",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; diários e objetos aguardam transcrição verificada.",
    status: "pendente",
  },
  {
    id: "trisha-room",
    name: "Quarto de Trisha",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; registrar acessos e documentos.",
    status: "pendente",
  },
  {
    id: "security-room",
    name: "Sala de segurança",
    group: "Roberts Mansion",
    description: "Sub-local da mansão; registros e chaves precisam de conferência.",
    status: "pendente",
  },
  {
    id: "attic",
    name: "Sótão",
    group: "Roberts Mansion / Igreja",
    description: "A localização exata e os acessos devem ser validados na fonte.",
    status: "pendente",
  },
  {
    id: "well",
    name: "Poço do jardim",
    group: "Roberts Mansion",
    description: "Local provisório; confirmar objetos, acesso e contexto.",
    status: "pendente",
  },
  {
    id: "hospital",
    name: "Painscreek Community Hospital",
    group: "Hospital",
    description: "Mapear arquivos, salas, escritório médico e áreas de serviço.",
    status: "pendente",
  },
  {
    id: "morgue",
    name: "Porão / necrotério",
    group: "Hospital",
    description: "Sub-local provisório; confirmar os objetos e documentos encontrados.",
    status: "pendente",
  },
  {
    id: "church",
    name: "Trinity Church",
    group: "Religioso",
    description: "Mapear quartos, depósito, confessionário e áreas superiores.",
    status: "pendente",
  },
  {
    id: "scott-cabin",
    name: "Cabana de Scott",
    group: "Residência",
    description: "Mapear cômodos e passagens somente após conferir a fonte.",
    status: "pendente",
  },
  {
    id: "inn",
    name: "Anne’s Courtyard Inn & Suites",
    group: "Hospedagem",
    description: "Mapear recepção, quartos e registros associados.",
    status: "pendente",
  },
  {
    id: "dorothy-house",
    name: "Casa de Dorothy",
    group: "Residência",
    description: "Local e documentos pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "bernard-house",
    name: "Casa de Bernard",
    group: "Residência",
    description: "Local e objetos pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "andrew-house",
    name: "Casa de Andrew",
    group: "Residência",
    description: "Local e documentos pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "cemetery",
    name: "Cemitério",
    group: "Público",
    description: "Conferir inscrições, túmulos e pistas de acesso.",
    status: "pendente",
  },
  {
    id: "sheriff",
    name: "Escritório do xerife",
    group: "Institucional",
    description: "Conferir arquivos, livros de registro e cadeia de custódia.",
    status: "pendente",
  },
  {
    id: "wanda-house",
    name: "Casa de Wanda e Derrick",
    group: "Residência",
    description: "Local e diários pendentes de conferência.",
    status: "pendente",
  },
  {
    id: "photo-shop",
    name: "Loja de fotografia de Oliver",
    group: "Comércio",
    description: "Conferir fotos, registros e ferramentas citadas.",
    status: "pendente",
  },
  {
    id: "lake",
    name: "Lago",
    group: "Exterior",
    description: "Vínculo com a cronologia e a descoberta de um corpo precisa de fonte.",
    status: "pendente",
  },
  {
    id: "river",
    name: "Área do rio",
    group: "Exterior",
    description: "Relação com Sofia a confirmar documentalmente.",
    status: "pendente",
  },
  {
    id: "drain",
    name: "Dreno junto à igreja",
    group: "Exterior",
    description: "Acesso e objetos associados pendentes de verificação.",
    status: "pendente",
  },
  {
    id: "sewers",
    name: "Esgotos e acessos subterrâneos",
    group: "Infraestrutura",
    description: "Mapear entradas, conexões e mecanismos após validar os documentos.",
    status: "pendente",
  },
];

const DOCUMENTS: DocumentItem[] = [
  {
    id: "diary-vivian",
    title: "Diários de Vivian Roberts",
    type: "Diário",
    location: "PDF · páginas 73–77; local físico não indicado",
    status: "parcial",
    body: "O histórico do projeto confirma diários identificados como de Vivian nas páginas 73–77; há resumo das entradas de 1972 e 1994 na transcrição de trabalho e cinco imagens no grupo Vivian da galeria. Ainda falta cotejo literal ampliado de cada entrada; datas e passagens incertas devem permanecer assinaladas.",
  },
  {
    id: "letters",
    title: "Cartas e bilhetes",
    type: "Correspondência",
    location: "Múltiplos locais",
    status: "parcial",
    body: "Correspondências são registradas nas páginas 89–94, 99–104 e 110–111, incluindo a carta endereçada a Daniel e cartas relacionadas a James, Rachel e Moss. Os documentos não formam uma única fonte: manter cada página, remetente, destinatário e assinatura separados. As transcrições completas e a conferência de todos os campos continuam pendentes.",
  },
  {
    id: "medical-records",
    title: "Registros médicos e laudos",
    type: "Documento oficial",
    location: "Painscreek Community Hospital · páginas 84–85, 94 e 105",
    status: "parcial",
    body: "O material registra referências ao hospital nas páginas 84–85, um laudo médico de Vivian na página 94 e registros de enfermagem na página 105. São fontes distintas e não devem ser tratadas como um laudo único ou como autópsia. Campos, autoria, data e texto integral ainda precisam de conferência individual.",
  },
  {
    id: "photos",
    title: "Fotografias e versos",
    type: "Fotografia",
    location: "Referências nas páginas 55, 67, 102 e 116; local físico não confirmado",
    status: "parcial",
    body: "As fontes mencionam fotografias, mas as páginas disponíveis não permitem identificar com segurança cada imagem citada nem transcrever todos os versos. As páginas 55 e 116 podem referir-se à mesma fotografia, sem confirmação visual conclusiva; não contar como duas provas independentes nem atribuir identidade ou conteúdo por inferência.",
  },
  {
    id: "recordings",
    title: "Gravações e mensagens",
    type: "Áudio",
    location: "Registros da sala de segurança · páginas 106–107",
    status: "parcial",
    body: "O livro de segurança registra fitas VHS novas e uma fita de vigilância desaparecida (páginas 106–107). Isso confirma o registro de fitas, não o conteúdo da gravação ausente. O arquivo original e uma transcrição verificável do áudio não estão entre os PNGs recebidos; não reconstruir o que a fita mostraria.",
  },
];

const statusLabel: Record<ReviewStatus, string> = {
  pendente: "Revisão pendente",
  parcial: "Revisão parcial · lacunas abertas",
  confirmado: "Confirmado na fonte",
  contradicao: "Contradição em aberto",
};

function StatusPill({ status }: { status: ReviewStatus }) {
  return (
    <span className="inline-flex border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-200">
      {statusLabel[status]}
    </span>
  );
}

type BoardConnection = { personId: string; placeId: string };
function InvestigationBoard({ onClose }: { onClose: () => void }) {
  const [connections, setConnections] = useState<BoardConnection[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("vivian-investigation-board-v1") || "[]",
      );
      return Array.isArray(saved)
        ? saved.filter(
            (item) => item && typeof item.personId === "string" && typeof item.placeId === "string",
          )
        : [];
    } catch {
      return [];
    }
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [step, setStep] = useState<"people" | "places">("people");
  const [confirmAnotherPlace, setConfirmAnotherPlace] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [notice, setNotice] = useState(
    "Escolha uma pessoa e depois selecione um ou mais locais para relacioná-la.",
  );
  useEffect(() => {
    window.localStorage.setItem("vivian-investigation-board-v1", JSON.stringify(connections));
  }, [connections]);

  const linkedPersonIds = new Set(connections.map((item) => item.personId));
  const availablePeople = PEOPLE.filter((person) => !linkedPersonIds.has(person.id));
  const selectedPerson = PEOPLE.find((person) => person.id === selectedPersonId) ?? null;
  const filteredPlaces = PLACES.filter((place) => {
    const search = placeQuery.trim().toLocaleLowerCase("pt-BR");
    return (
      !search ||
      `${place.name} ${place.group} ${place.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(search)
    );
  });
  const openPlacePicker = (personId: string, isAdditional = false) => {
    const person = PEOPLE.find((item) => item.id === personId);
    if (!person) return;
    setSelectedPersonId(personId);
    setPlaceQuery("");
    setStep("places");
    setNotice(
      isAdditional
        ? `Adicione outro local para ${person.name}. As ligações existentes serão mantidas.`
        : `Agora escolha um local relacionado a ${person.name}.`,
    );
  };
  const addConnection = (personId: string, placeId: string) => {
    const person = PEOPLE.find((item) => item.id === personId);
    const place = PLACES.find((item) => item.id === placeId);
    if (!person || !place) return;
    if (connections.some((item) => item.personId === personId && item.placeId === placeId)) {
      setNotice(`${person.name} já está relacionado(a) a ${place.name}. Escolha outro local.`);
      return;
    }
    setConnections((current) => [...current, { personId, placeId }]);
    setPlaceQuery("");
    setNotice(`Local adicionado: ${person.name} ↔ ${place.name}.`);
    setConfirmAnotherPlace(true);
  };
  const removeConnection = (personId: string, placeId: string) => {
    const person = PEOPLE.find((item) => item.id === personId);
    const place = PLACES.find((item) => item.id === placeId);
    const remainingForPerson = connections.filter(
      (item) => item.personId === personId && item.placeId !== placeId,
    );
    setConnections((current) =>
      current.filter((item) => !(item.personId === personId && item.placeId === placeId)),
    );
    setNotice(
      remainingForPerson.length === 0
        ? `${person?.name ?? "Pessoa"} ficou sem locais relacionados e voltou para a lista de pessoas disponíveis.`
        : `Ligação com ${place?.name ?? "o local"} removida. As outras ligações de ${person?.name ?? "essa pessoa"} foram mantidas.`,
    );
  };
  const groupedConnections = PEOPLE.map((person) => ({
    person,
    places: connections
      .filter((item) => item.personId === person.id)
      .map((link) => ({
        ...link,
        place: PLACES.find((place) => place.id === link.placeId),
      }))
      .filter((link) => link.place),
  })).filter((group) => group.places.length > 0);

  return (
    <main className="min-h-screen bg-[#11100e] px-3 py-5 text-[#eee9df] sm:px-7 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#c4a779]">
              Dexter Revival Project · Evidências conectadas
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">Quadro investigativo</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
              Relacione cada pessoa a quantos locais forem necessários. Você pode acrescentar ou
              remover ligações a qualquer momento; tudo fica salvo neste navegador.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
          >
            <ArrowLeft size={16} /> Voltar ao caso
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 border border-[#4b4439] bg-[#1b1a17] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-[#c9c1b5]" aria-live="polite">
            {notice}
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="border border-[#79664c] px-3 py-2 font-mono text-xs">
              {connections.length} ligações
            </span>
            <span className="border border-[#79664c] px-3 py-2 font-mono text-xs">
              {availablePeople.length} pessoas sem locais
            </span>
            <button
              type="button"
              onClick={() => {
                setConnections([]);
                setSelectedPersonId(null);
                setStep("people");
                setPlaceQuery("");
                setNotice("Quadro limpo. Todas as pessoas voltaram para a lista.");
              }}
              className="min-h-10 border border-red-900/70 px-3 py-2 font-mono text-xs text-red-200 hover:bg-red-950/40"
            >
              Limpar quadro
            </button>
          </div>
        </div>

        {step === "people" ? (
          <section className="mt-5 border border-[#4b4439] bg-[#191714] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl sm:text-3xl">
                  <Users size={21} className="text-[#c4a779}" /> Escolha uma pessoa
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#a9a092]">
                  Toque ou clique em uma pessoa para começar a relacioná-la com locais. Pessoas que
                  já têm ligações aparecem abaixo e podem receber locais adicionais.
                </p>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#c4a779]">
                {availablePeople.length} disponíveis
              </span>
            </div>
            {availablePeople.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availablePeople.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => openPlacePicker(person.id)}
                    className="flex min-h-[92px] items-center justify-between gap-3 border border-[#4b4439] bg-[#211f1b] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#c4a779]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b77e]"
                  >
                    <span>
                      <span className="block font-medium leading-snug">{person.name}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-wider text-[#a9a092]">
                        {person.role}
                      </span>
                    </span>
                    <span className="shrink-0 text-[#c4a779]" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 border border-[#79664c] bg-[#211f1b] p-6 text-center">
                <p className="font-display text-2xl">Todas as pessoas já têm locais relacionados</p>
                <p className="mt-2 text-sm text-[#bdb5a8]">
                  Você pode adicionar outros locais ou remover ligações na seção abaixo.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section
            className="mt-5 border border-[#4b4439] bg-[#191714] p-4 sm:p-6"
            aria-labelledby="place-picker-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#4b4439] pb-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                  Selecionar local
                </p>
                <h2 id="place-picker-title" className="mt-2 font-display text-2xl sm:text-3xl">
                  Onde essa pessoa se conecta?
                </h2>
                {selectedPerson && (
                  <div className="mt-3 max-w-2xl border border-[#79664c]/70 bg-[#211f1b] p-3 sm:p-4">
                    <p className="text-sm text-[#bdb5a8]">
                      Pessoa selecionada:{" "}
                      <strong className="text-[#ead8b8]">{selectedPerson.name}</strong>
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c4a779]">
                      Lembrete do personagem
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#d2c9bb]">
                      {PERSON_SUMMARIES[selectedPerson.id] ?? selectedPerson.note}
                    </p>
                  </div>
                )}
                {selectedPerson &&
                  connections.some((item) => item.personId === selectedPerson.id) && (
                    <p className="mt-2 text-xs text-[#c4a779]">
                      Os locais já associados serão preservados; selecione outro local para
                      acrescentar uma ligação.
                    </p>
                  )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPersonId(null);
                  setStep("people");
                  setPlaceQuery("");
                  setNotice(
                    "Escolha uma pessoa ou adicione um local a alguém que já aparece nas ligações registradas.",
                  );
                }}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
              >
                <ArrowLeft size={15} /> Voltar
              </button>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs uppercase tracking-wider text-[#bdb5a8]">
                Buscar local
              </span>
              <span className="flex items-center gap-2 border border-[#5c5143] bg-[#11100e] px-3">
                <FileSearch size={17} className="shrink-0 text-[#c4a779}" />
                <input
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  placeholder="Digite o nome de um local..."
                  className="min-h-12 w-full bg-transparent text-base text-[#eee9df] outline-none placeholder:text-[#81796d]"
                />
              </span>
            </label>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlaces.map((place) => {
                const alreadyLinked =
                  !!selectedPersonId &&
                  connections.some(
                    (item) => item.personId === selectedPersonId && item.placeId === place.id,
                  );
                return (
                  <button
                    key={place.id}
                    type="button"
                    disabled={alreadyLinked}
                    onClick={() => selectedPersonId && addConnection(selectedPersonId, place.id)}
                    className={`min-h-[112px] border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b77e] ${alreadyLinked ? "cursor-not-allowed border-[#4b4439] bg-[#171512] opacity-60" : "border-[#6a5942] bg-[#211f1b] hover:border-[#c4a779] hover:bg-[#c4a779]/10"}`}
                  >
                    <span className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 shrink-0 text-[#c4a779]" />
                      <span>
                        <span className="block font-medium leading-snug">{place.name}</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-[#c4a779]">
                          {place.group}
                        </span>
                      </span>
                    </span>
                    <span className="mt-3 block text-xs leading-relaxed text-[#a9a092]">
                      {place.description}
                    </span>
                    <span className="mt-4 flex items-center justify-end gap-2 border-t border-[#4b4439] pt-3 font-mono text-[10px] uppercase tracking-wider text-[#ead8b8]">
                      {alreadyLinked ? "Já relacionado" : "Adicionar este local"}{" "}
                      <span aria-hidden="true">{alreadyLinked ? "✓" : "→"}</span>
                    </span>
                  </button>
                );
              })}
              {filteredPlaces.length === 0 && (
                <p className="border border-dashed border-[#5c5143] p-5 text-sm text-[#bdb5a8] sm:col-span-2 lg:col-span-3">
                  Nenhum local encontrado. Tente outro termo.
                </p>
              )}
            </div>
          </section>
        )}

        <section className="mt-5 border border-[#4b4439] bg-[#242019] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Network size={20} className="text-[#c4a779}" /> Ligações registradas
            </h2>
            <span className="font-mono text-xs text-[#c4a779]">
              {connections.length} ligações · {groupedConnections.length} pessoas
            </span>
          </div>
          {groupedConnections.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupedConnections.map(({ person, places }) => (
                <article key={person.id} className="border border-[#6a5942] bg-[#171512]/90 p-4">
                  <div className="flex items-start gap-3">
                    <Users size={17} className="mt-0.5 shrink-0 text-[#c4a779]" />
                    <div className="min-w-0">
                      <p className="font-medium">{person.name}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#a9a092]">
                        {person.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {places.map(
                      ({ place }) =>
                        place && (
                          <div
                            key={place.id}
                            className="flex items-start justify-between gap-2 border border-[#79664c]/70 bg-[#3a2e20]/50 px-3 py-3"
                          >
                            <span className="flex min-w-0 items-start gap-2 text-sm text-[#ead8b8]">
                              <MapPin size={14} className="mt-0.5 shrink-0 text-[#c4a779]" />
                              <span className="min-w-0 break-words">
                                {place.name}
                                <span className="mt-1 block text-[10px] uppercase tracking-wider text-[#a9a092]">
                                  {place.group}
                                </span>
                              </span>
                            </span>
                            <button
                              type="button"
                              aria-label={`Remover local ${place.name} de ${person.name}`}
                              onClick={() => removeConnection(person.id, place.id)}
                              className="min-h-8 min-w-8 shrink-0 border border-[#79664c] text-lg text-[#bdb5a8] hover:border-red-800 hover:text-red-200"
                            >
                              ×
                            </button>
                          </div>
                        ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPlacePicker(person.id, true)}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 border border-[#79664c] px-3 py-2 text-xs text-[#ead8b8] transition hover:border-[#c4a779] hover:bg-[#c4a779]/10"
                  >
                    <span className="text-lg leading-none">+</span> Adicionar outro local
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 border border-dashed border-[#5c5143] p-5 text-sm text-[#a9a092]">
              As ligações que você criar aparecerão aqui para revisão.
            </p>
          )}
        </section>
        {confirmAnotherPlace && selectedPerson && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="presentation"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-another-place-title"
              className="w-full max-w-md border border-[#c4a779] bg-[#1b1a17] p-5 shadow-2xl sm:p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                Ligação registrada
              </p>
              <h2 id="confirm-another-place-title" className="mt-2 font-display text-2xl">
                Deseja adicionar esse personagem a outro local?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">
                <strong className="text-[#ead8b8]">{selectedPerson.name}</strong> já foi relacionado
                ao local escolhido. Você pode continuar adicionando outros locais ou voltar à lista
                de personagens.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAnotherPlace(false);
                    setSelectedPersonId(null);
                    setStep("people");
                    setPlaceQuery("");
                    setNotice(
                      `${selectedPerson.name} foi registrado(a). Escolha outro personagem para continuar.`,
                    );
                  }}
                  className="min-h-11 border border-[#79664c] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#d4cabc] hover:bg-white/5"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAnotherPlace(false);
                    setStep("places");
                    setPlaceQuery("");
                    setNotice(
                      `Escolha outro local para ${selectedPerson.name}. As ligações existentes serão mantidas.`,
                    );
                  }}
                  className="min-h-11 border border-[#c4a779] bg-[#c4a779]/10 px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8] hover:bg-[#c4a779]/20"
                >
                  Sim, adicionar outro local
                </button>
              </div>
            </section>
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-[#81796d]">
          Importante: uma ligação entre pessoa e local é uma anotação de investigação; sozinha, não
          confirma presença na noite do crime nem culpa.
        </p>
      </div>
    </main>
  );
}

/**
 * Entrada do Capítulo 6, integrada ao menu principal e à investigação jogável.
 * A narrativa final permanece bloqueada até a acusação correta.
 */
export function VivianRobertsCase({
  onBack,
  soundOn = true,
  onToggleSound,
  musicVolume = 0.3,
  onMusicVolumeChange,
}: {
  onBack?: () => void;
  soundOn?: boolean;
  onToggleSound?: () => void;
  musicVolume?: number;
  onMusicVolumeChange?: (value: number) => void;
}) {
  const [showBoard, setShowBoard] = useState(false);
  const [caseCompleted, setCaseCompleted] = useState(readVivianCaseCompleted);
  const [showPlayableGame, setShowPlayableGame] = useState(
    () =>
      typeof window !== "undefined" && window.localStorage.getItem("vivian-map-target") !== null,
  );
  const [ambientOn, setAmbientOn] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(() => {
    if (typeof window === "undefined") return 0.22;
    const saved = window.localStorage.getItem("vivian-ambient-volume");
    if (saved === null) return 0.22;
    const parsed = Number(saved);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.22;
  });
  const ambientRef = useRef<{
    context: AudioContext;
    nodes: AudioScheduledSourceNode[];
    gains: [GainNode, GainNode];
  } | null>(null);
  const [section, setSection] = useState<"pessoas" | "locais" | "documentos">("pessoas");
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [foundVivianClues, setFoundVivianClues] = useState<string[]>(readFoundVivianClues);
  const diaryPeople = PEOPLE.filter((person) => {
    const groupId = DIARY_IMAGE_GROUP_IDS[person.id] ?? person.id;
    return PAINSCREEK_EVIDENCE_IMAGE_GROUPS.some((group) => group.id === groupId);
  });
  const selectedDiaryIndex = selectedPerson
    ? diaryPeople.findIndex((person) => person.id === selectedPerson.id)
    : -1;
  const previousDiary = selectedDiaryIndex > 0 ? diaryPeople[selectedDiaryIndex - 1] : undefined;
  const nextDiary =
    selectedDiaryIndex >= 0 && selectedDiaryIndex < diaryPeople.length - 1
      ? diaryPeople[selectedDiaryIndex + 1]
      : undefined;

  useEffect(() => {
    const refreshDiaryUnlocks = () => setFoundVivianClues(readFoundVivianClues());
    window.addEventListener("vivian-investigation-progress", refreshDiaryUnlocks);
    return () => window.removeEventListener("vivian-investigation-progress", refreshDiaryUnlocks);
  }, []);

  useEffect(() => {
    if (!ambientOn || typeof window === "undefined") return;
    const startAmbient = () => {
      if (!ambientOn || ambientRef.current) return;
      if (typeof AudioContext === "undefined") return;
      const context = new AudioContext();
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
      ambientRef.current = { context, nodes: [noise, hum], gains: [windGain, humGain] };
    };
    window.addEventListener("pointerdown", startAmbient, { once: true });
    return () => window.removeEventListener("pointerdown", startAmbient);
  }, [ambientOn, ambientVolume]);
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.gains[0].gain.value = 0.11 * ambientVolume;
      ambientRef.current.gains[1].gain.value = 0.036 * ambientVolume;
    }
  }, [ambientVolume]);
  useEffect(() => {
    window.localStorage.setItem("vivian-ambient-volume", String(ambientVolume));
  }, [ambientVolume]);
  useEffect(() => {
    if (ambientOn) return;
    const current = ambientRef.current;
    ambientRef.current = null;
    if (current) {
      current.nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // A limpeza é best-effort; o nó pode já ter sido interrompido.
        }
      });
      void current.context.close();
    }
  }, [ambientOn]);
  useEffect(
    () => () => {
      const current = ambientRef.current;
      if (current) {
        current.nodes.forEach((node) => {
          try {
            node.stop();
          } catch {
            // A limpeza é best-effort; o nó pode já ter sido interrompido.
          }
        });
        void current.context.close();
        ambientRef.current = null;
      }
    },
    [],
  );

  const filteredPeople = useMemo(
    () =>
      PEOPLE.filter((p) =>
        `${p.name} ${p.role} ${p.note}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const filteredPlaces = useMemo(
    () =>
      PLACES.filter((p) =>
        `${p.name} ${p.group} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const filteredDocuments = useMemo(
    () =>
      DOCUMENTS.filter((d) =>
        `${d.title} ${d.type} ${d.location}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const closeDetail = () => {
    setSelectedPerson(null);
    setSelectedPlace(null);
    setSelectedDocument(null);
  };

  if (showPlayableGame)
    return (
      <VivianInvestigationGame
        onBack={() => {
          setFoundVivianClues(readFoundVivianClues());
          setCaseCompleted(readVivianCaseCompleted());
          setShowPlayableGame(false);
        }}
      />
    );

  if (showBoard) return <InvestigationBoard onClose={() => setShowBoard(false)} />;

  return (
    <main className="min-h-screen bg-[#11110f] px-4 py-6 text-[#eee9df] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#5c5143] pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#c4a779]">
              Arquivo confidencial · Capítulo 06
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">O Caso Vivian Roberts</h1>
            <p className="mt-2 max-w-3xl text-xs uppercase tracking-[0.2em] text-[#bdb5a8]">
              Painscreek, 1995 · O caso que a cidade tentou esquecer
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#bdb5a8]">
              Reconstrua as relações, compare os registros e descubra quais conexões resistem às
              evidências. Não confunda suspeita com prova.
            </p>
            <div className="mt-4 max-w-xl border border-[#4b4439] bg-[#1b1a17] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#c4a779]">
                Narração de abertura · opcional
              </p>
              <audio
                className="mt-2 h-9 w-full"
                controls
                preload="none"
                src="/audio/painscreek/case-opening.wav"
                aria-label="Ouvir narração de abertura do Caso Vivian Roberts"
              />
              <p className="mt-2 text-[11px] leading-5 text-[#81796d]">
                A reprodução não altera o progresso da investigação.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
              >
                <ArrowLeft size={16} /> Voltar aos capítulos
              </button>
            )}
            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundOn}
                className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
              >
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} Música:{" "}
                {soundOn ? "ligada" : "desligada"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setAmbientOn((value) => !value)}
              aria-pressed={ambientOn}
              className="inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs hover:bg-white/5"
            >
              {ambientOn ? <Volume2 size={16} /> : <VolumeX size={16} />} Ambiente:{" "}
              {ambientOn ? "ligado" : "desligado"}
            </button>
          </div>
        </header>
        <div className="mx-auto mt-5 max-w-7xl">
          <VivianFinalReveal unlocked={caseCompleted} />
        </div>
        <div
          className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center gap-3 px-0"
          aria-label="Controles de áudio"
        >
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className="min-h-10 border border-[#79664c] px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-[#c4a779]"
          >
            Trilha: {soundOn ? "ligada" : "desligada"}
          </button>
          <label className="flex min-h-10 items-center gap-2 border border-[#4b4439] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#bdb5a8]">
            Música {Math.round(musicVolume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(event) => onMusicVolumeChange?.(Number(event.target.value))}
              aria-label="Volume da trilha musical"
              className="w-24 accent-[#c4a779]"
            />
          </label>
          <button
            type="button"
            onClick={() => setAmbientOn((value) => !value)}
            aria-pressed={ambientOn}
            className="min-h-10 border border-[#4b4439] px-3 py-2 font-mono text-[10px] uppercase tracking-wider hover:border-[#c4a779]"
          >
            Ambiente: {ambientOn ? "ligado" : "desligado"}
          </button>
          <label className="flex min-h-10 items-center gap-2 border border-[#4b4439] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#bdb5a8]">
            Ambiente {Math.round(ambientVolume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientVolume}
              onChange={(event) => setAmbientVolume(Number(event.target.value))}
              aria-label="Volume do som ambiente"
              className="w-24 accent-[#c4a779]"
            />
          </label>
        </div>
        <figure className="relative mx-auto mt-6 w-full overflow-hidden border border-[#79664c] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="relative aspect-[16/7] min-h-[230px] w-full sm:min-h-[320px]">
            <img
              src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/624270/header.jpg"
              alt="Arte oficial de The Painscreek Killings, jogo que inspira o caso Vivian Roberts"
              loading="eager"
              className="h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/5"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#e1c18d]">
                  Trilha sonora · atmosfera de investigação
                </p>
                <p className="mt-1 font-display text-xl text-white sm:text-3xl">
                  O Caso Vivian Roberts
                </p>
                <p className="mt-1 text-xs text-white/75">
                  Tema musical de Painscreek + ambiente contínuo
                </p>
              </div>
            </div>
          </div>
          <figcaption className="border-t border-[#79664c] bg-[#171512] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a9a092] sm:px-4">
            Arquivo visual · The Painscreek Killings · EQ Studios
          </figcaption>
        </figure>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#4b4439] bg-[#1b1a17] p-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#c4a779]">
              Ferramentas de investigação
            </p>
            <p className="mt-1 text-sm text-[#bdb5a8]">
              Organize conexões entre personagens e consulte os mapas do caso.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowPlayableGame(true)}
              className="inline-flex min-h-12 items-center gap-2 border border-[#c4a779] bg-[#c4a779]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#ead8b8] transition hover:bg-[#c4a779]/20"
            >
              <FileSearch size={17} /> Iniciar investigação
            </button>
            <button
              type="button"
              onClick={() => setShowBoard(true)}
              className="inline-flex min-h-12 items-center gap-2 border border-[#c4a779] bg-[#c4a779]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#ead8b8] transition hover:bg-[#c4a779]/20"
            >
              <ClipboardList size={17} /> Quadro investigativo
            </button>
            <Link
              to="/mapas"
              onClick={() => {
                try {
                  window.sessionStorage.setItem("dexter-return-to-vivian-case", "true");
                } catch {
                  // A navegação continua funcional se o armazenamento da sessão estiver bloqueado.
                }
              }}
              className="inline-flex min-h-12 items-center gap-2 border border-[#a5a78d] bg-[#a5a78d]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#d9dbc9] transition hover:bg-[#a5a78d]/20"
            >
              <MapPin size={17} /> Mapa
            </Link>
            <Link
              to="/linha-do-tempo"
              onClick={() => {
                try {
                  window.sessionStorage.setItem("dexter-return-to-vivian-case", "true");
                } catch {
                  // A navegação continua funcional se o armazenamento da sessão estiver bloqueado.
                }
              }}
              className="inline-flex min-h-12 items-center gap-2 border border-[#79664c] bg-[#79664c]/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#e2cba4] transition hover:bg-[#79664c]/20"
            >
              <Clock3 size={17} /> Linha do tempo
            </Link>
          </div>
        </div>
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <Users className="mb-3 text-[#c4a779]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">
              Personagens catalogados
            </p>
            <p className="mt-1 text-3xl">{PEOPLE.length}</p>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <MapPin className="mb-3 text-[#c4a779]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">
              Locais para revisar
            </p>
            <p className="mt-1 text-3xl">{PLACES.length}</p>
          </div>
          <div className="border border-[#4b4439] bg-[#1b1a17] p-4">
            <BookOpen className="mb-3 text-[#c4a779]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#bdb5a8]">
              Grupos documentais
            </p>
            <p className="mt-1 text-3xl">{DOCUMENTS.length}</p>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Seções do dossiê">
          {(
            [
              { id: "pessoas", label: "Personagens" },
              { id: "locais", label: "Locais" },
              { id: "documentos", label: "Documentos e evidências" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={section === item.id}
              onClick={() => {
                setSection(item.id);
                setQuery("");
                closeDetail();
              }}
              className={`min-h-11 border px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${section === item.id ? "border-[#c4a779] bg-[#c4a779]/10 text-[#e6cfaa]" : "border-[#4b4439] text-[#bdb5a8] hover:border-[#79664c]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex max-w-2xl items-center gap-3 border border-[#4b4439] bg-[#1b1a17] px-3">
          <FileSearch size={18} className="shrink-0 text-[#c4a779]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar personagem, local ou documento..."
            className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#81796d]"
          />
        </label>

        {section === "pessoas" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  setSelectedPerson(person);
                  setSelectedPlace(null);
                  setSelectedDocument(null);
                }}
                className="min-h-36 border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#242119]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl">{person.name}</h2>
                  <span className="text-[#c4a779]">↗</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">
                  {person.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{person.note}</p>
                <div className="mt-3">
                  <StatusPill status={person.status} />
                </div>
              </button>
            ))}
          </section>
        )}

        {section === "locais" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  setSelectedPlace(place);
                  setSelectedPerson(null);
                  setSelectedDocument(null);
                }}
                className="min-h-36 border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779] hover:bg-[#242119]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl">{place.name}</h2>
                  <MapPin size={17} className="shrink-0 text-[#c4a779]" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">
                  {place.group}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{place.description}</p>
                <div className="mt-3">
                  <StatusPill status={place.status} />
                </div>
              </button>
            ))}
          </section>
        )}

        {section === "documentos" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2">
            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setSelectedDocument(doc);
                  setSelectedPerson(null);
                  setSelectedPlace(null);
                }}
                className="border border-[#4b4439] bg-[#1b1a17] p-4 text-left transition hover:border-[#c4a779]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl">{doc.title}</h2>
                  <BookOpen size={17} className="shrink-0 text-[#c4a779]" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#c4a779]">
                  {doc.type} · {doc.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#bdb5a8]">{doc.body}</p>
                <div className="mt-3">
                  <StatusPill status={doc.status} />
                </div>
              </button>
            ))}
          </section>
        )}

        {(selectedPerson || selectedPlace || selectedDocument) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="presentation"
            onClick={closeDetail}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes do item selecionado"
              className="max-h-[85vh] w-full max-w-2xl overflow-auto border border-[#79664c] bg-[#1b1a17] p-5 sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
                    Dossiê de investigação
                  </p>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl">
                    {selectedPerson?.name ?? selectedPlace?.name ?? selectedDocument?.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  aria-label="Fechar detalhes"
                  className="min-h-10 border border-[#4b4439] p-2 hover:border-[#c4a779]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#c9c1b5]">
                {selectedPerson && (
                  <>
                    <p className="text-[#c4a779]">{selectedPerson.role}</p>
                    <p>{selectedPerson.note}</p>
                    {PAINSCREEK_EVIDENCE_IMAGE_GROUPS.some(
                      (group) =>
                        group.id ===
                        (DIARY_IMAGE_GROUP_IDS[selectedPerson.id] ?? selectedPerson.id),
                    ) && (
                      <DiaryImages
                        personId={selectedPerson.id}
                        personName={selectedPerson.name}
                        foundClues={foundVivianClues}
                        previousDiary={previousDiary?.id}
                        nextDiary={nextDiary?.id}
                        onNavigateDiary={(personId) => {
                          const target = diaryPeople.find((person) => person.id === personId);
                          if (target) setSelectedPerson(target);
                        }}
                      />
                    )}
                    {selectedPerson.status !== "confirmado" && (
                      <StatusPill status={selectedPerson.status} />
                    )}
                  </>
                )}
                {selectedPlace && (
                  <>
                    <p className="text-[#c4a779]">{selectedPlace.group}</p>
                    <p>{selectedPlace.description}</p>
                    <p>
                      O inventário de objetos, documentos, portas e dependências deste local será
                      preenchido a partir das transcrições revisadas.
                    </p>
                    <StatusPill status={selectedPlace.status} />
                  </>
                )}
                {selectedDocument && (
                  <>
                    <p className="text-[#c4a779]">
                      {selectedDocument.type} · {selectedDocument.location}
                    </p>
                    <p className="whitespace-pre-wrap">{selectedDocument.body}</p>
                    <StatusPill status={selectedDocument.status} />
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        <footer className="mt-10 border-t border-[#4b4439] pt-4 text-xs leading-relaxed text-[#81796d]">
          Versão-base de organização. Não representa ainda o caso jogável final; não contém solução
          oficial nem rota alternativa concluída.
        </footer>
      </div>
    </main>
  );
}
