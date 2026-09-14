import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isGalleryAiTaggingAvailable } from "@/lib/gallery-ai-tagging";
import { isDevOnlyRoute } from "@/lib/is-dev-only";

export const runtime = "nodejs";

export async function GET() {
  if (!isDevOnlyRoute()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    available: isGalleryAiTaggingAvailable(),
    model: process.env.GALLERY_AI_MODEL?.trim() || "openai/gpt-5.4",
  });
}
