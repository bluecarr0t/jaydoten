"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GalleryAllGrid } from "@/components/gallery/gallery-all-grid";
import { GalleryPhotoViewer } from "@/components/gallery/gallery-photo-viewer";
import { GalleryChromeHeader } from "@/components/gallery/gallery-chrome-header";
import { GalleryPlaceholder } from "@/components/gallery/gallery-placeholder";
import {
  GalleryPhotoTransition,
  type GalleryPhotoTransitionHandle,
} from "@/components/gallery/gallery-photo-transition";
import {
  galleryCameras,
  type GalleryCameraId,
} from "@/lib/gallery-cameras";
import {
  formatGalleryCapturedAt,
  formatGalleryLocationYear,
} from "@/lib/gallery-content";
import type { ResolvedGalleryWork } from "@/lib/gallery-types";
import {
  galleryDisplayDimensions,
  galleryImageClass,
  shouldUnoptimizeGalleryImage,
} from "@/lib/gallery-image-utils";
import {
  galleryBorderClass,
  galleryFrameClass,
  galleryMainImageMaxHeightClass,
  galleryMainImageMaxWidthClass,
  galleryWallClass,
} from "@/lib/gallery-theme";
import {
  buildGalleryGridPath,
  buildGalleryPhotoPath,
  parseGalleryViewMode,
  photoIndexFromSlug,
  type GalleryViewMode,
} from "@/lib/gallery-url";

const GALLERY_CAMERA_ID: GalleryCameraId = "leica-xe";

type GalleryViewportGridProps = {
  worksByCamera: Record<GalleryCameraId, ResolvedGalleryWork[]>;
  initialPhotoSlug?: string;
};

const STRIP_SCROLL_LOCK_MS = 120;
const STRIP_SCROLL_END_MS = 180;
const STRIP_INDEX_HYSTERESIS_PX = 28;

function thumbAspectClass(work: ResolvedGalleryWork, cameraId: GalleryCameraId) {
  if (cameraId === "leica-xe") return "aspect-[3/2]";
  if (work.aspect === "portrait") return "aspect-[3/4]";
  if (work.aspect === "square") return "aspect-square";
  return "aspect-[4/3]";
}

function GalleryImage({
  work,
  cameraId,
  imageClass,
  sizes,
  priority,
  className,
}: {
  work: ResolvedGalleryWork;
  cameraId: GalleryCameraId;
  imageClass: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { width, height } = galleryDisplayDimensions(cameraId, work);

  if (!work.hasImage) {
    return <GalleryPlaceholder work={work} />;
  }

  return (
    <Image
      src={work.src}
      alt={work.title}
      width={width}
      height={height}
      unoptimized={shouldUnoptimizeGalleryImage(work.src, work.isMock)}
      className={`${imageClass} ${className ?? ""}`}
      sizes={sizes}
      priority={priority}
    />
  );
}

const MainImage = forwardRef<
  GalleryPhotoTransitionHandle,
  {
    work: ResolvedGalleryWork;
    cameraId: GalleryCameraId;
    imageClass: string;
    frameClass?: string;
  }
>(function MainImage({ work, cameraId, imageClass, frameClass }, ref) {
  const frameSurface = frameClass ?? galleryFrameClass;

  return (
    <GalleryPhotoTransition
      ref={ref}
      className={`inline-flex items-center justify-center ${frameSurface}`}
    >
      <GalleryImage
        work={work}
        cameraId={cameraId}
        imageClass={imageClass}
        sizes="(max-width: 768px) 96vw, 70vw"
        priority
        className={`h-auto w-auto ${galleryMainImageMaxHeightClass} ${galleryMainImageMaxWidthClass}`}
      />
    </GalleryPhotoTransition>
  );
});

function NavArrow({
  symbol,
  label,
  onClick,
  disabled,
  className,
}: {
  symbol: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex size-10 shrink-0 items-center justify-center font-mono text-lg text-white/35 transition hover:text-white/80 disabled:pointer-events-none disabled:opacity-25 md:size-12 md:text-xl ${className ?? ""}`}
    >
      {symbol}
    </button>
  );
}

function FullscreenIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="size-4"
    >
      <path
        d="M2.5 6V2.5H6M10 2.5H13.5V6M13.5 10V13.5H10M6 13.5H2.5V10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

function FullscreenButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="View full screen"
      className="absolute bottom-4 left-4 z-20 flex size-9 items-center justify-center border border-white/25 bg-black/50 text-white/70 transition hover:border-white/50 hover:bg-black/70 hover:text-white md:bottom-6 md:left-6"
    >
      <FullscreenIcon />
    </button>
  );
}

function ThumbnailButton({
  work,
  cameraId,
  active,
  onSelect,
  buttonRef,
}: {
  work: ResolvedGalleryWork;
  cameraId: GalleryCameraId;
  active: boolean;
  onSelect: () => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      data-work-id={work.id}
      onClick={onSelect}
      aria-label={`View ${work.title}`}
      aria-current={active ? "true" : undefined}
      className={`block w-full shrink-0 overflow-hidden transition ${
        active
          ? "opacity-100 ring-1 ring-inset ring-white/30"
          : "opacity-45 hover:opacity-70"
      }`}
    >
      <div className={`relative w-full bg-[#1a1a1a] ${thumbAspectClass(work, cameraId)}`}>
        {work.hasImage ? (
          <Image
            src={work.src}
            alt=""
            fill
            unoptimized={shouldUnoptimizeGalleryImage(work.src, work.isMock)}
            className="object-cover"
            sizes="(max-width: 1024px) 112px, 144px"
          />
        ) : (
          <GalleryPlaceholder work={work} />
        )}
      </div>
    </button>
  );
}

export function GalleryViewportGrid({
  worksByCamera,
  initialPhotoSlug,
}: GalleryViewportGridProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const stripRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<GalleryPhotoTransitionHandle>(null);
  const thumbRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollSelectRef = useRef(false);
  const isStripScrollingRef = useRef(false);
  const stripScrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const selectedIndexRef = useRef(0);

  const photoSlug =
    (typeof params.photo === "string" ? params.photo : undefined) ??
    initialPhotoSlug;

  const cameraId = GALLERY_CAMERA_ID;
  const viewMode = parseGalleryViewMode(searchParams.get("view"));
  const isGridView = viewMode === "grid";
  const [selectedIndex, setSelectedIndex] = useState(() =>
    photoIndexFromSlug(photoSlug, worksByCamera[cameraId]?.length ?? 0),
  );
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerZoomed, setViewerZoomed] = useState(false);
  const viewerOpenRef = useRef(false);
  viewerOpenRef.current = viewerOpen;

  const camera = galleryCameras.find((c) => c.id === cameraId) ?? galleryCameras[0];
  const works = worksByCamera[cameraId];
  const work = works[selectedIndex] ?? works[0];
  const count = works.length;

  selectedIndexRef.current = selectedIndex;

  const scrollThumbIntoView = useCallback(
    (index: number, smooth = false) => {
      scrollSelectRef.current = true;
      const node = thumbRefs.current.get(works[index]?.id ?? "");
      node?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "nearest",
      });
      window.setTimeout(() => {
        scrollSelectRef.current = false;
      }, smooth ? 450 : STRIP_SCROLL_LOCK_MS);
    },
    [works],
  );

  const pickIndexFromStripScroll = useCallback(() => {
    const root = stripRef.current;
    if (!root || scrollSelectRef.current) return;

    const viewportMid =
      root.getBoundingClientRect().top + root.clientHeight / 2;

    let bestIndex = selectedIndexRef.current;
    let bestDistance = Number.POSITIVE_INFINITY;

    works.forEach((entry, index) => {
      const node = thumbRefs.current.get(entry.id);
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const thumbMid = rect.top + rect.height / 2;
      const distance = Math.abs(thumbMid - viewportMid);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex === selectedIndexRef.current) return;

    const currentNode = thumbRefs.current.get(
      works[selectedIndexRef.current]?.id ?? "",
    );
    let currentDistance = Number.POSITIVE_INFINITY;
    if (currentNode) {
      const rect = currentNode.getBoundingClientRect();
      const thumbMid = rect.top + rect.height / 2;
      currentDistance = Math.abs(thumbMid - viewportMid);
    }

    if (bestDistance >= currentDistance - STRIP_INDEX_HYSTERESIS_PX) return;

    selectedIndexRef.current = bestIndex;
    setSelectedIndex(bestIndex);
  }, [works]);

  const syncUrl = useCallback(
    (index: number, activeCameraId: GalleryCameraId) => {
      if (count <= 0 || viewerOpenRef.current || isGridView) return;
      const path = buildGalleryPhotoPath(index, activeCameraId);
      router.replace(path, { scroll: false });
    },
    [count, isGridView, router],
  );

  const applyIndex = useCallback(
    (
      index: number,
      options?: { scrollThumb?: boolean; smoothScroll?: boolean },
    ) => {
      const clamped = Math.min(count - 1, Math.max(0, index));
      selectedIndexRef.current = clamped;
      setSelectedIndex(clamped);
      if (options?.scrollThumb) {
        scrollThumbIntoView(clamped, options.smoothScroll ?? false);
      }
    },
    [count, scrollThumbIntoView],
  );

  const selectIndex = useCallback(
    (
      index: number,
      options?: {
        scrollThumb?: boolean;
        smoothScroll?: boolean;
        syncUrl?: boolean;
      },
    ) => {
      applyIndex(index, options);
      if (options?.syncUrl !== false) {
        syncUrl(selectedIndexRef.current, cameraId);
      }
    },
    [applyIndex, cameraId, syncUrl],
  );

  const selectIndexWithTransition = useCallback(
    (
      index: number,
      options?: {
        scrollThumb?: boolean;
        smoothScroll?: boolean;
        syncUrl?: boolean;
      },
    ) => {
      const clamped = Math.min(count - 1, Math.max(0, index));
      if (clamped === selectedIndexRef.current) return;

      const apply = () => selectIndex(clamped, options);
      transitionRef.current?.run(apply) ?? apply();
    },
    [count, selectIndex],
  );

  useEffect(() => {
    if (count <= 0 || isGridView) return;

    const index = photoIndexFromSlug(photoSlug, count);
    if (index === selectedIndexRef.current) return;

    if (isStripScrollingRef.current) return;

    selectedIndexRef.current = index;
    setSelectedIndex(index);
    scrollThumbIntoView(index, false);
  }, [isGridView, photoSlug, count, scrollThumbIntoView]);

  useEffect(() => {
    const root = stripRef.current;
    if (!root || works.length === 0) return;

    let rafId = 0;
    const onScroll = () => {
      isStripScrollingRef.current = true;

      if (stripScrollEndTimerRef.current) {
        clearTimeout(stripScrollEndTimerRef.current);
      }
      stripScrollEndTimerRef.current = setTimeout(() => {
        isStripScrollingRef.current = false;
        stripScrollEndTimerRef.current = null;
        syncUrl(selectedIndexRef.current, cameraId);
      }, STRIP_SCROLL_END_MS);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(pickIndexFromStripScroll);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      if (stripScrollEndTimerRef.current) {
        clearTimeout(stripScrollEndTimerRef.current);
      }
    };
  }, [works, cameraId, pickIndexFromStripScroll, syncUrl]);

  useEffect(() => {
    if (viewerOpen || isGridView) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('[role="radiogroup"], input, textarea, select')
      ) {
        return;
      }

      let delta = 0;
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowRight" ||
        event.key === "j"
      ) {
        delta = 1;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "k"
      ) {
        delta = -1;
      } else {
        return;
      }

      event.preventDefault();
      selectIndexWithTransition(selectedIndex + delta, { scrollThumb: true });
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isGridView, selectedIndex, selectIndexWithTransition, viewerOpen]);

  const handleViewModeChange = useCallback(
    (mode: GalleryViewMode) => {
      if (mode === viewMode) return;

      setViewerOpen(false);
      setViewerZoomed(false);

      if (mode === "grid") {
        router.replace(
          buildGalleryGridPath(cameraId, selectedIndexRef.current),
          { scroll: false },
        );
        return;
      }

      if (count > 0) {
        router.replace(
          buildGalleryPhotoPath(selectedIndexRef.current, cameraId),
          { scroll: false },
        );
      }
    },
    [cameraId, count, router, viewMode],
  );

  const openFromGrid = useCallback(
    (index: number) => {
      applyIndex(index);
      setViewerZoomed(false);
      setViewerOpen(true);
      router.replace(buildGalleryGridPath(cameraId, index), { scroll: false });
    },
    [applyIndex, cameraId, router],
  );

  const openViewer = useCallback(() => {
    setViewerZoomed(false);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    const index = selectedIndexRef.current;
    setViewerOpen(false);
    setViewerZoomed(false);
    if (count <= 0) return;

    const path = isGridView
      ? buildGalleryGridPath(cameraId, index)
      : buildGalleryPhotoPath(index, cameraId);
    router.replace(path, { scroll: false });
  }, [cameraId, count, isGridView, router]);

  const viewerPrevious = useCallback(() => {
    setViewerZoomed(false);
    selectIndex(selectedIndex - 1, { scrollThumb: true, syncUrl: false });
  }, [selectIndex, selectedIndex]);

  const viewerNext = useCallback(() => {
    setViewerZoomed(false);
    selectIndex(selectedIndex + 1, { scrollThumb: true, syncUrl: false });
  }, [selectIndex, selectedIndex]);

  if (count === 0) {
    return (
      <div
        className={`flex h-dvh flex-col overflow-hidden ${galleryWallClass}`}
      >
        <GalleryChromeHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <p className="font-mono text-[11px] tracking-[0.22em] text-white/45 uppercase">
            Photos coming soon
          </p>
        </div>
      </div>
    );
  }

  if (!work) {
    return null;
  }

  const photoNumber = String(selectedIndex + 1).padStart(2, "0");
  const photoTotal = String(count).padStart(2, "0");
  const capturedLabel = formatGalleryCapturedAt(work.capturedAt);

  if (isGridView) {
    return (
      <>
        <div className={`flex h-dvh flex-col overflow-hidden ${galleryWallClass}`}>
          <GalleryChromeHeader
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <GalleryAllGrid
              works={works}
              cameraId={cameraId}
              onSelect={openFromGrid}
            />
          </div>

          <footer
            className={`shrink-0 border-t px-5 py-3 text-center md:px-10 ${galleryBorderClass}`}
          >
            <p className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase tabular-nums">
              {String(count).padStart(2, "0")} photographs
            </p>
          </footer>
        </div>

        {viewerOpen ? (
          <GalleryPhotoViewer
            viewer={{
              work,
              cameraId,
              imageClass: galleryImageClass(camera, work),
              frameClass: camera.frameClass,
              frameAspectClass: camera.frameAspectClass,
              zoomed: viewerZoomed,
            }}
            index={selectedIndex}
            count={count}
            onClose={closeViewer}
            onPrevious={viewerPrevious}
            onNext={viewerNext}
            onToggleZoom={() => setViewerZoomed((current) => !current)}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className={`flex h-dvh flex-col overflow-hidden ${galleryWallClass}`}>
      <GalleryChromeHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden md:flex-row">
        {/* Desktop: full-height film strip */}
        <aside
          className={`hidden min-h-0 w-[7.75rem] shrink-0 flex-col overflow-hidden border-r bg-white/[0.03] pl-3 md:flex md:pl-4 lg:w-[9rem] lg:pl-5 ${galleryBorderClass} ${galleryWallClass}`}
          aria-label="Photograph thumbnails"
        >
          <div
            ref={stripRef}
            className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto overscroll-y-contain [scrollbar-color:rgba(20,20,20,0.16)_transparent] [scrollbar-width:thin]"
          >
            {works.map((entry, index) => (
              <ThumbnailButton
                key={entry.id}
                work={entry}
                cameraId={cameraId}
                active={index === selectedIndex}
                onSelect={() => selectIndex(index, { scrollThumb: false })}
                buttonRef={(node) => {
                  if (node) thumbRefs.current.set(entry.id, node);
                  else thumbRefs.current.delete(entry.id);
                }}
              />
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
            <p
              className="pointer-events-none absolute top-4 right-5 z-20 font-serif text-5xl leading-none text-white/15 tabular-nums md:top-6 md:right-10 md:text-7xl"
              aria-hidden
            >
              {photoNumber}
            </p>
            <p
              className="pointer-events-none absolute right-5 bottom-6 z-20 font-serif text-5xl leading-none text-white/15 tabular-nums md:right-10 md:bottom-8 md:text-7xl"
              aria-hidden
            >
              {photoTotal}
            </p>
            <p className="sr-only">
              Photograph {selectedIndex + 1} of {count}
            </p>

            <div className="pointer-events-none absolute inset-y-0 left-1 z-10 flex items-center md:hidden">
              <NavArrow
                symbol="←"
                label="Previous photograph"
                onClick={() =>
                  selectIndexWithTransition(selectedIndex - 1, {
                    scrollThumb: true,
                  })
                }
                disabled={selectedIndex <= 0}
                className="pointer-events-auto"
              />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-1 z-10 flex items-center md:hidden">
              <NavArrow
                symbol="→"
                label="Next photograph"
                onClick={() =>
                  selectIndexWithTransition(selectedIndex + 1, {
                    scrollThumb: true,
                  })
                }
                disabled={selectedIndex >= count - 1}
                className="pointer-events-auto"
              />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-3 z-10 hidden flex-col items-center justify-center gap-1 md:flex">
              <NavArrow
                symbol="↑"
                label="Previous photograph"
                onClick={() =>
                  selectIndexWithTransition(selectedIndex - 1, {
                    scrollThumb: true,
                  })
                }
                disabled={selectedIndex <= 0}
                className="pointer-events-auto"
              />
              <NavArrow
                symbol="↓"
                label="Next photograph"
                onClick={() =>
                  selectIndexWithTransition(selectedIndex + 1, {
                    scrollThumb: true,
                  })
                }
                disabled={selectedIndex >= count - 1}
                className="pointer-events-auto"
              />
            </div>

            <div
              className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-3 md:px-6 md:py-4 ${galleryWallClass}`}
              aria-live="polite"
              aria-label={work.title}
            >
              {work.hasImage ? (
                <FullscreenButton onClick={openViewer} />
              ) : null}
              <MainImage
                ref={transitionRef}
                work={work}
                cameraId={cameraId}
                imageClass={galleryImageClass(camera, work)}
                frameClass={camera.frameClass}
              />
            </div>
          </div>

          {viewerOpen ? (
            <GalleryPhotoViewer
              viewer={{
                work,
                cameraId,
                imageClass: galleryImageClass(camera, work),
                frameClass: camera.frameClass,
                frameAspectClass: camera.frameAspectClass,
                zoomed: viewerZoomed,
              }}
              index={selectedIndex}
              count={count}
              onClose={closeViewer}
              onPrevious={viewerPrevious}
              onNext={viewerNext}
              onToggleZoom={() => setViewerZoomed((current) => !current)}
            />
          ) : null}

          {/* Mobile: horizontal strip */}
          <div
            className={`shrink-0 border-t md:hidden ${galleryBorderClass} ${galleryWallClass}`}
            aria-label="Photograph thumbnails"
          >
            <div className="flex gap-px overflow-x-auto overscroll-x-contain px-3 py-2">
              {works.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectIndex(index, { scrollThumb: false })}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden bg-[#1a1a1a] ${
                    index === selectedIndex
                      ? "opacity-100 ring-1 ring-white/30"
                      : "opacity-45"
                  }`}
                >
                  {entry.hasImage ? (
                    <Image
                      src={entry.src}
                      alt=""
                      fill
                      unoptimized={shouldUnoptimizeGalleryImage(
                        entry.src,
                        entry.isMock,
                      )}
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <GalleryPlaceholder work={entry} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <footer
            className={`relative z-30 shrink-0 border-t px-5 py-4 md:px-10 ${galleryBorderClass} ${galleryWallClass}`}
          >
            <div className="grid grid-cols-1 gap-2 text-center md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-6">
              <div className="hidden md:block" aria-hidden />
              <div className="flex flex-col items-center gap-1">
                {capturedLabel ? (
                  <p className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">
                    <time dateTime={work.capturedAt}>{capturedLabel}</time>
                  </p>
                ) : null}
              </div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-white/45 uppercase md:justify-self-end md:text-right">
                {formatGalleryLocationYear(work.location, work.year)}
              </p>
            </div>
            {work.caption ? (
              <p className="mt-3 max-w-2xl text-center text-sm leading-relaxed text-white/65 md:mx-auto md:text-center">
                {work.caption}
              </p>
            ) : null}
          </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
