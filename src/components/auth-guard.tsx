"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

const publicRoutes = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const hydrateFromCookie = useAuthStore((s) => s.hydrateFromCookie);

  // Hydrate auth state from cookie on mount
  useEffect(() => {
    if (!hasHydrated) {
      hydrateFromCookie();
    }
  }, [hasHydrated, hydrateFromCookie]);

  // Client-side navigation safety net
  useEffect(() => {
    if (!hasHydrated) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router, hasHydrated]);

  // Show spinner while hydrating from cookie
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-accent" />
      </div>
    );
  }

  return <>{children}</>;
}
