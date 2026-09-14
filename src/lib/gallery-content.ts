import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { galleryLocalDir } from "@/lib/gallery-cameras";

export type GalleryLocation = "santa-monica" | "venice-beach";

export type GalleryAspect = "portrait" | "landscape" | "square";

export type GalleryWork = {
  id: string;
  location: GalleryLocation;
  title: string;
  caption: string;
  /** Basename stored in Blob (`gallery/<camera>/`) or local `public/gallery/<camera>/`. */
  filename: string;
  aspect: GalleryAspect;
  year: number;
  /** Searchable tags / categories (AI-generated or manual). */
  tags: string[];
  /** ISO 8601 capture time from EXIF or AI estimate. */
  capturedAt?: string;
  /** When set, work belongs to this camera roll only. */
  cameraId?: GalleryCameraId;
};

export const GALLERY_SERIES = {
  title: "Pacific Walk",
  subtitle: "Street notes along the Santa Monica–Venice corridor",
  places: ["Santa Monica", "Venice Beach"] as const,
} as const;

export const locationLabels: Record<GalleryLocation, string> = {
  "santa-monica": "Santa Monica, California",
  "venice-beach": "Venice Beach, California",
};

export function formatGalleryLocationYear(
  location: GalleryLocation,
  year: number,
): string {
  return `${locationLabels[location]} ${year}`;
}

export function galleryImageSrc(
  cameraId: GalleryCameraId,
  filename: string,
): string {
  return `/gallery/${galleryLocalDir(cameraId)}/${filename}`;
}

/** Human-readable capture date/time for gallery footer (from EXIF or AI metadata). */
export function formatGalleryCapturedAt(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${datePart} · ${timePart}`;
}
