import { NextRequest, NextResponse } from "next/server";

const BETTER_AUTH_COOKIE = "better-auth.session_token";
const protectedRoutes = ["/ledger", "/spaces", "/debt"];
const publicRoutes = ["/login", "/register"];

function matchesRoute(path: string, routes: string[]) {
  return routes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = matchesRoute(path, protectedRoutes);
  const isPublicRoute = matchesRoute(path, publicRoutes);

  // Check for Better Auth session cookie (presence only — validation happens server-side)
  const sessionCookie = req.cookies.get(BETTER_AUTH_COOKIE)?.value;
  const isAuthenticated = !!sessionCookie;

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/ledger", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.).*)"],
};
