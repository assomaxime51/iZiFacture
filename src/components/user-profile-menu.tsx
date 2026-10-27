"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  LogOut,
  Plus,
  Settings2,
  UserCircle,
  CircleHelp,
} from "@/components/icons";
import { useAuth, type Entreprise } from "@/contexts/auth-context";
import CreateWorkspaceModal from "@/components/create-workspace-modal";

const workspaceColors = [
  "bg-[#edb989] text-[#17221d]",
  "bg-[#b7d8bf] text-[#17221d]",
  "bg-[#c9d8e7] text-[#17221d]",
  "bg-[#e7c9db] text-[#17221d]",
];

export default function UserProfileMenu() {
  const { user, entreprise, entreprises, switchEntreprise, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.email ? user.email.split("@")[0] : "Utilisateur");
  const userInitials = displayName.slice(0, 2).toUpperCase();
  const userEmail = user?.email || "Non connecté";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitchWorkspace = (id: string) => {
    switchEntreprise(id);
    setIsOpen(false);
  };

  const handleOpenCreateModal = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            isOpen
              ? "border-[#4f8665] bg-[#f2f7f3] text-[#17221d]"
              : "border-[#e7ece7] bg-white text-[#17221d] hover:border-[#c8d8ca] hover:bg-[#f3f7f2]"
          }`}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#edb989] text-[9px] font-bold text-[#17221d]">
            {userInitials}
          </span>
          <span className="hidden sm:inline font-semibold capitalize">{displayName}</span>
          <ChevronDown
            size={14}
            className={`text-[#88958b] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Popover Menu */}
        {isOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[290px] sm:w-[320px] overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white shadow-xl animate-rise">
            {/* User Profile Header */}
            <div className="border-b border-[#e7ece7] bg-[#fafcfa] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#edb989] font-display text-sm font-extrabold text-[#17221d] shadow-sm">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-[#17221d] capitalize">
                      {displayName}
                    </p>
                    <span className="rounded-md bg-[#e1f3e6] px-1.5 py-0.5 text-[9px] font-bold text-[#2d7b4c]">
                      Actif
                    </span>
                  </div>
                  <p className="truncate text-xs text-[#829087]">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Workspaces list */}
            <div className="p-2 border-b border-[#e7ece7]">
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#829087]">
                  Espaces de travail
                </span>
                <span className="text-[10px] font-semibold text-[#4f8665]">
                  {entreprises.length} {entreprises.length > 1 ? "espaces" : "espace"}
                </span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {entreprises.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-[#829087]">
                    Aucun espace configuré
                  </div>
                ) : (
                  entreprises.map((ws, idx) => {
                    const isSelected = entreprise?.id === ws.id;
                    const color = workspaceColors[idx % workspaceColors.length];
                    const initials = (ws.name || "E").slice(0, 2).toUpperCase();

                    return (
                      <button
                        key={ws.id}
                        onClick={() => handleSwitchWorkspace(ws.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                          isSelected
                            ? "bg-[#eef5ef] text-[#17221d]"
                            : "text-[#536157] hover:bg-[#f7f9f6] hover:text-[#17221d]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-extrabold ${color}`}
                          >
                            {initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#17221d]">
                              {ws.name}
                            </p>
                            <p className="truncate text-[10px] text-[#829087]">
                              {isSelected ? "Espace actif" : "Changer d'espace"}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={16} className="shrink-0 text-[#2d7b4c]" />
                        )}
                      </button>
                    );
                  })
                )}

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#2d7b4c] hover:bg-[#eef5ef] transition mt-1"
                >
                  <Plus size={15} />
                  <span>Ajouter un espace</span>
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <div className="p-2 border-b border-[#e7ece7] space-y-0.5">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#536157] hover:bg-[#f7f9f6] hover:text-[#17221d] transition"
              >
                <UserCircle size={15} />
                <span>Mon profil</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#536157] hover:bg-[#f7f9f6] hover:text-[#17221d] transition"
              >
                <Settings2 size={15} />
                <span>Paramètres de facturation</span>
              </Link>
              <Link
                href="/support"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#536157] hover:bg-[#f7f9f6] hover:text-[#17221d] transition"
              >
                <CircleHelp size={15} />
                <span>Aide &amp; Support</span>
              </Link>
            </div>

            {/* Logout button */}
            <div className="p-2 bg-[#fafcfa]">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#b25247] hover:bg-[#fbe4e0] transition"
              >
                <LogOut size={15} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de création d'espace */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
