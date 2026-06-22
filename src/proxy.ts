import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { isDirectAdminApiPath, isDirectAdminPath } from "@/lib/admin-path";

const TOKEN_NAME = "bicak_auth_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDirectAdminPath(pathname) || isDirectAdminApiPath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const token = request.cookies.get(TOKEN_NAME)?.value;
  const payload = token ? verifyToken(token) : null;

  if (pathname.startsWith("/profil") || pathname.startsWith("/odeme")) {
    if (!payload) {
      return NextResponse.redirect(
        new URL(`/giris?redirect=${pathname}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profil/:path*",
    "/odeme/:path*",
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
  ],
};
