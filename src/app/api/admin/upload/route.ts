import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  applyTagsToWork,
  isGalleryAiTaggingAvailable,
  tagGalleryImage,
} from "@/lib/gallery-ai-tagging";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { extractGalleryExif } from "@/lib/gallery-exif";
import { getGalleryWorks } from "@/lib/gallery-store";
import { createWorkFromUpload, saveWorkImage } from "@/lib/gallery-upload";
import { isGalleryRouteEnabled } from "@/lib/is-dev-only";

export const runtime = "nodejs";

const cameraIds = new Set<GalleryCameraId>(["leica-xe", "polaroid-sx70"]);

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

type UploadPayload = {
  workId: string;
  filename: string;
  path?: string;
  url?: string;
  buffer: Buffer;
};

async function maybeAutoTag(
  cameraId: GalleryCameraId,
  upload: UploadPayload,
  autoTag: boolean,
) {
  if (!autoTag || !isGalleryAiTaggingAvailable()) {
    return { tagged: false as const };
  }

  const works = await getGalleryWorks();
  const work = works.find((entry) => entry.id === upload.workId);
  if (!work) {
    return { tagged: false as const };
  }

  const exif = await extractGalleryExif(upload.buffer);
  const tags = await tagGalleryImage({
    imageBytes: upload.buffer,
    cameraId,
    filename: upload.filename,
    slotId: work.id,
    exif,
  });

  await applyTagsToWork(upload.workId, tags, exif);

  return {
    tagged: true as const,
    title: tags.title,
    caption: tags.caption,
    location: tags.location,
    year: tags.year,
    tags: tags.tags,
    capturedAt: exif.capturedAt ?? tags.capturedAt,
  };
}

function toResponseUpload(upload: UploadPayload) {
  const { buffer: _buffer, ...rest } = upload;
  return rest;
}

export async function POST(request: Request) {
  if (!isGalleryRouteEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const cameraId = form.get("cameraId") as GalleryCameraId | null;
  const workId = form.get("workId") as string | null;
  const mode = (form.get("mode") as string | null) ?? "create";
  const autoTag = form.get("autoTag") !== "false";

  if (!cameraId || !cameraIds.has(cameraId)) {
    return NextResponse.json({ error: "Invalid cameraId" }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const works = await getGalleryWorks();
  const tagErrors: { workId: string; message: string }[] = [];

  if (workId) {
    const file = files[0];
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await saveWorkImage(cameraId, workId, file);
    const upload: UploadPayload = {
      workId,
      filename: result.filename,
      path: result.path,
      url: result.url,
      buffer: result.buffer,
    };

    try {
      const ai = await maybeAutoTag(cameraId, upload, autoTag);
      return NextResponse.json({
        uploaded: [{ ...toResponseUpload(upload), ai }],
        tagErrors,
      });
    } catch (error) {
      tagErrors.push({
        workId,
        message: error instanceof Error ? error.message : "Auto-tag failed",
      });
      return NextResponse.json({
        uploaded: [toResponseUpload(upload)],
        tagErrors,
      });
    }
  }

  if (mode === "create") {
    const uploaded: Array<
      ReturnType<typeof toResponseUpload> & {
        ai?: Awaited<ReturnType<typeof maybeAutoTag>>;
      }
    > = [];

    for (const file of files) {
      const { work, saved } = await createWorkFromUpload(cameraId, file);
      const upload: UploadPayload = {
        workId: work.id,
        filename: saved.filename,
        path: saved.path,
        url: saved.url,
        buffer: saved.buffer,
      };

      try {
        const ai = await maybeAutoTag(cameraId, upload, autoTag);
        uploaded.push({ ...toResponseUpload(upload), ai });
      } catch (error) {
        uploaded.push(toResponseUpload(upload));
        tagErrors.push({
          workId: work.id,
          message: error instanceof Error ? error.message : "Auto-tag failed",
        });
      }
    }

    return NextResponse.json({ uploaded, tagErrors });
  }

  const worksByFilename = new Map(
    works.map((work) => [normalizeName(work.filename), work]),
  );
  const unassigned = [...works];
  const uploaded: Array<
    ReturnType<typeof toResponseUpload> & {
      ai?: Awaited<ReturnType<typeof maybeAutoTag>>;
    }
  > = [];
  const skipped: string[] = [];

  for (const file of files) {
    const match = worksByFilename.get(normalizeName(file.name));
    let target = match;

    if (!target && mode === "sequential" && unassigned.length > 0) {
      target = unassigned.shift()!;
    }

    if (!target) {
      skipped.push(file.name);
      continue;
    }

    const result = await saveWorkImage(cameraId, target.id, file);
    const upload: UploadPayload = {
      workId: target.id,
      filename: result.filename,
      path: result.path,
      url: result.url,
      buffer: result.buffer,
    };

    try {
      const ai = await maybeAutoTag(cameraId, upload, autoTag);
      uploaded.push({ ...toResponseUpload(upload), ai });
    } catch (error) {
      uploaded.push(toResponseUpload(upload));
      tagErrors.push({
        workId: target.id,
        message: error instanceof Error ? error.message : "Auto-tag failed",
      });
    }

    if (match) {
      const index = unassigned.findIndex((work) => work.id === match!.id);
      if (index >= 0) unassigned.splice(index, 1);
    }
  }

  return NextResponse.json({ uploaded, skipped, tagErrors });
}
