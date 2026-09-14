import type { GalleryCameraId } from "@/lib/gallery-cameras";

const cameraIds = new Set<GalleryCameraId>(["leica-xe", "polaroid-sx70"]);

export type GalleryViewMode = "single" | "grid";

/** 1-based photo number → zero-padded slug (`01`, `12`). */
export function formatPhotoSlug(photoNumber: number): string {
  return String(photoNumber).padStart(2, "0");
}

/** Parse slug to 0-based index; clamps to `[0, count - 1]`. */
export function photoIndexFromSlug(
  slug: string | undefined,
  count: number,
): number {
  if (!slug || count <= 0) return 0;

  const parsed = Number.parseInt(slug, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 0;

  return Math.min(count - 1, parsed - 1);
}

export function parseGalleryCameraId(
  value: string | null | undefined,
): GalleryCameraId {
  if (value && cameraIds.has(value as GalleryCameraId)) {
    return value as GalleryCameraId;
  }
  return "leica-xe";
}

export function parseGalleryViewMode(
  value: string | null | undefined,
): GalleryViewMode {
  return value === "single" ? "single" : "grid";
}

function gallerySearchParams(
  cameraId: GalleryCameraId,
  viewMode: GalleryViewMode,
): string {
  const params = new URLSearchParams();
  if (cameraId !== "leica-xe") {
    params.set("camera", cameraId);
  }
  if (viewMode === "single") {
    params.set("view", "single");
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function buildGalleryPhotoPath(
  photoIndex: number,
  cameraId: GalleryCameraId,
): string {
  const slug = formatPhotoSlug(photoIndex + 1);
  return `/gallery/${slug}${gallerySearchParams(cameraId, "single")}`;
}

export function buildGalleryGridPath(
  cameraId: GalleryCameraId,
  photoIndex = 0,
): string {
  const slug = formatPhotoSlug(photoIndex + 1);
  return `/gallery/${slug}${gallerySearchParams(cameraId, "grid")}`;
}
