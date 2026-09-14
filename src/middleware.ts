import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isGalleryRouteEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
  );
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    (path.startsWith("/gallery") || path.startsWith("/admin")) &&
    !isGalleryRouteEnabled()
  ) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gallery", "/gallery/:path*", "/admin", "/admin/:path*"],
};
