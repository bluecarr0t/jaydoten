import { NextResponse } from "next/server";
import {
  addSubscriber,
  isValidEmail,
  normalizeEmail,
} from "@/lib/mailing-list";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; website?: string };
  try {
    body = (await request.json()) as { email?: string; website?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  await addSubscriber(email);
  return NextResponse.json({ ok: true });
}
