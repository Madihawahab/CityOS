import { NextResponse, type NextRequest } from "next/server";

// ── Route protection rules ────────────────────────────────────────────────────
// Citizen  → / routes only
// Authority → /authority/* only
// Admin    → /admin/* only
// Unauthenticated → redirect to /login

const PUBLIC_ROUTES = ["/login", "/register", "/offline", "/api/health"];

function getTokenFromRequest(request: NextRequest): string | null {
  // In demo mode: read from cookie set by the login page
  const demoCookie = request.cookies.get("cityos-demo-role")?.value;
  if (demoCookie) return demoCookie;

  // In live mode: Firebase ID token from Authorization header or cookie
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return request.cookies.get("cityos-auth-token")?.value ?? null;
}

function getRoleFromToken(token: string): "citizen" | "authority" | "admin" | null {
  // Demo mode: token IS the role string
  if (["citizen", "authority", "admin"].includes(token)) {
    return token as "citizen" | "authority" | "admin";
  }
  // Live mode: decode JWT role claim (Phase 5 — Firebase Admin)
  // For now, default to citizen for any valid token
  return "citizen";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, static files, API routes (except protected ones)
  if (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/manifest") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow all API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromToken(token);

  // Protect /authority/* → only authority role
  if (pathname.startsWith("/authority") && role !== "authority") {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/", request.url));
  }

  // Protect /admin/* → only admin role
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(role === "authority" ? "/authority" : "/", request.url));
  }

  // Citizen routes: redirect authority/admin away from citizen pages
  if (!pathname.startsWith("/authority") && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    if (role === "authority") {
      // Allow authority to access citizen pages (they can view reports they filed)
    }
    if (role === "admin") {
      // Allow admin to access citizen pages for support
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)",
  ],
};
