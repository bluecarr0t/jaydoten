import { isGalleryBlobStorage } from "@/lib/gallery-blob";

/** Gallery + admin in local dev, or on Vercel when Blob storage is configured. */
export function isGalleryRouteEnabled(): boolean {
  return process.env.NODE_ENV === "development" || isGalleryBlobStorage();
}

/** @deprecated Use `isGalleryRouteEnabled`. */
export function isDevOnlyRoute(): boolean {
  return isGalleryRouteEnabled();
}
