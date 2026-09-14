"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  galleryFrameChromePx,
  galleryFrameClass,
} from "@/lib/gallery-theme";

type FitSize = { width: number; height: number };

function fitImageInBox(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
): FitSize {
  if (naturalWidth <= 0 || naturalHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { width: Math.max(1, maxWidth), height: Math.max(1, maxHeight) };
  }

  const scale = Math.min(
    maxWidth / naturalWidth,
    maxHeight / naturalHeight,
    1,
  );

  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

type GalleryFullscreenImageProps = {
  boundsRef: RefObject<HTMLDivElement | null>;
  src: string;
  alt: string;
  imageClass: string;
  frameClass?: string;
  unoptimized: boolean;
};

export function GalleryFullscreenImage({
  boundsRef,
  src,
  alt,
  imageClass,
  frameClass,
  unoptimized,
}: GalleryFullscreenImageProps) {
  const naturalRef = useRef<{ width: number; height: number } | null>(null);
  const [fit, setFit] = useState<FitSize | null>(null);

  const recalculate = useCallback(() => {
    const stage = boundsRef.current;
    const natural = naturalRef.current;
    if (!stage || !natural) return;

    const chrome = galleryFrameChromePx();
    const maxWidth = Math.max(1, stage.clientWidth - chrome);
    const maxHeight = Math.max(1, stage.clientHeight - chrome);

    setFit(
      fitImageInBox(
        natural.width,
        natural.height,
        maxWidth,
        maxHeight,
      ),
    );
  }, [boundsRef]);

  useLayoutEffect(() => {
    const stage = boundsRef.current;
    if (!stage) return;

    recalculate();
    const observer = new ResizeObserver(() => recalculate());
    observer.observe(stage);
    return () => observer.disconnect();
  }, [boundsRef, recalculate]);

  useEffect(() => {
    naturalRef.current = null;
    setFit(null);
  }, [src]);

  const imageBox = (
    <div
      className="relative shrink-0"
      style={
        fit
          ? { width: fit.width, height: fit.height }
          : { width: "min(64vw, 400px)", height: "min(38dvh, 300px)" }
      }
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={unoptimized}
        className={imageClass}
        sizes="100vw"
        priority
        onLoad={(event) => {
          const img = event.currentTarget;
          naturalRef.current = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          recalculate();
        }}
      />
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <div className={frameClass ?? galleryFrameClass}>{imageBox}</div>
    </div>
  );
}
