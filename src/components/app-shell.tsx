"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PieChart,
  Search,
  Settings2,
  Users,
  X,
} from "@/components/icons";
import GlobalSearchModal from "@/components/global-search-modal";
import NotificationsPopover from "@/components/notifications-popover";
import UserProfileMenu from "@/components/user-profile-menu";
import SidebarUserCard from "@/components/sidebar-user-card";
import { useAuth } from "@/contexts/auth-context";

const navigation = [
  { href: "/", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/reports", label: "Rapports", icon: PieChart },
  { href: "/support", label: "Support & Aide", icon: CircleHelp },
];

export default function AppShell({
  children,
  title,
  eyebrow,
  action,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  const { entreprise } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {open && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-navy px-4 py-5 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-9 flex items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#b7d8bf] font-display text-lg font-extrabold text-ink">
              i
            </span>
            <span className="font-display text-[19px] font-bold tracking-[-0.04em]">
              iZiFacture
            </span>
          </Link>
          <button
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="text-white/50 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-8 px-1">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            Espace de travail
          </p>
          <Link
            href="/workspace"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between rounded-control bg-white/10 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/15 transition"
          >
            <span className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-[#edb989] text-[10px] font-extrabold text-ink">
                {entreprise?.name?.slice(0, 2).toUpperCase() || "i"}
              </span>
              {entreprise?.name || "Mon entreprise"}
            </span>
            <ChevronDown size={15} className="text-white/50" />
          </Link>
        </div>

        <nav className="space-y-1" aria-label="Navigation principale">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            Menu principal
          </p>
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-control px-3 py-3 text-[13px] font-medium transition ${
                title === label ||
                (title === "Nouvelle facture" && label === "Factures") ||
                (title === "Nouveau client" && label === "Clients")
                  ? "bg-[#29384d] text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-control px-3 py-3 text-[13px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <Settings2 size={17} />
            Paramètres
          </Link>
          <SidebarUserCard onCloseSidebar={() => setOpen(false)} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[76px] items-center justify-between gap-3 border-b border-line bg-white/70 px-4 py-3 sm:px-8 lg:px-11">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Ouvrir le menu"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-ink lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                iZiFacture
              </p>
              <p className="font-display text-xl font-bold tracking-[-0.04em] text-ink sm:text-2xl">
                {entreprise?.name || "Mon entreprise"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-[#728078] hover:border-[#c8d8ca] hover:bg-[#f3f7f2] hover:text-[#17221d] transition"
            >
              <Search size={16} />
              <span className="hidden md:inline">Rechercher...</span>
              <kbd className="hidden md:inline-block rounded border border-[#e7ece7] bg-[#f7f8f4] px-1.5 py-0.5 text-[10px] font-bold text-[#829087]">
                Ctrl+K
              </kbd>
            </button>

            <NotificationsPopover />

            <UserProfileMenu />
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 lg:px-11 lg:py-9">
          <div className="mb-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-muted">
                {eyebrow ?? "Gérez votre activité simplement."}
              </p>
              <h1 className="font-display text-[28px] font-extrabold tracking-[-0.055em] text-ink">
                {title}
              </h1>
            </div>
            {action}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
