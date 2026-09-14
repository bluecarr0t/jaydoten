/**
 * One-time sync: local gallery files → Vercel Blob.
 * Requires BLOB_READ_WRITE_TOKEN in the environment (.env.local loaded via dotenv if present).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cameras = [
  { id: "leica-xe", dir: "leica-xe" },
  { id: "polaroid-sx70", dir: "polaroid-sx70" },
];

if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
  console.error("Set BLOB_READ_WRITE_TOKEN before running this script.");
  process.exit(1);
}

function contentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

let uploaded = 0;

for (const camera of cameras) {
  const dir = path.join(root, "public", "gallery", camera.dir);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const pathname = `gallery/${camera.dir}/${name}`;
    const data = readFileSync(path.join(dir, name));
    await put(pathname, data, {
      access: "public",
      contentType: contentType(name),
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    uploaded += 1;
    console.log(`↑ ${pathname}`);
  }
}

const worksPath = path.join(root, "data", "gallery-works.json");
if (existsSync(worksPath)) {
  const json = readFileSync(worksPath, "utf8");
  await put("gallery/meta/gallery-works.json", json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log("↑ gallery/meta/gallery-works.json");
}

console.log(`Done. Uploaded ${uploaded} image(s).`);
