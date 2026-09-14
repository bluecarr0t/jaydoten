#!/usr/bin/env node
/**
 * Import Leica photos from Desktop date folders that contain a `final/` subfolder.
 * Copies images to public/gallery/leica-xe/ and updates data/gallery-works.json.
 *
 * Usage: node scripts/import-leica-finals.mjs [sourceDir]
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_SOURCE = "/Users/nickharsell/Desktop/photos";
const LEICA_DIR = path.join(ROOT, "public", "gallery", "leica-xe");
const WORKS_PATH = path.join(ROOT, "data", "gallery-works.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function parseDateFolder(name) {
  const parts = name.split(":");
  if (parts.length !== 3) return null;
  const month = Number(parts[0]);
  const day = Number(parts[1]);
  const year = Number(parts[2]);
  if (!month || !day || !year) return null;
  return { month, day, year, sortKey: year * 10000 + month * 100 + day };
}

function aspectFromDimensions(width, height) {
  if (width <= 0 || height <= 0) return "landscape";
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.85) return "portrait";
  return "square";
}

function toIsoDate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

async function extractExif(filePath) {
  try {
    const parsed = await exifr.parse(filePath, {
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "ExifImageWidth",
        "ExifImageHeight",
        "ImageWidth",
        "ImageHeight",
      ],
    });
    if (!parsed) return {};
    const width =
      Number(parsed.ExifImageWidth ?? parsed.ImageWidth) || 0;
    const height =
      Number(parsed.ExifImageHeight ?? parsed.ImageHeight) || 0;
    const capturedAt =
      toIsoDate(parsed.DateTimeOriginal) ?? toIsoDate(parsed.CreateDate);
    return {
      capturedAt,
      year: capturedAt ? new Date(capturedAt).getFullYear() : undefined,
      aspect: width && height ? aspectFromDimensions(width, height) : "landscape",
    };
  } catch {
    return { aspect: "landscape" };
  }
}

function discoverFinalImages(sourceDir) {
  const entries = [];

  for (const dateFolder of readdirSync(sourceDir, { withFileTypes: true })) {
    if (!dateFolder.isDirectory()) continue;

    const dateMeta = parseDateFolder(dateFolder.name);
    const finalDir = path.join(sourceDir, dateFolder.name, "final");
    if (!existsSync(finalDir)) continue;

    for (const file of readdirSync(finalDir, { withFileTypes: true })) {
      if (!file.isFile()) continue;
      const ext = path.extname(file.name).toLowerCase();
      if (!IMAGE_EXT.has(ext)) continue;

      entries.push({
        sourcePath: path.join(finalDir, file.name),
        originalName: file.name,
        dateMeta,
        dateFolder: dateFolder.name,
      });
    }
  }

  return entries.sort((a, b) => {
    const aKey = a.dateMeta?.sortKey ?? 0;
    const bKey = b.dateMeta?.sortKey ?? 0;
    if (aKey !== bKey) return aKey - bKey;
    return a.originalName.localeCompare(b.originalName);
  });
}

function destFilename(originalName, index) {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const base = path.basename(originalName, path.extname(originalName)).toLowerCase();
  return `${String(index + 1).padStart(2, "0")}-${base}${ext === ".jpeg" ? ".jpg" : ext}`;
}

async function main() {
  const sourceDir = process.argv[2] || DEFAULT_SOURCE;

  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const images = discoverFinalImages(sourceDir);
  if (images.length === 0) {
    console.error(`No images found in */final/ under ${sourceDir}`);
    process.exit(1);
  }

  mkdirSync(LEICA_DIR, { recursive: true });

  const leicaWorks = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filename = destFilename(image.originalName, i);
    const destPath = path.join(LEICA_DIR, filename);
    copyFileSync(image.sourcePath, destPath);

    const exif = await extractExif(image.sourcePath);
    const folderDate = image.dateMeta
      ? new Date(
          image.dateMeta.year,
          image.dateMeta.month - 1,
          image.dateMeta.day,
          12,
          0,
          0,
        ).toISOString()
      : undefined;

    const capturedAt = exif.capturedAt ?? folderDate;
    const year =
      exif.year ?? image.dateMeta?.year ?? new Date().getFullYear();

    const id = `leica-${path.basename(filename, path.extname(filename))}`;

    leicaWorks.push({
      id,
      cameraId: "leica-xe",
      location: "venice-beach",
      title: path.basename(image.originalName, path.extname(image.originalName)),
      caption: "",
      filename,
      aspect: exif.aspect ?? "landscape",
      year,
      tags: [],
      ...(capturedAt ? { capturedAt } : {}),
    });

    console.log(`  ${image.dateFolder}/final/${image.originalName} → leica-xe/${filename}`);
  }

  let existingWorks = [];
  if (existsSync(WORKS_PATH)) {
    const parsed = JSON.parse(readFileSync(WORKS_PATH, "utf8"));
    existingWorks = parsed.works ?? [];
  }

  const polaroidWorks = existingWorks
    .filter((work) => work.cameraId !== "leica-xe" && !work.id.startsWith("leica-"))
    .map((work) => ({
      ...work,
      cameraId: work.cameraId ?? "polaroid-sx70",
      tags: work.tags ?? [],
    }));

  const works = [...leicaWorks, ...polaroidWorks];

  mkdirSync(path.dirname(WORKS_PATH), { recursive: true });
  writeFileSync(WORKS_PATH, JSON.stringify({ works }, null, 2), "utf8");

  console.log(`\nImported ${leicaWorks.length} Leica image(s) from ${sourceDir}`);
  console.log(`Updated ${WORKS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
