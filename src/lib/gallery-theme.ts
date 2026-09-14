/** Black wall presentation for /gallery */
export const galleryWallClass = "bg-black text-white";

/** Thumbnail strip / scroll track */
export const galleryGapTrackClass = "bg-neutral-950";

/** White mat padding — equal on all sides (border-4 + padding). */
export const galleryFramePaddingClass = "p-4 md:p-5";

/** White border mat around the main photograph */
export const galleryFrameClass = `overflow-hidden border-4 border-white bg-white ${galleryFramePaddingClass}`;

/**
 * Total frame chrome per axis (border + padding, both sides).
 * Keep in sync with galleryFramePaddingClass + border-4.
 */
export const GALLERY_FRAME_CHROME_BASE_PX = 40; // 2 × (4px border + 16px p-4)
export const GALLERY_FRAME_CHROME_MD_PX = 48; // 2 × (4px border + 20px p-5)

/** Image bounds inside the mat — single / main gallery view. */
export const galleryMainImageMaxHeightClass =
  "max-h-[calc(min(58dvh,calc(100dvh-12.5rem))-2.5rem)] md:max-h-[calc(min(68dvh,calc(100dvh-13.5rem))-3rem)]";

export const galleryMainImageMaxWidthClass =
  "max-w-[calc(min(96vw,1240px)-2.5rem)] md:max-w-[calc(min(96vw,1240px)-3rem)]";

export const galleryMatteClass = `${galleryWallClass} p-3 md:p-5`;

/** Subtle dividers on dark background */
export const galleryBorderClass = "border-white/10";

/** Full-screen slideshow overlay. */
export const galleryLightboxClass =
  "min-h-dvh w-full bg-black text-white";

export const galleryLightboxMatteClass = "bg-black";

export function galleryFrameChromePx(): number {
  if (typeof window === "undefined") {
    return GALLERY_FRAME_CHROME_MD_PX;
  }
  return window.matchMedia("(min-width: 768px)").matches
    ? GALLERY_FRAME_CHROME_MD_PX
    : GALLERY_FRAME_CHROME_BASE_PX;
}
