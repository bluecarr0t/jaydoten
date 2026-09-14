import { head, list, put } from "@vercel/blob";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { galleryLocalDir } from "@/lib/gallery-cameras";
import type { GalleryWork } from "@/lib/gallery-content";
import { defaultGalleryWorks } from "@/lib/gallery-defaults";
import { normalizeGalleryWork } from "@/lib/gallery-store";

const WORKS_PATHNAME = "gallery/meta/gallery-works.json";

type GalleryWorksFile = {
  works: GalleryWork[];
};

export function isGalleryBlobStorage(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim(),
  );
}

export function galleryImagePathname(
  cameraId: GalleryCameraId,
  filename: string,
): string {
  return `gallery/${galleryLocalDir(cameraId)}/${filename}`;
}

export async function listGalleryImageUrls(
  cameraId: GalleryCameraId,
): Promise<Map<string, string>> {
  const prefix = `gallery/${galleryLocalDir(cameraId)}/`;
  const urls = new Map<string, string>();
  let cursor: string | undefined;

  do {
    const page = await list({ prefix, cursor });
    for (const blob of page.blobs) {
      const name = blob.pathname.slice(prefix.length);
      if (name && !name.includes("/")) {
        urls.set(name, blob.url);
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return urls;
}

export async function galleryImageExists(
  cameraId: GalleryCameraId,
  filename: string,
): Promise<boolean> {
  try {
    await head(galleryImagePathname(cameraId, filename));
    return true;
  } catch {
    return false;
  }
}

export async function getGalleryImageUrl(
  cameraId: GalleryCameraId,
  filename: string,
): Promise<string | null> {
  try {
    const result = await head(galleryImagePathname(cameraId, filename));
    return result.url;
  } catch {
    return null;
  }
}

export async function putGalleryImage(
  cameraId: GalleryCameraId,
  filename: string,
  data: Buffer,
  contentType: string,
): Promise<{ url: string; pathname: string }> {
  const pathname = galleryImagePathname(cameraId, filename);
  const blob = await put(pathname, data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function getGalleryWorksFromBlob(): Promise<GalleryWork[]> {
  try {
    const meta = await head(WORKS_PATHNAME);
    const response = await fetch(meta.url, { cache: "no-store" });
    if (!response.ok) {
      return defaultGalleryWorks;
    }
    const parsed = (await response.json()) as GalleryWorksFile;
    const works = parsed.works?.length ? parsed.works : defaultGalleryWorks;
    return works.map(normalizeGalleryWork);
  } catch {
    return defaultGalleryWorks;
  }
}

export async function saveGalleryWorksToBlob(
  works: GalleryWork[],
): Promise<GalleryWork[]> {
  const payload: GalleryWorksFile = { works };
  await put(WORKS_PATHNAME, JSON.stringify(payload, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return works;
}
