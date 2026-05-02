"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const publicRoutes = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname);
    
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
    
    if (isAuthenticated && isPublicRoute) {
      router.push("/ledger");
    }
  }, [isAuthenticated, pathname, router]);

  // Show nothing while redirecting
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
