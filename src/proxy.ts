import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginPage;
  const isProtectedApi =
    (pathname.startsWith("/api/upload") ||
      pathname.startsWith("/api/projects")) &&
    req.method !== "GET";

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = verifySessionToken(token);

  if (authed) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload/:path*", "/api/projects/:path*"],
};
