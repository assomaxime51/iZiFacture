"use client";

import { useState } from "react";
import { Building2, X } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const { createEntreprise } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez renseigner le nom de votre espace ou entreprise.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createEntreprise({
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
      });

      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'espace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white shadow-2xl animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e7ece7] px-6 py-4 bg-[#fafcfa]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e1f3e6] text-sage">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#17221d]">
                Créer un espace de travail
              </h2>
              <p className="text-xs text-[#829087]">
                Configurez une entreprise pour émettre vos devis et factures.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#829087] hover:bg-[#f2f7f3] hover:text-[#17221d] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-[#fbe4e0] px-4 py-3 text-xs font-semibold text-[#b25247]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17221d] mb-1.5">
              Nom de l&apos;entreprise ou espace <span className="text-[#b25247]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex. Studio Alpha, SARL Horizon, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ds-input w-full"
              autoFocus
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Email professionnel
              </label>
              <input
                type="email"
                placeholder="contact@monentreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ds-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                placeholder="+221 77 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="ds-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17221d] mb-1.5">
              Adresse ou siège social
            </label>
            <input
              type="text"
              placeholder="Ex. 12 rue des Palmiers, Dakar, Sénégal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="ds-input w-full"
            />
          </div>

          <div className="pt-3 border-t border-[#e7ece7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="ds-button-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ds-button-primary"
            >
              {loading ? "Création en cours..." : "Créer l'espace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
