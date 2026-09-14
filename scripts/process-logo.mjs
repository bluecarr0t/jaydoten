import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const source =
  process.argv[2] ??
  path.join(
    __dirname,
    "../../.cursor/projects/Users-nickharsell-Library-Mobile-Documents-com-apple-CloudDocs-Projects-jaydoten/assets/lettering-jaydoten-clay-red-fc5e61ab-65eb-4bdb-a443-f4710280b1b6.png",
  );
const output = path.join(__dirname, "../public/jaydoten-logo.png");

function isTerracotta(r, g, b) {
  if (r < 90 || g < 40 || b < 40) return false;
  if (r <= g || r <= b) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) / max > 0.12;
}

function shouldRemove(r, g, b) {
  if (r < 45 && g < 45 && b < 45) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (max > 165 && saturation < 0.2) return true;
  if (isTerracotta(r, g, b)) return false;
  return true;
}

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  data[i + 3] = shouldRemove(r, g, b) ? 0 : 255;
}

const colCount = new Array(info.width).fill(0);
const rowCount = new Array(info.height).fill(0);

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    if (data[i + 3] > 0) {
      colCount[x]++;
      rowCount[y]++;
    }
  }
}

const maxCol = Math.max(...colCount);
const maxRow = Math.max(...rowCount);
const density = 0.12;

const minX = colCount.findIndex((c) => c >= maxCol * density);
const maxX =
  colCount.length -
  1 -
  [...colCount].reverse().findIndex((c) => c >= maxCol * density);
const minY = rowCount.findIndex((c) => c >= maxRow * density);
const maxY =
  rowCount.length -
  1 -
  [...rowCount].reverse().findIndex((c) => c >= maxRow * density);

const width = maxX - minX + 1;
const height = maxY - minY + 1;
const cropped = Buffer.alloc(width * height * 4);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const sourceIndex = ((minY + y) * info.width + (minX + x)) * 4;
    const destIndex = (y * width + x) * 4;
    cropped[destIndex] = data[sourceIndex];
    cropped[destIndex + 1] = data[sourceIndex + 1];
    cropped[destIndex + 2] = data[sourceIndex + 2];
    cropped[destIndex + 3] = data[sourceIndex + 3];
  }
}

await sharp(cropped, {
  raw: { width, height, channels: 4 },
}).png().toFile(output);

console.log(
  `Wrote ${output} (${info.width}x${info.height} -> ${width}x${height}, crop L${minX} T${minY})`,
);
