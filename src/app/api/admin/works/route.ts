import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  galleryImageExists,
  getGalleryImageUrl,
  isGalleryBlobStorage,
} from "@/lib/gallery-blob";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { galleryLocalDir, galleryCameras } from "@/lib/gallery-cameras";
import type { GalleryWork } from "@/lib/gallery-content";
import { galleryImageSrc } from "@/lib/gallery-content";
import {
  getGalleryWorks,
  saveGalleryWorks,
  worksForCamera,
} from "@/lib/gallery-store";
import { isGalleryRouteEnabled } from "@/lib/is-dev-only";

export const runtime = "nodejs";

async function hasGalleryImage(
  cameraId: GalleryCameraId,
  filename: string,
): Promise<boolean> {
  if (isGalleryBlobStorage()) {
    return galleryImageExists(cameraId, filename);
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "gallery",
    galleryLocalDir(cameraId),
    filename,
  );
  return existsSync(filePath);
}

async function previewUrl(
  cameraId: GalleryCameraId,
  filename: string,
): Promise<string | null> {
  const stamp = `t=${Date.now()}`;

  if (isGalleryBlobStorage()) {
    const url = await getGalleryImageUrl(cameraId, filename);
    return url ? `${url}?${stamp}` : null;
  }

  if (!(await hasGalleryImage(cameraId, filename))) {
    return null;
  }

  return `${galleryImageSrc(cameraId, filename)}?${stamp}`;
}

export async function GET() {
  if (!isGalleryRouteEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const works = await getGalleryWorks();
  const cameras = await Promise.all(
    galleryCameras.map(async (camera) => ({
      id: camera.id,
      label: camera.label,
      year: camera.year,
      works: await Promise.all(
        worksForCamera(works, camera.id).map(async (work) => {
          const hasFile = await hasGalleryImage(camera.id, work.filename);
          return {
            ...work,
            hasFile,
            previewUrl: hasFile
              ? await previewUrl(camera.id, work.filename)
              : null,
          };
        }),
      ),
    })),
  );

  return NextResponse.json({
    works,
    cameras,
    storage: isGalleryBlobStorage() ? "blob" : "local",
  });
}

export async function PUT(request: Request) {
  if (!isGalleryRouteEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { works?: GalleryWork[] };
  if (!body.works?.length) {
    return NextResponse.json({ error: "Missing works array" }, { status: 400 });
  }

  const saved = await saveGalleryWorks(body.works);
  return NextResponse.json({ works: saved });
}
