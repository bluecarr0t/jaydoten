import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { isDevOnlyRoute } from "@/lib/is-dev-only";

export const runtime = "nodejs";

export async function POST() {
  if (!isDevOnlyRoute()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  return response;
}
