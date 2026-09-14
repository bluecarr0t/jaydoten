import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE = "gallery-admin";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function adminSecret(): string {
  const secret =
    process.env.GALLERY_ADMIN_SECRET ?? process.env.GALLERY_ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "Set GALLERY_ADMIN_PASSWORD in .env.local to use the gallery admin.",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", adminSecret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const [expiresRaw, signature] = token.split(".");
  if (!expiresRaw || !signature) return false;

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = sign(expiresRaw);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.GALLERY_ADMIN_PASSWORD;
  if (!expected) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function setAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
