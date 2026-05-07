import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "wipu_session";
const protectedRoutes = ["/ledger", "/spaces"];
const publicRoutes = ["/login", "/register"];

function matchesRoute(path: string, routes: string[]) {
  return routes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

function parseSession(cookieValue: string): { userId: string } | null {
  try {
    const payload = JSON.parse(cookieValue) as {
      userId: string;
      expiresAt: string;
    };
    const expiresAt = new Date(payload.expiresAt);
    if (expiresAt < new Date()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = matchesRoute(path, protectedRoutes);
  const isPublicRoute = matchesRoute(path, publicRoutes);

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const session = cookie ? parseSession(cookie) : null;
  const isAuthenticated = !!session;

  // Unauthenticated user hitting a protected route
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Authenticated user hitting a public route
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/ledger", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.).*)"],
};
