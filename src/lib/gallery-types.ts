import type { GalleryCameraId } from "@/lib/gallery-cameras";
import type { GalleryWork } from "@/lib/gallery-content";

export type ResolvedGalleryWork = GalleryWork & {
  cameraId: GalleryCameraId;
  src: string;
  hasImage: boolean;
  isMock: boolean;
};
