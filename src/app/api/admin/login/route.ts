import { NextResponse } from "next/server";
import {
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { isDevOnlyRoute } from "@/lib/is-dev-only";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDevOnlyRoute()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";

  if (!process.env.GALLERY_ADMIN_PASSWORD) {
    return NextResponse.json(
      {
        error:
          "Admin password is not configured. Add GALLERY_ADMIN_PASSWORD to .env.local.",
      },
      { status: 500 },
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminSessionCookie(response);
  return response;
}
