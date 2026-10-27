"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

interface SidebarUserCardProps {
  onCloseSidebar?: () => void;
}

export default function SidebarUserCard({ onCloseSidebar }: SidebarUserCardProps) {
  const { user } = useAuth();
  
  const displayName = user?.email ? user.email.split("@")[0] : "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <Link
        href="/profile"
        onClick={onCloseSidebar}
        className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/10 group"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edb989] text-xs font-bold text-ink shadow-sm group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white group-hover:text-[#b7d8bf] transition-colors capitalize">
            {displayName}
          </p>
          <p className="truncate text-[11px] text-white/40">{user?.email || "Connecté"}</p>
        </div>
      </Link>
    </div>
  );
}
