import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./src/lib/auth";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log all requests for debugging
  const token = request.cookies.get("auth-token")?.value;
  console.log(
    "[MIDDLEWARE] Request:",
    pathname,
    "Token:",
    token ? token.substring(0, 10) + "..." : "none",
  );

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    console.log("[MIDDLEWARE] Allowing public route:", pathname);
    return NextResponse.next();
  }

  if (!token) {
    console.log("[MIDDLEWARE] No token, redirecting to login");
    // Redirect to login for page routes
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Return 401 for API routes
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    console.log("[MIDDLEWARE] Token invalid or expired");
    // Token is invalid or expired
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[MIDDLEWARE] Token valid, allowing request");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
