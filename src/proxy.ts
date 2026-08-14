import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginPage;
  // NOTE: /api/upload is deliberately absent here. Routing a request through
  // the proxy caps its body at 10MB, which silently truncated large video
  // uploads. That route authenticates itself instead — see requireSession().
  const isProtectedApi =
    (pathname.startsWith("/api/projects") ||
      pathname.startsWith("/api/profile")) &&
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
  matcher: ["/admin/:path*", "/api/projects/:path*", "/api/profile/:path*"],
};
