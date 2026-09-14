import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import type { GalleryWork } from "@/lib/gallery-content";
import { defaultGalleryWorks } from "@/lib/gallery-defaults";
import {
  getGalleryWorksFromBlob,
  isGalleryBlobStorage,
  saveGalleryWorksToBlob,
} from "@/lib/gallery-blob";

const DATA_DIR = path.join(process.cwd(), "data");
const WORKS_PATH = path.join(DATA_DIR, "gallery-works.json");

type GalleryWorksFile = {
  works: GalleryWork[];
};

export function normalizeGalleryWork(work: GalleryWork): GalleryWork {
  return {
    ...work,
    tags: work.tags ?? [],
  };
}

function normalizeGalleryWorks(works: GalleryWork[]): GalleryWork[] {
  return works.map(normalizeGalleryWork);
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getGalleryWorksLocal(): GalleryWork[] {
  ensureDataDir();
  if (!existsSync(WORKS_PATH)) {
    const seed: GalleryWorksFile = { works: defaultGalleryWorks };
    writeFileSync(WORKS_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed.works;
  }

  const parsed = JSON.parse(readFileSync(WORKS_PATH, "utf8")) as GalleryWorksFile;
  return normalizeGalleryWorks(parsed.works);
}

function saveGalleryWorksLocal(works: GalleryWork[]): GalleryWork[] {
  ensureDataDir();
  const normalized = normalizeGalleryWorks(works);
  const payload: GalleryWorksFile = { works: normalized };
  writeFileSync(WORKS_PATH, JSON.stringify(payload, null, 2), "utf8");
  return normalized;
}

export async function getGalleryWorks(): Promise<GalleryWork[]> {
  const works = isGalleryBlobStorage()
    ? await getGalleryWorksFromBlob()
    : getGalleryWorksLocal();
  return normalizeGalleryWorks(works);
}

export async function saveGalleryWorks(
  works: GalleryWork[],
): Promise<GalleryWork[]> {
  const normalized = normalizeGalleryWorks(works);
  if (isGalleryBlobStorage()) {
    return saveGalleryWorksToBlob(normalized);
  }
  return saveGalleryWorksLocal(normalized);
}

export function worksForCamera(
  works: GalleryWork[],
  cameraId: GalleryCameraId,
): GalleryWork[] {
  return works.filter(
    (work) => !work.cameraId || work.cameraId === cameraId,
  );
}

export function createGalleryWorkId(): string {
  return `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function appendGalleryWork(work: GalleryWork): Promise<GalleryWork[]> {
  const works = await getGalleryWorks();
  return saveGalleryWorks([...works, normalizeGalleryWork(work)]);
}

export async function getGalleryWorkById(
  id: string,
): Promise<GalleryWork | undefined> {
  const works = await getGalleryWorks();
  return works.find((work) => work.id === id);
}
