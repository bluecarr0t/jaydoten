"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GalleryFullscreenImage } from "@/components/gallery/gallery-fullscreen-image";
import {
  formatGalleryCapturedAt,
  formatGalleryLocationYear,
} from "@/lib/gallery-content";
import {
  galleryFullscreenImageClass,
  shouldUnoptimizeGalleryImage,
} from "@/lib/gallery-image-utils";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { galleryCameras } from "@/lib/gallery-cameras";
import type { ResolvedGalleryWork } from "@/lib/gallery-types";
import {
  galleryFrameClass,
  galleryLightboxClass,
  galleryLightboxMatteClass,
} from "@/lib/gallery-theme";
import { GalleryPlaceholder } from "./gallery-placeholder";

export type PhotoViewerState = {
  work: ResolvedGalleryWork;
  cameraId: GalleryCameraId;
  imageClass: string;
  frameClass?: string;
  frameAspectClass?: string;
  zoomed: boolean;
};

type GalleryPhotoViewerProps = {
  viewer: PhotoViewerState;
  index: number;
  count: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleZoom: () => void;
};

function ViewerNavButton({
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
      className={`flex size-11 shrink-0 items-center justify-center font-mono text-xl text-white/40 transition hover:text-white/85 disabled:pointer-events-none disabled:opacity-20 md:size-12 md:text-2xl ${className ?? ""}`}
    >
      {symbol}
    </button>
  );
}

export function GalleryPhotoViewer({
  viewer,
  index,
  count,
  onClose,
  onPrevious,
  onNext,
  onToggleZoom,
}: GalleryPhotoViewerProps) {
  const { work, cameraId, frameClass, zoomed } = viewer;
  const camera =
    galleryCameras.find((entry) => entry.id === cameraId) ?? galleryCameras[0];
  const fullscreenImageClass = galleryFullscreenImageClass(camera, work);
  const capturedLabel = formatGalleryCapturedAt(work.capturedAt);
  const canGoPrevious = index > 0;
  const canGoNext = index < count - 1;
  const photoNumber = String(index + 1).padStart(2, "0");
  const photoTotal = String(count).padStart(2, "0");
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (zoomed) return;

      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown" ||
        event.key === " " ||
        event.key === "j"
      ) {
        event.preventDefault();
        if (canGoNext) onNext();
        return;
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp" ||
        event.key === "k"
      ) {
        event.preventDefault();
        if (canGoPrevious) onPrevious();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [canGoNext, canGoPrevious, onClose, onNext, onPrevious, zoomed]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] flex flex-col ${galleryLightboxClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <div className="flex shrink-0 items-center justify-between bg-black px-5 py-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase tabular-nums">
          {photoNumber} / {photoTotal}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase transition hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black px-3 py-2 md:px-6">
        <button
          type="button"
          aria-label="Previous photograph"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="absolute inset-y-0 left-0 z-10 w-[18%] max-w-40 cursor-w-resize bg-transparent disabled:cursor-default"
        />
        <button
          type="button"
          aria-label="Next photograph"
          disabled={!canGoNext}
          onClick={onNext}
          className="absolute inset-y-0 right-0 z-10 w-[18%] max-w-40 cursor-e-resize bg-transparent disabled:cursor-default"
        />

        <ViewerNavButton
          symbol="←"
          label="Previous photograph"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="absolute top-1/2 left-2 z-20 hidden -translate-y-1/2 md:flex"
        />
        <ViewerNavButton
          symbol="→"
          label="Next photograph"
          onClick={onNext}
          disabled={!canGoNext}
          className="absolute top-1/2 right-2 z-20 hidden -translate-y-1/2 md:flex"
        />

        <div
          ref={stageRef}
          className="relative z-0 h-full min-h-0 w-full overflow-hidden px-2 md:px-4"
        >
          <button
            type="button"
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out ${zoomed ? "scale-[1.75] cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={onToggleZoom}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
          >
            <div
              className={`${galleryLightboxMatteClass} flex h-full min-h-0 w-full items-center justify-center`}
            >
              {work.hasImage ? (
                <GalleryFullscreenImage
                  key={work.id}
                  boundsRef={stageRef}
                  src={work.src}
                  alt={work.title}
                  imageClass={fullscreenImageClass}
                  frameClass={frameClass}
                  unoptimized={shouldUnoptimizeGalleryImage(
                    work.src,
                    work.isMock,
                  )}
                />
              ) : (
                <div
                  className={`flex h-[min(50dvh,400px)] w-[min(80vw,600px)] items-center justify-center ${frameClass ?? galleryFrameClass}`}
                >
                  <GalleryPlaceholder work={work} />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      <footer className="shrink-0 bg-black px-6 pb-5 text-center">
        {capturedLabel ? (
          <p className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">
            <time dateTime={work.capturedAt}>{capturedLabel}</time>
          </p>
        ) : null}
        {work.caption ? (
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {work.caption}
          </p>
        ) : null}
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
          {formatGalleryLocationYear(work.location, work.year)}
        </p>
      </footer>
    </div>,
    document.body,
  );
}
