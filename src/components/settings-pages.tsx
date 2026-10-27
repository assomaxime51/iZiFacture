"use client";

import { useState } from "react";
import { Building2, Check, Plus, Trash2 } from "@/components/icons";
import ReportsView from "@/components/reports-view";
import SettingsView from "@/components/settings-view";
import ProfileView from "@/components/profile-view";
import { useAuth } from "@/contexts/auth-context";
import CreateWorkspaceModal from "@/components/create-workspace-modal";

export function ReportsPage() {
  return <ReportsView />;
}

export function SettingsPage() {
  return <SettingsView />;
}

export function ProfilePage() {
  return <ProfileView />;
}

export function WorkspacePage() {
  const { entreprise, entreprises, switchEntreprise, deleteEntreprise } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${name}" ?`)) {
      setDeletingId(id);
      try {
        await deleteEntreprise(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[#17221d]">
            Vos espaces de facturation
          </h2>
          <p className="text-xs text-muted">
            Sélectionnez l&apos;entreprise active ou ajoutez-en une nouvelle.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ds-button-primary"
        >
          <Plus size={16} />
          Créer un espace de travail
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entreprises.map((ws) => {
          const isSelected = entreprise?.id === ws.id;
          const initials = (ws.name || "E").slice(0, 2).toUpperCase();

          return (
            <div
              key={ws.id}
              onClick={() => switchEntreprise(ws.id)}
              className={`ds-card group relative flex cursor-pointer items-start justify-between p-5 text-left transition-all ${
                isSelected
                  ? "border-sage bg-[#f0f8f1] ring-1 ring-sage/30 shadow-sm"
                  : "hover:border-[#b9d2bc] hover:bg-white"
              }`}
            >
              <div className="flex items-start gap-4 min-w-0">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-control font-display font-extrabold ${
                    isSelected ? "bg-[#e1f3e6] text-sage" : "bg-[#f2f5f2] text-[#17221d]"
                  }`}
                >
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="block truncate font-display text-base text-[#17221d]">
                      {ws.name}
                    </strong>
                    {isSelected && (
                      <span className="rounded bg-[#e1f3e6] px-1.5 py-0.5 text-[9px] font-bold text-[#2d7b4c]">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted truncate">
                    {ws.email || "Aucun email configuré"}
                  </p>
                  {ws.address && (
                    <p className="text-[11px] text-muted/80 truncate mt-0.5">
                      {ws.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {isSelected ? (
                  <Check size={18} className="text-sage" />
                ) : (
                  <button
                    type="button"
                    title="Supprimer cet espace"
                    disabled={deletingId === ws.id}
                    onClick={(e) => handleDelete(e, ws.id, ws.name)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-[#b25247] rounded-lg hover:bg-[#fbe4e0] transition"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Bouton d'ajout sous forme de carte */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="ds-card flex min-h-[110px] items-center justify-center gap-3 border-dashed border-[#c8d8ca] p-5 text-center text-[#2d7b4c] hover:border-sage hover:bg-[#f4f9f5] transition"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e1f3e6]">
            <Plus size={20} />
          </div>
          <div className="text-left">
            <strong className="block text-sm font-bold text-[#17221d]">
              Ajouter un espace
            </strong>
            <span className="text-xs text-muted">Créer une nouvelle entreprise</span>
          </div>
        </button>
      </div>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
