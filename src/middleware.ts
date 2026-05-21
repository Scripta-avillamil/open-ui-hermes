import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getTokenCookieName } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicPaths = ["/login", "/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/health"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // If already logged in, redirect to chat
    const token = request.cookies.get(getTokenCookieName())?.value;
    if (token && pathname === "/login") {
      try {
        await verifyToken(token);
        return NextResponse.redirect(new URL("/chat", request.url));
      } catch {
        // Invalid token, continue to login
      }
    }
    return NextResponse.next();
  }

  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const token = request.cookies.get(getTokenCookieName())?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete(getTokenCookieName());
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
