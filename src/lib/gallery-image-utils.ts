import type { GalleryCamera, GalleryCameraId } from "@/lib/gallery-cameras";
import { LEICA_3_2_HEIGHT, LEICA_3_2_WIDTH } from "@/lib/gallery-cameras";
import type { GalleryWork } from "@/lib/gallery-content";
import type { ResolvedGalleryWork } from "@/lib/gallery-types";

export function galleryDisplayDimensions(
  cameraId: GalleryCameraId,
  work: GalleryWork,
): { width: number; height: number } {
  if (cameraId === "leica-xe") {
    return { width: LEICA_3_2_WIDTH, height: LEICA_3_2_HEIGHT };
  }
  if (work.aspect === "portrait") return { width: 1000, height: 1400 };
  if (work.aspect === "square") return { width: 1200, height: 1200 };
  return { width: 1400, height: 933 };
}

/** CSS classes for gallery images — stylistic filters only on Unsplash mocks. */
export function galleryImageClass(
  camera: GalleryCamera,
  work: ResolvedGalleryWork,
): string {
  if (work.isMock && camera.mockImageClass) {
    return camera.mockImageClass;
  }
  return camera.imageClass;
}

/** Fullscreen viewer — fit entire image, never crop. */
export function galleryFullscreenImageClass(
  camera: GalleryCamera,
  work: ResolvedGalleryWork,
): string {
  const graded = galleryImageClass(camera, work).replace(
    "object-cover",
    "object-contain",
  );
  return graded.includes("object-contain")
    ? graded
    : `${graded} object-contain`;
}

export const galleryFullscreenImageBoundsClass =
  "h-auto max-h-full w-auto max-w-full";

/**
 * Skip Next.js image optimization to preserve original color profiles and bytes.
 * Re-encoding JPEGs can shift colors away from the camera export.
 */
export function shouldUnoptimizeGalleryImage(
  src: string,
  isMock: boolean,
): boolean {
  if (isMock) return true;
  if (src.startsWith("/gallery/")) return true;
  if (src.includes("blob.vercel-storage.com")) return true;
  return false;
}
