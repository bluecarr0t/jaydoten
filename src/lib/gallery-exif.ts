import exifr from "exifr";
import type { GalleryLocation } from "@/lib/gallery-content";

export type GalleryExifMetadata = {
  capturedAt?: string;
  year?: number;
  aspect?: "portrait" | "landscape" | "square";
  gps?: { lat: number; lng: number };
  locationHint?: GalleryLocation;
};

function aspectFromDimensions(
  width: number,
  height: number,
): "portrait" | "landscape" | "square" {
  if (width <= 0 || height <= 0) return "landscape";
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.85) return "portrait";
  return "square";
}

function toIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/** Rough LA-coast bounding box for inferring gallery location from GPS. */
function locationFromGps(lat: number, lng: number): GalleryLocation | undefined {
  if (lat < 33.9 || lat > 34.1 || lng < -118.6 || lng > -118.3) {
    return undefined;
  }
  return lng < -118.47 ? "santa-monica" : "venice-beach";
}

export async function extractGalleryExif(
  buffer: Buffer,
): Promise<GalleryExifMetadata> {
  try {
    const parsed = await exifr.parse(buffer, {
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "ModifyDate",
        "GPSLatitude",
        "GPSLongitude",
        "ImageWidth",
        "ImageHeight",
        "ExifImageWidth",
        "ExifImageHeight",
        "PixelXDimension",
        "PixelYDimension",
      ],
    });

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const record = parsed as Record<string, unknown>;
    const capturedAt =
      toIsoDate(record.DateTimeOriginal) ??
      toIsoDate(record.CreateDate) ??
      toIsoDate(record.ModifyDate);

    const width =
      Number(record.ExifImageWidth ?? record.ImageWidth ?? record.PixelXDimension) ||
      0;
    const height =
      Number(record.ExifImageHeight ?? record.ImageHeight ?? record.PixelYDimension) ||
      0;

    const lat = Number(record.GPSLatitude);
    const lng = Number(record.GPSLongitude);
    const gps =
      Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

    return {
      capturedAt,
      year: capturedAt ? new Date(capturedAt).getFullYear() : undefined,
      aspect: width && height ? aspectFromDimensions(width, height) : undefined,
      gps,
      locationHint: gps ? locationFromGps(gps.lat, gps.lng) : undefined,
    };
  } catch {
    return {};
  }
}
