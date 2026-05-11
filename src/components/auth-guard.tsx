"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

const publicRoutes = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    // Check session with Better Auth
    authClient.getSession().then((session) => {
      if (session.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email,
          initials: (session.data.user.name || session.data.user.email)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          avatarUrl: session.data.user.image || null,
        });
      } else {
        clearUser();
      }
      setHydrated(true);
    });
  }, [setUser, clearUser, setHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router, hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-accent" />
      </div>
    );
  }

  return <>{children}</>;
}
