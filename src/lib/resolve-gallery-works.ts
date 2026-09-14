import { existsSync } from "node:fs";
import path from "node:path";
import {
  cameraMockPhotoIds,
  type GalleryCameraId,
  galleryLocalDir,
} from "@/lib/gallery-cameras";
import {
  galleryDisplayDimensions,
} from "@/lib/gallery-image-utils";
import { listGalleryImageUrls, isGalleryBlobStorage } from "@/lib/gallery-blob";
import { galleryImageSrc, type GalleryWork } from "@/lib/gallery-content";
import { getGalleryWorks, worksForCamera } from "@/lib/gallery-store";
import type { ResolvedGalleryWork } from "@/lib/gallery-types";
import { unsplashImageUrl } from "@/lib/unsplash";

function localImageExists(
  cameraId: GalleryCameraId,
  filename: string,
): boolean {
  const localFile = path.join(
    process.cwd(),
    "public",
    "gallery",
    galleryLocalDir(cameraId),
    filename,
  );
  return existsSync(localFile);
}

async function blobUrlIsReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

function mockWork(
  work: GalleryWork,
  cameraId: GalleryCameraId,
  mocks: Record<string, string>,
): ResolvedGalleryWork {
  const { width, height } = galleryDisplayDimensions(cameraId, work);
  const mockPhotoId = mocks[work.id];
  return {
    ...work,
    cameraId,
    src: unsplashImageUrl(mockPhotoId, { width, height }),
    hasImage: true,
    isMock: true,
  };
}

export async function resolveGalleryWorks(
  cameraId: GalleryCameraId,
): Promise<ResolvedGalleryWork[]> {
  const works = worksForCamera(await getGalleryWorks(), cameraId);
  const mocks = cameraMockPhotoIds[cameraId];
  const blobUrls = isGalleryBlobStorage()
    ? await listGalleryImageUrls(cameraId)
    : null;

  const resolved: ResolvedGalleryWork[] = [];

  for (const work of works) {
    const blobUrl = blobUrls?.get(work.filename);
    if (blobUrl && (await blobUrlIsReachable(blobUrl))) {
      resolved.push({
        ...work,
        cameraId,
        src: blobUrl,
        hasImage: true,
        isMock: false,
      });
      continue;
    }

    if (localImageExists(cameraId, work.filename)) {
      resolved.push({
        ...work,
        cameraId,
        src: galleryImageSrc(cameraId, work.filename),
        hasImage: true,
        isMock: false,
      });
      continue;
    }

    if (cameraId === "polaroid-sx70") {
      continue;
    }

    resolved.push(mockWork(work, cameraId, mocks));
  }

  return resolved;
}

export async function resolveAllGalleryWorks(): Promise<
  Record<GalleryCameraId, ResolvedGalleryWork[]>
> {
  const [leica, polaroid] = await Promise.all([
    resolveGalleryWorks("leica-xe"),
    resolveGalleryWorks("polaroid-sx70"),
  ]);

  return {
    "leica-xe": leica,
    "polaroid-sx70": polaroid,
  };
}
