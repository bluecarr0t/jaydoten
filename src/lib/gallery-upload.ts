import { existsSync, readdirSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { galleryLocalDir } from "@/lib/gallery-cameras";
import type { GalleryWork } from "@/lib/gallery-content";
import {
  isGalleryBlobStorage,
  putGalleryImage,
} from "@/lib/gallery-blob";
import { extractGalleryExif } from "@/lib/gallery-exif";
import {
  appendGalleryWork,
  createGalleryWorkId,
  getGalleryWorkById,
} from "@/lib/gallery-store";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export type SavedWorkImage = {
  filename: string;
  buffer: Buffer;
  /** Local path when using filesystem storage. */
  path?: string;
  /** Public Blob URL when using Vercel Blob. */
  url?: string;
};

export function galleryUploadDir(cameraId: GalleryCameraId): string {
  return path.join(process.cwd(), "public", "gallery", galleryLocalDir(cameraId));
}

function extensionForMime(type: string): string {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  return ".jpg";
}

function titleFromFilename(filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return base.replace(/[-_]+/g, " ").trim() || "Untitled";
}

export async function saveWorkImage(
  cameraId: GalleryCameraId,
  workId: string,
  file: File,
): Promise<SavedWorkImage> {
  const work = await getGalleryWorkById(workId);
  if (!work) {
    throw new Error(`Unknown work id: ${workId}`);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isGalleryBlobStorage()) {
    const { url } = await putGalleryImage(
      cameraId,
      work.filename,
      buffer,
      file.type,
    );
    return { filename: work.filename, buffer, url };
  }

  const dir = galleryUploadDir(cameraId);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const dest = path.join(dir, work.filename);
  await writeFile(dest, buffer);

  return { filename: work.filename, buffer, path: dest };
}

export async function createWorkFromUpload(
  cameraId: GalleryCameraId,
  file: File,
): Promise<{ work: GalleryWork; saved: SavedWorkImage }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const exif = await extractGalleryExif(buffer);
  const id = createGalleryWorkId();
  const filename = `${id}${extensionForMime(file.type)}`;

  const work: GalleryWork = {
    id,
    cameraId,
    filename,
    title: titleFromFilename(file.name),
    caption: "",
    location: exif.locationHint ?? "venice-beach",
    year: exif.year ?? new Date().getFullYear(),
    aspect: exif.aspect ?? "landscape",
    tags: [],
    ...(exif.capturedAt ? { capturedAt: exif.capturedAt } : {}),
  };

  await appendGalleryWork(work);

  let saved: SavedWorkImage;
  if (isGalleryBlobStorage()) {
    const { url } = await putGalleryImage(cameraId, filename, buffer, file.type);
    saved = { filename, buffer, url };
  } else {
    const dir = galleryUploadDir(cameraId);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    const dest = path.join(dir, filename);
    await writeFile(dest, buffer);
    saved = { filename, buffer, path: dest };
  }

  return { work, saved };
}

export function listUploadedFilenames(cameraId: GalleryCameraId): string[] {
  const dir = galleryUploadDir(cameraId);
  if (!existsSync(dir)) return [];

  return readdirSync(dir).filter((name) => !name.startsWith("."));
}
