"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Check, Mail, MapPin, Phone, Save, UserCircle } from "@/components/icons";

import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/api";

export default function ClientForm() {
  const router = useRouter();
  const { entreprise } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [clientType, setClientType] = useState<"entreprise" | "particulier">("entreprise");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!entreprise?.id) {
      setError("Aucun espace de travail actif. Sélectionnez ou créez un espace avant d’enregistrer un client.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createClient({
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        type: clientType,
        entreprise_id: entreprise.id,
      });

      setSaved(true);
      setTimeout(() => {
        router.push("/clients");
      }, 700);
    } catch (err: any) {
      console.error("Erreur lors de la création du client:", err);
      setError(err.message || "Erreur lors de la création du client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="ds-card min-w-0 p-5 sm:p-7">
        {!entreprise?.id && (
          <div className="mb-5 rounded-xl border border-[#f0d0c9] bg-[#fff3f1] px-3 py-2 text-sm text-[#8b4a3d]">
            Aucun espace de travail actif. Sélectionnez ou créez un espace avant d’enregistrer un client.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-[#f0d0c9] bg-[#fff3f1] px-3 py-2 text-sm text-[#8b4a3d]">
            {error}
          </div>
        )}

        <div className="mb-7 flex items-center justify-between border-b border-line pb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-muted">Répertoire professionnel</p>
            <h2 className="mt-1 font-display text-xl font-bold">Informations générales</h2>
          </div>
          <span className="ds-status bg-[#e1f3e6] text-sage">Nouveau contact</span>
        </div>

        {/* Type de client */}
        <div className="mb-6">
          <label className="text-xs font-bold text-ink">Type de compte</label>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setClientType("entreprise")}
              className={`flex items-center gap-2 rounded-control border px-4 py-2.5 text-xs font-semibold transition-motion ${
                clientType === "entreprise"
                  ? "border-[#4f8665] bg-[#edf6ef] text-[#4f8665]"
                  : "border-line bg-white text-muted hover:bg-[#f7f9f6]"
              }`}
            >
              <Building2 size={16} />
              Entreprise / Société
            </button>
            <button
              type="button"
              onClick={() => setClientType("particulier")}
              className={`flex items-center gap-2 rounded-control border px-4 py-2.5 text-xs font-semibold transition-motion ${
                clientType === "particulier"
                  ? "border-[#4f8665] bg-[#edf6ef] text-[#4f8665]"
                  : "border-line bg-white text-muted hover:bg-[#f7f9f6]"
              }`}
            >
              <UserCircle size={16} />
              Particulier
            </button>
          </div>
        </div>

        {/* Champs */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-ink">
              {clientType === "entreprise" ? "Raison sociale ou Nom de l'entreprise" : "Nom complet du client"} <span className="text-[#b25247]">*</span>
            </label>
            <input
              type="text"
              required
              className="ds-input mt-2 w-full"
              placeholder={clientType === "entreprise" ? "Ex. Studio Kora SARL" : "Ex. Moussa Diop"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink">Adresse email professionnelle</label>
            <div className="relative mt-2">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" />
              <input
                type="email"
                className="ds-input w-full pl-10"
                placeholder="contact@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink">Numéro de téléphone</label>
            <div className="relative mt-2">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" />
              <input
                type="tel"
                className="ds-input w-full pl-10"
                placeholder="+221 77 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-ink">Adresse physique</label>
            <div className="relative mt-2">
              <MapPin size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" />
              <input
                type="text"
                className="ds-input w-full pl-10"
                placeholder="Ex. 12 rue Félix Faure, Dakar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-ink">Notes et conditions particulières</label>
            <textarea
              className="ds-input mt-2 min-h-24 w-full resize-y"
              placeholder="Informations utiles sur le client, modalités de facturation, délai de paiement convenu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Barre d'action */}
      <div className="ds-card flex flex-col items-center justify-between gap-4 p-5 sm:flex-row sm:p-6">
        <Link href="/clients" className="ds-button-secondary w-full sm:w-auto">
          Annuler
        </Link>
        <button
          type="submit"
          disabled={saved || !entreprise?.id || loading}
          className="ds-button-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saved ? (
            <>
              <Check size={16} />
              Client enregistré !
            </>
          ) : (
            <>
              <Save size={16} />
              Enregistrer le client
            </>
          )}
        </button>
      </div>
    </form>
  );
}
