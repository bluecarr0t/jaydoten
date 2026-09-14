#!/usr/bin/env node
/**
 * Verify AI_GATEWAY_API_KEY with a text ping and one gallery image analysis.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateObject, generateText } from "ai";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(ENV_PATH);

const model = process.env.GALLERY_AI_MODEL?.trim() || "openai/gpt-5.4";
const hasKey = Boolean(
  process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim(),
);

console.log("AI Gateway check");
console.log("  .env.local:", existsSync(ENV_PATH) ? "found" : "missing");
console.log("  AI_GATEWAY_API_KEY:", process.env.AI_GATEWAY_API_KEY?.trim() ? "set" : "not set");
console.log("  VERCEL_OIDC_TOKEN:", process.env.VERCEL_OIDC_TOKEN?.trim() ? "set" : "not set");
console.log("  model:", model);

if (!hasKey) {
  console.error("\nFAIL: No AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN in environment.");
  process.exit(1);
}

try {
  const text = await generateText({
    model,
    prompt: "Reply with exactly the word: ok",
  });
  console.log("\nText ping:", text.text.trim().slice(0, 80));
} catch (error) {
  console.error("\nFAIL: Text ping failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const sampleImage = path.join(
  ROOT,
  "public",
  "gallery",
  "leica-xe",
  "01-l1680242.jpg",
);

if (!existsSync(sampleImage)) {
  console.log("\nVision test skipped (no sample image at public/gallery/leica-xe/).");
  console.log("PASS: API key works for text generation.");
  process.exit(0);
}

const pingSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()).min(1),
});

try {
  const imageBytes = readFileSync(sampleImage);
  const { object } = await generateObject({
    model,
    schema: pingSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Give a 2–4 word photo title and 3 lowercase tags for this street photo.",
          },
          { type: "image", image: imageBytes, mediaType: "image/jpeg" },
        ],
      },
    ],
  });

  console.log("\nVision test:");
  console.log("  title:", object.title);
  console.log("  tags:", object.tags.join(", "));
  console.log("\nPASS: AI Gateway key works for text and vision.");
} catch (error) {
  console.error("\nFAIL: Vision test failed (text ping succeeded).");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
