import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const protectedRoutes = ["/ledger", "/spaces"];
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

  const session = await getSession();
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
