"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === "/auth/login" || clean.startsWith("/auth");
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publicRoute = isPublicPath(pathname);

  useEffect(() => {
    // Si la route est privée et qu'on a fini de charger sans utilisateur connecté,
    // on redirige vers /auth/login
    if (!loading && !user && !publicRoute) {
      router.replace("/auth/login");
    }
  }, [publicRoute, loading, router, user]);

  // Si on est sur une page publique (comme /auth/login), afficher directement la page
  if (publicRoute) {
    return <>{children}</>;
  }

  // Si on est sur une page privée et que la session est en cours de chargement ou absente
  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f4] text-sm font-medium text-[#829087]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#17221d] border-t-transparent" />
          <p>Chargement de votre espace…</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
