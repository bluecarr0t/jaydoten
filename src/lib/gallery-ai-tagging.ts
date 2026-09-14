import { readFile } from "node:fs/promises";
import path from "node:path";
import { generateObject } from "ai";
import { z } from "zod";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { galleryCameras } from "@/lib/gallery-cameras";
import type { GalleryLocation, GalleryWork } from "@/lib/gallery-content";
import type { GalleryExifMetadata } from "@/lib/gallery-exif";
import { getGalleryWorks, saveGalleryWorks } from "@/lib/gallery-store";

const tagSchema = z.object({
  title: z
    .string()
    .describe("Short photographic title, 2–6 words, title case, no quotes"),
  caption: z
    .string()
    .describe(
      "One sentence lightbox description: place, mood, and moment. Street photography tone.",
    ),
  location: z
    .enum(["santa-monica", "venice-beach"])
    .describe(
      "santa-monica for Santa Monica / Ocean Park / pier; venice-beach for Venice Boardwalk / canals / Abbot Kinney",
    ),
  year: z
    .number()
    .int()
    .min(2010)
    .max(2030)
    .describe("Likely year the scene was captured, based on cues in the image"),
  tags: z
    .array(z.string())
    .min(3)
    .max(12)
    .describe(
      "Lowercase searchable tags: subjects, mood, time of day, activity, setting, colors",
    ),
  capturedAt: z
    .string()
    .optional()
    .describe(
      "ISO 8601 capture datetime if estimable from lighting, shadows, or scene; omit if unknown",
    ),
});

export type GalleryImageTags = z.infer<typeof tagSchema>;

export function isGalleryAiTaggingAvailable(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

function galleryAiModel(): string {
  return process.env.GALLERY_AI_MODEL?.trim() || "openai/gpt-5.4";
}

function mimeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function cameraLabel(cameraId: GalleryCameraId): string {
  const camera = galleryCameras.find((entry) => entry.id === cameraId);
  return camera ? `${camera.label} (${camera.year})` : cameraId;
}

function exifHintText(exif?: GalleryExifMetadata): string {
  if (!exif) return "";
  const parts: string[] = [];
  if (exif.capturedAt) parts.push(`EXIF capture time: ${exif.capturedAt}`);
  if (exif.locationHint) parts.push(`GPS suggests: ${exif.locationHint}`);
  if (exif.gps) parts.push(`GPS: ${exif.gps.lat}, ${exif.gps.lng}`);
  if (parts.length === 0) return "";
  return `\n\nMetadata hints:\n${parts.join("\n")}`;
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const tag of tags) {
    const value = tag.trim().toLowerCase();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    normalized.push(value);
  }
  return normalized;
}

export async function tagGalleryImage(options: {
  imageBytes: Buffer;
  filename: string;
  cameraId: GalleryCameraId;
  slotId: string;
  exif?: GalleryExifMetadata;
}): Promise<GalleryImageTags> {
  if (!isGalleryAiTaggingAvailable()) {
    throw new Error(
      "AI Gateway is not configured. Set AI_GATEWAY_API_KEY or run vercel env pull for VERCEL_OIDC_TOKEN.",
    );
  }

  const { object } = await generateObject({
    model: galleryAiModel(),
    schema: tagSchema,
    messages: [
      {
        role: "system",
        content: `You tag photographs for "Pacific Walk", a street photography series along the Santa Monica–Venice corridor in Los Angeles. Camera: ${cameraLabel(options.cameraId)}. Be specific about place when visible. Tags should help search and categorize (e.g. "sunset", "boardwalk", "cyclist", "fog"). Avoid generic travel copy. Prefer EXIF hints when provided.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this photograph (slot ${options.slotId}, file ${options.filename}). Return title, caption, location (santa-monica or venice-beach), year, 3–12 lowercase tags, and capturedAt (ISO 8601) if you can estimate it.${exifHintText(options.exif)}`,
          },
          {
            type: "image",
            image: options.imageBytes,
            mediaType: mimeFromFilename(options.filename),
          },
        ],
      },
    ],
  });

  return {
    ...object,
    tags: normalizeTags(object.tags),
  };
}

/** @deprecated Prefer `imageBytes` from upload; kept for local path fallback. */
export async function tagGalleryImageFromPath(options: {
  imagePath: string;
  cameraId: GalleryCameraId;
  filename: string;
  slotId: string;
  exif?: GalleryExifMetadata;
}): Promise<GalleryImageTags> {
  const imageBytes = await readFile(options.imagePath);
  return tagGalleryImage({
    imageBytes,
    filename: options.filename,
    cameraId: options.cameraId,
    slotId: options.slotId,
    exif: options.exif,
  });
}

export async function applyTagsToWork(
  workId: string,
  tags: GalleryImageTags,
  exif?: GalleryExifMetadata,
): Promise<GalleryWork[]> {
  const capturedAt = exif?.capturedAt ?? tags.capturedAt;
  const works = (await getGalleryWorks()).map((work) =>
    work.id === workId
      ? {
          ...work,
          title: tags.title.trim(),
          caption: tags.caption.trim(),
          location: tags.location as GalleryLocation,
          year: exif?.year ?? tags.year,
          tags: normalizeTags(tags.tags),
          ...(capturedAt ? { capturedAt } : {}),
        }
      : work,
  );
  return saveGalleryWorks(works);
}
